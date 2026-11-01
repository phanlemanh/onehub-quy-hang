---
schema_version: 1
slug: nhap-hoan-tac
feature: Đầu chủ hoàn tác cả một lần nhập; căn đã có người sửa sau đó được liệt kê, không bị gỡ
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 66
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 66 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nhap-du-lieu-3110.md#071467f2c9f6b260c323903bbb9b5253349afd32` · `wiki/dot/nen-dau.md#015b66d24d60d7679bc3960ebb29146fdd9b4a09` — chưa có trang: trang nền

Đầu chủ hoàn tác cả một lần nhập; căn đã có người sửa sau đó được liệt kê, không bị gỡ

Vì sao: Luật 11; ADR-0011 quyết định 8: sự kiện bù và voided, đổi khuôn sự kiện của ADR-0008

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
