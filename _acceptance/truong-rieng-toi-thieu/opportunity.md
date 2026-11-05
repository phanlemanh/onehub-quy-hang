---
schema_version: 1
slug: truong-rieng-toi-thieu
feature: "Quản trị sàn tạo trường riêng kiểu có / không hoặc chọn một sau khi máy dò không có trường chuẩn cùng nghĩa; trường hiện ở bảng hàng, lọc được, không ra trang khách; cùng cơ chế áp cho liên hệ: trường riêng theo loại liên hệ (chủ nhà, người mua, người thuê…), trường của liên hệ chủ nhà mang lớp nguồn"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 47
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 47 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P10

Quản trị sàn tạo trường riêng kiểu có / không hoặc chọn một sau khi máy dò không có trường chuẩn cùng nghĩa; trường hiện ở bảng hàng, lọc được, không ra trang khách; cùng cơ chế áp cho liên hệ: trường riêng theo loại liên hệ (chủ nhà, người mua, người thuê…), trường của liên hệ chủ nhà mang lớp nguồn

Vì sao: Màn P1 (S5); chốt 29/10 trường riêng mức tối thiểu

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Quản trị sàn tạo trường riêng có / không hoặc chọn một chỉ sau khi máy dò không có trường chuẩn cùng nghĩa; trường hiện ở Bảng hàng, lọc được, không bao giờ ra trang khách; liên hệ có trường riêng theo loại, trường của liên hệ chủ nhà mang lớp nguồn và không rời công ty; sàn khác không thấy trường của nhau» chưa?
- Kết quả nào là SỐNG: [đề xuất] Quản trị sàn tạo trường riêng có / không hoặc chọn một chỉ sau khi máy dò không có trường chuẩn cùng nghĩa; trường hiện ở Bảng hàng, lọc được, không bao giờ ra trang khách; liên hệ có trường riêng theo loại, trường của liên hệ chủ nhà mang lớp nguồn và không rời công ty; sàn khác không thấy trường của nhau
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Quản trị sàn tạo trường riêng có / không hoặc chọn một chỉ sau khi máy dò không có trường chuẩn cùng nghĩa; trường hiện ở Bảng hàng, lọc được, không bao giờ ra trang khách; liên hệ có trường riêng theo loại, trường của liên hệ chủ nhà mang lớp nguồn và không rời công ty; sàn khác không thấy trường của nhau» khi hết timebox
- Timebox: …
