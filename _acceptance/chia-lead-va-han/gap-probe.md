---
slug: chia-lead-va-han
at: 2026-10-31T22:54:15Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Dòng sổ «một lối» gói hai lựa chọn chạm thu nhập đầu chủ — kho chung mở toàn sàn và tải chỉ xét trong khu — mà lối khác (kho chung theo khu, tải toàn sàn) chưa chết | Sàn chọn kho chung, đầu chủ Toà B nhanh tay lấy hết lead Toà A; chủ kho ký mà không thấy đây là lựa chọn của người | Đổi thành câu hỏi người kèm khuyến nghị và lối khác, đưa vào thiết kế mục 6 | human-gate1: thành Hỏi-7 (khuyến nghị kho chung theo khu, tải trong khu); dòng sổ cũ chưa commit được gỡ; AC-6, E6, thiết kế và lõi (`poolVisibleTo`) dựng theo khuyến nghị |
| P0 | design | Định nghĩa «lead đang mở» (chưa gọi lần đầu) ghi «một lối» trong khi «chưa nhận» hay «về trong N ngày» vẫn sống; định nghĩa quyết ai được lead kế tiếp | Người gọi nhanh mà giữ nhiều lead bị tính là rảnh và được dồn thêm; chủ kho không biết thước đo tải do máy chọn | Đổi thành câu hỏi người; bảng zone_least_open viết lại theo lời chốt | human-gate1: gộp vào Hỏi-7 cùng câu kho chung; bảng zone_least_open ở AC-12, E1, E12 viết theo khuyến nghị, đổi nếu chủ kho chọn khác |
| P1 | evals | E9 không liệt app.raise_lead_alert, app.stamp_leads và hai hàm đọc cấu hình trong ca gọi thẳng khác sàn | Dưới ngữ cảnh B, raise_lead_alert với mã lead của A chèn lời báo giả vào danh sách của A mà E9 vẫn xanh | Ca khác sàn cho từng hàm kèm đối chứng dưới A | fixed: E9 thêm raise_lead_alert (A không đổi, đối chứng dưới A chèn đúng một dòng), stamp_leads (đối chứng dưới A), lead_routing_settings_rows, lead_alerts_to_admin |
| P1 | evals | Ràng buộc hạn gọi không ngắn hơn hạn nhận chưa đo khi đổi một phần; ca 400 không ghim lý do | Đã lưu 5/10, PUT riêng acceptMinutes 20 ghép với mặc định nên lọt, bảng thành 20/10, nhịp ném lỗi khi đọc | Hai ca đổi một phần trả 400 có lý do, bảng không đổi; ca 400 ghim lý do | fixed: AC-11 ghi ghép với cấu hình đã lưu; E11 thêm hai ca đổi một phần và ghim lý do cho mọi ca 400; thiết kế §4 ghi lõi kiểm trên cấu hình đã lưu |
| P1 | contract | Số đo «lead → cuộc gọi đầu» chưa nói xử lead giao lại (giao lại xoá mốc gọi) | Trưởng nhóm giao lại vài lead đã gọi, mốc gọi đầu thật mất, số đo lệch so với ngưỡng | Giữ mốc qua lần giao hoặc loại lead giao lại và đếm | fixed: thêm `reassign_count` trên lead; Đường đo loại lead có reassign_count lớn hơn 0 và báo số lead bị loại; AC-7, E7 đo bộ đếm |
