---
schema_version: 1
slug: rang-giu-khuon
feature: Một màn của nhóm dựng ngoài khuôn làm bài kiểm của kho đỏ và gọi đúng tên tệp cùng khối cấm; chỉ sửa tài liệu hay hồ sơ thì bài kiểm im
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T03:31:01Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 59
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 59 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-do-khuon-3110.md#9aed72b222ef4c2346957149830a3c21cf259723` — chưa có trang: trang nền, mã QK2

Một màn của nhóm dựng ngoài khuôn làm bài kiểm của kho đỏ và gọi đúng tên tệp cùng khối cấm; chỉ sửa tài liệu hay hồ sơ thì bài kiểm im

Vì sao: Lời dặn không giữ được điểm chọn khuôn khi tác tử viết mã; răng rẻ trước đắt sau: lint cấm nhập theo vùng rồi bài quét cho phần còn lại

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Tiêm một trang Cài đặt gọi thẳng khối cấm → đỏ, gọi đúng tên tệp và khối; chỉ sửa docs/ hay _acceptance/ → im; mọi màn hiện có xanh; ngoại lệ thiếu lý do → đỏ ở bước đọc bản đồ» chưa?
- Kết quả nào là SỐNG: [đề xuất] Tiêm một trang Cài đặt gọi thẳng khối cấm → đỏ, gọi đúng tên tệp và khối; chỉ sửa docs/ hay _acceptance/ → im; mọi màn hiện có xanh; ngoại lệ thiếu lý do → đỏ ở bước đọc bản đồ
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Tiêm một trang Cài đặt gọi thẳng khối cấm → đỏ, gọi đúng tên tệp và khối; chỉ sửa docs/ hay _acceptance/ → im; mọi màn hiện có xanh; ngoại lệ thiếu lý do → đỏ ở bước đọc bản đồ» khi hết timebox
- Timebox: …
