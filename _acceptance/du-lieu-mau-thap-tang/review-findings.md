# Review findings: du-lieu-mau-thap-tang (round 2)

## Trong hợp đồng

Không có phát hiện trong hợp đồng ở round này. Phát hiện AC-9 của round 1 (bài kiểm so ảnh chụp toàn bảng dưới READ COMMITTED) đã được sửa ở nhát S4 r1 và không tái diễn.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

(Không có mục mới ở round này; sáu mục mang từ round 1 do máy tự chèn.)

- **Đích cột của đáp án file bẩn dùng tên tự đặt («rowIndex», «note», «label») thay vì tên RESO/đích nhập đã có (r1)**
  Người dùng thấy gì: Đáp án của file bảng hàng bẩn gọi ba cột bằng tên riêng, không dùng tên chuẩn của sản phẩm. Khi các hàng sau đo việc nhập file này, họ phải đổi tên lại bằng tay trước khi so.
  Căn cứ: Không làm sai dữ liệu hay lộ gì cho người dùng, chỉ thêm một bước đổi tên ở các hàng sau; sửa lúc đó rẻ hơn nhiều so với sửa bây giờ.
  file: `packages/db/seed/file-thap-tang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Đáp án ghi là «theo khuôn bộ thử hàng 64» nhưng khác khuôn DapAn: khoá `cot` thay `targets`, thiếu `camLo`, và `loiCay.dong` đổi nghĩa (r1)**
  Người dùng thấy gì: Đáp án của file bẩn có cấu trúc khác bộ đo của hàng trước dù chú thích nói là cùng khuôn. Nếu cắm thẳng vào bộ đo cũ, các lỗi cài sẵn có thể bị chấm lệch dòng mà không báo.
  Căn cứ: Chưa ảnh hưởng người dùng vì chưa có bộ đo nào dùng chung; rủi ro chỉ xuất hiện khi hàng sau cắm vào, và lúc đó có thể sửa chú thích hoặc sửa khuôn.
  file: `packages/db/seed/file-thap-tang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, thông điệp tự ghim): phá thử «hai sàn mẫu» không chạy phép đo thật (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài thử cố ý làm hỏng để chứng minh việc phát hiện hai sàn mẫu thực ra không chạy đúng phép đo thật. Nếu sau này có người làm nạp ra hai sàn mẫu theo cách khác, bài kiểm thật có thể không bắt được.
  Căn cứ: Hiện không có lỗi nào xảy ra với người dùng, chỉ là lưới an toàn yếu hơn vẻ ngoài; có thể thêm sau mà không đụng dữ liệu.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm có mặt, không kiểm quan hệ): `value` của lỗi cấy chỉ được kiểm là có, không so với giá trị đúng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Mỗi lỗi cài sẵn trong file bẩn có kèm giá trị đúng ghi riêng, nhưng không ai kiểm giá trị này khớp với đáp án chính. Nếu hai chỗ lệch nhau, đáp án tự mâu thuẫn mà không báo.
  Căn cứ: Giá trị chính để chấm vẫn được kiểm đúng, nên chỉ là một bản ghi phụ có thể lệch; người dùng không bị ảnh hưởng và sửa sau rẻ.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đếm trên dữ liệu, không trên quan hệ với địa chỉ thử): cặp gần trùng đếm trên căn, không đếm trên cách viết có canDich khác nhau (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm đếm các cặp căn gần giống nhau nhưng không kiểm có cách viết địa chỉ thử nào trỏ vào đúng hai căn của cặp. Nếu ai đó lỡ xoá hết cách viết của một cặp, bài vẫn xanh dù bộ địa chỉ thử đã thiếu ca khó.
  Căn cứ: Dữ liệu hiện có không sai và người dùng không thấy gì; chỉ là lưới kiểm lỏng, có thể siết lại bất kỳ lúc nào mà không mất dữ liệu.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng rỗng): «ô giá ≥ 1e9 không bị đếm là số điện thoại» đúng sẵn vì bộ quét bỏ qua mọi ô số (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ quét số điện thoại bỏ qua mọi ô kiểu số, nên một số thật lọt vào ô kiểu số ở cột khác sẽ không bị phát hiện. Phép kiểm cho giá tiền lớn xanh chỉ vì ô số không bao giờ được quét.
  Căn cứ: File mẫu hiện không chứa số điện thoại ở ô kiểu số nên chưa có rò rỉ thật; rủi ro chỉ khi sau này có người thêm dữ liệu, và lỗ hổng vá được bằng một phép kiểm thêm.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
