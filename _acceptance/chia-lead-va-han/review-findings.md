# Review findings: chia-lead-va-han (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lead có từ trước khi bật nhịp bị đóng dấu ở lần chạy đầu và báo quá hạn ngay**
  Người dùng thấy gì: Khi bật nhịp lần đầu, những lead nhập từ trước mà đã gắn sẵn đầu chủ có thể bị báo quá hạn ngay một loạt cho trưởng nhóm. Hiện bản thật mới chỉ có dữ liệu mẫu nên chưa gây hại thật.
  Căn cứ: Hậu quả nhẹ và chỉ xảy ra một lần lúc bật nhịp, không mất hay lộ dữ liệu, mà môi trường thật hiện chưa có sàn thật nên ghi lại để lưu ý khi triển khai là đủ.
  file: `packages/db/migrations/011_chia_lead_va_han.sql`
  severity: low
  Đề xuất: known-limits

- **Ba hàm ghi chỉ dành cho nhịp nền không kiểm vai trong cơ sở dữ liệu, khác với các hàm cùng loại**
  Người dùng thấy gì: Về lý thuyết, một người dùng của sàn có thể gọi thẳng chức năng chia lead chạy nền để giao lead cho đầu chủ bất kỳ trong sàn mình, nhưng hiện chưa có đường nào của ứng dụng cho phép làm vậy. Lead của sàn khác vẫn không bị chạm tới.
  Căn cứ: Chưa có đường khai thác thật và chỉ ảnh hưởng trong nội bộ một sàn, không lộ dữ liệu ra ngoài; bổ sung lớp chặn thứ hai có thể làm ở một việc riêng sau.
  file: `packages/db/migrations/011_chia_lead_va_han.sql`
  severity: low
  Đề xuất: known-limits

- **Độ dài tối thiểu 32 ký tự của JOB_SECRET chỉ ghi trong .env.example, mã không kiểm**
  Người dùng thấy gì: Nếu người vận hành đặt khoá việc nền quá ngắn thì hệ thống vẫn chấp nhận, nên lối chạy nhịp cho mọi sàn dễ bị đoán khoá hơn.
  Căn cứ: Khoá do chủ kho tự đặt ở bước vận hành và chỉ cần đặt đúng theo hướng dẫn là hết rủi ro, nên ghi lại thành lưu ý vận hành là đủ.
  file: `packages/api/src/jobs/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Lead deadline is rounded to the millisecond in JavaScript and sent back, so the 'already alerted' list never matches leads whose deadline Postgres set**
  Người dùng thấy gì: Trưởng nhóm vẫn chỉ nhận đúng một lời báo cho mỗi lead quá hạn, nhưng mỗi nhịp hệ thống làm thêm việc thừa cho các lead cũ và mốc hạn lưu kèm lời báo lệch chút xíu so với mốc thật.
  Căn cứ: Người dùng không thấy khác biệt nào, chỉ tốn thêm chút công máy mỗi phút, và sửa được sau mà không mất dữ liệu.
  file: `packages/api/src/jobs/lead-tick.ts`
  severity: low
  Đề xuất: known-limits

- **Reassigning a lead lowers the old agent's last routed seq, so that agent jumps ahead in round robin**
  Người dùng thấy gì: Sau khi trưởng nhóm chuyển lead từ đầu chủ này sang đầu chủ khác, người vừa bị lấy lead có thể lại được ưu tiên chia lead tiếp theo, làm vòng chia thiếu công bằng chút ít.
  Căn cứ: Chỉ lệch thứ tự chia trong trường hợp trưởng nhóm giao lại bằng tay, không mất dữ liệu và trưởng nhóm giao lại được; cần quyết định nghiệp vụ về cách tính lượt nên hợp làm việc riêng.
  file: `packages/db/migrations/011_chia_lead_va_han.sql`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 4 (chỉ kiểm chiều âm, không có đối chứng phân biệt): năm dòng 404 trong ca «cách ly: người của B không chạm lead của A» vẫn ra 404 khi bỏ lọc sàn**
  Người dùng thấy gì: Hệ thống hiện vẫn cách ly đúng giữa các sàn, nhưng bài kiểm tự động cho vài thao tác nhận, gọi và nhận từ kho chung chưa chứng minh chắc điều đó nếu sau này ai đó vô tình làm hỏng lớp cách ly.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; hai ca còn lại trong bộ kiểm vẫn đo được cách ly và bài kiểm có thể bổ sung sau, rẻ và an toàn.
  file: `packages/api/test-db/routing.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên phủ cả lớp nhưng ca của lớp không có thật): ca «dấu tổ hợp» trùng hệt ca dựng sẵn, nhánh normalize("NFC") không được đo**
  Người dùng thấy gì: Việc khớp tên toà có dấu viết theo hai kiểu gõ khác nhau chưa được bài kiểm tự động chứng minh, nên nếu sau này mất bước chuẩn hoá thì không ai biết ngay.
  Căn cứ: Hiện chưa thấy lỗi thật với người dùng, chỉ thiếu lưới an toàn của bài kiểm; thêm ca kiểm sau rất rẻ và không mất dữ liệu.
  file: `packages/core/src/routing/routing.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
