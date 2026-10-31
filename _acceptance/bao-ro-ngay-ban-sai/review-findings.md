# Review findings: bao-ro-ngay-ban-sai (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **evals.yaml gọi ma trận ngày sai là NGAY_KHONG_CO_THAT, nhưng tên này trong code là hằng lời lỗi**
  Người dùng thấy gì: Ngày bán không có thật vẫn bị từ chối đúng với thông báo nêu đúng ô ngày bán, người dùng không thấy gì khác. Chỉ có tài liệu nghiệm thu gọi tên danh sách ngày sai chưa khớp với bản thật, nên người chấm sau này có thể hiểu nhầm là hồ sơ trượt.
  Căn cứ: Nhẹ: không ảnh hưởng người dùng và không mất dữ liệu, chỉ có nguy cơ người chấm đọc nhầm, sửa sau rẻ bằng một lần chỉnh chữ.
  file: `_acceptance/bao-ro-ngay-ban-sai/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Kiểm thử test-db nhập thẳng mã nguồn của lõi bằng đường dẫn tương đối, không qua export của gói**
  Người dùng thấy gì: Không ảnh hưởng gì đến người dùng: lệnh chốt bán với ngày sai vẫn bị từ chối đúng. Chỉ là cách bài kiểm lấy danh sách ngày mẫu đi đường tắt, nên sau này đổi cách tổ chức thư mục có thể làm bài kiểm báo lỗi và phải sửa lại.
  Căn cứ: Rất nhẹ: không chạm dữ liệu hay người dùng, nếu thư mục đổi thì bài kiểm báo lỗi ngay nên dễ thấy và dễ sửa, chi phí sửa nay lớn hơn lợi ích.
  file: `packages/api/test-db/ngay-ban/ngay-ban.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
