---
slug: lead-dien-thoai
at: 2026-11-04T09:40:00Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Dòng bỏ design-pass dựa trên câu trích chỉ liên quan, trong khi hình tab Lead còn là câu hỏi | Duyệt Hỏi-2 bằng chữ, tới S4 ảnh 390 cho thấy thanh chọn đẩy nút Gửi khỏi khung nhìn, làm lại E1–E6 | Dòng sổ mới hoặc chạy design-pass | fixed: Hỏi-2 thay bằng dòng có căn cứ Tham chiếu (giám sát D-14); dòng bỏ design-pass viết lại căn cứ một lối; E1 chặn nút Gửi ngoài khung nhìn |
| P0 | contract | Dòng bỏ quét độ phủ có lối chết là lời dự đoán; ô vai không nhập được, trống, đang tải sót | Đầu chủ hay vai khác thấy form trống thay khối báo, telesales mới thấy khung trắng, không eval nào đỏ | Thêm AC và eval cho vai, trống, đang tải | fixed: thêm AC-9 và E9 (bốn ca: đầu chủ, người mua hàng, telesales mới, đang tải); dòng bỏ quét viết lại căn cứ; Coverage thêm trục vai |
| P1 | evals | E4, E6 đo /leads/mine thay vì phần «Lead đã nhập» trong tab Lead | Phần trong tab lúc mất mạng báo «Chưa có lead nào», E6 vẫn xanh | Đo trên /leads/new bấm sang phần trong tab | fixed: E4, E6 chạy trên /leads/new phần trong tab; E6 lặp ca trên /leads/mine |
| P1 | evals | E4 không đo nấc «Lên bảng» | Badge «Lên bảng» hỏng mà E4 xanh | Thêm bước đưa lead lên bảng và đối chiếu nấc | fixed: E4 thêm bước POST /leads/{id}/listing và nacSauLenBang |
| P1 | contract | Hợp đồng không khai vùng tệp mới; E7a liệt today/page.tsx trái Out of scope | Thợ chạm ngoài vùng không ai duyệt | Mục vùng tệp trong hợp đồng | fixed: thêm mục «Vùng tệp», gỡ today/page.tsx khỏi E7a, ghi «không chạm today/**» |
