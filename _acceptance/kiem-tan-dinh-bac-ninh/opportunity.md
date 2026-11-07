---
schema_version: 1
slug: kiem-tan-dinh-bac-ninh
feature: Bài kiểm ca «Tân Định, Tỉnh Bắc Ninh» của bộ đọc địa chỉ ghim kết quả dương (tên xã vào «chưa có trong danh mục», trạng thái cụ thể) và có phá thử riêng chứng nó đỏ khi bộ đọc lui về so bỏ dấu — thay phép kiểm âm tính đứng một mình.
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build # nguồn: _acceptance/doc-xa-thieu-mot-phan-dau/decisions.jsonl d-20261107T011616Z-10 «Ngoài-1: mở hợp đồng mới» — build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-07T01:16:16Z    # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: kiem-tan-dinh-bac-ninh
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng kiem-tan-dinh-bac-ninh của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Bài kiểm ca «Tân Định, Tỉnh Bắc Ninh» của bộ đọc địa chỉ ghim kết quả dương (tên xã vào «chưa có trong danh mục», trạng thái cụ thể) và có phá thử riêng chứng nó đỏ khi bộ đọc lui về so bỏ dấu — thay phép kiểm âm tính đứng một mình.

Vì sao: Ngoài-1 của doc-xa-thieu-mot-phan-dau: ca «Tân Định, Tỉnh Bắc Ninh» chỉ kiểm âm tính. Chủ kho ký Cổng Bằng chứng 07/11 và chọn «mở hợp đồng mới» (d-20261107T011616Z-10); giám sát duyệt X-12. Hàng không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Ca «Tân Định, Tỉnh Bắc Ninh» đỏ khi bộ đọc trả rỗng, trả sai xã hay lui về so bỏ dấu; xanh trên bộ đọc hiện tại với kết quả dương ghim tường minh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Ca «Tân Định, Tỉnh Bắc Ninh» đỏ khi bộ đọc trả rỗng, trả sai xã hay lui về so bỏ dấu; xanh trên bộ đọc hiện tại với kết quả dương ghim tường minh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Ca «Tân Định, Tỉnh Bắc Ninh» đỏ khi bộ đọc trả rỗng, trả sai xã hay lui về so bỏ dấu; xanh trên bộ đọc hiện tại với kết quả dương ghim tường minh» khi hết timebox
- Timebox: …
