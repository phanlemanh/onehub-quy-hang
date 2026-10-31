---
schema_version: 1
slug: can-trung-ma-hai-toa
feature: Đầu chủ gõ mã căn trùng ở hai toà cùng dự án thì thấy cả hai căn kèm tên toà để chọn, không bị điền lặng lẽ thuộc tính của căn toà khác
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T13:38:56Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 63
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 63 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ton-nen-2.md#85a4e60f45b708157b5705b6b8bc702346d1ac99` — chưa có trang: trang nền, mã H9-N4

Đầu chủ gõ mã căn trùng ở hai toà cùng dự án thì thấy cả hai căn kèm tên toà để chọn, không bị điền lặng lẽ thuộc tính của căn toà khác

Vì sao: Ngoài-4 của hàng 9, chủ kho chọn «mở hợp đồng mới» và xử cùng lúc nạp danh mục thật: danh mục mẫu không có ca này, danh mục thật thì có thể có
Số đo hai tuần thử gần nhất (Tham chiếu §11): Tỉ lệ mã căn tự điền được — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Danh mục thử có hai toà cùng mã căn: tra trả «nhiều căn» kèm cả hai toà, không trả một căn; mã kèm tên toà ra đúng một căn; mọi ca của hàng 9 vẫn xanh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Danh mục thử có hai toà cùng mã căn: tra trả «nhiều căn» kèm cả hai toà, không trả một căn; mã kèm tên toà ra đúng một căn; mọi ca của hàng 9 vẫn xanh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Danh mục thử có hai toà cùng mã căn: tra trả «nhiều căn» kèm cả hai toà, không trả một căn; mã kèm tên toà ra đúng một căn; mọi ca của hàng 9 vẫn xanh» khi hết timebox
- Timebox: …
