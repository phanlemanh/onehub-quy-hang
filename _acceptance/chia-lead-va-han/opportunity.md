---
schema_version: 1
slug: chia-lead-va-han
feature: Lead không trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 25
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 25 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã L2

Lead không trùng được chia theo luật của sàn trong một phút; quá 15 phút chưa nhận hay 30 phút chưa gọi thì trưởng nhóm được báo

Vì sao: Luật 20; mặc định của sàn, chỉnh ở S3 (Mạnh 29/10)
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian lead → cuộc gọi đầu — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mười lead thử về đúng người theo toà, bỏ qua người nghỉ; báo quá hạn đến trong sai số một phút» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mười lead thử về đúng người theo toà, bỏ qua người nghỉ; báo quá hạn đến trong sai số một phút
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mười lead thử về đúng người theo toà, bỏ qua người nghỉ; báo quá hạn đến trong sai số một phút» khi hết timebox
- Timebox: …
