---
schema_version: 1
slug: va-thuoc-ci-ho-so-moi-truong-that
feature: "Thước của hai hồ sơ đã ký đo bước triển khai cũ được đưa về đúng bước triển khai mới: bài kiểm CI của hồ sơ môi trường thật kiểm job deploy chờ bộ cách ly trên cơ sở dữ liệu tạm, áp migration rồi kiểm nhanh chỉ đọc rồi mới gọi Vercel, không chạy bộ kiểm ghi trên bản thật; eval chạy bộ cách ly trên bản thật của hồ sơ môi trường thật và eval thứ tự deploy cũ của hồ sơ ràng buộc bản mã khai không chạy, trỏ tới tiêu chí đã ký của hai hàng đo lại chúng; ghim lại hai hồ sơ cũ xanh (Ngoài-3 của hàng va-deploy-csdl-tam, chủ kho mở hợp đồng mới 06/11)."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build        # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-06     # ISO UTC — chủ kho chọn «mở hợp đồng mới» cho Ngoài-3 ở Cổng Bằng chứng va-deploy-csdl-tam (signoff 06/11); giám sát mở hàng theo quyết định ấy
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: va-thuoc-ci-ho-so-moi-truong-that
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng va-thuoc-ci-ho-so-moi-truong-that của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Thước của hai hồ sơ đã ký đo bước triển khai cũ được đưa về đúng bước triển khai mới: bài kiểm CI của hồ sơ môi trường thật kiểm job deploy chờ bộ cách ly trên cơ sở dữ liệu tạm, áp migration rồi kiểm nhanh chỉ đọc rồi mới gọi Vercel, không chạy bộ kiểm ghi trên bản thật; eval chạy bộ cách ly trên bản thật của hồ sơ môi trường thật và eval thứ tự deploy cũ của hồ sơ ràng buộc bản mã khai không chạy, trỏ tới tiêu chí đã ký của hai hàng đo lại chúng; ghim lại hai hồ sơ cũ xanh (Ngoài-3 của hàng va-deploy-csdl-tam, chủ kho mở hợp đồng mới 06/11).

Vì sao: Ngoài-3 của hàng va-deploy-csdl-tam (PR #176): thước kiem_ci và cach_ly_that của hồ sơ đã ký moi-truong-that, bat-rang-buoc-ban-ma còn đòi bộ cách ly chạy trên bản thật; chủ kho chọn mở hợp đồng mới ở Cổng Bằng chứng 06/11.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Lưới trước gộp và làn ghim lại của moi-truong-that, bat-rang-buoc-ban-ma xanh trên main sau hàng; bài kiểm CI của moi-truong-that đỏ khi job deploy chạy lại bộ kiểm ghi trên bản thật» chưa?
- Kết quả nào là SỐNG: [đề xuất] Lưới trước gộp và làn ghim lại của moi-truong-that, bat-rang-buoc-ban-ma xanh trên main sau hàng; bài kiểm CI của moi-truong-that đỏ khi job deploy chạy lại bộ kiểm ghi trên bản thật
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Lưới trước gộp và làn ghim lại của moi-truong-that, bat-rang-buoc-ban-ma xanh trên main sau hàng; bài kiểm CI của moi-truong-that đỏ khi job deploy chạy lại bộ kiểm ghi trên bản thật» khi hết timebox
- Timebox: …
