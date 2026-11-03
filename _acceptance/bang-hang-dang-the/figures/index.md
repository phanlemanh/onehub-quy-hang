# Hình tại điểm quyết định — bang-hang-dang-the (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — tập mục lọc theo nhu cầu (d-20261103T111433Z-9) | hai nhánh rẽ (năm mục · chín mục) | cần hình: `hoi-1-muc-loc` |
| Bỏ design-pass (d-20261103T110950Z-8) | một lối, không nhánh | dưới ngưỡng: 1 lối |
| Ảnh bìa từng căn, không tuyến hàng loạt (d-20261103T110950Z-6) | một lối sống (lối kia ngoài vùng) | dưới ngưỡng: 1 lối |
| Lối đi chính của màn (danh sách → lọc → giữ lâu → chọn · chạm → hồ sơ → lùi) | năm bước nối tiếp | cần hình: `luong-bang-the` |

## Đề bài `hoi-1-muc-loc`

- Loại hình: so sánh hai cột (hai phương án cạnh nhau).
- Nút: «Năm mục (khuyến nghị)»: Giá · Phòng ngủ · Toà · Diện tích · Hướng — cả năm hiện trên thẻ; «Chín mục»: thêm Nội
  thất · Pháp lý · Tầng · Tình trạng sử dụng — bốn mục không hiện trên thẻ.
- Nhãn: dưới mỗi cột một dòng giá: «ngăn ngắn, kiểm kết quả ngay trên thẻ» · «ngăn dài gấp đôi, phải mở hồ sơ để kiểm, +8
  ca kiểm».
- AC liên quan: AC-3, AC-4.

## Đề bài `luong-bang-the`

- Loại hình: luồng (wireflow ngang) theo mục 1 «Luồng» của Đặc tả UX trong `design.md`.
- Nút: Bảng hàng (thẻ nhóm theo toà) → Ngăn lọc (năm mục, «Xem n căn») → Danh sách có thẻ lọc → Giữ lâu → «n căn đã
  chọn» (→ Gửi, hàng 34, nét đứt) ; nhánh: Danh sách → chạm thẻ → Hồ sơ toàn màn → lùi về Danh sách (giữ lọc, vị trí cuộn).
- Nhãn: chữ thật trên màn («Lọc», «Xem n căn», «Xoá lọc», «1 căn đã chọn», «Bỏ chọn»).
- AC liên quan: AC-3 … AC-6.
