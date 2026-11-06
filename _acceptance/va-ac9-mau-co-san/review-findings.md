# Review findings: va-ac9-mau-co-san (round 1)

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi hạ tầng (migrate, cấy dữ liệu) thoát mã 1 như «có ca lệch», không phải mã 2 như đã khai, và mất dòng JSON của các ca đã chạy**
  Người dùng thấy gì: Khi không dựng được môi trường đo, tập lệnh báo giống như có ca đo bị lệch và có thể mất kết quả các ca đã chạy xong. Người đọc bằng chứng khó phân biệt môi trường hỏng với phép đo đỏ, nhưng sản phẩm và người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người đọc hồ sơ nghiệm thu, không mất hay lộ dữ liệu của người dùng; chạy lại phép đo là xong, và đây chỉ là công cụ dùng trong vòng vá này.
  file: `_acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs`
  severity: medium
  Đề xuất: known-limits

- **xoaDb nuốt mọi lỗi DROP DATABASE**
  Người dùng thấy gì: Nếu việc xoá cơ sở dữ liệu tạm của bài đo hỏng, một cơ sở dữ liệu thừa còn lại trên máy thử mà không ai biết. Người dùng sản phẩm không gặp gì.
  Căn cứ: Chỉ để lại một cơ sở dữ liệu tạm vô hại trên máy thử nội bộ, không chạm dữ liệu thật và dễ xoá tay; sửa không đáng công cho tập lệnh dùng một lần.
  file: `_acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
