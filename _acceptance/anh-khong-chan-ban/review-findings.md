# Review findings: anh-khong-chan-ban (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 3 (kèm 1): hành vi khoá/đọc lại của nút được đo bằng một chuỗi có mặt trong mã nguồn, trong khi lời hứa là quan hệ giữa các giá trị**
  Người dùng thấy gì: Bộ kiểm chưa thật sự chạy thử nút «Sẵn sàng bán» khi mất mạng hay khi mạng quay lại. Nếu sau này ai sửa nhầm, nút có thể bị khoá oan hoặc không đọc lại cấu hình mà bộ kiểm vẫn báo xanh.
  Căn cứ: Hành vi hiện tại chưa được chỉ ra là sai, chỉ là phép kiểm yếu; người dùng chưa gặp hại gì và việc củng cố có thể làm sau mà không mất dữ liệu.
  file: `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Nút «Sẵn sàng bán» coi lỗi đọc cấu hình là 0 ảnh: ngoại tuyến hay đọc hỏng thì bỏ qua kiểm ảnh dù sàn đặt tối thiểu 1–20 (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu mở hồ sơ căn lúc mất mạng ở sàn đòi tối thiểu vài ảnh, nút «Sẵn sàng bán» vẫn bấm được và báo đã gửi, rồi máy chủ từ chối khi có mạng lại. Người dùng có thể thấy căn không lên Đang bán dù tưởng đã gửi.
  Căn cứ: Không mất dữ liệu và máy chủ vẫn chặn đúng, người dùng chỉ cần bổ sung ảnh rồi gửi lại; chỉ gặp khi mở trang lúc mất mạng ở sàn đặt tối thiểu ảnh.
  file: `apps/web/src/app/(app)/units/ready/san-sang.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay: lệnh «ô Trạng thái» ở E2 không lấy từ bộ đồng bộ thật (r2)**
  Người dùng thấy gì: Bài kiểm cửa «ô Trạng thái» dùng lệnh dựng tay chứ không đi qua đường đồng bộ thật, nên có thể không bắt được lỗi riêng của đường đó. Người dùng không thấy ảnh hưởng trực tiếp.
  Căn cứ: Chỉ làm bài kiểm kém chặt, không đổi hành vi người dùng; đường đồng bộ thật đã có bài kiểm khác phủ nên rủi ro thấp.
  file: `packages/api/test-db/anh-khong-chan-ban.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — Assertion âm tính không ghim thông điệp: regex /add_photos|x/ khớp gần như mọi lỗi (r2)**
  Người dùng thấy gì: Bài kiểm việc từ chối khoá lạ ở nhóm «Bổ sung ảnh» quá lỏng, nên nếu bộ kiểm từ chối vì lý do khác thì vẫn báo xanh. Người dùng không thấy ảnh hưởng ngay.
  Căn cứ: Chỉ là bài kiểm chưa đủ chặt, không làm sai việc nào cho người dùng; sửa sau rất rẻ và không mất gì.
  file: `packages/core/src/today/hang-doi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — Đếm thay vì quan hệ: E9c không gắn căn 0 ảnh với photos rỗng, và gộp 'vắng' với '[]' (r2)**
  Người dùng thấy gì: Bài kiểm trang khách với căn không ảnh chỉ đếm số căn, nên nếu hai căn bị đảo ảnh hoặc thiếu hẳn danh sách ảnh thì có thể không bị phát hiện.
  Căn cứ: Không đổi gì với người dùng hiện tại, chỉ giảm khả năng bắt lỗi về sau; sửa sau rẻ.
  file: `packages/api/test-db/anh-khong-chan-ban.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — Fixture viết tay đúng khuôn bên đọc: docToiThieuSan đọc Response tự dựng (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm đọc số ảnh tối thiểu dùng phản hồi dựng tay, nên nếu phía máy chủ đổi dạng trả về thì bài vẫn xanh và nút có thể âm thầm coi như không đòi ảnh.
  Căn cứ: Chỉ xảy ra nếu sau này ai đó đổi dạng dữ liệu cấu hình; hiện chưa gây hại cho người dùng và sửa sau rẻ.
  file: `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 — Đo mã nguồn thay vì đầu ra: hành vi nút ngoại tuyến bị kiểm bằng grep chuỗi trong .tsx (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm nút ngoại tuyến đọc chữ trong mã thay vì chạy nút thật, nên có thể báo đỏ oan khi viết lại cách khác hoặc bỏ sót lỗi logic. Người dùng không thấy ảnh hưởng trực tiếp.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của bài kiểm, không ảnh hưởng người dùng; dựng bài kiểm chạy nút thật tốn công hơn hậu quả.
  file: `apps/web/src/app/(app)/units/ready/san-sang.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5/4 — Tuyên so tập khoá nhưng chỉ kiểm vắng 4 tên điểm-case (r2)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận vắng bốn trường thông tin chủ nhà, nên nếu sau này thêm một trường nguồn khác vào bản xem hàng thì bài có thể không báo.
  Căn cứ: Hiện chưa có trường nào lộ; rủi ro là về sau, và bộ kiểm rò rỉ riêng vẫn chắn lớp ngoài, sửa sau rẻ.
  file: `packages/api/test-db/anh-khong-chan-ban.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
