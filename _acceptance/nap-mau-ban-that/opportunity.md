---
schema_version: 1
slug: nap-mau-ban-that
feature: Chủ kho đăng nhập bản thật, chọn «[Mẫu] Sàn thử» và thấy đủ dữ liệu mẫu — 180 căn danh mục, 30 chủ nhà (số đã mã hoá), 40 hàng đủ sáu trạng thái, 12 lead có ca trùng, khu và người phụ trách — nạp bằng một nút chạy tay trên GitHub Actions, chạy lại không đổi gì, gỡ được đúng sàn mẫu mà không chạm sàn thật
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-01T06:32:41Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 87
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 87 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Chủ kho đăng nhập bản thật, chọn «[Mẫu] Sàn thử» và thấy đủ dữ liệu mẫu — 180 căn danh mục, 30 chủ nhà (số đã mã hoá), 40 hàng đủ sáu trạng thái, 12 lead có ca trùng, khu và người phụ trách — nạp bằng một nút chạy tay trên GitHub Actions, chạy lại không đổi gì, gỡ được đúng sàn mẫu mà không chạm sàn thật

Vì sao: Chủ kho 01/11 không thấy kết quả trên bản thật: mã đã deploy nhưng cơ sở dữ liệu thật chỉ có 2 sàn, 2 thành viên — 0 căn, 0 hàng, 0 chủ nhà, 0 lead, 0 khu; bộ nạp mẫu hàng 5 chỉ dựng sàn, tài khoản, khu; ADR-0009 chốt «chỉ dữ liệu mẫu tới khi pháp lý rà»

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Chạy nút nạp trên bản thật: sàn «[Mẫu] Sàn thử» có đủ danh mục, chủ nhà, hàng, lead, khu; số chủ nhà là bản mã giải được bằng khoá Production; tài khoản chủ kho là thành viên sàn mẫu; chạy lại không đổi gì; nút gỡ chỉ xoá sàn mẫu và tài khoản miền mẫu, sàn thật không đổi một dòng; bộ kiểm cách ly xanh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Chạy nút nạp trên bản thật: sàn «[Mẫu] Sàn thử» có đủ danh mục, chủ nhà, hàng, lead, khu; số chủ nhà là bản mã giải được bằng khoá Production; tài khoản chủ kho là thành viên sàn mẫu; chạy lại không đổi gì; nút gỡ chỉ xoá sàn mẫu và tài khoản miền mẫu, sàn thật không đổi một dòng; bộ kiểm cách ly xanh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Chạy nút nạp trên bản thật: sàn «[Mẫu] Sàn thử» có đủ danh mục, chủ nhà, hàng, lead, khu; số chủ nhà là bản mã giải được bằng khoá Production; tài khoản chủ kho là thành viên sàn mẫu; chạy lại không đổi gì; nút gỡ chỉ xoá sàn mẫu và tài khoản miền mẫu, sàn thật không đổi một dòng; bộ kiểm cách ly xanh» khi hết timebox
- Timebox: …
