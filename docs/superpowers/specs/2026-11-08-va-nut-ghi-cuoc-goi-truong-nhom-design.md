# Vá nút «Ghi cuộc gọi» cho trưởng nhóm — thiết kế

Hàng vá `va-nut-ghi-cuoc-goi-truong-nhom` (dãy H, đợt dau-khach-nhap), mở từ Ngoài-1/2 của hàng
`ho-so-dien-thoai-product-detail-5` (chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 05/11).

## Vấn đề

Nút chính dính đáy của hồ sơ căn trên điện thoại (`units/ho-so/mo-hinh.ts › nutChinh`) suy từ cờ `hoiDauChu`: người thấy
nguồn có «Ghi cuộc gọi», người không thấy có «Hỏi đầu chủ». Người thấy nguồn gồm đầu chủ giữ căn và trưởng nhóm. Nhưng
màn ghi cuộc gọi (`units/call/page.tsx`) chặn người không có vai Đầu chủ (`notFound()`), theo quyết định đã chốt ở hàng
goi-ep-gia-dot-hai (Hỏi-7: «Trưởng nhóm không có vai Đầu chủ không mở được chế độ cuộc gọi»). Trưởng nhóm thuần vì thế
thấy nút dẫn tới trang không có.

## Cách sửa

- Lõi quyền (`packages/core/src/access/lop-phu-ho-so.ts`) có một luật «vào được màn ghi cuộc gọi» (`vaoManCuocGoi`: người
  mang vai Đầu chủ) và lớp phủ hồ sơ thêm cờ thứ năm `ghiCuocGoi` = thấy nguồn VÀ vào được màn ghi cuộc gọi.
- Nút chính đọc cờ: không thấy nguồn → «Hỏi đầu chủ» (như cũ); thấy nguồn mà `ghiCuocGoi` → «Ghi cuộc gọi»; thấy nguồn
  mà không vào được màn (trưởng nhóm thuần) → không có nút chính; căn chưa có mã → không nút (như cũ).
- Trang ghi cuộc gọi chặn bằng CÙNG luật `vaoManCuocGoi` của lõi thay vì tự đọc tên vai — nút và trang không lệch nhau
  được nữa.
- Không đổi quyền: không cấp cho trưởng nhóm màn ghi cuộc gọi (đã chốt ở goi-ep-gia-dot-hai Hỏi-7).

Thân cột (máy tính) không có nút «Ghi cuộc gọi» — không đổi.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: hồ sơ căn trên điện thoại → nút «Ghi cuộc gọi» dính đáy → màn ghi cuộc gọi ép giá của căn (điểm ra: màn cuộc gọi).
- Biên: trưởng nhóm không có vai Đầu chủ → không có nút chính dính đáy; người không thấy nguồn → «Hỏi đầu chủ» như cũ.
- Lỗi & quay lại: không còn đường tới trang không có; trang vẫn chặn độc lập người gõ thẳng đường dẫn.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn, điện thoại | xem một căn và làm việc chính với nó | Bảng hàng, Hôm nay / màn ghi cuộc gọi, bảng chia sẻ |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ho-so-dt-nut-ghi | Hồ sơ căn, điện thoại | nút «Ghi cuộc gọi» dính đáy (đầu chủ giữ căn, trưởng nhóm có vai Đầu chủ) | bấm → màn ghi cuộc gọi |
| ST-ho-so-dt-khong-nut | Hồ sơ căn, điện thoại | không nút chính dính đáy (trưởng nhóm thuần, căn chưa có mã) | đọc hồ sơ |
| ST-ho-so-dt-nut-hoi | Hồ sơ căn, điện thoại | nút «Hỏi đầu chủ» (người không thấy nguồn) | bấm → bảng chia sẻ |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Nút có hay không chỉ theo cờ lõi; màn không rẽ theo tên vai.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Nút chính dính đáy của thân điện thoại | dùng | đã có từ hàng product-detail-5, chỉ đổi điều kiện hiện |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — hàng vá chỉ đổi điều kiện hiện một nút có sẵn của màn chi tiết; khuôn của màn giữ nguyên (nhóm ho-so-can).

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | đầu chủ, trưởng nhóm, đầu khách |
| Việc chính | xem một căn và làm việc chính với căn |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | một |
| Thiết bị | điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->
