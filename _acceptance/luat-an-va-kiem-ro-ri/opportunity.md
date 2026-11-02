---
schema_version: 1
slug: luat-an-va-kiem-ro-ri
feature: Mọi cửa ra lấy dữ liệu từ một bộ luật ẩn ở lõi, và bộ kiểm rò rỉ chứng không trường nội bộ nào có trong trang khách, kể cả trong mã nguồn trang; luật ẩn phủ cả liên hệ (mọi liên hệ không ra ngoài) và ngăn ảnh (chỉ ngăn Gửi được ra trang khách)
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 31
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 31 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã K1

Mọi cửa ra lấy dữ liệu từ một bộ luật ẩn ở lõi, và bộ kiểm rò rỉ chứng không trường nội bộ nào có trong trang khách, kể cả trong mã nguồn trang; luật ẩn phủ cả liên hệ (mọi liên hệ không ra ngoài) và ngăn ảnh (chỉ ngăn Gửi được ra trang khách)

Vì sao: Bất biến 4; luật 23–24; kiểm bắt buộc trước phát hành

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Bộ kiểm rò rỉ chạy trong CI và đỏ khi cố tình thêm một trường nội bộ; gửi khách riêng không có mã căn» chưa?
- Kết quả nào là SỐNG: [đề xuất] Bộ kiểm rò rỉ chạy trong CI và đỏ khi cố tình thêm một trường nội bộ; gửi khách riêng không có mã căn
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Bộ kiểm rò rỉ chạy trong CI và đỏ khi cố tình thêm một trường nội bộ; gửi khách riêng không có mã căn» khi hết timebox
- Timebox: …
