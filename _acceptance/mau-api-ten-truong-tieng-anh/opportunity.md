---
schema_version: 1
slug: mau-api-ten-truong-tieng-anh
feature: Đường API mẫu bảng hàng và mẫu bài của sàn (/api/v1/company/templates/export, /posts) và dữ liệu mẫu đã lưu dùng tên trường tiếng Anh; mẫu sàn đã lưu bằng tên cũ vẫn đọc và xuất được, lần lưu kế ghi tên mới.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-07T11:40:18Z   # ISO UTC — Cổng Bằng chứng #191 mau-bang-hang-va-bai: Ngoài-8 «mở hợp đồng mới» (sổ d-20261107T114018Z-45); luật 74 của đợt ghi «đã quyết»
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: mau-api-ten-truong-tieng-anh
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng mau-api-ten-truong-tieng-anh của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đường API mẫu bảng hàng và mẫu bài của sàn (/api/v1/company/templates/export, /posts) và dữ liệu mẫu đã lưu dùng tên trường tiếng Anh; mẫu sàn đã lưu bằng tên cũ vẫn đọc và xuất được, lần lưu kế ghi tên mới.

Vì sao: Ngoài-8 của mau-bang-hang-va-bai (#191): chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng 07/11 (sổ d-20261107T114018Z-45). Hàng không mã — đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: đã đạt «Đường API mẫu của sàn và dữ liệu mẫu đã lưu chỉ dùng tên trường tiếng Anh; mẫu sàn đã lưu bằng tên cũ vẫn đọc, sửa và xuất được, không mất mẫu nào» chưa? (Ngoài-8 của mau-bang-hang-va-bai)
- Kết quả nào là SỐNG: Đường API mẫu của sàn và dữ liệu mẫu đã lưu chỉ dùng tên trường tiếng Anh; mẫu sàn đã lưu bằng tên cũ vẫn đọc, sửa và xuất được, không mất mẫu nào
- Kết quả nào là CHẾT: chưa đạt câu SỐNG ở trên khi hết timebox
- Timebox: hết đợt dau-khach-nhap
