---
slug: danh-muc-xa-day-du
at: 2026-11-06T04:30:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Hai mục Out of scope là nghĩa sản phẩm mà sổ không ghi ai quyết: huyện cũ dạng «Thành phố/TP <tên>» ra cần người chọn, và không kéo lại nguồn định kỳ [va-duong-so-n#F1] | Địa chỉ cũ «Phường X, Thành phố <tỉnh lỵ>, Tỉnh Y» là cách viết phổ biến nhất trước 2025 — hàng 76 chạy với nhiều địa chỉ không khoá; danh mục cũ đi tiếp không ai đặt hạn đối chiếu | Mỗi mục một dòng sổ; mục chỉ-người thành câu hỏi | fixed: huyện cũ dạng Thành phố, Thị xã đưa vào phạm vi (AC-9, E9, dòng sổ mot-loi); kéo định kỳ thành Hỏi-2 (chi-nguoi), Out of scope ghi «theo Hỏi-2» |
| P1 | evals | Ma trận AC-5 lấy mã cũ nhỏ nhất của tỉnh — thường rơi vào phường của thành phố tỉnh lỵ, dạng từng để ngoài phạm vi | E5 đỏ vì lý do đã descope, hoặc thợ đổi luật chọn ma trận sau khi viết | Viết trước luật cho dòng huyện thành phố | fixed: AC-5 và E5 chọn xã cũ có huyện cũ dạng Quận/Huyện; dạng Thành phố, Thị xã đo riêng ở AC-9 |
| P1 | evals | Số đối chiếu đếm bằng chính bộ đọc của bộ sinh — không oracle độc lập, số đo chưa ghim | Bộ giải xlsx làm rơi vài trăm dòng, bảng và tập nguồn cùng thiếu, E2 vẫn xanh | Ghim số viết trước, đếm độc lập bằng regex | fixed: E1, E2 ghim 3.321 · 2.599 · 709 · 13 · 168 · 10.571 · 10.034 · 442 và đếm TABLE, row bằng regex trên XML thô |
| P1 | contract | Không có tổ hợp xã cũ + huyện cũ + tỉnh cũ | Bước đổi tỉnh cũ chạy tách khỏi bước tìm xã cũ: «Xã A, Huyện B, Tỉnh Hà Giang» ra thiếu mà E3, E5 xanh | Ma trận mỗi tỉnh cũ một xã cũ kèm huyện cũ | fixed: AC-3 và E3 thêm dạng (ii) xã cũ + huyện cũ + tỉnh cũ, 2 × số tỉnh cũ assert |
| P2 | evals | Nhánh tỉnh cũ vào hai tỉnh mới mang «nếu có» — có thể không ca nào chạy | Bộ đọc lấy đại tỉnh mới đầu tiên mà E3 xanh | In số đếm; ca bản sao khi bằng 0 | fixed: E3 in số đếm và luôn chạy ca âm tính trên danh mục bản sao kèm đối chứng dương |
