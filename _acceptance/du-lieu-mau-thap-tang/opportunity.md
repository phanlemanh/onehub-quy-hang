---
schema_version: 1
slug: du-lieu-mau-thap-tang
feature: Bộ dữ liệu mẫu thứ hai — một khu thấp tầng có dãy và lô nhà phố, biệt thự, đất; nhà và đất ngoài khu ở vài phường; một file bảng hàng thấp tầng bẩn có đáp án; lead và chủ nhà giả — sinh từ khuôn, mọi bản ghi mang nhãn mẫu
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan — «build du-lieu-mau-thap-tang» (chủ kho gõ ở phiên giám sát 05/11)
decided_at: 2026-11-05T04:54:43Z     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 73
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 73 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/moi-loai-hinh-3110.md#ccc48fc8fec00f5ce684d6e9f4d9a9c953db1b21` — chưa có trang: trang nền

Bộ dữ liệu mẫu thứ hai — một khu thấp tầng có dãy và lô nhà phố, biệt thự, đất; nhà và đất ngoài khu ở vài phường; một file bảng hàng thấp tầng bẩn có đáp án; lead và chủ nhà giả — sinh từ khuôn, mọi bản ghi mang nhãn mẫu

Vì sao: Các hàng đo trên căn thấp tầng và căn ngoài khu cần dữ liệu giả có nhãn mà hàng 5 (một khu căn hộ) không có; phiên cắt tạo hàng này (cắt lượt bước 2b luật 5)

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Sinh lại hai lần ra cùng dữ liệu; tên đường là «Đường Mẫu N», số nhà sinh, tên tỉnh và xã từ danh mục đơn vị hành chính; không tên, số điện thoại hay địa chỉ thật; có đủ bốn loại hình, địa chỉ viết theo tên phường cũ và kiểu hẻm khác nhau kèm đáp án; mọi bản ghi mang nhãn mẫu và xoá được một lần» chưa?
- Kết quả nào là SỐNG: [đề xuất] Sinh lại hai lần ra cùng dữ liệu; tên đường là «Đường Mẫu N», số nhà sinh, tên tỉnh và xã từ danh mục đơn vị hành chính; không tên, số điện thoại hay địa chỉ thật; có đủ bốn loại hình, địa chỉ viết theo tên phường cũ và kiểu hẻm khác nhau kèm đáp án; mọi bản ghi mang nhãn mẫu và xoá được một lần
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Sinh lại hai lần ra cùng dữ liệu; tên đường là «Đường Mẫu N», số nhà sinh, tên tỉnh và xã từ danh mục đơn vị hành chính; không tên, số điện thoại hay địa chỉ thật; có đủ bốn loại hình, địa chỉ viết theo tên phường cũ và kiểu hẻm khác nhau kèm đáp án; mọi bản ghi mang nhãn mẫu và xoá được một lần» khi hết timebox
- Timebox: …
