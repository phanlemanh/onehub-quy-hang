---
slug: dien-ma-can-cho-hang
at: 2026-11-02T07:56:24Z
route: http://localhost:3484/inventory/ban-mau-dien-ma-can
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (anh-gui-kem)
options:
divergence: skipped — ô mới nằm trong mục «Thuộc tính căn» của khuôn hồ sơ căn đã có (hàng 17, solution-crm-4); ghép Field + Input + Button như các ô sửa khác, không đổi khối đích, không thêm «Chỗ hở»
ds_skill: quy-hang-ui
states: [chua-co, ma-rong, trung-can, dang-luu, da-gan]
breakpoints: [mobile-375, desktop-1440]
themes: [dark]
patched: 3
deferred: 0
---
# design-pass — dien-ma-can-cho-hang

Bản bấm được ở `/inventory/ban-mau-dien-ma-can` (đặt dưới /inventory để vỏ nhận nhà Bảng hàng và hiện cột thứ hai như
màn thật; `/proto/<slug>` không thuộc nhà nào nên vỏ không có cột thứ hai). Nút lưu GIẢ: mã `A-12.05` (so như
`app.unit_key`, kể cả `a12-05`) giả làm căn đã có hàng đang mở H-0142; mã khác chờ 0,9 giây rồi nhận. `?tt=` dựng sẵn
từng trạng thái để chụp.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| chua-co | desktop-1440 | dark | evidence/design-pass/chua-co--desktop-1440.png |
| ma-rong | desktop-1440 | dark | evidence/design-pass/ma-rong--desktop-1440.png |
| trung-can | desktop-1440 | dark | evidence/design-pass/trung-can--desktop-1440.png |
| dang-luu | desktop-1440 | dark | evidence/design-pass/dang-luu--desktop-1440.png |
| da-gan | desktop-1440 | dark | evidence/design-pass/da-gan--desktop-1440.png |
| chua-co | mobile-375 | dark | evidence/design-pass/chua-co--mobile-375.png |
| trung-can | mobile-375 | dark | evidence/design-pass/trung-can--mobile-375.png |
| da-gan | mobile-375 | dark | evidence/design-pass/da-gan--mobile-375.png |

## Cảnh ngữ-cảnh

- Không cần: vật nhúng trong vỏ thật (host-embedded) — ảnh 1440 có thanh nhà, cột thứ hai, Bảng hàng và hồ sơ.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Đường `/proto/<slug>` mất cột thứ hai của vỏ — chuyển bản bấm được xuống `/inventory/ban-mau-dien-ma-can`.
- Bản máy tính và bản điện thoại cùng dựng trên trang làm trùng id ô nhập — id riêng mỗi bản.
- Hồ sơ toàn màn trên điện thoại có nút đóng — bỏ, như `/units/<mã>`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

