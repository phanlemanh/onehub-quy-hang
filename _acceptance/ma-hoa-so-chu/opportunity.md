---
schema_version: 1
slug: ma-hoa-so-chu
feature: Số điện thoại chủ nhà nằm trong cơ sở dữ liệu ở dạng mã hoá; chỉ cửa «Mở số» giải ra số cho người được thấy, đọc thẳng bảng hay bản sao lưu không ra số
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 62
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 62 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ton-nen-2.md#85a4e60f45b708157b5705b6b8bc702346d1ac99` — chưa có trang: trang nền, mã H11-H1

Số điện thoại chủ nhà nằm trong cơ sở dữ liệu ở dạng mã hoá; chỉ cửa «Mở số» giải ra số cho người được thấy, đọc thẳng bảng hay bản sao lưu không ra số

Vì sao: Hỏi-1 của hàng 11 tách mã hoá số chủ sang hàng sau; chủ kho đặt điều kiện phải xong trước khi có dữ liệu thật (ADR-0009, ADR-0010, bất biến 2)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Trên Postgres thử: mọi dòng số chủ là bản mã, truy vấn thẳng bằng vai chủ bảng không thấy chữ số nào của số gốc; «Mở số» trả đúng số và vẫn ghi một sự kiện mỗi lần; thiếu khoá thì máy chủ không khởi động thay vì ghi số rõ; dữ liệu mẫu đã có được mã hoá lại bằng một lệnh chạy lại không đổi kết quả; bộ kiểm cách ly xanh» chưa?
- Kết quả nào là SỐNG: [đề xuất] Trên Postgres thử: mọi dòng số chủ là bản mã, truy vấn thẳng bằng vai chủ bảng không thấy chữ số nào của số gốc; «Mở số» trả đúng số và vẫn ghi một sự kiện mỗi lần; thiếu khoá thì máy chủ không khởi động thay vì ghi số rõ; dữ liệu mẫu đã có được mã hoá lại bằng một lệnh chạy lại không đổi kết quả; bộ kiểm cách ly xanh
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Trên Postgres thử: mọi dòng số chủ là bản mã, truy vấn thẳng bằng vai chủ bảng không thấy chữ số nào của số gốc; «Mở số» trả đúng số và vẫn ghi một sự kiện mỗi lần; thiếu khoá thì máy chủ không khởi động thay vì ghi số rõ; dữ liệu mẫu đã có được mã hoá lại bằng một lệnh chạy lại không đổi kết quả; bộ kiểm cách ly xanh» khi hết timebox
- Timebox: …
