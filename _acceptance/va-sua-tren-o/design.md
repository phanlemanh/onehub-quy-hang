# Vá sửa trên ô — thiết kế

Hàng phát sinh của đợt «Đầu chủ động vào» (dãy B), gộp hai mục chủ kho chọn «mở hợp đồng mới» ở Cổng Bằng chứng hàng 15
(sua-tren-o, PR #56): Ngoài-2 và Ngoài-3. Không có ô cơ hội, không mã lộ trình.

## Vấn đề

1. **Đọc lại làm tròn (Ngoài-2).** `vietGia` làm tròn tới hai số lẻ của tỷ và tới triệu nguyên, trong khi bộ đọc nhận tới
   chín số lẻ của tỷ và sáu của triệu. Gõ «4,655 tỷ» → «Hiểu là: 4,66 tỷ» nhưng máy ghi 4.655.000.000. Hệ quả cùng gốc:
   mở ô Giá của căn đang 4,655 tỷ thì ô gõ điền sẵn «4,66 tỷ»; Enter là ghi 4,66 tỷ — đổi giá mà người không gõ gì.
2. **Hoàn tác trên thông báo cũ (Ngoài-3).** Nút trên thông báo đọc «lần sửa gần nhất» lúc bấm, không phải lần sửa của
   chính thông báo: sửa căn A rồi căn B, bấm Hoàn tác trên thông báo của A thì máy đảo B; lần sửa sau không hoàn tác được
   thì nút của thông báo trước không làm gì, không báo gì.

## Cách giải

- `vietGia` viết đúng từng đồng: tới chín số lẻ của tỷ, sáu số lẻ của triệu, không dấu chấm nghìn («1000 tỷ», không
  «1.000 tỷ» — bộ đọc coi dấu chấm là dấu lẻ). Bất biến: `docGia(vietGia(x)).dong === x` với mọi số nguyên đồng trong
  khoảng bộ đọc nhận (1 triệu tới 1.000 tỷ). Mọi chỗ của trình sửa dùng `vietGia` (đọc lại, giá chốt, hộp hỏi lại, thông
  báo, chữ điền sẵn trong ô gõ) cùng đúng theo. Mô tả «cũ → mới» và chữ điền sẵn dời từ `tren-o.tsx` sang `lenh.ts` (hàm
  thuần `moTaThayDoi`, `chuDienSan`) để mỗi chỗ hiện giá có một assert. Cột Giá của Bảng hàng giữ cách viết gọn hai số
  lẻ (hàng 14, ngoài vùng).
- Mỗi lần ghi thành công (không tính lệnh bù) tạo một bản ghi hoàn tác `{căn, nhãn, lệnh bù, phiên bản sau khi ghi, đã
  dùng}` trong bộ giữ thuần `soHoanTac` (`hoan-tac.ts`: ghi · dungNut(bản ghi) · dungPhim()); thông báo giữ đúng bản ghi
  của nó; Ctrl/Cmd+Z dùng bản ghi của lần sửa thành công gần nhất. Phiên bản trên máy đọc bằng `useDocPhienBan` của bộ
  đồng bộ (hàng 15). Hàm thuần `xetHoanTac(banGhi, phienBanHienTai)` ở `hoan-tac.ts`
  quyết: đã dùng → «Đã hoàn tác rồi»; phiên bản trên máy khác phiên bản sau khi ghi → «Không hoàn tác được: căn đã có
  lần sửa sau»; còn lại → ghi lệnh bù. Dùng xong (bất kể từ nút hay phím) thì bản ghi đánh dấu đã dùng và rời Ctrl+Z.

## Đặc tả UX

<!-- ux-spec:start -->
Không màn mới; trạng thái thêm của trình sửa và thông báo hàng 15:

| Trạng thái | Thấy gì |
|---|---|
| Gõ «4,655 tỷ» | «Hiểu là: 4,655 tỷ, <điều kiện phí>» |
| Mở ô Giá căn 4,655 tỷ | ô gõ điền sẵn «4,655 tỷ» |
| Hoàn tác thông báo của căn A sau khi sửa căn B | A về giá cũ, «Đã hoàn tác giá A»; B giữ nguyên |
| Hoàn tác thông báo cũ khi căn đã có lần sửa sau | thông báo lỗi «Không hoàn tác được: căn đã có lần sửa sau», không ghi gì |
| Bấm lại Hoàn tác / Ctrl+Z sau khi đã hoàn tác | «Đã hoàn tác rồi» (nút) · Ctrl+Z không làm gì |

Khuôn IA: giữ nguyên trình sửa nổi và thông báo Sonner của hàng 15 (không chọn khuôn mới).
<!-- ux-spec:end -->

## Quyết định

Sổ `decisions.jsonl` d-…-2 (đọc lại đúng từng đồng), d-…-4 (nhận biết bằng phiên bản), d-…-5 (bỏ design-pass).

- **Hỏi-1** (d-20261101T035548Z-6, thay d-…-3): căn đã có lần sửa sau thì nút Hoàn tác trên thông báo cũ làm gì? Nháp theo
  khuyến nghị: không ghi gì, báo «Không hoàn tác được: căn đã có lần sửa sau» — lần sửa sau có thông báo và Ctrl+Z riêng.
  Lối khác: hỏi lại «Căn đã có lần sửa sau — vẫn đưa về <giá cũ>?» rồi ghi khi bấm Đổi.

## Ngoài phạm vi

Cột Giá của Bảng hàng viết gọn hai số lẻ · ghi lỗi rồi Ctrl+Z đảo lần sửa trước (Ngoài-4 hàng 15, đã ghi Known limits) ·
các bài tự kiểm yếu của hàng 15 (Ngoài-5 tới 9).
