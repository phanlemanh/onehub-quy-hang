# Review findings: va-bang-hang-cuon-so-lon (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 — kiểm âm tính một mình: bài kiểm «không có lỗi #185» không có đối chứng dương, và lỗi khi đọc bộ ghi bị nuốt thành «sạch»**
  Người dùng thấy gì: Bảng hàng 5.000 căn vẫn được sửa và kiểm ở các vế khác (thấy «/ 5000 căn», có thẻ, cuộn tới căn cuối). Riêng vế «không có lỗi sập» của bài đo tay có thể báo xanh dù bộ bắt lỗi không chạy, nên lỗi sập quay lại có thể lọt qua bài đo này.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, các vế đo khác và bài kiểm đơn vị vẫn bắt được vòng sập, và lỗi sập sẽ lộ ngay khi mở màn; chỉ là độ tin của một vế đo thấp hơn mong muốn.
  file: `_acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
