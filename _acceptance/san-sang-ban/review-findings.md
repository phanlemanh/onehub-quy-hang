# Review findings: san-sang-ban (round 1)

## Trong hợp đồng

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E7 grep `l.missing.map(nhanThieu)` trong tren-o.tsx thay vì đo chữ moTaLoi trả ra**
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.test.ts:179`
  severity: medium
  AC: AC-7
  source: measurement
  detail: Eval E7 hứa: moTaLoi của lỗi máy chủ { missing: ['realPhoto'] } ra chữ có «ảnh thật». Test không gọi moTaLoi. Nó đọc tệp tren-o.tsx và assert.match với regex `/l\.missing\.map\(nhanThieu\)/`, rồi làm y như vậy với gui.ts (`/b\.missing\.map\(nhanDieuKien\)/`). Assert đúng ở dòng 174 chỉ kiểm nhanThieu của lenh.ts. gui.ts lại dùng một bảng khác (nhanDieuKien của core), nên cái regex chỉ chứng minh có gọi hàm map, không chứng minh chữ người dùng thấy có «ảnh thật». Phía gui.ts có E6b đo đầu ra thật (reason có «ảnh thật»). Phía moTaLoi của trình sửa ô thì không bài nào đo đầu ra.
  rationale: AC-7 đòi lời báo ở trình sửa ô dùng nhãn «ảnh thật»; bài đo không chứng minh chữ đầu ra.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Danh sách «Còn thiếu» và dấu «Chưa có» của căn trước vẫn hiện khi chuyển sang căn khác**
  Người dùng thấy gì: Sau khi bấm «Sẵn sàng bán» ở căn này rồi mở căn khác, hồ sơ căn mới có thể vẫn hiện danh sách «Còn thiếu» của căn trước và ghi «Chưa có» thay cho giá, pháp lý thật. Người dùng dễ tưởng căn mới thiếu thông tin.
  Căn cứ: Chỉ hiển thị sai chứ không mất hay lộ dữ liệu, và người dùng tải lại trang là hết; tuy nhiên dễ gây hiểu nhầm nên nên sửa trong một việc riêng.
  file: `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`
  severity: medium
  Đề xuất: new-contract

- **Máy chủ bỏ qua lỗi cấu hình số ảnh tối thiểu và lặng lẽ dùng mặc định 1**
  Người dùng thấy gì: Nếu sàn lỡ đặt số ảnh tối thiểu sai, hệ thống âm thầm dùng 1 ảnh mà không báo ai. Hiện chưa có chỗ nào để sàn tự đặt giá trị này nên chưa ai gặp.
  Căn cứ: Chưa có đường nào đặt được giá trị sai nên khả năng gặp thấp, không mất dữ liệu, và việc thêm cảnh báo rẻ khi làm màn cấu hình sau.
  file: `packages/api/src/listings/store.ts`
  severity: low
  Đề xuất: known-limits

- **«Sẵn sàng bán» báo đã gửi dù máy không xếp được lệnh (kết quả của sua bị bỏ qua)**
  Người dùng thấy gì: Trong vài trường hợp hiếm (kho trên máy hỏng, căn đang «cần xem»), bấm «Sẵn sàng bán» không có lỗi nào hiện ra nhưng căn vẫn y nguyên. Người dùng tưởng đã lên bảng hàng mà thật ra chưa.
  Căn cứ: Hậu quả khá nặng vì người dùng tin căn đã lên bảng mà không biết, nhưng không mất dữ liệu và bấm lại hay kiểm tra bảng hàng thì phát hiện; sửa nhỏ nên đáng làm sớm.
  file: `apps/web/src/app/(app)/units/ready/san-sang.ts`
  severity: high
  Đề xuất: new-contract

- **Dấu «Chưa có» và danh sách «Còn thiếu» còn lại khi chuyển sang căn khác hoặc sau khi đã điền**
  Người dùng thấy gì: Sau khi điền xong giá hay pháp lý ở Bảng hàng, hồ sơ căn vẫn ghi «Chưa có» và liệt các điều đã thiếu cho đến khi bấm lại. Đổi sang căn khác cũng hiện nhầm thông tin của căn trước.
  Căn cứ: Chỉ hiển thị sai, không mất dữ liệu, bấm lại hoặc tải lại là đúng; gộp sửa cùng lỗi trùng ở căn trước.
  file: `apps/web/src/app/(app)/units/ho-so/cot-ho-so.tsx`
  severity: medium
  Đề xuất: new-contract

- **Máy chủ âm thầm dùng mặc định khi cấu hình số ảnh tối thiểu sai**
  Người dùng thấy gì: Nếu cấu hình số ảnh tối thiểu của sàn bị sai, căn chỉ có 1 ảnh vẫn lên bán mà không ai được báo. Sàn tưởng đã siết chặt hơn.
  Căn cứ: Hiện chưa có chỗ nào đặt giá trị này nên gần như không xảy ra, không mất dữ liệu và ghi chú giới hạn là đủ cho tới khi có màn cấu hình.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca «ảnh đã xoá» của E5b là mảng rỗng viết tay, trùng hệt ca «không ảnh»**
  Người dùng thấy gì: Một dòng trong bài kiểm trùng với dòng khác nên trông như kiểm thêm một trường hợp ảnh đã xoá mà thực ra không. Người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ là bài kiểm thừa, không ảnh hưởng người dùng và các bài khác đã phủ việc ảnh bị xoá, nên không đáng tốn công.
  file: `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

