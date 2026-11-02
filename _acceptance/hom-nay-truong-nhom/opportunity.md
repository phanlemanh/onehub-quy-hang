---
schema_version: 1
slug: hom-nay-truong-nhom
feature: Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 42
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 42 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P5

Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được

Vì sao: Màn P1 (TN1, phác 29/10)
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian lead → cuộc gọi đầu — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trưởng nhóm mở Hôm nay và thấy lead quá hạn để chia lại, hàng cũ theo từng đầu chủ, và ngoại lệ máy không tự quyết được» khi hết timebox
- Timebox: …
