---
loai: dot
ma: [CK1, CK2, CK3, CK4]
nguon: [raw/2026-11-01-cong-chon-khoi/phien-01-11.md, raw/2026-11-01-cong-chon-khoi/cong-chon-khoi-hien-trang.md]
cap_nhat: 2026-11-01
---
# Đợt cong-chon-khoi-0111 — cổng chọn khối giao diện

Chủ kho 1/11 muốn mỗi lần một màn cần khối có ba lối được đề xuất và phê duyệt — trong kho của repo, chọn trên ReUI, vẽ
mới — kèm bằng chứng nhất quán. Khảo sát hiện trạng rồi chủ kho chốt hướng: thẻ ba lối ở Cổng Phạm vi, luật khi nào được
vẽ mới, và danh mục khối của kho nâng thành chỗ tra «trong kho». Thiết kế ở ADR-0019.

## Điều rút ra

- Ba lối đã có trong thang dùng lại bảy bậc nhưng là luật cho tác tử, không phải chỗ trình người; so lối chỉ diễn ra một
  lần theo lô khi chọn khối đích cho cả bản đầu.
- Bước phân kỳ của nghi thức thiết kế luôn bị bỏ khi màn đã có khối đích — chỗ so lối có sẵn mà không mở.
- Ảnh đối chiếu màn mới cạnh màn mẫu im đúng lúc cần: màn đầu của nhóm mới so với chính nó.
- Rơi xuống ghép từ thành phần xảy ra mà không thành quyết định nào được ghi; điều kiện chờ («khi có khoá») đã đủ mà không
  ai được nhắc.
- Bản đồ khuôn giữ nhất quán theo nhóm màn sau khi đã chọn; nó không trả lời khối nào đã dùng ở đâu — chỗ tra theo khối
  nên là danh mục khối đã có, không phải một sổ thứ ba.
- Ràng buộc là tần suất gọi người: cổng đặt ở Cổng Phạm vi sẵn có, chỉ bật cho ô chưa có khuôn.

## Mã

- CK1 — thẻ ba lối ở Cổng Phạm vi cho ô chưa có khuôn
- CK2 — luật khi nào được vẽ mới: đã tra gì, vì sao không đứng, hạn xem lại
- CK3 — danh mục khối của kho thành chỗ tra «trong kho»
- CK4 — trả bốn chỗ ghép tạm chờ khối Pro (chờ)
