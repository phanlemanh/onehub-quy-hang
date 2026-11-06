---
slug: truong-rieng-toi-thieu
at: 2026-11-06T07:05:00Z
route: http://localhost:3492/settings/fields/mau
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — ảnh gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3492 của dãy B khi đăng nhập quản trị mẫu, ?state=trong|co|du)
options:
divergence: skipped — màn đi khuôn cai-dat-san sẵn có (MucCaiDat + SettingField của settings-3), anh em với Cách gọi (hàng 45) và Trạng thái (hàng 46); không có hướng thứ hai
ds_skill: quy-hang-ui
states: [trong, co, du-20, trung-nghia, loi-o, tao-lien-he, hoi-bo, da-luu]
breakpoints: [mobile-375, desktop-1440]
themes: [dark]
patched: 1
deferred: 2
---
# design-pass — truong-rieng-toi-thieu

Bản mẫu dựng bằng thân màn thật (`settings/fields/truong-rieng.tsx` + phần thuần `truong-rieng-thuan.ts` gọi lõi
`@quy-hang/core/custom-fields`) trong khuôn `MucCaiDat` của vỏ thật (đăng nhập quản trị mẫu, Postgres dãy B), dữ liệu giả,
lưu giả — không đường ghi. Trang mẫu `settings/fields/mau/` không vào commit (luật đợt 73: đặt dưới đúng nhà của màn, đủ
cột vỏ). Cột Bảng hàng và mục hồ sơ liên hệ đi khuôn sẵn có (lưới ADR-0004, `MucHoSo`) nên không dựng bản mẫu riêng — đo ở
E12, E13.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| trong | desktop-1440 | dark | evidence/design-pass/trong--desktop-1440--dark.png |
| co | desktop-1440 | dark | evidence/design-pass/co--desktop-1440--dark.png |
| du-20 | desktop-1440 | dark | evidence/design-pass/du-20--desktop-1440--dark.png |
| trung-nghia | desktop-1440 | dark | evidence/design-pass/trung-nghia--desktop-1440--dark.png |
| loi-o | desktop-1440 | dark | evidence/design-pass/loi-o--desktop-1440--dark.png |
| tao-lien-he | desktop-1440 | dark | evidence/design-pass/tao-lien-he--desktop-1440--dark.png |
| hoi-bo | desktop-1440 | dark | evidence/design-pass/hoi-bo--desktop-1440--dark.png |
| da-luu | desktop-1440 | dark | evidence/design-pass/da-luu--desktop-1440--dark.png |
| co | mobile-375 | dark | evidence/design-pass/co--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu chạy trong vỏ thật, đủ cột nhà và cột thứ hai Cài đặt.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Câu máy dò «Đã có trường «Hướng» — đổi tên ở Cách gọi» làm tiêu đề khối báo bị cắt «…»: tiêu đề đổi thành «Trùng nghĩa một
  trường chuẩn», câu đủ chuyển xuống mô tả kèm nút «Mở Cách gọi».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Trường «chọn một» nhiều lựa chọn làm dòng cao (mỗi lựa chọn một ô chữ); 30 lựa chọn sẽ dài — nếu sàn thấy dài thì gom
  lựa chọn thành một danh sách gập (đổi cấu trúc khối, không làm ở vòng này).
- Ô loại liên hệ xuống dòng ở khổ hẹp của cột ô (bốn ô đánh dấu) — đọc được, chưa gọn; giữ khuôn SettingField.
