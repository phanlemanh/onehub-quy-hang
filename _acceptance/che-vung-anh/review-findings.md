# Review findings: che-vung-anh (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trình che là ô ghép mới (bậc 6–7) nhưng không có dòng «Chỗ hở» trong vo-va-ia.md §3, nên bỏ qua được bước Ba lối**
  Người dùng thấy gì: Màn che vùng ảnh chạy bình thường với người dùng. Chỉ là sổ thiết kế chưa ghi lại việc màn này được ghép từ thành phần có sẵn và tự viết thêm.
  Căn cứ: Người dùng không thấy khác biệt nào và không mất dữ liệu; ghi bổ sung vào sổ thiết kế sau lúc nào cũng được, chi phí thấp.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: medium
  Đề xuất: known-limits

- **Partial failure (copy uploaded, original still shareable) leaves the dialog open with Save enabled, so retrying uploads another redacted copy and the photo list never refreshes**
  Người dùng thấy gì: Nếu bản che đã lưu mà ảnh gốc chưa chuyển được sang Nội bộ, màn vẫn mở và danh sách ảnh không cập nhật. Bấm Lưu lần nữa sẽ tạo thêm một bản che trùng, và ảnh gốc vẫn còn ở ngăn Gửi được cho tới khi người dùng tự chuyển.
  Căn cứ: Hiếm khi xảy ra và không lộ dữ liệu ra ngoài vì có báo lỗi dặn chuyển tay; người dùng tự xoá bản trùng và tải lại trang được.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: medium
  Đề xuất: known-limits

- **The editor dialog is held to sm:max-w-sm, so the canvas (up to 960px) spills out of the dialog on desktop**
  Người dùng thấy gì: Trên máy tính, ảnh trong màn che vùng tràn ra ngoài khung hộp thoại và đè lên cả hàng nút. Người dùng khó thao tác hoặc khó thấy nút Lưu.
  Căn cứ: Ảnh hưởng mọi lần dùng trên máy tính nhưng không mất dữ liệu; làm lại lần sau được và sửa rẻ nên nên xếp việc riêng sớm.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: medium
  Đề xuất: new-contract

- **Redrawing does not clear the canvas: on PNGs with transparency, an undone box stays visible**
  Người dùng thấy gì: Với ảnh PNG có vùng trong suốt, khung đen đã bỏ vẫn hiện trên màn xem trước. Người dùng thấy như đang che nhưng bản lưu thì không che vùng đó.
  Căn cứ: Bản lưu vẫn đúng và ảnh PNG có vùng trong suốt hiếm với ảnh căn; người dùng xem lại ảnh sau khi lưu là phát hiện được.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: low
  Đề xuất: known-limits

- **The ImageBitmap of the original is never closed when the dialog closes**
  Người dùng thấy gì: Mỗi lần mở rồi đóng màn che, ảnh gốc đã giải mã còn chiếm bộ nhớ trình duyệt tới khi được dọn. Che nhiều ảnh liên tiếp có thể làm máy chậm.
  Căn cứ: Không mất dữ liệu, tải lại trang là hết, và trình duyệt tự dọn dần nên hậu quả nhẹ.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 2 — fixture viết tay đúng khuôn bên đọc: ô E1 «ảnh dọc theo EXIF» đưa sẵn cỡ đã xoay, không đi qua bước xoay**
  Người dùng thấy gì: Bài kiểm tự động chưa chứng minh được ảnh chụp dọc từ điện thoại được che đúng vị trí. Nếu lỗi xoay xuất hiện thì bài vẫn xanh, và chỉ mắt người xem mới thấy.
  Căn cứ: Chưa thấy lỗi thật, chỉ là lưới kiểm thiếu một mắt; bài nhìn bằng mắt vẫn bắt được và bổ sung bài kiểm sau rẻ.
  file: `apps/web/src/app/(app)/units/photos/redact/vung.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

(không có)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
