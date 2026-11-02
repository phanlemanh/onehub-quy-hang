# Review findings: goi-ep-gia-dot-hai (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ghi qua nút «Ghi» ở hộp hỏi lại hạ giá báo «Đã ghi» thiếu điều kiện phí, lệch với khi ghi bằng phím Enter**
  Người dùng thấy gì: Khi đổi điều kiện phí và bấm chuột vào nút Ghi, câu báo «Đã ghi» chỉ nêu giá mới mà không nêu điều kiện phí vừa đổi; bấm Enter thì có nêu. Việc ghi vẫn đúng, chỉ câu báo thiếu chi tiết.
  Căn cứ: Chỉ lệch chữ ở câu báo, dữ liệu ghi đúng, không mất gì; người dùng vẫn xem lại được trong lịch sử trả giá.
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx`
  severity: low
  Đề xuất: known-limits

- **docMaLead ở nguon.ts thành mã chết, và luật nhận dạng mã bị chép thành bản thứ hai ở dau-man.ts**
  Người dùng thấy gì: Người dùng không thấy gì khác: màn hình chạy đúng. Chỉ là về sau sửa luật nhận dạng mã ở một nơi có thể quên nơi kia.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không mất dữ liệu; rủi ro chỉ là lệch luật trong tương lai, dọn lúc nào cũng được.
  file: `apps/web/src/app/(app)/units/call/push/dau-man.ts`
  severity: low
  Đề xuất: wont-fix

- **Server errors on the floor-price read hide the block as if the user had no permission**
  Người dùng thấy gì: Nếu máy chủ lỗi hoặc phiên hết hạn lúc đang gọi, đầu chủ có quyền vẫn không thấy khối giá đáy và không có dấu hiệu nào báo tải hỏng, giống hệt người không có quyền xem.
  Căn cứ: Gặp ở tình huống lỗi hiếm, không mất dữ liệu, tải lại trang là có lại; nhưng có thể khiến đầu chủ gọi mà không có giá đáy trong tay nên nên ghi rõ.
  file: `apps/web/src/app/(app)/units/call/push/gia-day.ts`
  severity: medium
  Đề xuất: known-limits

- **Price history stays on «Đang tải lịch sử…» forever when the background pull fails**
  Người dùng thấy gì: Nếu lịch sử trả giá chưa có trên máy mà lúc kéo bị mất mạng hay máy chủ lỗi, khối lịch sử cứ báo «Đang tải» mãi, không báo lỗi và không có nút thử lại.
  Căn cứ: Chỉ xảy ra khi chưa có bản lưu trên máy cùng lúc gặp lỗi mạng; không mất dữ liệu và mở lại trang khi có mạng thường khỏi, nên ghi nhận là hạn chế đã biết.
  file: `apps/web/src/app/(app)/units/call/push/ep-gia.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: kiểm âm tính một mình, không có đối chứng dương. Lời hứa «không chạm bộ nhớ trình duyệt» được đo bằng môi trường chạy, không đo hàm.**
  Người dùng thấy gì: Bài kiểm khẳng định giá đáy không bị lưu vào bộ nhớ trình duyệt chưa chứng minh chắc điều đó, nên nếu sau này ai lỡ lưu giá đáy lên máy thì bài kiểm có thể không bắt được.
  Căn cứ: Hiện chưa có lỗi thật với người dùng, nhưng giá đáy là thông tin nhạy cảm nên lưới bắt lỗi yếu đáng ghi lại; sửa bài kiểm rẻ.
  file: `apps/web/src/app/(app)/units/call/push/gia-day.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: ma trận nêu ca 403/404 nhưng chỉ có điểm 403**
  Người dùng thấy gì: Trường hợp căn không tìm thấy khi đọc giá đáy chưa có bài kiểm riêng, nên nếu hành vi này hỏng thì không được báo sớm.
  Căn cứ: Khoảng trống kiểm thử nhỏ, không ảnh hưởng người dùng hiện tại; thêm một ca là xong nên ghi nhận.
  file: `apps/web/src/app/(app)/units/call/push/gia-day.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: cột «đã xác nhận với chủ» của bảng 7 dòng chỉ được kiểm ở 2 điểm**
  Người dùng thấy gì: Nhãn «đã xác nhận với chủ» trong lịch sử trả giá chỉ được kiểm tự động ở vài dòng, nên nếu gắn nhầm nhãn ở các dòng còn lại thì bài kiểm vẫn xanh.
  Căn cứ: Hiện chưa có lỗi thật, chỉ là lưới bắt lỗi thưa; nếu nhãn sai người dùng chỉ hiểu nhầm lịch sử chứ không mất dữ liệu.
  file: `apps/web/src/app/(app)/units/call/push/lich-su.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Không có.

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
