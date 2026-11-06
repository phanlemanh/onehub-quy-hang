# Review findings: luat-chia-lead-cap-han-hong

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: phản hồi 200 giả còn lỗi ở khung 3 của E7**
  Người dùng thấy gì: Phép nhìn thử trên màn dùng một câu báo lỗi gõ tay, không phải câu lỗi thật của máy chủ. Nếu sau này câu lỗi của máy chủ đổi, phép nhìn này vẫn xanh dù màn có thể không còn báo lỗi đúng. Người dùng hiện tại không bị ảnh hưởng.
  Căn cứ: Chỉ làm yếu một bài kiểm tra phụ, chưa có hậu quả nào với người dùng, không mất dữ liệu, và bài kiểm tra chính đã dùng lỗi thật nên ghi lại là đủ.
  file: `_acceptance/luat-chia-lead-cap-han-hong/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
