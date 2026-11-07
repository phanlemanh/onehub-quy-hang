# Review findings: can-ngoai-khu

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Màn gửi tự chọn phần nào của hàng lô hay hàng ngoài khu được ra ngoài, ngay trên giao diện, đi vòng qua luật ẩn**
  Người dùng thấy gì: Ở màn gửi, bản xem trước và chữ gửi đi có thể kèm căn lô hay căn ngoài khu, với tên khu hoặc chữ «Căn ngoài khu» đặt vào chỗ tên toà. Trang khách mở từ cùng link thì không có các căn này.
  Căn cứ: Chỉ lệch giữa bản xem trước và trang khách, không lộ thông tin chủ nhà; luật ẩn cho loại hàng này đã có hàng riêng trong lộ trình nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/shares/new/gui.ts`
  severity: medium
  Đề xuất: known-limits

- **Ép giá so lẫn mọi hàng lô và hàng ngoài khu như thể chúng cùng một toà**
  Người dùng thấy gì: Khi ép giá một căn lô hoặc căn mặt đường, bảng so giá có thể liệt kê các căn ở khu khác hay đường khác như thể cùng toà. Người dùng có thể nhìn nhầm mức giá tham chiếu.
  Căn cứ: Chỉ làm bảng so giá kém chính xác, không mất hay lộ dữ liệu; hàng lô và ngoài khu chưa lên Đang bán nên ít người chạm tới, người dùng tự bỏ qua được.
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx`
  severity: medium
  Đề xuất: known-limits

- **Trang tạo link vẫn cho gửi hàng lô và hàng ngoài khu, nhưng trang khách lặng lẽ bỏ chúng**
  Người dùng thấy gì: Người gửi thấy căn lô hay căn ngoài khu trong bản xem trước và lần gửi, nhưng khách mở link thì không thấy căn đó, và không có báo lỗi nào.
  Căn cứ: Khách chỉ thiếu căn chứ không lộ gì; các hàng này chưa lên Đang bán nên hiếm khi bị đưa vào link, và người gửi kiểm tra lại được.
  file: `packages/api/src/public/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Hôm nay của đầu khách hiện tên 'null · <mã>' cho hàng không toà**
  Người dùng thấy gì: Ở màn Hôm nay của đầu khách, hàng lô hoặc hàng ngoài khu đã gửi sẽ hiện tên xấu dạng «null · L01», hoặc chỉ chữ null.
  Căn cứ: Chỉ là lỗi hiển thị tên, không mất hay lộ dữ liệu; các hàng này chưa lên Đang bán nên chưa mấy khi xuất hiện, sửa sau rẻ.
  file: `packages/api/src/today-buyer/store.ts`
  severity: low
  Đề xuất: known-limits

- **Danh sách hàng đổi toà null thành chữ 'null' khi đếm ảnh**
  Người dùng thấy gì: Khi đếm ảnh ở danh sách hàng, hàng không có toà bị tra theo chữ «null». Thường ra 0 ảnh, chỉ đếm nhầm nếu có toà thật tên đúng là «null».
  Căn cứ: Gần như không bao giờ gây hậu quả thật và không mất dữ liệu; phần ảnh cho hàng loại này sẽ làm lại ở việc lên Đang bán.
  file: `packages/api/src/listings/routes.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (thông điệp ghim lỏng): dòng «thiếu tỉnh» của AC-4 chỉ ghim chữ «tỉnh»**
  Người dùng thấy gì: Bài kiểm tra địa chỉ thiếu tỉnh kiểm lỏng, nên sau này nếu địa chỉ thiếu tỉnh bị báo nhầm sang lý do khác thì bài vẫn xanh. Hiện sản phẩm báo đúng.
  Căn cứ: Người dùng không gặp gì ngay vì sản phẩm đang đúng; chỉ giảm khả năng bắt lỗi về sau, siết lại bất cứ lúc nào cũng rẻ.
  file: `packages/api/test-db/can-ngoai-khu/can-ngoai-khu.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

