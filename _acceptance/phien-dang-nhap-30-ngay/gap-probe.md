---
slug: phien-dang-nhap-30-ngay
at: 2026-10-31T09:10:00Z
verdict: findings
p0: 1
p1: 2
p2: 2
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Chữ chủ kho chỉ là «phiên đăng nhập: 30 ngày»; trượt hay hết hẳn sau 30 ngày là chính sách an toàn chỉ người chốt. Dòng sổ bỏ trần tuyệt đối ghi lối chết «cần migration» là sai — chặn được theo createdAt ở bước chặn đầu | Chủ kho ký vì tin chỉ duyệt con số 30; ship chính sách phiên sống mãi khi dùng hằng ngày mà chưa ai hỏi | Dòng chỉ-người lên thẻ thành Hỏi-1 có khuyến nghị; dòng mới thay dòng bỏ trần | human-gate1: Hỏi-1 trên thẻ Cổng Phạm vi, dòng sổ chỉ-người thay dòng bỏ trần; thiết kế §4 sửa |
| P1 | evals | Chỉ đo cookie qh.session_token trên http; bản https dùng __Secure-qh.session_token | Dò tên cứng thì test xanh nhưng bản thật không bao giờ làm mới cookie | Ca https trong E5 với tên có tiền tố | fixed: AC-5 và E5 thêm ca bản https |
| P1 | evals | E5 đo chuỗi-có-mặt thay vì quan hệ: cookie trang phải trùng cookie better-auth, đủ HttpOnly, SameSite, Path | Dựng lại cookie chỉ với maxAge làm rơi HttpOnly mà E5 vẫn xanh | So giá trị token và từng thuộc tính | fixed: AC-5 và E5 đòi cùng token, HttpOnly, SameSite=Lax, Path=/, Secure ở https; thiết kế ghi chép nguyên văn Set-Cookie |
| P2 | design | Dòng sổ chọn bước chặn đầu bác thiếu lối gọi get-session từ trình duyệt | Người duyệt không cân giá | Dòng mới nêu cả hai lối | fixed: dòng sổ mới thay dòng cũ, lối trình duyệt chết vì /me trong tiến trình đã làm mới dòng phiên trước |
| P2 | contract | AC-3 thiếu thẻ (cross-layer) | Ca không ghi gì có thể viết thành test cấu hình | Gắn thẻ, E3 đọc expiresAt và updatedAt qua kết nối chủ | fixed: AC-3 có (cross-layer), E3 đọc cả updatedAt |
