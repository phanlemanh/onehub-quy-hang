---
schema_version: 1
slug: lop-truong-nguon
feature: Đầu chủ giữ căn thấy chủ nhà, số điện thoại và giá đáy của căn mình; người khác trong sàn mở cùng hồ sơ thì không thấy, và mỗi lần mở số chủ thành một sự kiện
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 11
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 11 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã N7

Đầu chủ giữ căn thấy chủ nhà, số điện thoại và giá đáy của căn mình; người khác trong sàn mở cùng hồ sơ thì không thấy, và mỗi lần mở số chủ thành một sự kiện

Vì sao: Tham chiếu §6 lớp trường; bất biến 2

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «đầu chủ giữ căn nhận chủ nhà, số điện thoại và giá đáy; người khác cùng sàn mở cùng hồ sơ qua API không nhận ba trường ấy (ẩn ở lõi, không ở giao diện); mỗi lần mở số chủ thành đúng một sự kiện» chưa?
- Kết quả nào là SỐNG: [đề xuất] đầu chủ giữ căn nhận chủ nhà, số điện thoại và giá đáy; người khác cùng sàn mở cùng hồ sơ qua API không nhận ba trường ấy (ẩn ở lõi, không ở giao diện); mỗi lần mở số chủ thành đúng một sự kiện
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «đầu chủ giữ căn nhận chủ nhà, số điện thoại và giá đáy; người khác cùng sàn mở cùng hồ sơ qua API không nhận ba trường ấy (ẩn ở lõi, không ở giao diện); mỗi lần mở số chủ thành đúng một sự kiện» khi hết timebox
- Timebox: …
