# Review findings: du-lieu-mau-san-thu (round 4)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ quét số mới cộng dồn chữ số của cả chuỗi, nên một ghi chú thường có nhiều con số nhỏ bị báo là số điện thoại**
  Người dùng thấy gì: Nếu sau này ai thêm vào dữ liệu mẫu một ghi chú dài có nhiều con số nhỏ (giá, diện tích, tầng), bài kiểm có thể báo nhầm là có số điện thoại sai dạng. Dữ liệu hiện tại không bị ảnh hưởng, người làm chỉ phải rút gọn ghi chú hoặc chỉnh bộ quét.
  Căn cứ: Hậu quả nhẹ: chỉ gây báo đỏ giả cho đội dựng, không làm mất hay lộ dữ liệu, dữ liệu hiện nay vẫn xanh và người làm tự gỡ được ngay khi gặp.
  file: `packages/db/seed/du-lieu-mau.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: assertion âm tính một mình, đối chứng dương của ma trận dấu nối bị thay bằng phép «hoặc»**
  Người dùng thấy gì: Bài kiểm các kiểu dấu nối trong số điện thoại mẫu hiện chưa bắt được trường hợp bộ quét báo nhầm số mẫu hợp lệ viết bằng dấu nối lạ. Nếu bộ quét sau này quá khắt khe, bài kiểm vẫn xanh nên đội có thể không biết.
  Căn cứ: Hậu quả nhẹ: chỉ là lỗ hổng trong độ chặt của bài kiểm, không ảnh hưởng dữ liệu hay người dùng, và bổ sung thêm ca thử sau này rất rẻ.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Test thêm số có dạng số di động Việt Nam thật, trái luật dữ liệu cá nhân (r3 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử dùng vài dãy số trông như số di động thật để chứng minh bộ quét báo đỏ. Có rất ít khả năng trùng một thuê bao thật và không số nào hiện ra cho khách hay người dùng.
  Căn cứ: Hậu quả nhẹ: chỉ nằm trong bài thử nội bộ, không lộ ra ngoài, không mất dữ liệu; đổi sang dãy số giả thì rẻ nhưng lợi ích rất nhỏ.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): bộ quét hứa bắt số nối bằng gạch và ngoặc nhưng bài kiểm không có ca nào cho hai dạng đó (r2 · tệp đã đổi)**
  Người dùng thấy gì: Hiện bộ quét vẫn bắt được số nối bằng gạch và ngoặc. Nhưng nếu sau này ai đó vô tình làm nó bỏ qua hai dạng này thì bài kiểm không báo, và số thật có thể lọt vào dữ liệu mẫu mà không ai biết.
  Căn cứ: Hiện chưa có hậu quả nào với người dùng vì bộ quét đang chạy đúng; rủi ro chỉ xuất hiện khi có thay đổi sau này, và thêm ca kiểm sau này rẻ, không mất dữ liệu.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lệnh nạp và xoá báo «xem .env.example» nhưng không tự đọc .env.local như công cụ vận hành cùng loại (r1)**
  Người dùng thấy gì: Người dựng sàn thử ghi địa chỉ cơ sở dữ liệu vào tệp cấu hình theo lời nhắc nhưng lệnh nạp vẫn báo thiếu, nên phải tự khai báo biến đó trước khi chạy.
  Căn cứ: Chỉ gây vướng lúc chạy lần đầu, không mất hay lộ dữ liệu, người dùng tự khắc phục được ngay bằng cách khai báo biến rồi chạy lại, và sửa sau rất rẻ.
  file: `packages/db/seed/nap.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): hai luật lead ở AC-5 không có ca phá thử nào (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm không chứng minh được rằng nó sẽ báo lỗi khi dữ liệu mẫu thiếu lead trên căn đã có hàng mở hoặc thiếu lead mang số chủ nhà đã có, nên sau này dữ liệu hỏng có thể vẫn qua.
  Căn cứ: Dữ liệu mẫu hiện tại đúng và chỉ là dữ liệu giả cho sàn thử, nên không ảnh hưởng người dùng thật; rủi ro chỉ ở lần sửa sau, và bổ sung ca thử sau rất rẻ.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có một điểm): AC-4 hứa kiểm toà, tầng, trục nhưng chỉ phá tầng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm mới chứng minh được việc bắt lỗi lệch tầng, chưa chứng minh bắt được lỗi lệch toà hay lệch trục của căn trong dữ liệu mẫu.
  Căn cứ: Dữ liệu mẫu hiện đúng, không có hại cho người dùng và chỉ là dữ liệu giả; thêm ca thử cho toà và trục sau rất rẻ.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
