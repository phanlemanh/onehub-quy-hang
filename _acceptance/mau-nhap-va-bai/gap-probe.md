---
slug: mau-nhap-va-bai
at: 2026-11-05T13:29:49Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | decisions | Dòng bỏ đường đo do máy quyết nhưng ngưỡng vẫn nói ba loại mẫu, timebox trống — khai ngưỡng là việc người | Chủ kho ký vì tin ngưỡng đã thành tiêu chí; Cổng Giá trị chấm CHẾT vì thiếu hai loại mẫu | Thành Hỏi cho người, đề nghị câu ngưỡng mới | human-gate1: Hỏi-4 (dòng thay, khuyến nghị câu SỐNG mới ở contract mục Đường đo) |
| P0 | decisions | Dòng bỏ quét phủ trích câu bật không quyết; Coverage hở trục dạng tiêu đề và lưu lỗi [va-ho-so-lien-he#F1] | Tiêu đề «Giá/m2» không sửa được; lưu 400 hộp đóng im | Thêm trục, AC, eval; đổi nguồn | fixed: thêm trục dạng tiêu đề (E2, E3 năm dạng) và lưu bị từ chối / lỗi mạng (AC-9, E9b); human-gate1: Hỏi-5 |
| P0 | decisions | Dòng chỉ Quản trị trích ADR-0011 không quyết, câu cắt cụt | Cổng 1 ký trên câu không quyết | Trích câu ngưỡng đã ký | fixed: dòng thay trích ngưỡng của ô cơ hội đã ký build |
| P1 | design | Không nói mốc so lần nhập; không ca mở trước sửa ghi sau | Bản sửa của quản trị mất im lặng khi đầu chủ ghi lần nhập dở | Chốt mốc, thêm ca hai chiều | fixed: mốc là lúc mở (design §2, dòng sổ); E1b, E2, E3 thêm ca xen kẽ |
| P1 | evals | Lớp nguồn chỉ đo ở API; E8 assert có điều kiện | SQL chèn thẳng đưa quy đổi cột chủ nhà vào sổ mẫu | Ràng buộc bảng + bảng ca chèn thẳng | fixed: ràng buộc quy đổi chỉ ở năm trường đóng (design §2); E5 bảng chèn thẳng bốn ca + đối chứng; E8 kiểm ràng buộc có mặt |
