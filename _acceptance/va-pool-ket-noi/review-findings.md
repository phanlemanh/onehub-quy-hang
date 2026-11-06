
# Review findings: va-pool-ket-noi (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ kiểm va_pool_ket_noi chắc chắn đỏ khi chạy lại sau lúc gộp, và kéo theo cả rào AC-6 vốn cần giữ lâu**
  Người dùng thấy gì: Sau khi bản vá vào nhánh chính, bài kiểm của hồ sơ này sẽ báo đỏ dù sản phẩm không có lỗi, và có thể che mất tín hiệu thật của rào chống lùi lỗi đọc phiên.
  Căn cứ: Chỉ gây báo đỏ giả cho đội làm, không ảnh hưởng người dùng cuối và không mất dữ liệu; sửa sau rẻ.
  file: `_acceptance/va-pool-ket-noi/thu/pham-vi.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Thông điệp lỗi của assert idleTimeoutMillis nói ngược điều đang kiểm**
  Người dùng thấy gì: Nếu có ai nâng thời gian giữ kết nối rảnh, thông báo lỗi của bài kiểm sẽ chỉ sai hướng sửa, làm người sửa mất thêm thời gian.
  Căn cứ: Chỉ ảnh hưởng người đọc báo lỗi nội bộ, người dùng không gặp gì; đổi một câu chữ lúc nào cũng được.
  file: `apps/web/src/lib/api.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Pool pg mới không gắn trình nghe 'error': pooler cắt kết nối rảnh thì tiến trình hàm có thể sập**
  Người dùng thấy gì: Khi máy chủ cơ sở dữ liệu cắt một kết nối đang rảnh, một bản chạy của máy chủ web có thể chết đột ngột và người đang dùng gặp lỗi trang trong chốc lát.
  Căn cứ: Người dùng gặp lỗi tạm thời và tự tải lại được, không mất dữ liệu, nhưng đúng loại sự cố 06/11 nên đáng làm thành việc riêng.
  file: `apps/web/src/lib/api.ts`
  severity: medium
  Đề xuất: new-contract

- **Công tắc mạng không được dựng lại khi còn tệp PID cũ; --mo/--tat báo thành công mà không kiểm công tắc còn sống**
  Người dùng thấy gì: Chỗ thử sự cố có thể báo đã mở lại kết nối dù thực tế chưa, làm bước kiểm hồi phục đỏ sai; người dùng thật không bị ảnh hưởng.
  Căn cứ: Chỉ là công cụ thử nội bộ, không chạm sản phẩm hay dữ liệu; gặp thì xoá tệp tàn dư và chạy lại.
  file: `_acceptance/va-pool-ket-noi/thu/dung-su-co.mjs`
  severity: low
  Đề xuất: known-limits

- **Phép kiểm trần pool đếm mỗi bản triển khai là một phiên bản hàm, trong khi hàm serverless tự nhân bản khi tải tăng**
  Người dùng thấy gì: Khi có nhiều người vào cùng lúc, máy chủ web có thể nhân bản và vẫn làm cạn kết nối cơ sở dữ liệu, khiến trang báo lỗi tạm thời kèm nút Thử lại.
  Căn cứ: Bản vá đã giảm mạnh rủi ro và người dùng chỉ gặp lỗi tạm thời, thử lại được; chữa tận gốc cần đổi cấu hình bản thật, ngoài phạm vi.
  file: `apps/web/src/lib/api.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): «không ai nuốt lỗi đọc phiên» chỉ bắt đúng một dạng cú pháp `.catch(` cùng dòng**
  Người dùng thấy gì: Sau này nếu có ai viết cách khác để nuốt lỗi đọc phiên, bài kiểm có thể không bắt được và người đang đăng nhập lại bị đá về màn đăng nhập khi hệ thống nghẽn.
  Căn cứ: Hiện chưa có nơi nào sai thật, chỉ là lưới chặn lùi còn thủng; người dùng tự thoát bằng tải lại, sửa bổ sung sau rẻ.
  file: `_acceptance/va-pool-ket-noi/thu/noi-goi.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
