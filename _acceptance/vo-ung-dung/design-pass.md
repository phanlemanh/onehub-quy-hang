---
slug: vo-ung-dung
at: 2026-10-30T23:40:00Z
route: http://localhost:3462/proto/vo-ung-dung/today?vai=listing_agent
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — gói ảnh gửi chủ kho qua phiên giám sát, bản chạy mở được ở cổng 3462)
options:
divergence: skipped — vỏ điện thoại theo đúng bố cục §9 (thanh trên mảnh · bốn tab dưới), không còn hướng bố cục nào mở; chỉ còn câu Hỏi-4 về hình
ds_skill: quy-hang-ui
states: [telesales, dau-chu, dau-khach, truong-nhom, chi-quan-tri, nhieu-vai, ho-so-can, go-ma-can]
breakpoints: [mobile-375]
themes: [light, dark]
patched: 4
deferred: 1
---
# design-pass — vo-ung-dung

Chỉ vỏ điện thoại (Hỏi-4: chủ kho chọn «dựng bản bấm được trước»). Vỏ là mã thật — bảng vai ở `packages/core`, vỏ ở
`apps/web/src/components/shell/` — đặt dưới đường bản mẫu `/proto/vo-ung-dung` chỉ chạy ở máy dev, không đăng nhập,
vai chọn bằng `?vai=`. Nội dung mỗi nhà là trang giữ chỗ. Vỏ máy tính không có trong phiên này (khối `app-shell-8`,
chủ kho đã bấm thử bản xem trước).

## Ma trận capture

| state | breakpoint | theme | file |
|---|---|---|---|
| telesales — Hôm nay | mobile-375 | light | evidence/design-pass/telesales--mobile-375--light.png |
| telesales — Hôm nay | mobile-375 | dark | evidence/design-pass/telesales--mobile-375--dark.png |
| dau-chu — Hôm nay | mobile-375 | light | evidence/design-pass/dau-chu--mobile-375--light.png |
| dau-chu — Hôm nay | mobile-375 | dark | evidence/design-pass/dau-chu--mobile-375--dark.png |
| dau-khach — Bảng hàng | mobile-375 | light | evidence/design-pass/dau-khach--mobile-375--light.png |
| dau-khach — Bảng hàng | mobile-375 | dark | evidence/design-pass/dau-khach--mobile-375--dark.png |
| truong-nhom — Gửi | mobile-375 | light | evidence/design-pass/truong-nhom--mobile-375--light.png |
| truong-nhom — Gửi | mobile-375 | dark | evidence/design-pass/truong-nhom--mobile-375--dark.png |
| chi-quan-tri — Cài đặt sàn | mobile-375 | light | evidence/design-pass/chi-quan-tri--mobile-375--light.png |
| chi-quan-tri — Cài đặt sàn | mobile-375 | dark | evidence/design-pass/chi-quan-tri--mobile-375--dark.png |
| nhieu-vai (Trưởng nhóm + Quản trị) — Hôm nay | mobile-375 | light | evidence/design-pass/nhieu-vai--mobile-375--light.png |
| nhieu-vai (Trưởng nhóm + Quản trị) — Hôm nay | mobile-375 | dark | evidence/design-pass/nhieu-vai--mobile-375--dark.png |
| ho-so-can MAU-A1205 | mobile-375 | light | evidence/design-pass/ho-so-can--mobile-375--light.png |
| ho-so-can MAU-A1205 | mobile-375 | dark | evidence/design-pass/ho-so-can--mobile-375--dark.png |
| go-ma-can (Đầu chủ gõ «mau-a1205») | mobile-375 | light | evidence/design-pass/go-ma-can--mobile-375--light.png |
| go-ma-can (Đầu chủ gõ «mau-a1205») | mobile-375 | dark | evidence/design-pass/go-ma-can--mobile-375--dark.png |
| tổng quan 8 màn | mobile-375 | light | evidence/design-pass/tong-quan--mobile-375--light.png |
| tổng quan 8 màn | mobile-375 | dark | evidence/design-pass/tong-quan--mobile-375--dark.png |

## Cảnh ngữ-cảnh

- Không cần: `context: host-embedded` — vỏ là chính đơn vị host, render bằng mã thật.

## Findings

### Nhóm 1 — vá-được-trong-từ-vựng-token (đã vá tại chỗ)

- Ô gõ mã căn sập khi mở (thiếu khung `Command` quanh ô nhập) — đã bọc, mở và gõ được.
- Rà chữ trên vỏ với CONTEXT.md: mười nhãn của vỏ (Nhà, Hôm nay, Đã gửi · Gửi, Đội, Cài đặt sàn, Tôi, Gõ mã căn, Hồ sơ
  căn, Nhập Excel, Phát hàng) có ở Tham chiếu §9 nhưng chưa có dòng trong từ vựng — đã thêm, kèm tên code.
- Trang giữ chỗ viết «dựng ở hàng N của lộ trình», trong khi «Hàng» ở từ vựng là một lần chào bán — đã đổi thành
  «mục N»; trang lạc đường thôi lấy «Quỹ hàng» làm tiêu đề (từ vựng cấm dùng tên app cho một nhà).
- Tab dưới bỏ `Button` ép chiều cao (luật ReUI cấm `h-*` trên Button) — dùng `Link` có `aria-current`, chữ `text-xs`.

### Nhóm 2 — đòi-đổi-DS/component (chờ Gate 1)

- Tab đang mở chỉ khác bằng độ đậm của chữ và icon (foreground so với muted-foreground); không có vạch hay nền. Muốn
  dấu rõ hơn (vạch trên tab, nền nhạt) là thêm một mẫu tab dưới cho kho — chờ chủ kho nói có cần không.
