---
schema_version: 1
feature: Khách mở link từ Zalo và thấy bộ căn mang tên sàn, giá sống kèm «giá xác nhận X ngày trước», căn đã cọc tự mờ, chạm «Quan tâm» được
slug: trang-khach-rieng
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: approved
design_doc: docs/superpowers/specs/2026-11-04-trang-khach-rieng-design.md
approved_by: Manh Phan
approved_at: 2026-11-04
---

# Acceptance Contract: trang-khach-rieng

## Context

Hàng 35 của lộ trình (dãy L, đợt `dau-khach-nhap`), Cổng Đáng: build (Manh Phan 02/11). Đứng trên hàng 34 (Lần gửi,
link `/s/<mã>`, thành phần `TrangKhach`), hàng 31 (luật ẩn `banRaNgoai`, rào cửa ra trang) và hàng 52 (hai số đo
`customer_link_opens`, `customer_interest` đang «chưa có sự kiện»). Hạng T3: migration mới (bảng sự kiện của Lần gửi, hàm
đọc theo mã) và route API ra ngoài sàn đầu tiên — mang rào route công khai (luật đợt 39, nguồn «H-5 hàng 31»).

Source input: `docs/plan/lo-trinh.json` hàng 35 · `_acceptance/trang-khach-rieng/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-04-trang-khach-rieng-design.md`.

Từ ngữ: «trang khách» = `/s/<mã>`; «bản ra» = kết quả `banRaNgoai` của lõi cho một căn và một người nhận; «route công
khai» = route dưới `/api/v1/public/`; «lượt mở» = sự kiện `link_opened` của một Lần gửi; «lượt quan tâm» = sự kiện
`interest` của một căn trong một Lần gửi; «mã máy» = chuỗi ngẫu nhiên trang lưu ở máy khách; «căn mồi» = `canMoi()` của
hàng 31.

## Criteria

- **AC-1** (cross-layer) — Given một Lần gửi còn bật có n căn, When khách mở `/s/<mã>` không đăng nhập, Then không bị đưa về `/login` (các trang vận hành chưa phiên vẫn bị đưa
  về), trang hiện
  «<tên sàn> · <người gửi> gửi» và đúng n căn theo `share_listings.position`; dữ liệu đi qua
  `GET /api/v1/public/shares/{code}`, mà thân trả chỉ gồm bản ra `banRaNgoai(…, { cua: "gui_link", nguoiNhan })` của từng
  căn (khoá mỗi căn là tập con của `truongRa(nguoiNhan, cauHinh)`), cùng tên sàn, tên người gửi, người nhận.
- **AC-2** — Given người nhận của Lần gửi, When dựng trang, Then khách riêng không thấy mã căn, trục, tầng số (chỉ toà
  và nấc tầng khi có); nhóm môi giới thấy mã căn; mỗi căn có giá, «giá xác nhận X ngày trước» (X theo hàm freshness của
  lõi) khi bản ra có.
- **AC-3** (cross-layer) — Given trạng thái căn lúc mở, When dựng trang, Then căn Đang giao dịch mờ đi với nhãn «Đã có người đặt cọc» và
  vẫn có giá; Tạm ngưng / không còn mờ đi với nhãn «Tạm ngưng» / «Không còn», không giá; ba loại này không có nút Quan
  tâm và giữ chỗ cũ trong bộ (Hỏi-4); đổi giá hay trạng thái trên bảng hàng rồi mở lại thì trang theo giá trị mới (route
  và trang không lưu đệm).
- **AC-4** (cross-layer) — Given trang đã chạy ở trình duyệt, When trang tải xong, Then đúng một lời gọi
  `POST /api/v1/public/shares/{code}/events` với `type: link_opened` (hằng tên sự kiện ở lõi mà số đo `customer_link_opens`
  đọc) và mã máy, ghi một dòng `share_events` của đúng sàn,
  Lần gửi; tải trang ở máy chủ một mình (như Zalo lấy ảnh xem trước) không ghi gì; cùng mã máy mở lại trong cùng ngày
  không thêm dòng.
- **AC-5** (cross-layer) — Given một căn Đang bán trên trang, When khách chạm «Quan tâm», Then ghi một sự kiện `interest` (hằng
  tên sự kiện ở lõi mà số đo `customer_interest` đọc) cho đúng căn và Lần gửi, nút thành «Đã báo quan tâm»; cùng mã máy chạm lại không thêm dòng; căn không thuộc Lần gửi hay
  không còn Đang bán bị từ chối (4xx, không ghi); lỗi mạng thì báo «Chưa gửi được — thử lại» và giữ nút.
- **AC-6** (cross-layer) — Given mã không có, Lần gửi đã tắt (`disabled_at`), hay người gửi không còn thuộc sàn (Hỏi-5,
  Hỏi-6), When mở trang hay gọi route công khai,
  Then trang hiện «Link không còn mở được — hỏi lại người gửi» không tên sàn, không căn; route đọc trả 404 không thân dữ
  liệu; route sự kiện từ chối, không ghi.
- **AC-7** (cross-layer) — Given ảnh bìa của một căn trong bản ra, When trang xin ảnh qua
  `GET /api/v1/public/shares/{code}/photos/{photoId}`, Then trả ảnh; mã ảnh không nằm trong bản ra của chính Lần gửi ấy
  (ảnh ngăn nội bộ, ảnh căn khác, ảnh của Lần gửi khác) trả 404.
- **AC-8** — Given mọi người nhận và mọi cấu hình luật ẩn của hàng 31, When dựng thân route đọc công khai từ căn mồi, Then
  `timRoRi` không bắt giá trị nội bộ hay nguồn nào; trang `/s/` có bài rò rỉ cạnh nó; và rào route công khai đọc danh sách
  route đã đăng ký trên app API: route nào dưới `/api/v1/public/` không có bài kiểm rò rỉ nêu đúng đường của nó thì bài
  đỏ, nêu route (luật đợt 39).
- **AC-9** (cross-layer) — Given bảng `share_events` mới, When chạy bộ kiểm cách ly, Then bảng bật `enable` + `force row
  level security`, vai `quy_hang_app` của sàn khác không đọc được dòng; ghi chỉ qua hàm của migration 031; hàm tìm theo
  mã lọc đúng một Lần gửi, không liệt kê, chỉ trả sàn, người gửi, người nhận, cờ bật — không cột căn, không cột lớp
  `source`; `packages/db/tests/isolation.test.mjs` có ca chứng mã sai và mã của sàn khác không đọc hay ghi được gì.
- **AC-10** — Given trang khách là màn đầu của nhóm «trang khách» (luật đợt 18), When chạy lưới giao diện, Then có
  `design/patterns/trang-khach.md` khai bố cục và màn mẫu `/s/[code]`; `npm run lint` (quy-hang-ui, mức nợ trần 0) xanh;
  Tham chiếu §10 ghi «Trang khách: khách riêng — Đã dựng (hàng 35)»; trang ba lối `/s/ba-loi` đã gỡ khỏi cây (ảnh giữ ở
  hồ sơ), dưới `apps/web/src/app/s/` chỉ còn trang khách thật.

## Coverage

Quét `morphological-scan` preset entity-feature trên «trang khách»: trục **người mở** (khách riêng · nhóm môi giới · Zalo
lấy xem trước) × **trạng thái Lần gửi** (bật · tắt · mã sai) × **trạng thái căn** (đang bán · đã cọc · tạm ngưng · không
còn) × **hành động** (mở · xem chi tiết · quan tâm · lấy ảnh) × **lớp** (trang · route đọc · route sự kiện · route ảnh ·
bảng). Core → AC-1…AC-10; Later/Never → Out of scope. Thước CE: mỗi ô (người mở × trạng thái Lần gửi) có ít nhất một AC
(AC-1, AC-2, AC-4, AC-6); mỗi route công khai có AC hành vi (AC-1, AC-5, AC-7) và AC rò rỉ (AC-8); mỗi trạng thái căn
có dòng ở AC-3.

## Đường đo

- «Số link khách mở» (Tham chiếu §11, mã `customer_link_opens`): đếm Lần gửi có ít nhất một `share_events.type =
  'link_opened'` — AC-4 bảo đảm lượt mở thật ghi đúng một dòng và lượt xem trước của Zalo không ghi.
- «Số lượt quan tâm» (mã `customer_interest`): đếm dòng `share_events.type = 'interest'` — AC-5 bảo đảm một máy một lượt
  mỗi căn.
- Nối hai số đo vào `packages/core/src/metrics` đọc theo hai tên sự kiện trên là việc của giám sát (luật đợt 35) — ghi ở
  Notes.

## Out of scope

- Nút tắt link của người gửi (Đã gửi, hàng 36); trang tôn trọng `disabled_at` có sẵn.
- Báo người gửi khi khách mở hay quan tâm (hàng 36, 37).
- Mức chia trên trang nhóm môi giới (hàng 44); số điện thoại người gửi trên trang (Hỏi-2).
- Chặn lạm dụng route công khai theo địa chỉ máy; bản đầu chặn trùng theo mã máy.
- Đọc cấu hình trang khách của sàn từ `company_settings` (Cài đặt sàn 45–49); bản đầu dùng mặc định của lõi.
- Nối hai số đo vào `packages/core/src/metrics` (giám sát, luật đợt 35).

## Notes

- Bất biến chạm: cả bốn — 1 (bảng mới, hàm theo mã), 2 (route ra ngoài sàn, không lớp `source`), 3 (trang không gửi thay
  ai), 4 (dữ liệu ra từ `banRaNgoai`, bài rò rỉ cho trang và route).
- Migration số 031 (giám sát giữ chỗ theo luật đợt 25, trả lời L-20).
- Chủ kho thử thật trên điện thoại (mở link từ Zalo, chạm Quan tâm) gom cùng luồng Gửi hàng 34 trong yêu cầu L-19 (luật
  đợt 16).
