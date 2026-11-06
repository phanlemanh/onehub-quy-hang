# Review findings: chup-anh-dien-thoai (round 6)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 — fixture VIẾT TAY đúng khuôn bên đọc: lỗi select-company dựng tay `new LoiGuiAnh(409, "select-company")`, không đi vòng từ phản hồi máy chủ qua nguonApi**
  Người dùng thấy gì: Bài kiểm cho trường hợp máy chủ báo người dùng cần chọn sàn chỉ dùng lỗi dựng sẵn, không đi qua phản hồi thật. Nếu sau này ai đó sửa nhầm chỗ đọc phản hồi, ảnh chờ có thể bị đánh dấu lỗi thay vì nằm chờ mà bài kiểm vẫn xanh.
  Căn cứ: Hiện chưa có lỗi nào xảy ra với người dùng, chỉ là lưới kiểm còn thủng; nếu có lỗi thì ảnh chuyển sang trạng thái lỗi và người dùng bấm thử lại được, không mất ảnh, nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

