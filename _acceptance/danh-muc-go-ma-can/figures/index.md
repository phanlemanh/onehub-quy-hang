# Hình tại điểm quyết định — danh-muc-go-ma-can (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| d-2 Hỏi-1 dự án thử · d-3 Hỏi-2 nguồn danh mục · d-4 không bảng ở hàng này | 2 nhánh rẽ × 2 câu, nối sang hàng 10 | `nguon-danh-muc` |
| d-6 cách đọc mã là dữ liệu · d-7 không điền đoán · d-8 mọi vai gọi được | 4 kết cục rẽ từ một lần tra | `tra-ma-can` |
| d-5 đọc gói mẫu bằng import | dưới ngưỡng: 1 bước | — |
| d-9 hạng T2 (hàng ghi T3) | dưới ngưỡng: 1 so sánh | — |
| d-10, d-11 bỏ đặc-tả-UX, bỏ gợi ý gần đúng | dưới ngưỡng: 0 nhánh | — |
| Coverage [GIẢ ĐỊNH] năm kiểu viết của AC-2 | dưới ngưỡng: 1 danh sách | — |

## Đề bài `nguon-danh-muc`

- Loại: luồng hai làn «vòng này» / «sau (hàng 10, dự án thật)».
- Nút: Danh mục mẫu hàng 5 (dự án «[Mẫu] Dự án căn hộ thử», Toà A/B) → Lõi đọc mã + đường tra → Đầu chủ / mọi vai.
  Làn sau: Excel sàn thử + phần Invest không từ S08 → bảng danh mục dùng chung (hàng 10) → cùng đường tra (đổi một tham số).
- Nhãn chữ: «Hỏi-1: dự án thử = dự án mẫu (đổi được)», «Hỏi-2: nguồn = Excel sàn thử + Invest (đề xuất §12)».
- AC liên quan: AC-5, AC-10.

## Đề bài `tra-ma-can`

- Loại: cây quyết định một lần tra.
- Nút: chuỗi gõ → chuẩn hoá → đọc theo cách đọc của dự án → bốn lá: «có trong danh mục: điền đủ thuộc tính» ·
  «đọc được, chưa có trong danh mục: báo rõ, không điền» · «không đọc được: báo kèm mẫu mã» · «khớp nhiều dự án: liệt ứng viên».
- Nhãn chữ: «trường danh mục trống → để trống, không lấy căn khác», «mọi vai trong sàn gọi được».
- AC liên quan: AC-1 … AC-4, AC-6, AC-7, AC-8.

## Bổ sung sau phản biện

| Điểm | Đếm | Hình |
|---|---|---|
| d-12 Hỏi-3 bản thật phục vụ danh mục mẫu | 2 nhánh rẽ — làn «vòng này» của hình `nguon-danh-muc` là nhánh khuyến nghị | `nguon-danh-muc` |
| d-14 Hỏi-4 hạng T2 hay T3 | dưới ngưỡng: 1 so sánh | — |
