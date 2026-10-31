---
schema_version: 1
feature: Bảng hàng và hồ sơ đọc từ kho trên máy nên lọc, cuộn, mở hồ sơ không chờ mạng; sửa ghi trên máy trước, rớt mạng vài phút không mất thay đổi
slug: nhanh-tuc-thi
owner: omre.cnsp4@onemount.com
risk_tier: T3
surfaces: [ui, api]
status: implemented
design_doc: docs/superpowers/specs/2026-10-31-nhanh-tuc-thi-design.md
approved_by: Manh Phan
approved_at: 2026-10-31T09:30:00Z
---

# Acceptance Contract: nhanh-tuc-thi

## Context

Hàng 13 của lộ trình (nền, dãy N, đợt nen-2), đứng trên hàng 2 (bài thử đồng bộ), 11 (lớp trường nguồn) và 12 (trục ai
thấy hàng). Tham chiếu §8 luật 10, 30–32; ADR-0006 (bộ đồng bộ tự làm mỏng, kéo qua API dưới luật theo dòng, hàng đợi
IndexedDB gắn người dùng, biết có mạng lại không dựa riêng sự kiện trình duyệt). Màn Bảng hàng và Hồ sơ căn dựng ở hàng
14, 32, 33; hàng này dựng bộ đồng bộ và hook mà chúng dùng, chỉ báo trên thanh trên, hỏi khi đăng xuất, và trang thử ẩn
`/proto/nhanh-tuc-thi`. Ba câu Hỏi-1..3 của bản thiết kế soạn theo khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 13 · `_acceptance/nhanh-tuc-thi/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-10-31-nhanh-tuc-thi-design.md`

Từ ngữ: «kho trên máy» = dữ liệu bộ đồng bộ giữ trên thiết bị của một người (bản kéo về, lịch sử căn đã mở, hàng đợi);
«thao tác chờ» = một lần sửa đã ghi trên máy, chưa được máy chủ nhận; «cần xem» = căn có thao tác chờ mà máy chủ không
nhận (đụng nhau hay bị từ chối), chờ người chọn lối; «mất mạng» = mọi lời gọi tới API thất bại vì mạng.

## Criteria

- AC-1: Given hai sàn trên Postgres thật; sàn A có người tạo X với một căn «Chỉ tôi» và một căn «Toàn sàn» đã đặt chủ
  nhà, người Y cùng sàn; sàn B có người Z, When bộ đồng bộ của từng người kéo về, Then kho của X có cả hai căn, kho của Y
  chỉ có căn «Toàn sàn», kho của Z không có căn nào của sàn A; quét mọi bản ghi trong kho của cả ba không thấy khoá nguồn
  hay giá trị nguồn mẫu (tên chủ, số chủ ba cách viết, giá đáy); kho của X ở sàn A và ở sàn thứ hai của X tách riêng.
  (cross-layer)
- AC-2: Given kho trên máy đã có bản kéo và lịch sử của một căn đã mở, mạng hỏng (mọi lời gọi ném lỗi), When lọc danh sách
  theo trạng thái và theo toà, mở hồ sơ căn đã mở và căn chưa mở, rồi dựng lại bộ đồng bộ từ chính kho ấy (như tải lại
  trang), Then mọi lần đọc trả dữ liệu từ kho với 0 lời gọi mạng — căn đã mở có lịch sử, căn chưa mở có trạng thái — và
  sau khi dựng lại vẫn đọc được như trước.
- AC-3: Given kho có một căn ở phiên bản 3, When sửa giá hợp lệ rồi sửa tiếp chi tiết, Then bản trên máy đổi ngay theo
  luật gấp của lõi, hàng đợi có hai thao tác mang mã thao tác khác nhau với phiên bản kỳ vọng 3 rồi 4; When sửa sai khuôn
  hay chuyển sang trạng thái lõi cấm, Then bị từ chối ngay kèm lý do của lõi, hàng đợi không thêm, bản trên máy không đổi.
- AC-4: Given đang mất mạng, When sửa 20 ô trên năm căn, dựng lại bộ đồng bộ từ kho giữa chừng, rồi có mạng lại, Then máy
  chủ có đúng 20 sự kiện mới, mỗi căn đúng thứ tự đã sửa, giá trị khớp; hàng đợi rỗng; phiên bản trên máy bằng máy chủ;
  Given X có 3 thao tác chờ ở sàn A rồi đổi sang sàn B, When có mạng, Then thao tác của sàn A không gửi trong lúc X đứng ở
  sàn B (máy chủ +0, không căn nào của A vào «cần xem»), quay về sàn A thì lên đủ 3 đúng thứ tự. (cross-layer)
- AC-5: Given máy chủ đã ghi một thao tác nhưng phản hồi không về tới máy, When bộ đồng bộ gửi lại, Then máy chủ không có
  sự kiện thứ hai và thao tác được nhận là đã áp — cả với «Đã cọc» và «Đã bán» (không qua phép kiểm phiên bản).
  (cross-layer)
- AC-6: Given X có thao tác chờ trên căn H và trên căn K, Y sửa H trước, When X có mạng, Then thao tác của X trên H không
  lên, H thành «cần xem» mang giá trị của Y và của X, thao tác trên K vẫn lên; «Giữ của tôi» gửi lại trên phiên bản mới
  (máy chủ có sự kiện của X sau của Y), «Lấy bản mới» bỏ thao tác của X (bản trên máy bằng máy chủ); When máy chủ từ chối
  một thao tác vì lý do khác (căn không còn đọc được, thiếu điều kiện chuyển trạng thái), Then căn ấy thành «cần xem» kèm
  lý do và không thao tác nào biến mất mà không báo; «Bỏ thay đổi» lấy thao tác khỏi hàng đợi, căn rời «cần xem» và chỉ
  báo về trạng thái thường; «Sửa lại» (chỉ khi căn còn đọc được) trả giá trị của tôi về ô để sửa và kiểm lại bằng luật lõi.
  (cross-layer)
- AC-7: Given Y đặt «Đã cọc» cho căn H trong lúc X mất mạng và có thao tác sửa giá chờ trên H, When X có mạng, Then sửa giá
  của X không lên mà H thành «cần xem» nói «Căn đã cọc»; Given X có «Đã cọc» chờ trên H còn Y đã sửa giá H, When X có
  mạng, Then «Đã cọc» của X lên ngay dù phiên bản lệch; tương tự với «Đã bán». (cross-layer)
- AC-8: Given các trạng thái của kho và hàng đợi, When suy chỉ báo, Then chữ đúng bảng: chưa có bản kéo → «Đang tải lần
  đầu»; không chờ và lần kéo cuối thành công → «Đã đồng bộ · hh:mm»; đang gửi n → «Đang gửi n thay đổi»; lần thử cuối lỗi
  mạng → «Mất mạng · n thay đổi chờ gửi»; có n căn cần xem → «n căn cần xem», thắng mọi trạng thái khác; và chỉ báo hiện
  trên thanh trên ở máy tính lẫn điện thoại.
- AC-9: Given mất mạng và trình duyệt không phát sự kiện «có mạng», When qua chu kỳ thử 15 giây (có thao tác chờ) hay
  trang được quay lại, Then bộ đồng bộ thử gửi; một lời gọi thành công là có mạng và hàng đợi lên; khi yên chu kỳ là 30
  giây.
- AC-10: Given người dùng còn n thay đổi chờ gửi, When bấm đăng xuất, Then hiện hỏi nói đúng n; «Ở lại» giữ nguyên kho;
  «Vẫn đăng xuất» xoá sạch kho của người đó trên máy (bản kéo, lịch sử, hàng đợi) và kho của người khác trên cùng máy
  không bị đụng; không có thay đổi chờ thì đăng xuất không hỏi nhưng vẫn xoá sạch kho của người đó.

## Coverage

Quét morphological-scan, preset test-matrix, cho «bộ đồng bộ trên máy của một người». Chân ngành: Replicache
(mutation có mã + push/pull, đối chiếu khi gửi lại) [NGÀNH: Replicache]; PowerSync và ElectricSQL so ở ADR-0006 [NGÀNH:
PowerSync, ElectricSQL].

- Trục người xem với căn: người tạo (AC-1, AC-3) | người khác cùng sàn, căn «Toàn sàn» (AC-1, AC-6, AC-7) | người khác,
  căn «Chỉ tôi» (AC-1, AC-6 lối từ chối) | sàn khác (AC-1) [thước CE: `packages/core/src/visibility/index.ts`, Tham chiếu §6]
- Trục mạng: có (AC-3) | mất, kể cả tải lại trang và đổi sàn khi còn chờ (AC-2, AC-4, AC-9) | phản hồi mất sau khi máy chủ đã ghi (AC-5) | quay
  lại trang (AC-9) [thước CE: ADR-0006 «So ba lối», `_acceptance/bai-thu-dong-bo-mat-mang/ket-qua.md`]
- Trục thao tác: sửa giá, sửa chi tiết (AC-3, AC-4) | đổi trạng thái thường (AC-3) | «Đã cọc», «Đã bán» (AC-5, AC-7) |
  thao tác lõi cấm (AC-3) | thao tác máy chủ từ chối (AC-6) [thước CE: `packages/core/src/listing/events.ts`, `status.ts`]
- Trục người khác cùng lúc: không ai (AC-4) | sửa thường (AC-6) | «Đã cọc», «Đã bán» (AC-7) [thước CE: Tham chiếu luật 10]
- Lớp cắt ngang: không nguồn trên máy (AC-1); chỉ báo nói đúng trạng thái (AC-8); đăng xuất xoá (AC-10).
- Later: kênh thời gian thực (Hỏi-2) · con trỏ kéo · ngoại tuyến khi mở app · số chủ trên máy (Hỏi-1).
- Never ở hàng này: đường ghi riêng của bộ đồng bộ (Kiến trúc §4: đường ghi duy nhất là lệnh qua API).

## Đường đo

- Ngưỡng của ô («rút mạng năm phút, sửa 20 ô, nối lại thì đủ 20 sự kiện lên máy chủ; thanh trên luôn nói đang ở đâu»):
  đo trên thiết bị ở phiên nghiệm thu, trên `quyhang.onehub.center`, điện thoại không làm điểm phát (ADR-0006 việc 4) —
  số đếm sự kiện từ lịch sử căn trên trang thử (AC-4 bảo đảm), chữ thanh trên từ chỉ báo (AC-8). Trang thử trên bản thật
  theo Hỏi-3.
- «Mở hồ sơ không chờ mạng»: số lời gọi mạng khi đọc (AC-2).
- «Hai người cùng sửa thì báo, «Đã bán» và «Đã cọc» thắng»: AC-6, AC-7.

## Out of scope

- Màn Bảng hàng và Hồ sơ căn thật — hàng 14, 32, 33 (dùng hook của hàng này).
- Kênh thời gian thực «có thay đổi, kéo về» — Hỏi-2, hàng sau.
- Số chủ và thông tin chủ nhà trên máy — Hỏi-1.
- Ngoại tuyến thật khi mở app lúc không mạng (service worker) — Tham chiếu §11.
- Con trỏ kéo, khoá chống trùng ở máy chủ, mọi thay đổi API hay cơ sở dữ liệu.
- Báo mất máy để xoá từ xa (luật 32) — cần đường máy chủ, hàng sau.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — kéo qua API dưới luật theo dòng, không đường đọc riêng (AC-1); (2) chủ nhà — không nguồn
  trên máy (AC-1, Hỏi-1); (3) người bấm gửi — không chạm; (4) phần nội bộ không ra trang khách — không chạm.
- Dãy N chạy Postgres 5551 (container `quy-hang-db-N`), dev 3471.
- Bài kiểm web chạy bằng hai lệnh mới khai ở `_acceptance/config.yaml` (`executors.test.web`, `executors.test.web_db`) —
  xin chạm tệp ở giám sát.
