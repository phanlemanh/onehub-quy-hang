## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5: tuyên quét cả lớp «4 đường API cũ» nhưng danh sách mẫu không bắt được dạng mà mã thật đã dùng (kèm dấu hiệu hình dạng 2 ở đối chứng dương)**
  Người dùng thấy gì: Hiện không còn đường cũ nào được phục vụ. Nhưng nếu sau này ai đó vô tình viết lại một đường tiếng Việt cũ theo cách ít gặp, bài kiểm tự động có thể không báo, và lỗi chỉ lộ khi có người gọi thử.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ làm lưới an toàn về sau kém nhạy; lỗi quay lại sẽ lộ ngay qua kiểm tay và sửa rẻ.
  file: `packages/api/src/ten-cu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1: đo chữ trong tệp thay vì đo cái thật sự sinh ra đường màn cũ (tên thư mục định tuyến)**
  Người dùng thấy gì: Hiện ba địa chỉ màn cũ đã trả trang không tồn tại như yêu cầu. Nếu sau này ai đó dựng lại một trong các trang ấy, không bài kiểm tự động nào phát hiện, nên địa chỉ cũ có thể sống lại mà không ai hay.
  Căn cứ: Không có hậu quả cho người dùng ở bản này vì đã kiểm tay; rủi ro chỉ là địa chỉ cũ sống lại âm thầm, người dùng không mất dữ liệu và gỡ lại dễ.
  file: `packages/api/src/ten-cu.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
