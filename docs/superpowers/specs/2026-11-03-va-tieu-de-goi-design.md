# Vá tiêu đề Cuộc gọi — thiết kế

Hàng `va-tieu-de-goi` của lộ trình (dãy B, đợt dau-khach-nhap). Ô cơ hội: `_acceptance/va-tieu-de-goi/opportunity.md`
(Cổng Đáng ký `build` 02/11).

## Vấn đề

Thanh trên của vỏ điện thoại lấy tiêu đề từ `titleOf` trong `apps/web/src/components/shell/app-shell.tsx`. Hàm coi mọi
đường `/units/<x>` là mã căn, nên màn ghi cuộc gọi (`/units/call`, hàng 28–29) và trang quay số (`/units/call/dial`,
hàng 30) hiện «Căn call». Vỏ máy tính không đọc `titleOf` (đầu màn do `DauMan` của từng trang dựng), nên lỗi chỉ ở
điện thoại.

## Cách làm

- Tách `titleOf` (và bảng `PAGE_TITLE`) sang tệp thuần `apps/web/src/components/shell/tieu-de.ts` để kiểm bằng
  `node --test` mà không nạp thành phần React. `app-shell.tsx` chỉ đổi dòng nhập.
- Đường `/units/call` và mọi đường con của nó (`/units/call/dial`) cho tiêu đề «Ghi cuộc gọi» — đúng nhãn nút mở chế độ
  cuộc gọi đã chốt ở Hỏi-8 của hàng 29 (`goi-ep-gia-dot-hai`). Tiêu đề không đổi theo `?lead=` hay `?hang=`: vỏ chỉ thấy
  đường, không thấy truy vấn, và đầu màn `DauMan` của trang đã nói «Gọi khai thác»/«Gọi ép giá».
- `/units/<mã>` vẫn là «Căn <mã>» sau khi giải mã phần trăm. Mã giải mã lỗi (`%E0`) không làm sập vỏ: giữ nguyên chuỗi
  thô thay vì ném lỗi.
- Bảng tên trang (`/me`, `/leads/new`, `/imports/new`, `/exports/new`, `/viewings`) và tiêu đề theo nhà giữ nguyên.

Không đổi: vỏ máy tính, `DauMan`, nhãn nút «Ghi cuộc gọi» ở Hôm nay, tuyến trang.

## Đặc tả UX

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Hôm nay → bấm «Ghi cuộc gọi» trên dòng lead hay dòng căn ép giá → màn ghi cuộc gọi mở, thanh trên ghi «Ghi
  cuộc gọi» (điểm ra: lưu cuộc gọi, về Hôm nay).
- Biên: mở thông báo «Gọi chủ nhà» → trang quay số `/units/call/dial`, thanh trên vẫn «Ghi cuộc gọi»; mở một căn thật →
  thanh trên «Căn <mã>».
- Lỗi & quay lại: địa chỉ căn mang mã phần trăm hỏng → thanh trên hiện chuỗi thô, vỏ không sập.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chế độ cuộc gọi (`/units/call`) | ghi những gì nghe được trong một cuộc gọi | Hôm nay / Hôm nay |
| Trang quay số (`/units/call/dial`) | quay số chủ nhà của một lead | thông báo / chế độ cuộc gọi |
| Hồ sơ căn (`/units/<mã>`) | xem một căn | Bảng hàng, Hôm nay / lùi lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-cuoc-goi-tieu-de | Chế độ cuộc gọi | thanh trên điện thoại «Ghi cuộc gọi» | ghi cuộc gọi |
| ST-quay-so-tieu-de | Trang quay số | thanh trên điện thoại «Ghi cuộc gọi» | quay số |
| ST-ho-so-can-tieu-de | Hồ sơ căn | thanh trên điện thoại «Căn <mã>» | đọc hồ sơ |
| ST-ho-so-can-ma-hong | Hồ sơ căn | thanh trên điện thoại hiện chuỗi mã thô | lùi lại |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chỉ khổ dưới `md` (thanh trên `MobileHeader`); khổ máy tính không có thanh tiêu đề này.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MobileHeader` | dùng | đã nhận `title` là chuỗi; chỉ đổi chuỗi truyền vào |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: không đổi IA — chỉ đổi chữ của thanh trên vỏ điện thoại sẵn có; luồng hiển nhiên, không tra mẫu.
### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ |
| Việc chính | biết mình đang ở màn ghi cuộc gọi, không phải hồ sơ một căn |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | một |
| Thiết bị | điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->
