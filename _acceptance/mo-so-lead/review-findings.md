# Review findings: mo-so-lead (round 2)

## Trong hợp đồng

(không có mục nào ở vòng này)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

(không có mục mới ở vòng này; các mục mang từ round 1 do máy tự chèn)

- **Hình dạng 4 (đối chứng dương không ghim thông điệp): kiểm tra bọc nhật ký chỉ đếm số dòng bắt được, ít nhất 1, không ghim dòng của lỗi 500 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm xác nhận số không lọt vào nhật ký máy chủ có thể xanh dù đường lỗi không thật sự ghi gì, nên khả năng nhật ký rò số khó bị phát hiện sớm. Người dùng không thấy ảnh hưởng gì ngay.
  Căn cứ: Đây là độ chặt của bài kiểm, không phải lỗi người dùng gặp; bài vẫn có đối chứng cơ bản, người dùng không mất dữ liệu, và có thể siết lại sau với chi phí thấp.
  file: `packages/api/test-db/mo-so-lead.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn của bên đọc): câu trả lời 200 giả {ownerPhone} không rút từ bên ghi (r1)**
  Người dùng thấy gì: Nếu sau này phía máy chủ đổi dạng trả số mà bài kiểm ở màn không bắt được, đầu chủ có thể thấy «Chưa mở được số» dù mở số ở máy chủ thành công.
  Căn cứ: Chỉ xảy ra khi một bên đổi khuôn trong tương lai, người dùng tải lại hoặc chờ bản sửa là gọi được, không mất hay lộ dữ liệu; sửa sau tương đối rẻ.
  file: `apps/web/src/app/(app)/today/mo-so.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (chỉ khẳng định âm, không có đối chứng dương): bẫy kho trên máy không được chứng là đã gài (r1)**
  Người dùng thấy gì: Bài kiểm lời hứa «số không được lưu trên máy» có thể không thật sự bắt được việc lưu, nên nếu sau này ai đó lưu số trên máy thì có thể không bị phát hiện kịp.
  Căn cứ: Hiện chưa có bằng chứng số đang bị lưu trên máy; rủi ro nằm ở khả năng bắt lỗi về sau, người dùng không thấy gì ngay, và việc thêm đối chứng rất rẻ.
  file: `apps/web/src/app/(app)/today/mo-so.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

