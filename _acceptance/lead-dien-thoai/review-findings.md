# Review findings: lead-dien-thoai (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Nút «Xem ở Lead đã nhập» dựng thành <a> nhưng thiếu nativeButton={false}, khác pattern cả kho**
  Người dùng thấy gì: Lối «Xem ở Lead đã nhập» vẫn bấm được và dẫn đúng chỗ, nhưng mỗi lần bấm tải lại cả trang nên hơi chậm hơn các lối khác.
  Căn cứ: Hậu quả nhẹ, không mất dữ liệu, người dùng vẫn đi được tới danh sách; sửa rẻ nên có thể gom vào đợt dọn sau.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **Mọi phản hồi không phải 201 hay 400 đều bị báo «máy chủ không trả lời», kể cả 401 và 403**
  Người dùng thấy gì: Khi phiên đăng nhập hết hạn hoặc vai bị gỡ quyền nhập lead, màn báo máy chủ không trả lời và bảo thử lại, nên người dùng có thể thử mãi không được.
  Căn cứ: Trường hợp hiếm, lead đã điền vẫn còn trên màn, người dùng tự thoát ra đăng nhập lại được; chỉ gây khó hiểu chứ không mất dữ liệu.
  file: `apps/web/src/app/(app)/leads/new/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **After a failed second submit, the form scrolls to the previous lead's result instead of the missing-field errors**
  Người dùng thấy gì: Sau khi gửi xong một lead rồi nhập lead thứ hai còn thiếu mục, màn cuộn xuống kết quả của lead trước nên telesales trên điện thoại không thấy ngay lỗi dưới ô thiếu.
  Căn cứ: Không mất dữ liệu và người dùng cuộn lên là thấy lỗi, nhưng dễ gây hiểu nhầm khi nhập nhiều lead liên tiếp; sửa nhỏ, rẻ.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: known-limits

- **The E2/E9 evals describe a measurement the script doesn't actually make**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng; chỉ là mô tả bài thử ghi khác với cách đo thực tế nên hồ sơ nghiệm thu hơi khó tin.
  Căn cứ: Không đụng tới sản phẩm, chỉ sửa chữ trong hồ sơ hoặc chấp nhận và ghi vết là đủ.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình 3 — assert «chuỗi có mặt» thay cho quan hệ «lead vừa gửi ở đầu» (E3)**
  Người dùng thấy gì: Bài thử có thể báo đạt dù lead vừa gửi không thật sự nằm đầu danh sách, nên lỗi hiển thị đó có thể lọt mà không ai biết.
  Căn cứ: Người dùng không gặp lỗi trực tiếp, chỉ là lưới an toàn yếu hơn; siết phép đo là việc vừa phải và làm sau được.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — assert âm một mình: coSoChu=false không có đối chứng dương trên chính bộ dò (E4)**
  Người dùng thấy gì: Bài thử kiểm không lộ số chủ nhà có thể không bắt được số nếu nó hiện dưới dạng khác, nên một lần rò số có thể không bị phát hiện.
  Căn cứ: Hậu quả tiềm ẩn nặng nếu có rò, nhưng bộ kiểm rò rỉ riêng của kho đã chặn lớp này; thêm đối chứng dương là việc rẻ.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — «một cột» và «nút Gửi trong khung nhìn» đo bằng phép đếm và phép luôn đúng, không đo quan hệ bố cục (E1)**
  Người dùng thấy gì: Bài thử có thể báo đạt dù năm mục bị xếp hai cột hoặc nút Gửi nằm ngoài màn lúc mở, nên lỗi bố cục trên điện thoại có thể lọt.
  Căn cứ: Lỗi bố cục sẽ thấy ngay khi chủ kho cầm máy thật thử, không mất dữ liệu; siết phép đo là việc rẻ.
  file: `_acceptance/lead-dien-thoai/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/7 lỗi rơi vào file không bộ đo nào phủ (_acceptance/lead-dien-thoai/thu/chay-ui.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
