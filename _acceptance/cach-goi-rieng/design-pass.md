---
slug: cach-goi-rieng
at: 2026-11-05T13:31:00Z
route: http://localhost:3492/settings/labels/mau
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — ảnh gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3492 của dãy B khi đăng nhập quản trị mẫu, ?state=da-dat|loi-o)
options:
divergence: skipped — màn đi khuôn cai-dat-san sẵn có (MucCaiDat + SettingField của settings-3, khối đích ở vo-va-ia.md); không có hướng thứ hai
ds_skill: quy-hang-ui
states: [mac-dinh, da-dat, da-luu, loi-o]
breakpoints: [mobile-375, desktop-1440]
themes: [dark]
patched: 3
deferred: 1
---
# design-pass — cach-goi-rieng

Bản mẫu dựng bằng thân màn thật (`settings/labels/cach-goi.tsx`) trong khuôn `MucCaiDat` của vỏ thật (đăng nhập quản trị
mẫu, Postgres dãy B), dữ liệu giả, lưu giả — không đường ghi. Trang mẫu `apps/web/src/app/(app)/settings/labels/mau/`
không vào commit; màn thật ở `/settings/labels` dùng đúng thân này. Ở đường con `/mau` mục «Cách gọi» của cột thứ hai
không sáng (cột chỉ sáng khi khớp đúng đường) — màn thật sáng đúng, đo ở E11.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| mac-dinh | desktop-1440 | dark | evidence/design-pass/mac-dinh--desktop-1440.jpg |
| da-dat | desktop-1440 | dark | evidence/design-pass/da-dat--desktop-1440.jpg |
| da-luu | desktop-1440 | dark | evidence/design-pass/da-luu--desktop-1440.jpg |
| loi-o | desktop-1440 | dark | evidence/design-pass/loi-o--desktop-1440.jpg |
| da-dat | mobile-375 | dark | evidence/design-pass/da-dat--mobile-375.jpg |
| da-dat (giá trị riêng) | mobile-375 | dark | evidence/design-pass/gia-tri-rieng--mobile-375.jpg |

## Cảnh ngữ-cảnh

- Không cần: `host-embedded` — màn chạy trong vỏ thật; ảnh khổ máy tính đủ cột nhà, cột thứ hai (Cá nhân · Sàn [Mẫu]
  Sàn thử với bảy mục) và thanh trên.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ảnh lượt đầu thiếu cột thứ hai của vỏ (chủ kho chỉ ra sau Cổng Phạm vi): bản mẫu chạy ở `/proto/cach-goi-rieng`, đường
  không thuộc nhà nào nên vỏ không dựng cột thứ hai. Chuyển bản mẫu về `/settings/labels/mau`, chụp lại khổ 1440.

- Nhãn nhóm «Tên trường» bằng `FieldSeparator` đè lên mép trên của khung — đổi sang `FieldSet` + `FieldLegend` có lề.
- Tiêu đề khung trùng tiêu đề màn («Cách gọi» hai lần) — tiêu đề khung đổi thành «Tên của sàn».

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Chữ gợi ý (tên mặc định) trong ô trống chỉ khác chữ đã gõ ở độ đậm màu — người đọc lướt có thể tưởng ô đã có tên riêng;
  dòng mô tả «Đang dùng tên mặc định» / «Mặc định «…»» bù lại. Đổi kiểu chữ gợi ý là việc của thành phần `Input` nền.
