---
schema_version: 1
feature: Đầu chủ điền mã căn cho hàng tạo từ lead chỉ biết toà — mở hồ sơ căn của hàng chưa có mã, gắn mã một lần, máy chặn trùng hàng đang mở cùng căn; hàng có mã thì thôi báo thiếu mã căn và xét ảnh như thường
slug: dien-ma-can-cho-hang
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ui, web, api, db]
status: draft
design_doc: docs/superpowers/specs/2026-11-02-dien-ma-can-cho-hang-design.md
---

# Acceptance Contract: dien-ma-can-cho-hang

## Context

Hàng sau 23 (dãy G). Hàng 23 chốt «C»: hàng chưa có mã căn báo thiếu «mã căn», không lên Đang bán. Hôm nay không có
đường nào điền mã căn sau khi hàng đã tạo, và hồ sơ căn không mở được hàng chưa có mã. Bất biến chạm: 1 (cách ly giữa
công ty — kiểm trùng chỉ trong sàn, bảng sự kiện giữ luật theo dòng); không chạm lớp `source`.

## Criteria

### AC-1 — Sự kiện «gắn mã căn» của lõi
Given một hàng trong lõi
When nhận sự kiện `unit_number_assigned` với payload `{unitNumber}`
Then khuôn chặt nhận đúng một khoá `unitNumber` (chữ 1–200 ký tự), từ chối khoá lạ và khoá lớp chủ nhà; gấp hàng đặt
`unitNumber`; hàng đã có mã thì lõi từ chối với mã `unit-number-already-set`.

### AC-2 — Cơ sở dữ liệu nhận loại sự kiện mới (cross-layer)
Given cơ sở dữ liệu sau migration mới của hàng
When ghi một sự kiện `unit_number_assigned`
Then ràng buộc loại sự kiện nhận nó, loại lạ vẫn bị chặn; bộ kiểm cách ly giữa công ty xanh.

### AC-3 — API gắn mã căn (cross-layer)
Given đầu chủ có quyền sửa một hàng chưa có mã
When gửi `unit_number_assigned` qua `POST /api/v1/listings/{id}/events`
Then 201 và hàng mang mã mới; hàng đã có mã → 422 `unit-number-already-set`; sàn đã có hàng đang mở khác trên cùng
căn (cùng toà, mã so bằng `app.unit_key`; «đang mở» là tập `OPEN_STATUSES` của lõi) → 422 `unit-already-listed` kèm mã
hàng kia; hàng cùng căn ở trạng thái đóng không chặn;
hàng của sàn khác cùng căn không chặn; người không có quyền sửa hàng → 403.

### AC-4 — Sẵn sàng bán sau khi gắn mã
Given hàng vừa được gắn mã căn
When kiểm điều kiện lên Đang bán
Then «Còn thiếu» thôi nêu «Mã căn» và xét «Ảnh thật» như mọi hàng có mã.

### AC-5 — Hồ sơ căn mở được hàng chưa có mã
Given hàng chưa có mã trên máy
When mở hồ sơ theo địa chỉ `?hang=<mã hàng>`
Then hồ sơ hiện hàng ấy với ô «Mã căn» đánh dấu «Chưa có», ô nhập và nút «Lưu mã căn»; hàng đã có mã thì ô không hiện,
mã chỉ đọc.

### AC-6 — Lưu mã căn trong hồ sơ (cross-layer)
Given hồ sơ của hàng chưa có mã
When đầu chủ gõ mã và bấm «Lưu mã căn» (hay Enter)
Then lệnh đi qua hàng đợi lệnh trên máy; máy chủ nhận thì địa chỉ chuyển sang hồ sơ theo mã mới và «Còn thiếu» không còn
«Mã căn»; máy chủ từ chối (đang có mạng, hay sau khi có mạng lại) thì hàng trên máy trở về chưa có mã, lệnh rời hàng đợi
vào «Cần xem» với lý do của máy chủ («Căn này đã có hàng đang mở: <mã hàng>»), hồ sơ hiện lỗi ấy tại ô và giữ chữ đã gõ
khi còn mở; mã rỗng thì báo «Gõ mã căn», không gửi.

### AC-7 — Lối vào hồ sơ của hàng chưa có mã
Given hàng chưa có mã
When đầu chủ bấm dòng của nó ở Bảng hàng, dòng «Chưa có mã căn · <toà>» ở Hôm nay, hay «Mã căn» trong «Còn thiếu»
Then hồ sơ của hàng mở (hai lối đầu), con trỏ tới ô mã căn (lối thứ ba).

### AC-8 — Điện thoại
Given khổ 375
When mở hồ sơ hàng chưa có mã và gắn mã
Then ô và nút dùng được, không cuộn ngang.

### AC-9 — Ghi cách mới (judgment)
Given kho sau hàng
When đọc Tham chiếu và ADR
Then Tham chiếu ghi: mã căn gắn một lần ở hồ sơ căn, máy chặn trùng hàng đang mở cùng căn; ADR ghi loại sự kiện mới và
vì sao không mở `details_changed`.

## Coverage

Trục (morphological-scan, preset entity-feature): lớp (lõi · cơ sở dữ liệu · API · web) × trạng thái hàng (chưa mã ·
đã mã · trùng căn mở · trùng căn đã đóng · sàn khác) × lối vào (Bảng hàng · Hôm nay · Còn thiếu) × khổ (1440 · 375).
- Lõi: AC-1, AC-4. Cơ sở dữ liệu: AC-2. API: AC-3 (năm trạng thái hàng đủ). Web: AC-5, AC-6, AC-7, AC-8.
- Lối vào: AC-7 phủ cả ba. Khổ: AC-6 (1440), AC-8 (375). Tài liệu: AC-9.
- Thước CE: mỗi ô của trục trạng thái hàng có ít nhất một ca test máy (AC-3); mỗi lối vào có một ca test web và một khung
  xem bằng mắt.

## Out of scope

- Sửa hay gỡ mã căn đã gắn (đặt nhầm) — mã căn là thuộc tính căn, đã có thì khoá; việc riêng nếu cần (Hỏi-3).
- Gộp hai hàng trùng căn, hay ràng buộc duy nhất (toà, mã) ở tầng dữ liệu cho hàng mở — dữ liệu cũ có thể đã trùng.
- Thêm căn vào danh mục dùng chung — danh mục do OneHub Invest cấp, sàn chỉ đọc.
- Gắn lại ảnh đã tải trước khi có mã — hàng chưa mã không tải ảnh được (ảnh gắn theo toà + mã).

## Notes

- Vùng: `ranh_gioi` của hàng ở `hang-viec.json`, cộng migration 020, ADR-0026, Tham chiếu, Hôm nay (một liên kết), sẵn
  sàng bán (một liên kết), hàng đợi lệnh trên máy nếu cần loại lệnh mới — khai ở Cổng Phạm vi.
