---
slug: can-trung-ma-hai-toa
at: 2026-10-31T14:18:00Z
verdict: findings
p0: 2
p1: 2
p2: 1
claims_input: ok
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «dùng chung kết cục nhiều căn» ghi căn cứ mục tiêu, nhưng câu trích Tham chiếu chỉ quyết trùng giữa hai dự án, và thêm giá trị kết cục không phạm khoá thân của hàng 9 [vong-giao-dien-qua-ban-do#F1] | Người ký tin Tham chiếu đã chốt trùng trong toà, thật ra là lựa chọn của máy có nghĩa sản phẩm | Thay dòng bằng câu hỏi có khuyến nghị | human-gate1: dòng mới Hỏi-1 (supersedes d-20261031T141437Z-2), soạn theo khuyến nghị dùng chung |
| P0 | contract | Dòng sổ «đếm nhiều căn là hụt» ghi một lối, nhưng hai lối khác sống (bỏ khỏi mẫu số, tính là đúng) và cách đếm định nghĩa lại chỉ số §11 mà ngưỡng do người đặt | Tỉ lệ trên danh mục thật lệch ngưỡng vì cách đếm máy chọn | Thay dòng bằng câu hỏi có khuyến nghị | human-gate1: dòng mới Hỏi-2 (supersedes d-20261031T141437Z-5), soạn theo khuyến nghị tính là hụt |
| P1 | evals | E3 đối chứng âm không ghim kết cục của toà có thật mà mã không có ở toà ấy | Người dựng trả toà lạ cho toà có thật, E3 vẫn xanh | Ghim status not_in_catalog, thêm vế vào AC-3 | fixed: AC-3 nêu not_in_catalog kèm dự án và mã chuẩn hoá; E3 so bằng status và read; thiết kế mục 4 |
| P1 | contract | AC-4 hứa 404 qua API mà thiếu (cross-layer); E5 không đo vế toà thuộc dự án khác qua API | Đường bỏ qua dự án khi có toà, cả E4 và E5 xanh | Gắn cross-layer, thêm ca API có đối chứng dương | fixed: AC-4 gắn (cross-layer); E5 và E9 (backend-effect, AC-4) đo hai vế 404 và đối chứng 200 |
| P2 | evals | E7, E8 đòi git diff rỗng mà lệnh test không sinh bằng chứng ấy | Sửa thân ca hàng 9 giữ tên, chấm xanh | Eval script git diff | fixed: bỏ vế không đo được khỏi E7, E8; giữ thân ca là việc soát diff của lượt chấm (cmd phải là ref config, config.yaml ngoài ranh giới) |
