---
slug: va-duong-so-n
at: 2026-11-05T22:22:05Z
verdict: findings
p0: 1
p1: 2
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Không gộp «Đường 5» với «Đường số 5» là nghĩa sản phẩm mà sổ ghi máy quyết (descope nguồn mục-tiêu, kho_dao false) | Chủ kho ký phạm vi tưởng việc để sau chưa ai chốt; hàng 76 lưu khoá dạng «so 5», muốn gộp sau phải dựng lại khoá | Một dòng Hỏi chỉ-người cho dạng khoá, Out of scope ghi theo Hỏi | human-gate1: thêm Hỏi-1 (chi-nguoi, kho_dao true, supersedes dòng descope), Out of scope ghi «theo Hỏi-1» |
| P1 | evals | E1 hứa «phá vật thật → năm ca đỏ»: executor test không có đường sửa mã rồi chạy lại, và AC-5 đúng ra vẫn xanh khi phá | Người chấm làm bước phá thấy AC-5 xanh, đánh trượt E1 dù bản vá đúng | Bỏ vế phá vật thật, giữ phá thử qua tachSoNhaVoi | fixed: bỏ vế phá vật thật khỏi expected E1 |
| P1 | evals | E5 kiểm sha trong tệp ảnh là đo chuỗi-có-mặt, không chứng ảnh sinh từ bộ đọc trước vá | Ảnh bị chụp lại sau vá vẫn mang sha cũ, AC-5 so mã với chính nó | Script chụp lại ở sha trong ảnh và so từng byte | deferred: nguồn gốc nằm trong lịch sử git — commit ảnh 00a88e58 đứng ngay trên 01f7cc3a và chỉ thêm tệp ảnh, người chấm đối chiếu bằng git show; không thêm script vì CI clone nông không dựng được worktree ở sha cũ |
| P2 | evals | Đối chứng âm E2, E3, E4 dựng một phần bằng bản sao, không qua chỗ nối thật | Bản sao lệch mã thật, lỗi ở nhánh gộp «số5»/«số 05» không bị bắt | Chỗ nối thật cho bước gộp «số» | rejected: E2 dùng kết quả docDiaChi thật chỉ đổi unparsedAddress; E3 dùng chính bộ tách trước vá qua tachSoNhaVoi và khoaDiaChi thật; bản sao của E4 là đúng ba dòng luật hàng 75 — thêm chỗ nối vào tenDuongChuan chỉ để thử là phình mã sản phẩm |
