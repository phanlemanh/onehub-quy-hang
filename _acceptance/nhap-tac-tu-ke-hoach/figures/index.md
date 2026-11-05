# Hình tại điểm quyết định — hàng 68

| Điểm | Đếm | Hình |
| --- | --- | --- |
| Đường đi của dữ liệu: cột nào ra khỏi Quỹ hàng, chặn ở đâu (sổ S1: gói chỉ cột chưa ghép, máy chủ quét lại, thoả thuận, dự phòng) | 6 bước nối tiếp, 3 nhánh rẽ (chặn · lỗi · qua) | `duong-di-du-lieu.html` / `.png` |
| Hỏi-1 — số đo AC-1 bằng đề xuất ghi sẵn hay khoá API thật | dưới ngưỡng: 2 lối thay thế, không có bước nối tiếp | — |
| Hỏi-2 — chỗ đặt công tắc «Xử lý bằng AI» | dưới ngưỡng: 2 lối thay thế, không có bước nối tiếp | — |
| Hỏi-3 — gác hay không: đọc nền trên bộ lạ hay bộ thử hàng 64 | dưới ngưỡng: 2 lối thay thế; số hai bộ ở bảng thiết kế §1 | — |

## Đề bài: duong-di-du-lieu

- Loại hình: sơ đồ luồng dữ liệu ba làn (Trình duyệt · Máy chủ Quỹ hàng · Anthropic), trái sang phải.
- Nút: Đọc file → Ghép như cũ (mẫu, từ điển, bộ dò) → «Còn cột chưa ghép?» (không → Ghép tay như hàng 65) → Gói đề xuất
  (tiêu đề + hình dạng mọi cột; giá trị chỉ cột mã căn, giá, phí, trạng thái chưa ghép) → Máy chủ: kiểm vai, thoả thuận,
  trần, khoá → Quét lại dữ liệu cá nhân (trúng → không gửi, ghi sổ, ghép tay) → Claude một lần gọi → Kiểm đề xuất → Người
  duyệt → Xem trước → Ghi.
- Nhãn bằng chữ ở cạnh: «không bao giờ ra: chủ nhà, số điện thoại, giá đáy, ghi chú, tên người».
- AC liên quan: AC-2, AC-3, AC-4, AC-6, AC-7, AC-8, AC-9.
