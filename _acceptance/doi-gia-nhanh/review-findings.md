# Review findings: doi-gia-nhanh (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ngăn sửa nhanh bỏ qua bước xác nhận cho thay đổi không hoàn tác được (Đã bán / Ngừng bán), lệch với cách ô Bảng hàng đang làm**
  Người dùng thấy gì: Trên điện thoại, chạm «Đã bán» hoặc «Ngừng bán» rồi «Lưu» là ghi luôn, không hỏi lại và không có nút hoàn tác như trên Bảng hàng. Bấm nhầm thì không đảo lại được.
  Căn cứ: Hậu quả có thể nặng vì thay đổi không đảo được và người dùng không tự gỡ được, nhưng bước chọn Đã bán đã đòi giá chốt và ngày nên khó bấm nhầm; thêm bước hỏi lại là việc nhỏ, đáng làm trong một hợp đồng riêng.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.ts`
  severity: medium
  Đề xuất: new-contract

- **Ngăn sửa nhanh không hiện dòng «Tính là vừa xác nhận với chủ nhà» như ô Bảng hàng**
  Người dùng thấy gì: Người sửa trên điện thoại không được báo rằng lần sửa đã tính là vừa xác nhận với chủ nhà. Dữ liệu vẫn ghi đúng, chỉ thiếu lời nhắc.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, mốc xác nhận vẫn được làm mới, chỉ thiếu thông tin cho người dùng; ghi vào hạn chế đã biết là đủ.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/ngan-sua-nhanh.tsx`
  severity: low
  Đề xuất: known-limits

- **Phone quick-edit sheets save changes that cannot be undone without the warning the inventory editor shows**
  Người dùng thấy gì: Lưu ở ngăn «Đổi trạng thái» có thể ghi ngay Đã bán, Ngừng bán hoặc đặt giá lần đầu mà không cảnh báo, và trên điện thoại không có nút hoàn tác. Bấm nhầm sẽ để lại thay đổi không đảo được.
  Căn cứ: Người dùng không tự gỡ được thay đổi đã ghi, nên hậu quả đáng kể với dữ liệu căn; sửa rẻ vì chỉ thêm một bước hỏi, hợp làm cùng việc ở finding cùng gốc.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — E4 nói quét đủ ma trận 6 trạng thái × có/không cờ nhưng chỉ khẳng định ở một nửa số ô, và chỉ khẳng định chiều âm**
  Người dùng thấy gì: Bộ kiểm tự động chỉ xác nhận một nửa các tổ hợp trạng thái và quyền. Nếu danh sách nấc hiển thị sai ở các tổ hợp còn lại thì kiểm tự động chưa bắt được.
  Căn cứ: Người dùng không gặp lỗi trực tiếp, chỉ là lưới an toàn mỏng hơn lời hứa; bổ sung kiểm sau này rẻ và không gấp.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 — E6 chỉ kiểm dòng «Đổi giá» có mặt, không kiểm quan hệ giá cũ → giá mới**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận Lịch sử có dòng đổi giá, chưa xác nhận giá cũ và giá mới ghi đúng chiều. Nếu dòng hiện sai số thì kiểm tự động không báo.
  Căn cứ: Chưa có bằng chứng người dùng thấy sai; rủi ro chỉ là lỗi hiển thị trong tương lai lọt qua kiểm, và người dùng tự thấy được qua Lịch sử.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — E6 viết tay sự kiện status_changed vào kho của máy chủ giả, không đi qua đường ghi**
  Người dùng thấy gì: Bài kiểm Lịch sử cho đổi trạng thái dùng sự kiện dựng tay nên chưa chứng minh được đường ghi thật sinh ra dòng đúng. Người dùng chưa thấy lỗi nào.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng; chỉ làm giảm độ tin của bài kiểm, và có thể bù bằng ảnh chụp trên bản chạy thật.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — ca lỗi của E2/E4 bị gộp thành nhãn «lỗi», không ghim lý do**
  Người dùng thấy gì: Các ca từ chối chỉ được kiểm là bị từ chối, chưa kiểm đúng lý do. Nếu lý do hiện cho người dùng sai thì kiểm tự động chưa bắt được.
  Căn cứ: Không có lỗi người dùng được chứng minh; người dùng vẫn bị chặn đúng chỗ, chỉ có nguy cơ lời giải thích lệch trong tương lai.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/sua-nhanh.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

