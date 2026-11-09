---
slug: va-bai-o-la-do-ngau-nhien
at: 2026-11-09T03:40:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

# Phản biện context sạch: va-bai-o-la-do-ngau-nhien

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract, evals | Lời hứa quét mọi trường và cột mới không có tiêu chí; trục trường chữ thực chất chỉ đo cột model; nhánh trường máy sai dạng không được đo. | Hàm chỉ quét model, user_id, duration_ms hoặc bỏ qua mã máy vô điều kiện mà E1–E7 vẫn xanh. | Ma trận sinh từ mọi cột thật cộng cột giả, số assert bằng số phần tử; hai kiểu phá mới có thông điệp ghim riêng. | fixed: thêm AC-10, E10, kiểu phá chi-quet-ba-cot và bo-qua-ma-may ở E7; ma trận rút khoá từ dòng sổ thật |
| P1 | evals, design | AC-5 dùng dòng tự sinh, chưa định nghĩa dạng giờ ghi của Postgres, chiều đỏ của E5 không gán kiểu phá. | Postgres cắt số 0 cuối phần lẻ giây; mẫu nhận dạng khớp bộ sinh mà lệch dòng thật, bài vẫn đỏ ngẫu nhiên. | Dòng do Postgres sinh qua mặc định của bảng, giờ ghi đủ các biến thể; ghim thông điệp dưới kiểu phá khong-loai-ma-may. | fixed: AC-5 và E5 lấy dòng từ Postgres, design định nghĩa dạng giờ ghi, E5 trỏ kiểu phá |
| P1 | contract, evals | AC-8 40 lần không phân biệt được bài cũ với bài mới; nửa sau AC-1 không có trong expected của E1. | Tỉ lệ đỏ 1%: bài chưa sửa qua 40 lần xanh với xác suất khoảng 67%. | Ít nhất 300 lần hoặc hạ thành kiểm khói; E1 assert phép cũ đỏ trên đúng dòng ấy. | fixed: AC-8 và E8 nâng lên 300 lần; E1 assert phép cũ đỏ |
| P1 | evals | E9 chỉ xét packages và apps, không phủ job CI, script gốc, rào. | Nhánh cho job này được phép đỏ hoặc thêm chạy lại mà E9 vẫn đạt. | So toàn bộ tệp đổi với danh sách viết trước; chiều đỏ có ci.yml và package.json. | fixed: AC-9 nêu danh sách, pham-vi.mjs so toàn bộ tệp đổi |
| P2 | design | Dòng sổ mot-loi chưa loại hết các lối còn sống. | Người ký tưởng chỉ có một cách, không cân lối đơn giản hơn. | Dòng sổ supersedes nêu ràng buộc giết từng lối; design bổ sung. | fixed: dòng sổ mới mang supersedes, design thêm ba lối đã loại |
