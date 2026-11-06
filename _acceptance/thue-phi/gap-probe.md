---
slug: thue-phi
at: 2026-11-06T02:10:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dấu lấy cấu hình sàn lúc ghi, không phải định nghĩa phép tính thật dùng — máy tính cuộc gọi cho sửa môi giới một lần tính; sự kiện đồng bộ ngoại tuyến đẩy lên sau lần đổi; dòng sổ «một lối» có lối khác còn sống | Đầu chủ tính 1,5% trên máy tính rồi lưu giá, dấu ghi 2%; sự kiện ngoại tuyến làm ở t0 mang định nghĩa của t2 | Thêm ca ngoại tuyến vào E4; hợp đồng nói rõ máy tính không vào dấu | fixed: AC-4 nói dấu là định nghĩa của sàn lúc giá vào máy chủ (occurred_at do máy chủ gán), máy tính cuộc gọi không ghi gì (chốt hàng 28); E4 thêm ca made_offline; dòng sổ S1 thay bằng lối chết thật (máy khách tự khai định nghĩa) |
| P0 | design | Điền dấu mặc định cho giá cũ do máy quyết, câu trích không quyết việc điền ngược | Hồ sơ căn của giá cũ khẳng định định nghĩa mặc định trong khi đầu chủ đã báo chủ nhà khác | Chuyển thành câu hỏi có lối khác | human-gate1: Hỏi-3 (khuyến nghị điền mặc định, lối khác dấu «không ghi định nghĩa») |
| P0 | design | Bỏ Bảng hàng và bỏ design-pass ghi «một lối» trong khi lối kia còn sống | Người ký tưởng không còn lựa chọn; ngưỡng «người xem giá» chấm CHẾT ở Cổng Giá trị | Đổi thành câu hỏi | human-gate1: Hỏi-4 cho Bảng hàng và phạm vi người xem; rejected cho design-pass: dòng phụ là một dòng chữ trong dòng giá của khuôn ho-so-can có sẵn, ảnh thật ở E7c trước Cổng Bằng chứng |
| P1 | evals | AC-8 đi qua máy chủ mà chỉ có bài đơn vị | Màn cuộc gọi vẫn truyền hằng mặc định, E8 vẫn xanh | Thêm ui-check trên màn thật | fixed: E8b ui-check, AC-8 gắn (cross-layer) |
| P1 | contract | Ngưỡng ở ô cơ hội là đề xuất, timebox trống, «người xem giá» chung chung | Cổng Giá trị không chấm được hay chấm nới ngầm | Người khai ngưỡng và phạm vi | fixed: Đường đo trỏ từng vế tới AC/eval; phạm vi người xem theo Hỏi-4; deferred: timebox khai ở Cổng Giá trị |
