---
schema_version: 1
feature: "Đăng nhập bằng mật khẩu do sàn cấp: quản trị cấp mật khẩu tạm, người đặt mật khẩu mới trước khi vào vỏ, quên thì quản trị cấp lại; mã 6 số qua email giữ nguyên; đăng xuất lỗi thì báo và cho thử lại"
slug: dang-nhap-mat-khau
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db, ui]
status: draft
design_doc: docs/superpowers/specs/2026-11-04-dang-nhap-mat-khau-design.md
---

# Acceptance Contract: dang-nhap-mat-khau

## Context

Hôm nay chỉ có một cửa vào: email → mã 6 số qua thư. Thư có thể không tới (ADR-0009: tên miền gửi chưa xác minh; thư
rác; hộp thư công ty chặn), và người không có cách nào khác để vào. Chủ kho chọn lối A ở bản đánh giá 04/11: sàn cấp mật
khẩu tạm, email làm tên đăng nhập, đổi ở lần đầu, quên thì quản trị cấp lại — không qua thư. Gộp luật 55 của đợt: đăng
xuất mà máy chủ lỗi hay mất mạng thì báo «Chưa đăng xuất được» và cho thử lại.

Source input: ô cơ hội `_acceptance/dang-nhap-mat-khau/opportunity.md` (Cổng Đáng `build` 04/11) ·
`docs/plan/danh-gia-dang-nhap-tai-khoan.md` §4 lối A · luật 52, 55 của đợt dau-khach-nhap · thiết kế
`docs/superpowers/specs/2026-11-04-dang-nhap-mat-khau-design.md`.

## Criteria

- AC-1 (cross-layer): Given quản trị sàn A và người m chỉ thuộc sàn A, When quản trị gọi cấp mật khẩu tạm cho m, Then API
  trả 200 kèm mật khẩu tạm máy sinh (16 ký tự, bốn nhóm) và hạn 72 giờ đúng một lần; cơ sở dữ liệu giữ băm scrypt ở
  `identity.account`, không có bản rõ ở bảng, sự kiện hay nhật ký lần chạy; mọi phiên của m bị thu; một sự kiện `cap`
  ghi người cấp, người được cấp, sàn và lúc. Người không quản trị gọi thì 403; m không thuộc sàn đang làm thì 404.
  Mọi đường mang mật khẩu hay mã đổi (cấp, đăng nhập đúng, sai và tạm, đặt lần đầu nhận và từ chối, đổi nhận và từ chối)
  không in mật khẩu hay mã đổi ra nhật ký của máy chủ.
- AC-2 (cross-layer): Given người m thuộc cả sàn A và sàn B, When quản trị sàn A gọi cấp mật khẩu cho m, Then 409
  `user_in_other_company` với câu không nêu sàn nào, và mật khẩu, phiên, sự kiện của m không đổi; chặn nằm ở hàm cơ sở dữ
  liệu (gọi thẳng hàm bằng vai API cũng bị từ chối), lời mời vào sàn khác chạy đồng thời phải chờ cùng khoá; bộ kiểm cách
  ly có ca này và ca vai API không đọc được ba bảng mật khẩu mới của `identity`. Given m chỉ ở sàn A có mật khẩu gốc sàn
  cấp (mật khẩu tạm, hay mật khẩu đặt lần đầu từ mật khẩu tạm ấy), When m được thêm vào sàn B, Then mật khẩu ấy bị vô hiệu
  (đăng nhập ra 403 `password_disabled`) kèm sự kiện `vo-hieu-san-khac`, lời mời vẫn thành công; mật khẩu m tự đổi ở Cá
  nhân trước khi vào sàn B thì vẫn đăng nhập được.
- AC-3 (cross-layer): Given m có mật khẩu tạm còn hạn, When m đăng nhập bằng email + mật khẩu tạm, Then API trả 200 kèm
  «phải đặt mật khẩu mới» và mã đổi (15 phút), **không** đặt cookie phiên (mọi đường cần phiên vẫn 401); đăng nhập lại
  bằng cùng mật khẩu tạm trước khi đặt xong ra mã đổi mới và mã cũ hết dùng (Hỏi-5); đặt xong thì mật khẩu tạm ra 401
  `invalid_email_or_password`; mật khẩu tạm quá 72 giờ ra 403 `temp_password_expired`.
- AC-4 (cross-layer): Given mã đổi còn hạn, When m gửi mật khẩu mới, Then mật khẩu dưới 15 hay trên 128 ký tự, có trong
  danh sách phổ biến của kho, hay dễ đoán theo ngữ cảnh (chứa phần trước «@» của email, «quỹ hàng», một ký tự lặp, dãy
  bàn phím hay dãy số) bị từ chối kèm lý do; mật khẩu 15 ký tự có dấu cách và chữ tiếng Việt có dấu được nhận; nhận rồi
  thì API đặt cookie phiên (30 ngày trượt như mã 6 số), ghi sự kiện `dat-lan-dau`, mã đổi không dùng lại được.
- AC-5 (cross-layer): Given m đã tự đặt mật khẩu, When m đăng nhập bằng email + mật khẩu đúng, Then có phiên như đăng nhập
  bằng mã; mật khẩu sai và email không có tài khoản cùng ra 401 `invalid_email_or_password` với cùng thân lỗi; đăng nhập
  bằng mã 6 số vẫn chạy như trước hàng này; đường tự đăng ký bằng mật khẩu trả 404.
- AC-6 (cross-layer): Given một email (có tài khoản hay không), When có 5 lần đăng nhập mật khẩu sai trong 15 phút, Then
  lần thứ sáu ra 429 `password_rate_limited` kể cả khi mật khẩu đúng; Given một tài khoản sai liên tiếp 20 lần (qua nhiều
  cửa sổ), Then mật khẩu bị vô hiệu — mật khẩu đúng ra 403 `password_disabled` tới khi quản trị cấp lại — và có sự kiện
  `khoa-20`; một lần đăng nhập đúng trước ngưỡng thì đếm liên tiếp về 0.
- AC-7 (cross-layer): Given m đã đăng nhập ở hai máy, When m đổi mật khẩu ở Cá nhân, Then đã có mật khẩu dùng được thì
  phải gõ đúng mật khẩu hiện tại (sai ra 403), chưa có hay đã vô hiệu thì đặt không cần; cùng luật độ dài và danh sách
  của AC-4; phiên máy kia bị thu, phiên máy này giữ; sự kiện `doi`. When m «Báo mất máy», Then ngoài việc hàng 38 đã làm,
  mật khẩu của m bị vô hiệu (đăng nhập bằng mật khẩu ra 403 `password_disabled`) và có sự kiện `vo-hieu-bao-mat`.
- AC-8: Given bản thư viện đăng nhập đã cài, When liệt kê mọi đường lõi của thư viện, Then đường nào chạm mật khẩu, đăng
  ký hay thư xác minh đều có trong bảng xếp loại đường — đăng nhập bằng mật khẩu đi qua đường bọc của Quỹ hàng, các đường
  còn lại (tự đăng ký, đổi mật khẩu của thư viện, quên và đặt lại mật khẩu, xác minh mật khẩu, thư xác minh) trả 404 trước
  bộ xử lý, không gửi thư; thêm một đường chạm mật khẩu mà không xếp loại thì bài kiểm đỏ; bài kiểm đường gửi mã của hàng
  55 vẫn xanh.
- AC-9: Given màn đăng nhập, Đặt mật khẩu mới, Người dùng và Cá nhân đang chạy, When đi mọi trạng thái `ST-*` của Đặc
  tả UX trong thiết kế (trừ ST-dang-xuat-loi của AC-10), mỗi trạng thái ở cả khổ điện thoại 375 và máy tính 1280, Then
  mỗi trạng thái hiện đúng chữ và việc tiếp theo đã khai, lỗi đăng nhập nằm ngay dưới ô;
  hộp kết quả cấp mật khẩu hiện mật khẩu tạm một lần với nút «Chép», đóng hộp là không xem lại được; Cá nhân giữ sáu nhóm
  dòng, dòng «Mật khẩu» nằm trong nhóm theo Hỏi-6 (khuyến nghị «Hồ sơ»), hộp đổi có ô mật khẩu hiện tại khi «Đã đặt»
  và không có khi «Chưa đặt»; màn đặt mật khẩu mở thẳng không có mã đổi thì báo hết phiên kèm nút về đăng nhập; địa chỉ
  và lịch sử trình duyệt không bao giờ chứa mã đổi.
- AC-10: Given người đang ở vỏ (menu tài khoản, Cá nhân) hay ở màn chọn sàn, When bấm «Đăng xuất» mà máy chủ trả lỗi hay
  mất mạng, Then màn hiện «Chưa đăng xuất được» kèm «Thử lại», người không bị đưa về đăng nhập; thử lại khi máy chủ đã
  trả lời được thì về đăng nhập; kho trên máy vẫn xoá trước khi gọi máy chủ như hàng 38.
- AC-11: Given cây sau hàng này, When chạy kiểm kiểu, lint (kèm chuẩn giao diện), bộ test lõi, API, web, bộ kiểm cơ sở dữ
  liệu của API, bộ kiểm cách ly, bộ kiểm rò rỉ và build, Then đều xanh; migration là tệp mới `034_*.sql`, không migration
  đã commit nào đổi; ADR-0005 có mục bổ sung 04/11, `design/patterns/xac-thuc.md` có màn Đặt mật khẩu mới, Tham chiếu §12
  có một dòng cho hàng này.

## Coverage

Quét bằng morphological-scan (preset risk-premortem kết hợp test-matrix), bốn trục:

- Trục A — người gọi × người đích: quản trị sàn A × người chỉ ở A · quản trị A × người ở A và B · quản trị A × người
  chỉ ở A rồi vào thêm B · quản trị A × người ngoài A · người không quản trị · chính người ấy [thước CE: ADR-0006 §2–§3, bất biến 1, bản đánh giá «Rủi ro»]
- Trục B — trạng thái mật khẩu: chưa có · tạm còn hạn · tạm hết hạn · đặt lần đầu (gốc sàn cấp) · tự đổi · vô hiệu do
  khoá 20 · vô hiệu do báo mất máy · vô hiệu do vào sàn khác [thước CE: bản đánh giá §4 luật 2–4; NIST SP 800-63B-4 §3.1.1.2]
- Trục C — đường vào: đường bọc đăng nhập mật khẩu · đặt lần đầu · đổi ở Cá nhân · cấp của quản trị · đường lõi thư viện
  (tự đăng ký, đổi, quên, đặt lại, xác minh) · mã 6 số [thước CE: `dist/api/routes` của better-auth 1.7.14,
  `duong-gui-ma.ca.ts`]
- Trục D — kết cục đăng xuất: máy chủ trả lời · máy chủ lỗi · mất mạng · thử lại thành công [thước CE: luật 55,
  `dang-xuat-tren-may.ts`]
- Core: A trọn ở AC-1, AC-2, AC-7; B trọn ở AC-3, AC-6, AC-7; C trọn ở AC-3–AC-5, AC-8; D trọn ở AC-10; chữ người thấy ở
  AC-9.
- Later: đội vận hành cấp lại mật khẩu cho quản trị bằng công cụ mở sàn · tên đăng nhập không phải email · yếu tố thứ hai
  · sàn siết thêm luật mật khẩu · quản trị xem lịch sử sự kiện mật khẩu trên màn.
- Never: đường quên mật khẩu qua thư · plugin `admin` của thư viện · chặn «chỉ thuộc sàn A» ở giao diện thay cho cơ sở dữ
  liệu · gọi `api.pwnedpasswords.com`.

## Đường đo

Ngưỡng của ô cơ hội: «một quản trị cấp mật khẩu tạm cho một người chỉ thuộc sàn mình; người ấy đăng nhập bằng email và mật
khẩu tạm, đặt mật khẩu mới rồi vào vỏ, không cần thư; mã 6 số vẫn dùng được; quản trị không cấp được mật khẩu cho người
cũng thuộc sàn khác; đăng xuất lúc mất mạng báo «Chưa đăng xuất được»» · chết khi «mật khẩu (tạm hay tự đặt) xuất hiện ở
nhật ký, sự kiện hay trang nào».

- Thước: cấp → đăng nhập tạm → đặt mới → vào vỏ, không thư · số từ: E1, E3, E4, E10 · bảo đảm bởi: AC-1, AC-3, AC-4, AC-9
- Thước: mã 6 số vẫn dùng được · số từ: E5 · bảo đảm bởi: AC-5
- Thước: không cấp được cho người thuộc sàn khác · số từ: E2, E11 · bảo đảm bởi: AC-2
- Thước: đăng xuất lúc mất mạng báo · số từ: E13, E14 · bảo đảm bởi: AC-10
- Thước: mật khẩu không ở nhật ký, sự kiện, trang · số từ: E1 (bảng và nhật ký lúc cấp), E21 (nhật ký mọi đường mang
  mật khẩu hay mã đổi), E10 (địa chỉ và lịch sử trình duyệt) · bảo đảm bởi: AC-1, AC-9

## Out of scope

- Đội vận hành cấp lại mật khẩu cho chính quản trị sàn bằng công cụ mở sàn — hàng sau; hôm nay quản trị quên mật khẩu
  vẫn vào bằng mã 6 số.
- Tên đăng nhập không phải email, yếu tố thứ hai, mật khẩu dưới 15 ký tự.
- Sàn tự chỉnh luật mật khẩu (Hỏi-3 quyết giữ cứng hay không; cho sàn siết thêm là hàng sau).
- Màn đọc lịch sử sự kiện mật khẩu; sự kiện chỉ ghi ở `identity`.
- Xác minh tên miền gửi ở Resend (việc vận hành của ADR-0009, không thuộc hàng).

## Notes

- Vùng: theo `hang-viec.json` của đợt cộng phần khai ở Cổng Phạm vi (đường bọc ở `packages/api/src/app.ts`, báo mất máy
  ở `packages/api/src/me/**`, vỏ và proxy ở `apps/web/src/components/shell/**`, `apps/web/src/proxy.ts`,
  `apps/web/src/lib/api.ts`, bộ kiểm cách ly `packages/db/tests/isolation.test.mjs`, bài kiểm đường gửi mã
  `packages/api/test-db/dong-duong-gui-ma/**`, tài liệu `CONTEXT.md`, `docs/architecture/so-diem-bien-thien.md`,
  `docs/product/doi-chieu-nganh.md`).
