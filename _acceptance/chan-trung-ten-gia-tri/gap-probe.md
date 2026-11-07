---
slug: chan-trung-ten-gia-tri
at: 2026-11-07T01:45:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-4 máy tự quyết cho đổi chéo tên, nguồn mục-tiêu không quyết được; Hỏi-7 hàng 46 đã chặn trùng tên mặc định của mọi giá trị — đánh đổi nghĩa sản phẩm chỉ người quyết | Sàn đổi chéo «Bao phí» ↔ «Không bao phí», khách đọc căn không bao phí là bao phí; người ký tưởng câu giao đã chốt | Thay d-4 bằng một Hỏi (chi-nguoi), AC-4, E1d(c), E2b theo câu trả lời | human-gate1: Hỏi-1 (khuyến nghị chặn như Hỏi-7), nháp theo khuyến nghị; AC-4, E1d(c), E2b đổi theo |
| P0 | design | Sổ d-6 ghi một-lối nhưng lối giữ dữ liệu trùng cũ và chỉ chặn trùng mới còn sống; chạm sàn đang dùng | Sàn có dữ liệu trùng cũ chỉ muốn đổi tên cột, nhận 400 nguyên khối không hiểu vì sao | Đổi d-6 thành Hỏi, hoặc đếm sàn có dữ liệu trùng trên bản thật | human-gate1: Hỏi-2 (khuyến nghị chặn cả lượt, màn báo lỗi ngay khi mở) |
| P1 | evals | Hứa màn hiện lỗi ở ô ngay khi mở từ dữ liệu trùng đã lưu nhưng không AC, không eval đo | Màn chỉ tính lỗi khi gõ, mở ra «Lưu» vẫn bật, máy chủ trả 400 chung chung | Ca E3 dựng màn từ bảng đã lưu trùng, đòi lỗi và khoá Lưu chưa cần gõ | fixed: AC-6 thêm vế trạng thái nạp; E3 ca (d) kèm đối chứng và chiều đỏ |
| P1 | evals | Câu lỗi hứa nêu giá trị kia nhưng eval chỉ đo chuỗi có mặt — chữ gõ vào trùng hẳn tên mặc định nên lặp chữ gõ cũng đạt | Câu lỗi «Tên này bị trùng: Bao phí» không nói giá trị nào, quản trị lạc giữa ba lý do ngừng | Ghim nguyên câu, dùng chữ gõ khác dạng chuẩn, ca riêng–riêng đòi tên anh em | fixed: E1, E1b, E1d, E3 ghim câu «Trùng tên của «…»», gõ khác hoa thường/dấu cách, ca riêng–riêng nêu đúng anh em; AC-1, AC-2, AC-6 ghim câu |
| P2 | evals | Ma trận E1 kê tay hai tập, ghim cứng 8 ô | Thêm tập đóng thứ ba mà luật chưa áp, E1 vẫn xanh | Sinh ma trận từ TAP_DONG, khẳng định danh sách tập và tổng n×(n−1) | fixed: E1 sinh từ TAP_DONG, khẳng định tập và số ô |
