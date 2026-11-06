## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Rào «ảnh chỉ lên đúng sàn lúc chụp» (bất biến 2) chỉ có ở phía máy, không có ở biên API**
  Người dùng thấy gì: Nếu một người mở hai tab và đổi sang sàn khác ở một tab, ảnh chụp ở tab còn lại có thể lên nhầm căn của sàn kia, kể cả ảnh giấy tờ chủ nhà.
  Căn cứ: Hậu quả nặng vì ảnh nội bộ có thể sang sàn khác và không tự gỡ lại được, nhưng chỉ xảy ra khi đổi sàn bằng nhiều tab; sửa ở máy chủ nên cần một hợp đồng riêng.
  file: `apps/web/src/app/(app)/units/photos/nguon-api.ts`
  severity: high
  Đề xuất: new-contract

- **Từ lúc đối chiếu danh sách tới lúc gửi lại, máy không kiểm lại sàn**
  Người dùng thấy gì: Nếu người đổi sàn đúng lúc máy đang đối chiếu ảnh chờ, ảnh của sàn cũ có thể bị đẩy lên căn trùng tên ở sàn mới.
  Căn cứ: Khoảng thời gian rất hẹp nên hiếm gặp, nhưng nếu xảy ra thì ảnh lên nhầm sàn và không tự gỡ; cùng gốc với lỗi biên máy chủ nên sửa chung một đợt sẽ rẻ hơn.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.ts`
  severity: medium
  Đề xuất: new-contract

- **Hàng chờ ảnh dùng sàn trên máy, còn máy chủ ghi theo sàn trong cookie; hai bên lệch nhau thì ảnh của sàn A vẫn lên sàn B (bất biến 2)**
  Người dùng thấy gì: Khi người dùng nhiều sàn đổi sàn ở một cửa sổ, cửa sổ khác vẫn đang gửi ảnh chờ của sàn cũ và ảnh có thể rơi vào căn của sàn mới, kể cả ảnh giấy tờ chủ nhà.
  Căn cứ: Có thể lộ thông tin chủ nhà sang sàn khác và người dùng không tự gỡ được, nhưng cần người dùng nhiều sàn và nhiều cửa sổ cùng lúc; sửa phải đổi cả máy chủ nên làm riêng.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-may.ts`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 1 — đo chữ trong mã nguồn thay vì đo hành vi: bài «vỏ truyền sàn của phiên cho hàng chờ» chỉ grep chuỗi**
  Người dùng thấy gì: Bài kiểm tự động về việc đổi sàn chỉ soi chữ trong mã chứ không chạy thật, nên nếu sau này ai làm hỏng việc đổi sàn thì bài kiểm vẫn xanh.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm giảm độ tin của lưới kiểm về sau; ghi lại là đủ cho tới khi làm việc đổi sàn.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

