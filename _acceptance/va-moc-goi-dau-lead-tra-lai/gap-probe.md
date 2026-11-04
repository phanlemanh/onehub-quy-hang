---
slug: va-moc-goi-dau-lead-tra-lai
at: 2026-11-04T12:08:10Z
verdict: findings
p0: 1
p1: 2
p2: 2
claims_input: ok
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ -3 để máy quyết cách tính số đo người dùng thấy: câu Tham chiếu chỉ chốt «lead → Sẵn sàng bán» tính từ lead đầu chuỗi, không chốt «lead → cuộc gọi đầu» hay cuộc gọi của người giữ cũ. Cùng kiểu [trang-khach-rieng#F1] | Đầu chủ cũ gọi ngày 0 rồi trả lại, gửi lại ngày 10, người mới gọi ngày 11: số đo báo 11 ngày, ban điều hành đọc thấy telesales chậm mà không ai chọn định nghĩa ấy | Tách thành Hỏi chỉ người trả lời, AC-4 và E4 ghim theo câu trả lời, E4 thêm hình «lead đầu đã gọi rồi trả lại» | fixed: Hỏi-1 (chỉ-người, supersedes -3) gửi giám sát (B-10), giám sát trả theo luật 37 · Ngoài-5 hàng 52 — cuộc gọi sớm nhất trong chuỗi; ghi thành ràng buộc (dòng sổ supersedes Hỏi-1); AC-4 và E4 ghim theo đó; E4 thêm hình thứ sáu, chiều đỏ hai phía |
| P1 | evals | E5 chỉ so chuỗi nằm trọn trong khoảng; hai hình biên (lead đầu trước kỳ, gửi lại sau mốc) không so ở hai bên | Chuỗi vắt ranh giới: SQL gán theo lúc lên bảng, lõi theo lead đầu — lệch mà E5 vẫn xanh | Thêm chủ nhà vắt ranh giới vào E5 hoặc ghi ngoại lệ ở AC-5 | fixed: AC-5 nói rõ so trên khoảng chứa trọn mọi lần nhập và lên bảng; cách gán kỳ của hai nơi giữ như trước, ghi ở Out of scope để hàng số đo sau quyết (dòng sổ mới supersedes -4); hai hình biên được đo ở phía lõi trong E4 |
| P1 | evals | E5 tự đổi hàng lead thành LeadVao trong test, không đi qua đường nạp thật; thiết kế không nói nơi nạp lấy resubmitted_lead_id | Nơi nạp thật không chuyển resubmittedLeadId, số đo người dùng thấy vẫn đếm hai lần | Dùng hàm nạp thật hoặc ghi rõ chưa có | fixed: chưa có nơi nạp thật nào gọi tinhSoDo — ghi ở Out of scope cùng việc hàng sau phải nối; E5 đọc resubmitted_lead_id từ cơ sở dữ liệu và assert khác null ở z, v, v2 |
| P2 | contract | Ngưỡng «phá thử thì đỏ» chỉ trỏ «chiều đỏ ghi ở S3», E1 không đòi vật | S3 bỏ phá thử mà S4 vẫn ghi ngưỡng đạt | Đòi bản ghi lần chạy đỏ | fixed: E1 đòi evidence/E1-pha-thu.log (diff, mã thoát, dòng đỏ); Đường đo trỏ tệp ấy |
| P2 | design | serves của dòng -3, -4, -5 trỏ sai tiêu chí, AC-4 không có dòng căn cứ | Người ký lần theo AC-4 không gặp căn cứ | Sửa serves | fixed: ba dòng mới supersedes -3 (thành Hỏi-1, serves AC-4, AC-5), -4 (AC-5), -5 (AC-6) |
