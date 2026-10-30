# Review findings: du-lieu-mau-san-thu (round 3)

## Trong hợp đồng

- **Bộ quét số vẫn để lọt số thật nối bằng dấu phẩy, dấu hai chấm, từ 4 khoảng trắng trở lên, hoặc viết bằng chữ số toàn khổ**
  AC: AC-2
  file: `packages/db/seed/du-lieu-mau.mjs:183`
  severity: medium
  source: conventions
  detail: Comment của DAY_SO viết «Không liệt kê từng dấu, để dạng viết mới không lọt», nhưng lớp ký tự `[^\p{L}\d:,;]{0,3}` vẫn loại `, ; :` và chỉ cho tối đa 3 ký tự nối, còn `\d` (kể cả khi có cờ u) chỉ nhận chữ số ASCII. Đã chạy thử quetChuoi: "0912,345,678" → 0 lỗi, "0912:345:678" → 0 lỗi, "0912    345 678" (4 khoảng trắng) → 0 lỗi, "０９１２３４５６７８" → 0 lỗi. Trong khi đó "0912 345 678" → 1 lỗi. Mỗi nhóm số đứng riêng đều ngắn hơn 9 chữ số nên bị bỏ qua. Đây là rào cho bất biến «dữ liệu cá nhân thật không vào kho», nên lời hứa trong comment rộng hơn những gì code thật sự bắt được. Ma trận DAU_NOI ở test (dòng 332) chỉ thử các dấu đã được nhận, không có ca nào chứng minh dấu bị loại trừ vẫn an toàn. Cần làm một trong hai: thu hẹp comment cho đúng phạm vi, hoặc thêm ca đỏ cho các dạng kể trên và xử lý (ví dụ chuẩn hoá NFKC trước khi quét; chỉ ngắt ở «:» khi hai bên là giờ:phút).
  rationale: AC-2 đòi chèn một số khác dạng vào bản sao thì bài quét đỏ; số thật nối bằng dấu phẩy hay hai chấm lại qua mặt được bộ quét.

- **A real phone number written with commas between its digit groups passes the scanner with no error**
  AC: AC-2
  file: `packages/db/seed/du-lieu-mau.mjs:183`
  severity: medium
  source: bugs
  detail: The new DAY_SO regex is /\+?\d(?:[^\p{L}\d:,;]{0,3}\d)*/gu. It treats ',' and ';' as breaks, the same as ':'. A real number grouped with commas is therefore split into short runs of fewer than 9 digits each, and every run is skipped by the `length < 9` check. I ran quetChuoi to confirm: "0912,345,678" and "0912 , 345 678" both return loi=[] and so=0, meaning no error and nothing counted. The same happens with "912,345,678", which is what a phone number looks like after Excel drops the leading 0 and applies thousands separators. Runs of more than 3 separator characters also slip through: "0912 -- 345 -- 678" returns loi=[]. This contradicts what the change says it does ('Không liệt kê từng dấu, để dạng viết mới không lọt'). The new DAU_NOI test matrix does not include ',' or ';', so the gap is not caught. Commas are excluded so that lists like "0900 000 001, 0900 000 002" are not merged into one run, but that list case does not need it: a merged run of two numbers is already flagged as an error because its length is off. Excluding commas buys nothing and lets real data through.
  rationale: Số thật nhóm bằng dấu phẩy không làm bài quét đỏ, trái với AC-2 về việc chèn số khác dạng thì bài quét phải đỏ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Test thêm số có dạng số di động Việt Nam thật, trái luật dữ liệu cá nhân**
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
