---
slug: va-bang-hang-cot-thap-tang-khi-loc-rong
at: 2026-11-09T02:35:52Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Câu trích không quyết cách làm; còn lối khác; ca rỗng vì ô lọc chung ra bộ cột lai | Lọc Đất, ô đất khớp, gõ Giá không khớp: bộ cột về căn hộ, cột đất mất | Dòng sổ mới; AC-3 ghi toàn bộ cột; E3 mảng viết trước | fixed: đổi sang giữ bộ cột lần gần nhất còn dòng, câu giao «ở nguyên» quyết lối này; dòng sổ mới supersedes; AC-3, E3 toàn mảng |
| P0 | design | Căn cứ bỏ design-pass không quyết; không đo khối báo rỗng | Khối báo rỗng lệch ở 1440 × 900 mà E5 xanh | Dòng sổ mới; E5 thêm khối báo rỗng | fixed: dòng sổ mới nêu vì sao bản mẫu không thêm gì; E5 đo khối báo rỗng trong khung nhìn |
| P1 | contract | Mốc trước khi gõ không xác định; Given mơ hồ | Bảng trộn đã co theo ô Số tầng: cột nhảy lúc gõ | Mốc là bước có dòng liền trước; thêm ca hai ô | fixed: AC-1 định nghĩa mốc, tách Given; E1 sáu ca chạy qua hàm bước |
| P1 | evals | AC-3 không nhìn màn; nối ở màn không được đo | Màn nối thiếu, ô đất biến mất | Thêm ca ô Giá trên màn | fixed: E5 thêm ca 2 |
| P1 | evals | E4 lấy kỳ vọng từ hàm đang sửa; số ca không xác định; E5 chốt lỏng | Sửa lệch nhánh có dòng mà E4 xanh | Bảng viết sẵn; assert số ca; so số hàng trước | fixed: E4 bảng tên cột viết sẵn, E1 và E4 assert số ca, E5 so số hàng trước khi gõ |
