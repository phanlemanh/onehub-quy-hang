## Trong hợp đồng

- **Phép thử «máy còn giữ N thao tác» so hai đại lượng đếm khác nhau, nên có thể đánh trượt vế 2 khi phiên thật ra đúng**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/tom-tat.mjs:95`
  severity: medium
  AC: AC-9
  source: conventions
  detail: `du: ops.length >= k.so_cho` lấy `so_cho` ở sự kiện «bat», tức `hd.soCho()` trong trang-thu.html, là tổng số thao tác còn chờ trên máy lúc nối lại. Trong khi đó, `thaoTacTrong` chỉ đếm những thao tác có `tao_luc` nằm trong [tu, den], với `tu` là lúc «tat». Thao tác nào tạo trước «tat» mà vẫn còn chờ thì nằm trong `so_cho` nhưng không được đếm vào `ops`. Ví dụ người dùng bấm đổi giá trong vài giây giữa lúc mạng thật sự rớt và lúc trình duyệt phát sự kiện «offline» (iOS hay phát muộn), hoặc lúc «tat» còn một lô đang dở. Khi đó vế 2 ra «không đạt (máy còn giữ N lúc nối lại)» dù mọi thao tác đã lên đúng thứ tự. Sự kiện «tat» có ghi `so_cho` (trang-thu.html dòng 129) nhưng luật không dùng đến, nên không trừ được phần còn chờ từ trước. Bài kiểm AC-9 mới chỉ có ca âm (so_cho 5, máy chủ thấy 3); chưa có ca dương nào có thao tác chờ từ trước khi mất mạng nên không lộ lỗi này. Nhật ký phiên thật hiện không có sự kiện mạng nào, nên bảng trong ket-qua.md chưa bị ảnh hưởng. Nhưng đây chính là luật sẽ chấm lần đo lại.
  rationale: AC-9 định nghĩa vế mất mạng đạt khi mọi thao tác tạo trong khoảng mất mạng lên đúng thứ tự; luật trong tom-tat.mjs lại so với tổng số chờ nên chấm sai so với định nghĩa đó.

- **Ca AC-8 đếm dữ liệu mẫu không chứng minh được lệnh một-lệnh đã áp mẫu**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:312`
  severity: low
  AC: AC-8
  source: bugs
  detail: Comment ghi là «Đếm dữ liệu mẫu lệnh vừa áp», nhưng before() đã chạy `apDuLieuMau(URL_DB)` trên cùng cơ sở dữ liệu trước khi chạy chay.mjs. Vì vậy phép đếm 2 sàn / 6 căn / 6 số chủ và lượt kéo của bốn người vẫn xanh kể cả khi chay.mjs không áp mẫu gì. Ca này đã thay phép so câu in ra «2 sàn, 4 người, 6 căn» bằng một kiểm tra không thể đỏ vì lý do nó tuyên bố. Muốn ca này có nghĩa thì phải xoá hoặc làm bẩn bảng mẫu trước khi chạy lệnh, rồi mới đếm.
  rationale: AC-8 đòi lệnh một-lệnh phải áp bảng mẫu và dữ liệu mẫu; phép đếm đã xanh sẵn nên không chứng minh được điều đó.

- **Shape 1 (đo chỉ dẫn/trạng thái có sẵn thay vì đầu ra): ca AC-8 đếm dữ liệu mẫu mà before() đã nạp sẵn, nên không chứng minh chay.mjs áp dữ liệu; thêm một assert luôn đúng trên hằng số NGUOI**
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs:312`
  severity: medium
  AC: AC-8
  source: measurement
  detail: Comment ghi «Đếm dữ liệu mẫu lệnh vừa áp». Nhưng before() (dòng 23) đã gọi apDuLieuMau(URL_DB), và lệnh con chay.mjs được chạy với DATABASE_URL: URL_DB, tức trỏ đúng cơ sở dữ liệu đó. Vì vậy câu truy vấn đếm trên `pool` (count distinct company_id / listings / owner_contacts) đã ra {san:2, can:6, so_chu:6} từ trước khi spawn. Các ca trước chỉ đổi giá, không đổi số dòng. Nếu chay.mjs bỏ lời gọi apDuLieuMau (chay.mjs:88) hoặc áp sai dữ liệu mẫu, assert.deepEqual vẫn xanh. Vòng lặp `/keo` qua cổng của lệnh con cũng chỉ đọc lại dữ liệu mà before() đã nạp. Thêm vào đó, `assert.equal(Object.keys(NGUOI).length, 4)` kiểm hằng số mà chính bài kiểm import từ du-lieu-mau.mjs. Assert này luôn đúng, không đọc gì từ đầu ra của lệnh, mà lại thay chỗ assert cũ trên stdout `/2 sàn, 4 người, 6 căn/`. Hệ quả: tiêu chí E8 «bảng mẫu có 2 sàn, 4 người» được báo là đã đo, trong khi không có phép đo nào phân biệt được lệnh có áp dữ liệu mẫu hay không.
  rationale: Cùng gốc với t3: bài kiểm AC-8 đo trạng thái có sẵn thay vì đầu ra của lệnh nên không chứng minh được lệnh áp dữ liệu mẫu.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Một thao tác lỗi giờ chặn mọi thao tác sau mà trang thử không báo gì**
  Người dùng thấy gì: Nếu một thay đổi cứ bị lỗi, các thay đổi làm sau nó sẽ không lên máy chủ và người dùng không thấy báo gì, chỉ thấy số đang chờ đứng yên.
  Căn cứ: Chỉ xảy ra trên trang thử chứ không phải sản phẩm thật, không mất dữ liệu vì thay đổi vẫn nằm trên máy, và bản dựng thật sau này sẽ làm lại phần này.
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/trang-thu.html`
  severity: medium
  Đề xuất: known-limits

- **Bài kiểm tự lùi về Postgres cổng 5547 và xoá schema ở đó, trái với lời khai ở config và với chay.mjs (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chạy bài kiểm mà quên khai cơ sở dữ liệu thì nó lặng lẽ xoá bảng mẫu trên máy nào đang nghe cổng thử. Chỉ ảnh hưởng dữ liệu mẫu của dãy thử.
  Căn cứ: Hậu quả nhẹ vì chỉ mất bảng mẫu thử, dựng lại bằng một lệnh, và không chạm dữ liệu thật của khách.
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/dong-bo.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **/dem không cần xác thực nhưng trả nhật ký có số chủ của mọi vai, qua đường hầm công khai (r1 · tệp đã đổi)**
  Người dùng thấy gì: Ai có đường link của phiên thử đều xem được số chủ nhà mẫu đã cấp cho từng vai. Hiện chỉ là số giả nên chưa lộ gì thật.
  Căn cứ: Dữ liệu chỉ là số mẫu và đường link chỉ sống trong phiên thử ngắn, nên hại thật gần như bằng không; sửa sau cũng rẻ.
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/may-chu.mjs`
  severity: low
  Đề xuất: known-limits

- **Mã thử của hồ sơ này import mã thử của hồ sơ bai-thu-zalo (r1)**
  Người dùng thấy gì: Nếu hồ sơ thử Zalo bị dọn, bài thử đồng bộ sẽ không chạy được nữa. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Mã thử này vốn bỏ đi sau khi chốt quyết định kiến trúc, nên rủi ro hỏng về sau không đáng công sửa.
  file: `_acceptance/bai-thu-dong-bo-mat-mang/thu/chay.mjs`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
