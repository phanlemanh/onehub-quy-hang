---
schema_version: 1
slug: lien-he-khach
feature: Đầu khách lưu khách là một liên hệ loại Người mua hoặc Người thuê, gắn nhu cầu, Lần gửi và lịch xem vào liên hệ ấy; một khách hai số vẫn là một người; số khách không ra trang khách
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 86
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 86 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu khách lưu khách là một liên hệ loại Người mua hoặc Người thuê, gắn nhu cầu, Lần gửi và lịch xem vào liên hệ ấy; một khách hai số vẫn là một người; số khách không ra trang khách

Vì sao: Bước hai của hàng 85 (đề nghị dãy L, yêu cầu L-12; chủ kho 01/11 mở rộng mọi loại liên hệ): khách hiện chưa có bản ghi — Lần gửi, lịch xem gắn vào đâu thì khách hai số thành hai người, đầu khách đổi người thì mất lịch sử
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian khách hỏi → gửi được căn; số link khách mở, số lượt quan tâm (đếm theo người, không theo số) — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Một khách hai số có hai Lần gửi: cả hai gắn một liên hệ Người mua; liên hệ vừa Người mua vừa Chủ bán vẫn một người, phần chủ nhà vẫn lớp nguồn; trang khách không lộ số hay trường nội bộ của liên hệ; bộ kiểm cách ly xanh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Một khách hai số có hai Lần gửi: cả hai gắn một liên hệ Người mua; liên hệ vừa Người mua vừa Chủ bán vẫn một người, phần chủ nhà vẫn lớp nguồn; trang khách không lộ số hay trường nội bộ của liên hệ; bộ kiểm cách ly xanh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Một khách hai số có hai Lần gửi: cả hai gắn một liên hệ Người mua; liên hệ vừa Người mua vừa Chủ bán vẫn một người, phần chủ nhà vẫn lớp nguồn; trang khách không lộ số hay trường nội bộ của liên hệ; bộ kiểm cách ly xanh» khi hết timebox
- Timebox: …
