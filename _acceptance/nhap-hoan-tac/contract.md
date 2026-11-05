---
schema_version: 1
feature: "Hoàn tác cả lần nhập (hàng 66): Đầu chủ hoàn tác cả một lần nhập; căn đã có người sửa sau đó được liệt kê, không bị gỡ; gộp Ngoài-3/4/5 của hàng 67 (luật 54)"
slug: nhap-hoan-tac
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, api]
status: verified
design_doc: docs/superpowers/specs/2026-11-05-nhap-hoan-tac-design.md
approved_by: Manh Phan
approved_at: 2026-11-05
---

# Acceptance Contract: nhap-hoan-tac

## Context

Màn Nhập Excel (hàng 65) ghi một lần nhập thành sự kiện của hàng, mỗi sự kiện mang `import_id` (migration 024). Hàng 66 cho
người nhập hoàn tác cả lần nhập bằng **sự kiện bù**, giữ lịch sử (ADR-0011 quyết định 8, luật 22 của đợt): hàng do lần nhập
tạo nhận sự kiện mới `voided` — một cờ khi gấp, không phải trạng thái thứ bảy — và ra khỏi mọi danh sách; hàng có sẵn mà
lần nhập đổi giá nhận sự kiện trả giá cũ; căn đã có người sửa sau lần nhập không bị gỡ, được liệt kê. Đổi khuôn sự kiện
của ADR-0008 và thêm migration 025 nên hạng T3. Thiết kế: `docs/superpowers/specs/2026-11-05-nhap-hoan-tac-design.md`.

Gộp ba mục chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 67 (luật 54 của đợt): Ngoài-3, Ngoài-4, Ngoài-5 —
AC-9, AC-10, AC-11.

Dữ liệu mẫu: `[Tên]`, `0900 000 0xx`, `[Tên sàn]`.

## Criteria

- **AC-1 — Gỡ hàng do lần nhập tạo.** (cross-layer) Given lần nhập đã ghi tạo ba hàng (một Chưa đủ để rao, một Đang bán,
  một Giữ chỗ), chưa ai sửa sau · When người nhập hoàn tác lần nhập · Then mỗi hàng nhận đúng một sự kiện `voided`, mọi sự
  kiện cũ còn nguyên (số sự kiện tăng đúng 1, không dòng nào bị xoá), `standardStatus` không đổi, và hàng không còn ở Bảng
  hàng, Hôm nay của đầu khách, Đã gửi, kiểm trùng hàng mở; trang khách của căn ấy báo căn không còn.
- **AC-2 — Trả giá cũ cho hàng có sẵn.** (cross-layer) Given lần nhập đổi giá và điều kiện phí của một hàng có sẵn · When
  hoàn tác · Then hàng nhận một sự kiện `price_changed` mang đúng giá và điều kiện phí trước lần nhập, không tính là xác nhận
  với chủ nhà (độ tươi không đổi vì sự kiện bù), sự kiện bù không mang `import_id` của lần nhập.
- **AC-3 — Căn đã có người sửa sau thì không gỡ.** (cross-layer) Given sau lần nhập có người (kể cả chính người nhập) ghi
  thêm một sự kiện bất kỳ lên một hàng lần nhập tạo và một hàng lần nhập đổi giá · When hoàn tác · Then hai hàng ấy không
  nhận sự kiện nào, kết quả liệt kê toà, mã căn và lý do «Đã có người sửa sau lần nhập»; các hàng còn lại vẫn được hoàn tác.
- **AC-4 — Phần không hoàn tác được nói rõ.** (cross-layer) Given lần nhập có dòng tin bổ sung, dòng chỉ xác nhận ngày (không đổi giá) và
  dòng đổi giá cho căn trước đó chưa có giá · When hoàn tác · Then không ghi gì cho ba dòng ấy, kết quả liệt kê mỗi dòng
  đúng một lý do: «Tin bổ sung đã gửi — không thu lại» · «Độ tươi theo ngày trong file vẫn giữ» · «Trước lần nhập căn chưa có
  giá»; dòng bỏ qua không hiện.
- **AC-5 — Xem trước rồi mới ghi.** (cross-layer) Given lần nhập đã ghi · When người bấm «Hoàn tác» · Then hộp xác nhận hiện
  «Gỡ N căn khỏi Quỹ hàng · Trả giá cũ cho M căn · K căn không hoàn tác được» kèm danh sách K căn, chưa ghi sự kiện nào; xác
  nhận thì ghi đúng như xem thử nói (cùng số, cùng căn) khi không ai sửa giữa chừng; huỷ thì không ghi gì. Không căn nào
  hoàn tác được thì nút xác nhận tắt kèm «Không có căn nào hoàn tác được»; đang ghi thì nút khoá; lỗi giữa chừng hiện
  «Hoàn tác chưa xong — bấm lại để làm tiếp».
- **AC-6 — Một lần, gọi lại được, chỉ người nhập.** (cross-layer) Given lần hoàn tác đứt sau một phần các dòng · When gọi lại
  · Then chỉ dòng chưa làm được làm, không hàng nào nhận sự kiện bù thứ hai, lần nhập thành «Đã hoàn tác» khi xong mọi dòng;
  gọi lại lần nhập đã hoàn tác trả kết quả đã ghi, không ghi thêm; người khác cùng sàn (kể cả Trưởng nhóm) nhận 404, sàn
  khác không thấy lần nhập (cách ly), vai không nhập nhận 403.
- **AC-7 — `voided` là cờ, không phải trạng thái.** Given dãy sự kiện có `voided` · When gấp lại (lõi, bảng `listings`, bộ
  đồng bộ trên máy) · Then trạng thái chuẩn giữ nguyên, `voided = true`; xoá trắng bảng `listings` rồi gấp lại ra đúng bảng
  cũ (cả cột `voided`); lệnh sửa thường (`applyCommand`) không ghi được `voided`; payload có khoá lạ bị từ chối; bộ đồng bộ
  trên máy bỏ hàng `voided` khỏi danh sách ở lượt kéo kế, và lệnh sửa máy gửi lên hàng đã gỡ bị từ chối như hàng không có;
  lần nhập sau cùng căn tạo hàng mới thay vì cập nhật hàng đã gỡ.
- **AC-8 — Lối vào hoàn tác trên màn.** Given người nhập vừa ghi xong hay quay lại màn Nhập sau đó · When nhìn bước 5 và
  danh sách «Lần nhập gần đây» ở bước 1 · Then bước 5 có nút «Hoàn tác lần nhập này», danh sách có tối đa 10 lần nhập đã
  ghi của chính người ấy, mới nhất trước, lần đã hoàn tác mang nhãn «Đã hoàn tác» không nút; đủ trạng thái trống, đang tải,
  lỗi; ở 1440 và 375.
- **AC-9 — Sửa ô bị cờ xung đột không học thành cách gọi (Ngoài-3 hàng 67).** Given ô «cần người» vì xung đột (phí trong ô
  giá, lệch danh mục, mâu thuẫn hai cột) và ô «cần người» vì giá trị lạ trong cùng cột trường giá trị đóng · When sửa từng ô
  · Then sửa ô xung đột chỉ đổi đúng ô ấy — bảng quy đổi của kế hoạch không đổi, ô cùng chữ ở dòng khác không đổi, kế hoạch
  ghi xuống không mang cặp ấy; sửa ô giá trị lạ vẫn thành cách gọi như hàng 67.
- **AC-10 — Hai cột không cùng đích (Ngoài-4 hàng 67).** Given bộ nhớ đưa cột A vào một đích và từ điển đưa cột B (đứng sau
  hay đứng trước A) vào cùng đích · When dựng kế hoạch · Then cột theo mẫu giữ đích, cột kia về «chưa rõ» kèm câu hỏi «Cột
  B trùng đích với cột theo mẫu A»; kế hoạch qua `validatePlan`, không cột nào bị bỏ lặng — ở cả hai thứ tự cột.
- **AC-11 — Chọn tệp trước khi mẫu tải xong (Ngoài-5 hàng 67).** Given mẫu đã nhớ chưa tải xong · When người chọn tệp · Then
  màn chờ mẫu, hiện «Đang tải mẫu đã nhớ…», tải xong thì ghép theo mẫu như khi mẫu đã có sẵn; tải lỗi thì ghép theo từ điển
  và báo «Không đọc được mẫu đã nhớ».

## Coverage

Quét không gian tiêu chí (preset entity-feature × test-matrix, skill morphological-scan):

- Trục **dòng của lần nhập**: tạo hàng | cập nhật hàng có sẵn | tin bổ sung | bỏ qua [thước CE: `import_rows.action`
  migration 024, `lamDong` — AC-1, AC-2, AC-4]
- Trục **sự kiện lần nhập ghi**: tạo | đổi giá | xác nhận theo ngày | đổi trạng thái [thước CE: `lamDong` — AC-1, AC-2, AC-4]
- Trục **sau lần nhập**: chưa ai sửa | người khác sửa | chính người nhập sửa | trạng thái cuối (Đã bán) [thước CE: ADR-0011
  qđ 8 «dòng đã có người sửa sau lần nhập thì không hoàn tác» — AC-3]
- Trục **lần gọi**: xem thử | ghi | đứt giữa chừng rồi gọi lại | gọi lại khi đã xong [thước CE: luật một đường ghi, savepoint
  của `writeBatch` — AC-5, AC-6]
- Trục **người gọi**: người nhập | người khác cùng sàn | Trưởng nhóm | sàn khác | vai không nhập [thước CE: bất biến 1, luật
  dòng của `imports` — AC-6]
- Trục **người đọc hàng đã gỡ**: Bảng hàng | Hôm nay | Đã gửi | kiểm trùng | trang khách | máy ngoại tuyến | gấp lại [thước
  CE: danh sách chỗ đọc `listings` trong `packages/api/src`, bất biến 4 — AC-1, AC-7]
- Trục **mẫu × màn** (luật 54): ô xung đột | ô giá trị lạ · mẫu trước/sau từ điển · mẫu chưa tải/đã tải/lỗi [thước CE:
  review-findings Ngoài-3/4/5 hàng 67 — AC-9, AC-10, AC-11]

## Đường đo

Bỏ ở vòng này theo Hỏi-5 (ô cơ hội hàng 66 chưa khai ngưỡng). Lối khác nếu người chọn: lệnh đo đọc `imports.status` và
`import_rows.undo_outcome` — tỉ lệ lần nhập bị hoàn tác, tỉ lệ căn «đã sửa sau»; ngưỡng đề xuất SỐNG ≤ 10% lần nhập bị hoàn tác.

## Out of scope

- Hoàn tác từng dòng hay một phần lần nhập.
- Trưởng nhóm hoàn tác lần nhập của người khác.
- Gỡ liên hệ chủ nhà lần nhập đã tạo (hàng 85) — liên hệ ở lại sàn, lớp `source`.
- Bỏ gỡ (khôi phục) một hàng đã gỡ.
- Hạ độ tươi lần nhập đã nâng ở hàng có sẵn; thu lại tin bổ sung đã gửi (theo Hỏi-1, Hỏi-2).
- Màn lịch sử lần nhập đầy đủ (lọc, tìm, xem từng dòng) — hàng 50.

## Notes

- Vùng: `packages/core/src/listing/**`, `packages/api/src/imports/**`, `packages/api/src/listings/**`,
  `packages/api/src/{today-buyer,da-gui,public}/**` (lọc hàng đã gỡ), `packages/db/migrations/025_*`,
  `apps/web/src/app/(app)/imports/new/**`, `apps/web/src/lib/nhap/**`, `apps/web/src/lib/sync/**`,
  `packages/core/src/import/memory/**`.
- Migration 025: số giám sát giữ cho hàng 66 (luật 25 của đợt).
- Nguồn AC-9..11: Ngoài-3/4/5 hàng 67 (`_acceptance/nhap-nho-mau/review-findings.md`), luật 54.
