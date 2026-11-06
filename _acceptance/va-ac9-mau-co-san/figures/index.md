# Điểm quyết định — va-ac9-mau-co-san (Cổng Phạm vi)

| Điểm | Đếm | Hình |
|---|---|---|
| Hỏi-1 — xoá tạm dữ liệu mẫu có sẵn trong giao dịch rồi hoàn tác | 2 nhánh rẽ (giữ xoá trong giao dịch · bỏ bước xoá đầu ca) | cần hình → `hoi-1-2.html` |
| Hỏi-2 — giữ bài kiểm dữ liệu mẫu trong bước triển khai trên bản thật | 2 nhánh rẽ (giữ · loại khỏi lệnh trên bản thật) | cần hình → `hoi-1-2.html` |
| Seal phạm vi (5 tiêu chí, 4 mục ngoài) | dưới ngưỡng: 1 bước | — |

## Đề bài hình `hoi-1-2`

- Loại hình: luồng một lượt deploy trên bản thật, hai điểm rẽ.
- Nút: gộp vào nhánh chính → job deploy → bài kiểm dữ liệu mẫu chạy trong một giao dịch → (Hỏi-1) xoá tạm dữ liệu mẫu có sẵn để lấy mốc sạch → nạp · kiểm · xoá phần bài nạp → hoàn tác cả giao dịch → dữ liệu bản thật giống hệt trước (E2) → Vercel nhận bản mới.
- Rẽ Hỏi-1: nhánh khuyến nghị «giữ xoá trong giao dịch» (vòng này) · nhánh khác «bỏ xoá đầu ca, viết lại mốc AC-8 và AC-9» (thêm một vòng, deploy đỏ lâu hơn).
- Rẽ Hỏi-2: nhánh khuyến nghị «giữ bài kiểm trong lệnh deploy» · nhánh khác «loại tệp khỏi lệnh chạy trên bản thật» (sửa ci.yml, ngoài vùng hàng).
- AC liên quan: AC-1, AC-2.
