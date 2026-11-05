---
slug: bang-quyen-theo-vai
at: 2026-11-05T14:55:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | contract | Ba dòng sổ máy quyết ghi «một lối» với lý do «chạm vùng dãy khác» (mã lỗi, canRead, trang /inventory) trong khi vòng đã xin chạm được (Q-1, Q-3); mã lỗi /api/v1 là thứ bên ngoài đọc [hom-nay-dau-chu-dien-thoai#F1] | Chủ kho ký vì tưởng không còn lựa chọn; Telesales gõ /inventory vẫn thấy khung Bảng hàng | Đổi dòng thành Hỏi có khuyến nghị và lối khác, hoặc nêu lý do chết thật | fixed: mã lỗi → Hỏi-3 (chi-nguoi); canRead → lý do thật (luật theo dòng đã chặn mọi đường đọc, thêm vai vào canRead chỉ lặp lại); /inventory → làm trong vòng, xin chạm Q-4, AC-2 + E2b |
| P0 | design | Phép cắt 12 ca bỏ «Đầu khách · căn chưa ai giữ» và «Đầu chủ từng giữ, căn đã đổi»; §2.3 viết luật đưa lên Đang bán không ngoặc | Luật viết sai ngoặc (ĐC và giữ) hoặc (chưa ai giữ) cho Đầu khách đưa căn chưa ai giữ lên Đang bán mà 48/48 ô vẫn xanh | Thêm hai dòng, dòng «từng giữ» dựng bằng đổi đầu chủ thật; viết lại §2.3 có ngoặc | fixed: bảng 14 ca × 4 = 56 ô; §2.3 và Criteria ghi ngoặc; E1, E5, E7, E8a/b đổi số và thêm hai ca; dòng sổ phép cắt thay bằng lý do một-lối thật |
| P1 | evals | E6 chỉ đo hàm thuần với cờ đưa tay; không chứng trình sửa thật truyền cờ [va-ho-so-lien-he#F2] | Trình sửa gọi nacTrangThai không truyền cờ, mặc định true, Đầu khách vẫn thấy nấc Đang bán | Bài dựng trình sửa thật, hoặc tham số cờ bắt buộc để kiểm kiểu bắt | fixed: tham số cờ bắt buộc không mặc định + E6b (kiểm kiểu, chiều đỏ bỏ đối số ở tren-o.tsx); Hỏi-1 sửa tiền đề |
| P1 | evals | E9 không chạy bộ đồng bộ của màn; điều «bài cũ chỉ thêm vai» không lệnh nào đo; sáu tệp Q-3 không ở Notes; AC-8, AC-9 thiếu thẻ cross-layer | Bài đồng bộ đỏ sau 046 mà E9 xanh; ai đó xoá assert của bài cũ để cho xanh | Thêm lệnh bộ đồng bộ, eval so diff sáu tệp, Notes, thẻ | fixed: E9b (web_db), E9c (diff sáu tệp: chỉ thêm vai listing_agent/buyer_agent, số assert không giảm, không team_lead), Notes liệt sáu tệp + Q-3, thẻ cross-layer AC-8/AC-9, E9 layer backend-effect |
| P1 | evals | Cột «sửa» tuyên mọi lệnh nhưng ma trận chỉ đo price_changed; E3/E4 chép tay ba lệnh; voided bị loại không có dòng descope | Lớp vai viết theo từng nhánh lệnh, sót details_changed; Telesales sửa chi tiết hàng Toàn sàn mà mọi eval xanh | E3/E4 lặp theo EVENT_TYPES của lõi; voided vào ma trận hay có dòng descope | fixed: E3 lặp EVENT_TYPES trừ created (gồm voided) cho TS/QT, E4 lặp trừ created/voided cho ba vai Bảng hàng; dòng descope voided (G2 quyết ai gỡ) |
