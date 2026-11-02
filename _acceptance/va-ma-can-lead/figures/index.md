# Hình tại điểm quyết định — va-ma-can-lead

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — lead cũ mang mã rác: bỏ mã hay từ chối | 2 nhánh rẽ × 2 đường (tạo hàng, gửi lại) | cần hình: `hoi-1-ma-rac` |
| Nhập lead mã toàn dấu bị từ chối (AC-1, AC-2) | 1 bước | dưới ngưỡng: 1 bước |

## Đề bài `hoi-1-ma-rac`
- Loại: luồng rẽ nhánh (flowchart).
- Nút: «Lead cũ mang mã căn toàn dấu (vd ---)» → hai đường «Tạo hàng từ lead» và «Gửi lại lead đã trả».
- Mỗi đường rẽ hai nhánh: (a) khuyến nghị — bỏ mã rác: hàng chưa mã căn → đầu chủ gắn mã ở hồ sơ căn / lead mới chỉ mang toà; (b) từ chối có lời báo → lead kẹt, không có chỗ sửa mã ở lead.
- Nhãn bằng tiếng Việt, đánh dấu nhánh (a) là khuyến nghị. AC liên quan: AC-3, AC-4.
