---
slug: truc-ai-thay-hang
at: 2026-10-31T03:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Ai được ghi vào hàng «Toàn sàn» của người khác là câu chỉ người chốt, máy đã tự chốt mà sổ không ghi | Chủ kho duyệt mà tưởng hàng chỉ chạm quyền đọc; một thành viên bất kỳ đưa hàng Đang bán của người khác sang Ngừng hẳn | Dòng sổ chỉ-người, lên thẻ thành Hỏi-2; vế 200 của AC-5 theo câu người chốt | human-gate1: thành Hỏi-2 (sổ, thiết kế §4, AC-5 ghi «theo Hỏi-2»); người chọn «chỉ người tạo» thì E5 thêm ca Y ghi vào hàng Toàn sàn bị từ chối |
| P0 | contract | Dòng bỏ đổi nấc bằng tay trích ngưỡng chỉ liên quan, không quyết | Chủ kho tin ngưỡng đã loại việc này; đầu chủ phải bấm Sẵn sàng bán sớm để chia hàng | Ghi dòng mới thay, căn cứ một lối nêu ranh giới | fixed: dòng sổ mới mang supersedes, căn cứ một lối (packages/core/src/listing ngoài ranh_gioi hàng 12); Out of scope nêu lý do ranh giới |
| P1 | evals | Lời hứa «cùng một câu trả lời 404» chỉ đo ở đọc một hàng | Đường gửi lệnh trả 404 với lời báo khác; E5, E7, E8 vẫn xanh | So cả thân với cùng lời gọi vào mã không có, riêng từng loại lệnh | fixed: AC-5, AC-7, AC-8 và E5, E7, E8 so deepEqual thân với lời gọi cùng loại vào mã ngẫu nhiên không có |
| P1 | evals | Không eval nào chứng minh không còn đường khác chạm hàng | Đường mới (lịch sử, tìm kiếm) trả hàng Chỉ tôi cho Y, E3–E9 vẫn xanh | Ca liệt đường từ OpenAPI thật, so bảng viết trước | fixed: thêm AC-10 và E10 (đọc /api/v1/openapi.json, bảng bốn đường, đối chứng dương cấy đường lạ) |
| P1 | evals | Bảng E1 chọn tay, thiếu đường lần đầu Đang bán từ Tạm ngừng | Cài đặt hiểu «có lối Incomplete→Active»; hàng qua Hold rồi mới Active nằm Chỉ tôi suốt lúc bán | Bảng ánh xạ 12 lối ADR-0008, thêm Incomplete→Hold→Active | fixed: E1 thêm cột lối ADR và các dòng Incomplete→Hold→Active, Active→Pending→Active, Active→Closed, Incomplete→Hold→Withdrawn; E9 thêm đường tạo→Hold→Active |

Hai mục nhỏ người phản biện nêu ngoài bảng: phép quét chữ «Active» của E9 — fixed: bỏ (vế so nấc từng hàng đã đo quan hệ);
`POST /listings` trả `visibility` — fixed: thêm vào AC-3 và E3.
