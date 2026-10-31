# Review findings: dong-bo-tu-lanh (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Khi kho lỗi, các lối ở Cần xem thất bại mà không báo gì; «Sửa lại» vẫn đóng bảng và điền lại ô như đã thành công**
  Người dùng thấy gì: Nếu bộ nhớ trên máy bị lỗi đúng lúc người dùng bấm «Giữ của tôi», «Lấy bản mới» hay «Bỏ thay đổi», sẽ không có gì xảy ra và không có lời báo nào. Với «Sửa lại», bảng đóng lại như đã xong dù căn vẫn nằm trong Cần xem và chưa được gửi.
  Căn cứ: Chỉ xảy ra khi bộ nhớ trên máy lỗi, hiếm gặp; không mất dữ liệu vì căn vẫn nằm trong Cần xem, người dùng mở lại và thử lại được.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert «có mặt» thay vì QUAN HỆ trước/sau): phép đếm «không lên sau khi kho hồi» đã đúng ngay trong lượt kho đang lỗi**
  Người dùng thấy gì: Một bài kiểm tra tự động cho tình huống kho lỗi rồi hồi có một phép kiểm không phân biệt được nhịp gửi còn chạy hay đã chết. Người dùng không gặp lỗi gì; chỉ là lưới an toàn ở điểm đó yếu hơn ghi chú.
  Căn cứ: Không ảnh hưởng người dùng; một phép kiểm khác trong cùng ca vẫn bắt được trường hợp nhịp chết, nên sửa tốn công mà lợi ít.
  file: `apps/web/src/lib/sync/tu-lanh.test.ts`
  severity: high
  Đề xuất: wont-fix

- **Hình dạng 2 (fixture VIẾT TAY đúng khuôn bên đọc): hàng 400 của bảng 4xx tự dựng thân lỗi rồi so với chính chuỗi vừa nhét vào**
  Người dùng thấy gì: Bài kiểm tra cho trường hợp máy chủ từ chối chuyển trạng thái chỉ so lý do với chính chuỗi nó tự dựng, nên nếu khuôn lỗi thật đổi đi thì bài kiểm tra vẫn xanh. Người dùng hiện không gặp lỗi nào.
  Căn cứ: Hiện chức năng chạy đúng, chỉ là bài kiểm tra có thể không báo động khi khuôn lỗi đổi sau này; có thể ghi lại và củng cố khi đụng tới phần này.
  file: `apps/web/src/lib/sync/tu-lanh.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
