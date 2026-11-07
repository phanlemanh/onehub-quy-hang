---
slug: mau-api-ten-truong-tieng-anh
at: 2026-11-07T12:14:40Z
verdict: findings
p0: 3
p1: 1
p2: 1
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ «không migration, hạng T2» ghi một-lối nhưng lối migration vẫn sống — tốn hơn, không chết | Cổng 1 duyệt T2 mà không biết máy tự gỡ lối migration khỏi bàn | Thành Hỏi cho chủ kho, khuyến nghị kèm căn cứ | human-gate1: thành Hỏi-1 (sổ d-20261107T121440Z-9 thay dòng cũ), khuyến nghị không migration |
| P0 | design | Sổ «ghi chặt» trích luật khuôn cấp vào của packages/connect — chỉ liên quan, không quyết hành vi ghi của /api/v1; lối nhận tên cũ khi ghi vẫn sống | Tab màn Mẫu mở từ trước lúc phát hành lưu bằng tên cũ, bị 400, mất phần vừa sửa mà không AC nào nói | Thành Hỏi; giữ ghi chặt thì nêu giới hạn tab cũ | human-gate1: thành Hỏi-2 (sổ d-20261107T121440Z-10), khuyến nghị từ chối; Notes hợp đồng nêu giới hạn tab cũ |
| P0 | design | Hai dòng bỏ đặc tả UX và ui-observed trích câu không quyết; tệp tsx bị chạm mà không eval nào dựng màn | Một tsx đọc trường cũ qua JSON lỏng, màn hiện tên trống mà bài thuần vẫn xanh | Bài dựng màn so chữ hiển thị giữa dạng cũ và mới | fixed: thêm E6c (ô Cột theo, tin màn Gửi) và E7c (BangMauBang, BangMauBai); hai dòng bỏ thay bằng d-…-11, d-…-12 trỏ hai bài này |
| P1 | evals | E5b, E7 dùng fixture dạng cũ viết tay theo khuôn bên đọc, không lấy từ bên ghi cũ thật | Bản lưu thật của #191 khác fixture, sàn mở ra mất mẫu mà ca DB vẫn xanh | Fixture rút từ đường ghi cũ thật, ghim commit nguồn | fixed: E5b đòi fixture là đầu ra nguyên văn của kiemMauBang, kiemMauBai ở main 9f7df527 cho một thân PUT đã biết, so sâu; E7, E6c, E7c dùng chung fixture ấy |
| P2 | evals | Chiều ghi thiếu ca mẫu lẫn name và ten; E7b không đo lý do của mẫu bài | Dạng lẫn lọt vào kho, hay lỗi lời mẫu bài hiện nguyên văn kỹ thuật | E4 thêm ca lẫn (6 ca); E7b thêm ca opening | fixed: E4 thêm ca lẫn, đếm 6; E7b thêm ca share.post_templates.zalo.opening, 2 ca |
