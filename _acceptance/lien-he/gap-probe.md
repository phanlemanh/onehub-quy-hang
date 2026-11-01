---
slug: lien-he
at: 2026-11-01T06:48:21Z
verdict: findings
p0: 1
p1: 4
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | evals | Fixture E9 không dựng lại trạng thái trước 016: ghi qua đường ghi đã có 016 rồi chỉ gỡ contact_id, liên hệ và dòng số mang ngữ cảnh mới vẫn còn | Hàm chuyển gộp sai, chép sai ngữ cảnh, chọn sai người giữ mà E9 vẫn xanh; chạy trên sàn thật thì gộp sai hay Mở số không giải được | Xoá cả contacts và contact_phones trước khi chạy hàm chuyển; assert enc_context bằng ngữ cảnh gốc viết trước; người giữ theo mốc mới nhất có đối chứng đảo mốc; chiều đỏ chép ngữ cảnh mới | fixed: E9 viết lại — xoá cả hai bảng, chụp từng byte cột cũ, assert enc_context gốc, đối chứng đảo mốc gán, hai chiều đỏ |
| P1 | design | Hỏi-1, Hỏi-2 ghi kho_dao false dù migration chạy trên mọi sàn; thiếu bằng chứng cột số cũ giữ nguyên để gỡ gộp | Chủ kho duyệt như đảo rẻ; sàn thật mất số đo lead cũ, gộp sai không gỡ được | Đổi kho_dao true kèm điều kiện đảo; assert cột số cũ giữ nguyên từng byte; migration in số lead theo sàn lúc chạy | fixed: hai dòng sổ mới kho_dao true (supersedes); AC-9 thêm giữ nguyên từng byte và in số lead, số liên hệ gộp theo sàn; Notes ghi đường đảo |
| P1 | evals | Không dòng sổ nào nêu tên ca hàng 27 bị đổi theo AC-7 | Bên dựng sửa thêm ca khác của hàng 27, hồi quy lọt qua cổng | Dòng sổ nêu tên ca; assert tập tên ca trước sau bằng nhau | fixed: dòng sổ «ca hàng 27 đổi theo AC-7» nêu năm ca; E6 đối chiếu tập tên ca và diff chỉ chạm các ca ấy |
| P1 | contract | Thiếu ca liên hệ chưa có người giữ ở trục ai xem và kiểm trùng | Luật đọc so NULL lộ liên hệ cho mọi đầu chủ; lead mới cùng số quay về đầu chủ đã trả | Thêm dòng chưa người giữ vào E2, E8; dòng số của liên hệ đã thôi người giữ vào E4 | fixed: AC-2 và AC-4 viết rõ; E2, E8 thêm dòng chưa có người giữ; E4 thêm dòng thứ năm |
| P1 | contract | AC-8 không nêu luật giữ loại chủ nhà; E8 chỉ chặn khi còn hàng | Bỏ Landlord khi còn lead mở thì liên hệ rời lớp nguồn — bất biến 2 gãy | Viết luật vào AC-8; bảng E8 (còn hàng, còn lead mở, không còn gì) × (bỏ Seller, bỏ Landlord, bỏ cả hai) | fixed: AC-8 thêm luật; E8 đổi thành bảng chín ô kèm đối chứng không còn liên kết |
