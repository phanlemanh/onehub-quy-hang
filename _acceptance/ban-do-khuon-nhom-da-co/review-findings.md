# Review findings: ban-do-khuon-nhom-da-co (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chú thích của cacGoc nói chỉ đi vào vế phải của &&, ||, ??, nhưng code đi vào cả hai vế**
  Người dùng thấy gì: Công cụ kiểm khuôn hoạt động đúng, chỉ có một dòng ghi chú cho người sửa code sau này mô tả sai phạm vi kiểm. Người dùng cuối không thấy gì khác.
  Căn cứ: Không ảnh hưởng người dùng và không làm kết quả kiểm sai; chỉ có thể làm người đọc code sau hiểu nhầm, và sửa lại lúc nào cũng rẻ.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: low
  Đề xuất: known-limits

- **cacGoc coi vế trái JSX của && là gốc trả về, dù vế đó không bao giờ được trả**
  Người dùng thấy gì: Trong một kiểu viết rất hiếm, công cụ kiểm khuôn có thể báo lệch dù màn thật vẫn dựng đúng khuôn. Không có màn nào bị hỏng, chỉ có người viết code gặp một cảnh báo thừa.
  Căn cứ: Chỉ gây cảnh báo thừa chứ không để lọt lỗi, kiểu viết này hầu như không xuất hiện, và nếu gặp thì người viết đổi cách viết là xong.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 — nói phủ cả nhóm toán tử nhưng chỉ có hai ca lẻ, không có bảng viết trước**
  Người dùng thấy gì: Công cụ kiểm khuôn mới có bài thử cho hai trong bốn kiểu viết điều kiện; nếu sau này ai làm hỏng phần xử lý kiểu còn lại thì bài thử vẫn xanh. Màn hiện có không bị ảnh hưởng.
  Căn cứ: Chưa có lỗi thật nào, chỉ là lưới bảo vệ cho hai kiểu viết ít dùng còn mỏng; chi phí bổ sung bài thử nhỏ nên có thể làm khi sửa công cụ kiểm lần sau.
  file: `packages/ui-lint/tests/ban-do-khuon.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Status scan misses aliased imports and role={"alert"} in braces (r1 · tệp đã đổi)**
  Người dùng thấy gì: Một người viết màn mới nếu đổi tên khối báo trống khi nhập, hoặc viết vai báo lỗi theo kiểu khác, thì bộ kiểm không bắt được và màn có thể hiện khối báo sai kiểu mà không ai hay.
  Căn cứ: Chỉ ảnh hưởng người viết màn sau này chứ không làm hỏng màn hiện có, ca hiếm, và sửa lại được bất cứ lúc nào khi thấy lọt; nên ghi giới hạn rồi tiếp tục.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: medium
  Đề xuất: known-limits

- **Blocked components listed for page groups are never checked (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bản đồ nói rõ có những khối không được đặt trong màn Cài đặt, Xác thực và trang tạm, nhưng bộ kiểm không chặn; một màn mới có thể lồng thêm khung hoặc thẻ và người dùng thấy giao diện thừa viền hoặc lồng khung.
  Căn cứ: Hậu quả chỉ là giao diện kém gọn ở màn mới, không mất hay lộ dữ liệu, và hàng 59 đã dự kiến làm phần răng giữ khuôn nên gộp vào đó rẻ hơn sửa riêng.
  file: `packages/ui-lint/lib/ban-do.mjs`
  severity: low
  Đề xuất: new-contract

- **Members page only handles 403, so other API errors break the page (r1)**
  Người dùng thấy gì: Khi tải danh sách người dùng của sàn gặp lỗi khác ngoài việc không có quyền (mất mạng, máy chủ lỗi), màn có thể hiện hỏng hoặc trống thay vì báo «tải thất bại».
  Căn cứ: Không mất hay lộ dữ liệu, người dùng tự gỡ bằng cách tải lại trang, và lỗi này đã có từ trước nên ghi lại để làm sau trong một việc riêng.
  file: `apps/web/src/app/settings/users/page.tsx`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
