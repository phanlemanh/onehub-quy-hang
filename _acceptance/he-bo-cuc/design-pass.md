---
slug: he-bo-cuc
at: 2026-11-02T03:30:00Z
route: http://localhost:3484/mau/he-bo-cuc
material: real-components
context: standalone
context_scenes: [vo-that-nguoi-mau]
reaction: nac-1 (ghim — trang mẫu sống mở không đăng nhập ở cổng 3484 của dãy G; ba trang ba lối ba-loi/<ô>/index.html gửi kèm thẻ Cổng Phạm vi)
options: _acceptance/he-bo-cuc/ba-loi/menu-tao/index.html, _acceptance/he-bo-cuc/ba-loi/dau-man/index.html, _acceptance/he-bo-cuc/ba-loi/bo-cuc-moi/index.html
divergence: opened — ADR-0024 quyết định 12: ba ô chưa có khuôn (menu Tạo, đầu màn, ba bố cục chưa có màn); khuyên reui cả ba
ds_skill: quy-hang-ui
states: [mac-dinh, cho-tai, rong, loi, ngoai-tuyen]
breakpoints: [desktop-1440, desktop-1024, mobile-375]
themes: [light]
patched: 3
deferred: 2
---
# design-pass — he-bo-cuc

Hàng nền của hệ bố cục. Bản bấm được chính là **trang mẫu sống** `/mau/he-bo-cuc`. Trang dựng vỏ thật với người mẫu
(trưởng nhóm của «[Mẫu] Sàn thử») và dữ liệu mẫu, không đăng nhập, không gọi API. Trên đó xem được bảy bố cục × năm
trạng thái, mỗi tổ hợp một địa chỉ (`/mau/he-bo-cuc/xem?bo-cuc=…&trang-thai=…`).

Bước phân kỳ mở cho ba ô theo ADR-0024 quyết định 12. Mỗi ô có một trang ba lối (thư mục `ba-loi/<ô>/`):

- **menu-tao** — Trong kho: các nút rời như vỏ hôm nay. ReUI: nút chia «+ Lead ▾». Vẽ mới: một nút «Tạo ▾». Máy khuyên
  ReUI.
- **dau-man** — Trong kho: tiêu đề và nút rời như các màn tự làm. ReUI: ghép FrameHeader + breadcrumb + nút + «…». Vẽ
  mới: dải tách khỏi Frame. Máy khuyên ReUI.
- **bo-cuc-moi** — Bảng điều khiển, Luồng nhiều bước, Dòng tin. Chỉ lối ReUI có ứng viên (khối nguồn ADR); Trong kho và
  Vẽ mới khai không có kèm điều đã tra. Máy khuyên ReUI.

## Ma trận capture

Chụp bằng script playwright (Chrome, sáng, `deviceScaleFactor` 1) từ trang xem:

- 21 ảnh chuẩn `design/anh-chuan/<bố cục>-<1440|1024|375>.png`: trạng thái mặc định, không ảnh nào cuộn ngang.
- Trang ba lối: `ba-loi/<ô>/<lối>-<1440|375>.png`.
  - Menu Tạo ở 1440 chụp lúc menu đang mở.
  - Ở 375, vỏ điện thoại không có nút tạo trên thanh trên, nên ba lối giống nhau.
- 35 tổ hợp bố cục × trạng thái ở 1440 đều trả 200 và có đúng `data-bo-cuc`, đo bằng một lệnh fetch trên trang.

## Findings

Đã sửa trong phiên (patched 3):
1. `MobileHeader` gọi chỉ báo đồng bộ, nên trang mẫu sập khi không có bộ đồng bộ. Đã thêm cờ `mau` cho vỏ: không bộ
   đồng bộ, không chỉ báo, không gọi mạng.
2. Dòng cài đặt của bố cục Đọc chưa tách nhãn trái, ô phải. Đã sửa: dùng `FieldGroup` + `FieldContent` như `settings-3`.
3. Nút ở chân xếp dọc vì `FrameFooter` mặc định `flex-col`. Đã sửa: bố cục đặt chân thành hàng, căn phải.

Chuyển sang bước thi công (deferred 2):
1. Hồ sơ hai cột ở 375 chưa có nút dính đáy (ADR §5). Đầu màn đang xếp nút ngay dưới tiêu đề. Bước thi công đưa nút
   chính và phụ của đầu màn xuống đáy khi bố cục là Hồ sơ hai cột.
2. Danh sách – chi tiết dùng lưới hai phần một phần thay cho `resizable` (khối nguồn ADR là `c-resizable-9`). Bước thi
   công thay bằng `ResizablePanelGroup` từ khổ vừa trở lên.

Lớp phủ dev của Next báo lỗi `next-themes` (thẻ script trong `ThemeProvider`). Lỗi này có từ trước hàng này; script chụp
ẩn lớp phủ.
