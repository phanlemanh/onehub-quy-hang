---
slug: dien-ma-can-cho-hang
at: 2026-11-02T07:42:55Z
verdict: findings
p0: 1
p1: 3
p2: 1
---
## Findings
| Sev | Artifact | Thiếu gì | Kịch bản fail | Thước đo | Xử lý |
|---|---|---|---|---|---|
| P0 | design | Dòng sổ «bỏ design-pass» ghi nguồn một lối nhưng lối bản bấm được với nút lưu giả vẫn sống; vòng có ba lối vào mới, bốn trạng thái và khổ 375 | Chủ kho duyệt giao diện bằng chữ; tới lượt chấm ảnh chụp mới lộ lỗi trùng căn sai chỗ hay dòng Bảng hàng không mở được — làm lại sau thi công | Đổi thành một Hỏi ở Cổng Phạm vi nêu hai lối kèm giá, máy khuyến nghị, người chọn | human-gate1: ghi Hỏi-4 (dòng sổ mới, thay dòng bỏ design-pass), máy khuyên dựng bản bấm được |
| P1 | contract | AC-6 đi qua máy chủ mà thiếu thẻ cross-layer; chưa đo lệnh bị từ chối khi có mạng lại; ca mất mạng mâu thuẫn câu «máy chủ nhận thì địa chỉ mới chuyển» [san-sang-ban#F2] | Mất mạng gắn mã trùng; có mạng lại máy chủ từ chối; hàng trên máy giữ mã sai, lỗi không có chỗ hiện; E3, E6, E6u vẫn xanh | Thẻ cross-layer cho AC-6; E6b bộ đồng bộ nói với API thật ba ca 201 · trùng căn · đã có mã | fixed: AC-6 thêm (cross-layer) và hành vi từ chối (hàng về chưa mã, lệnh vào Cần xem có lý do); mã từ chối đổi 409 → 422 cho đúng đường Cần xem của bộ đồng bộ; thêm E6b (test.web_db) |
| P1 | evals | E9 đọc ADR-0008 trong khi hợp đồng khai ADR mới — hội đồng không thấy ADR mới | Thi công viết ADR mới, hội đồng đọc ADR-0008 và chấm trượt; hay ngược lại | Chốt một tệp ADR đích ở Notes và inputs của E9 | fixed: giám sát cấp ADR-0026; E9 đọc docs/adr/0026-gan-ma-can.md, Notes và thiết kế ghi ADR-0026 |
| P1 | evals | E6u viết cứng Toà A, mã A-12.05, không kiểm điều kiện trước — lượt chấm lại vấp hàng của lượt trước | Lượt 2 gắn A-12.05 bị từ chối vì hàng X của lượt 1 trên máy dev dùng chung | Mã có hậu tố run_id, bước 0 kiểm chưa hàng nào mang mã ấy | fixed: E6u đặt MA = A-12.<4 số cuối run_id>, bước 0 GET kiểm; hàng Y gõ MA đổi hoa thường và dấu |
| P2 | evals | «Hàng đang mở» không định nghĩa thành tập; E3 chỉ một trạng thái mở dương | Thi công chỉ lọc Active; hàng trùng ở Cần xem hay Đang giao dịch vẫn gắn được | AC-3 liệt tập trạng thái mở; E3 một ca mỗi trạng thái | fixed: AC-3 trỏ OPEN_STATUSES của lõi; E3 một ca mỗi trạng thái mở và mỗi trạng thái đóng, đếm từ chính hai danh sách của lõi |
