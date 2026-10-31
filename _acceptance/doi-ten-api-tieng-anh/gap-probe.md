---
slug: doi-ten-api-tieng-anh
at: 2026-10-30T17:08:37Z
verdict: findings
p0: 3
p1: 2
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ bỏ đường cũ (d-3) trích ADR-0005 câu về gửi email — câu chỉ liên quan, không quyết việc gỡ đường trong /api/v1 | Chủ kho ký chính sách phá tương thích mà không biết; bên gọi gãy không ai báo | Dòng mới thay d-3 với lối chết nêu được, hoặc thành câu hỏi | fixed: dòng d-10 thay d-3, căn cứ một-lối — ADR-0005 mục 7 cấm bản thật khởi động khi thiếu bộ gửi email, chưa bản thật nào chạy nên không có bên gọi đường cũ; kết nối Invest không qua các đường này |
| P0 | design | Dòng sổ d-9 gộp ba thứ giữ; vế tên tệp không có lối chết nào | Người duyệt tin giữ tên tệp là bắt buộc; kho còn trái luật code tiếng Anh | Tách tên tệp ra dòng riêng có căn cứ riêng | fixed: tách — cookie và thẻ nhật ký ở d-11 (một-lối); tên tệp thành câu chỉ-người d-12, lên thẻ Cổng Phạm vi thành Hỏi-1, khuyến nghị giữ ở hàng này |
| P0 | design | Lối chết của d-5 (một hằng API_ERRORS) vòng tròn qua AC-4; không ghi việc màn phụ thuộc gói API | Web không nhập được gói API, phải đổi chỗ đặt hằng sau Gate 1 | Dòng mới với lối chết độc lập, nêu bằng chứng web đã phụ thuộc gói API | fixed: dòng d-13 thay d-5 — web đã nhập @quy-hang/api (apps/web/package.json, src/lib/api.ts); hai nguồn chuỗi lệch nhau không ai báo vì màn tra câu báo theo mã |
| P1 | evals | AC-5 thiếu nhãn xuyên lớp; step6 của E5 mở đường cũ ở trạng thái phiên mơ hồ (proxy đưa về /login khi chưa đăng nhập); vế mạng không có tệp chứng | E5 đỏ dù mã đúng, hoặc vế mạng ghi đạt không chứng | Nhãn xuyên lớp + eval backend; ghim trạng thái phiên; đòi tệp mạng có đối chứng dương | fixed một phần: E5 mở đường cũ khi đã đăng nhập và đã chọn sàn (AC-5 nói rõ chưa đăng nhập thì về /login); E5 đòi evidence network với đối chứng dương POST /api/v1/me/company 200. rejected phần nhãn xuyên lớp: trang chuyển hướng theo danh sách sàn của /me (companies, activeCompany), không theo mã lỗi — mã no-company / select-company do E3 đo ở API |
| P1 | evals | E1 so tập đường, không so phương thức; tập kỳ vọng không nói rõ /auth/** và /openapi.json | Đổi PATCH thành PUT mà E1 vẫn xanh | Ma trận mười cặp (phương thức, đường) viết trước | fixed: E1 so tập mười cặp viết trước; AC-1 ghi rõ /auth/** không nằm trong OpenAPI, như trước (đường đăng nhập gắn bằng api.on, không qua api.openapi) |
