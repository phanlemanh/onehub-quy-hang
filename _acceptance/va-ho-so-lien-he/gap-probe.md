---
slug: va-ho-so-lien-he
at: 2026-11-05T11:42:04Z
verdict: findings
p0: 3
p1: 2
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | decisions | Dòng bỏ coverage-scan trích chú thích kể bốn đường mà trục chỉ có ba — sót đường danh sách [va-gui-can-da-go#F4] [du-lieu-mau-thap-tang#F1] | Danh sách vẫn trả liên hệ «mat» cho người không được đọc, ma trận 54 ô vẫn xanh | Thêm đường danh sách (4 × 9 × 2 = 72) hoặc dòng sổ mot-loi | fixed: thêm đường danh sách vào ma trận (72 ô, phá thử đỏ «danh sách dc1/giu: thiếu liên hệ»), sửa AC-1, E1, Coverage, dòng sổ thay bỏ coverage-scan |
| P0 | decisions | Dòng bỏ ui-observed ghi một-lối nhưng lối chặn mạng vẫn sống [va-dang-nhap-mat-khau#F2] | Nối dây lỗi giữ trang lạc lọc trên màn thật mà không eval nào thấy | Eval ui-check chặn mạng hoặc dòng sổ mới | fixed: thêm E6 ui-check (layer ui-observed) chặn mạng + frame đối chứng; dòng sổ approach thay dòng bỏ ui-observed |
| P0 | contract | Kỳ vọng của ma trận do người làm tự viết trong tệp kiểm — thước tự quy chiếu | Bảng chép theo hành vi lỗi, đủ ô, đếm khớp mà lỗi quyền còn | Bảng kỳ vọng trong hợp đồng có căn cứ ADR-0021, E1 đòi trùng từng ô | fixed: bảng 9 × 2 kỳ vọng vào AC-1 (căn cứ ADR-0021 qđ 3), E1 đòi DOC trùng từng ô và ghim bốn hàng |
| P1 | evals | E3 hỏi «giữ như trước» mà không có bản trước trong inputs | Hội đồng đoán PASS khi JSX hay chữ đổi | Bản chụp vung.tsx gốc làm input | fixed: thêm _acceptance/va-ho-so-lien-he/vung-goc.tsx.txt (origin/main) vào inputs E3, vế (3) so JSX và chữ |
| P1 | evals | E3 không hỏi khoá và tham số yêu cầu có cùng nguồn bộ lọc | Khoá lấy từ danh sách đang hiện, tham số từ URL mới — lỗi gốc còn mà E2, E3 xanh | Câu hỏi E3 và Then AC-3 đòi cùng nguồn | fixed: AC-3 và E3 vế (1) đòi khoá dựng từ đúng q, loai, dau dùng làm tham số docDanhSach trong them() |
