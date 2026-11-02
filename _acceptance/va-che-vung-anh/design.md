# Vá Che vùng ảnh — thiết kế

Hàng vá của dãy B, mở từ Cổng Bằng chứng hàng 19 (`_acceptance/che-vung-anh/`): chủ kho chọn «mở hợp đồng mới» cho
Ngoài-3 — hộp che bị giữ ở bề rộng mặc định của `DialogContent` (`sm:max-w-sm`, 24rem) vì lớp `max-w-5xl` của trình che
không thắng lớp có tiền tố `sm:`; khung vẽ tới 960×600 tràn khỏi hộp và đè lên hàng nút trên máy tính.

Câu giao: «Vá Che vùng ảnh: trên máy tính khung vẽ nằm gọn trong hộp che ở mọi cỡ ảnh, ảnh co theo khung; điện thoại giữ
như cũ».

## Hiện trạng

- `redact/trinh-che.tsx` dựng `<canvas width=hien.w height=hien.h>` với `hien` = ảnh co vừa 960×600 (không phóng to). Canvas
  hiện đúng cỡ điểm của nó — không co theo hộp.
- Điểm kéo đọc bằng `clientX - rect.left`, rồi `khungTuMan(a, b, hien, anh)` đổi sang điểm ảnh gốc. Phép đổi đúng chỉ khi cỡ
  hiện trên màn bằng cỡ vẽ của canvas.
- `DialogContent` (base-nova) mang `w-full max-w-[calc(100%-2rem)] sm:max-w-sm`; trình che truyền `max-w-5xl` (không có
  tiền tố) nên từ 640px trở lên hộp vẫn 24rem.

## Cách vá

1. **Hộp rộng trên máy tính.** `DialogContent` của trình che mang `sm:max-w-5xl` (64rem) — bậc nhỏ nhất của thang giữ trọn
   khung vẽ 960 cộng lề trong hộp (2 × 1rem). Dưới 640px lớp không áp: điện thoại giữ hộp gần hết bề ngang như cũ.
2. **Khung vẽ co theo hộp.** Canvas giữ cỡ vẽ `hien` (độ nét xem trước không đổi), hiển thị bằng CSS
   `block w-auto h-auto max-w-full max-h-[calc(100dvh-13rem)] mx-auto`: bề ngang không vượt hộp, bề cao chừa chỗ cho đầu hộp
   và hàng nút để hộp nằm trong màn ở khổ máy tính vừa (1024×768). Phần tử thay thế có tỉ lệ riêng nên hai trần cùng giữ tỉ
   lệ ảnh.
3. **Điểm kéo đổi theo cỡ hiển thị.** Hàm thuần mới `diemTrenKhung(p, hienThi, hien)` ở `vung.ts` nhân điểm trên khung hiển
   thị với `hien / hienThi` theo từng trục, trước khi vào `khungTuMan`. Khung hiển thị rỗng (rộng hay cao 0) trả điểm như
   cũ. Điểm ngoài khung giữ nguyên để `khungTuMan` kẹp mép như hàng 19.

Không đổi: lưu bản che (`luu.ts`, `ve.ts`), cỡ bản nhẹ, menu ảnh, máy chủ, cơ sở dữ liệu.

## Hệ bố cục (ADR-0024) — ngoại lệ có hạn

ADR-0024 §9 đỏ khi màn đặt bề rộng hay kích thước tuỳ ý và khi gọi thẳng ngăn nổi; ngăn nổi của hệ bố cục do hàng 91
(`he-bo-cuc`) dựng — hàng ấy chưa gộp vào nhánh chính lúc mở vòng này. Theo §9 («Màn của hàng đang chạy ghi ngoại lệ có
hạn … tới khi hàng ấy chuyển») và lời giao của giám sát, hai lớp `sm:max-w-5xl` và `max-h-[calc(100dvh-13rem)]` là
**ngoại lệ có hạn**: ghi ở Notes của hợp đồng và một dòng chú thích tại chỗ; hết hạn khi trình che chuyển sang ngăn nổi của
hệ bố cục. Ghi vào bản đồ khuôn (`design/patterns/`) là tệp ngoài vùng của hàng — gửi việc phụ để hàng 91 liệt trình che
(và hộp xem ảnh của `muc-anh.tsx`, cùng lỗi) vào danh sách chuyển.

## Không làm

- Ngoài-4 hàng 19 (khung đã bỏ còn hiện trên PNG có vùng trong suốt) — chủ kho đã chọn Known limits; cùng tệp nhưng khác
  lỗi.
- Hộp xem ảnh lớn trong `muc-anh.tsx` (`max-w-4xl`, cùng kiểu lỗi) — ngoài vùng của hàng; báo giám sát bằng việc phụ.
- Che bằng cảm ứng trên điện thoại — ngoài phạm vi hàng 19, giữ nguyên.
- Đổi trình che sang `Sheet`/ngăn nổi — việc của hàng 91.

## Đối chiếu ngành

Không chạm đối tượng nghiệp vụ (chỉ bố cục hộp và phép đổi toạ độ con trỏ) — không có dòng RESO. Sản phẩm cùng loại: trình
che/cắt ảnh của Lofty và kvCORE mở toàn màn hay hộp lớn co ảnh theo khung; không có danh sách cố định nào để làm dữ liệu
của sàn.

## Kiểm

- Bài thuần (`vung.test.ts`): ma trận viết tay cho `diemTrenKhung` và cho chuỗi `diemTrenKhung → khungTuMan` (kéo trên
  khung co cho cùng khung điểm ảnh như kéo trên khung không co), mỗi ma trận một đối chứng đỏ.
- Bài nhìn trên bản chạy dev dãy B (cổng 3481), ba khổ 1440×900 · 1024×768 · 375×812, bốn cỡ ảnh (ngang lớn, dọc, nhỏ,
  rất rộng): đo hình chữ nhật của canvas, hộp, hàng nút bằng `getBoundingClientRect`; vẽ một khung trên khung đã co rồi đọc
  điểm ảnh của canvas.
