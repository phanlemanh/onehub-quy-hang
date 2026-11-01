---
schema_version: 1
feature: Telesales theo dõi lead đã nhập qua bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng, thấy lead bị trả lại kèm «Sửa số và gửi lại»; không thấy hàng
slug: lead-bon-nac
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api, db]
status: draft
design_doc: docs/superpowers/specs/2026-11-01-lead-bon-nac-design.md
approved_by:
approved_at:
---

# Acceptance Contract: lead-bon-nac

## Context

Hàng 27 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 25 (chia lead và hạn, ADR-0017) và hàng 24 (ô nhận
lead, ADR-0012). Lộ trình ghi T2 với vùng màn `leads/mine`; «trả lại» và «lên bảng» cần cột và hàm mới ở cơ sở dữ liệu
(migration `015`, `t3_paths`) nên hàng chạy hạng T3. Màn đầu của nhóm màn mới «lead của tôi» đi trang ba lối của ADR-0019.
Câu Hỏi-1..4 soạn theo khuyến nghị; chủ kho chốt ở Cổng Phạm vi.

Source input: `docs/plan/lo-trinh.json` hàng 27 · `_acceptance/lead-bon-nac/opportunity.md` · thiết kế
`docs/superpowers/specs/2026-11-01-lead-bon-nac-design.md` · trang ba lối `_acceptance/lead-bon-nac/ba-loi/index.html`

Từ ngữ: «bốn nấc» = Đã gửi · Đã nhận · Đã gọi · Lên bảng; «trạng thái phụ» = Trả lại · Đã gửi lại · Tin bổ sung · Đã bỏ;
«lead của tôi» = lead do người đang đăng nhập nhập; «lên bảng» = theo khuyến nghị Hỏi-1, một hàng của chính đầu chủ của
lead, chủ nhà mang cùng dấu vết số, chuyển sang Sẵn sàng bán (`Active`) kể từ lúc nhập lead; «bộ mẫu» =
`packages/db/seed/mau/du-lieu-mau.json` của hàng 5.

## Criteria

- AC-1: Given lõi của `packages/core`, When tính nấc của một lead từ dữ kiện của nó, Then ra đúng một trong bốn nấc hay bốn
  trạng thái phụ theo thứ tự ưu tiên: đã gửi lại → đã bỏ → tin bổ sung (căn trùng) → trả lại → lên bảng → đã gọi → đã nhận →
  đã gửi; lead đã gửi chưa có người mang dấu «chờ chia»; nhãn tiếng Việt lấy từ lõi; bản của telesales không có số chủ, mã
  hàng hay trường nào của hàng.
- AC-2: Given người đã nhập lead, When gọi `GET /api/v1/leads`, Then nhận đúng các lead chính mình nhập trong sàn đang làm,
  mới nhất trước, mỗi dòng có toà, căn, nhu cầu, giá kèm điều kiện phí, tên đầu chủ, nấc, mốc giờ từng nấc đã qua, lý do
  trả lại và mã lead gửi lại khi có; lead người khác nhập không có mặt; chưa đăng nhập → 401; thân trả không có số chủ, mã
  hàng.
- AC-3: Given telesales nhập một lead qua `POST /api/v1/leads`, When lead đi qua nhịp chia của hàng 25, đầu chủ nhận, ghi
  gọi lần đầu, rồi đầu chủ tạo hàng cho chủ nhà ấy qua đường ghi thật và đưa hàng sang Sẵn sàng bán, Then sau mỗi bước
  `GET /api/v1/leads` của telesales ra đúng nấc kế tiếp: Đã gửi (chờ chia) → Đã gửi (tên đầu chủ) → Đã nhận → Đã gọi → Lên
  bảng, mốc của từng nấc bằng lúc bước ấy xảy ra.
- AC-4: Given lead đã về một đầu chủ, When gọi `POST /api/v1/leads/{id}/return`, Then đầu chủ của lead trả lại được khi lead
  chưa Lên bảng, kể cả khi đã ghi gọi lần đầu (Hỏi-4) — 200, nấc thành Trả lại với lý do «Số không liên lạc được»; người
  khác, kể cả trưởng nhóm và người nhập → 404; lần hai → 409; lead đã Lên bảng → 409; lead căn trùng → 404; chưa đăng nhập
  → 401.
- AC-5: Given lead đã trả lại, When nhịp của hàng 25 chạy ở các mốc hạn, Then lead không được chia lại, không sinh lời báo
  mới, không được tính là lead đang mở của đầu chủ, và lead mới cùng số không về đầu chủ ấy vì lead đã trả lại — cả ở kiểm
  trùng lẫn ở nhịp chia.
- AC-6: Given lead đã trả lại, When người nhập gọi `POST /api/v1/leads/{id}/resubmit` với số mới, Then máy tạo một lead mới
  chép toà, căn, nhu cầu, giá, thời gian của lead cũ với số mới, chạy kiểm trùng và trả kết quả như lead mới nhập (201) —
  số mới trùng chủ nhà đã có đầu chủ ra «chủ đã có đầu chủ» và không vào nhịp chia, căn đã có hàng mở ra tin bổ sung;
  lead cũ thành Đã gửi lại trỏ lead mới; số sai định dạng → 400; lead chưa trả lại → 409; gửi lại lần hai → 409; người
  khác → 404.
- AC-7: Given lead gửi lại không trùng, When nhịp của hàng 25 chạy, Then lead mới được đóng dấu và chia theo cách chia của
  sàn như mọi lead mới, hạn tính từ lần giao mới (Hỏi-2).
- AC-8: Given các hàng của bộ mẫu dựng qua đường ghi thật, When tính lúc lên bảng của lead, Then chỉ hàng thoả cả ba điều —
  chủ nhà cùng dấu vết số, đầu chủ hiện tại là đầu chủ của lead, chuyển Sẵn sàng bán kể từ lúc nhập lead — làm lead Lên
  bảng; hàng của đầu chủ khác, hàng lên bảng trước lúc nhập, hàng chưa Sẵn sàng bán, hàng chủ nhà khác số đều không (Hỏi-1).
- AC-9: Given hai sàn A và B, When người của B gọi `GET /api/v1/leads`, trả lại, gửi lại trên lead của A, và vai API gọi
  thẳng các hàm mới dưới ngữ cảnh B, Then không thấy, không đổi được gì của A (404 hoặc không dòng); hàm lên bảng chỉ trả mã
  lead và mốc giờ, không mã hàng; mọi thân trả không có số chủ.
- AC-10: Given telesales của sàn mẫu đã đăng nhập, When mở Hôm nay ở khổ 1440 và 375, Then thấy danh sách lead đã nhập theo
  khối đã chọn ở trang ba lối, mỗi dòng mang nấc bằng `Badge` và giờ; dòng bị trả lại có ô số mới và nút «Sửa số và gửi lại»
  — gửi được thì dòng thành Đã gửi lại và lead mới hiện đầu danh sách; danh sách trống có một hành động «+ Lead»; đang tải
  có `Skeleton` đúng bố cục; lỗi có «Thử lại»; vai khác mở Hôm nay vẫn thấy chỗ tạm như trước; `/leads/mine` mở cùng màn.
- AC-11: Given màn của AC-10 đã hiện lead của sàn mẫu, When đọc toàn bộ chữ trên màn và mọi phản hồi mạng của màn, Then
  không có số chủ nhà nào của lead ở bất kỳ dạng chữ số nào (dò theo chín chữ số cuối, phủ dạng 0, 84, +84) trong tài liệu
  trang, gói dữ liệu màn và phản hồi `/api/v1/*`, không có mã hàng; máy dò bắt được một số cài sẵn (đối chứng dương).
- AC-12: Given bộ mẫu có hai telesales, lead lên bảng và một chuỗi gửi lại, When chạy hàm báo cáo `app.lead_board_metric`
  bằng kết nối chủ cho một sàn và một khoảng ngày, Then ra đúng các lead lên bảng trong khoảng của sàn ấy với lúc nhập lead
  đầu chuỗi, lúc lên bảng và số ngày bằng bảng viết trước; lead gửi lại tính từ lead đầu tiên của chuỗi; không số chủ, không
  mã hàng; vai API gọi hàm → bị từ chối quyền.

## Coverage

Quét morphological-scan, preset entity-feature, cho thực thể «một lead nhìn từ phía người nhập».

- Trục nấc: Đã gửi chờ chia · Đã gửi có người · Đã nhận · Đã gọi · Lên bảng (AC-1, AC-3) [thước CE: câu giao hàng 27,
  ghi chép 29/10 §12 «Sau khi gửi»]
- Trục trạng thái phụ: Trả lại · Đã gửi lại · Tin bổ sung · Đã bỏ (AC-1, AC-4, AC-6)
- Trục lúc trả lại: chưa gọi · đã gọi chưa lên bảng · đã lên bảng (AC-4, Hỏi-4)
- Trục ai làm: người nhập · đầu chủ của lead · đầu chủ khác · trưởng nhóm · người sàn khác · chưa đăng nhập (AC-2, AC-4,
  AC-6, AC-9)
- Trục lên bảng: cùng số cùng đầu chủ sau lúc nhập · đầu chủ khác · trước lúc nhập · chưa Sẵn sàng bán · khác số (AC-8)
- Trục nhịp: lead trả lại · lead gửi lại · lead cùng số với lead trả lại (AC-5, AC-7)
- Trục màn: có lead · trống · đang tải · lỗi · 1440 · 375 · vai khác (AC-10)
- Trục rò: số chủ · mã hàng · sàn khác (AC-2, AC-9, AC-11)
- Trục lớp: lõi thuần (AC-1) · cơ sở dữ liệu + API (AC-2..AC-9, AC-12) · màn (AC-10, AC-11)
- Trục đo: lead lên bảng thẳng · chuỗi gửi lại · hai telesales · ngoài khoảng · sàn khác (AC-12)

## Đường đo

Ô cơ hội khai số đo hai tuần thử «Số ngày lead → Sẵn sàng bán»:

- «Số ngày lead → Sẵn sàng bán» = mốc Lên bảng trừ `created_at` của lead đầu chuỗi, trên các lead có mốc Lên bảng trong
  khoảng đo ← AC-12 (câu tính chạy thật trên bộ mẫu), AC-8 (định nghĩa lên bảng), AC-3 (mốc đi qua đời lead thật). Câu tính:
  `select * from app.lead_board_metric('<mã sàn>', '<từ>', '<đến>')` chạy bằng kết nối chủ (Supabase SQL editor); hàm dùng
  chung định nghĩa lên bảng với `app.lead_board_dates`, đi ngược `resubmitted_lead_id` để lấy lead đầu chuỗi, không cấp cho
  vai API. Trung vị và phân bố số ngày tính trên cột `days`.
- Theo lời chốt Hỏi-1: chọn lối «để trống tới hàng 17/22» thì số đo này chưa có dữ liệu tới khi lead được gắn với hàng.

## Out of scope

- Nút «Trả lại» trên màn của đầu chủ — Hôm nay của đầu chủ là hàng 22; hàng này có lối API.
- Hôm nay của đầu chủ, trưởng nhóm, đầu khách — hàng 22, 42, 32; `today/page.tsx` chỉ rẽ nhánh cho vai telesales.
- Gắn lead với hàng bằng mã khi đầu chủ tạo hàng từ lead — hồ sơ căn và Hôm nay của đầu chủ (hàng 17, 22).
- Thông báo cho telesales khi lead đổi nấc — hàng 26.
- Lý do trả lại khác «số không liên lạc được» (chủ không bán, trùng…) — thêm khi có màn của đầu chủ.
- Ô nhận lead trên điện thoại (L4, L9) — hàng riêng; màn của hàng này đọc được ở 375 nhưng không dựng lại ô nhận.

> Out of scope = scope-truth (Gate 1 duyệt mục này). Rationale/trade-off từng mục → 1 entry `descope` trong `decisions.jsonl`.

## Notes

- Bất biến chạm: (1) cách ly — lối liệt, trả lại, gửi lại, hàm lên bảng lọc theo sàn đang làm; ca trong
  `packages/db/tests/isolation.test.mjs`; (2) chủ nhà — số không ra khỏi cơ sở dữ liệu ở dạng chữ, lên bảng chỉ trả mốc
  giờ; (3) người bấm gửi — trả lại và gửi lại là người bấm; (4) trang khách — không chạm.
- Migration `015_lead_bon_nac.sql` và ADR-0020 xin giữ chỗ ở giám sát (yêu cầu L-11); trùng số thì đổi trước khi gộp.
- 015 thay bằng `create or replace` bốn hàm của hàng 25 và `app.lead_dedupe_facts` (hàng 24, 62), cùng chữ ký, chỉ thêm điều
  kiện «chưa trả lại»; bộ kiểm của ba hàng ấy phải xanh nguyên.
