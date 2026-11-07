# Review findings: chan-trung-ten-gia-tri (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 (âm tính một mình): ca riêng–riêng trên Postgres chỉ ghim mã 400, không ghim lý do (r1)**
  Người dùng thấy gì: Khi quản trị đặt hai tên riêng cùng chữ cho hai lựa chọn, bài kiểm chỉ xác nhận hệ thống từ chối mà không xác nhận câu báo lỗi đúng. Nếu sau này có người gỡ nhầm phép kiểm trùng này mà hệ thống vẫn từ chối vì lý do khác, bài kiểm vẫn xanh và không ai biết.
  Căn cứ: Người dùng không bị ảnh hưởng ngay: tính năng hiện chạy đúng và câu báo lỗi đã được kiểm ở lớp lõi. Rủi ro chỉ là một lần hỏng trong tương lai khó bị phát hiện, và có thể ghi nhận mà không ảnh hưởng gì đến việc ship.
  file: `packages/api/test-db/chan-trung-ten-gia-tri/trung-ten.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
