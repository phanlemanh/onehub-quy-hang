# Review findings: va-dien-ma-can-cho-hang

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lead có mã căn toàn dấu vẫn được nhận nhưng không bao giờ tạo được hàng (khuôn `created` mới từ chối)**
  Người dùng thấy gì: Nếu một lead được nhập với mã căn chỉ toàn dấu như «---», lead vẫn được nhận. Nhưng khi đầu chủ bấm tạo hàng từ lead đó thì lần nào cũng báo lỗi, và không có chỗ nào để sửa mã.
  Căn cứ: Chỉ ảnh hưởng lead có mã căn rác, hiếm gặp, và không mất dữ liệu nào. Nhưng lead đó kẹt vĩnh viễn, người dùng không tự gỡ được. Sửa sau không đắt nên nên mở một việc riêng.
  file: `packages/core/src/listing/events.ts`
  severity: medium
  Đề xuất: new-contract

- **Lead có mã căn toàn dấu vẫn nhập được, nhưng từ nay không tạo được hàng — mỗi lần tạo đều hỏng**
  Người dùng thấy gì: Lead có mã căn toàn dấu, kể cả lead đã ghi từ trước, từ nay không biến được thành hàng. Mỗi lần bấm tạo hàng đều hỏng và người dùng không có cách sửa.
  Căn cứ: Không mất dữ liệu, chỉ kẹt một số lead mã rác hiếm gặp, nhưng người dùng không tự gỡ được. Gộp chung việc sửa với finding trước thành một hợp đồng riêng thì rẻ.
  file: `packages/api/src/leads/store.ts`
  severity: medium
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
