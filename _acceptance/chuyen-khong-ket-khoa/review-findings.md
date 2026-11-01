# Review findings: chuyen-khong-ket-khoa

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phép chờ khoá trong ca kẹt khoá đếm cả khoá chờ của tệp kiểm khác, nên chiều đỏ không tất định như hồ sơ khẳng định**
  Người dùng thấy gì: Bài kiểm có thể đôi khi xanh dù lỗi kẹt khoá quay lại, nên lưới bảo vệ yếu hơn hồ sơ nói. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ là bài kiểm nội bộ, không mất dữ liệu và không chạm người dùng; chỉ làm lưới bắt lỗi kém chắc hơn, sửa sau vẫn rẻ.
  file: `packages/api/test-db/lien-he-chuyen.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Nhánh lỗi trả kết nối về pool khi giao dịch còn mở và còn giữ ACCESS EXCLUSIVE trên listing_owners**
  Người dùng thấy gì: Khi bài kiểm này tự đỏ, nó có thể làm các bài kiểm khác treo, che mất lỗi gốc. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ xảy ra khi bài kiểm đã hỏng sẵn, không mất dữ liệu; kẹt tự hết khi tiến trình kiểm kết thúc, chạy lại là được.
  file: `packages/api/test-db/lien-he-chuyen.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Ca mới tự gây kẹt khoá với tệp kiểm khác chạy song song (cùng loại lỗi hồ sơ này định sửa)**
  Người dùng thấy gì: Hiếm khi, một bài kiểm của hồ sơ khác có thể đỏ oan vì va chạm khoá khi chạy song song. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm đỏ giả ở bài kiểm, không mất dữ liệu, chạy lại thường xanh; nhưng đáng ghi lại vì có thể gây nhiễu ở lần gộp khác.
  file: `packages/api/test-db/lien-he-chuyen.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Vòng chờ pg_locks không lọc theo kết nối của bài chuyển nên thế kẹt không tất định khi chạy song song**
  Người dùng thấy gì: Bài kiểm có thể xanh oan mà chưa thật sự dựng được tình huống kẹt khoá. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm lưới kiểm yếu đi, không động đến dữ liệu thật; sửa sau rẻ và an toàn.
  file: `packages/api/test-db/lien-he-chuyen.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Nhánh lỗi trả kết nối về pool khi giao dịch còn mở và vẫn giữ ACCESS EXCLUSIVE**
  Người dùng thấy gì: Khi bài kiểm này đỏ, các bài kiểm khác có thể treo và lỗi gốc bị che. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ xảy ra khi bài kiểm đã hỏng, không mất dữ liệu, thử lại là hết; hậu quả nhẹ.
  file: `packages/api/test-db/lien-he-chuyen.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình): bước đối chứng dương 'thế kẹt đã dựng' không gắn với phiên của bài chuyển**
  Người dùng thấy gì: Bài kiểm có thể báo xanh dù chưa chứng minh được tình huống kẹt khoá đã xảy ra. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm bài kiểm kém chắc, không có mất mát dữ liệu hay ảnh hưởng người dùng; sửa sau rẻ.
  file: `packages/api/test-db/lien-he-chuyen.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
