# Review findings: dang-nhap-theo-san (round 1)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Giới hạn xin mã chỉ gác một đường; hai đường quên mật khẩu của plugin vẫn gửi mã không giới hạn**
  Người dùng thấy gì: Người lạ có thể dội nhiều email chứa mã vào hộp thư của bất kỳ thành viên nào của sàn, không bị chặn ở mức 5 lần trong 15 phút như đã hứa với người dùng. Mã nhận được qua đường này còn không đăng nhập được, gây khó hiểu.
  Căn cứ: Không làm lộ dữ liệu nhưng người dùng thật bị quấy rối hộp thư và không tự chặn được, phải nhờ bên vận hành; sửa lúc này còn rẻ vì chỉ là đóng các đường thừa.
  file: `packages/api/src/auth/auth.ts`
  severity: medium
  Đề xuất: new-contract

- **Công cụ mở sàn tìm sàn theo tên (không duy nhất), nên có thể gắn người mới vào nhầm một sàn khác trùng tên**
  Người dùng thấy gì: Khi mở sàn cho một công ty mới có tên trùng với sàn đang chạy, người mới bị gắn nhầm vào sàn cũ và nhìn thấy dữ liệu của công ty khác mà công cụ vẫn báo thành công.
  Căn cứ: Hậu quả nặng vì lộ dữ liệu giữa hai công ty và người dùng không tự phát hiện hay gỡ được, nhưng chỉ xảy ra khi đội vận hành mở sàn bằng tay, nên sửa bằng một việc riêng là hợp lý.
  file: `packages/db/scripts/mo-san.mjs`
  severity: medium
  Đề xuất: new-contract

- **Giới hạn xin mã đếm rồi mới ghi, không nguyên tử, nên không đúng như comment «đúng cả khi chạy nhiều máy chủ»**
  Người dùng thấy gì: Nếu gửi nhiều lời xin mã cùng một lúc, một email có thể nhận nhiều hơn 5 mã trong 15 phút.
  Căn cứ: Chỉ vượt trần vài mã trong tình huống gửi dồn có chủ ý, không làm lộ dữ liệu, nên ghi lại là hạn chế đã biết.
  file: `packages/api/src/auth/otp-limit.ts`
  severity: low
  Đề xuất: known-limits

- **Bí mật và chuỗi kết nối được ghi thẳng vào tệp có theo dõi .claude/launch.json, vòng qua quy ước chỉ để ở .env.local**
  Người dùng thấy gì: Một khoá và chuỗi kết nối của môi trường thử đang nằm trong tệp dùng chung của kho, trái với quy ước chỉ để ở tệp riêng của từng máy.
  Căn cứ: Đó chỉ là giá trị thử trên máy cục bộ nên không lộ gì thật với người dùng, nhưng cần ghi lại để không thành tiền lệ.
  file: `.claude/launch.json`
  severity: low
  Đề xuất: known-limits

- **Giới hạn 5 lần xin mã / 15 phút bị lách qua các đường gửi mã khác của plugin emailOTP**
  Người dùng thấy gì: Ai cũng có thể bắt hệ thống gửi mã vào email của thành viên sàn nhiều hơn mức đã hứa, và mã gửi theo đường này lại không dùng để đăng nhập được, nên người nhận thấy báo «Mã không đúng».
  Căn cứ: Gây phiền và khó hiểu cho người dùng thật, không lộ dữ liệu, người dùng không tự chặn được; sửa rẻ vì chỉ đóng các đường thừa.
  file: `packages/api/src/auth/auth.ts`
  severity: medium
  Đề xuất: new-contract

- **Giới hạn xin mã đếm rồi mới ghi, không nguyên tử: gửi đồng thời là vượt giới hạn**
  Người dùng thấy gì: Gửi nhiều lời xin mã song song cho cùng một email có thể qua mặt mức tối đa 5 lần trong 15 phút.
  Căn cứ: Chỉ vượt nhẹ và cần chủ ý gửi dồn, không mất hay lộ dữ liệu, nên chấp nhận và ghi lại.
  file: `packages/api/src/auth/otp-limit.ts`
  severity: low
  Đề xuất: known-limits

- **readMe coi mọi phản hồi khác 200 (kể cả lỗi 500 của cơ sở dữ liệu) là chưa đăng nhập**
  Người dùng thấy gì: Khi máy chủ hay cơ sở dữ liệu gặp sự cố, người đang đăng nhập bị đưa về màn đăng nhập như thể phiên đã hết, thay vì thấy thông báo lỗi.
  Căn cứ: Gây hiểu nhầm nhưng không mất dữ liệu, người dùng thử lại hay chờ máy chủ phục hồi là xong.
  file: `apps/web/src/lib/api.ts`
  severity: medium
  Đề xuất: known-limits

- **Chọn sàn thất bại thì im lặng: nút không làm gì, không có thông báo**
  Người dùng thấy gì: Khi chọn sàn không thành công, ví dụ vừa bị bỏ khỏi sàn hoặc mất mạng, bấm tên sàn không có phản ứng gì và không có lời giải thích.
  Căn cứ: Chỉ gây bối rối nhất thời, không lộ hay mất dữ liệu, người dùng tải lại hoặc đăng nhập lại là gỡ được.
  file: `apps/web/src/app/(auth)/chon-san/danh-sach.tsx`
  severity: low
  Đề xuất: known-limits

- **Form đăng nhập nuốt lỗi mạng: fetch bị từ chối thì không hiện thông báo nào**
  Người dùng thấy gì: Khi mất mạng lúc bấm «Gửi mã» hoặc «Vào», nút sáng lại mà không có thông báo, người dùng không biết vì sao chưa vào được.
  Căn cứ: Chỉ gây khó hiểu nhất thời, người dùng thử lại khi có mạng là được, không có rủi ro dữ liệu.
  file: `apps/web/src/app/(auth)/dang-nhap/form.tsx`
  severity: low
  Đề xuất: known-limits

- **Mở sàn tìm sàn theo tên: sàn mới trùng tên bị gộp lặng lẽ vào sàn đã có, người mới thấy dữ liệu của công ty khác**
  Người dùng thấy gì: Mở sàn cho khách mới trùng tên với sàn đang có sẽ gộp người mới vào sàn cũ, và họ đọc được dữ liệu của công ty khác mà không có cảnh báo.
  Căn cứ: Hậu quả nặng vì lộ dữ liệu giữa các công ty và người dùng không tự phát hiện được, nhưng chỉ xảy ra ở thao tác vận hành bằng tay nên nên sửa bằng việc riêng.
  file: `packages/db/scripts/mo-san.mjs`
  severity: medium
  Đề xuất: new-contract

- **moSan ghi là dùng được ngoài giao dịch nhưng SAVEPOINT ngoài giao dịch luôn lỗi**
  Người dùng thấy gì: Công cụ mở sàn nếu được gọi theo cách tài liệu cho phép thì luôn báo lỗi, và lúc lỗi nặng hơn có thể che mất nguyên nhân gốc.
  Căn cứ: Chỉ ảnh hưởng người vận hành khi gọi công cụ theo cách không dùng thường ngày, không đụng dữ liệu người dùng, và lỗi hiện ngay nên dễ nhận ra.
  file: `packages/db/scripts/mo-san.mjs`
  severity: low
  Đề xuất: known-limits

- **Gia hạn phiên không tới được trình duyệt: getSession bỏ mất Set-Cookie nên phiên vẫn hết sau 7 ngày dù đang dùng**
  Người dùng thấy gì: Người dùng hằng ngày vẫn bị đăng xuất sau đúng 7 ngày kể từ lần đăng nhập, dù vẫn đang dùng.
  Căn cứ: Chỉ buộc đăng nhập lại bằng mã, không mất hay lộ dữ liệu, và 7 ngày là mức chấp nhận được lúc này.
  file: `packages/api/src/app.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính đứng một mình, không ghim thông điệp): ba ca 'không mở phiên' chỉ kiểm khác 200**
  Người dùng thấy gì: Bài kiểm tự động chưa chắc bắt được trường hợp máy chủ trả sai loại lỗi khi nhập mã sai hoặc hết hạn, nên màn đăng nhập có thể hiện sai chữ mà bài kiểm vẫn xanh.
  Căn cứ: Điều đã hứa là không mở phiên vẫn được giữ; rủi ro chỉ là sót lỗi chữ trên màn, nhẹ và bổ sung bài kiểm sau cũng rẻ.
  file: `packages/api/test-db/auth.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP mà chỉ có điểm-case): đối chứng đỏ của bộ quét một cửa chỉ cắm một trong bốn dạng vi phạm**
  Người dùng thấy gì: Bộ kiểm tra tự động bảo đảm mọi truy vấn đi qua một cửa có thể bỏ sót vài cách viết lách luật, nên sau này ai đó viết truy vấn lệch cửa thì kiểm tra vẫn xanh.
  Căn cứ: Hiện chưa có vi phạm nào, rủi ro chỉ xảy ra khi có người viết lệch trong tương lai, nên ghi lại và củng cố khi mở rộng.
  file: `packages/api/src/one-door.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert 'có mặt' trong khi lời hứa là quan hệ): `select distinct company_id` không phân biệt được 'thấy mọi thành viên của A' với 'chỉ thấy dòng của mình'**
  Người dùng thấy gì: Bài kiểm cách ly chưa chứng minh được rằng người trong sàn thấy đủ các thành viên khác của sàn mình, nên một lỗi làm họ chỉ thấy chính mình có thể lọt qua.
  Căn cứ: Không làm lộ dữ liệu giữa công ty, chỉ có thể làm danh sách thành viên thiếu và lỗi này lộ ra ngay khi dùng, nên bổ sung bài kiểm là việc nhỏ về sau.
  file: `packages/db/tests/isolation.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét LỚP nhưng danh sách viết tay): bộ ghi thời chạy chỉ ghi ba tên bảng gõ cứng, không lấy từ schema public**
  Người dùng thấy gì: Khi sau này thêm bảng mới, bài kiểm tự động theo dõi truy vấn sẽ không tự biết đến bảng đó, nên truy vấn lệch cửa vào bảng mới có thể không bị bắt.
  Căn cứ: Hiện chưa có bảng nào bị sót nên chưa ảnh hưởng người dùng; chỉ cần nhớ cập nhật khi thêm bảng, rẻ và làm được lúc đó.
  file: `packages/api/test-db/helpers.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/16 lỗi rơi vào file không bộ đo nào phủ (.claude/launch.json, packages/api/test-db/auth.test.ts, packages/api/test-db/helpers.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
