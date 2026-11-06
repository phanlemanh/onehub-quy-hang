---
schema_version: 1
slug: anh-khong-chan-ban
feature: Đầu chủ đưa một căn lên Đang bán — bằng «Sẵn sàng bán», ô Trạng thái hay nhập file — khi chưa có ảnh thật; căn lên bảng hàng chung, gửi khách được, ảnh hiện là mục còn thiếu ở mức đủ và thành việc «bổ sung ảnh» ở Hôm nay của đầu chủ giữ căn
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: anh-khong-chan-ban
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng anh-khong-chan-ban của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).

Đầu chủ đưa một căn lên Đang bán — bằng «Sẵn sàng bán», ô Trạng thái hay nhập file — khi chưa có ảnh thật; căn lên bảng hàng chung, gửi khách được, ảnh hiện là mục còn thiếu ở mức đủ và thành việc «bổ sung ảnh» ở Hôm nay của đầu chủ giữ căn

Vì sao: Chủ kho chốt 06/11 (Tham chiếu §12, đổi luật 17): chặn vì không có ảnh là thất bại ngay bước đầu — Sheet không có ảnh nên mọi căn chuyển sang kẹt ở Chưa đủ để rao, chỉ người nhập thấy. Audit sàn mới ngày 0 §9

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Căn đủ giá kèm điều kiện phí, pháp lý, tình trạng sử dụng mà 0 ảnh thì vào Đang bán ở cả ba lối; số ảnh tối thiểu của sàn mặc định 0, đặt 1–20 thì luật cũ áp lại; trang khách mở căn không ảnh hiện ô trống, không lỗi; căn thiếu ảnh có dấu ở Bảng hàng và việc ở Hôm nay» chưa?
- Kết quả nào là SỐNG: [đề xuất] Căn đủ giá kèm điều kiện phí, pháp lý, tình trạng sử dụng mà 0 ảnh thì vào Đang bán ở cả ba lối; số ảnh tối thiểu của sàn mặc định 0, đặt 1–20 thì luật cũ áp lại; trang khách mở căn không ảnh hiện ô trống, không lỗi; căn thiếu ảnh có dấu ở Bảng hàng và việc ở Hôm nay
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Căn đủ giá kèm điều kiện phí, pháp lý, tình trạng sử dụng mà 0 ảnh thì vào Đang bán ở cả ba lối; số ảnh tối thiểu của sàn mặc định 0, đặt 1–20 thì luật cũ áp lại; trang khách mở căn không ảnh hiện ô trống, không lỗi; căn thiếu ảnh có dấu ở Bảng hàng và việc ở Hôm nay» khi hết timebox
- Timebox: …
