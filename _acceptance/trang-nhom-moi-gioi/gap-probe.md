---
slug: trang-nhom-moi-gioi
at: 2026-11-05T23:02:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Hiệu lực của định nghĩa phí đi ngược với hiệu lực của mức chia, mà sổ không ghi lựa chọn này | Môi giới báo khách «Bao phí» theo link hôm trước; sàn đổi định nghĩa phí, cùng link đó đổi nghĩa mà không ai biết | Một dòng sổ trích hiệu lực của điểm #8, hoặc đưa thành câu hỏi ở Cổng Phạm vi | fixed: điểm #8 khai hiệu lực «mới» → định nghĩa phí chụp vào Lần gửi lúc gửi (cột fee_inclusion ở 048); đã sửa AC-2, AC-9, E2b, E9, trục Coverage; dòng sổ nguồn mục-tiêu trích sổ điểm biến thiên |
| P0 | design | Hai dòng sổ ghi «chỉ một lối» (một link chung; tải tệp trên máy người mở) trong khi lối kia vẫn dùng được | Chủ kho ký mà tưởng hai chỗ này không còn lựa chọn | Đổi nguồn của hai dòng thành chỉ-người, hoặc trích câu thật sự quyết | fixed: thay bằng Hỏi-5 (một link) và Hỏi-6 (tải trên máy người mở), mỗi dòng mang supersedes |
| P1 | evals | Năm trạng thái của bảng trạng thái không eval nào chạm tới | Link tắt ra trang 404 mặc định, tải lỗi thì nút im lặng, mà mọi eval vẫn xanh | Thêm bước vào E10, thêm bài thuần ghim chữ của từng trạng thái | fixed: E10 thêm bước link tắt, mã sai, lỗi đọc, tải lỗi, không quyền; thêm E10c ghim chữ sáu trạng thái |
| P1 | contract | Trục «trạng thái căn» không AC hay eval nào dựng căn đã cọc hoặc đã bán | Excel hiện giá căn đã bán mà bộ chấm vẫn xanh | Thêm ý vào AC-1; E1 dùng bảng ba trạng thái căn; E5 so ô giá | fixed: AC-1 thêm dòng mờ và giá theo luật ẩn; E1 dùng bảng ba trạng thái; E5 so ô giá của căn đã bán; E10 có bước nhìn dòng mờ |
| P1 | evals | E6 đo mô hình đưa vào bộ vẽ, không đo ảnh thật | Bộ vẽ cắt mất cột cuối, mô hình đúng nên eval vẫn xanh | Gọi đúng hàm vẽ trên canvas giả, hoặc mở ảnh ra xem | fixed: E6 gọi hàm vẽ của nút trên canvas giả ghi lại lệnh fillText; E10 có bước mở ảnh PNG |
