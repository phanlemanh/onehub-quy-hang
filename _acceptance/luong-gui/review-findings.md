## Trong hợp đồng

- **Edited message is never rebuilt after the recipient or unit list changes, so a private client can receive unit codes**
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx:215`
  severity: medium
  source: bugs
  AC: AC-6
  detail: `const tin = tinSua ?? tinTuDong;` After the first keystroke in the message box, `tinSua` is set and never cleared. Nothing resets it when `nguoiNhan`, `khachId` or `bo` changes. Example: the user picks «Nhóm môi giới» (the message lists unit codes such as `Toà · Z-97.53`), edits one word, then switches to «Khách riêng». The message that gets sent still has the unit codes, the broker-group greeting and any units removed with the X button. The client preview (`ban`, built with `nhanXem`) correctly hides the codes, but the text actually shared does not. That defeats the rule that a private client never sees unit codes (invariant 4: the outbound text must come from the redacted output). Fix: reset `tinSua` when the recipient, selected client or unit list changes, or warn the user and ask them to confirm.
  rationale: AC-6 đòi khách riêng không thấy mã căn trong tin; sau khi sửa tin rồi đổi sang khách riêng, tin gửi đi vẫn chứa mã căn nên AC-6 (và AC-5 về tin soạn sẵn) thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trưởng nhóm vào được màn Gửi nhưng lối «Khách riêng» là ngõ cụt: API trả 403 mà màn hiện thành «chưa có khách»**
  Người dùng thấy gì: Trưởng nhóm mở màn Gửi, chọn «Khách riêng» sẽ thấy «chưa có khách đang mở» và được mời lưu khách mới, nhưng lưu xong lại bị từ chối. Người dùng bối rối nhưng không mất dữ liệu; họ vẫn gửi được cho nhóm môi giới.
  Căn cứ: Hậu quả nhẹ: chỉ gây khó hiểu cho trưởng nhóm, không mất hay lộ dữ liệu, người dùng quay sang gửi nhóm môi giới được; sửa sau cũng không đắt.
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx`
  severity: medium
  Đề xuất: known-limits

- **Thanh Gửi hiện cho mọi vai trên Bảng hàng thẻ, kể cả đầu chủ không gửi được**
  Người dùng thấy gì: Đầu chủ chọn căn trên điện thoại vẫn thấy nút Gửi, bấm vào chỉ gặp thông báo rằng vai của họ không gửi được căn.
  Căn cứ: Hậu quả nhẹ: chỉ là một lần bấm vô ích rồi có thông báo rõ ràng, không mất hay lộ dữ liệu, người dùng tự quay lại được.
  file: `apps/web/src/app/(app)/inventory/cards/bang-the.tsx`
  severity: low
  Đề xuất: known-limits

- **Tham chiếu thêm một dòng «Đã dựng» trùng thay vì sửa dòng Gửi đang có**
  Người dùng thấy gì: Tài liệu sản phẩm có hai dòng cho cùng một màn Gửi và thiếu vài quyết định đã chốt, nên người đọc sau có thể nhầm tình trạng của màn này.
  Căn cứ: Hậu quả nhẹ: chỉ là tài liệu chưa gọn, không ảnh hưởng người dùng cuối, sửa lại sau rất rẻ.
  file: `docs/product/tham-chieu.md`
  severity: low
  Đề xuất: known-limits

- **Client-list load failure (403 or network) is silently shown as 'no open clients' and never retried**
  Người dùng thấy gì: Nếu tải danh sách khách bị lỗi (mất mạng hoặc không đủ quyền), màn báo «chưa có khách đang mở» và không thử lại, nên người dùng tưởng mình không có khách nào.
  Căn cứ: Hậu quả vừa nhưng người dùng tự gỡ được bằng cách tải lại màn; không mất hay lộ dữ liệu.
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx`
  severity: medium
  Đề xuất: known-limits

- **useAnhCan cancels every in-flight photo request whenever one finishes, causing repeated fetches**
  Người dùng thấy gì: Khi chọn nhiều căn, ảnh hiện lần lượt từng căn và tải đi tải lại, nên trên mạng chậm có thể bấm Gửi khi ảnh chưa sẵn sàng và tin đi không kèm ảnh.
  Căn cứ: Hậu quả nhẹ đến vừa: chỉ chậm và có thể thiếu ảnh, không lộ dữ liệu, người dùng chờ rồi gửi lại được.
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx`
  severity: low
  Đề xuất: known-limits

- **Shape 1 (measuring the instruction instead of the output): the 'disabled Send button makes no network call' check re-implements the gate inside the test**
  Người dùng thấy gì: Bài kiểm tra tự áp luật cho nút Gửi chứ không thử trên màn thật, nên nếu sau này ai đó làm hỏng nút Gửi mờ, bài kiểm tra vẫn xanh và lỗi lọt tới người dùng.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ giảm độ tin cậy của lưới kiểm; viết lại bài kiểm tra đắt hơn lợi ích trước mắt nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/shares/new/gui.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
