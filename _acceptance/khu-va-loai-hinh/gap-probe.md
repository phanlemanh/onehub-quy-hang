---
slug: khu-va-loai-hinh
at: 2026-10-31T16:05:00Z
verdict: findings
p0: 0
p1: 4
p2: 1
claims_input: ok
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P1 | evals | E1 cấm ?project= ở mọi tệp kiểm Postgres mà E2 đòi một ca gọi đúng ?project= | Viết đúng ca E2 thì E1 đỏ, lách bằng ghép chuỗi thì không trung thực | Ngoại lệ viết trước đúng một ca theo tên, đếm đúng 1 lần gặp | fixed: E1 khai ngoại lệ đúng ca «danh mục: tham số project cũ bị từ chối 400», đếm bằng 1 |
| P1 | evals | E7 chạy lệnh Postgres mà đòi ca lõi; ca API so với hằng nên tự đúng | Ca lõi không có trong output; thêm trường thứ 13 vẫn xanh | Tách hai eval, ca API so danh sách viết trong tệp kiểm | fixed: E7 (lõi, test.core) và E7b (API, isolation, danh sách viết tay mười hai tên) |
| P1 | contract | Ngưỡng nói CONTEXT, Tham chiếu không còn projectKey mà bộ quét chỉ quét mã; apps/web ngoài quét | Tài liệu hay màn còn tên cũ mà mọi eval xanh | Thêm CONTEXT, Tham chiếu, apps/web/src vào bộ quét | fixed: AC-1 và E1 quét thêm ba chỗ, đếm tệp đã đọc từng chỗ; Đường đo trỏ E1 |
| P1 | contract | Bảng của ADR có ba vế mà hàng chỉ dựng một; Out of scope thiếu vế ấy và các mục không có dòng descope | Chủ kho tin cả ba vế đã vào hàng 72 | Out of scope + AC-6 nói rõ, mỗi mục một dòng descope | fixed: AC-6 nói rõ chỉ «trường dùng được»; Out of scope thêm hai mục; bốn dòng descope mới |
| P2 | evals | E10 không có sổ trong inputs nên không biết nhãn chủ kho chọn | Chủ kho chọn nhãn khác mà tài liệu nhất quán nhãn cũ vẫn PASS | Thêm decisions.jsonl vào inputs, đòi nêu nguyên văn nhãn | fixed: E10 inputs thêm decisions.jsonl, question đối chiếu nhãn ở dòng Hỏi-1 |
