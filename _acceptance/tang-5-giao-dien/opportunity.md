---
schema_version: 1
slug: tang-5-giao-dien
feature: "Kho có bộ chuẩn giao diện trước màn sản phẩm đầu tiên: thành phần ReUI, skill giao diện của kho, lint giao diện có mức nợ, sàn thiết kế M1"
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-30T02:04:24Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 4
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 4 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã N1

Kho có bộ chuẩn giao diện trước màn sản phẩm đầu tiên: thành phần ReUI, skill giao diện của kho, lint giao diện có mức nợ, sàn thiết kế M1

Vì sao: Chuẩn thiết lập kho tầng 5: dựng cùng màn đầu tiên thì nợ bằng 0

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Mức nợ lint giao diện bằng 0 và CI chặn tăng; sàn thiết kế M1 chặn mã màu thô; cấu hình cổng khai skill giao diện» chưa?
- Kết quả nào là SỐNG: [đề xuất] Mức nợ lint giao diện bằng 0 và CI chặn tăng; sàn thiết kế M1 chặn mã màu thô; cấu hình cổng khai skill giao diện
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Mức nợ lint giao diện bằng 0 và CI chặn tăng; sàn thiết kế M1 chặn mã màu thô; cấu hình cổng khai skill giao diện» khi hết timebox
- Timebox: …
