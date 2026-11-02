---
slug: goi-tu-may-tinh
at: 2026-11-02T10:23:34Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-20261102T102230Z-2 ghi nguồn «mục tiêu», nhưng câu trích §13 chỉ chốt điều phải đạt, không chốt cách: chọn thông báo đẩy thay QR là đánh đổi sản phẩm (phải bật thông báo trước, thêm một chạm, toà và nhu cầu đi qua dịch vụ đẩy của Apple/Google). | Chủ kho ký Cổng 1 tưởng §13 đã chốt cơ chế thông báo; đầu chủ chưa bật thông báo trên điện thoại thì nút chỉ báo «chưa có điện thoại» — không ai đã chọn đánh đổi đó. | Dòng sổ chỉ-người thay -2, có khuyến nghị, căn cứ và đánh đổi. | human-gate1: Hỏi-1 (d-…-8, supersedes -2) — thông báo (khuyến nghị) hay QR |
| P0 | contract | Dòng sổ -7 cho thông báo tới mọi thiết bị kể cả máy tính, và lời báo đếm mọi thiết bị — lối chết nêu ra không giết lối máy tính gửi kèm điểm đăng ký của chính nó để đếm đúng. | Đầu chủ chỉ bật trên máy tính bấm nút → «Đã gửi tới 1 thiết bị — chạm thông báo trên điện thoại» mà không điện thoại nào nhận; E6, E8 vẫn xanh. | Ca viết trước: chỉ có đăng ký của máy tính đang gửi → lời báo «chưa có điện thoại»; đối chứng dương với một đăng ký điện thoại. | fixed: máy tính gửi kèm endpoint, máy chủ trả otherDevices, lời báo đếm theo nó (d-…-9 supersedes -7; AC-1, AC-4, AC-5; E5 ba dòng, E6, E8) |
| P1 | evals | AC-6 hứa lead không của mình ra «Không thấy…» và vai khác không thấy trang, nhưng E9 chỉ thử mã sai khuôn; thiết kế không nói trang đọc toà và nhu cầu từ cửa nào. | Đầu chủ khác mở /units/call/dial?lead=<id hợp lệ của người khác> thấy toà và nhu cầu; E9 vẫn xanh. | Khung có bảng: đầu chủ khác → «Không thấy…» và không có tên toà trong DOM; trưởng nhóm → 404; đối chứng dương dc1 thấy tên toà. | fixed: thiết kế nêu cửa đọc GET /leads/assigned/{id} (kiểm người được giao); E9 thêm khung 4b (đầu chủ mẫu 2, trưởng nhóm), khung 1 là đối chứng dương |
| P1 | contract | Đường đo đếm dòng hộp thư có tag quay-so: không ra số lần bấm (n dòng mỗi lần bấm; n = 0 không để dòng); vết mở số không tách lối. | 3 thiết bị × 10 lần bấm đếm ra 30; người chưa bật bấm 10 lần đếm ra 0 — số đo sai ở phiên nghiệm thu. | Đếm theo bộ (người, tag, mốc ghi); khai rõ ca n = 0. | fixed: Đường đo đếm bộ (user_id, tag, created_at) khác nhau, khai giới hạn n = 0 và vết không tách lối |
| P1 | design | Dòng -6 bỏ design-pass vì «không có lựa chọn bố cục mới», nhưng trang quay số là màn mới và «khuôn trang một việc» không trỏ khuôn có sẵn. | Chủ kho duyệt bằng chữ; tới E9 khổ 375 mới thấy nút không rộng hết khổ — thêm một lượt chấm. | Gắn dòng bỏ với khuôn có sẵn cụ thể, hoặc dựng bản bấm được. | fixed: dòng bỏ mới d-…-10 (supersedes -6) trỏ khuôn cuoc-goi (KhungCuocGoi, design/patterns/cuoc-goi.md); khổ 375 đo ở E9 khung 1 |
