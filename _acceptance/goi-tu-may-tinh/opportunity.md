---
schema_version: 1
slug: goi-tu-may-tinh
feature: Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T13:38:56Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 30
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 30 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã L7

Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà

Vì sao: Mức tối thiểu chốt 29/10; tổng đài là một loại kết nối, để sau
Số đo hai tuần thử gần nhất (Tham chiếu §11): Tỉ lệ thao tác trên máy tính / điện thoại theo vai — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu chủ bấm Gọi trên máy tính thì chế độ cuộc gọi mở và điện thoại của mình quay số chủ nhà» khi hết timebox
- Timebox: …
