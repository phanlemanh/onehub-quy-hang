---
slug: va-e7-loi-that-cap-han
at: 2026-11-07T23:55:29Z
verdict: findings
p0: 1
p1: 1
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Câu giao đòi phản hồi thật của máy chủ; contract đổi nghĩa thành thân GET thật bơm vào chỗ phản hồi PATCH, sổ ghi máy quyết — đây là định lại điều chủ kho đã chọn | Cổng Phạm vi duyệt lời diễn giải người không được hỏi; lỗi chỉ ở đường lưu lọt | Chuyển thành câu hỏi có nút một chạm, sửa lý do lối chết | human-gate1: dòng sổ mới supersedes thành Hỏi-1 (nguồn chỉ-người, khuyến nghị chấp nhận thân GET thật, lối khác và giá); phần «khoá lạ vẫn trả 200» không đúng — store.ts từ chối khoá không có trong sổ bằng 400 |
| P1 | contract | Diff chạm _acceptance/luat-chia-lead/thu/dung-d.mjs ngoài vung khai của hàng; không eval nào đo | Rào lộ trình chặn, hay nạp căn sai làm E10 của hàng 48 đổi mà không thước nào bắt | Nới vung kèm căn cứ hoặc tách hàng | fixed: thêm dung-d.mjs vào vung của hàng ở docs/plan/lo-trinh.json (căn cứ D-30); E1 chạy dung-d thật mỗi lượt (nạp khi thiếu, đi tiếp khi có). deferred: không thêm AC cho E10 của hàng 48 — ngoài câu giao |
| P2 | evals | Vế âm không toast ở khung 3 chỉ chờ 1,5 giây, khung 1 chờ 20 giây | Toast tới muộn mà E1 vẫn đạt | Chờ cùng khoảng như khung 1 | fixed: khung 3 chờ «chưa áp» rồi chờ toast tới 20 giây trước khi chấm |
| P2 | evals | --doi-cau dựng bản sao theo HEAD, E1 chấm cây đang làm | E1 và E2 chấm hai bản khác nhau | Từ chối cây bẩn hoặc so sha | fixed: kiem-e7 --doi-cau thoát 2 khi vùng đo còn đổi chưa commit; mỗi lần chấm in «cây <sha>» |
