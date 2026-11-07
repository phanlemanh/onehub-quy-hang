---
schema_version: 1
slug: va-thuoc-ci-moi-truong-that-ban-that
feature: "Thước của hồ sơ đã ký moi-truong-that được đưa về bước triển khai mới: bài kiểm CI đo deploy chờ bộ cách ly trên cơ sở dữ liệu tạm, áp migration rồi kiểm nhanh chỉ đọc rồi mới gọi Vercel, giữ đủ tám vế; eval chạy bộ cách ly trên bản thật khai không chạy, trỏ va-deploy-csdl-tam#AC-2; chủ kho tự ghim lại hồ sơ trên máy mình bằng một lệnh (phần còn lại của Ngoài-3 hàng va-deploy-csdl-tam)."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06     # ISO UTC — chủ kho chọn «mở hợp đồng mới» cho Ngoài-3 ở Cổng Bằng chứng va-deploy-csdl-tam (signoff 06/11); giám sát tách phần moi-truong-that sang hàng này 07/11
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-thuoc-ci-moi-truong-that-ban-that
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-thuoc-ci-moi-truong-that-ban-that của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Thước của hồ sơ đã ký moi-truong-that được đưa về bước triển khai mới: bài kiểm CI đo deploy chờ bộ cách ly trên cơ sở dữ liệu tạm, áp migration rồi kiểm nhanh chỉ đọc rồi mới gọi Vercel, giữ đủ tám vế; eval chạy bộ cách ly trên bản thật khai không chạy, trỏ va-deploy-csdl-tam#AC-2; chủ kho tự ghim lại hồ sơ trên máy mình bằng một lệnh (phần còn lại của Ngoài-3 hàng va-deploy-csdl-tam).

Vì sao: phần còn lại của Ngoài-3 hàng va-deploy-csdl-tam (PR #176): bài kiểm CI (E7) của hồ sơ đã ký moi-truong-that còn đòi job deploy chạy bộ kiểm cách ly trên bản thật, và E3 chạy bộ ấy trên bản thật; hàng va-thuoc-ci-ho-so-moi-truong-that (PR #185) tách phần này ra vì ghim lại moi-truong-that cần biến môi trường của bản thật — chủ kho tự chạy.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Bài kiểm CI của moi-truong-that ĐẠT tám vế trên bước triển khai mới và đỏ khi deploy chạy lại bộ kiểm ghi; lưới trước gộp của moi-truong-that xanh sau khi chủ kho ghim lại» chưa?
- Kết quả nào là SỐNG: [đề xuất] Bài kiểm CI của moi-truong-that ĐẠT tám vế trên bước triển khai mới và đỏ khi deploy chạy lại bộ kiểm ghi; lưới trước gộp của moi-truong-that xanh sau khi chủ kho ghim lại
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Bài kiểm CI của moi-truong-that ĐẠT tám vế trên bước triển khai mới và đỏ khi deploy chạy lại bộ kiểm ghi; lưới trước gộp của moi-truong-that xanh sau khi chủ kho ghim lại» khi hết timebox
- Timebox: …
