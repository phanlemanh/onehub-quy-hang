## Trong hợp đồng

- **Hình dạng 5 — tuyên quét LỚP «mọi cột danh mục còn lại» nhưng đối chứng dương chỉ đo một tập con**
  file: `packages/db/tests/danh-muc-dung-chung.test.mjs:225`
  severity: medium
  AC: AC-11
  source: measurement
  detail: Comment trong ca «mỗi sàn chỉ thấy dòng tin của mình, không ai đọc mã thoả thuận» ghi «Đối chứng dương: mọi cột danh mục còn lại của dòng sàn B đọc được, đúng giá trị». E (AC-11) trong evals.yaml dòng 105 cũng hứa «select mọi cột danh mục còn lại (danh sách viết trước, không agreement_id)». Nhưng ca kiểm chỉ chọn 4 trên 6 cột được cấp ở catalog_subdivisions (subdivision_key, subdivision_name, complex_name, provider; thiếu measured_at, updated_at) và 8 trên 19 cột được cấp ở catalog_units (thiếu stack, floor, living_area, bedrooms_total, direction_faces, lot_size_area, stories_total, frontage_length, access_road_width, measured_at, updated_at). Migration 014 thay quyền đọc cả bảng bằng quyền đọc theo từng cột, nên điều cần chứng minh là mọi cột trừ agreement_id vẫn đọc được. Không có danh sách cột viết trước nào rút từ khoản grant để mỗi cột được so một lần. Ca E4 (nhan-goi.test.ts, mảng COT_CAN) cũng không bù được: nó đọc bằng appPool mà không đặt vai (dòng 2 của tệp ghi rõ «appPool không đặt vai»), tức là đọc bằng chủ bảng, không qua quyền theo cột. Hệ quả: nếu 014 quên cấp quyền đọc cho living_area hay floor, hai ca này vẫn xanh.
  rationale: AC-11 đòi sàn «vẫn đọc được mọi cột danh mục của mọi dòng» sau khi thu quyền đọc theo cột; ca kiểm chỉ chứng minh một phần các cột nên tiêu chí chưa được chứng minh đủ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **An older feed that arrives late overwrites newer catalog data and moves the measurement time backwards**
  Người dùng thấy gì: Nếu một gói danh mục cũ tới trễ sau gói mới, nó có thể ghi đè thông tin mới bằng thông tin cũ và kéo lùi mốc đo của căn.
  Căn cứ: Hợp đồng đã xếp việc này vào phần để sau; chỉ xảy ra khi bên đẩy gửi sai thứ tự, và gửi lại gói đúng sẽ khôi phục dữ liệu, nên không mất dữ liệu vĩnh viễn.
  file: `packages/api/src/catalog/feeds.ts`
  severity: medium
  Đề xuất: known-limits

- **Every permission error (42501) is reported as 'agreement-inactive' 403, which hides privilege bugs**
  Người dùng thấy gì: Khi hệ thống thiếu quyền do cấu hình sai, người gửi gói vẫn chỉ thấy báo thoả thuận không hiệu lực, nên khó tìm ra nguyên nhân thật.
  Căn cứ: Chủ kho đã chấp nhận giới hạn này; không làm mất hay lộ dữ liệu, chỉ làm chẩn đoán chậm hơn khi có lỗi cấu hình.
  file: `packages/api/src/catalog/feeds.ts`
  severity: low
  Đề xuất: known-limits

- **Bảng danh sách sàn được tin mở cho mọi sàn đọc chéo, trái bất biến cách ly theo current_company_id (r1)**
  Người dùng thấy gì: Mỗi sàn có thể xem được danh sách các sàn khác được tin làm nguồn danh mục và mã thoả thuận của họ. Đây chỉ là mã nội bộ, không có thông tin chủ nhà, giá hay khách.
  Căn cứ: Lộ ra chỉ là mã công ty và mã thoả thuận, hậu quả nhẹ, không lộ dữ liệu chủ nhà; hợp đồng đã chủ ý cho đọc chung nên ghi lý do là đủ và rẻ.
  file: `packages/db/migrations/010_danh_muc_dung_chung.sql`
  severity: low
  Đề xuất: known-limits

- **Mọi lỗi 42501 đều bị đổi thành agreement-inactive, kể cả lỗi thiếu quyền thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này hệ thống bị thiếu quyền do cấu hình sai, người gửi gói danh mục vẫn chỉ nhận thông báo thoả thuận không hiệu lực. Việc tìm ra nguyên nhân thật sẽ khó và chậm hơn.
  Căn cứ: Chỉ xảy ra khi cấu hình hạ tầng hỏng, không làm mất hay lộ dữ liệu, và gói bị từ chối an toàn nên người dùng gửi lại được sau khi sửa; chỉ làm chẩn đoán lâu hơn.
  file: `packages/api/src/catalog/feeds.ts`
  severity: low
  Đề xuất: known-limits

- **Quét LỚP chỉ có điểm-case (thiếu ma trận toàn phần, mẫu P105): ca khoá lạ không ghim số lần so và không ghim «đúng một lỗi» (r1)**
  Người dùng thấy gì: Bài kiểm tự động cho khoá lạ hơi lỏng, nên nếu sau này gói bị báo thừa lỗi phụ thì bài kiểm có thể không bắt được. Người dùng không thấy ảnh hưởng gì hiện tại.
  Căn cứ: Chỉ là bài kiểm hơi lỏng, sản phẩm đang chạy đúng và người dùng không bị ảnh hưởng; chấp nhận và ghi vết là hợp lý.
  file: `packages/connect/src/catalog-feed.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
