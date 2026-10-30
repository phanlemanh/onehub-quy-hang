---
schema_version: 1
slug: danh-muc-go-ma-can
feature: Đầu chủ gõ mã căn và thấy thuộc tính căn tự điền theo cách đọc mã của dự án; mã chưa có trong danh mục thì báo rõ
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 9
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 9 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã N5

Đầu chủ gõ mã căn và thấy thuộc tính căn tự điền theo cách đọc mã của dự án; mã chưa có trong danh mục thì báo rõ

Vì sao: Tham chiếu §1: gõ mã căn là đủ thông tin; danh mục và dự án thử hỏi lại ở vòng này (Mạnh 29/10)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «trên bộ dữ liệu mẫu của hàng 5, mọi mã căn có trong danh mục điền đúng thuộc tính theo cách đọc mã của dự án; mã chưa có thì báo rõ «chưa có trong danh mục», không điền đoán» chưa?
- Kết quả nào là SỐNG: [đề xuất] trên bộ dữ liệu mẫu của hàng 5, mọi mã căn có trong danh mục điền đúng thuộc tính theo cách đọc mã của dự án; mã chưa có thì báo rõ «chưa có trong danh mục», không điền đoán
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «trên bộ dữ liệu mẫu của hàng 5, mọi mã căn có trong danh mục điền đúng thuộc tính theo cách đọc mã của dự án; mã chưa có thì báo rõ «chưa có trong danh mục», không điền đoán» khi hết timebox
- Timebox: …
