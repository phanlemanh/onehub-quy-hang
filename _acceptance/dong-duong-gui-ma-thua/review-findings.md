# Review findings: dong-duong-gui-ma-thua (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Tên ca kiểm thử của E3 không khớp tên mà eval đòi**
  Người dùng thấy gì: Hồ sơ nghiệm thu gọi tên một ca kiểm khác với tên thật, nên người chấm có thể tưởng thiếu bằng chứng dù đường quên mật khẩu vẫn đã bị tắt đúng.
  Căn cứ: Người dùng không bị ảnh hưởng gì, chỉ có thể làm người chấm hiểu nhầm là thiếu bằng chứng, và sửa lại chữ rất rẻ.
  file: `_acceptance/dong-duong-gui-ma-thua/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Mã lỗi mới OTP_TYPE_NOT_ALLOWED nằm ngoài chỗ chứa mã lỗi duy nhất**
  Người dùng thấy gì: Mã báo lỗi «kiểu mã không được phép» được khai ở chỗ khác với các mã lỗi còn lại, nên về sau màn hình đăng nhập khó tra cứu chung. Người dùng hiện không thấy khác biệt nào.
  Căn cứ: Không gây hại hay mất dữ liệu cho người dùng hiện tại, chỉ làm việc bảo trì về sau kém gọn, và dời lại chỗ cũng không đắt.
  file: `packages/api/src/auth/constants.ts`
  severity: low
  Đề xuất: known-limits

- **E3 đòi một tên ca kiểm thử không có trong mã: người chấm sẽ không tìm thấy ca**
  Người dùng thấy gì: Hồ sơ nghiệm thu đòi một tên ca kiểm không có thật nên người chấm có thể không tìm thấy bằng chứng, dù các đường quên mật khẩu và đổi email vẫn trả 404 đúng.
  Căn cứ: Chỉ là lệch chữ trong hồ sơ, người dùng không bị ảnh hưởng và sửa lại rất nhanh.
  file: `_acceptance/dong-duong-gui-ma-thua/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): kiểm «lõi không có bộ gửi thư xác minh email» đọc options thô, không bao giờ thấy bộ gửi plugin cài vào**
  Người dùng thấy gì: Bài kiểm giữ cho thư xác minh email không lén gửi mã có một phép dò đo nhầm chỗ, nên nếu sau này nâng thư viện đổi cách cài thì bài kiểm có thể không báo đỏ. Hiện lối gửi này vẫn đang được một phép kiểm khác chặn.
  Căn cứ: Hiện chưa có người dùng nào bị dội mã vì lỗi này vì lối đó vẫn được chặn bằng phép kiểm khác, và rủi ro chỉ xuất hiện khi nâng thư viện sau này.
  file: `packages/api/src/auth/duong-gui-ma.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dong-duong-gui-ma-thua/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
