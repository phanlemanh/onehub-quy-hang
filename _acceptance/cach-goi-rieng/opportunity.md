---
schema_version: 1
slug: cach-goi-rieng
feature: Quản trị sàn đổi tên hiển thị của trường chuẩn và thêm giá trị riêng neo vào giá trị chuẩn; cùng một căn hiện đúng ở bảng hàng, đội khác và trang khách
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T11:27:14Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 45
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 45 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P8

Quản trị sàn đổi tên hiển thị của trường chuẩn và thêm giá trị riêng neo vào giá trị chuẩn; cùng một căn hiện đúng ở bảng hàng, đội khác và trang khách

Vì sao: Màn P1 (S1); bản đầu chạy bằng mặc định dựng sẵn tới khi có màn này

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Quản trị sàn đổi tên hiển thị một trường chuẩn và thêm một giá trị riêng neo vào giá trị chuẩn, rồi cùng một căn hiện đúng chữ mới ở Bảng hàng, ở đội khác và trên trang khách; lọc và đếm vẫn theo giá trị chuẩn; không neo thì không lưu được; sàn khác vẫn thấy tên mặc định» chưa?
- Kết quả nào là SỐNG: [đề xuất] Quản trị sàn đổi tên hiển thị một trường chuẩn và thêm một giá trị riêng neo vào giá trị chuẩn, rồi cùng một căn hiện đúng chữ mới ở Bảng hàng, ở đội khác và trên trang khách; lọc và đếm vẫn theo giá trị chuẩn; không neo thì không lưu được; sàn khác vẫn thấy tên mặc định
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Quản trị sàn đổi tên hiển thị một trường chuẩn và thêm một giá trị riêng neo vào giá trị chuẩn, rồi cùng một căn hiện đúng chữ mới ở Bảng hàng, ở đội khác và trên trang khách; lọc và đếm vẫn theo giá trị chuẩn; không neo thì không lưu được; sàn khác vẫn thấy tên mặc định» khi hết timebox
- Timebox: …
