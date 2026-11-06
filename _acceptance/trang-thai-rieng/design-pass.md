---
slug: trang-thai-rieng
at: 2026-11-05T21:30:00Z
route: http://localhost:3492/settings/statuses/mau
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — ảnh gửi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3492 của dãy B khi đăng nhập quản trị mẫu, ?state=mac-dinh|co-nhan|du-ba)
options:
divergence: skipped — màn đi khuôn cai-dat-san sẵn có (MucCaiDat + SettingField của settings-3), anh em với màn Cách gọi (hàng 45); không có hướng thứ hai
ds_skill: quy-hang-ui
states: [mac-dinh, co-nhan, du-ba, loi-o, hoi-thay, da-luu]
breakpoints: [mobile-375, desktop-1440]
themes: [dark]
patched: 2
deferred: 1
---
# design-pass — trang-thai-rieng

Bản mẫu dựng bằng thân màn thật (`settings/statuses/trang-thai.tsx` + phần thuần `trang-thai-thuan.ts` gọi lõi
`@quy-hang/core/statuses`) trong khuôn `MucCaiDat` của vỏ thật (đăng nhập quản trị mẫu, Postgres dãy B), dữ liệu giả, lưu
giả — không đường ghi. Trang mẫu `apps/web/src/app/(app)/settings/statuses/mau/` không vào commit; màn thật ở
`/settings/statuses` dùng đúng thân này. Ở đường con `/mau` mục «Trạng thái» của cột thứ hai không sáng (cột chỉ sáng khi
khớp đúng đường) — màn thật sáng đúng, đo ở E11.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| mac-dinh | desktop-1440 | dark | evidence/design-pass/mac-dinh--desktop-1440--dark.png |
| co-nhan | desktop-1440 | dark | evidence/design-pass/co-nhan--desktop-1440--dark.png |
| du-ba | desktop-1440 | dark | evidence/design-pass/du-ba--desktop-1440--dark.png |
| loi-o | desktop-1440 | dark | evidence/design-pass/loi-o--desktop-1440--dark.png |
| hoi-thay | desktop-1440 | dark | evidence/design-pass/hoi-thay--desktop-1440--dark.png |
| da-luu | desktop-1440 | dark | evidence/design-pass/da-luu--desktop-1440--dark.png |
| co-nhan | mobile-375 | dark | evidence/design-pass/co-nhan--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — bản mẫu chạy trong vỏ thật, đủ cột nhà và cột thứ hai Cài đặt.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Mỗi dòng nhãn lặp câu «Neo vào … — nhận luật và màu của trạng thái này» làm form dài và nhiễu: rút về tiêu đề «Nhãn riêng»
  + mô tả «[n] căn đang mang»; câu «nhãn riêng nhận luật và màu này» chuyển lên một lần cạnh huy hiệu của nhóm.
- Hộp hỏi nhãn thay: bấm «Gỡ và chuyển» cũng đóng hộp và lượt đóng ấy từng hoàn lại việc gỡ — thêm cờ xác nhận để đóng sau
  khi chọn không hoàn lại (đã kiểm: gỡ «Giữ chỗ», chọn «Đang giao dịch», Lưu mở khoá).

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Mỗi nhóm một nút «Thêm nhãn» riêng (sáu nút) — ổn với sáu trạng thái; nếu sàn thấy dài thì gom thành một nút «Thêm
  nhãn» có chọn trạng thái neo (đổi cấu trúc khối, không làm ở vòng này).
