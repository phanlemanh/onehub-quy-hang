---
schema_version: 1
slug: bang-quyen-theo-vai
feature: "Mọi thao tác ghi đọc quyền từ một bảng quyền thao tác × vai ở lõi. Trước hết: chỉ người có nhà Bảng hàng (Đầu chủ, Đầu khách, Trưởng nhóm) đọc và sửa được hàng; Telesales và Quản trị sàn chỉ thấy kết quả lead và cấu hình; đưa hàng lên «Đang bán» theo đúng cờ «Sẵn sàng bán» ở mọi lối; luật theo dòng của hàng và sự kiện hàng xét vai, không chỉ cách ly công ty."
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-11-05T13:38:36Z   # ISO UTC — chủ kho «Mở G1 ngay» (luật 74 của đợt, nhật ký giám sát)
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: bang-quyen-theo-vai
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng bang-quyen-theo-vai của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Mọi thao tác ghi đọc quyền từ một bảng quyền thao tác × vai ở lõi. Trước hết: chỉ người có nhà Bảng hàng (Đầu chủ, Đầu khách, Trưởng nhóm) đọc và sửa được hàng; Telesales và Quản trị sàn chỉ thấy kết quả lead và cấu hình; đưa hàng lên «Đang bán» theo đúng cờ «Sẵn sàng bán» ở mọi lối; luật theo dòng của hàng và sự kiện hàng xét vai, không chỉ cách ly công ty.

Vì sao: Chỗ hở G1 (kèm G7 phần hàng) của rà soát tạo/xem/sửa/xoá và phân quyền (docs/plan/ra-soat-crud-phan-quyen.md, PR #139): sửa giá, phí, trạng thái hàng «Toàn sàn» không kiểm vai, lệch luật 21 và bảng nhà theo vai §9. Chủ kho 05/11 «Mở G1 ngay», đọc §12 31/10 «mọi thành viên sàn sửa được» là «mọi thành viên có Bảng hàng». Hàng vá, không mã: đã quyết.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Bảng quyền viết trước, lấy bảng hai của tài liệu rà soát làm nháp, như bang-xem-nguon.json. Bộ kiểm gọi từng thao tác ghi bằng từng vai, ở API và luật theo dòng, và đếm khớp từng ô. Telesales và Quản trị sàn nhận «không có hàng này». Lệnh đưa lên Đang bán từ ô Trạng thái của Đầu khách bị từ chối như nút đã ẩn. Sổ điểm có dòng khoá trỏ về bảng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Bảng quyền viết trước, lấy bảng hai của tài liệu rà soát làm nháp, như bang-xem-nguon.json. Bộ kiểm gọi từng thao tác ghi bằng từng vai, ở API và luật theo dòng, và đếm khớp từng ô. Telesales và Quản trị sàn nhận «không có hàng này». Lệnh đưa lên Đang bán từ ô Trạng thái của Đầu khách bị từ chối như nút đã ẩn. Sổ điểm có dòng khoá trỏ về bảng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Bảng quyền viết trước, lấy bảng hai của tài liệu rà soát làm nháp, như bang-xem-nguon.json. Bộ kiểm gọi từng thao tác ghi bằng từng vai, ở API và luật theo dòng, và đếm khớp từng ô. Telesales và Quản trị sàn nhận «không có hàng này». Lệnh đưa lên Đang bán từ ô Trạng thái của Đầu khách bị từ chối như nút đã ẩn. Sổ điểm có dòng khoá trỏ về bảng» khi hết timebox
- Timebox: một vòng của đợt dau-khach-nhap (hàng vá, chủ kho quyết 05/11 — không qua Cổng Đáng riêng).
