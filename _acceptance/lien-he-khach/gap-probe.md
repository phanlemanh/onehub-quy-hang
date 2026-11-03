---
slug: lien-he-khach
at: 2026-11-03T11:30:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design, contract | Thêm số thuộc liên hệ khác ra 409 cho đầu khách dò được số đã có trong sàn, trái câu «không dò được» của thiết kế; sổ không có dòng cho chọn này | Đầu khách tạo nhu cầu số mới rồi thêm thử từng số: 201 hay 409 cho biết số nào là chủ của sàn; E3, E4 vẫn xanh | Dòng chỉ-người Hỏi-6; dòng E4 so hai 409 cùng thân; sửa câu thiết kế và trục rò | human-gate1: Hỏi-6 trên thẻ; thiết kế §2.2–2.3 sửa câu, Coverage thêm trục rò có chủ đích, E4 thêm dòng số chủ nhà và so hai thân 409 |
| P0 | contract, design, sổ | Trần 30 căn ghi nguồn mục-tiêu mà câu trích không quyết; hai khán giả viện luật đợt không trích nguyên văn | Sàn gửi 40 căn cho nhóm môi giới ra 400, chủ kho tưởng trần có căn cứ | Dòng chỉ-người cho trần; trích nguyên văn khán giả; dòng đối chiếu §1 | human-gate1: Hỏi-7 trên thẻ; dòng -6 và -5 được thay bằng hai dòng mới (trích Tham chiếu mục 24 và hàng 12); bảng §1 thêm dòng trần căn |
| P1 | evals | E5 thiếu dòng căn «Chỉ tôi» của chính người gửi | Bản dựng kiểm bằng luật đọc của người gửi để lọt căn nháp của chính họ; E5 vẫn xanh | Thêm dòng; đổi chiều đỏ | fixed: E5 thêm dòng «Chỉ tôi do chính người gửi tạo → 400», chiều đỏ đổi theo |
| P1 | design, contract, evals | Không có cửa đóng nhu cầu mà E8 đòi đóng rồi bỏ loại | E8 phải ghi thẳng DB để đóng; người dùng thật không gỡ được loại Người mua | AC cho cửa đóng + dòng E8 đóng qua API | fixed: AC-7 thêm `POST /api/v1/prospects/{id}/close` (đầu khách giữ, trưởng nhóm), sự kiện `closed`; E7 thêm ca đóng; E8 đóng qua API; dòng sổ máy quyết «400, không tự đóng» |
| P1 | contract, evals | AC-8 nói số lượng số tăng một, E8 nói không đổi | Người chấm đánh fail AC-8 hay tự hiểu lại | Sửa Then cho khớp, thêm bước số B | fixed: AC-8 nói không đổi với cùng số, tăng một sau khi thêm số B; E8 thêm bước số B và so khoá bản xem |
