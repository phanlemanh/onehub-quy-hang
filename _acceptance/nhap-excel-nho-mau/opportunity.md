---
schema_version: 1
slug: nhap-excel-nho-mau
feature: Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước; ngày xác nhận lấy theo file, hoàn tác được cả lần nhập
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 21
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 21 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã D9

Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước; ngày xác nhận lấy theo file, hoàn tác được cả lần nhập

Vì sao: Luật 11; tách khỏi hàng 20 cho vừa cỡ
Số đo hai tuần thử gần nhất (Tham chiếu §11): Số ngày Sheet cũ không được sửa — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước; ngày xác nhận lấy theo file, hoàn tác được cả lần nhập» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước; ngày xác nhận lấy theo file, hoàn tác được cả lần nhập
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ nhập lại file cùng mẫu và thấy máy ghép sẵn như lần trước; ngày xác nhận lấy theo file, hoàn tác được cả lần nhập» khi hết timebox
- Timebox: …
