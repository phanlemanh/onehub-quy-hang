## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bulk «Đổi trạng thái» still offers «Đang bán» to people who lack the «Sẵn sàng bán» flag**
  Người dùng thấy gì: Đầu khách hay đầu chủ không giữ căn vẫn thấy lựa chọn «Đang bán» khi đổi trạng thái nhiều căn cùng lúc. Bấm vào thì máy chủ từ chối và các căn đó rơi vào «Cần xem».
  Căn cứ: Không mất dữ liệu và máy chủ vẫn chặn đúng, nhưng người dùng bị mời làm điều không được và phải dọn lại danh sách «Cần xem»; sửa riêng một màn thì rẻ.
  file: `apps/web/src/app/(app)/inventory/bulk/lo.ts`
  severity: medium
  Đề xuất: new-contract

- **Undo of «Đang bán → Tạm ngừng» sends an Active command the new flag rule rejects**
  Người dùng thấy gì: Đầu khách đổi một căn từ «Đang bán» sang tạm ngừng rồi bấm Hoàn tác sẽ bị máy chủ từ chối và căn rơi vào «Cần xem». Căn không bị đưa lên «Đang bán» trái phép.
  Căn cứ: Hiếm gặp, không lộ quyền và không mất dữ liệu; người dùng tự đưa căn về đúng trạng thái được.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **E9c guard always skips in CI (shallow checkout, no main ref), so the check never runs where it is supposed to protect**
  Người dùng thấy gì: Rào tự kiểm việc sửa bài cũ chỉ chạy được trên máy tác giả, còn trên hệ thống kiểm tự động thì bị bỏ qua mà vẫn báo xanh. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm yếu một lưới an toàn nội bộ, không chạm người dùng; sửa sau cũng rẻ.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **After merge, E9c breaks every future branch that adds or edits any test file under test-db**
  Người dùng thấy gì: Sau khi gộp, các vòng làm việc sau nếu thêm hay sửa bài kiểm cơ sở dữ liệu có thể bị rào này chặn oan. Người dùng cuối không thấy gì.
  Căn cứ: Chỉ gây vướng cho đội làm việc, không ảnh hưởng người dùng; gỡ được khi gặp, nhưng nên ghi để vòng sau biết.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo checkout của tác giả thay vì cây đang kiểm): E9c tự bỏ qua trong CI và đọc bản HEAD thay vì tệp đang có trên đĩa**
  Người dùng thấy gì: Rào tự kiểm việc sửa bài cũ có thể bỏ sót việc xoá điều kiểm chưa commit và bị bỏ qua trên hệ thống kiểm tự động. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ là lưới an toàn nội bộ yếu đi, không mất dữ liệu hay lộ quyền cho người dùng; sửa sau không đắt.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm «chuỗi không có mặt» trong khi lời hứa là quan hệ): ca nấc Trạng thái khi không đủ cờ chỉ kiểm thiếu Active**
  Người dùng thấy gì: Bài kiểm có thể không bắt được lỗi làm người không đủ cờ mất luôn các nấc trạng thái khác. Người dùng chỉ gặp nếu sau này có người cài sai.
  Căn cứ: Hành vi hiện tại đúng, chỉ là bài kiểm lỏng; rủi ro thấp và thêm một phép so thì rẻ nhưng không cần mở việc riêng.
  file: `apps/web/src/app/(app)/inventory/cell-edit/trang-thai.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 2 (dữ liệu mẫu viết tay đúng khuôn bên đọc): ca «ô Trạng thái: cờ lấy từ lõi» không đi qua đường lấy người giữ căn của trình sửa thật**
  Người dùng thấy gì: Bài kiểm không đo đúng đường lấy người giữ căn mà màn thật dùng, nên một lỗi ở đó có thể lọt. Căn trên máy cũ chưa có thông tin người giữ có thể được coi là chưa ai giữ.
  Căn cứ: Nhẹ, chỉ là chỗ bài kiểm chưa phủ, không mất dữ liệu; người dùng tải lại đồng bộ là đủ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/trang-thai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): ca phiên bản cũ chỉ kiểm mã 403, không kiểm lý do**
  Người dùng thấy gì: Bài kiểm cho lệnh phiên bản cũ chưa ghim lý do từ chối nên một lý do khác vẫn lọt. Người dùng cuối không thấy khác biệt.
  Căn cứ: Hành vi đã được kiểm chặt ở ca cùng lệnh phía trên; rủi ro thấp, không cần mở việc.
  file: `packages/api/test-db/bang-quyen-theo-vai/bang-quyen.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
