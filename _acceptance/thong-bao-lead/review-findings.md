## Trong hợp đồng

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): sự kiện notificationclick dựng tay data.url, không đi vòng qua bộ nghe push của sw.js**
  AC: AC-6
  file: apps/web/src/app/(app)/today/mo-lead.test.ts:98
  severity: medium
  source: measurement
  detail: Ca «sự kiện notificationclick đi qua bộ xử lý với url của thông báo» (dòng 98-104) gọi thẳng nghe.notificationclick với `notification: { data: { url: `/today?lead=${MA}` } }` viết tay, đúng khuôn mà bộ đọc ở sw.js dòng 46 cần (`event.notification.data.url`). Thứ ghi ra khuôn ấy là bộ nghe 'push' ở sw.js dòng 25-41: nó đọc p.title/p.body/p.url/p.tag và ghi `data: { url: ... }` vào showNotification. Bộ nghe này không được chạy trong bài kiểm nào. Bài kiểm có thể làm cả vòng: đưa nội dung do lõi dựng (noiDungLead) vào nghe.push, bắt các tuỳ chọn truyền cho registration.showNotification giả, rồi đưa đúng data ấy vào notificationclick. Hiện giờ nếu khoá url bị đổi ở phía lõi hoặc ở bộ nghe push, sw.js lặng lẽ rơi về '/today' và bấm thông báo không còn mở đúng lead, nhưng ca này vẫn xanh. Lời hứa của E6/AC-6 là «chạm thông báo mở đúng lead» thì chưa được đo trọn đầu-cuối.
  rationale: AC-6 hứa chạm thông báo thì mở đúng lead; bài kiểm dựng tay dữ liệu nên chưa chứng minh được đầu-cuối.

- **Hình dạng 4 (assertion âm tính một mình, không ghim thông điệp): ca «việc giao quay lui không gửi» chỉ assert status khác 200/201**
  AC: AC-3
  file: packages/api/test-db/thong-bao-lead.test.ts:242
  severity: medium
  source: measurement
  detail: Dòng «trưởng nhóm giao» assert `assert.notEqual(r.status, 200)` (dòng 242), dòng «nhập lead» assert `assert.notEqual(r.status, 201)` (dòng 248). Hai dòng không ghim mã lỗi hay status cụ thể (vd 500 do trigger 'ép quay lui'). Vì vậy một từ chối vì lý do khác (400 sai khuôn, 403, 409 trạng thái lead) cũng làm cả hai assert và các kiểm tiếp theo cùng thoả (0 lần gửi, 0 dòng hộp thư đi, lead giữ dc1, số lead không đổi), dù giao dịch chưa hề đi tới chỗ ghi push_outbox rồi quay lui. Riêng dòng «nhịp chia» có đối chứng (kq.failed === 1). Hai dòng kia chưa chứng được trigger đã nổ, nên ba ô quay lui chưa được đo đủ ba lối như E3 tuyên.
  rationale: AC-3 có vế «việc giao quay lui thì không gửi» mà bài kiểm chưa chứng được việc giao thực sự quay lui qua hai lối trưởng nhóm giao và nhập lead.

- **Hình dạng 4 (âm tính một mình, không đối chứng dương): ca «gửi lỗi không làm hỏng việc giao» không chứng bộ gửi hỏng đã thực sự được gọi**
  AC: AC-3
  file: packages/api/test-db/thong-bao-lead.test.ts:306
  severity: medium
  source: measurement
  detail: Ca này đặt traLoi ném lỗi (dòng 306-308), rồi chỉ assert kq.routed === 1, kq.failed === 0 và lead mang dc1 (dòng 312-314). Không có assert nào nói guiGia đã được gọi cho thiết bị của dc1. guiGia ghi vào daGui trước khi gọi traLoi, nên chỉ cần thêm `guiToi(s, 'dc1', tu).length >= 1`. Hiện giờ nếu lối gửi sau commit không chạy (bị bỏ, hay chưa nối vào nhịp), mọi assert vẫn đúng, nên ca không phân biệt được «lỗi gửi bị nuốt an toàn» với «không gửi gì». Như vậy lời hứa của E3 «bộ gửi giả ném lỗi → lead vẫn mang đầu chủ» chưa đo được vế «bộ gửi đã ném».
  rationale: AC-3 có vế «lỗi gửi không làm hỏng việc giao» mà bài kiểm không chứng được lần gửi lỗi đã xảy ra.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đăng ký thiết bị nhận bất kỳ địa chỉ https nào, rồi máy chủ tự gửi POST tới đó (SSRF)**
  Người dùng thấy gì: Một người dùng đã đăng nhập có thể khai một địa chỉ bất kỳ làm nơi nhận thông báo, khiến máy chủ của sàn gửi yêu cầu tới địa chỉ đó mỗi khi có lead về họ. Họ không đọc được dữ liệu của người khác, nhưng có thể dùng máy chủ để thăm dò dịch vụ nội bộ.
  Căn cứ: Rủi ro bảo mật có thật nhưng cần người đã đăng nhập cố ý lợi dụng và không làm lộ dữ liệu chủ nhà; việc siết danh sách dịch vụ đẩy là một thay đổi riêng, đáng làm thành một hạng mục có kiểm thử riêng.
  file: `packages/api/src/push/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **Khuôn khoá thiết bị ở API lỏng hơn ràng buộc DB, nên thân sai khuôn gây lỗi 500 thay vì 400**
  Người dùng thấy gì: Nếu ai đó cố tình gửi khoá thiết bị sai khuôn một cách tinh vi, họ nhận thông báo lỗi chung chung thay vì lời giải thích rõ. Người dùng bình thường qua trình duyệt không gặp tình huống này.
  Căn cứ: Chỉ xảy ra với yêu cầu tự chế, không mất hay lộ dữ liệu, và người gọi chỉ thấy một lỗi chung, không ảnh hưởng người dùng thật.
  file: `packages/api/src/push/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Lệnh cấp phiên thử của hồ sơ dựa vào cấu hình chạy `web-l` chưa được commit**
  Người dùng thấy gì: Người chấm lại sau này từ bản đã lưu có thể không dựng được phiên thử để làm theo các bước kiểm trên màn hình. Sản phẩm chạy cho người dùng không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người chấm lại, không ảnh hưởng người dùng; sửa rẻ bằng cách lưu cấu hình còn thiếu cùng lần chốt hồ sơ.
  file: `_acceptance/thong-bao-lead/thu/phien.mts`
  severity: low
  Đề xuất: known-limits

- **Gửi thông báo không có thời hạn: lối giao lead bị treo theo dịch vụ đẩy, quá 1 phút thì nhịp chia gửi trùng**
  Người dùng thấy gì: Nếu dịch vụ đẩy thông báo không trả lời, màn nhập hay giao lead có thể đứng chờ rất lâu dù lead đã ghi, khiến người dùng bấm lại và tạo lead trùng. Đầu chủ cũng có thể nhận cùng một thông báo hai lần.
  Căn cứ: Chỉ xảy ra khi dịch vụ đẩy treo thật, nhưng hậu quả là lead trùng hoặc cả nhịp chia bị chặn nên đáng sửa sớm; sửa rẻ nhưng nên có kiểm thử riêng.
  file: `packages/api/src/push/gui.ts`
  severity: medium
  Đề xuất: new-contract

- **Dải bật thông báo ẩn dù lưu lại đăng ký lên máy chủ thất bại**
  Người dùng thấy gì: Nếu việc lưu lại đăng ký lên máy chủ lỗi lúc mở Hôm nay, người dùng vẫn thấy như đã bật thông báo nhưng thực tế không nhận được lead nào mà không có dấu hiệu gì. Họ có thể bỏ lỡ lead mà không biết.
  Căn cứ: Lỗi im lặng khiến đầu chủ bỏ lỡ lead, đúng mục đích của tính năng; người dùng không tự phát hiện được, nhưng chỉ xảy ra khi mạng hay máy chủ lỗi đúng lúc và sửa không đắt.
  file: `apps/web/src/lib/push/dang-ky.ts`
  severity: low
  Đề xuất: new-contract

## Chưa adversarial-verify (refuter chết)

⚠ Cụm ngoài vùng phủ: 2/8 lỗi rơi vào file không bộ đo nào phủ (_acceptance/thong-bao-lead/thu/phien.mts, apps/web/src/lib/push/dang-ky.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

