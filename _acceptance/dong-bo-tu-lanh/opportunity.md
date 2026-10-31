---
schema_version: 1
slug: dong-bo-tu-lanh
feature: Đầu chủ sửa căn lúc máy chủ trục trặc ngắn hay hết phiên thì thay đổi tự gửi lại khi máy chủ trả lời được, chỉ báo đồng bộ nói đúng vì sao chưa gửi, và căn đang ở Cần xem sửa tiếp hay xử lý không kẹt, không đảo thứ tự hai lần sửa
owner: phanlemanh@gmail.com
stage: decided              # discovery | decided | archived
decision: build   # build | iterate | park | kill — người ký Cổng 0 điền
decided_by: Manh Phan
decided_at: 2026-10-31T13:38:56Z   # ISO UTC
prototype:
  base_commit:     # điểm cắt nhánh proto khỏi nhánh chính — guard diffBase khi keep
  disposition:     # keep | archive
lo_trinh_ma: 61
lo_trinh_tep: docs/plan/lo-trinh.json
---

## Vấn đề & ai gặp

Mở từ hàng 61 của «Lộ trình onehub-quy-hang» (`docs/plan/lo-trinh.json`).
Nguồn: `wiki/dot/ton-nen-2.md#85a4e60f45b708157b5705b6b8bc702346d1ac99` — chưa có trang: trang nền, mã H13-N3, mã H13-N13, mã H13-N25, mã H13-N4, mã H13-N6, mã H13-N16

Đầu chủ sửa căn lúc máy chủ trục trặc ngắn hay hết phiên thì thay đổi tự gửi lại khi máy chủ trả lời được, chỉ báo đồng bộ nói đúng vì sao chưa gửi, và căn đang ở Cần xem sửa tiếp hay xử lý không kẹt, không đảo thứ tự hai lần sửa

Vì sao: Ba hành vi chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 13 (Ngoài-3/13/25, Ngoài-4, Ngoài-6/16): không mất dữ liệu ngầm nhưng người dùng phải xử lý tay việc lẽ ra tự lành, hoặc bị chỉ báo nói sai; phải xong trước hai tuần thử
Số đo hai tuần thử gần nhất (Tham chiếu §11): Số lần mất mạng và thao tác lúc mất mạng trên điện thoại — ngưỡng số đặt trước khi thử.

## Ngưỡng chết / ngưỡng UAT

- Câu hỏi phép đo trả lời: [đề xuất] đã đạt «Máy chủ giả trả 5xx hay 401 rồi hồi: thao tác ở lại hàng đợi và lên máy chủ đúng thứ tự, không căn nào vào Cần xem; 4xx khác vẫn vào Cần xem như cũ; chỉ báo phân biệt mất mạng, hết phiên, bị từ chối và lỗi kho trên máy; sửa căn đang Cần xem rồi «Giữ của tôi», «Lấy bản mới» hay «Bỏ thay đổi» không để thao tác kẹt và giá cuối là lần sửa sau cùng» chưa?
- Kết quả nào là SỐNG: [đề xuất] Máy chủ giả trả 5xx hay 401 rồi hồi: thao tác ở lại hàng đợi và lên máy chủ đúng thứ tự, không căn nào vào Cần xem; 4xx khác vẫn vào Cần xem như cũ; chỉ báo phân biệt mất mạng, hết phiên, bị từ chối và lỗi kho trên máy; sửa căn đang Cần xem rồi «Giữ của tôi», «Lấy bản mới» hay «Bỏ thay đổi» không để thao tác kẹt và giá cuối là lần sửa sau cùng
- Kết quả nào là CHẾT: [đề xuất] chưa đạt «Máy chủ giả trả 5xx hay 401 rồi hồi: thao tác ở lại hàng đợi và lên máy chủ đúng thứ tự, không căn nào vào Cần xem; 4xx khác vẫn vào Cần xem như cũ; chỉ báo phân biệt mất mạng, hết phiên, bị từ chối và lỗi kho trên máy; sửa căn đang Cần xem rồi «Giữ của tôi», «Lấy bản mới» hay «Bỏ thay đổi» không để thao tác kẹt và giá cuối là lần sửa sau cùng» khi hết timebox
- Timebox: …
