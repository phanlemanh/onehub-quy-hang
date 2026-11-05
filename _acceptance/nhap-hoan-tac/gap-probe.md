---
slug: nhap-hoan-tac
at: 2026-11-05T00:00:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ bỏ đường đo ghi nguồn «một lối» với lý do «không có ngưỡng thì không có thước», nhưng ngưỡng trống không làm lối kia chết — máy vẫn đề xuất được ngưỡng và lệnh đo từ dữ liệu đã lưu [nhap-nho-mau#F2] | Cổng 1 ký một căn cứ một-lối sai; Cổng Giá trị không có số | Dòng chỉ-người thay dòng cũ, kèm ngưỡng đề xuất | human-gate1: Hỏi-5 (dòng sổ mới supersedes d-20261104T234026Z-11), mục Đường đo ghi lối khác và ngưỡng đề xuất |
| P0 | design | Máy tự chốt «sửa sau» gồm mọi sự kiện (kể cả xác nhận, kể cả của người nhập) và căn đã gửi link vẫn gỡ; câu trích của hoàn tác ô sửa chỉ liên quan, không quyết [nhap-nho-mau#F1] | Đầu chủ gọi xác nhận rồi hoàn tác thì căn nhập sai ở lại; khách mở link thấy căn không còn | Dòng chỉ-người Hỏi-4 có khuyến nghị; AC-1, AC-3 ghim theo câu trả lời | human-gate1: Hỏi-4 (dòng sổ mới supersedes d-20261104T234026Z-3) |
| P1 | design | Thiết kế cho lan-doi lọc hàng voided thì máy ngoại tuyến không bao giờ nhận sự kiện voided; E7c đưa sự kiện tay vào | Hàng đã gỡ nằm mãi trong kho máy | Ca Postgres: lần đổi vẫn trả sự kiện voided; đối chứng Bảng hàng lọc | fixed: thiết kế §3.1 và AC-7 nói lan-doi không lọc; thêm E7d (backend-effect) |
| P1 | evals | AC-4 thiếu cross-layer; hai lý do không đo qua POST /undo, E4 dùng dòng viết tay | Đường ghi thật lưu khác khuôn viết tay, API phân loại sai mà E4 vẫn xanh | AC-4 cross-layer + E4b qua đường ghi thật | fixed: AC-4 gắn (cross-layer), thêm E4b |
| P2 | contract | Trạng thái hộp xác nhận (nút tắt khi không có gì, khoá khi ghi, lỗi giữa chừng, huỷ) chưa ghim trong AC và eval | Hộp vẫn cho bấm khi không có gì; lỗi chung chung, lần nhập kẹt | Mở rộng AC-5, thêm assert E8 và khung E8b | fixed: AC-5 thêm ba trạng thái, E8 thêm 6 assert, E8b thêm khung loi-giua-chung |
