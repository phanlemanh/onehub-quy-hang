---
slug: bat-rang-buoc-ban-ma
at: 2026-11-01T00:17:45Z
verdict: findings
p0: 0
p1: 3
p2: 2
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract | Không eval nào chạy tệp 013 bằng vai chủ không superuser; tệp không nói vai chủ có BYPASSRLS | Vai chủ không BYPASSRLS thì phép đếm số rõ bị luật theo dòng lọc ra 0, validate thẳng rồi ném, deploy hỏng; ca hai chiều không cấy được dòng | Mô phỏng vai chủ không superuser trong ca | rejected một phần: vai chủ bản thật mang bypassrls (packages/db/supabase/nen-du-an.sql dòng 14) — đã ghi vào thiết kế §2 và Notes của hợp đồng; nếu đếm sai thì validate ném và deploy đỏ ồn chứ không lặng; ca hai chiều nay không chạy trên vai không superuser (Hỏi-1) |
| P1 | evals | Không eval nào đo notice ra tới log deploy; pg client bỏ notice khi không ai nghe | Bản thật còn số rõ, migrate.mjs nuốt notice, ràng buộc nằm NOT VALID không ai nhắc | Spawn migrate.mjs thật, đọc stdout | fixed: thiết kế §2 thêm client.on notice trong migrate.mjs; AC-2 thêm vế notice ở đầu ra db:migrate; E6 mới spawn migrate.mjs trên cơ sở dữ liệu tạm |
| P1 | design | Hỏi-1 nói nhẹ giá: gỡ và dựng ràng buộc lấy ACCESS EXCLUSIVE chặn cả đọc tới khi hoàn lại | Deploy kẹt sau một giao dịch đọc dài, kéo mọi lần đọc của người dùng xếp hàng | Nêu đúng loại khoá; lock_timeout hoặc không chạy trên bản thật | fixed: Hỏi-1 viết lại với đúng loại khoá; khuyến nghị đổi sang chỉ chạy ca hai chiều khi vai là superuser; AC-3 và E3 thêm vế bỏ qua có lý do; sổ dòng mới thay d-5 |
| P2 | design | Sổ d-4 ghi căn cứ mục-tiêu nhưng câu trích ci.yml không quyết việc chấp nhận NOT VALID khi còn số rõ | Người ký tưởng ci.yml đã chốt; bản thật nhập dữ liệu cũ vẫn lên với ràng buộc chưa bật | Đổi thành câu hỏi cho người | fixed: Hỏi-2 mới (chi-nguoi, kho_dao true), sổ dòng mới thay d-4 |
| P2 | evals | Không đo vế bảng sạch không sinh notice | Tệp 013 nhắc cả bảng sạch, log deploy lần nào cũng bảo chạy lệnh mã hoá lại | Đếm notice | fixed: E1 assert 0 notice cả hai lần; E2 assert đúng 1 notice mỗi lượt, không nêu bảng sạch; E6 assert lần một không nhắc |
