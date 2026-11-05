---
slug: man-lien-he
at: 2026-11-05T04:13:49Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hai ô «Khoá» ở bảng đối chiếu (ai mở số; báo tên người giữ khi dò số) không thành dòng sổ — máy quyết ngầm lựa chọn quyền | Cổng Phạm vi ký mà không thấy chính sách quyền; sau gộp phải làm lại hàm 036 | Mỗi ô Khoá có dòng sổ; thẻ liệt Hỏi | fixed: quyền mở số thành dòng sổ mục tiêu trỏ ADR-0021 qđ 3 (đã niêm); báo tên người giữ thành Hỏi-6; dòng Sổ điểm biến thiên ghi ở S3 |
| P1 | evals | Ma trận vai của E3, E5 thiếu người giữ mất vai, quản trị, hai vai không giữ | Hàm chỉ so người giữ — đầu chủ đổi vai vẫn mở số, E5 xanh | Một bảng viết trước dùng chung ba đường | fixed: E3, E5 dùng chung bảng chín dòng qua ba đường; chiều đỏ là dòng «người giữ đã mất vai» |
| P1 | contract | «Số cơ hội mở» chưa định nghĩa, có thể lộ cơ hội phía khách cho đầu chủ | Đầu chủ thấy 3 ở danh sách, hồ sơ liệt 1 | Assert quan hệ danh sách ↔ hồ sơ | fixed: AC-1 ghim định nghĩa; E6b, E7 thêm assert quan hệ |
| P1 | contract | Điểm bắt đầu đếm ba chạm không có dòng sổ, điện thoại dài hơn | Phiên nghiệm thu đếm trên điện thoại, phán chết | Dòng sổ chốt cách đếm; E10b ghi số chạm | fixed: Hỏi-7 chốt đếm trên máy tính từ nhà Liên hệ; AC-5, E10b theo đó |
| P2 | design | Thiết kế ghi bốn số cuối, AC-4 và E4 ghi ba | Người dựng theo thiết kế làm E4 đỏ | Ba nơi khớp nhau | fixed: thiết kế sửa thành ba số cuối |
