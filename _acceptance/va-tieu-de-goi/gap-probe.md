---
slug: va-tieu-de-goi
at: 2026-11-03T14:43:00Z
verdict: findings
p0: 0
p1: 2
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | Ca «đường khác giữ như trước» của E2 chỉ liệt ba nhà, không có ma trận đủ nhà của vỏ | Tách hàm làm tiêu đề một nhà khác (Bảng hàng) đổi hay rơi về «Quỹ hàng» mà E2 vẫn xanh | Bảng viết trước đủ nhà kèm tiêu đề ghim, mỗi nhà một assert, một assert số nhà = số khoá lõi | fixed: E2 nay ghim đủ năm nhà của HOME_LABEL, thêm assert số nhà bằng số khoá |
| P1 | contract | Phần tử «/units trần» của trục A không có AC hay eval | Hàm mới cho «Căn » với /units mà Coverage vẫn báo phủ đủ | Thêm /units vào AC-2 và một assert trong ma trận E2 | fixed: AC-2 nêu /units trần, E2 assert «Quỹ hàng» |
| P2 | evals | E3 chỉ đi lối vào từ dòng lead, không đi dòng căn ép giá | Nút ép giá dẫn đường khác, thanh trên vẫn «Căn …» mà E3 xanh | Thêm bước bấm «Ghi cuộc gọi» ở nhóm ép giá, ghi địa chỉ ?hang=, chụp | fixed: E3 thêm bước ép giá và ảnh E3-ep-gia.png; AC-1 nêu ?hang= |
| P2 | evals | Expected của E5 không ghim dòng ra của bài quét khuôn | Bài quét khuôn bị bỏ qua mà lint vẫn thoát 0, AC-3 ký chưa đo | Ghim dòng ra bài quét khuôn trong expected | fixed: E5 ghim dòng «khuôn: <n> nhóm · 0 lỗi đọc · 0 lệch» |
