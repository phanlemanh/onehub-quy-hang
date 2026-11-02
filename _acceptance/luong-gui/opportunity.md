---
schema_version: 1
slug: luong-gui
feature: Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo
owner: phanlemanh@gmail.com
stage: discovery              # discovery | decided | archived
decision:         # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: 
decided_at:     # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 34
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 34 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ban-dau-2910.md#867b6192ae2581fd453691e740592f736dda4cbc` — chưa có trang: trang nền, mã K4

Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo

Vì sao: Màn P0 (G1–G3); bất biến 3
Số đo hai tuần thử gần nhất (Tham chiếu §11): Thời gian khách hỏi → gửi được căn; số link khách mở, số lượt quan tâm — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo» chưa?
- Kết quả nào là SỐNG: [đề xuất] Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Đầu khách chọn căn, xem trước đúng trang khách sẽ thấy, rồi mở bảng chia sẻ của điện thoại với link, ảnh và tin soạn sẵn; người tự bấm gửi trong Zalo» khi hết timebox
- Timebox: …
