# Review findings: lop-truong-nguon (round 3)

## Trong hợp đồng

Không có phát hiện nào trong hợp đồng ở round này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hợp đồng và thẻ người ký vẫn hứa «trưởng nhóm thấy nguồn cả sàn» và «không làm trục Chỉ tôi», trong khi mã lượt 3 trả 404 cho hàng «Chỉ tôi» của người khác**
  Người dùng thấy gì: Thẻ người ký nói trưởng nhóm thấy chủ nhà của mọi căn trong sàn. Thực tế, với căn đặt chế độ «Chỉ tôi» của người khác, trưởng nhóm, đầu chủ khác và quản trị sàn đều nhận «không tìm thấy». Người ký có thể hiểu sai quyền thực tế của trưởng nhóm.
  Căn cứ: Hệ thống không lộ thêm dữ liệu nào, chỉ là quyền xem hẹp hơn lời hứa trên thẻ; không mất hay lộ dữ liệu, và chủ kho đã chốt hẹp lại có chủ ý. Ghi vào han che da biet là đủ, sửa chữ trên thẻ rẻ và không gấp.
  file: `_acceptance/lop-truong-nguon/card-plain.json`
  severity: medium
  Đề xuất: known-limits

- **Bốn handler của lời gọi chủ nhà ép kiểu `as never`, tắt phép kiểm thân trả về theo khuôn OpenAPI (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Về sau, nếu ai sửa nhầm làm kết quả trả về lệch khuôn đã công bố, máy sẽ không báo sớm cho lập trình viên.
  Căn cứ: Nhẹ: hiện mọi lời gọi vẫn trả đúng, không mất hay lộ dữ liệu, chỉ mất một lớp báo động cho lần sửa sau; làm sau vẫn rẻ.
  file: `packages/api/src/owners/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Khuôn và luật gán đầu chủ viết tay ở tầng API, không có ở lõi như khuôn ghi chủ nhà (r1 · tệp đã đổi)**
  Người dùng thấy gì: Việc trưởng nhóm gán đầu chủ chạy đúng và không lộ thông tin. Luật gán nằm ở lớp ngoài thay vì lớp lõi, nên khi thêm màn hay kênh khác sẽ phải viết lại luật này.
  Căn cứ: Nhẹ: không mất hay lộ dữ liệu vì cơ sở dữ liệu vẫn chặn, chỉ là sắp xếp mã chưa gọn; dời luật về lõi sau này không đắt.
  file: `packages/api/src/owners/store.ts`
  severity: low
  Đề xuất: known-limits

- **Lời gọi chỉ đọc GET owner vẫn khoá dòng hàng bằng `select … for update` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi nhiều người cùng mở hồ sơ chủ nhà của một căn, các lần xem phải xếp hàng chờ nhau và chờ cả lúc căn đang được cập nhật. Với quy mô hiện nay hầu như không ai nhận ra.
  Căn cứ: Nhẹ: chỉ làm chậm khi nhiều người cùng thao tác trên một căn, không sai kết quả, không mất dữ liệu; sửa sau rẻ khi thấy chậm thật.
  file: `packages/api/src/owners/store.ts`
  severity: low
  Đề xuất: known-limits

- **Mọi lỗi 42501 khi mở số đều bị đổi thành 403 listing-agent-required, che lỗi cấu hình (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu hệ thống bị cấu hình sai quyền, người đáng được mở số sẽ thấy báo là mình không có quyền thay vì báo lỗi hệ thống, nên khó biết đâu là nguyên nhân thật.
  Căn cứ: Vừa phải nhưng hiếm: chỉ xảy ra khi cấu hình hỏng, không lộ số cho người sai, người dùng thử lại không hết nhưng đội kỹ thuật sửa được sau một chỗ nhỏ.
  file: `packages/api/src/owners/store.ts`
  severity: low
  Đề xuất: known-limits

- **Mã hàng hợp regex nhưng không phải uuid làm 500 ở bốn lời gọi chủ nhà mới (r1)**
  Người dùng thấy gì: Nếu ai đó cố tình gọi với mã căn viết sai dạng đặc biệt, hệ thống báo lỗi máy chủ thay vì báo không tìm thấy. Người dùng bình thường qua màn hình không gặp trường hợp này.
  Căn cứ: Nhẹ: chỉ xảy ra khi gọi thẳng bằng mã bịa, không lộ hay mất dữ liệu, chỉ tốn một lần báo lỗi; sửa sau rẻ.
  file: `packages/api/src/owners/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): quét rò trên danh sách hàng mà không xác nhận hàng đang xét có trong thân trả về (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm tra có thể báo xanh dù danh sách căn trả về trống, nên trong trường hợp hiếm sẽ không thật sự chứng minh danh sách không lộ thông tin chủ nhà. Hiện danh sách có đủ căn nên chưa ảnh hưởng.
  Căn cứ: Nhẹ: hệ thống chạy đúng, chỉ là bằng chứng kiểm thử hơi lỏng; không ảnh hưởng người dùng và thêm một dòng xác nhận sau này rất rẻ.
  file: `packages/api/test-db/owners.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

