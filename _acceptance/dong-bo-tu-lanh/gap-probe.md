---
slug: dong-bo-tu-lanh
at: 2026-10-31T14:17:00Z
verdict: findings
p0: 0
p1: 3
p2: 2
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | «Giữ của tôi» và «ghi rồi trả 503» chỉ đo trên máy chủ giả | Máy chủ giả đánh phiên bản khác API thật; trên API thật thao tác thứ hai 409 và căn quay lại Cần xem mà E7 vẫn xanh | Ca web_db trên API thật: Giữ của tôi đếm +2 đúng thứ tự; ghi rồi 503 đếm +1 | fixed: thêm E7b (web_db) gồm hai ca trên API thật |
| P1 | evals | Không ảnh 375 cho năm trạng thái, không ai đọc nhãn trợ năng hay biểu tượng | Điện thoại dùng chung biểu tượng «Mất mạng» cho mọi nguyên nhân; E9b vẫn xanh | Ma trận 375 năm ô: aria-label, lớp biểu tượng, href ô hết phiên | fixed: E9b thêm bước ma trận 375 viết trước năm ô; đặc tả UX nêu tên biểu tượng |
| P1 | design | Dòng bỏ design-pass ghi «một lối» trong khi lối kia sống | Chủ kho duyệt bằng chữ, tưởng không còn lựa chọn; thấy biểu tượng lần đầu ở S4 | Căn cứ mục tiêu có trích, hoặc nêu giá | fixed: dòng d-…-7 supersedes d-…-6, căn cứ mục tiêu trích luật giao diện, nêu giá trong why; đặc tả UX nêu biểu tượng từng trạng thái |
| P2 | evals | E4 không ghim lý do cho 403, 400 | 403 vào Cần xem với lý do sai mà E4 vẫn xanh | Bảng bốn hàng ghim nguyên chuỗi | fixed: AC-4 nêu lý do từng mã; E4 ghim nguyên cặp, 400 rút từ checkTransition |
| P2 | evals | Vế nhịp sống khi kho lỗi giữa lượt của AC-6 chưa đo | Kho lỗi trong lượt nhịp làm nhịp chết; kho hồi mà không tự lên | Ca nhịp đồng hồ giả: 0 unhandled rejection, kho hồi thì +1 | fixed: E6 thêm ca «kho lỗi giữa lượt nhịp» |
