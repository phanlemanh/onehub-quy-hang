---
slug: hom-nay-dau-chu
at: 2026-11-01T14:10:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Mốc ép giá tính từ đổi giá thì «Còn · giữ giá» không đưa căn ra khỏi nhóm ép giá — AC-1 và AC-7 mâu thuẫn; luật này chỉ chủ kho quyết | E7 đỏ, hoặc máy tự chọn nghĩa và «đợt hai» không đếm được | Câu hỏi cho chủ kho, ma trận E1 thêm chiều xác nhận trước/sau mốc | human-gate1: Hỏi-1 viết lại (dòng sổ mới thay dòng cũ) gồm luật xác nhận; E1 thêm ca «luật mốc ép giá»; Đường đo đếm đợt hai bằng chạy lại hàm hàng đợi |
| P1 | contract | Người hai vai (Đầu chủ + telesales) không có GWT, E6 không thử | Trang if/else chỉ hiện một vùng, E6 vẫn xanh | AC-6 thêm Given hai vai, E6 thêm bước, E5 thêm ca | fixed: AC-6, AC-5, E5, E6 |
| P1 | evals | Đường kéo về của bộ đồng bộ không được đo, assert nguồn không có đối chứng dương | Trường mới không tới kho trên máy, hay lưới nguồn bị bỏ mà E4 xanh | Ca trên keoVe kèm đối chứng dương | fixed: thêm E4b (executors.test.web) |
| P1 | design | lastChangeBy chỉ giữ người của sự kiện cuối, thiếu giá cũ và vai | Trưởng nhóm giảm giá hôm qua, đầu chủ đổi trạng thái sáng nay → căn không vào Mới đổi | Hai bản ghi lần đổi cuối có lúc, người, vai, cũ → mới | fixed: design §3.2, AC-3, AC-4, E3, E4 |
| P2 | evals | E3 không thử khung 17:00–23:59Z khi giờ VN đã sang ngày | Tính «hôm qua» bằng ngày UTC thì 0–7 giờ sáng lấy lùi một ngày | Ca bayGio 18:00Z, chạy dưới hai múi giờ | fixed: E3 thêm ca ranh giới, design ghi UTC+7 cố định |
