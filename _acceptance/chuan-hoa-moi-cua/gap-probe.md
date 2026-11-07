---
slug: chuan-hoa-moi-cua
at: 2026-11-07T04:05:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Không eval nào đo trang xem trước tự nạp cách gõ đã duyệt từ máy chủ (ND7 phần người nhìn thấy) | Trang không gọi API từ điển, đầu chủ nhập lần hai vẫn thấy cần người, mọi eval xanh | ui-check làm đủ vòng duyệt rồi tải lại tệp | fixed: E2u thêm bước duyệt qua API rồi tải lại, ô chuẩn hoá thẳng |
| P1 | evals | Không eval nào đo nút gợi ý thật sự gửi đề xuất (AC-3 xuyên lớp) | Nút chỉ gọi suaO, từ điển không bao giờ có dòng từ người dùng | Sau khi bấm gợi ý đọc GET từ điển | fixed: E2u thêm bước GET sau khi bấm, đòi đúng một dòng proposed pick_count 1 |
| P1 | design | Sàn có thể ghi đè cách gõ dựng sẵn hay tên chuẩn trỏ giá trị khác — đánh đổi nghĩa sản phẩm chưa có dòng quyết | POST «bao phi» → excluded được duyệt, mọi lần nhập đổi nghĩa im lặng | Thêm Hỏi, E10 thêm ô | human-gate1: Hỏi-4 (khuyến nghị cấm); AC-10 và E10 nháp theo khuyến nghị |
| P2 | evals | Không ui-check chụp trạng thái trống của màn Từ điển | Màn trống vỡ bố cục, cổng vẫn xanh | Chụp trước khi tạo dữ liệu | fixed: E9u thêm bước 0 chụp trạng thái trống |
| P2 | evals | Ngưỡng «không gọi dịch vụ ngoài» không có đo; thiếu ca số giấy tờ | Thêm gọi mạng vào hàm gợi ý, E1 vẫn xanh | Chặn mạng trong ca, thêm hàng CCCD | fixed: E1 chặn fetch và lối mạng, thêm «CCCD 012345678901» |
