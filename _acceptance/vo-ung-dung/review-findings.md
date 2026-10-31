# Review findings: vo-ung-dung (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hộp «Gõ mã căn» không chiếm toàn màn ở khổ 640–767px: sm:max-w-sm đè max-md:max-w-none, hộp 24rem dính mép trái**
  Người dùng thấy gì: Trên màn hình cỡ giữa (khoảng 640 đến 767 điểm ảnh, như điện thoại xoay ngang hoặc máy tính bảng nhỏ), hộp gõ mã căn hiện thành một cột hẹp dính mép trái thay vì phủ toàn màn. Vẫn gõ được mã và mở được căn, chỉ xấu và lệch so với thiết kế.
  Căn cứ: Chỉ lệch giao diện ở một dải khổ hẹp, không mất dữ liệu và vẫn dùng được; người dùng điện thoại đứng và máy tính không bị ảnh hưởng, nên ghi lại làm hạn chế đã biết và sửa khi làm khổ tablet.
  file: `apps/web/src/components/shell/unit-jump.tsx`
  severity: medium
  Đề xuất: known-limits

- **Màn Người dùng giờ nằm trong vỏ nhưng vẫn tự dựng khung toàn màn: thẻ <main> lồng trong <main> và min-h-svh (r1)**
  Người dùng thấy gì: Màn Người dùng vẫn mở và dùng được trong vỏ, nhưng trang dài hơn khung nhìn nên luôn hiện thanh cuộn thừa và thừa lề. Người dùng đọc màn hình có thể bị nhiễu vì trang có hai vùng nội dung chính lồng nhau.
  Căn cứ: Chỉ là lỗi giao diện nhẹ, không mất dữ liệu và màn vẫn dùng được; sửa sau rẻ.
  file: `apps/web/src/app/settings/users/page.tsx`
  severity: medium
  Đề xuất: known-limits

- **Ngăn thông báo trên điện thoại là Sheet trượt từ phải, trái với luật của vỏ là ngăn trên điện thoại dùng Drawer từ đáy (r1)**
  Người dùng thấy gì: Trên điện thoại, bấm chuông thì ngăn thông báo trượt từ bên phải phủ cả màn, không trượt lên từ đáy như thiết kế ghi. Vẫn mở và đóng được bình thường.
  Căn cứ: Chỉ khác kiểu trượt của một ngăn, không ảnh hưởng chức năng hay dữ liệu; có thể ghi ngoại lệ vào tài liệu thiết kế.
  file: `apps/web/src/components/shell/notifications.tsx`
  severity: low
  Đề xuất: known-limits

- **design_pass.proto_route trỏ tới /proto/{slug>, nhưng ứng dụng web không có đường /proto (r1 · tệp đã đổi)**
  Người dùng thấy gì: Cấu hình nghiệm thu trỏ tới một địa chỉ bản mẫu không tồn tại, nên nếu công cụ nghiệm thu mở nó sẽ gặp trang không tìm thấy. Người dùng cuối không bao giờ thấy điều này.
  Căn cứ: Chỉ ảnh hưởng quy trình nghiệm thu nội bộ, không chạm người dùng; ảnh chấm thật đã chụp từ trang thật nên không mất bằng chứng.
  file: `_acceptance/config.yaml`
  severity: low
  Đề xuất: known-limits

- **Đổi sàn ngay trong vỏ: trạng thái mở/gập cột thứ hai vẫn là của sàn cũ cho tới khi tải lại trang (r1)**
  Người dùng thấy gì: Sau khi đổi sàn, cột thứ hai tạm giữ trạng thái mở hay gập của sàn cũ cho tới khi tải lại trang. Người dùng có thể thấy cột mở hoặc gập khác với lần họ chọn ở sàn mới.
  Căn cứ: Chỉ sai tạm thời về cách hiển thị, tải lại trang là đúng ngay và không mất dữ liệu; mức nặng thấp.
  file: `apps/web/src/components/shell/app-shell.tsx`
  severity: medium
  Đề xuất: known-limits

- **Bộ chọn sàn nuốt lỗi khi đổi sàn thất bại, và giữ người ở màn có thể không thuộc vai của sàn mới (r1)**
  Người dùng thấy gì: Nếu đổi sàn thất bại, menu chỉ đóng lại mà không báo gì, người dùng tưởng đã đổi. Khi đổi được, người dùng ở nguyên màn cũ, có thể là màn không hợp vai ở sàn mới.
  Căn cứ: Gặp ở tình huống hiếm (mất phiên hoặc hết quyền), người dùng tự gỡ bằng cách tải lại hoặc bấm lại, không mất dữ liệu.
  file: `apps/web/src/components/shell/company-switcher.tsx`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
