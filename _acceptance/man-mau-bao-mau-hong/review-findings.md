## Trong hợp đồng

Không có finding nào map vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Phép kiểm 'không có tiêu đề báo hỏng' trong bài đo 'không chỗ hỏng thì không báo' luôn đúng nên không đo gì**
  Người dùng thấy gì: Một nửa phép kiểm của bài 'không có chỗ hỏng thì không hiện báo' không bắt được lỗi. Người dùng không bị ảnh hưởng, vì hai phép kiểm còn lại vẫn chặn được ca chính.
  Căn cứ: Màn hình đang đúng và hai phép kiểm còn lại đã che đúng ca quan trọng, nên rủi ro cho người dùng rất thấp và có thể bỏ qua.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình, không đối chứng dương trên đầu ra): bài rò rỉ mới không kiểm khối báo có thật sự hiện**
  Người dùng thấy gì: Bài kiểm tra rò rỉ cho khối báo mẫu hỏng có thể vẫn xanh dù khối báo không hiện, nên có thể không đo gì. Hiện chưa có thông tin nội bộ nào bị lộ ra.
  Căn cứ: Không làm mất hay lộ dữ liệu của người dùng hiện tại, nhưng bài kiểm tra bảo vệ phần nội bộ mà yếu đi thì lỗi rò rỉ sau này có thể lọt qua; nên ghi lại để lần sau siết.
  file: `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (dữ liệu thử viết tay theo đúng khuôn bên đọc): 5/14 dòng của bảng lý do bỏ mẫu là chuỗi lỗi chép tay**
  Người dùng thấy gì: Nếu sau này lõi đổi lời lỗi, năm lý do bỏ mẫu có thể rơi về câu chung mà bài kiểm tra vẫn xanh. Hiện người dùng vẫn thấy lời báo đúng.
  Căn cứ: Chưa gây sai gì cho người dùng, chỉ làm bài kiểm tra kém nhạy khi lõi đổi chữ; sửa sau vẫn rẻ nên ghi lại là đủ.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (khẳng định âm một mình): ca rò rỉ của khối báo hỏng không bao giờ có thể đỏ (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm rò rỉ cho khối báo mẫu hỏng hiện không thể phát hiện nếu sau này câu báo vô tình chép nội dung nội bộ của căn. Hôm nay màn vẫn đúng, nhưng lưới an toàn ở chỗ này mỏng hơn vẻ ngoài.
  Căn cứ: Chưa có lỗi nào xảy ra với người dùng, chỉ là một lưới bảo vệ yếu hơn mức ghi; sửa sau không mất dữ liệu và không đắt.
  file: `apps/web/src/app/(app)/settings/templates/mau-san.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (khẳng định âm một mình): E4 so với một chuỗi viết tay, không ghim vào chữ của khối báo (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này đổi chữ của khối báo, bài kiểm vẫn xanh dù khối báo có thể lại hiện cả khi mẫu không hỏng. Hiện người dùng chưa gặp lỗi nào.
  Căn cứ: Chỉ làm bài kiểm kém nhạy khi có người sửa chữ sau này; không ảnh hưởng người dùng hôm nay và sửa lúc nào cũng rẻ.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên quét cả lớp nhưng chỉ có từng ca): ma trận E3 đếm chỗ gọi loi.push, không đếm các lý do bỏ mẫu hay bỏ kênh (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu về sau lõi thêm một lý do mới khiến mẫu bị bỏ, màn sẽ báo bằng câu chung và không bài kiểm nào nhắc phải viết câu riêng. Người dùng vẫn được báo, chỉ là câu kém rõ.
  Căn cứ: Hậu quả nhẹ vì chỗ hỏng vẫn được báo bằng câu chung, không mất dữ liệu; chỉ phát sinh khi lõi đổi trong tương lai.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (đo chỉ dẫn thay vì đầu ra): E5b kiểm page.tsx bằng cách grep mã nguồn (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận trang có gọi đúng chỗ, không xác nhận kết quả báo hỏng thật sự tới được hai tab. Nếu có lỗi nối dây, bài này không bắt được.
  Căn cứ: Việc nhìn màn thật ở bước nghiệm thu đã bắt lỗi kiểu này, còn dựng bài kiểm đầu-cuối tốn công hơn nhiều so với hậu quả.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình 2 (dữ liệu thử viết tay đúng khuôn bên đọc): đáp GET của E5b do tay dựng, không lấy từ API thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu phía API sau này đổi dạng danh sách chỗ hỏng, màn sẽ im lặng không báo gì mà không bài kiểm nào đỏ. Quản trị khi đó mất lời cảnh báo trước khi lưu.
  Căn cứ: Chỉ xảy ra khi API đổi trong tương lai và có thể thấy ngay khi mở màn; không mất dữ liệu ngay, sửa bằng một bài nối hai phía là vừa.
  file: `apps/web/src/app/(app)/settings/templates/bao-hong.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
