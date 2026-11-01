---
slug: sua-hang-loat
at: 2026-11-01T06:16:24Z
verdict: findings
p0: 2
p1: 3
p2: 0
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng d-…-9 máy quyết «đánh dấu đã gọi» chỉ là «Còn / giữ giá» với lý do không loại được «Không nghe máy» hàng loạt | Nửa lô không nghe máy: người ghi sai xác nhận (làm tươi giả) hoặc quay lại ghi từng căn; chủ kho không biết có người chọn nghĩa thay | Dòng sổ thành chi-nguoi hoặc nêu được ràng buộc làm lối khác chết | fixed: dòng d-…-14 thay d-…-9 với lý do mới — lõi không có loại sự kiện cho «Không nghe máy» (EVENT_TYPES), thêm là đổi packages/core ngoài ranh giới; ghi Out of scope |
| P0 | design | Dòng d-…-5 «mọi thao tác lô hỏi lại» ghi mot-loi, nhưng với đổi trạng thái lối «ghi ngay + Hoàn tác lô» vẫn sống | Chủ kho ký mà tưởng luật đã chốt; mỗi lần đổi lô thêm một chạm trái nhịp «không nút Lưu» | Tách thành Hỏi kèm khuyến nghị và lối khác | human-gate1: thành Hỏi-2 (d-…-15 thay d-…-5), nháp theo khuyến nghị «hỏi lại mọi thao tác lô» |
| P1 | evals | AC-6 không có eval; kết cục «kho trên máy từ chối lúc ghi» không có thước | Thông báo báo đủ n căn, căn hỏng bị bỏ tích, qua S4 | Eval test cho hàm gom kết quả với một căn bị từ chối + đối chứng đỏ | fixed: thêm E9b (gomKetQua, bảng viết tay + đối chứng đỏ) |
| P1 | contract | AC-2 hứa ghi cho căn bị lọc ẩn mà không tag cross-layer; E7 chỉ đếm hộp hỏi rồi Thôi | Hàm ghi lấy căn từ danh sách đã lọc; 2 căn ẩn không đổi mà E4, E7 vẫn đạt | Tag cross-layer + bước backend-effect bấm Đổi khi căn ẩn | fixed: AC-2 tag (cross-layer); E7 thêm bước Đổi + đếm sự kiện 3 căn; thêm E7b backend-effect |
| P1 | evals | «Ngừng hẳn» (lý do bắt buộc) và «không căn nào đổi được: nút Đổi tắt» không có bài nhìn | Lý do không xuống lệnh ghi hay nút Đổi vẫn bấm được; E1 vẫn xanh | ui-check backend-effect cho lô Ngừng hẳn và lô toàn căn không đổi được | fixed: AC-4 nêu rõ; thêm E8b (nút tắt khi chưa lý do, lý do trong sự kiện từng căn, lô nấc cuối không ghi) |
