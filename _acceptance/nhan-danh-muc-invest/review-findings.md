# Review findings: nhan-danh-muc-invest

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng danh sách sàn được tin mở cho mọi sàn đọc chéo, trái bất biến cách ly theo current_company_id**
  Người dùng thấy gì: Mỗi sàn có thể xem được danh sách các sàn khác được tin làm nguồn danh mục và mã thoả thuận của họ. Đây chỉ là mã nội bộ, không có thông tin chủ nhà, giá hay khách.
  Căn cứ: Lộ ra chỉ là mã công ty và mã thoả thuận, hậu quả nhẹ, không lộ dữ liệu chủ nhà; hợp đồng đã chủ ý cho đọc chung nên ghi lý do là đủ và rẻ.
  file: `packages/db/migrations/010_danh_muc_dung_chung.sql`
  severity: low
  Đề xuất: known-limits

- **Mọi lỗi 42501 đều bị đổi thành agreement-inactive, kể cả lỗi thiếu quyền thật**
  Người dùng thấy gì: Nếu sau này hệ thống bị thiếu quyền do cấu hình sai, người gửi gói danh mục vẫn chỉ nhận thông báo thoả thuận không hiệu lực. Việc tìm ra nguyên nhân thật sẽ khó và chậm hơn.
  Căn cứ: Chỉ xảy ra khi cấu hình hạ tầng hỏng, không làm mất hay lộ dữ liệu, và gói bị từ chối an toàn nên người dùng gửi lại được sau khi sửa; chỉ làm chẩn đoán lâu hơn.
  file: `packages/api/src/catalog/feeds.ts`
  severity: low
  Đề xuất: known-limits

- **Quét LỚP chỉ có điểm-case (thiếu ma trận toàn phần, mẫu P105): ca khoá lạ không ghim số lần so và không ghim «đúng một lỗi»**
  Người dùng thấy gì: Bài kiểm tự động cho khoá lạ hơi lỏng, nên nếu sau này gói bị báo thừa lỗi phụ thì bài kiểm có thể không bắt được. Người dùng không thấy ảnh hưởng gì hiện tại.
  Căn cứ: Chỉ là bài kiểm hơi lỏng, sản phẩm đang chạy đúng và người dùng không bị ảnh hưởng; chấp nhận và ghi vết là hợp lý.
  file: `packages/connect/src/catalog-feed.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
