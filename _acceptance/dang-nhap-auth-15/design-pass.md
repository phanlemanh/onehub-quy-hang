---
slug: dang-nhap-auth-15
at: 2026-11-04T05:30:00Z
route: http://localhost:3492/login
material: real-components
context: standalone
context_scenes: [dang-nhap-1440, dang-nhap-375, ma-loi-375, chon-san-375, chua-gan-375]
reaction: nac-1 (không đồng bộ — máy dựng, tự chụp, gửi ảnh kèm thẻ Cổng Phạm vi)
options: [reui]
divergence: skipped — khối đích auth-15 đã chủ kho chọn 02/11 từ ảnh so (vo-va-ia §2); nhóm xac-thuc đã có, không thêm dòng Chỗ hở
ds_skill: quy-hang-ui
states: [mac-dinh, loi]
breakpoints: [desktop-1440, mobile-375]
themes: [light, dark]
patched: 0
deferred: 0
---
# design-pass — dang-nhap-auth-15

Bản chạy thật trên chỗ thử dãy B (dev 3492, dữ liệu mẫu, người mẫu `hai-san@…` hai sàn và `chua-gan@…` chưa gắn sàn
dựng bằng `thu/nguoi-mau.mjs`). Trình duyệt sạch, không phiên cũ.

## Ma trận capture

| Ảnh | Màn · trạng thái | Khổ · nền |
|---|---|---|
| `design-pass/dang-nhap-1440.png` | Đăng nhập · ô email | 1440 · sáng |
| `design-pass/dang-nhap-1440-toi.png` | Đăng nhập · ô email | 1440 · tối |
| `design-pass/dang-nhap-375.png` | Đăng nhập · ô email | 375 · sáng |
| `design-pass/ma-loi-1440.png`, `ma-loi-375.png` | Đăng nhập · mã sai | 1440, 375 · sáng |
| `design-pass/chon-san-1440.png`, `chon-san-375.png` | Chọn sàn làm việc | 1440 sáng, 375 tối |
| `design-pass/chua-gan-1440.png`, `chua-gan-375.png` | Chưa thuộc sàn nào | 1440, 375 · sáng |

Đo kèm: `scrollWidth` bằng đúng bề rộng ở mọi ảnh (không cuộn ngang); chữ trang không chứa Google, Apple, GitHub hay
«tiếp tục với».

## Findings

- Không lệch so với khối: một cột giữa trang, tiêu đề lớn, ô có biểu tượng, nút rộng trọn cột, chân điều khoản ở đáy.
- Lỗi mã sai nằm dưới ô mã, lời dặn «Đã gửi mã tới …» vẫn ở trên lỗi.
