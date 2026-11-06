---
slug: va-ac9-mau-co-san
at: 2026-11-06T08:30:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-3 máy quyết giữ tệp dữ liệu mẫu trong lệnh chạy trên bản thật bằng câu trích AGENTS.md chỉ liên quan, không quyết; d-3 và d-4 ghi kho_dao false cho việc xoá trên bản thật | Người ký Cổng 1 tưởng việc giữ lệnh xoá chạy trên bản thật là điều bắt buộc nên không chọn; một ngày bài chạy ngoài giao dịch thì dữ liệu bản thật mất thật | Thay d-3 bằng dòng chi-nguoi có supersedes, kho_dao true cho cả d-3 và d-4, trình ở Cổng 1 | human-gate1: d-3 thay bằng Hỏi-2 (chi-nguoi, kho_dao true, supersedes d-3); d-4 ghi lại thành Hỏi-1 kho_dao true (supersedes d-4); cả hai trình chủ kho ở Cổng 1 |
| P1 | evals | Không eval nào chạy đúng lệnh job deploy (npm run test:isolation -w @quy-hang/db) trên cơ sở dữ liệu có sàn mẫu khác; AC-8 và các tệp khác chưa được chứng xanh trên trạng thái này | E1–E5 xanh, gộp xong một ca khác đỏ trên bản thật, deploy vẫn đỏ | Thêm ca deploy-san-khac chạy lệnh deploy trên cơ sở dữ liệu san-khac, đòi exit 0 | fixed: ca deploy-san-khac vào E1 và AC-1 (đúng lệnh của ci.yml) |
| P1 | evals | Dữ liệu có sẵn chèn tay ba dòng trơn, không rút từ bộ ghi đã dựng sàn trên bản thật; design và opportunity mâu thuẫn về tên sàn thật | Sàn trên bản thật có dòng phụ thuộc khác hình; E1 xanh trên dữ liệu chèn tay mà bản thật vẫn đỏ | Dựng dữ liệu có sẵn bằng chính bộ nạp; bản cũ trên dữ liệu ấy đỏ đúng «còn dòng mẫu sau xoá» | fixed: ca san-khac dựng bằng seed/nap.mjs --nap và scripts/mo-san.mjs; bản cũ 1d682ade trên dữ liệu ấy đỏ đúng thông điệp (chạy thử 06/11); design ghi rõ câu giao nói «[Mẫu] Sàn thử», ca có cả hai |
| P1 | evals | Ô bản cũ × trùng tiền tố không có eval; phá thử «hai sàn mẫu» không có đối chứng âm riêng và không ghim thông điệp; san-thu-trung còn «[Mẫu] Sàn trình diễn» nên không tách được lớp trùng tiền tố | Phép đếm hai sàn lọc quá tay mà phá thử vẫn đỏ vì lý do khác, E1 xanh, AC-3 ký mà chưa đo | Thêm ca pha-hai-san vô hiệu riêng phép đếm hai sàn, ghim «hai sàn mẫu»; san-thu-trung chỉ có «[Mẫu] Sàn thử (bản cũ)» cho bản cũ | fixed: ca pha-hai-san vào E3 (ghim coLoi(loi, "hai sàn mẫu")); san-thu-trung chỉ còn «[Mẫu] Sàn thử (bản cũ)»; E5 thêm bản cũ × san-thu-trung; Coverage đo đủ sáu ô |
| P2 | design | E3 bám tên hàm dongMauMoi và biểu thức coLoi mà design và contract không nêu | Người viết đặt tên khác, E3 thoát 2 hay đỏ sai, phải sửa bài đo sau Cổng 1 | Ghi vào design tên hàm, chữ ký và lời khẳng định của từng phá thử | fixed: design nêu dongMauMoi(c, goc), sanMauMoi(c, goc) và hai lời khẳng định coLoi mà E3 bám |
