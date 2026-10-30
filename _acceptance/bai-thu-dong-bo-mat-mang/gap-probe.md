---
slug: bai-thu-dong-bo-mat-mang
at: 2026-10-30T07:45:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

# Phản biện context sạch — bai-thu-dong-bo-mat-mang

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Hạ T3 (lộ trình) xuống T2 (config) mà sổ không ghi — bỏ bước duyệt kế hoạch là việc người quyết | Chủ kho duyệt mà không biết đang bỏ bước duyệt kế hoạch | Dòng sổ chi-nguoi, ký ở Cổng Phạm vi | human-gate1: dòng sổ chi-nguoi «T2 hay T3» lên thẻ thành câu hỏi |
| P0 | design | Bỏ design-pass và đặc tả UX dựa trên câu luật chỉ liên quan, không quyết | Trang thử khó đọc trên điện thoại, phiên thật hỏng vế mất mạng | Trích câu quyết, không có thì chi-nguoi | human-gate1: hai dòng mới chi-nguoi thay hai dòng cũ (supersedes) |
| P0 | evals | Số chủ đi xuống theo đường nào không nói; E2 chỉ so bảng số chủ | Dòng thay đổi mang số chủ, A2 nhận số của A1, E2 vẫn xanh | Quét toàn văn mọi dữ liệu kéo về với ma trận số chủ × vai | fixed: design nói rõ số chủ không đi qua sổ thay đổi, kéo riêng dưới luật theo dòng; AC-2 xét toàn bộ dữ liệu; E2 quét toàn văn có đối chứng dương và ca A1 đổi giá |
| P1 | evals | E3 không chứng minh máy chủ thật chạy bằng vai không vượt luật theo dòng | Tài khoản siêu người dùng vượt luật, cách ly thật nằm ở máy chủ | /keo trả current_user, rolbypassrls false; phá thử tắt cả ba luật | fixed: AC-3 + E3 (layer backend-effect) đo current_user và rolbypassrls của máy chủ thật, phá thử tắt luật cả ba bảng |
| P1 | contract | Vế cách ly ở phiên thật không có luật kết luận viết trước | Bảng ghi «đạt» theo luật đặt sau khi thấy số | AC-9 + E9 thêm luật và ca đỏ | fixed: AC-9 thêm luật vế cách ly theo ma trận vai; E9 thêm ca kéo chứa dòng sàn khác → không đạt |
