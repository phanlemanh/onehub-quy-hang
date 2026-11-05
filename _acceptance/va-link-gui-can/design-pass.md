---
slug: va-link-gui-can
at: 2026-11-05T13:46:00Z
route: http://localhost:3460/shares · http://localhost:3460/today
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-0 (ghim — khuôn có sẵn, 0 hướng mở; để vết một dòng, người veto sau)
options:
divergence: skipped — không màn, khối hay chữ mới; hai trạng thái trống và bảng thẻ đi khuôn trang-thai sẵn có
ds_skill: quy-hang-ui
states: [dg-trong, hndk-trong, bang-hang-tu-dg-trong, bang-hang-tu-hndk-trong]
breakpoints: [mobile-375, desktop-1280]
themes: [light]
patched: 0
deferred: 1
---
# design-pass — va-link-gui-can

Vật là sản phẩm thật đang chạy (chỗ thử `_acceptance/va-link-gui-can/thu/dung.mjs`, Đầu khách mẫu, không hàng, không Lần
gửi). Việc chỉ đổi đích của hai nút sẵn có; ma trận chụp màn trước khi bấm và màn tới sau khi bấm, ở hai khổ.

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| dg-trong | mobile-375 | light | evidence/design-pass/dg-trong--mobile-375--light.png |
| bang-hang-tu-dg-trong | mobile-375 | light | evidence/design-pass/bang-hang-tu-dg-trong--mobile-375--light.png |
| hndk-trong | mobile-375 | light | evidence/design-pass/hndk-trong--mobile-375--light.png |
| bang-hang-tu-hndk-trong | mobile-375 | light | evidence/design-pass/bang-hang-tu-hndk-trong--mobile-375--light.png |
| dg-trong | desktop-1280 | light | evidence/design-pass/dg-trong--desktop-1280--light.png |
| bang-hang-tu-dg-trong | desktop-1280 | light | evidence/design-pass/bang-hang-tu-dg-trong--desktop-1280--light.png |
| hndk-trong | desktop-1280 | light | evidence/design-pass/hndk-trong--desktop-1280--light.png |
| bang-hang-tu-hndk-trong | desktop-1280 | light | evidence/design-pass/bang-hang-tu-hndk-trong--desktop-1280--light.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — chụp trong vỏ thật của ứng dụng, thanh dưới và thanh trên đều là thật.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Không có — vòng không đổi gì nhìn thấy được ngoài trang tới sau khi bấm.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Trạng thái trống của bảng thẻ (`inventory/cards/bang-the.tsx`, hàng 32): nút «Về Hôm nay» dựng một link trong `Button`
  mà thiếu `nativeButton={false}`, console báo cảnh báo Base UI về ngữ nghĩa nút. Không thuộc hai nút của vòng này — đề
  xuất ghi Known limits, sửa ở việc riêng của hàng 32.
