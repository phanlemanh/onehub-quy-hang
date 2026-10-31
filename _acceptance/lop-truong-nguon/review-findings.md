# Review findings: lop-truong-nguon (round 1)

## Trong hợp đồng

- **Assertion âm-tính-một-mình (hình 4), gốc ở fixture viết tay theo khuôn bên đọc (hình 2): kiểm «bản trả không bao giờ có số» ở lõi không thể đỏ**
  file: `packages/core/src/access/access.test.ts:57`
  severity: medium
  AC: AC-3
  source: measurement
  detail: Dữ liệu mẫu REC ở dòng 19 viết tay theo đúng khuôn mà hàm dựng bản trả nhận vào: chỉ có tên chủ, giá đáy và cờ «có số». Khuôn này không có chỗ nào chứa số điện thoại. Vì vậy phép kiểm dòng 57 (chuỗi JSON của bản trả không chứa '0900000012', '0900 000 012', '+84900000012', '012') và phần số điện thoại trong phép quét rò ở dòng 63 luôn qua, dù hàm có làm gì: số chưa từng có ở đầu vào nên không thể lọt ra. Không có ca đối chứng nào đưa vào một bản ghi có số để chứng minh hàm thật sự chặn được. Hồ sơ nghiệm thu (E3) ghi «Chiều đỏ: để lọt số → ca đỏ nêu đường khoá», nhưng với số điện thoại thì ca lõi không đỏ được. Điều AC-3 hứa («hồ sơ đủ ba trường» → bản trả không có số) vì thế chưa được đo ở lớp lõi. Hiện chỉ lời gọi API trên Postgres thật ở packages/api/test-db/owners.test.ts đo được điều này.
  rationale: AC-3 hứa hồ sơ đủ ba trường thì bản trả không bao giờ có số, nhưng ca ở lõi không đưa số vào nên điều AC-3 hứa chưa được chứng minh.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bốn handler của lời gọi chủ nhà ép kiểu `as never`, tắt phép kiểm thân trả về theo khuôn OpenAPI**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Về sau, nếu ai sửa nhầm làm kết quả trả về lệch khuôn đã công bố, máy sẽ không báo sớm cho lập trình viên.
  Căn cứ: Nhẹ: hiện mọi lời gọi vẫn trả đúng, không mất hay lộ dữ liệu, chỉ mất một lớp báo động cho lần sửa sau; làm sau vẫn rẻ.
  file: `packages/api/src/owners/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Khuôn và luật gán đầu chủ viết tay ở tầng API, không có ở lõi như khuôn ghi chủ nhà**
  Người dùng thấy gì: Việc trưởng nhóm gán đầu chủ chạy đúng và không lộ thông tin. Luật gán nằm ở lớp ngoài thay vì lớp lõi, nên khi thêm màn hay kênh khác sẽ phải viết lại luật này.
  Căn cứ: Nhẹ: không mất hay lộ dữ liệu vì cơ sở dữ liệu vẫn chặn, chỉ là sắp xếp mã chưa gọn; dời luật về lõi sau này không đắt.
  file: `packages/api/src/owners/store.ts`
  severity: low
  Đề xuất: known-limits

- **Lời gọi chỉ đọc GET owner vẫn khoá dòng hàng bằng `select … for update`**
  Người dùng thấy gì: Khi nhiều người cùng mở hồ sơ chủ nhà của một căn, các lần xem phải xếp hàng chờ nhau và chờ cả lúc căn đang được cập nhật. Với quy mô hiện nay hầu như không ai nhận ra.
  Căn cứ: Nhẹ: chỉ làm chậm khi nhiều người cùng thao tác trên một căn, không sai kết quả, không mất dữ liệu; sửa sau rẻ khi thấy chậm thật.
  file: `packages/api/src/owners/store.ts`
  severity: low
  Đề xuất: known-limits

- **Mọi lỗi 42501 khi mở số đều bị đổi thành 403 listing-agent-required, che lỗi cấu hình**
  Người dùng thấy gì: Nếu hệ thống bị cấu hình sai quyền, người đáng được mở số sẽ thấy báo là mình không có quyền thay vì báo lỗi hệ thống, nên khó biết đâu là nguyên nhân thật.
  Căn cứ: Vừa phải nhưng hiếm: chỉ xảy ra khi cấu hình hỏng, không lộ số cho người sai, người dùng thử lại không hết nhưng đội kỹ thuật sửa được sau một chỗ nhỏ.
  file: `packages/api/src/owners/store.ts`
  severity: low
  Đề xuất: known-limits

- **Mã hàng hợp regex nhưng không phải uuid làm 500 ở bốn lời gọi chủ nhà mới**
  Người dùng thấy gì: Nếu ai đó cố tình gọi với mã căn viết sai dạng đặc biệt, hệ thống báo lỗi máy chủ thay vì báo không tìm thấy. Người dùng bình thường qua màn hình không gặp trường hợp này.
  Căn cứ: Nhẹ: chỉ xảy ra khi gọi thẳng bằng mã bịa, không lộ hay mất dữ liệu, chỉ tốn một lần báo lỗi; sửa sau rẻ.
  file: `packages/api/src/owners/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình (hình 4): quét rò trên danh sách hàng mà không xác nhận hàng đang xét có trong thân trả về**
  Người dùng thấy gì: Bài kiểm tra có thể báo xanh dù danh sách căn trả về trống, nên trong trường hợp hiếm sẽ không thật sự chứng minh danh sách không lộ thông tin chủ nhà. Hiện danh sách có đủ căn nên chưa ảnh hưởng.
  Căn cứ: Nhẹ: hệ thống chạy đúng, chỉ là bằng chứng kiểm thử hơi lỏng; không ảnh hưởng người dùng và thêm một dòng xác nhận sau này rất rẻ.
  file: `packages/api/test-db/owners.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
