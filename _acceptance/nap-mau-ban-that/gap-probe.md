---
slug: nap-mau-ban-that
at: 2026-11-01T07:15:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Quyết gỡ theo tên trích một câu chỉ nói mở sàn trùng tên là hợp lệ, không quyết «đúng một sàn trùng tên thì xoá»; xoá dữ liệu bản thật mà kho_dao false; AC-6 không đo ca một sàn thật trùng tên | Một công ty thật tự đặt tên «[Mẫu] Sàn thử», sàn mẫu chưa nạp; chủ kho bấm gỡ, sàn thật bị xoá trọn | Ca «sàn thật trùng tên, không có sàn mẫu»: gỡ không xoá, đếm mọi bảng không đổi; đối chứng dương sàn mẫu vẫn gỡ được | fixed: nhận sàn mẫu bằng tên cộng quản trị mẫu miền mẫu, thành Hỏi-3 (kho_dao true, dòng sổ thay d-20261101T064919Z-6); AC-6 và E6 thêm ca sàn thật trùng tên ở cả nạp lẫn gỡ |
| P1 | contract | Ngưỡng ô cơ hội đòi đủ danh mục 180 căn nhưng không AC hay eval nào đo danh mục | Đường tra mẫu không phục vụ sàn mẫu trên bản thật; chủ kho thấy 0 căn, mọi eval vẫn xanh | AC và eval: thành viên sàn mẫu tra danh mục với NODE_ENV=production đếm 180 căn | fixed: thêm AC-10 và E12 (tra qua createApi bằng phiên thành viên sàn mẫu, đối chứng âm phiên chưa thuộc sàn) |
| P1 | evals | AC-1 hứa kết quả trùng do luật tính (quan hệ) nhưng E1 chỉ so giá trị | Bộ nạp ghi sẵn kết quả trùng; E1 vẫn xanh | Chiều đỏ cùng fixture: đóng hàng mở của căn L-01, bỏ chủ nhà mang số L-02 thì hai lead ra new | fixed: E1 thêm chiều đỏ ấy, thông điệp nêu mã lead |
| P1 | evals | E7 cài lỗi ở bước kiểm gói nên không chứng được rollback trọn khi lỗi xảy ra sau các lần ghi | Hàm ghi commit trên kết nối riêng, lỗi ở lead cuối để lại nửa sàn; E7 vẫn xanh | Lỗi ở lead 12 sau khi hàng đã ghi, sàn mẫu đếm 0, mọi bảng bằng trước | fixed: E7 dùng lead cuối số sai dạng (lỗi sau khi sàn, tài khoản, hàng, chủ nhà đã ghi), ghim L-12 |
| P2 | evals | E9 chạy lệnh bộ kiểm cách ly nhưng ca đọc chéo nằm trong tệp kiểm của bộ nạp | Bộ nạp ghi dòng sai công ty; E9 vẫn xanh | Tách hai mục, mỗi mục đúng lệnh chứa ca | fixed: E9 chạy bộ kiểm của bộ nạp (ca đọc chéo), E11 chạy bộ kiểm cách ly (hồi quy) |
