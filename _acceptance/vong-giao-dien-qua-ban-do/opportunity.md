---
schema_version: 1
slug: vong-giao-dien-qua-ban-do
feature: Chủ sản phẩm duyệt một vòng giao diện và thấy màn mới đặt cạnh màn mẫu của nhóm, cùng khổ và cùng trạng thái; nhóm chưa có trong bản đồ thì chính vòng ấy tạo mục bản đồ và khuôn
owner: phanlemanh@gmail.com
stage: decided                # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T03:31:01Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 60
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 60 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-do-khuon-3110.md#9aed72b222ef4c2346957149830a3c21cf259723` — chưa có trang: trang nền, mã QK3, mã QK4

Chủ sản phẩm duyệt một vòng giao diện và thấy màn mới đặt cạnh màn mẫu của nhóm, cùng khổ và cùng trạng thái; nhóm chưa có trong bản đồ thì chính vòng ấy tạo mục bản đồ và khuôn

Vì sao: Khuôn của một nhóm sinh ra cùng màn đầu tiên của nhóm (không dựng trước màn); số đo mỗi vòng giao diện là bằng chứng gửi kit cho các mục chờ KH-C1…KH-C5

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Ảnh màn mới cạnh màn mẫu có ở Cổng Phạm vi của vòng chạm giao diện; luật «màn đầu của nhóm mới tạo mục bản đồ» nằm trong vo-va-ia.md và skill quy-hang-ui; hồ sơ vòng ghi số tệp theo khuôn, số lần răng bắt, lệch lọt» chưa?
- Kết quả nào là SỐNG: [đề xuất] Ảnh màn mới cạnh màn mẫu có ở Cổng Phạm vi của vòng chạm giao diện; luật «màn đầu của nhóm mới tạo mục bản đồ» nằm trong vo-va-ia.md và skill quy-hang-ui; hồ sơ vòng ghi số tệp theo khuôn, số lần răng bắt, lệch lọt
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Ảnh màn mới cạnh màn mẫu có ở Cổng Phạm vi của vòng chạm giao diện; luật «màn đầu của nhóm mới tạo mục bản đồ» nằm trong vo-va-ia.md và skill quy-hang-ui; hồ sơ vòng ghi số tệp theo khuôn, số lần răng bắt, lệch lọt» khi hết timebox
- Timebox: …
