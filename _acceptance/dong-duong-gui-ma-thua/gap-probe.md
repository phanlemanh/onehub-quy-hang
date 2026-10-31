---
slug: dong-duong-gui-ma-thua
at: 2026-10-31T12:45:00Z
verdict: findings
p0: 0
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals · contract · design | Giới hạn theo tập đường chưa được đo: E1 chỉ chạm đường chính; đường đổi email mang nhãn «gửi mã, có giới hạn» mà hôm nay trả 400, không bài nào gọi | Hook vẫn so một đường cứng mà mọi eval xanh; ngày bật đổi email thì đường ấy gửi mã không giới hạn | Duyệt toàn bộ OTP_SEND_PATHS; đường đổi email đổi nhãn hoặc được đo | fixed: hai đường đổi email chuyển sang «đã tắt» (404, sổ d-7); E1 duyệt toàn bộ OTP_SEND_PATHS; E4 thêm ca «hook gác theo OTP_SEND_PATHS» gọi thẳng hook với từng đường |
| P2 | evals | E3 có thể xanh vì gõ sai tên đường hay tiền tố | Ba đường trả 404 vì sai tên dù chưa tắt | Chứng tên đường là đường thật | fixed: E3 lấy danh sách đường từ nhãn «đã tắt» của bảng mà E4 đối chiếu với endpoints bản cài; chiều đỏ của mỗi eval phá thử trong S3 |
| P2 | contract · design | Lưới AC-4 chỉ đọc endpoints, bỏ sót hook gửi mã khi đăng ký và xác minh email lõi đổi sang mã | Nâng thư viện thêm hook gửi mã, lưới vẫn xanh | Ghim số hook và cấu hình xác minh email | fixed: AC-4 và E4 thêm ca «không lối gửi mã ngoài đường» ghim số hook after, hai cờ của plugin và sendVerificationEmail vắng |
