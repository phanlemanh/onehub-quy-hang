---
slug: mo-san-trung-ten
at: 2026-10-31T13:40:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E4 chỉ đặt sàn mới, chưa đo cách ly theo người: người mới đặt sàn cũ | Người mới lỡ được chèn vào thành viên sàn cũ mà E4 vẫn xanh | Thêm vế người mới đặt sàn cũ, kèm chiều đỏ chèn người vào sàn cũ | fixed: E4 và AC-4 thêm vế người mới đặt sàn cũ và chiều đỏ thứ hai |
| P1 | evals | Phép đo phủ định có thể xanh vì bảng rỗng; companies không có cột company_id | Dựng dữ liệu hỏng lặng, mọi đếm ra 0 | Đếm bằng vai chủ trước, chỉ xét bảng có dòng; đo riêng companies theo id | fixed: E4 đếm bằng vai chủ, đòi ba bảng trong nhóm đã xét, thêm đo companies theo id |
| P1 | contract | Chạy lại chưa đo khi có từ hai sàn cùng tên | Chỉ xét sàn đầu nên mỗi lần chạy lại sàn thứ hai lại tạo sàn mới | Ca chạy lại sàn thứ hai trong hai sàn cùng tên | fixed: AC-2 và E2 thêm ca chạy lại sàn thứ hai; thiết kế mục 1 xét mọi sàn cùng tên |
| P2 | evals | E1, E3 dùng tên cố định, daCo tuyệt đối phụ thuộc lần chạy trước | Chạy db:test hai lần thì đỏ giả | Nhãn chạy hoặc dọn | fixed: E1, E3 đòi tên và email mang nhãn chạy, chạy hai lần liên tiếp vẫn xanh |
| P2 | design | Quy tắc chạy lại mơ hồ (thành viên hay quản trị); chạy lại không có dòng báo | Nhân viên được mời được coi là chạy lại, công ty mới không có sàn mà không ai thấy | Chốt quy tắc, đo dòng báo chạy lại | fixed: chạy lại chỉ khi là quản trị (sổ d-6), ca thành viên thường ra sàn mới, AC-5 và E5 đo dòng «chạy lại — sàn có sẵn» |
