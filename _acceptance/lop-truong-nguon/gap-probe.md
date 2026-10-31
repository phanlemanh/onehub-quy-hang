---
slug: lop-truong-nguon
at: 2026-10-31T03:45:00Z
verdict: findings
p0: 2
p1: 1
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Sổ d-5 ghi luật nhận căn là «mục tiêu» trích Tham chiếu §2 — câu trích chỉ quyết trưởng nhóm bàn giao, không quyết ai thành đầu chủ giữ căn hay đầu chủ có tự chuyển được không; chưa định ca trưởng nhóm không kiêm Đầu chủ đặt chủ nhà trên hàng chưa có người giữ. d-7 «hai số cuối» cũng không được câu trích quyết. Mẫu đã gặp [loi-hang-va-su-kien#F2] [doi-ten-api-tieng-anh#F1] | Chủ kho ký mà không xét luật nhận căn; đầu chủ B đặt chủ nhà trước đầu chủ A và giữ căn, không luật đã ký nào phân xử; hàng do trưởng nhóm đặt chủ nhà trả mã người giữ rỗng | Dòng «chỉ người» Hỏi-3 lên thẻ; ca trưởng nhóm không kiêm Đầu chủ trong AC-4 và E4b; xử d-7 | fixed: d-5 thay bằng Hỏi-3 (chỉ người, khuyến nghị + hai lối khác có giá); AC-4 và E4b thêm ca trưởng nhóm không kiêm Đầu chủ → 403; d-7 thay bằng dòng mới bỏ hẳn số rút gọn (chỉ cờ «có số») nên câu trích quyết trọn; AC-3, AC-5, E3, E5 sửa theo |
| P0 | design | Sổ d-2 «một lối» với lối chết «ngoài vùng» không chết thật (migration mới đổi được ràng buộc loại sự kiện); bảng ghi đè làm mất lịch sử ai giữ căn lúc số bị mở. Mẫu đã gặp [doi-ten-api-tieng-anh#F2] | Gán lại ba lần chỉ còn người cuối; không chứng được người mở số lúc ấy có giữ căn | AC kèm eval: mỗi lần gán thêm đúng một dòng chỉ thêm | fixed: d-2 thay bằng bảng gán chỉ thêm `listing_agent_assignments` (lối chết thật: ghi vào sự kiện của hàng làm tăng phiên bản hàng; ghi đè mất lịch sử); AC-10 và E10 đếm +1 dòng, dòng cũ giữ nguyên; AC-8 và E8 thêm bảng gán vào ca chỉ thêm |
| P1 | evals | Lời hứa «cơ sở dữ liệu giữ» và «hàm cơ sở dữ liệu cùng luật với lõi» không eval nào đo; E8 chỉ đo đầu khách; E5 chỉ đo đầu chủ khác sửa; E9 không ghim thông điệp từ chối | Hàm cơ sở dữ liệu bỏ phép xét vai, API chặn trước nên E5, E7 xanh; người giữ căn đã mất vai Đầu chủ gọi thẳng hàm mở số qua đường khác và nhận số | Ma trận dưới vai quy_hang_app dùng chung bảng của E2; ghim thông điệp; thêm telesales, quản trị sàn vào E5 | fixed: AC-2 đo cả lõi và cơ sở dữ liệu bằng CÙNG một bảng 12 ô viết tay; AC-8 và E8 chạy đủ 12 ô dưới quy_hang_app (đọc, sửa, thêm, mở số, ghim «không có quyền mở số chủ», đếm 12 ô); E9 ghim cùng thông điệp; AC-5 và E5 thêm đầu chủ khác, telesales, quản trị sàn sửa → 403 (đếm 3) |
| P2 | contract | Ma trận AC-2 có hai ô tự mâu thuẫn theo định nghĩa, không ghi kết quả từng ô, thiếu ô kiêm vai. Mẫu đã gặp [loi-hang-va-su-kien#F1] | Người viết code tự đặt kết quả hai ô vô nghĩa; ca quản trị sàn kiêm Đầu chủ bị chặn nhầm lọt | Bảng kết quả từng ô trong hợp đồng, năm vai × giữ/không + hai ô kiêm vai | fixed: AC-2 thành bảng 12 ô có kết quả (năm vai × giữ/không + hai ô kiêm vai), E2 đếm đúng 12 lần so |
