---
slug: va-deploy-csdl-tam
at: 2026-11-06T09:05:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | contract, evals | AC-3 hứa «kiểm nhanh đỏ thì không gọi Vercel» nhưng E3 chỉ đo thứ tự và vắng continue-on-error; ba lối khác vẫn gọi Vercel khi kiểm nhanh đỏ | Bước gọi Vercel có `if: always()` hay `!cancelled()`, hoặc run của kiểm nhanh nối thêm «or true», hoặc bước kiểm nhanh có `if` bỏ qua — E3 xanh, bảng thiếu luật vẫn lên bản thật | kiem-ci.mjs thêm vế không `if` ngoài success() và run đúng nguyên lệnh, mỗi vế một bản sao đối chứng đỏ | fixed: AC-3 thêm hai vế; E3 thêm năm bản sao đối chứng đỏ đúng tên vế |
| P1 | contract, evals | Thiết kế kiểm superuser nhưng AC-5, E5 rơi vế superuser; ma trận `xet` chỉ 3 dòng | `quy_hang_app` bị cấp superuser trên bản thật, kiểm nhanh thoát 0, deploy lên | AC-5 thêm superuser; E5 thêm ca superuser; ma trận viết trước đủ 24 dòng | fixed: AC-5 và E5 thêm superuser; E4 ma trận toàn phần 24 dòng với tập vế lỗi viết sẵn |
| P1 | evals | E6 đếm kết nối ≤ 1 theo application_name (nhận cả 0, không đối chứng dương); ca chỉ đọc chỉ thử hàm rời, không chứng `chay` dùng nó | Script mở pool không mang tên → đếm 0 vẫn qua; `chay` truy vấn ngoài giao dịch read only mà ca 25006 vẫn xanh | Đếm đúng 1 trong lúc chạy, 0 sau; đọc transaction_read_only và statement_timeout trên đúng kết nối của `chay` qua móc tiêm | fixed: E6 dùng móc tiêm trên kết nối của `chay`, đếm mọi kết nối mới của database = 1 rồi = 0 |
| P1 | evals | E7 dựng ca thiếu DATABASE_URL bằng thư mục tạm, giả định .env.local tìm theo cwd, không ghim xoá biến kế thừa | Máy chấm có DATABASE_URL hay .env.local thật → ca «thiếu» lại kết nối, có thể tới bản thật | Chạy bản chép script ở thư mục tạm, env dựng từ đầu chỉ PATH, PGHOST không định tuyến, mong < 2 giây | fixed: E7 theo đúng thước đề xuất |
| P2 | evals | AC-1 hứa danh sách cho phép, E1 đo danh sách chặn; `test:db` không có đối chứng; PROD_DATABASE_URL ở mức job cho mọi bước thấy | Thêm bước `npm test -w @quy-hang/db` mang env bản thật, E1 vẫn xanh | Liệt mọi bước thấy PROD_DATABASE_URL, đòi tập lệnh đúng bằng {db:migrate, kiem-nhanh}; đối chứng ba ca | fixed: AC-1 đổi thành tập bước thấy chuỗi bản thật; thiết kế dời DATABASE_URL xuống hai bước; E1 năm bản sao đối chứng đỏ |
