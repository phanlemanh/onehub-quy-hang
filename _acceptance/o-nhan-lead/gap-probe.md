---
slug: o-nhan-lead
at: 2026-10-31T14:40:00Z
verdict: findings
p0: 3
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Dòng sổ bỏ «lead trùng lead đang chờ chia» ghi căn cứ mục tiêu; câu trích chỉ liên quan, không quyết | Hai telesales gọi trúng một chủ trong vài phút đều ra «Không trùng»; người ký tưởng lộ trình đã chốt; số đo «lead trùng bị chặn» đếm thiếu | Dòng sổ chỉ-người kèm khuyến nghị và lối khác; Đường đo nói rõ chưa đếm loại này | human-gate1: thành Hỏi-5 (dòng d-20261031T142734Z-16 thay -13); Đường đo và Out of scope ghi rõ |
| P0 | design | Dòng sổ «lead là bản ghi riêng» ghi một-lối nhưng lối khác còn sống (ngoại lệ telesales ở trục ai thấy hàng); §4 Tham chiếu bị trái mà nói giữ chữ | Chủ kho ký mà không thấy điều đang đúng của sản phẩm bị đổi; bảng riêng khoá đường cho hàng 25, 22, 17 | Dòng sổ chỉ-người hai lối có giá; sửa câu §4 cùng PR | human-gate1: thành Hỏi-4 (dòng -15 thay -2); design mục 2, 7 nói rõ §4 sửa câu theo Hỏi-4 |
| P0 | contract | Dòng sổ vai nhập lead trích một dòng bảng vai, không phủ vế đầu chủ, trưởng nhóm, quản trị sàn 403 | Quản trị sàn sàn nhỏ bị chặn khi lên thật; người ký tưởng bảng vai quyết đủ năm dòng | Trích đủ bảng hay ghi chỉ-người | fixed: dòng -17 thay -6, căn cứ một-lối trỏ bảng ACTIONS của navigation.ts (hàng 53 đã ký: company_admin chỉ import, buyer_agent không nút) |
| P1 | evals | AC-10/E10 không đo nút khoá lúc gửi, năm ô trống lại + tiêu điểm, mã ngoài danh mục | Màn giữ chữ sau gửi gây gửi trùng hay bấm hai lần ra hai lead mà E10 vẫn đạt | Thêm vế và bước chụp, kết quả mong đợi ghi rõ | fixed: AC-10 thêm bốn vế; E10 thêm bước Slow 3G, mã Z-99.99, đọc activeElement; design bỏ «Nhập lead khác»/«Gửi lại» (ô tự trống, bấm Gửi lead lần nữa) |
| P2 | contract | AC-6..AC-9 thiếu tag (cross-layer); AC-5 «bảng chờ chia» không định nghĩa | Bỏ đối chiếu chéo lớp; người chấm không có thứ để so | Gắn tag; viết AC-5 đo được | fixed: gắn tag AC-6..AC-9; AC-5 thành outcome new, không đầu chủ khớp, không hàng khớp |
