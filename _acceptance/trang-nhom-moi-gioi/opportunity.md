---
schema_version: 1
slug: trang-nhom-moi-gioi
feature: Môi giới sàn khác mở link bảng hàng và thấy đủ mã căn, phí theo tên chuẩn kèm định nghĩa của sàn, mức chia của bộ; tải Excel hay ảnh bảng hàng được
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 44
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 44 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P7

Môi giới sàn khác mở link bảng hàng và thấy đủ mã căn, phí theo tên chuẩn kèm định nghĩa của sàn, mức chia của bộ; tải Excel hay ảnh bảng hàng được

Vì sao: Màn P1 (T4); mức chia là mặc định của sàn, sửa theo bộ, sàn ẩn được (29/10)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Môi giới sàn khác mở link bảng hàng không cần đăng nhập và thấy đủ mã căn, phí theo tên chuẩn kèm định nghĩa của sàn, mức chia của bộ; sàn ẩn mức chia thì không hiện; tải Excel hay ảnh bảng hàng ra đúng những cột ấy; không số chủ nhà, giá đáy hay ghi chú nội bộ nào lọt ra, dựng từ luật ẩn ở lõi» chưa?
- Kết quả nào là SỐNG: [đề xuất] Môi giới sàn khác mở link bảng hàng không cần đăng nhập và thấy đủ mã căn, phí theo tên chuẩn kèm định nghĩa của sàn, mức chia của bộ; sàn ẩn mức chia thì không hiện; tải Excel hay ảnh bảng hàng ra đúng những cột ấy; không số chủ nhà, giá đáy hay ghi chú nội bộ nào lọt ra, dựng từ luật ẩn ở lõi
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Môi giới sàn khác mở link bảng hàng không cần đăng nhập và thấy đủ mã căn, phí theo tên chuẩn kèm định nghĩa của sàn, mức chia của bộ; sàn ẩn mức chia thì không hiện; tải Excel hay ảnh bảng hàng ra đúng những cột ấy; không số chủ nhà, giá đáy hay ghi chú nội bộ nào lọt ra, dựng từ luật ẩn ở lõi» khi hết timebox
- Timebox: …
