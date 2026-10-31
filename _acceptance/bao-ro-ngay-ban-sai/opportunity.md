---
schema_version: 1
slug: bao-ro-ngay-ban-sai
feature: Lệnh chốt bán với ngày bán không có thật (như 30 tháng 2) bị từ chối với lỗi nêu đúng trường ngày bán, không phải lỗi hệ thống
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T08:50:08Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 57
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 57 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/nen-dau.md#015b66d24d60d7679bc3960ebb29146fdd9b4a09` — chưa có trang: trang nền, mã ND4

Lệnh chốt bán với ngày bán không có thật (như 30 tháng 2) bị từ chối với lỗi nêu đúng trường ngày bán, không phải lỗi hệ thống

Vì sao: Cổng Bằng chứng hàng 8: Ngoài-2 «mở hợp đồng mới» (chủ kho 31/10) — ngày không có thật qua kiểm payload rồi cơ sở dữ liệu trả 500; không ghi nửa chừng, sửa rẻ

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Ngày bán không có thật trả 400 invalid-payload nêu trường ngày bán; không có sự kiện nào được ghi» chưa?
- Kết quả nào là SỐNG: [đề xuất] Ngày bán không có thật trả 400 invalid-payload nêu trường ngày bán; không có sự kiện nào được ghi
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Ngày bán không có thật trả 400 invalid-payload nêu trường ngày bán; không có sự kiện nào được ghi» khi hết timebox
- Timebox: …
