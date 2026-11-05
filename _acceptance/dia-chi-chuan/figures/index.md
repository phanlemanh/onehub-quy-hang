# Hình tại điểm quyết định — dia-chi-chuan (Cổng Phạm vi)

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Có quận cũ thì đọc phường cũ trước (sổ dòng 3) + thiếu tỉnh không suy (sổ dòng 5) | 3 nhánh rẽ (quận cũ có/không · vào trọn/bị tách/không có · tỉnh có/không) | `doc-phuong.html` |
| Hỏi-1 — danh mục cấp xã đầy đủ (sổ dòng 6) | 2 nhánh rẽ (giao trích + hàng dữ liệu sau · tải đủ ngay) | `hoi-1-danh-muc.html` |
| Công thức khoá (sổ dòng 2) | dưới ngưỡng: 1 bước | — |
| Tên đường giữ chữ gõ (sổ dòng 4) | dưới ngưỡng: 1 bước | — |
| Bỏ đặc tả UX, không mở đường xuất (sổ dòng 7, 8) | dưới ngưỡng: 0 nhánh | — |

## Đề bài `doc-phuong.html`

- Loại: lưu đồ (flowchart) quyết định, đọc từ trái sang phải.
- Nút: «Chữ người gõ» → «Có tỉnh?» (không → «Thiếu tỉnh: xã thành cần người chọn, kèm tỉnh») → «Có quận/huyện cũ?» → nhánh có: «Tìm phường cũ» / nhánh không: «Tìm xã mới, không có thì phường cũ» → «Phường cũ vào trọn một xã mới?» → có: «Xã mới + tên cũ · có khoá» / tách: «Cần người chọn · ứng viên = các xã mới nhận · không khoá» / không thấy: «Chưa có trong danh mục · không khoá».
- Ví dụ trên cạnh: «P. Bến Nghé, Q.1» → Sài Gòn; «Phường Cầu Ông Lãnh, Quận 1» → chọn Bến Thành / Cầu Ông Lãnh; «P. Cầu Ông Lãnh, TPHCM» → Cầu Ông Lãnh.
- AC liên quan: AC-4, AC-5, AC-6.

## Đề bài `hoi-1-danh-muc.html`

- Loại: hai cột so sánh (hai lối), mỗi cột một dãy bước ngắn.
- Lối A (máy khuyên): vòng 75 giao bộ đọc + khuôn + 34 tỉnh + 4 phường TP.HCM trích → hàng dữ liệu riêng ngay sau (chủ kho chọn nguồn, cho phép tải) → địa chỉ thật ngoài 4 phường tạm ra «chưa có trong danh mục».
- Lối B: chủ kho chỉ nguồn + cho phép tải ngay ở cổng → vòng 75 nạp 3.321 xã + bảng cũ → mới → vòng dài thêm.
- Chú thích chung: bộ đọc chỉ dùng dữ liệu — thêm danh mục sau không đổi mã, không đổi khoá.
- AC liên quan: AC-8.
