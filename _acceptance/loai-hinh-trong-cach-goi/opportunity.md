---
schema_version: 1
slug: loai-hinh-trong-cach-goi
feature: Quản trị sàn đặt tên riêng cho loại hình (Liền kề, Shophouse…) ở Cài đặt › Cách gọi, neo vào giá trị RESO; cột Loại hình của Bảng hàng và hồ sơ căn hiện tên ấy.
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-08T08:02:15Z # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: loai-hinh-trong-cach-goi
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Căn cứ quyết: chủ kho gõ ở phiên dãy X, 08/11, nguyên văn «Thu, mở hàng sau» — trả lời câu thu vế «chữ cột Loại hình theo cách gọi riêng» khỏi AC-4 hàng 79 (`bang-hang-theo-loai-hinh`); giám sát dẫn căn cứ ở tra-loi X-20.

Mở từ hàng loai-hinh-trong-cach-goi của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Quản trị sàn đặt tên riêng cho loại hình (Liền kề, Shophouse…) ở Cài đặt › Cách gọi, neo vào giá trị RESO; cột Loại hình của Bảng hàng và hồ sơ căn hiện tên ấy.

Vì sao: Known limits của hàng 79 bang-hang-theo-loai-hinh: vế «chữ cột Loại hình theo cách gọi riêng của sàn» của AC-4 không đo được vì tập đóng của Cách gọi (hàng 45) chưa có loại hình. Chủ kho 08/11 ở phiên X: «Thu, mở hàng sau». Hàng không mã — đã quyết. Dãy X.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Quản trị đổi tên một loại hình ở Cách gọi: cột Loại hình của Bảng hàng và hồ sơ căn hiện tên mới; xoá tên riêng thì về tên mặc định» chưa?
- Kết quả nào là SỐNG: [đề xuất] Quản trị đổi tên một loại hình ở Cách gọi: cột Loại hình của Bảng hàng và hồ sơ căn hiện tên mới; xoá tên riêng thì về tên mặc định
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Quản trị đổi tên một loại hình ở Cách gọi: cột Loại hình của Bảng hàng và hồ sơ căn hiện tên mới; xoá tên riêng thì về tên mặc định» khi hết timebox
- Timebox: …
