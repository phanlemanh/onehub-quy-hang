# ADR-0026: Gắn mã căn cho hàng chưa có mã — sự kiện riêng, một lần, chặn trùng hàng đang mở

Ngày: 2026-11-02 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `dien-ma-can-cho-hang` 02/11, Hỏi-1..4
theo khuyến nghị; duyệt kế hoạch 02/11 kèm hai chỗ sửa chữ) · Liên quan: ADR-0008 (hàng và sự kiện), ADR-0012 (ô nhận
lead — lead chỉ biết toà), Tham chiếu §4, §8 luật 6 và 17; hàng 23 (`san-sang-ban`, chọn «C»)

## Bối cảnh

Lead có thể mới biết toà (ADR-0012); nhận lead thành hàng thì hàng cũng chưa có mã căn. Hàng 23 chốt: hàng chưa có mã
báo thiếu «mã căn» và không lên Đang bán, vì ảnh gắn căn theo toà + mã. Trước vòng này không có đường nào điền mã sau khi
hàng đã tạo: sự kiện `created` bất biến, `details_changed` chỉ nhận bốn phần của lần rao, và hồ sơ căn chỉ mở theo mã căn
trên địa chỉ. Hàng ấy kẹt ở «Còn thiếu: Mã căn».

## Quyết định

1. **Sự kiện riêng `unit_number_assigned`** (Hỏi-1), khuôn chặt `{ unitNumber }`, không tính là xác nhận với chủ nhà. Gấp
   hàng đặt `unitNumber`. Nhận đúng một lần: hàng đã có mã thì lõi từ chối (`unit-number-already-set`) — mã căn là thuộc
   tính căn, đã có thì khoá (luật 6). Sửa hay gỡ mã đặt nhầm là việc riêng (Hỏi-3).
2. **Không mở `details_changed` cho mã căn.** Sự kiện ấy là phần của lần rao, đổi được nhiều lần, xoá trắng được; mã căn
   thì một lần và kéo theo ảnh (gắn theo toà + mã) và kiểm trùng. Gộp vào thì luật «một lần» và «chặn trùng» phải viết
   thành ngoại lệ trong một sự kiện vốn tự do, và vết lịch sử không phân biệt «đổi nội thất» với «gắn căn».
3. **Cơ sở dữ liệu**: migration 020 nới ràng buộc loại của `listing_events` thêm loại mới, giữ tên ràng buộc; loại lạ vẫn bị
   chặn. Không bảng, không cột mới; luật cách ly không đổi.
4. **Máy chủ chặn trùng** (Tham chiếu §4: mỗi sàn tối đa một hàng đang mở trên một căn): sàn đã có hàng khác cùng toà, mã
   so bằng `app.unit_key`, trạng thái thuộc `OPEN_STATUSES` của lõi → 422 `unit-already-listed`, lý do «Căn này đã có hàng
   đang mở (<trạng thái hàng kia>)», mã hàng kia đi riêng trong thân trả lời (`conflictListingId`) để màn mở liên kết «Mở
   hàng kia» — không in chuỗi mã ra chữ (Gate 1.5). Hàng đã đóng hay hàng của sàn khác không chặn. Hàng đã có mã bị từ chối
   trước phép so phiên bản, để máy đang giữ bản cũ nhận đúng lý do thay cho «đụng nhau». Gắn thành công trả 200 như mọi
   lệnh đổi hàng.
5. **Một đường lệnh, ghi trên máy trước**: lệnh đi qua hàng đợi trên máy như mọi lần sửa (ADR-0008, hàng 13); máy chủ từ
   chối thì hàng trên máy về bản máy chủ, lệnh rời hàng đợi vào «Cần xem» kèm lý do và mã hàng kia.
6. **Hồ sơ mở theo hàng** khi chưa có mã: `?hang=<mã hàng>` bên cạnh `?unit=`; máy chủ nhận mã thì địa chỉ sang hồ sơ theo
   căn. Ô «Mã căn» ở mục Thuộc tính căn, gợi ý mã của toà từ danh mục đã giữ, mã ngoài danh mục vẫn lưu được (Hỏi-2). Lối
   vào: dòng hàng ở Bảng hàng, dòng «Chưa có mã căn · <toà>» ở Hôm nay (tới `/inventory?hang=`), «Mã căn» trong «Còn
   thiếu» đưa con trỏ vào ô. Điện thoại: `/inventory` có hồ sơ đang mở thì hiện hồ sơ toàn màn.

## Hệ quả

- Hàng có mã thì «Còn thiếu» thôi nêu «Mã căn» và xét «Ảnh thật» như mọi hàng (luật lõi không đổi).
- Hai hàng mở cùng căn có từ trước (dữ liệu cũ) không bị gộp; không thêm ràng buộc duy nhất ở tầng dữ liệu.
- Ảnh tải trước khi có mã: không có — hàng chưa có mã không tải ảnh được.
