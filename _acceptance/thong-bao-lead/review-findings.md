# Review findings: thong-bao-lead (round 2)

## Trong hợp đồng

(không có finding)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

Lượt 2 không tìm thêm lỗi nào. Năm mục dưới đây do lượt 1 (run `wf_12f33500-0c2`, sha 874478c) xác nhận; bộ mang-sang
của lượt 2 không chở chúng (dòng run-log lượt 1 thiếu trường sha), nên phiên chính chép lại nguyên văn từ kết quả lượt 1.
Nhát sửa của lượt 1 không chạm các tệp này.

- **(r1) Đăng ký thiết bị nhận bất kỳ địa chỉ https nào, rồi máy chủ tự gửi POST tới đó (SSRF)**
  Người dùng thấy gì: Một người dùng đã đăng nhập có thể khai một địa chỉ bất kỳ làm nơi nhận thông báo, khiến máy chủ của sàn gửi yêu cầu tới địa chỉ đó mỗi khi có lead về họ. Họ không đọc được dữ liệu của người khác, nhưng có thể dùng máy chủ để thăm dò dịch vụ nội bộ.
  Căn cứ: Rủi ro bảo mật có thật nhưng cần người đã đăng nhập cố ý lợi dụng và không làm lộ dữ liệu chủ nhà; việc siết danh sách dịch vụ đẩy là một thay đổi riêng, đáng làm thành một hạng mục có kiểm thử riêng.
  file: `packages/api/src/push/routes.ts`
  severity: medium
  Đề xuất: new-contract
- **(r1) Khuôn khoá thiết bị ở API lỏng hơn ràng buộc DB, nên thân sai khuôn gây lỗi 500 thay vì 400**
  Người dùng thấy gì: Nếu ai đó cố tình gửi khoá thiết bị sai khuôn một cách tinh vi, họ nhận thông báo lỗi chung chung thay vì lời giải thích rõ. Người dùng bình thường qua trình duyệt không gặp tình huống này.
  Căn cứ: Chỉ xảy ra với yêu cầu tự chế, không mất hay lộ dữ liệu, và người gọi chỉ thấy một lỗi chung, không ảnh hưởng người dùng thật.
  file: `packages/api/src/push/routes.ts`
  severity: low
  Đề xuất: known-limits
- **(r1) Lệnh cấp phiên thử của hồ sơ dựa vào cấu hình chạy `web-l` chưa được commit**
  Người dùng thấy gì: Người chấm lại sau này từ bản đã lưu có thể không dựng được phiên thử để làm theo các bước kiểm trên màn hình. Sản phẩm chạy cho người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người chấm lại, không ảnh hưởng người dùng; sửa rẻ bằng cách lưu cấu hình còn thiếu cùng lần chốt hồ sơ.
  file: `_acceptance/thong-bao-lead/thu/phien.mts`
  severity: low
  Đề xuất: known-limits
- **(r1) Gửi thông báo không có thời hạn: lối giao lead bị treo theo dịch vụ đẩy, quá 1 phút thì nhịp chia gửi trùng**
  Người dùng thấy gì: Nếu dịch vụ đẩy thông báo không trả lời, màn nhập hay giao lead có thể đứng chờ rất lâu dù lead đã ghi, khiến người dùng bấm lại và tạo lead trùng. Đầu chủ cũng có thể nhận cùng một thông báo hai lần.
  Căn cứ: Chỉ xảy ra khi dịch vụ đẩy treo thật, nhưng hậu quả là lead trùng hoặc cả nhịp chia bị chặn nên đáng sửa sớm; sửa rẻ nhưng nên có kiểm thử riêng.
  file: `packages/api/src/push/gui.ts`
  severity: medium
  Đề xuất: new-contract
- **(r1) Dải bật thông báo ẩn dù lưu lại đăng ký lên máy chủ thất bại**
  Người dùng thấy gì: Nếu việc lưu lại đăng ký lên máy chủ lỗi lúc mở Hôm nay, người dùng vẫn thấy như đã bật thông báo nhưng thực tế không nhận được lead nào mà không có dấu hiệu gì. Họ có thể bỏ lỡ lead mà không biết.
  Căn cứ: Lỗi im lặng khiến đầu chủ bỏ lỡ lead, đúng mục đích của tính năng; người dùng không tự phát hiện được, nhưng chỉ xảy ra khi mạng hay máy chủ lỗi đúng lúc và sửa không đắt.
  file: `apps/web/src/lib/push/dang-ky.ts`
  severity: low
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).


