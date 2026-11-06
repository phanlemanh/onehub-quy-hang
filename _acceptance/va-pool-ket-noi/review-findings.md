# Review findings: va-pool-ket-noi (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hành vi người dùng thấy được đã đổi nhưng Tham chiếu không được sửa trong cùng PR, và luật phạm vi của hồ sơ chặn luôn việc sửa ấy**
  Người dùng thấy gì: Khi cơ sở dữ liệu nghẽn, người đã đăng nhập giờ thấy trang lỗi kèm «Thử lại» thay vì bị đá ra màn đăng nhập, nhưng tài liệu mô tả điều đang đúng của sản phẩm chưa ghi hành vi mới này. Người đọc tài liệu sẽ hiểu sai cách sản phẩm đang chạy.
  Căn cứ: Không ảnh hưởng người dùng cuối hay dữ liệu, chỉ làm tài liệu lệch tạm thời; sửa sau rẻ nhưng cần mở rộng phạm vi hồ sơ nên làm ở một việc riêng.
  file: `_acceptance/va-pool-ket-noi/thu/pham-vi.test.mjs`
  severity: medium
  Đề xuất: new-contract

- **dung-su-co --dung skips starting the DB switch when a stale PID file is left over**
  Người dùng thấy gì: Không ảnh hưởng người dùng sản phẩm. Người chạy thử có thể gặp lần thử sự cố mà công tắc mạng không thật sự chạy sau một lần chạy dở, và khó biết vì sao.
  Căn cứ: Chỉ là công cụ nội bộ để kiểm; người chạy tự dọn tệp sót và chạy lại được, không mất dữ liệu nào.
  file: `_acceptance/va-pool-ket-noi/thu/dung-su-co.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét cả LỚP «không ai nuốt lỗi đọc phiên» nhưng chỉ bắt một dạng cú pháp (`.catch` cùng dòng)**
  Người dùng thấy gì: Bài kiểm chỉ bắt được một cách viết làm nuốt lỗi đọc phiên. Sau này nếu ai viết cách khác, người dùng có thể lại bị đá về màn đăng nhập khi hệ thống nghẽn mà bài kiểm không báo.
  Căn cứ: Hiện mã thật không có chỗ nào nuốt lỗi; rủi ro chỉ ở tương lai, người dùng tự thoát bằng cách tải lại, và có thể ghi thành giới hạn đã biết.
  file: `_acceptance/va-pool-ket-noi/thu/noi-goi.test.mjs`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
