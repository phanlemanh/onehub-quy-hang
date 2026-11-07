# Review findings: man-mau-bao-mau-hong

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình 4 (khẳng định âm một mình): ca rò rỉ của khối báo hỏng không bao giờ có thể đỏ**
  Người dùng thấy gì: Bài kiểm rò rỉ cho khối báo mẫu hỏng hiện không thể phát hiện nếu sau này câu báo vô tình chép nội dung nội bộ của căn. Hôm nay màn vẫn đúng, nhưng lưới an toàn ở chỗ này mỏng hơn vẻ ngoài.
  Căn cứ: Chưa có lỗi nào xảy ra với người dùng, chỉ là một lưới bảo vệ yếu hơn mức ghi; sửa sau không mất dữ liệu và không đắt.
  file: `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (khẳng định âm một mình): E4 so với một chuỗi viết tay, không ghim vào chữ của khối báo**
  Người dùng thấy gì: Nếu sau này đổi chữ của khối báo, bài kiểm vẫn xanh dù khối báo có thể lại hiện cả khi mẫu không hỏng. Hiện người dùng chưa gặp lỗi nào.
  Căn cứ: Chỉ làm bài kiểm kém nhạy khi có người sửa chữ sau này; không ảnh hưởng người dùng hôm nay và sửa lúc nào cũng rẻ.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét cả lớp nhưng chỉ có từng ca): ma trận E3 đếm chỗ gọi loi.push, không đếm các lý do bỏ mẫu hay bỏ kênh**
  Người dùng thấy gì: Nếu về sau lõi thêm một lý do mới khiến mẫu bị bỏ, màn sẽ báo bằng câu chung và không bài kiểm nào nhắc phải viết câu riêng. Người dùng vẫn được báo, chỉ là câu kém rõ.
  Căn cứ: Hậu quả nhẹ vì chỗ hỏng vẫn được báo bằng câu chung, không mất dữ liệu; chỉ phát sinh khi lõi đổi trong tương lai.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (đo chỉ dẫn thay vì đầu ra): E5b kiểm page.tsx bằng cách grep mã nguồn**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận trang có gọi đúng chỗ, không xác nhận kết quả báo hỏng thật sự tới được hai tab. Nếu có lỗi nối dây, bài này không bắt được.
  Căn cứ: Việc nhìn màn thật ở bước nghiệm thu đã bắt lỗi kiểu này, còn dựng bài kiểm đầu-cuối tốn công hơn nhiều so với hậu quả.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình 2 (dữ liệu thử viết tay đúng khuôn bên đọc): đáp GET của E5b do tay dựng, không lấy từ API thật**
  Người dùng thấy gì: Nếu phía API sau này đổi dạng danh sách chỗ hỏng, màn sẽ im lặng không báo gì mà không bài kiểm nào đỏ. Quản trị khi đó mất lời cảnh báo trước khi lưu.
  Căn cứ: Chỉ xảy ra khi API đổi trong tương lai và có thể thấy ngay khi mở màn; không mất dữ liệu ngay, sửa bằng một bài nối hai phía là vừa.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
