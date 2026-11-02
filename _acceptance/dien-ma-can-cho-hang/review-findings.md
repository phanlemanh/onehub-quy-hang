# Review findings: dien-ma-can-cho-hang

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The duplicate-unit check for assigning a unit number has a race and no lock or database constraint**
  Người dùng thấy gì: Nếu hai người cùng lúc gắn cùng một mã căn cho hai hàng khác nhau trong một toà, cả hai có thể được nhận và sàn có hai hàng đang mở trên một căn.
  Căn cứ: Chỉ xảy ra khi hai thao tác trùng nhau đúng lúc, hợp đồng đã chủ động để ngoài, dữ liệu không mất và đầu chủ gộp hoặc đóng một hàng được.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: known-limits

- **A unit number made only of punctuation is accepted and then locked for good**
  Người dùng thấy gì: Nếu ai đó gõ nhầm mã căn chỉ gồm dấu như «-», hệ thống nhận, không kiểm trùng được, và hàng bị khoá với mã rác không sửa lại được.
  Căn cứ: Hàng bị kẹt vĩnh viễn nhưng chỉ khi gõ nhầm kiểu hiếm; sửa chặn đầu vào khá rẻ nên nên đăng thành việc riêng.
  file: `packages/core/src/listing/events.ts`
  severity: medium
  Đề xuất: new-contract

- **Gắn mã căn: kiểm trùng căn rồi mới ghi nhưng không khoá, nên hai lệnh song song vẫn tạo hai hàng đang mở trên cùng một căn**
  Người dùng thấy gì: Hai thiết bị gắn cùng mã căn cùng lúc, hay hàng đợi ngoại tuyến xả cùng lúc, có thể khiến một căn có hai hàng đang mở.
  Căn cứ: Hiếm gặp, không mất dữ liệu, và đầu chủ tự xử lý được bằng cách đóng hoặc gộp hàng thừa; hợp đồng đã chủ động để ngoài.
  file: `packages/api/src/listings/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Mã căn chỉ gồm ký tự đặc biệt lọt qua kiểm, bỏ qua kiểm trùng và bị khoá vĩnh viễn**
  Người dùng thấy gì: Gõ nhầm mã căn toàn dấu như «.» hay «/» vẫn được lưu, bỏ qua kiểm trùng, khoá hàng và không tải ảnh được.
  Căn cứ: Hàng kẹt với mã rác và người dùng không tự gỡ được, nhưng chỉ khi gõ nhầm kiểu hiếm; chặn đầu vào rẻ nên làm thành việc riêng.
  file: `packages/core/src/listing/gan-ma-can.ts`
  severity: low
  Đề xuất: new-contract

- **Gửi lại đăng ký thông báo lỗi thì bị bỏ qua, dải bật vẫn ẩn như đã bật**
  Người dùng thấy gì: Khi gửi lại đăng ký thông báo bị lỗi, người dùng vẫn thấy như đã bật nhưng sẽ không nhận được thông báo lead và không có dấu hiệu nào báo.
  Căn cứ: Người dùng có thể bỏ lỡ lead mà không biết, nhưng chỉ khi mạng lỗi đúng lúc đó và không mất dữ liệu; sửa sau rẻ nên ghi lại là hạn chế đã biết.
  file: `apps/web/src/lib/push/dang-ky.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: đối chứng dương «bản thử phải dựng trang» là phép thử rỗng (assert.ok lên một Promise)**
  Người dùng thấy gì: Bài kiểm trang mẫu có một phép thử không bao giờ đỏ, nên nếu trang mẫu bị chặn nhầm ở bản thử thì không ai biết; người dùng cuối không bị ảnh hưởng trực tiếp.
  Căn cứ: Chỉ là bài kiểm yếu ở trang mẫu nội bộ, không ảnh hưởng dữ liệu hay người dùng, sửa sau rẻ.
  file: `apps/web/src/app/mau/he-bo-cuc/mau.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
