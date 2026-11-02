# Review findings: dien-ma-can-cho-hang

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gắn mã căn: kiểm trùng căn rồi mới ghi, không khoá theo căn, nên hai lệnh chạy song song có thể cùng lọt**
  Người dùng thấy gì: Nếu hai người cùng lúc gắn cùng một mã căn cho hai hàng khác nhau, cả hai có thể được nhận và sàn có hai hàng đang mở trên một căn mà không ai được báo.
  Căn cứ: Chỉ xảy ra khi hai lệnh đến đúng cùng lúc, hiếm; không mất dữ liệu và có thể dọn tay về sau, còn hợp đồng này đã chủ động để ngoài phạm vi việc ép duy nhất ở tầng dữ liệu.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Mã căn chỉ có dấu (ví dụ «---») lọt qua kiểm trùng và khoá vĩnh viễn ô mã căn**
  Người dùng thấy gì: Nếu ai đó gõ mã căn chỉ gồm dấu như «---», hệ thống nhận nó, bỏ qua kiểm trùng và khoá ô mã, nên hàng mang một mã vô nghĩa mà không sửa lại được.
  Căn cứ: Cần người gõ nhầm kiểu hiếm gặp và hậu quả nằm ở một hàng; tuy mã sai không tự gỡ được, việc sửa mã đã gắn đang được hợp đồng để dành cho việc riêng.
  file: `packages/core/src/listing/events.ts`
  severity: low
  Đề xuất: known-limits

- **Đăng ký thông báo nhận bất kỳ URL https nào làm endpoint, nên máy chủ có thể bị dùng để POST tới địa chỉ tuỳ ý (SSRF mù)**
  Người dùng thấy gì: Người dùng đã đăng nhập có thể đăng ký địa chỉ nhận thông báo tuỳ ý, khiến máy chủ gửi yêu cầu tới địa chỉ đó mỗi khi có khách mới về.
  Căn cứ: Là lỗ hổng bảo mật thật của một tính năng khác, cần người đã đăng nhập mới khai thác được, nên đáng xử lý nghiêm nhưng phải đi thành việc riêng.
  file: `packages/api/src/push/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **A unit number made only of punctuation skips the duplicate-unit check and then locks for good**
  Người dùng thấy gì: Mã căn chỉ gồm dấu như «-» hay «.» được nhận, bỏ qua kiểm trùng rồi khoá lại, nên hàng không bao giờ khớp được với căn, ảnh hay khách nào.
  Căn cứ: Chỉ xảy ra khi người dùng gõ mã vô nghĩa, ảnh hưởng một hàng và không làm lộ hay mất dữ liệu; việc sửa mã đã gắn thuộc việc riêng.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Two concurrent unit assignments can put two open listings on the same unit**
  Người dùng thấy gì: Hai thiết bị cùng gửi lại hàng đợi khi có mạng, gắn cùng một căn cho hai hàng, có thể khiến sàn có hai hàng đang mở trên một căn mà không ai được báo.
  Căn cứ: Cần hai lệnh trùng thời điểm nên hiếm, không mất dữ liệu và dọn tay được; hợp đồng đã chủ động để ngoài phạm vi việc ép duy nhất ở tầng dữ liệu.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Đo chỉ dẫn thay vì đầu ra: ca «tuyến: chờ tải, lỗi, không thấy» chỉ soi dòng import trong mã nguồn của tệp tuyến**
  Người dùng thấy gì: Bài kiểm tra các màn chờ tải, lỗi và không thấy chỉ xem tệp có nhắc tới thành phần ấy chứ không dựng ra, nên có thể báo xanh dù màn thật thiếu các trạng thái đó.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm lưới kiểm lỏng hơn lời hứa; sửa rẻ nhưng thuộc hợp đồng khác.
  file: `apps/web/src/components/trang-thai.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
