# Hình tại điểm quyết định — va-deploy-csdl-tam

| Điểm | Đếm | Hình |
|---|---|---|
| Đường triển khai mới: job isolation (Postgres tạm) chặn deploy; deploy trên bản thật migrate → kiểm nhanh → Vercel | 3 bước nối tiếp + 1 nhánh rẽ (đỏ dừng) | luong-deploy |
| Vế bypassrls thêm ngoài câu giao | dưới ngưỡng: 1 bước | — |
| Bỏ nhánh Supabase, bỏ sửa ADR/Tham chiếu | dưới ngưỡng: 0 bước | — |

## Đề bài luong-deploy

- Loại: sơ đồ luồng (flowchart) trái sang phải, hai làn: «Cơ sở dữ liệu tạm (job isolation)» và «Bản thật (job deploy)».
- Làn tạm: Gộp vào main → Postgres 16 dựng trong job → áp migration từ đầu → bộ kiểm cách ly (ghi, rollback) → xanh?
- Làn bản thật (chờ isolation xanh): áp migration (1 kết nối) → kiểm nhanh chỉ đọc (1 kết nối: bật + ép luật theo dòng ·
  quy_hang_app không là chủ bảng · không bypassrls) → gọi Vercel.
- Nhánh đỏ: bộ cách ly đỏ → không deploy; kiểm nhanh đỏ → không gọi Vercel. Ghi chú: bỏ bước cũ «bộ cách ly trên bản thật».
- AC: AC-1, AC-2, AC-3, AC-4, AC-5, AC-6.
