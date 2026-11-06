---
schema_version: 1
slug: doc-xa-thieu-mot-phan-dau
feature: Bộ đọc địa chỉ nhận ra phường khi người gõ thiếu một phần dấu (ví dụ «Phường Tan Định», «Phường Đong Ba») mà không dựng lại lỗi khớp nhầm tên giữa tỉnh (Tân Định ↔ Tân Dĩnh).
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # nguồn: _acceptance/danh-muc-xa-day-du/decisions.jsonl d-20261106T070204Z-21 «Ngoài-1: mở hợp đồng mới» — build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06T07:02:04Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: doc-xa-thieu-mot-phan-dau
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng doc-xa-thieu-mot-phan-dau của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bộ đọc địa chỉ nhận ra phường khi người gõ thiếu một phần dấu (ví dụ «Phường Tan Định», «Phường Đong Ba») mà không dựng lại lỗi khớp nhầm tên giữa tỉnh (Tân Định ↔ Tân Dĩnh).

Vì sao: Ngoài-1 của danh-muc-xa-day-du: gõ thiếu một phần dấu thì không ra phường. Chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 06/11 (dãy X, X-11). Làm trước hàng 76 vì 76 lưu khoá địa chỉ. Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Gõ thiếu một phần dấu ra đúng phường trong tỉnh đã chọn; hai phường khác tỉnh chỉ khác dấu không khớp nhầm; bộ thử danh mục xã cũ vẫn xanh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Gõ thiếu một phần dấu ra đúng phường trong tỉnh đã chọn; hai phường khác tỉnh chỉ khác dấu không khớp nhầm; bộ thử danh mục xã cũ vẫn xanh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Gõ thiếu một phần dấu ra đúng phường trong tỉnh đã chọn; hai phường khác tỉnh chỉ khác dấu không khớp nhầm; bộ thử danh mục xã cũ vẫn xanh» khi hết timebox
- Timebox: …
