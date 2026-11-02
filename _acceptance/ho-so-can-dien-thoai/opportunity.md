---
schema_version: 1
slug: ho-so-can-dien-thoai
feature: Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ»
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 33
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 33 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã K3

Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ»

Vì sao: Màn P0 (M3, vẽ cho đầu chủ); quyền là lớp phủ trên cùng một màn
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian khách hỏi → gửi được căn — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ»» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ»
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu khách mở hồ sơ căn trên điện thoại và thấy giá, ảnh gửi được, lần xác nhận gần nhất; phần chủ nhà thay bằng «Liên hệ đầu chủ»» khi hết timebox
- Timebox: …
