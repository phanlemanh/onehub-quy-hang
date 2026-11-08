---
slug: man-mau-bao-mau-hong
at: 2026-11-07T15:40:00Z
verdict: findings
p0: 3
p1: 2
p2: 0
claims_input: ok
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Hỏi-1 ghi kho_dao false dù lối khuyến nghị làm chỗ hỏng mất vĩnh viễn ở lần lưu đầu [anh-khong-chan-ban#F1] | Chủ kho chọn theo khuyến nghị tưởng đổi sau được, dữ liệu mẫu đã mất | Dòng sổ mới kho_dao true, thẻ nêu mất vĩnh viễn | human-gate1: dòng thay mang kho_dao true; thiết kế và Notes nêu «mất vĩnh viễn ở lần lưu đầu» |
| P0 | design | Dòng «chỉ web, không đổi API» ghi một-lối nhưng lối thêm trường lỗi có cấu trúc vẫn sống [mau-api-ten-truong-tieng-anh#F1] | Lõi đổi câu chữ, mọi lời báo rơi về câu chung mà không bài nào đỏ | Thành Hỏi; giữ lối web thì ghim mọi dạng lỗi phải được nhận ra | human-gate1: thành Hỏi-2 (khuyến nghị web); E3 thêm điều kiện không câu chung và đếm nhánh loi.push trong mã nguồn |
| P0 | design | Hai dòng bỏ design-pass và đặc tả UX trích quyết định của hàng 50, không quyết cho hàng này [mau-api-ten-truong-tieng-anh#F3] | Chủ kho ký mà chưa thấy khối báo, trong khi khối báo là chỗ che rủi ro của Hỏi-1 | Hỏi một chạm duyệt bằng chữ như hàng 50 | human-gate1: thành Hỏi-3 (khuyến nghị duyệt bằng chữ, nhìn màn ở E7) |
| P1 | evals | Lời báo chấm trên lỗi của lõi, chưa trên errors thật của API; E3 chưa ghim số nhánh | API đổi tiền tố, màn ra câu chung mà E1–E3 xanh | E5 đưa errors của GET thật qua loiMauHong; E3 đếm loi.push | fixed: E5 thêm quan hệ trên errors thật (2 câu, không câu chung, có «Người giữ», chỗ biến mất bằng chỗ đã báo) và ca thêm mẫu; E3 đếm nhánh trong mã nguồn |
| P1 | evals | Đường lưu tab Mẫu bài không có bài đo | Thân PUT mẫu bài làm mất lời Facebook đọc được mà evals xanh | E5c backend-effect cho mẫu bài; E7 thêm bước lưu tab Mẫu bài | fixed: thêm E5c; E7 thêm bước lưu ở tab Mẫu bài |
