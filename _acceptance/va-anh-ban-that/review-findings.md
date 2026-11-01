# Review findings: va-anh-ban-that (round 3)

## Trong hợp đồng

- **Đối tượng 0 byte trên kho làm GET có Range trả 416, thành lỗi 500 thay vì từ chối**
  file: `packages/api/src/photos/kho-s3.ts:375`
  severity: low
  AC: AC-2
  source: bugs
  detail: docDau gửi `range: bytes=0-63`. Nếu người dùng PUT thân rỗng lên link ký (link không ràng buộc cỡ), S3 trả 416 Range Not Satisfiable. Dòng `if (!r.ok) throw` ném lỗi, nên lần xác nhận ra 500 thay vì 400 photo-not-image, và bản gốc rỗng không được xoá.
  rationale: AC-2 yêu cầu đối tượng không phải ảnh thì bị từ chối 400 và bị xoá khỏi kho; tệp rỗng ra 500 và không bị xoá.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phản hồi API dùng khoá snake_case «truc_tiep», lệch với camelCase ngay trong cùng đối tượng**
  Người dùng thấy gì: Một tên trường trong phản hồi ảnh viết lệch kiểu so với các trường khác; người dùng cuối không thấy gì, chỉ gây phiền cho người viết code về sau.
  Căn cứ: Không ảnh hưởng người dùng cuối và hợp đồng đã ghi rõ việc đổi tên trường là hạn chế đã biết.
  file: `packages/api/src/photos/store.ts`
  severity: low
  Đề xuất: known-limits

- **Lỗi 403 của kho ảnh bị hiểu thành 'không có bản gốc', rồi báo sai là 'không phải ảnh'**
  Người dùng thấy gì: Nếu khoá hay cấu hình kho ảnh hỏng, người dùng bị báo nhầm là «không phải ảnh» thay vì lỗi hệ thống, nên khó biết cần báo người quản trị.
  Căn cứ: Chỉ xảy ra khi cấu hình kho hỏng, không mất dữ liệu, người dùng thử lại không hại gì; lỗi lộ ngay khi chủ kho thử khói.
  file: `packages/api/src/photos/kho-s3.ts`
  severity: medium
  Đề xuất: known-limits

- **Bản gốc đã tải thẳng lên kho bị bỏ lại khi lần xác nhận bị từ chối trước bước kiểm ảnh**
  Người dùng thấy gì: Một số lần tải ảnh bị từ chối vẫn để lại bản gốc trong kho mà không hồ sơ nào trỏ tới, chiếm chỗ lâu dài.
  Căn cứ: Hợp đồng đã chủ động giữ mục này ở hạn chế đã biết; hậu quả chỉ là tốn dung lượng, không lộ hay mất dữ liệu của người dùng.
  file: `packages/api/src/photos/store.ts`
  severity: low
  Đề xuất: known-limits

- **Link PUT còn sống sau khi xác nhận nên bản gốc đã kiểm có thể bị ghi đè (kiểm trước, dùng sau)**
  Người dùng thấy gì: Trong vòng một phút sau khi xác nhận, người giữ link tải lên có thể thay bản gốc bằng tệp khác chưa được kiểm.
  Căn cứ: Cần người đã có quyền thêm ảnh tự làm hại ảnh của mình, cửa sổ chỉ 60 giây và không lộ dữ liệu sang công ty khác.
  file: `packages/api/src/photos/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn/đầu vào thay vì đầu ra): E1 đo cỡ thân của chính form do test tự dựng, không đo thứ hệ thống nhận**
  Người dùng thấy gì: Bài kiểm khẳng định bản gốc không đi qua API nhưng thực ra chỉ đo thứ do chính bài kiểm tạo ra, nên nếu sau này sai thì bài kiểm không báo.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; rủi ro là lỗi quay lại mà không ai biết, sửa bài kiểm sau vẫn rẻ.
  file: `packages/api/test-db/photos-ban-that.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E5 xác nhận lời báo hiện ở hồ sơ căn bằng cách grep mã nguồn muc-anh.tsx**
  Người dùng thấy gì: Bài kiểm tự động chỉ xem trong mã có đúng dòng chữ chứ không chạy thử xem lời báo lỗi có hiện lên màn hình, nên có thể bỏ sót lỗi hiển thị.
  Căn cứ: Lỗi hiển thị thật vẫn bị bắt khi kiểm bằng mắt; hậu quả nhẹ và người dùng chỉ không thấy lời báo, tải lại là thấy trạng thái đúng.
  file: `apps/web/src/app/(app)/units/photos/ban-that.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình, không ghim thông điệp): xác nhận mã ảnh của sàn khác chỉ kiểm mã 400**
  Người dùng thấy gì: Bài kiểm việc chặn mã ảnh của sàn khác chỉ thấy bị từ chối chứ không chắc từ chối đúng lý do, nên có thể bỏ sót lỗi khác che mất.
  Căn cứ: Không đổi hành vi với người dùng; chỉ làm bài kiểm kém chặt, sửa sau rẻ và không lộ dữ liệu.
  file: `packages/api/test-db/photos-ban-that.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

