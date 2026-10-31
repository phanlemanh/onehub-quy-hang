---
schema_version: 1
slug: san-sang-ban
feature: Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T13:38:56Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 23
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 23 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã D11

Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu

Vì sao: Luật 17: không qua người duyệt
Số đo hai tuần thử gần nhất (Tham chiếu §11): Số ngày lead → Sẵn sàng bán — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ bấm «Sẵn sàng bán» và căn lên bảng hàng chung ngay khi máy kiểm đủ giá về tay, ảnh thật, pháp lý, tình trạng sử dụng; thiếu thì chỉ đúng chỗ thiếu» khi hết timebox
- Timebox: …
