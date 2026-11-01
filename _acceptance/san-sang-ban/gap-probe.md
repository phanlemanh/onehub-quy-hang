---
slug: san-sang-ban
at: 2026-11-01T15:42:00Z
verdict: findings
p0: 4
p1: 1
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | evals | Không bài nào đo cách nút đếm ảnh thật từ danh sách ảnh; định nghĩa ảnh thật phía web và máy chủ không bị ép giống nhau | Web đếm cả ảnh mẫu, nút báo đủ, máy chủ trả 400, hàng rơi vào Cần xem; E1–E8 vẫn xanh | Bài web đếm ảnh thật trên ma trận như E2 + bước ui-check căn chỉ có ảnh mẫu | fixed: thêm E5b (ma trận đếm như E2) và bước 4 của E8 (căn chỉ có ảnh mẫu); AC-6 ghi định nghĩa chung |
| P0 | contract | AC-6 qua máy chủ mà thiếu tag cross-layer, chỉ đo bằng hàm gửi giả; chưa nói khi máy chủ từ chối | Ảnh vừa xoá ở máy khác, nhãn hiện Đang bán trên máy nhưng máy chủ từ chối, không ai báo | Tag cross-layer + eval backend-effect qua API thật, ca máy chủ trả 400 | fixed: AC-6 gắn (cross-layer), thêm ca từ chối; thêm E6b (bộ đồng bộ nói với API thật, ca 200 và ca 400 về Cần xem có chữ «ảnh thật») |
| P0 | contract | Dòng sổ «Bảng hàng bỏ qua điều ảnh» ghi một lối, nhưng lối đọc số ảnh qua API khi có mạng vẫn sống — lựa chọn của người | Sửa hàng loạt 20 hàng báo xong rồi cả 20 về Cần xem; chủ kho ký mà không được hỏi | Chuyển thành Hỏi ở Cổng Phạm vi, dòng sổ mới supersedes | human-gate1: dòng sổ Hỏi-2 supersedes d-…-4, nêu cả hai lối và giá; AC-7 ghi theo Hỏi-2 |
| P0 | evals | AC-5 có phần nhìn («Chưa có» đúng ô, liên kết tới mục Ảnh) mà E8 không chụp | Hàm trả đích đúng nhưng màn không hiện «Chưa có» hay liên kết không cuộn | Thêm bước ui-check căn thiếu pháp lý và ảnh | fixed: bước 5 của E8 (căn thiếu pháp lý: chụp «Chưa có» và bấm «Ảnh thật» cuộn tới mục Ảnh); AC-8 ghi thêm |
| P1 | contract | Trạng thái ngoại tuyến (nút mờ, «Cần mạng để kiểm ảnh») không có AC hay eval | Lỗi đọc ảnh bị coi là 0 ảnh, báo sai «Còn thiếu: Ảnh thật», hoặc lệnh vào hàng đợi rồi bị từ chối | Thêm AC + bài web với nguồn ảnh lỗi | fixed: thêm AC-10 và E10 |
