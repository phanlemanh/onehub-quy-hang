---
slug: logo-onehub
at: 2026-11-09T03:20:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

# Phản biện context sạch — logo-onehub

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Máy tự quyết việc khách của sàn thấy hình OneHub trên thẻ trình duyệt; căn cứ một-lối không đứng vì lối khác còn sống | Sàn hỏi vì sao link gửi khách có logo OneHub, mọi eval vẫn xanh | Một Hỏi ở Cổng Phạm vi, thêm AC và đo tuyến /s | human-gate1: Hỏi-2; đã thêm AC-7 và đo ở E7 |
| P0 | design | Câu trích của các dòng mục-tiêu chỉ liên quan, không quyết; hình không chữ là gu nhìn; không ghi CRM đang dùng dạng nào | CRM dùng bản ngang ở đăng nhập nên AC-2 có thể đánh FAIL đúng bản chủ kho muốn | Một Hỏi kèm ảnh hai phương án; dòng sổ mới có supersedes | human-gate1: Hỏi-1 (đã tra CRM: bản ngang ở đăng nhập, hình không chữ trong app) và Hỏi-3; fixed hai dòng còn lại bằng câu trích quyết được |
| P1 | evals | AC-3 hứa so với CRM nhưng E1 chỉ so bảng băm, không có bảng ánh xạ | Bảng băm sinh từ chính tệp đã chép, E1 tự so với mình | Bảng ánh xạ và eval băm thật từ CRM | fixed: bảng ánh xạ ở Notes, E9 băm trực tiếp bản CRM |
| P1 | contract | Cỡ hình, chữ thay thế và ca tối thật không được đo | Hình 12px hay ảnh «tối» thật ra là sáng mà E5, E6 vẫn xanh | AC về cỡ, đọc alt, đọc màu nền tính toán | fixed: AC-1, AC-2 ghi cỡ đúng ô hộp cũ và alt rỗng; E5, E6 đọc lớp tối và màu nền |
| P1 | contract | Favicon trên nền tối, máy đã cài, maskable chưa được nói tới | Máy đã cài vẫn thấy ba vạch trong khi cổng báo đạt | Notes nói rõ; ảnh favicon hai nền | fixed: Notes nói máy đã cài và maskable, service worker không cache; E7 chụp favicon trên nền trắng và đen |
