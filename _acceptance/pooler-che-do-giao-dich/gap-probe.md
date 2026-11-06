---
slug: pooler-che-do-giao-dich
at: 2026-11-06T06:13:53Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Sổ không có dòng cho việc bắn tải lên cơ sở dữ liệu bản thật: bản xem trước dùng chung Supavisor và trần 15 kết nối máy chủ với bản thật đang ở chế độ phiên. | Máy chạy E7 giữa giờ làm việc, phiên bản hàm của bản xem trước chiếm phần kết nối dùng chung, bản thật gặp lại EMAXCONNSESSION như sự cố 06/11. | Dòng Hỏi chi-nguoi kho_dao true về khung giờ, mức tải, người theo dõi; E7 thêm assert nhật ký bản thật cùng khoảng không có EMAXCONNSESSION hay 5xx. | human-gate1: dòng sổ Hỏi mới (khung giờ, mức tải, dừng khi thấy lỗi); fixed: E7 bước 4 kiểm nhật ký bản thật, contract Notes và design khai rủi ro. |
| P0 | evals | E7 chỉ kiểm biến DATABASE_URL có tồn tại, không chứng triển khai thật sự chạy qua cổng 6543. | Biến sao sang mà quên đổi cổng, hoặc triển khai dựng trước khi đặt biến — E7 vẫn xanh vì mã chạy cả hai chế độ, Supavisor giao dịch chưa từng được đo. | Assert cổng 6543 của triển khai đang đo, không in giá trị; chiều đỏ với triển khai 5432. | fixed: dungPools ghi dòng nhật ký nêu cổng (không máy chủ, không mật khẩu — AC-1, E1 ghim); E7 bước 1 đòi dòng cổng 6543 trong nhật ký đúng triển khai ấy, chiều đỏ trên triển khai 5432 — không cần đọc bí mật. |
| P1 | evals | E7 chấp nhận 200/307/401 với cookie giả mà không có đối chứng dương rằng truy vấn danh tính chạy; regex nhật ký không bắt lỗi lược đồ. | Truy vấn bảng session hỏng và bị nuốt thành «không có phiên», 40 yêu cầu ra 401, E7 xanh trong khi đăng nhập thật hỏng. | Thêm mẫu lỗi lược đồ và câu lệnh chuẩn bị vào regex; đối chứng dương rằng truy vấn danh tính đã chạy. | fixed: regex E7 thêm relation does not exist, Could not validate the database schema, prepared statement; dòng cổng 6543 chứng hàm đã dựng bể. deferred: đối chứng dương đăng nhập thật trên bản xem trước là thử tay của chủ kho (máy không tạo tài khoản thử trên dữ liệu thật); luồng đăng nhập trên pooler giao dịch có đối chứng máy ở E3. |
| P1 | evals | Regex SET của E5 sót set role, set session authorization và dạng set x = 'v'. | Bản vá sau thêm set role hay set search_path trên sự kiện connect, ca cây thật vẫn sạch. | Ma trận mồi ghim từng dạng viết, đối chứng dương update … set col = $1. | fixed: E5 ghim mười bốn mồi theo dạng viết và năm đối chứng dương (gồm update … set). |
| P1 | evals | E8 hỏi «không viết đè» mà hội đồng không có bản trước hay diff. | Đoạn cũ của ADR-0009 bị viết lại rồi thêm đầu mục sửa đổi, hội đồng trả PASS. | Tách «không viết đè» sang ca script đo diff, có chiều đỏ. | fixed: E13 (script) đo diff ADR-0009 từ điểm rẽ chỉ có dòng thêm, có chiều đỏ; E8 chỉ giữ bốn ý nội dung. |
