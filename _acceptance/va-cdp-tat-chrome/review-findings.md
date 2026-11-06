# Review findings: va-cdp-tat-chrome (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Awaiting dong() never resolves: the caller's process exits early (code 0, or 13 under top-level await) and skips the code after it**
  Người dùng thấy gì: Nếu một lượt chấm viết chờ việc đóng Chrome xong rồi mới làm tiếp (ví dụ ghi báo cáo), phần sau đó có thể bị bỏ qua mà không báo lỗi gì. Chrome vẫn được tắt đúng, và các lượt chấm hiện có không dùng cách viết này.
  Căn cứ: Chỉ ảnh hưởng người viết thêm lượt chấm mới theo cách chờ đóng, hiện chưa ai làm vậy; Chrome vẫn tắt nên không mất dữ liệu, chỉ cần ghi chú là không chờ việc đóng.
  file: `_acceptance/bang-hang-kieu-sheet/thu/cdp.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm không có đối chứng dương): ca api kiểm «người canh không còn» mà không xác nhận trước rằng người canh từng sống**
  Người dùng thấy gì: Bài tự kiểm có thể báo đạt về việc tiến trình canh đã tắt dù thực ra chưa đo được là nó từng chạy. Công cụ thật vẫn tắt Chrome đúng, chỉ là bài kiểm ở một ca yếu hơn mong muốn.
  Căn cứ: Nhẹ với người dùng: không làm rò Chrome hay mất dữ liệu, chỉ làm một phép kiểm kém chắc; ca tắt thường đã có đối chứng nên rủi ro bỏ sót thấp, sửa sau cũng rẻ.
  file: `_acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
