---
slug: va-sua-tren-o
at: 2026-11-01T03:55:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng d-…-3 ghi nguồn mục tiêu nhưng câu trích AC-9 hàng 15 chỉ quyết «vào Cần xem», không quyết «từ chối hoàn tác»; lối hỏi lại hay vào Cần xem vẫn sống — đánh đổi chỉ người có [sua-tren-o#F2] | Chủ kho ký tưởng luật đã chốt; gõ nhầm hai lần liền rồi Hoàn tác thông báo đầu bị từ chối, phải sửa tay; muốn lối khác thì AC-5, E4, E5 viết lại sau khi có code | Đổi thành câu Hỏi có khuyến nghị, supersedes d-…-3 | human-gate1: Hỏi-1 (sổ d-20261101T035548Z-6), nháp theo khuyến nghị «từ chối và báo» |
| P1 | evals | AC-5 hứa chặn cả lần sửa sau của người khác kéo về máy mà không eval nào đo; AC-5 thiếu cross-layer | Code đọc phiên bản từ chỗ chỉ đổi khi chính máy ghi; người khác sửa rồi bấm Hoàn tác cũ thì đè | Bài nhìn hai phiên, đếm sự kiện | fixed: thêm E5b (hai phiên dau-chu-1, truong-nhom), AC-5 gắn cross-layer |
| P1 | evals | AC-6 cross-layer chỉ có test hàm thuần tự dựng bản ghi; không đo nút và phím dùng chung một bản ghi | Thông báo giữ bản sao bản ghi, nút rồi phím ghi hai lệnh bù; E6 vẫn xanh | Bài nhìn đếm sự kiện hai chiều | fixed: thêm E5c (nút rồi phím, phím rồi nút), E6 đổi sang bộ giữ soHoanTac đếm lệnh bù từng chiều |
| P1 | evals | AC-2 hứa hộp hỏi lại và thông báo viết đúng giá, E2 chỉ đo dòng «Hiểu là», E3 đo hộp hỏi lại «nếu có» | Hộp hỏi lại vẫn làm tròn; giá trong ngưỡng nên hộp không hiện, E3 vẫn đạt | Ma trận chỗ hiện giá viết trước | fixed: E2 thành ma trận bốn chỗ × hai giá (đọc lại, giá chốt, mô tả cũ → mới, chữ điền sẵn), AC-2 liệt chỗ; E3 đổi phí để hộp hỏi lại luôn hiện |
| P2 | contract | Không nói lệnh bù có tạo bản ghi hoàn tác không; Ctrl+Z sau khi hoàn tác A đảo gì | Code theo chữ thiết kế thì Ctrl+Z đảo lại A; E5 bước 4 trượt vì đề mơ hồ | Thêm câu GWT, assert ở E6 | fixed: AC-6 thêm «lệnh bù không tạo bản ghi; Ctrl+Z đảo lần sửa thành công gần nhất», E5 bước 4 và E6 (a) đo |
