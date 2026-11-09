---
schema_version: 1
slug: chot-gui-chac-chan
feature: "Đầu khách bấm Gửi và luôn biết chắc đã đi cái gì: bảng chia sẻ của điện thoại mở với đủ ảnh đã chuẩn bị sẵn, thiếu ảnh thì màn nói rõ trước khi mở, kết quả hiện ngay trong khung nhìn, bấm lại không sinh link thứ hai; Gửi căn, Hỏi đầu chủ và Báo sai đi chung một lối chia sẻ, người vẫn tự bấm gửi"
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: chot-gui-chac-chan
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng chot-gui-chac-chan của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu khách bấm Gửi và luôn biết chắc đã đi cái gì: bảng chia sẻ của điện thoại mở với đủ ảnh đã chuẩn bị sẵn, thiếu ảnh thì màn nói rõ trước khi mở, kết quả hiện ngay trong khung nhìn, bấm lại không sinh link thứ hai; Gửi căn, Hỏi đầu chủ và Báo sai đi chung một lối chia sẻ, người vẫn tự bấm gửi

Vì sao: Chủ kho 09/11 báo «khi chia sẻ (Gửi căn) hiện không chia sẻ được ảnh», rồi «Báo giám sát sắp xếp và điều phối». Đo trên bản chạy: Safari iPhone giả lập chờ 4 giây vẫn mở bảng, 6 giây bị từ chối và màn rơi sang chép tin; danh sách ảnh lỗi thì căn bị coi như không ảnh mà không báo; bấm 2 lần ra 2 link; kết quả nằm khuất dưới màn; nút chính cao 28 px. Tính năng mới, Cổng Đáng trình chủ kho. Việc ghi Lần gửi khi huỷ bảng chia sẻ để chủ kho quyết ở Cổng Phạm vi.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Giữ mỗi lời gọi tạo link chậm 3 giây trên Safari iPhone: bấm Gửi vẫn mở bảng chia sẻ có đủ ảnh bìa; một ảnh lỗi thì màn nêu số ảnh thiếu; đóng bảng xong kết quả nằm trong khung nhìn ở 375 và thấy được cả khi bấm trong ngăn Xem trước; bấm lại cùng bộ căn và người nhận không tạo Lần gửi thứ hai; tên tệp đúng loại ảnh thật; tin và link còn đủ trong gói chia sẻ của cả ba việc; nút Gửi, Xem trước, Bỏ căn, chọn người nhận cao từ 44 px ở 375; N căn hỏi danh sách ảnh đúng N lượt» chưa?
- Kết quả nào là SỐNG: [đề xuất] Giữ mỗi lời gọi tạo link chậm 3 giây trên Safari iPhone: bấm Gửi vẫn mở bảng chia sẻ có đủ ảnh bìa; một ảnh lỗi thì màn nêu số ảnh thiếu; đóng bảng xong kết quả nằm trong khung nhìn ở 375 và thấy được cả khi bấm trong ngăn Xem trước; bấm lại cùng bộ căn và người nhận không tạo Lần gửi thứ hai; tên tệp đúng loại ảnh thật; tin và link còn đủ trong gói chia sẻ của cả ba việc; nút Gửi, Xem trước, Bỏ căn, chọn người nhận cao từ 44 px ở 375; N căn hỏi danh sách ảnh đúng N lượt
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Giữ mỗi lời gọi tạo link chậm 3 giây trên Safari iPhone: bấm Gửi vẫn mở bảng chia sẻ có đủ ảnh bìa; một ảnh lỗi thì màn nêu số ảnh thiếu; đóng bảng xong kết quả nằm trong khung nhìn ở 375 và thấy được cả khi bấm trong ngăn Xem trước; bấm lại cùng bộ căn và người nhận không tạo Lần gửi thứ hai; tên tệp đúng loại ảnh thật; tin và link còn đủ trong gói chia sẻ của cả ba việc; nút Gửi, Xem trước, Bỏ căn, chọn người nhận cao từ 44 px ở 375; N căn hỏi danh sách ảnh đúng N lượt» khi hết timebox
- Timebox: [đề xuất] 1 ngày sau khi lên bản thật.
