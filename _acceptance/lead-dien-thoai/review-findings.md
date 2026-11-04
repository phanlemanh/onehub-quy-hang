# Review findings: lead-dien-thoai (round 3)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lỗi khi tắt máy dev cùng worktree bị nuốt im lặng, và không kiểm xem tiến trình đã tắt thật chưa**
  Người dùng thấy gì: Khi chỗ thử không tắt được máy dev cũ, người chấm chỉ thấy câu báo chung là máy dev không lên sau vài phút chờ, không biết nguyên nhân thật. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm chậm và khó đoán nguyên nhân khi chấm thử, không mất hay lộ dữ liệu của người dùng; chạy lại hoặc tắt máy dev bằng tay là xử lý được.
  file: `_acceptance/lead-dien-thoai/thu/dung-d.mjs`
  severity: low
  Đề xuất: known-limits

- **Nút dẫn đường «Xem ở Lead đã nhập» thiếu nativeButton={false} và dùng thẻ <a> trần thay cho Link (r1)**
  Người dùng thấy gì: Bấm «Xem ở Lead đã nhập» trên máy tính phải tải lại cả trang thay vì chuyển mượt, và người dùng đọc màn hình bằng công cụ hỗ trợ có thể nghe nhầm đây là nút thay vì liên kết.
  Căn cứ: Nút vẫn dùng được và đưa đúng chỗ, chỉ chậm hơn một chút và kém chuẩn trợ năng; không mất dữ liệu, sửa sau rẻ.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **Khi mất mạng, ô nhận lead hiện dải báo «sẽ gửi khi có mạng lại», nhưng ô không tự gửi (r1)**
  Người dùng thấy gì: Khi mất mạng, đầu màn hình nói thay đổi sẽ tự gửi khi có mạng lại, nhưng lead nhập mới không tự gửi. Người dùng tin dải báo có thể đóng màn và lead không bao giờ được gửi.
  Căn cứ: Có nguy cơ lead nhập xong mà không đi và không ai hay, nhưng lead vẫn còn trên màn cho tới khi đóng và ô có câu dặn bấm «Gửi lead» lại; sửa câu chữ khá rẻ.
  file: `apps/web/src/app/(app)/leads/new/khung.tsx`
  severity: medium
  Đề xuất: known-limits

- **Tab Lead: đang ở phần «Lead đã nhập» mà màn rộng qua mốc md thì màn trống (r1)**
  Người dùng thấy gì: Nếu đang xem «Lead đã nhập» trên điện thoại rồi xoay ngang hoặc kéo rộng màn, thân trang trống và không có lối quay lại ô nhập cho tới khi tải lại trang.
  Căn cứ: Hiếm gặp và người dùng tự gỡ được bằng cách tải lại trang, không mất dữ liệu.
  file: `apps/web/src/app/(app)/leads/new/tab-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mọi phản hồi không phải 201/400 (kể cả 401/403 hết phiên) đều báo «máy chủ không trả lời» (r1)**
  Người dùng thấy gì: Khi phiên đăng nhập hết hạn lúc gửi lead, màn báo máy chủ không trả lời và bảo thử lại sau, trong khi gửi lại mãi vẫn hỏng cho tới khi đăng nhập lại.
  Căn cứ: Người dùng bị chỉ sai hướng nhưng lead đã điền vẫn còn và đăng nhập lại là gỡ được; sửa chỉ là thêm câu báo.
  file: `apps/web/src/app/(app)/leads/new/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4, assertion âm tính đứng một mình: E4 đòi coMaHang = false nhưng chay-ui.mjs không hề đo coMaHang (r1)**
  Người dùng thấy gì: Phép thử tự động chưa thật sự kiểm xem màn «Lead đã nhập» có lộ mã hàng hay không, nên lời hứa không hiện mã hàng mới được tuyên chứ chưa được chứng minh.
  Căn cứ: Màn có thể vẫn đúng, chỉ là chưa có bằng chứng; thêm phép đo vào bộ thử là việc rẻ, không ảnh hưởng người dùng trực tiếp.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4, đối chứng dương giả của coSoChu ở E4: số mồi được POST từ Node, không qua trang (r1)**
  Người dùng thấy gì: Phép thử kiểm số chủ nhà không lộ trên màn chưa có ca đối chứng chứng tỏ nó bắt được số khi số thật sự hiện, nên kết quả «không lộ» có thể tin chưa đủ.
  Căn cứ: Chưa có dấu hiệu rò số thật, chỉ là bằng chứng yếu; củng cố bộ thử rẻ và không ảnh hưởng người dùng.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3, chỉ kiểm «chuỗi có mặt» khi lời hứa là quan hệ: E3 «lead vừa gửi ở đầu» được đo bằng việc dòng đầu chứa «Toà A» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép thử chưa phân biệt được lead vừa gửi với các lead cũ cùng toà, nên chưa chứng minh chắc lead mới thật sự nằm đầu danh sách.
  Căn cứ: Hành vi thật có thể đúng, chỉ là phép thử chưa đủ chặt; siết lại phép đo rẻ và người dùng không bị ảnh hưởng.
  file: `_acceptance/lead-dien-thoai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Nút «Xem ở Lead đã nhập» dựng thành <a> nhưng thiếu nativeButton={false}, khác pattern cả kho (r1)**
  Người dùng thấy gì: Lối «Xem ở Lead đã nhập» vẫn bấm được và dẫn đúng chỗ, nhưng mỗi lần bấm tải lại cả trang nên hơi chậm hơn các lối khác.
  Căn cứ: Hậu quả nhẹ, không mất dữ liệu, người dùng vẫn đi được tới danh sách; sửa rẻ nên có thể gom vào đợt dọn sau.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mọi phản hồi không phải 201 hay 400 đều bị báo «máy chủ không trả lời», kể cả 401 và 403 (r1)**
  Người dùng thấy gì: Khi phiên đăng nhập hết hạn hoặc vai bị gỡ quyền nhập lead, màn báo máy chủ không trả lời và bảo thử lại, nên người dùng có thể thử mãi không được.
  Căn cứ: Trường hợp hiếm, lead đã điền vẫn còn trên màn, người dùng tự thoát ra đăng nhập lại được; chỉ gây khó hiểu chứ không mất dữ liệu.
  file: `apps/web/src/app/(app)/leads/new/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **After a failed second submit, the form scrolls to the previous lead's result instead of the missing-field errors (r1)**
  Người dùng thấy gì: Sau khi gửi xong một lead rồi nhập lead thứ hai còn thiếu mục, màn cuộn xuống kết quả của lead trước nên telesales trên điện thoại không thấy ngay lỗi dưới ô thiếu.
  Căn cứ: Không mất dữ liệu và người dùng cuộn lên là thấy lỗi, nhưng dễ gây hiểu nhầm khi nhập nhiều lead liên tiếp; sửa nhỏ, rẻ.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **The E2/E9 evals describe a measurement the script doesn't actually make (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; chỉ là mô tả bài thử ghi khác với cách đo thực tế nên hồ sơ nghiệm thu hơi khó tin.
  Căn cứ: Không đụng tới sản phẩm, chỉ sửa chữ trong hồ sơ hoặc chấp nhận và ghi vết là đủ.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình 3 — assert «chuỗi có mặt» thay cho quan hệ «lead vừa gửi ở đầu» (E3) (r1)**
  Người dùng thấy gì: Bài thử có thể báo đạt dù lead vừa gửi không thật sự nằm đầu danh sách, nên lỗi hiển thị đó có thể lọt mà không ai biết.
  Căn cứ: Người dùng không gặp lỗi trực tiếp, chỉ là lưới an toàn yếu hơn; siết phép đo là việc vừa phải và làm sau được.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — assert âm một mình: coSoChu=false không có đối chứng dương trên chính bộ dò (E4) (r1)**
  Người dùng thấy gì: Bài thử kiểm không lộ số chủ nhà có thể không bắt được số nếu nó hiện dưới dạng khác, nên một lần rò số có thể không bị phát hiện.
  Căn cứ: Hậu quả tiềm ẩn nặng nếu có rò, nhưng bộ kiểm rò rỉ riêng của kho đã chặn lớp này; thêm đối chứng dương là việc rẻ.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — «một cột» và «nút Gửi trong khung nhìn» đo bằng phép đếm và phép luôn đúng, không đo quan hệ bố cục (E1) (r1)**
  Người dùng thấy gì: Bài thử có thể báo đạt dù năm mục bị xếp hai cột hoặc nút Gửi nằm ngoài màn lúc mở, nên lỗi bố cục trên điện thoại có thể lọt.
  Căn cứ: Lỗi bố cục sẽ thấy ngay khi chủ kho cầm máy thật thử, không mất dữ liệu; siết phép đo là việc rẻ.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
