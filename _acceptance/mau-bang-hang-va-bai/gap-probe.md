---
slug: mau-bang-hang-va-bai
at: 2026-11-06T16:30:00Z
verdict: findings
p0: 1
p1: 3
p2: 1
---

## Findings

| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng «Ai đặt mẫu» của bảng đối chiếu ghi «chưa có cấp nhóm» mà không thành Hỏi; Out of scope có hai điều sản phẩm (mẫu theo nhóm hay người · ghi tên mẫu vào sổ exports) sổ không ghi ai quyết [danh-muc-xa-day-du#F1] | Người ký thấy năm Hỏi tưởng đã chọn hết; mẫu chỉ cấp sàn và sổ xuất không ghi mẫu thành cứng không ai chọn | Mỗi điều một dòng sổ S1; chưa quyết thì thành Hỏi chi-nguoi | fixed: thêm Hỏi-6 (cấp của mẫu) và Hỏi-7 (ghi mẫu vào sổ exports) vào thiết kế và sổ; Out of scope trỏ Hỏi-6, Hỏi-7; bảng đối chiếu trỏ Hỏi-6 |
| P1 | evals | AC-7 và vế màn Gửi của AC-8 chỉ đo ở lõi; không bài web cho màn Gửi đọc mẫu lúc mở, sửa được tin | Màn Gửi vẫn gọi soanTin cũ hay giữ mẫu đệm giữa các lần mở mà E7, E7b, E8 vẫn xanh | Bài web cho shares/new ma trận viết trước; ca đổi mẫu rồi mở lại; ca ô tin sửa được; E10 thêm bước | fixed: thêm E7c (ma trận 3×2, đổi mẫu rồi dựng lại, ô tin sửa được); E10 thêm bước sửa lời rồi mở lại màn Gửi |
| P1 | evals | AC-5, AC-6: không eval nào đọc tệp Excel, PDF, ảnh thật hay bài chép từ hộp Xuất | Hộp lấy cột Excel từ góc nhìn hay chép bài không truyền mẫu mà E5, E5b, E6 vẫn xanh | Bài web cho từng kiểu xuất, đếm 5, Excel đọc lại hàng tiêu đề | fixed: thêm E5c (năm kiểu xuất, Excel đọc lại tiêu đề tệp, bài so cả chuỗi D + dựng sẵn + C) |
| P1 | contract | Ngưỡng ô cơ hội của hàng trống; contract nói kế thừa hàng 50 mà không chép, không có ngưỡng CHẾT | Cổng Giá trị không thấy ngưỡng, điền sau khi thấy số | Chép ngưỡng SỐNG, CHẾT, timebox; Đường đo trỏ AC và eval | fixed: opportunity.md chép ngưỡng hàng 50 (câu hỏi, SỐNG, CHẾT, timebox); Đường đo trỏ từng vế tới AC và eval |
| P2 | evals | Tab Mẫu bài không có bài web (Về mặc định, xem trước, biên 500); E6 không thử biểu tượng ở C | «Về mặc định» gửi chuỗi rỗng thay vì bỏ khoá mà E3 vẫn xanh; biểu tượng ở C lọt | Bài web tab Mẫu bài; E6 thêm dòng C mang biểu tượng | fixed: thêm E3b (Về mặc định bỏ khoá, xem trước so chuỗi, biên 500/501); E6 thêm hai dòng biểu tượng ở D và ở C, đếm 12 |
