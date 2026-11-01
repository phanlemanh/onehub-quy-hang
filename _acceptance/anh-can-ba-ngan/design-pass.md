---
slug: anh-can-ba-ngan
at: 2026-11-01T08:20:00Z
route: http://localhost:3482/proto/anh-can-ba-ngan
material: real-components
context: host-embedded
context_scenes: []
reaction: nac-1 (ghim — ảnh trạng thái đi kèm thẻ Cổng Phạm vi; bản chạy mở được ở cổng 3482 của dãy H khi đăng nhập Đầu chủ mẫu, ?vai=khac xem như người không giữ căn)
options: [reui-ghep]
divergence: closed — màn thứ hai của nhóm Hồ sơ căn, đi khuôn ho-so-can (ADR-0019 chỉ đòi ba lối cho màn đầu của nhóm mới)
ds_skill: quy-hang-ui
states: [mac-dinh, tha-hai-tep, noi-bo, tu-co-tu-ma, noi-bo-khoa, mat-mang]
breakpoints: [desktop-1440, hep-500]
themes: [dark]
patched: 1
deferred: 1
---
# design-pass — anh-can-ba-ngan

Mục Ảnh dựng bằng thành phần thật (`units/photos/muc-anh.tsx`: Tabs, Sortable dạng lưới theo `c-sortable-7`, DropdownMenu,
AlertDialog, Dialog, TrangThai) trên trang `proto/anh-can-ba-ngan` với nguồn ảnh trong bộ nhớ trang (ảnh mẫu vẽ bằng SVG,
không ảnh thật). Thả tệp chụp bằng DataTransfer giả qua chrome-devtools; mất mạng bằng sự kiện offline.

## Ma trận chụp

| Trạng thái | Khổ | Tệp |
|---|---|---|
| Gửi được, có bìa, ảnh thật + ảnh mẫu | 1440 | `design-pass/1-gui-duoc-1440.png` |
| Thả hai tệp: một PNG vào lưới, một «.jpg» là chữ báo «Không phải ảnh» | 1440 | `design-pass/2-tha-hai-tep-1440.png` |
| Nội bộ (người giữ căn) | 1440 | `design-pass/3-noi-bo-1440.png` |
| Tự có từ mã — danh mục chưa có ảnh | 1440 | `design-pass/4-tu-co-tu-ma-1440.png` |
| Người không giữ căn: Nội bộ khoá, không số đếm, không vùng thả | 1440 | `design-pass/5-nguoi-khac-noi-bo-khoa-1440.png` |
| Mất mạng: «Cần mạng để thêm ảnh», nút Chọn ảnh tắt | hẹp 500 | `design-pass/6-mat-mang-390.png` |
| Khổ hẹp sau sửa: lưới hai cột, nhãn đủ chữ | hẹp 500 | `design-pass/6-hep-390.png` |

## Phát hiện

1. **Đã sửa** — khổ hẹp ba cột cắt nhãn «Ảnh thật · 20/1…»: lưới đổi thành 2 cột dưới khổ `@md`, 3 cột từ `@md`, 5 cột
   từ `@3xl` (theo bề rộng mục, không theo màn).
2. **Để S3** — dòng tệp lỗi («tin-nhan.jpg · Không phải ảnh») hiện ở mọi thẻ chứ không chỉ thẻ đã thả vào; S3 gắn dòng
   lỗi với ngăn đích.
3. Trình duyệt trong app tự tải lại trang của máy chủ dev liên tục (vòng HMR, không do tệp trong cây); chụp bằng
   chrome-devtools. Bài chấm E10 đã dặn không dùng công cụ ghi tệp vào cây.
