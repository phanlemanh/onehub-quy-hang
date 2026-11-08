## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hàm dựng không kiểm thoả thuận có thuộc đúng sàn của sự kiện không**
  Người dùng thấy gì: Hiện chưa có đường chảy thật, nhưng về nguyên tắc một thoả thuận của sàn này có thể bị dùng để dựng sự kiện mang mã mờ của sàn khác. Dữ liệu chủ nhà vẫn không lộ, chỉ là nhãn sàn có thể sai.
  Căn cứ: Chưa có luồng nào gọi hàm này nên chưa ai bị ảnh hưởng, không lộ thông tin chủ nhà, và có thể bổ sung kiểm tra khi dựng đường chảy ở hàng sau.
  file: `packages/core/src/confirmation/dung.ts`
  severity: medium
  Đề xuất: known-limits

- **Khuôn zod chép lại hằng của lõi dù khuon.ts nói là «nguồn DUY NHẤT, không chép»**
  Người dùng thấy gì: Nếu sau này đổi giới hạn ở một bên mà quên bên kia, sàn có thể phát ra sự kiện mà bên nhận từ chối, hoặc ngược lại. Hiện hai bên đang khớp nhau.
  Căn cứ: Hiện không ai gặp lỗi, hậu quả nếu có chỉ là sự kiện bị từ chối và thử lại được, không mất hay lộ dữ liệu; ghi lại để nhớ khi đổi giới hạn.
  file: `packages/connect/src/catalog-confirmation.ts`
  severity: medium
  Đề xuất: known-limits

- **Bài kiểm cấm mọi migration sau 040 đụng agreements_kind_check, nên chặn luôn cách thêm loại kết nối đang dùng**
  Người dùng thấy gì: Lần sau khi thêm một loại kết nối mới, bài kiểm này sẽ báo đỏ và người làm phải chỉnh nó. Người dùng cuối không thấy gì.
  Căn cứ: Chỉ gây thêm một bước chỉnh cho người làm lần sau, không ảnh hưởng người dùng hay dữ liệu, và bài kiểm đỏ là tín hiệu rõ ràng nên tự phát hiện ngay.
  file: `packages/db/tests/xac-nhan-danh-muc.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Loại kết nối mới chưa có trong CONTEXT.md; nhãn giao diện viết cứng trong lõi**
  Người dùng thấy gì: Tên hiển thị của loại kết nối «Xác nhận danh mục» chưa nằm trong bảng từ vựng chung, nên tài liệu và giao diện có thể gọi lệch nhau về sau.
  Căn cứ: Chỉ là lệch tài liệu, người dùng không bị ảnh hưởng, và bổ sung một dòng từ vựng sau rất rẻ.
  file: `packages/core/src/agreements.ts`
  severity: low
  Đề xuất: known-limits

- **dungBaoSai never checks the UPI format, so the core can build a correction event that the shared schema rejects**
  Người dùng thấy gì: Nếu danh mục có một căn mang mã chứa ký tự lạ, sàn thấy báo sai được chấp nhận nhưng bên nhận sẽ từ chối, nên báo sai đó không bao giờ tới nơi.
  Căn cứ: Chỉ xảy ra với mã căn bất thường, không lộ dữ liệu, nhưng báo sai im lặng thất lạc là lỗi khó thấy nên nên sửa trong một việc riêng.
  file: `packages/core/src/confirmation/dung.ts`
  severity: medium
  Đề xuất: new-contract

- **The date check on `today` accepts dates that do not exist, and observedOn goes out as an invalid date**
  Người dùng thấy gì: Một ngày không có thật như 31 tháng 11 có thể lọt vào sự kiện nếu ngày đưa vào sai. Thực tế ngày này do máy chủ cấp nên hiếm khi gặp.
  Căn cứ: Ngày lấy từ đồng hồ máy chủ nên gần như không xảy ra, hậu quả chỉ là một mốc ngày sai trong sự kiện, không lộ dữ liệu.
  file: `packages/core/src/confirmation/dung.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình: phép quét rò rỉ trên sự kiện dựng từ căn mồi không bao giờ đỏ được**
  Người dùng thấy gì: Bài kiểm kiểm tra rò rỉ không thực sự thử được việc hàm dựng làm rò, nên nếu sau này sửa hàm dựng sai thì bài này không báo. Việc chặn hiện vẫn hoạt động nhờ ca từ chối khoá lạ.
  Căn cứ: Hiện dữ liệu chủ nhà chưa lộ vì lớp chặn khác còn đứng, nhưng lưới an toàn thứ hai đang rỗng nên nên làm chắc trước khi có đường chảy thật.
  file: `packages/core/src/confirmation/dung.test.ts`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 — tuyên quét cả lớp «mọi chuỗi không chữ tự do» nhưng chỉ có năm ca điểm; phép quét cấu trúc chỉ đo «có regex», không đo regex có chặn chữ tự do**
  Người dùng thấy gì: Mã toà hay mã căn vẫn có thể chứa một dãy số trông như số điện thoại và được nhận. Bài kiểm chỉ thử một phần các trường nên khó phát hiện lỗ hổng kiểu này.
  Căn cứ: Mẫu hiện chỉ cho ký tự chữ-số nên khả năng lộ số điện thoại thật thấp, nhưng phủ kiểm tra đầy đủ rẻ và nên làm trước khi mở luồng thật.
  file: `packages/connect/src/catalog-confirmation.test.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
