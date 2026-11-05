# Review findings: mau-nhap-va-bai (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **GET /imports/templates (vai nhập) giờ trả thêm trường `sua` (id dòng sổ + user id của Quản trị) và importId rỗng, lệch với schema OpenAPI đã khai**
  Người dùng thấy gì: Người có vai nhập, khi mở màn Nhập Excel, nhận thêm một vài thông tin nội bộ về người đã sửa mẫu mà họ không cần thấy. Mẫu hiển thị vẫn đúng.
  Căn cứ: Nhẹ: mẫu vẫn đúng, chỉ lộ thêm mã nội bộ của người sửa trong cùng sàn, không lộ dữ liệu chủ nhà, và sửa là việc nhỏ có thể làm ở đợt sau.
  file: `packages/api/src/imports/store.ts`
  severity: low
  Đề xuất: known-limits

- **Xoá cột trong mẫu nuốt lỗi, không báo gì cho người dùng**
  Người dùng thấy gì: Khi xoá một cột mẫu mà máy chủ từ chối hoặc mất mạng, hộp xác nhận vẫn đóng và dòng vẫn nằm đó, không có câu báo nào. Người dùng không biết vì sao chưa xoá được.
  Căn cứ: Không mất dữ liệu, người dùng thấy dòng còn đó và có thể bấm xoá lại hay tải lại trang; chỉ gây bối rối chứ không gây hại.
  file: `apps/web/src/app/(app)/settings/templates/vung-mau-nhap.tsx`
  severity: low
  Đề xuất: known-limits

- **Xoá mẫu nuốt lỗi: hộp xác nhận đóng và làm mới dù máy chủ từ chối hay mạng hỏng**
  Người dùng thấy gì: Bấm xoá cột mẫu gặp lỗi thì màn hình trông như đã xử lý xong nhưng dòng vẫn còn, không có lời giải thích.
  Căn cứ: Không mất dữ liệu và thử lại được ngay; lỗi chỉ xảy ra khi mạng hỏng hoặc quyền đổi giữa chừng nên hiếm gặp.
  file: `apps/web/src/app/(app)/settings/templates/vung-mau-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Ô Quy đổi bỏ lặng các dòng không có ký tự «→» và có thể xoá trắng bảng quy đổi cũ**
  Người dùng thấy gì: Nếu người quản trị gõ quy đổi bằng ký hiệu khác mũi tên (ví dụ «->» hoặc «=»), dòng đó bị bỏ qua mà không báo, và bảng quy đổi cũ của cột có thể bị xoá trắng khi bấm Lưu.
  Căn cứ: Có thể mất bảng quy đổi đã nhớ mà không hay biết, nhưng chỉ chạm một cột ở màn quản trị, người dùng nhập lại được; sửa nhỏ ở hộp sửa.
  file: `apps/web/src/app/(app)/settings/templates/mau-nhap.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (đo chỉ dẫn thay vì đầu ra): E4 «lần nhập đang mở ghi theo kế hoạch cũ» chỉ đọc lại imports.plan đã lưu, không đo căn được ghi**
  Người dùng thấy gì: Một bài kiểm tự động chưa bắt được trường hợp lần nhập đang mở ghi căn theo mẫu mới thay vì kế hoạch cũ. Người dùng chưa gặp lỗi nào, chỉ là lưới an toàn mỏng hơn.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; chỉ làm giảm khả năng phát hiện lỗi về sau, bổ sung bài kiểm sau này không đắt.
  file: `packages/api/test-db/mau-nhap-va-bai/mau-nhap.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình 3 (lời hứa là quan hệ nhưng chỉ kiểm phía có mặt): hoàn tác «gỡ đúng tập căn» chỉ lọc trong chính tập mong đợi**
  Người dùng thấy gì: Bài kiểm tự động hoàn tác lần nhập chưa chứng minh được rằng hoàn tác không gỡ nhầm căn của lần nhập khác. Người dùng chưa gặp lỗi nào.
  Căn cứ: Không có lỗi thật được chỉ ra, chỉ là bài kiểm lỏng; rủi ro thấp và có thể siết bài kiểm ở đợt sau.
  file: `packages/api/test-db/mau-nhap-va-bai/mau-nhap.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên phủ đủ lớp nhưng ma trận có dòng trùng): bảng E1b đếm 9 ca nhưng hai ca «mở TRƯỚC, ghi sau» trùng y hệt hai ca khác**
  Người dùng thấy gì: Bảng ca kiểm tự động đếm chín ca nhưng thật ra chỉ bảy ca khác nhau, nên việc lần nhập mở trước rồi ghi sau có đè bản sửa hay không chưa được đo ở tầng này. Người dùng chưa thấy lỗi nào.
  Căn cứ: Không gây hại trực tiếp cho người dùng; chỉ là con số phủ kiểm phóng đại, và hành vi này đã có bài kiểm ở tầng khác.
  file: `packages/core/src/import/memory/sua-mau.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
