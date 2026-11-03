---
schema_version: 1
feature: "Đường ghi lần nhập (65a): một lần nhập file bảng hàng ghi qua đúng cửa của lõi hàng — hàng mới, cập nhật hàng mình giữ, tin bổ sung cho căn người khác giữ, chủ nhà và số vào liên hệ chủ nhà ở dạng bản mã, độ tươi theo ngày trong file; xem thử trả đúng điều lần ghi sẽ làm"
slug: nhap-excel-xem-truoc-ghi
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [api, db]
status: verified
design_doc: docs/superpowers/specs/2026-11-03-nhap-excel-xem-truoc-ghi-design.md
approved_by: Manh Phan
approved_at: 2026-11-03
---

# Acceptance Contract: nhap-excel-xem-truoc-ghi

## Context

Hàng 65 của lộ trình, tách ở G-4 (giám sát 03/11): hàng này là **65a — đường ghi lần nhập** (migration 024, API
`/api/v1/imports`, kiểm trùng, chủ nhà qua cửa ADR-0010, ba lỗi hàng 64 theo luật 38). Màn Nhập Excel là hàng mới
`man-nhap-excel` (65b) đứng sau hàng này, thêm vào lộ trình trong cùng PR. Đứng trên hàng 64 (lõi nhập tất định), 8 (lõi
hàng và sự kiện), 11 (chủ nhà), 12 (ai thấy hàng), 85 (liên hệ), 26 (báo lead về đầu chủ).

Phạm vi tách so với điều Cổng Đáng đã duyệt (ô cơ hội: «11 tiêu chí vì xem trước và ghi không tách được») — Hỏi-4 ở Cổng
Phạm vi. Mức hiện của hàng do Trưởng nhóm nhập — Hỏi-5.

Hạng: máy suy **T3** (cơ sở dữ liệu, trần lớp dữ liệu); hàng lộ trình ghi **T3**.

Source input: `docs/plan/lo-trinh.json` hàng 65 · `_acceptance/nhap-excel-xem-truoc-ghi/opportunity.md` ·
`docs/architecture/nhap-du-lieu.md` §6, §8 · thiết kế `docs/superpowers/specs/2026-11-03-nhap-excel-xem-truoc-ghi-design.md`.

## Criteria

- AC-1: Given ma trận dữ kiện một dòng viết tay (người bỏ dòng · ô chặn ở toà, mã căn, giá · trùng dòng trước · trạng thái
  file Đã bán, Ngừng hẳn · hàng mở trên căn: không có, người nhập giữ, người khác giữ đọc được, không đọc được), When hỏi
  luật quyết dòng của lõi, Then mỗi tổ hợp ra đúng một hành động (tạo · cập nhật · tin bổ sung · bỏ) với lý do tiếng Việt
  của bảng thiết kế, theo thứ tự xét đã chốt.
- AC-2: Given ba lỗi hàng 64 mà chủ kho chọn mở hợp đồng mới (luật 38), When lõi kiểm kế hoạch, đọc lưới và áp kế hoạch,
  Then (a) cột lõi xếp lớp nguồn (số chủ, tên chủ, giá đáy) ghép vào trường không phải lớp nguồn bị từ chối, nêu cột và
  trường — ghép vào trường lớp nguồn hay bỏ có lý do thì qua; cột ghép vào trường lớp nguồn không được mang bảng quy đổi; (b) tiêu đề có ô trống không làm mất hay nhận nhầm dòng dữ liệu đầu; (c) ô
  «constructor», «toString», «__proto__» ở cột có bảng quy đổi thành ô cần người, lần áp không sập.
- AC-3: Given cơ sở dữ liệu sau migration 024, When chạy bộ kiểm cách ly, Then hai bảng `imports`, `import_rows` bật và ép
  luật theo dòng — sàn A không đọc, không ghi được lần nhập và dòng nhập của sàn B, kể cả qua `import_id` của sàn B trên sự
  kiện hàng; `import_rows` không có cột nào giữ ô nguyên văn. (cross-layer)
- AC-4: Given Đầu chủ mở một lần nhập và gửi một gói dòng mới qua API trên Postgres thật, When ghi, Then mỗi dòng tạo đúng
  một hàng qua cửa của lõi hàng (bộ kiểm «một cửa» xanh), ở Chưa đủ để rao, «Chỉ tôi» của người nhập, người nhập giữ căn,
  mọi sự kiện mang `import_id` và không xác nhận với chủ; dòng file ghi Đang bán mà thiếu điều kiện thì ở lại Chưa đủ để rao
  với lý do. (cross-layer)
- AC-5: Given một gói đã ghi, When gửi lại đúng gói ấy, Then không thêm hàng, sự kiện, lead hay liên hệ nào và trả đúng kết
  quả lần đầu; gói quá 200 dòng bị từ chối 422; một dòng bị lõi từ chối thành «bỏ» có lý do mà các dòng khác của gói vẫn
  ghi. (cross-layer)
- AC-6: Given căn đã có hàng mở trong sàn, When một dòng của lần nhập trỏ căn ấy, Then người nhập giữ căn → sự kiện cập nhật
  trên hàng đó; người khác giữ → một tin bổ sung (lead «căn đã có hàng mở») gửi đầu chủ giữ căn và người ấy được báo, hàng
  không đổi; hàng «Chỉ tôi» của người khác → lý do «căn đã có hàng của người khác trong sàn», thân trả không mang mã hàng,
  tên hay người giữ; hai dòng cùng căn trong file → dòng sau bỏ «trùng dòng <n>», kể cả khi hai dòng nằm ở hai gói khác
  nhau; «người nhập giữ» là đầu chủ của dòng khi Trưởng nhóm gửi. (cross-layer)
- AC-7: Given dòng có tên chủ và số chủ, When ghi, Then chủ nhà vào qua cửa chủ nhà (ADR-0010): số chỉ ở dạng bản mã và dấu
  vết, liên hệ chủ nhà theo số — số đã thuộc một liên hệ của sàn thì gắn liên hệ ấy, không tạo liên hệ mới; không thân trả
  nào của API lần nhập, không kế hoạch đã lưu và không dòng nhập nào mang số chủ hay tên chủ ở dạng rõ. (cross-layer)
- AC-8: Given dòng có ô «Ngày xác nhận», When ghi, Then hàng nhận một sự kiện xác nhận mang đúng ngày ấy và độ tươi của hàng
  tính từ ngày ấy; ngày sau lúc ghi hay trước mốc hai năm thành ô cần người, không có sự kiện xác nhận; dòng không có cột
  ngày thì hàng «chưa xác nhận» — không dòng nào thành «vừa xác nhận hôm nay». (cross-layer)
- AC-9: Given người gọi API lần nhập, When mở lần nhập hay gửi gói, Then Đầu chủ và Trưởng nhóm được; vai khác nhận 403; dòng
  của Trưởng nhóm mang đầu chủ là thành viên sàn có vai Đầu chủ thì người ấy giữ căn, đầu chủ không hợp lệ thì dòng bỏ
  «chưa có đầu chủ giữ căn»; dòng file ghi Đã bán hay Ngừng hẳn không nhập. (cross-layer)
- AC-10: Given cùng một file chia nhiều gói, When gửi bản xem thử mọi gói rồi gửi bản ghi từng gói, Then hành động và đếm
  của bản xem thử bằng đúng của bản ghi, và bản xem thử không để lại hàng, sự kiện, lead, liên hệ hay dòng nhập nào. (cross-layer)
- AC-11: Given hàng «Chỉ tôi» mà người tạo khác đầu chủ giữ căn (Trưởng nhóm nhập cho Đầu chủ A), When A hay một thành viên
  khác của sàn đọc hàng, Then lõi trục ai thấy hàng cho A đọc được, thành viên khác vẫn không; hàng «Chỉ tôi» thường (người
  tạo giữ căn) đọc như cũ. (cross-layer)

## Coverage

Quét không gian tiêu chí (preset entity-feature × test-matrix, skill morphological-scan):

- Trục **hành động một dòng**: tạo | cập nhật | tin bổ sung | bỏ (sáu lý do) [thước CE: luật 20, ADR-0011 qđ 11, §6 — AC-1, AC-4, AC-6, AC-9]
- Trục **lớp dữ liệu chạm**: catalog | shareable_listing | company_internal | source [thước CE: bất biến 2, `FIELD_CLASS` — AC-2a, AC-7]
- Trục **người nhập**: Đầu chủ | Trưởng nhóm | vai khác | sàn khác [thước CE: ADR-0011 qđ 11, bất biến 1 — AC-3, AC-9, AC-11]
- Trục **lặp và lỗi**: lần đầu | gửi lại | gói quá cỡ | một dòng lỗi | xem thử | nhiều gói [thước CE: §6 «gửi lại không nhân đôi» — AC-5, AC-10]
- Trục **độ tươi**: có ngày hợp lệ | ngày ngoài khoảng | không cột ngày [thước CE: luật 11 — AC-8]
- Ba lỗi hàng 64 (luật 38) — AC-2.

## Out of scope

- Màn Nhập Excel, đọc tệp xlsx trên trình duyệt, xem trước từng ô — hàng `man-nhap-excel` (65b, G-4).
- Hoàn tác cả lần nhập (`reverted`, `voided`) — hàng 66, migration 025.
- Nhớ mẫu nhập của sàn (`import_templates`) — hàng 67; tác tử AI, ô lạ, từ điển của sàn — hàng 68–71 (luật 22).
- Gộp hai dòng trùng trong file thành một — màn 65b cho người chọn; hàng này giữ dòng đầu.
- Dòng tin bổ sung thiếu số hay giá: không gửi tin, chỉ ghi lý do ở dòng nhập.

## Notes

- Vùng: `packages/api/src/imports/**`, `packages/db/migrations/024_*.sql`, `packages/core/src/import/**`,
  `packages/core/test/import/**`; chạm thêm (yêu cầu `cham-tep` G-5, giám sát duyệt; `packages/core/src/visibility/**` xin thêm cho AC-11): `packages/core/src/listing/{events,fold}.ts`
  (+ test), `packages/api/src/{app,errors}.ts` (+ test), `packages/api/src/leads/store.ts` (tách phần ghi, không đổi hành
  vi), `packages/api/src/listings/store.ts` (`import_id`), `packages/api/test-db/imports/**`, `packages/db/tests/isolation.test.mjs`,
  `docs/product/{tham-chieu,doi-chieu-nganh}.md` (chỉ thêm dòng), `docs/plan/lo-trinh.json` (thêm hàng `man-nhap-excel`).
- Chồng tệp với `ghi-thiet-bi-va-mat-mang` (dãy D, migration 028): mỗi bên chỉ thêm trường của mình (G-5).
- Nguồn ba lỗi AC-2: Ngoài-2, Ngoài-4, Ngoài-5 của hàng 64 (luật 38).
