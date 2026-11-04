---
slug: man-nhap-excel
at: 2026-11-04T03:47:30Z
verdict: findings
p0: 0
p1: 4
p2: 1
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | AC-8 gắn (cross-layer) nhưng «Trưởng nhóm nhập hộ» không có bài đi qua máy chủ thật; E8 chỉ đo route danh sách đầu chủ, E8b dùng fetch giả | Đường ghi 65a bỏ qua agentUserId và ghi căn cho chính Trưởng nhóm; E8, E8b vẫn xanh | Ca web_db: Trưởng nhóm chọn Đầu chủ X, xem thử rồi ghi; mọi hàng giữ bởi X; đối chứng âm đầu chủ sàn B bị bỏ với lý do ghim | fixed: thêm E8c (web_db, backend-effect) đúng thước đo |
| P1 | evals | E5 không ghim cặp trùng vắt qua ranh giới gói | Cặp trùng ở dòng 10 và 210: xem thử báo cả hai căn mới, ghi ra N−1 — xem thử một đằng, ghi một nẻo | Ma trận trùng cùng gói, vắt gói 1–2, vắt gói 2–3; hành động từng dòng xem thử bằng khi ghi | fixed: E5 thêm ma trận ba cặp, 6 assert theo số dòng |
| P1 | evals | E1 không quét đủ dạng ô của exceljs (công thức, richText, liên kết, đúng/sai, lỗi, ngày, ô gộp) | Cột giá là công thức thành «[object Object]», lõi đánh dấu hàng loạt mà E1 vẫn xanh | Một trang exceljs đủ bảy dạng ô, mỗi dạng một assert, đếm = 7 | fixed: E1 thêm ca «mọi dạng ô của exceljs» |
| P1 | contract | Ngưỡng «lỗi lọt ≤ 0,5%», «cần người ≤ 10%» của ô cơ hội không có assert so ngưỡng — bằng số lõi chưa phải đạt ngưỡng | Lõi ra nhiều ô cần người trên tệp mẫu, màn bằng lõi nên xanh, cổng duyệt đúng điều kiện CHẾT | Ca so ngưỡng trên mau-a, mau-b | fixed: E2 thêm ca «ngưỡng Cổng Đáng trên tệp mẫu»; Đường đo trỏ ca này (số nền hàng 64 hiện là 0 ô cần người, 0 lỗi lọt trên hai tệp mẫu) |
| P2 | evals | E9 chỉ chụp trạng thái không quyền trong các trạng thái AC-9 hứa | Lỗi .xls vẽ tay ngoài TrangThai hay ô chọn đầu chủ tràn ở 375 mà E9 vẫn đạt | Khung 1440 và 375 cho từng trạng thái | fixed: E9 thêm sáu khung (.xls, tệp rỗng, không dòng nào ghi, lỗi mạng giữa gói, ô chọn đầu chủ, rời trang) |
