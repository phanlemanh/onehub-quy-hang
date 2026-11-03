## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ nhớ ảnh bìa ở cấp module không bao giờ được làm mới, nên sửa ảnh trong hồ sơ rồi lùi về thì thẻ vẫn hiện bìa cũ (có thể là ảnh đã dời sang ngăn Nội bộ)**
  Người dùng thấy gì: Nếu đầu khách đổi bìa, xoá ảnh hoặc dời ảnh sang ngăn Nội bộ trong hồ sơ rồi lùi về bảng thẻ, thẻ có thể vẫn hiện ảnh bìa cũ hoặc ô trống cho tới khi tải lại trang.
  Căn cứ: Chỉ ảnh hiển thị sai trong cùng phiên và người dùng tự khắc phục bằng cách tải lại trang. Không mất dữ liệu, và ảnh Nội bộ chỉ hiện cho người vốn được xem ngăn đó.
  file: `apps/web/src/app/(app)/inventory/cards/the-can.tsx:22`
  severity: medium
  Đề xuất: known-limits

- **Card list loses its scroll container when the board goes from 0 cards to 1 or more without a filter change**
  Người dùng thấy gì: Nếu bảng đang trống rồi căn mới về qua đồng bộ khi đang mở, chỉ hiện khoảng vài thẻ đầu và cuộn không hiện thêm thẻ. Phải đổi bộ lọc hoặc mở rồi đóng hồ sơ mới đủ thẻ.
  Căn cứ: Chỉ xảy ra khi bảng đang trống và căn về giữa phiên, hiếm gặp. Không mất dữ liệu và người dùng khắc phục được bằng cách tải lại hoặc đổi bộ lọc.
  file: `apps/web/src/app/(app)/inventory/cards/bang-the.tsx:103`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính đứng một mình: ca giá trị rỗng không có đối chứng dương**
  Người dùng thấy gì: Người dùng không gặp gì trực tiếp. Chỉ là một bài kiểm lọc có thể vẫn xanh dù bộ lọc loại nhầm cả căn đủ dữ liệu.
  Căn cứ: Không ảnh hưởng người dùng hay dữ liệu, chỉ làm lưới kiểm lỏng hơn một chút ở một ca. Các bài kiểm khác của bộ lọc vẫn đo đúng quan hệ chính.
  file: `apps/web/src/app/(app)/inventory/cards/the.test.ts:175`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
