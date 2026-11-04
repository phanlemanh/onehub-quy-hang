---
slug: hom-nay-truong-nhom
at: 2026-11-04T04:30:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Phạm vi cả nhóm hay cả sàn là lựa chọn không có dòng sổ; §1 Biên viết «nhóm» | Sàn hai nhóm, hai trưởng nhóm giao chéo lead | Dòng sổ + ca sàn hai nhóm | fixed: dòng sổ mot-loi — sàn chưa có «Nhóm» (sổ K5), phạm vi cả sàn; §1 và AC-1 nói «sàn» |
| P0 | design | Căn cứ d-5 (đếm hàng cũ trên máy) hỏng: luật khuôn đầu chủ không quyết việc gộp cho quản lý; căn «Chỉ tôi» không xuống máy trưởng nhóm | Đầu chủ giữ căn cũ «Chỉ tôi», bảng báo tươi 100% | Thành Hỏi | human-gate1: Hỏi-5 (supersedes d-5) — đếm trên máy kèm ghi phạm vi, hay lối máy chủ đếm hộ |
| P1 | contract | Ô «Hàng cũ» chưa có công thức, E7 không đối chiếu | Ô hiện số căn mở thay số cần gọi lại | Công thức + ca web | fixed: AC-4, AC-6 ghi ô = tổng căn cần gọi lại; E8 thêm ca đối chiếu với bảng tám căn của E4, đổi cấu hình thì số đổi |
| P1 | evals | Bất biến 2 đo bằng danh sách tên khoá cấm | Lối trả «sellerName» mang số chủ, E1 xanh | Mồi giá trị + tập khoá | fixed: E1, E3 assert tập khoá viết trước và thân không chứa số/tên mồi, có đối chứng dương |
| P1 | evals | AC-5 không assert mốc hạn sau giao lại; ca từ chối lấp lửng | Giao lại không đóng dấu hạn, lead quay lại ngay | Assert mốc, mã lỗi ghim | fixed: AC-5, E5 assert routed_at = lúc giao, vắng trước hạn nhận mới, có lại sau; căn trùng 400 lead-not-assignable, người giữ không đổi |
