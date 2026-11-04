# Review findings: phat-hang (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **The login screen says the device data was deleted even when deleting it failed**
  Người dùng thấy gì: Khi máy bị báo mất mà việc xoá dữ liệu trên máy thất bại, màn hình vẫn báo «đã xoá», trong khi dữ liệu và các thay đổi chưa gửi vẫn còn trên máy. Người dùng tưởng máy đã sạch nên không biết cần xử lý tiếp.
  Căn cứ: Hậu quả nặng vì báo sai về an toàn dữ liệu trên máy đã mất và người dùng không tự phát hiện hay thử lại được, nhưng nó thuộc tính năng khác nên nên mở việc riêng để sửa gọn.
  file: `apps/web/src/app/(auth)/login/may-bi-bao.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3: chỉ kiểm chuỗi có mặt, trong khi lời hứa là quan hệ giữa hai chỗ hiện chữ**
  Người dùng thấy gì: Bài kiểm có thể vẫn xanh khi dải bật thông báo ở Hôm nay hiện chữ khác với dòng thông báo ở tab Tôi. Người dùng có thể thấy hai chỗ nói hai câu khác nhau cho cùng một trạng thái.
  Căn cứ: Hậu quả nhẹ vì chỉ là lệch chữ giữa hai chỗ, không mất hay lộ dữ liệu, người dùng vẫn dùng bình thường, và có thể siết bài kiểm sau với chi phí thấp.
  file: `apps/web/src/app/(app)/me/toi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: tên ca nói quét cả lớp «mọi chỗ gọi», nhưng chỉ kiểm hai tệp liệt kê bằng tay**
  Người dùng thấy gì: Một số chỗ sửa hàng khác trong ứng dụng chưa có lớp bảo vệ khi ghi lỗi và bài kiểm không bắt được. Khi ghi lỗi ở các chỗ đó, người dùng có thể không được báo hay hoàn tác đúng như ở bảng hàng.
  Căn cứ: Hậu quả vừa và hiếm gặp, người dùng tải lại và thử lại được, và phạm vi hai tệp đã được khoanh có chủ ý ở tiêu chí cũ nên có thể ghi nhận là hạn chế đã biết.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac-loi.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/3 lỗi rơi vào file không bộ đo nào phủ (apps/web/src/app/(auth)/login/may-bi-bao.tsx, apps/web/src/app/(app)/me/toi.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
