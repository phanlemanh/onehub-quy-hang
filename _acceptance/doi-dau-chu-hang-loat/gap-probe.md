---
slug: doi-dau-chu-hang-loat
at: 2026-11-04T23:41:36Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ -3 ghi máy quyết luôn việc giữ nguyên lối gán một căn — câu trích không quyết điều ấy | Gán một căn chia chủ C1 cho hai đầu chủ; Cổng Phạm vi duyệt mà không biết đó là lựa chọn của máy | Tách thành câu Hỏi, AC-8 và Out of scope viết theo câu trả lời | human-gate1: Hỏi-1 (dòng sổ mới supersedes -3), nháp theo khuyến nghị «giữ nguyên lối một căn ở hàng này» |
| P0 | contract | AC-5 tự quyết căn chưa có đầu chủ giữ người nhận khi hoàn tác, trái «hoàn tác trả đủ», không dòng sổ; trục «liên hệ đã đổi tiếp» không có ô | Hoàn tác chia một chủ: căn ở D2, liên hệ về null; «bỏ qua 1» trông như đổi tiếp | Câu Hỏi + hai ô E5 mới, lời riêng | human-gate1: Hỏi-2, nháp theo khuyến nghị (căn và liên hệ cùng chủ giữ người nhận, lời riêng); E5 thành 6 ô gồm (c) nhất quán và (e) liên hệ đổi tiếp |
| P1 | evals | AC-1 cross-layer mà eval chỉ ở lõi, web, UI; 403 không chạy đủ trục vai | Hàm cho quản trị qua mà không eval nào đỏ | Ma trận 6 vai × 3 lệnh = 18 ô trên Postgres | fixed: thêm E1c (backend-effect, 18 ô, chiều đỏ quản trị) |
| P1 | evals | Quét rò rỉ chỉ tìm chuỗi giữ chỗ, không đối chứng dương [d-20261104T163345Z-15] | Tên chủ ra qua khoá khác, quét vẫn xanh | Giá trị riêng mỗi chủ, đối chứng dương | fixed: E3 và E9 quét bốn giá trị riêng, E3 có đối chứng dương |
| P1 | evals | AC-4 hứa đồng bộ nhưng E9 không cấm tải lại; chưa có đường sự kiện cho bộ đồng bộ | Cột chỉ đổi khi tải lại trang mà E9 vẫn đạt | E9 cấm tải lại; eval đường đồng bộ | fixed: thiết kế ghi sự kiện cho bộ đồng bộ, E4c (web_db) kéo lại không dựng kho, E9 cấm tải lại và ghi số giây |
