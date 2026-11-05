## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The test of the old rule never runs the double-click scenario, so its check always passes**
  Người dùng thấy gì: Bài kiểm có một phép so với luật cũ luôn cho cùng kết quả, nên nó không chứng minh được luật cũ từng nối trang hai lần. Người dùng không bị ảnh hưởng, chỉ là bằng chứng kiểm kém chặt hơn lời ghi.
  Căn cứ: Nhẹ: người dùng không thấy gì sai, chỉ là một đối chứng trong bài kiểm yếu, và phần chặn thật đã được thử bằng cách bỏ phép so rồi thấy bài kiểm đỏ.
  file: `apps/web/src/app/(app)/contacts/xem-them.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): ca «bấm hai lần» tự viết lại vòng cập nhật con trỏ của màn thay vì chạy đúng đường của vung.tsx**
  Người dùng thấy gì: Nếu sau này ai đó sửa màn Liên hệ làm hỏng việc cập nhật vị trí trang, bấm «Xem thêm» hai lần nhanh có thể làm hiện trùng dòng mà bài kiểm vẫn xanh. Hiện tại màn chạy đúng, chỉ chưa có bài kiểm chạm đúng đường ấy.
  Căn cứ: Nhẹ: không mất dữ liệu, nếu có trùng dòng thì tải lại là hết, và hiện chưa có lỗi thật; chỉ là lưới an toàn cho thay đổi tương lai còn thủng.
  file: `apps/web/src/app/(app)/contacts/xem-them.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
