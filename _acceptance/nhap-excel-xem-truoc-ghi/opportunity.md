---
schema_version: 1
slug: nhap-excel-xem-truoc-ghi
feature: Đầu chủ thả file bảng hàng cũ, thấy từng ô sẽ ghi gì — giữ nguyên, máy sửa, cần người, chặn — sửa rồi bấm ghi; căn đã có hàng mở thành tin bổ sung, độ tươi theo ngày trong file; chủ nhà và số trong file thành liên hệ chủ nhà của sàn (hàng 85) qua cùng đường kiểm trùng theo liên hệ
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-02T09:55:25Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 65
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 65 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nhap-du-lieu-3110.md#071467f2c9f6b260c323903bbb9b5253349afd32` · `wiki/dot/nen-dau.md#015b66d24d60d7679bc3960ebb29146fdd9b4a09` — chưa có trang: trang nền

Đầu chủ thả file bảng hàng cũ, thấy từng ô sẽ ghi gì — giữ nguyên, máy sửa, cần người, chặn — sửa rồi bấm ghi; căn đã có hàng mở thành tin bổ sung, độ tươi theo ngày trong file; chủ nhà và số trong file thành liên hệ chủ nhà của sàn (hàng 85) qua cùng đường kiểm trùng theo liên hệ

Vì sao: Màn P0 N1, N2; luật 11; ADR-0011 quyết định 5, 8, 11. 11 tiêu chí vì xem trước và ghi không tách được mà giữ nghĩa «xem trước rồi mới ghi»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: …
- Kết quả nào là SỐNG: …
- Kết quả nào là CHẾT: …
- Timebox: …
