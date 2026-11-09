---
slug: hom-nay-mot-danh-sach-viec
at: 2026-11-09T01:55:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | AC-3 không eval nào đi trọn từ nút tới máy chủ; ca «Chưa chia được» và giao xong trên điện thoại không có eval; mở giao lại trên điện thoại không có dòng sổ [chu-san-du-vai#F1] | Nút gỡ dòng lạc quan nhưng gọi sai lead, mọi bài vẫn xanh | E3 đọc lại hàng đợi và lead của đúng đầu chủ, đối chứng lead khác; thêm ca chưa chia; E10 giao xong | fixed: E3 thành backend-effect kèm đối chứng và ca Chưa chia được; E10 đọc lại máy chủ; thêm Hỏi-6 ở thiết kế và sổ |
| P1 | evals | AC-5 chỉ có test hàm thuần; đích bấm và phép quét số khách theo giá trị chưa đo; lớp nguồn chỉ đo ở đầu khách | Khuôn thật khác fixture, số khách nằm trong chuỗi lý do | E5b trên máy dev, dữ liệu qua API thật, so URL, quét mồi | fixed: thêm E5b, quét mồi ở cả bốn vai |
| P1 | contract | Dòng Lead đã nhập mâu thuẫn AC-2; thứ tự sàn; E2b có thể qua khi thiếu dữ liệu | Đầu màn báo thừa một việc không bao giờ hết; sắp lại phá thứ tự hàng 92 | AC-2 ghi rõ, E2 thêm ca thứ tự, E2b kiểm điều kiện trước | fixed: AC-2 ghi rõ dòng ấy không đếm và hiện cho ai, giữ thứ tự sàn; E2 và E2b sửa theo |
| P1 | contract | Mạng trở lại, mất mạng, hết việc, chỉ quản trị không có tiêu chí hay eval trực tiếp [chu-san-du-vai#F2] | Bốn dòng báo chồng dải ngoại tuyến; quản trị vẫn ở trang tạm | Thêm ca và ui-check, Coverage trỏ AC | fixed: AC-1, AC-9 thêm vế; thêm E1b; E9, E9b thêm bước mất mạng và có mạng lại; Coverage trỏ AC |
| P1 | contract | Hỏi-5 khuyên đổi tên nhóm nhưng Out of scope loại hẳn; điều khoá không có đầu ra đo; cột và thân chưa đo trên màn thật; `?nhom=` không có tiêu chí | Người dựng viết cứng tên nhóm; số cột lệch thân khi thử lại | Sửa Out of scope, AC-8, thêm E8b | fixed: Out of scope tách đổi tên; AC-8 thêm nhóm vai khác và `?nhom=` lạ; thêm E8b; E8 kiểm dòng điều khoá |
