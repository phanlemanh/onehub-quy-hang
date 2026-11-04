---
slug: nhap-excel-xem-truoc-ghi
at: 2026-11-03T15:00:01Z
verdict: findings
p0: 2
p1: 3
p2: 0
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
| --- | --- | --- | --- | --- | --- |
| P0 | design | Dòng sổ tách 65a/65b ghi «một lối» nhưng ô cơ hội đã duyệt ghi xem trước và ghi không tách được; thu phạm vi so với Cổng Đáng là việc người ký | Chủ kho ký Cổng Phạm vi tưởng hàng 65 vẫn giao «thả file, thấy từng ô, sửa rồi ghi»; ship xong không Đầu chủ nào nhập được file | Một dòng Hỏi thay dòng sổ cũ, trích ô cơ hội; thẻ hiện câu hỏi | human-gate1: Hỏi-4 (supersedes dòng tách), Context của hợp đồng trỏ Hỏi-4 |
| P0 | design | Dòng sổ «Chỉ tôi» trích câu chỉ quyết Đã bán/Ngừng; với Trưởng nhóm nhập, hàng là «Chỉ tôi» của ai chưa rõ | Trưởng nhóm nhập 300 căn cho Đầu chủ A; A giữ căn mà không đọc được hàng | Dòng Hỏi về mức hiện; E9 assert mức hiện cho dòng Trưởng nhóm gán | fixed: dòng sổ mới trích nhap-du-lieu.md «Hàng mới vào «Chỉ tôi» (hàng 12)» thay dòng cũ; human-gate1: Hỏi-5 (lõi chỉ cho người tạo đọc hàng «Chỉ tôi»), E9 chờ câu trả lời |
| P1 | evals | E2(a) chỉ dựng cột số chủ; E7 không soi kế hoạch đã lưu và dòng nhập | Cột Giá đáy ghép vào Giá chào qua lưới; bảng quy đổi mang số chủ lưu nguyên văn vào kế hoạch | Ma trận 3 cột × 4 đích sai + 3 × 2 đúng = 18; quét imports.plan và import_rows | fixed: E2(a) ma trận 18 phép so, ca cột nguồn không mang bảng quy đổi; E7 quét imports.plan và import_rows; AC-2a, AC-7 ghi thêm lời hứa; thiết kế thêm luật valueMap |
| P1 | contract | Trùng trong file chỉ xét trong một gói | Căn X ở dòng 10 và 250 (hai gói): xem thử ra hai lần tạo, ghi ra trùng hay cập nhật đè | Luật trùng xuyên gói; ca hai gói ở E10 | fixed: thiết kế tính dòng đầu mỗi căn cho cả file lúc mở lần nhập; AC-6, AC-10 và trục Coverage thêm «nhiều gói»; E10 chia hai gói, căn X ở hai gói |
| P1 | design | Quyết dòng so với người gửi, không với đầu chủ của dòng khi Trưởng nhóm gửi; lý do «chưa có đầu chủ» không trong ma trận | Trưởng nhóm nhập căn A đang giữ: A nhận tin bổ sung về căn của mình | Người giữ hiệu lực; trục mới ở E1; ca Trưởng nhóm × căn A/B ở E9 | fixed: thiết kế định nghĩa người giữ hiệu lực, thêm hàng lý do; E1 thêm trục đầu chủ hợp lệ (192 phần tử), tập lý do so với danh sách viết tay; E9 thêm hai ca |
