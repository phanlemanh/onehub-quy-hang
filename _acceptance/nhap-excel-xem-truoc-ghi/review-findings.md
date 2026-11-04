# Review findings: nhap-excel-xem-truoc-ghi (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Create path silently drops owner phone and floor price when the row has no owner name**
  Người dùng thấy gì: Nếu một dòng trong file có số chủ nhà hoặc giá đáy nhưng ô tên chủ để trống, số và giá đó không được lưu và người nhập không được báo. Với căn cập nhật, thông tin chủ nhà trong file cũng không được ghi.
  Căn cứ: Không mất dữ liệu gốc vì file vẫn còn, người nhập thêm lại được bằng tay, và hàng vẫn tạo đúng; sửa là việc của một đợt riêng.
  file: `packages/api/src/imports/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Row counted as 'supplement' (sent a supplementary message) even though no lead was created**
  Người dùng thấy gì: Một dòng thiếu số điện thoại hay giá vẫn được đếm vào số tin bổ sung đã gửi, dù thực tế không có tin nào được gửi đi. Con số tổng có thể cao hơn số tin thật.
  Căn cứ: Chỉ lệch con số tổng, lý do vẫn hiện ở từng dòng, không mất dữ liệu và không ai nhận nhầm tin; hợp đồng đã chủ ý để như vậy.
  file: `packages/api/src/imports/store.ts`
  severity: medium
  Đề xuất: known-limits

- **'Today' is taken as the UTC date, so the 00:00-07:00 window (Vietnam time) rejects confirmation dates of today**
  Người dùng thấy gì: Nếu nhập file trong khoảng 0 giờ đến 7 giờ sáng giờ Việt Nam, ngày xác nhận là hôm nay bị coi là ngày tương lai nên không được ghi. Người nhập phải nhập lại vào buổi sáng hoặc để người xử lý ô đó.
  Căn cứ: Chỉ xảy ra trong 7 giờ đầu ngày, lỗi được báo rõ chứ không ghi sai, và người dùng thử lại sau 7 giờ là xong.
  file: `packages/api/src/imports/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 4 — assertion âm-tính-một-mình: đếm import_rows = 0 sau gói 201 dòng chạy ở chế độ xem thử, nên lúc nào cũng đúng**
  Người dùng thấy gì: Bài kiểm tự động cho gói quá 200 dòng có một phép đếm luôn đúng nên không chứng minh được gói bị từ chối thì không ghi gì. Việc từ chối gói quá cỡ vẫn được kiểm bằng mã lỗi.
  Căn cứ: Người dùng không bị ảnh hưởng trực tiếp, vì mã từ chối vẫn được kiểm; sửa sau rẻ và không gây mất dữ liệu.
  file: `packages/api/test-db/imports/lan-nhap.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — thiếu đối chứng dương: so contact_id của hai dòng cùng số vẫn qua khi cả hai đều null**
  Người dùng thấy gì: Bài kiểm tự động cho hai dòng cùng số chủ nhà vẫn xanh nếu cả hai không gắn liên hệ nào. Có thể có lỗi gắn liên hệ mà bài kiểm không bắt được.
  Căn cứ: Phần mềm chạy đúng như hợp đồng theo các phép kiểm khác, nếu có sai thì chỉ là liên hệ trùng, sửa được sau và không lộ dữ liệu.
  file: `packages/api/test-db/imports/lan-nhap.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
