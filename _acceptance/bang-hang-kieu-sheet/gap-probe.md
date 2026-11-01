---
slug: bang-hang-kieu-sheet
at: 2026-10-31T15:05:00Z
verdict: findings
p0: 1
p1: 1
p2: 3
claims_input: ok
---
## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ d-…-6 ghi căn cứ «mục tiêu» nhưng câu trích chỉ quyết nhóm Toà → Loại căn, không quyết nhãn «Studio»/«nPN»/«Chưa rõ» hay hai lựa chọn nhóm phụ [vong-giao-dien-qua-ban-do#F1] | Người ký tưởng nhãn đã chốt; sàn gọi khác thì nhãn mọi nhóm lệch Sheet mà cổng vẫn duyệt | Tách thành hai dòng: nhóm mặc định giữ câu trích; nhãn và lựa chọn phụ là câu chỉ-người | fixed: ghi hai dòng mới mang supersedes d-…-6 — nhóm mặc định (mục tiêu) và Hỏi-2 nhãn loại căn + lựa chọn nhóm (chỉ người) |
| P1 | evals | Không eval chứng ghép danh mục đúng trên đường thật API → lưới; E2 đọc seed, E6/E9 chỉ đo chuỗi có mặt | Thân API khác khoá hay tên toà với seed thì lưới ra «Chưa rõ» hay nhầm toà mà E2, E6, E9 vẫn xanh | So năm dòng viết trước trên lưới với đáp án tính từ thân /api/v1/catalog | fixed: thêm bước vào E3 — năm mã viết trước, fetch /api/v1/catalog trong trang, mỗi ô loại căn/diện tích/tầng/hướng một đạt/trượt |
| P2 | evals | E9 chỉ cấm POST tới /listings và không tải lại trang khi offline | Lời gọi ghi khác phương thức lọt; danh mục chỉ giữ trong bộ nhớ trang mà E9 vẫn xanh | Không yêu cầu nào khác GET/HEAD; offline tải lại so nhóm; đối chứng xoá bản giữ | fixed: E9 cấm mọi phương thức khác GET/HEAD, thêm bước tải lại offline và đối chứng xoá qh:danh-muc |
| P2 | evals | Vế «sàn khác không thấy góc nhìn» chỉ đo trên kho giả (E7) | Màn truyền nhầm mã sàn vào khoá, người hai sàn thấy góc nhìn sàn kia | Người hai sàn lưu ở sàn A, đổi sang B không thấy, về A thấy lại; khoá chứa mã sàn đang làm | fixed: dung-b.mjs gắn dau-chu-2 vào Sàn trống; E8 thêm bước đổi sàn và đọc khoá thật |
| P2 | evals | E10 chỉ chụp tối cho lưới đầy, «đọc được» không có thước [ban-do-khuon-nhom-da-co#F2] | Khối trống/lỗi/điện thoại chìm chữ ở giao diện tối mà E10 vẫn đạt | Ma trận bốn trạng thái × sáng/tối, tỉ lệ tương phản ≥ 4,5:1 | fixed: E10 thành ma trận 8 ô viết trước, mỗi ô ảnh + tỉ lệ tương phản đạt/trượt |
