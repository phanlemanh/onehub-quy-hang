---
schema_version: 1
slug: nhap-tac-tu-ke-hoach
feature: Đầu chủ thả file mẫu lạ khi sàn đã bật «Xử lý bằng AI» và thấy máy ghép gần hết, mỗi đề xuất kèm lý do; tắt hay hết trần thì vẫn nhập như không có AI
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 68
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 68 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nhap-du-lieu-3110.md#071467f2c9f6b260c323903bbb9b5253349afd32` — chưa có trang: trang nền, mã ND5

Đầu chủ thả file mẫu lạ khi sàn đã bật «Xử lý bằng AI» và thấy máy ghép gần hết, mỗi đề xuất kèm lý do; tắt hay hết trần thì vẫn nhập như không có AI

Vì sao: ADR-0011 quyết định 2–5, 10. Cổng Đáng đọc số nền của hàng 64: nền đạt mọi ngưỡng thì gác hàng này. 11 tiêu chí vì cửa chặn nguồn và tác tử không tách được mà giữ nghĩa «nguồn không rời công ty»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên bộ file mẫu lạ có đáp án, sàn bật «Xử lý bằng AI» thì máy ghép đúng phần lớn cột hơn số nền của hàng 64, mỗi đề xuất có lý do và người duyệt trước khi ghi; số chủ nhà, giá đáy không rời công ty sang dịch vụ AI; tắt AI hay hết trần thì nhập như không có AI, không lỗi; Cổng Đáng gác hàng nếu nền 64 đã đạt mọi ngưỡng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên bộ file mẫu lạ có đáp án, sàn bật «Xử lý bằng AI» thì máy ghép đúng phần lớn cột hơn số nền của hàng 64, mỗi đề xuất có lý do và người duyệt trước khi ghi; số chủ nhà, giá đáy không rời công ty sang dịch vụ AI; tắt AI hay hết trần thì nhập như không có AI, không lỗi; Cổng Đáng gác hàng nếu nền 64 đã đạt mọi ngưỡng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên bộ file mẫu lạ có đáp án, sàn bật «Xử lý bằng AI» thì máy ghép đúng phần lớn cột hơn số nền của hàng 64, mỗi đề xuất có lý do và người duyệt trước khi ghi; số chủ nhà, giá đáy không rời công ty sang dịch vụ AI; tắt AI hay hết trần thì nhập như không có AI, không lỗi; Cổng Đáng gác hàng nếu nền 64 đã đạt mọi ngưỡng» khi hết timebox
- Timebox: …
