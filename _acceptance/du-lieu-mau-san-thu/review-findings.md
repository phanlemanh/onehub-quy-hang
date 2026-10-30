# Review findings: du-lieu-mau-san-thu (round 2)

## Trong hợp đồng

- **Bộ quét số điện thoại bỏ lọt số thật viết bằng khoảng trắng không ngắt (NBSP), tab hoặc gạch dài**
  AC: AC-2
  file: `packages/db/seed/du-lieu-mau.mjs:180`
  severity: medium
  source: bugs
  detail: DAY_SO = /\+?\d[\d .\-()]*\d/g chỉ nối các nhóm chữ số bằng dấu cách ASCII, chấm, gạch nối ASCII và ngoặc. Khi một số thật được tách bằng NBSP (hay gặp khi dán từ Excel hoặc Word), tab, gạch dài (–) hay '/', mỗi nhóm thành một match riêng dưới 9 chữ số, nên bị bỏ qua ở dòng `if (tron.replace("+", "").length < 9) continue;` mà không báo gì. Đã chạy thử: quetChuoi("0912 345 678"), "0912\t345\t678", "0912–345–678" và "0912/345/678" đều trả về {loi:[], so:0}. Kết quả là kiemDuLieuThat cho qua mà không báo lỗi, đúng loại bỏ lọt mà lượt sửa này (a5ec300) muốn bịt. Hàm này cũng dùng để quét ô chuỗi của mau-a.xlsx và mau-b.xlsx trong bài kiểm, nên ô Excel chứa NBSP cũng lọt qua. Cách sửa: dùng \s (hoặc [\s ]) và thêm các loại gạch trong lớp ký tự nối, ví dụ /\+?\d[\d\s.\-–—\/()]*\d/g, rồi thêm các ca NBSP và tab vào phá thử AC-2.
  rationale: AC-2 đòi chèn một số khác dạng vào bản sao thì bài quét phải đỏ; số viết bằng NBSP, tab hoặc gạch dài lọt qua nên AC-2 không đạt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 (tuyên quét LỚP nhưng chỉ có điểm-case): bộ quét hứa bắt số nối bằng gạch và ngoặc nhưng bài kiểm không có ca nào cho hai dạng đó**
  Người dùng thấy gì: Hiện bộ quét vẫn bắt được số nối bằng gạch và ngoặc. Nhưng nếu sau này ai đó vô tình làm nó bỏ qua hai dạng này thì bài kiểm không báo, và số thật có thể lọt vào dữ liệu mẫu mà không ai biết.
  Căn cứ: Hiện chưa có hậu quả nào với người dùng vì bộ quét đang chạy đúng; rủi ro chỉ xuất hiện khi có thay đổi sau này, và thêm ca kiểm sau này rẻ, không mất dữ liệu.
  file: `packages/db/seed/du-lieu-mau.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Lệnh nạp và xoá báo «xem .env.example» nhưng không tự đọc .env.local như công cụ vận hành cùng loại (r1 · tệp đã đổi)**
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
