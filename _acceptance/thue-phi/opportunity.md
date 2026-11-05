---
schema_version: 1
slug: thue-phi
feature: Quản trị sàn đặt tỉ lệ thuế phí và định nghĩa «bao phí» của sàn; giá đã lưu giữ nguyên kèm ngày tính
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 49
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 49 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã P12

Quản trị sàn đặt tỉ lệ thuế phí và định nghĩa «bao phí» của sàn; giá đã lưu giữ nguyên kèm ngày tính

Vì sao: Màn P1 (S4); luật 13

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Quản trị sàn đặt tỉ lệ thuế phí và định nghĩa «bao phí» của sàn; giá tính sau lúc đổi dùng tỉ lệ mới, giá đã lưu giữ nguyên kèm ngày tính; người xem giá thấy giá ấy tính theo tỉ lệ của ngày nào; sàn khác không bị ảnh hưởng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Quản trị sàn đặt tỉ lệ thuế phí và định nghĩa «bao phí» của sàn; giá tính sau lúc đổi dùng tỉ lệ mới, giá đã lưu giữ nguyên kèm ngày tính; người xem giá thấy giá ấy tính theo tỉ lệ của ngày nào; sàn khác không bị ảnh hưởng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Quản trị sàn đặt tỉ lệ thuế phí và định nghĩa «bao phí» của sàn; giá tính sau lúc đổi dùng tỉ lệ mới, giá đã lưu giữ nguyên kèm ngày tính; người xem giá thấy giá ấy tính theo tỉ lệ của ngày nào; sàn khác không bị ảnh hưởng» khi hết timebox
- Timebox: …
