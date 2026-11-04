# Review findings: ho-so-can-dien-thoai (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hai trong bốn cờ của lớp phủ (noiBo, suaAnh) không màn nào đọc; luật mới KH-hs-lop-phu mô tả sai cách mã đang chạy (r1)**
  Người dùng thấy gì: Người dùng không thấy khác biệt nào: ngăn Nội bộ và quyền sửa ảnh vẫn hiện đúng theo vai. Chỉ có tài liệu luật nói một đằng, mã chạy một nẻo, nên người sửa sau này có thể hiểu nhầm nguồn quyết quyền.
  Căn cứ: Không ảnh hưởng gì tới người dùng hay dữ liệu hiện tại, chỉ gây nhầm cho người bảo trì và dọn lại sau rẻ.
  file: `packages/core/src/access/lop-phu-ho-so.ts`
  severity: medium
  Đề xuất: known-limits

- **Hàm đọc tên người dùng bị chép lại gần như nguyên văn thay vì dùng chung (r1)**
  Người dùng thấy gì: Người dùng không bị ảnh hưởng: tên đầu chủ vẫn hiện đúng. Rủi ro chỉ là sau này đổi cách đọc tên mà quên sửa một trong hai chỗ, khiến tên hiện sai ở một màn.
  Căn cứ: Hậu quả rất nhẹ và xa, không mất dữ liệu, còn chi phí gom lại thì nhỏ nhưng không cấp thiết cho đợt này.
  file: `packages/api/src/owners/routes.ts`
  severity: low
  Đề xuất: wont-fix

- **Assertion âm-tính-một-mình: kiểm «không ảnh ngăn internal» thiếu đối chứng dương (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng ảnh nội bộ thật sự bị giấu khỏi Đầu khách, nên nếu sau này có lỗi làm lộ ảnh nội bộ, bài kiểm có thể vẫn báo xanh. Hiện chưa thấy ảnh nào bị lộ.
  Căn cứ: Chưa có dấu hiệu lộ ảnh thật, nhưng lưới bảo vệ yếu ở chỗ nhạy cảm; thêm một lần đọc đối chứng sau này rẻ và không ảnh hưởng người dùng.
  file: `packages/api/test-db/owners.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
