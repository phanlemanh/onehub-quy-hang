---
slug: va-ac8-uuid-nham-so
at: 2026-11-07T00:40:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | opportunity | Ô ngưỡng viết «cài một số dạng 0900 000 0xx thì bài đỏ» trái với cách đọc của sổ d-3; «không đổi bộ dữ liệu mẫu» không có eval; Timebox trống | Người ký đọc ngưỡng theo nghĩa đen; một sửa vô tình đổi bộ mẫu hay SO_MAU mà không phép đo nào đỏ | Viết lại SỐNG theo d-3, điền timebox, thêm eval so bộ mẫu, SO_MAU, CHO_PHEP với a4122e9e | fixed: ngưỡng viết lại «số THẬT (không theo dạng mẫu)», timebox hết 07/11; thêm AC-5 + E5 (`--bat-bien a4122e9e`), phá thử đổi SO_MAU → đỏ «SO_MAU đổi so với a4122e9e» |
| P1 | design | Lời «chỉ bắt chuỗi đứng riêng» không đo được: gỡ chặn hai bên thì E2–E4 vẫn xanh | Hợp đồng hứa một hành vi mà không phép đo nào giữ; sau này ai gỡ chặn cũng không đỏ | Bỏ lời ấy, hoặc thêm ca chỉ đỏ khi thiếu chặn | fixed: bỏ chặn hai bên khỏi mã (một cơ chế: gỡ trước, dò sau); feature, contract, design viết lại; sổ dòng approach mới supersedes d-2; thêm «SĐT0912345678» vào chuỗi phải bắt |
| P1 | evals | E2/E3 không ghim kích thước ma trận (5 và 4) | Bớt một chuỗi khỏi ma trận, ca vẫn xanh, AC ký trên ít phép thử hơn đã duyệt | Khẳng định độ dài trong ca, hoặc bài đo đếm lại | fixed: ca khẳng định 6 + 6; `--tron` đếm lại phần tử trong nguồn, lệch in «ma trận <tên> có <k> chuỗi, đã duyệt 6» |
| P1 | evals | kiem-ac8.mjs tạo và DROP cơ sở dữ liệu trên bất kỳ máy chủ nào của DATABASE_URL | DATABASE_URL trỏ bản thật, bài đo tạo và xoá cơ sở dữ liệu ở đó | Từ chối máy chủ không phải cục bộ (thoát 2), ghi sổ nơi chạy | fixed: từ chối ngoài localhost/127.0.0.1/::1 (chạy thử với db.example.com → thoát 2 «từ chối: …»); dòng sổ approach kho_dao true |
| P2 | evals | Độ phủ thiếu «SĐT0912345678», «0912-345-678», UUID viết hoa; căn cứ d-4 yếu | Một dạng viết số phổ biến lọt mà ma trận không có | Thêm ba chuỗi, viết lại căn cứ | fixed: ba chuỗi vào ma trận (6 + 6); dòng sổ mới supersedes d-4 liệt đủ loại chuỗi |
