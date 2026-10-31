---
schema_version: 1
slug: nhap-excel-ghep-cot
feature: Đầu chủ thả file bảng hàng cũ, ghép cột lẫn giá trị vào trường chuẩn, xem trước sẽ ghi gì rồi mới nhập; không cột nào bị bỏ mất
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 20
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 20 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã D8

Đầu chủ thả file bảng hàng cũ, ghép cột lẫn giá trị vào trường chuẩn, xem trước sẽ ghi gì rồi mới nhập; không cột nào bị bỏ mất

Vì sao: Màn P0 (N1, N2); luật 11
Số đo hai tuần thử gần nhất (Tham chiếu §11): Số ngày Sheet cũ không được sửa — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ thả file bảng hàng cũ, ghép cột lẫn giá trị vào trường chuẩn, xem trước sẽ ghi gì rồi mới nhập; không cột nào bị bỏ mất» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ thả file bảng hàng cũ, ghép cột lẫn giá trị vào trường chuẩn, xem trước sẽ ghi gì rồi mới nhập; không cột nào bị bỏ mất
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ thả file bảng hàng cũ, ghép cột lẫn giá trị vào trường chuẩn, xem trước sẽ ghi gì rồi mới nhập; không cột nào bị bỏ mất» khi hết timebox
- Timebox: …
