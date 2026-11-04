# Review findings: lead-dien-thoai (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Nút dẫn đường «Xem ở Lead đã nhập» thiếu nativeButton={false} và dùng thẻ <a> trần thay cho Link**
  Người dùng thấy gì: Bấm «Xem ở Lead đã nhập» trên máy tính phải tải lại cả trang thay vì chuyển mượt, và người dùng đọc màn hình bằng công cụ hỗ trợ có thể nghe nhầm đây là nút thay vì liên kết.
  Căn cứ: Nút vẫn dùng được và đưa đúng chỗ, chỉ chậm hơn một chút và kém chuẩn trợ năng; không mất dữ liệu, sửa sau rẻ.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **Khi mất mạng, ô nhận lead hiện dải báo «sẽ gửi khi có mạng lại», nhưng ô không tự gửi**
  Người dùng thấy gì: Khi mất mạng, đầu màn hình nói thay đổi sẽ tự gửi khi có mạng lại, nhưng lead nhập mới không tự gửi. Người dùng tin dải báo có thể đóng màn và lead không bao giờ được gửi.
  Căn cứ: Có nguy cơ lead nhập xong mà không đi và không ai hay, nhưng lead vẫn còn trên màn cho tới khi đóng và ô có câu dặn bấm «Gửi lead» lại; sửa câu chữ khá rẻ.
  file: `apps/web/src/app/(app)/leads/new/khung.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tab Lead: đang ở phần «Lead đã nhập» mà màn rộng qua mốc md thì màn trống**
  Người dùng thấy gì: Nếu đang xem «Lead đã nhập» trên điện thoại rồi xoay ngang hoặc kéo rộng màn, thân trang trống và không có lối quay lại ô nhập cho tới khi tải lại trang.
  Căn cứ: Hiếm gặp và người dùng tự gỡ được bằng cách tải lại trang, không mất dữ liệu.
  file: `apps/web/src/app/(app)/leads/new/tab-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mọi phản hồi không phải 201/400 (kể cả 401/403 hết phiên) đều báo «máy chủ không trả lời»**
  Người dùng thấy gì: Khi phiên đăng nhập hết hạn lúc gửi lead, màn báo máy chủ không trả lời và bảo thử lại sau, trong khi gửi lại mãi vẫn hỏng cho tới khi đăng nhập lại.
  Căn cứ: Người dùng bị chỉ sai hướng nhưng lead đã điền vẫn còn và đăng nhập lại là gỡ được; sửa chỉ là thêm câu báo.
  file: `apps/web/src/app/(app)/leads/new/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4, assertion âm tính đứng một mình: E4 đòi coMaHang = false nhưng chay-ui.mjs không hề đo coMaHang**
  Người dùng thấy gì: Phép thử tự động chưa thật sự kiểm xem màn «Lead đã nhập» có lộ mã hàng hay không, nên lời hứa không hiện mã hàng mới được tuyên chứ chưa được chứng minh.
  Căn cứ: Màn có thể vẫn đúng, chỉ là chưa có bằng chứng; thêm phép đo vào bộ thử là việc rẻ, không ảnh hưởng người dùng trực tiếp.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4, đối chứng dương giả của coSoChu ở E4: số mồi được POST từ Node, không qua trang**
  Người dùng thấy gì: Phép thử kiểm số chủ nhà không lộ trên màn chưa có ca đối chứng chứng tỏ nó bắt được số khi số thật sự hiện, nên kết quả «không lộ» có thể tin chưa đủ.
  Căn cứ: Chưa có dấu hiệu rò số thật, chỉ là bằng chứng yếu; củng cố bộ thử rẻ và không ảnh hưởng người dùng.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3, chỉ kiểm «chuỗi có mặt» khi lời hứa là quan hệ: E3 «lead vừa gửi ở đầu» được đo bằng việc dòng đầu chứa «Toà A»**
  Người dùng thấy gì: Phép thử chưa phân biệt được lead vừa gửi với các lead cũ cùng toà, nên chưa chứng minh chắc lead mới thật sự nằm đầu danh sách.
  Căn cứ: Hành vi thật có thể đúng, chỉ là phép thử chưa đủ chặt; siết lại phép đo rẻ và người dùng không bị ảnh hưởng.
  file: `_acceptance/lead-dien-thoai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/lead-dien-thoai/thu/chay-ui.mjs, _acceptance/lead-dien-thoai/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
