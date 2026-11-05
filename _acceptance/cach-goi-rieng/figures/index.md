# Hình tại điểm quyết định — cach-goi-rieng

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-2 một tên riêng mỗi giá trị chuẩn | dưới ngưỡng: 1 bước, 2 lối không rẽ trong luồng | — |
| Hỏi-3 nhãn ra trang khách qua cửa lõi | 4 bước nối tiếp (lưu → từ vựng → lọc theo khoá ra → ba mặt) + 2 nhánh (trong sàn / ra ngoài) | `luong-nhan.html` |
| Hỏi-1 lưu trong company_settings khoá ba đoạn | chung hình với Hỏi-3 (bước «lưu») | `luong-nhan.html` |
| Hỏi-4 danh sách trường và tập đóng ở lõi | dưới ngưỡng: một bảng | — |

## Đề bài `luong-nhan`

- Loại hình: sơ đồ luồng dữ liệu trái → phải, hai nhánh.
- Nút: Màn Cách gọi (quản trị sàn) → PUT /company/labels → company_settings (khoá labels.field.* / labels.value.*, nhật ký 026,
  luật dòng theo sàn) → lõi `boTuVung` (từ vựng của sàn) → nhánh TRONG SÀN: Bảng hàng máy tính + thẻ điện thoại (tên riêng của
  mọi 15 trường, giá trị riêng phí + lý do ngừng) · nhánh RA NGOÀI: lõi `tuVungRaNgoai` (chỉ trường có khoá ra; không lý do
  ngừng) → bản phát hàng (nhóm môi giới) và trang /s/<mã> (khách riêng, nhóm môi giới).
- Nhãn bằng chữ: «Sàn B không thấy» trên cạnh company_settings; «lọc, đếm vẫn theo giá trị chuẩn» trên nhánh Bảng hàng.
- AC liên quan: AC-1, AC-4, AC-5, AC-6, AC-7, AC-8.
