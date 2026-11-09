# Link lần rao trong hồ sơ hàng lô, hàng ngoài khu — thiết kế (hàng vá)

Ngoài-5 của hàng 79 `bang-hang-theo-loai-hinh`: chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 08/11.

## Vấn đề

Hồ sơ hàng không toà (lô, ngoài khu) mở theo hàng (`?hang=<mã>`). Mục «Các lần rao» dựng link bằng `duong({ ma, toa, lan })`, tức
`?unit=<mã>&toa=<chữ vị trí>&lan=<mã>`. Bấm vào thì `docCot` đọc thành hồ sơ theo căn, `timCan` loại mọi hàng không toà, và hồ
sơ báo không thấy căn.

## Thiết kế

Trong `moHinhHoSo`, hàng không toà dựng link lần rao theo hàng: giữ các tham số đang có của màn (lấy từ `dongHref`, đường đóng cột),
thêm `hang=<mã hàng>`. Mỗi lần rao là một hàng riêng (rao lại là hàng mới, có hồ sơ của nó), nên hồ sơ theo hàng có đúng một lần rao và bấm vào giữ nguyên hồ sơ. Căn hộ không đổi.
Lối khác: cho `duong` của ba màn gọi nhận thêm mã hàng — chạy được, giá là sửa ba màn cho một ca chỉ `moHinhHoSo` biết. Sửa `timCan` để tìm được hàng không toà thì chết: hàng ngoài khu không có mã căn để đặt lên `unit=`.

Đối chiếu ngành (ADR-0022): không có — sửa đường liên kết nội bộ, không đổi đối tượng, danh sách hay cấu hình nào.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng → bấm dòng lô hay ngoài khu → cột hồ sơ → bấm lần rao trong «Các lần rao» → vẫn đúng hồ sơ ấy.
- Biên: căn hộ giữ link theo căn.
- Lỗi & quay lại: hàng không còn trên máy → «không có căn» như nay.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn | đọc một căn và các lần rao của nó | dòng Bảng hàng / đóng cột |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ho-so-lan-rao-khong-toa | Hồ sơ căn | một lần rao, bấm vào vẫn đúng hồ sơ | đọc, đóng cột |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Link giữ các tham số khác của địa chỉ.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| Mục Các lần rao | dùng | chỉ đổi địa chỉ của link |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: màn đã dựng trên bố cục này (hàng 105); vòng không đổi bố cục.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu chủ |
| Việc chính | xem lần rao của căn lô, căn ngoài khu |
| Tần suất | mỗi ngày |
| Số bản ghi | vài chục |
| Thiết bị | cả hai |
<!-- UX-SPEC-TEMPLATE>>> -->
