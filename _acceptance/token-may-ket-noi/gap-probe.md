---
slug: token-may-ket-noi
at: 2026-11-09T06:38:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Sổ không ghi lựa chọn token chết hẳn hay chỉ bị chặn khi thoả thuận tắt hoặc hết hạn; Hỏi-5 và AC-6 mập mờ | Thoả thuận hết hạn lâu, token cũ đã lộ, gia hạn hay bật lại thì đúng chuỗi cũ đẩy được danh mục | Thêm dòng sổ chỉ người có; AC-6, E6 ghim từng ca mở lại | human-gate1: Hỏi-6 cho người quyết, Hỏi-5 viết lại, AC-6 và E6 ghim ba ca mở lại; thêm trigger thu hồi khi ended theo khuyến nghị |
| P0 | design | Ba dòng sổ mục tiêu có câu trích không quyết lựa chọn: Bearer hỏng có rơi về phiên, chung mã 401, giới hạn tần suất; hạn giữ nhật ký không có dòng | Chủ kho duyệt mà không biết đây là lựa chọn; bảng chỉ thêm phình không trần | Sửa căn cứ; mã lỗi và tần suất thành Hỏi | human-gate1: Hỏi-7 và Hỏi-8 cho người quyết; dòng Bearer đổi sang một lối ra, có lối chết nêu được |
| P1 | evals | Ba đường token sống sau thu hồi không có ca đo: thu hồi sau bước tra, thu hồi khi thoả thuận tắt và tokenId lệch, Bearer hỏng kèm cookie | Gói vẫn vào sau thu hồi; DELETE sai cặp trả 204; token thu hồi kèm cookie vẫn 200 | Móc giữa tra và khoá; ma trận thu hồi ở mọi trạng thái; ma trận Bearer hỏng kèm cookie | fixed: thiết kế §4, §5 chốt xử lý khoá ra 0 dòng và phạm vi 403; E2, E6 thêm các ca |
| P1 | contract | Ngưỡng chưa có đường đo trọn: chiều khác, lỗi giữa chừng trong nhật ký, không chạm sàn cookie, dò sai tên khoá | API không xét chiều mà eval vẫn xanh; nhật ký thiếu dòng ở ca 5xx | Bảy tổ hợp qua API, đổi chiều sau cấp; kết cục server_error; đếm sàn cookie; tập khoá cho phép | fixed: E2 bảy tổ hợp (catalog_confirmation chiều vào cơ sở dữ liệu vốn chặn nên không phải tám), E4, E6, E7, E1; thêm kết cục server_error |
| P1 | contract | Lời hứa thứ tự áp migration không có AC hay eval | CI dựng mới xanh, bản thật áp 041 sau 052 thì lỗi hoặc thiếu luật | Dựng hai thứ tự, so luật, quyền, ràng buộc; áp lại lần hai | fixed: thêm vế AC-5 và eval E11 |
