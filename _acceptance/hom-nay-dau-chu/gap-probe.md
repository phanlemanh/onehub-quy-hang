---
slug: hom-nay-dau-chu
at: 2026-11-01T14:45:00Z
verdict: findings
p0: 1
p1: 4
p2: 0
---
## Findings

Lượt hai — sau khi chủ kho chọn «hàng đợi là dữ liệu của sàn» (lượt một: 1 P0 thành Hỏi-1, 3 P1 và 1 P2 đã sửa).

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Khoảng ngày 1–365 nới khoảng 7–14 của luật 18 mà không ai quyết; chưa nói khoá cũ hay bộ của sàn thắng | Sàn đặt ép giá 3 ngày, nhận 200; đầu chủ làm phiền chủ nhà | Câu hỏi cho chủ kho; E4 thêm ca ngoài khoảng, ca khoá cũ + bộ sàn | human-gate1: Hỏi-4; design chốt bộ của sàn là trọn bộ (khoá cũ hết tác dụng), bộ hỏng thì mặc định dùng ngưỡng khoá cũ; E1, E4 thêm ca |
| P1 | design | Mốc ép giá không lùi về lúc lên Đang bán; nhóm lead thiếu điều kiện ngầm | Căn mới lên hôm qua hiện ngay ở ép giá | Ca căn lên 11 ngày / 3 ngày; lead trả lại không ra | fixed: mốc `gia` lùi về lúc lên Đang bán; điều kiện ngầm của nhóm lead; E1, E6 thêm ca |
| P1 | design | Loại hình chưa đi xuyên lớp, tập giá trị chưa khai | Nhóm «Nhà phố» luôn rỗng không báo lỗi | Tập mã RESO PropertySubType; ca qua ghép danh mục thật; ca ngoài tập | fixed: design khai tập mã và nguồn (ghép danh mục của Bảng hàng); E2 thêm ca web qua ghepDanhMuc; E4, E4b thêm ca ngoài tập |
| P1 | design | Bộ kiểm chưa soát lệch đối tượng giữa nhóm, điều kiện, hành động | Nhóm căn có nút Nhận, bấm ra 404 | Ca chéo loại trong E4, E4b | fixed: bộ kiểm thêm lệch đối tượng và nhóm luôn rỗng; E4 ma trận 11 ca, E4b ca 400 |
| P1 | design | Mất mạng hay lỗi đọc thì chia nhóm theo bộ nào chưa nói | Sàn tắt nhóm, mất mạng thì nhóm hiện lại | Bước E10 với bộ của sàn và offline | fixed: bộ nhóm lưu trên máy theo sàn, báo giờ lưu; AC-10, E10 sửa |
