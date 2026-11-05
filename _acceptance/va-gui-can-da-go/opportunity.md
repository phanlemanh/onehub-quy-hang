---
schema_version: 1
slug: va-gui-can-da-go
feature: Căn đã gỡ khi hoàn tác lần nhập không vào được Lần gửi mới và không ghi được sự kiện gửi (Quan tâm) ở tầng cơ sở dữ liệu
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T03:49:40Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-gui-can-da-go
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-gui-can-da-go của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Căn đã gỡ khi hoàn tác lần nhập không vào được Lần gửi mới và không ghi được sự kiện gửi (Quan tâm) ở tầng cơ sở dữ liệu

Cổng Đáng: căn cứ lựa chọn của chủ kho ở Cổng Bằng chứng hàng 66, nguyên văn «Ngoài-2: mở hợp đồng mới» (`_acceptance/nhap-hoan-tac/decisions.jsonl` d-20261105T034940Z-24); giám sát trả G-20. Ngưỡng để chủ kho chốt.

Vì sao: Ngoài-2 của hàng 66 — chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 05/11 (luật 65 của đợt)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
