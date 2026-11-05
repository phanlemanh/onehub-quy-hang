# Review findings: du-lieu-mau-thap-tang (round 1)

## Trong hợp đồng

- **Bài kiểm AC-8/AC-9 so ảnh chụp toàn bảng dưới READ COMMITTED nên bắt cả dòng của tiến trình khác, đỏ ngẫu nhiên**
  AC: AC-9
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs:716`
  severity: medium
  source: bugs
  detail: `trongGiaoDich` mở giao dịch bằng `begin` trơn, tức mức READ COMMITTED. Sau đó `anhChup` chọn MỌI dòng của companies, identity.user, company_members, company_zones, member_zones, không lọc. Vì vậy dòng mà kết nối khác commit giữa hai lần chụp sẽ lọt vào `chenh(...)`. Các hệ quả: `kiemNhanDb` đỏ «thiếu nhãn mẫu: dòng cơ sở dữ liệu» (dòng 743, 800); ở AC-9, `assert.deepEqual(await anhChup(c), s1/s4/s0)` đỏ «lần nạp hai đổi dòng» hay «còn dòng mẫu sau xoá» (dòng 802, 805, 813, 819). Khoá tư vấn `giuKhoaSanMau` chỉ xếp hàng các tệp có lấy khoá ấy, mà isolation.test.mjs không lấy. Trong khi đó ca «hai quản trị gỡ nhau cùng lúc» (isolation.test.mjs dòng 309-337) commit thật '[Sàn đồng thời]', vk-x/vk-y@example.test và company_members, giữ chúng khoảng hơn 300 ms rồi mới xoá. CI chạy `node --test "tests/*.test.mjs"` (packages/db/package.json, job isolation): tệp chạy song song theo mặc định, nên hai bài này có thể chồng nhau và job đỏ ngẫu nhiên. Đã tái hiện trên Postgres dùng chung ở cổng 5576: AC-8 đỏ liên tục. Bảng chênh chứa user 't-0hu7yj-cl19-dc2@example.test' và một company_members của sàn khác, cả hai không do napThapTang tạo; AC-9 cũng lệ thuộc cùng cửa sổ này. Sửa: mở giao dịch bằng `begin isolation level repeatable read` (ảnh chụp chỉ thấy dòng của chính giao dịch), hoặc lấy ảnh chụp giới hạn theo id do giao dịch tạo.
  rationale: Phép đo chênh lệch năm bảng trước, sau nạp và sau xoá của AC-9 (và quét dòng đã nạp của AC-8) đỏ khi tệp kiểm khác chạy chồng, nên AC không chứng minh được trên Postgres dãy của CI.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đích cột của đáp án file bẩn dùng tên tự đặt («rowIndex», «note», «label») thay vì tên RESO/đích nhập đã có**
  Người dùng thấy gì: Đáp án của file bảng hàng bẩn gọi ba cột bằng tên riêng, không dùng tên chuẩn của sản phẩm. Khi các hàng sau đo việc nhập file này, họ phải đổi tên lại bằng tay trước khi so.
  Căn cứ: Không làm sai dữ liệu hay lộ gì cho người dùng, chỉ thêm một bước đổi tên ở các hàng sau; sửa lúc đó rẻ hơn nhiều so với sửa bây giờ.
  file: `packages/db/seed/file-thap-tang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Đáp án ghi là «theo khuôn bộ thử hàng 64» nhưng khác khuôn DapAn: khoá `cot` thay `targets`, thiếu `camLo`, và `loiCay.dong` đổi nghĩa**
  Người dùng thấy gì: Đáp án của file bẩn có cấu trúc khác bộ đo của hàng trước dù chú thích nói là cùng khuôn. Nếu cắm thẳng vào bộ đo cũ, các lỗi cài sẵn có thể bị chấm lệch dòng mà không báo.
  Căn cứ: Chưa ảnh hưởng người dùng vì chưa có bộ đo nào dùng chung; rủi ro chỉ xuất hiện khi hàng sau cắm vào, và lúc đó có thể sửa chú thích hoặc sửa khuôn.
  file: `packages/db/seed/file-thap-tang.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính một mình, thông điệp tự ghim): phá thử «hai sàn mẫu» không chạy phép đo thật**
  Người dùng thấy gì: Bài thử cố ý làm hỏng để chứng minh việc phát hiện hai sàn mẫu thực ra không chạy đúng phép đo thật. Nếu sau này có người làm nạp ra hai sàn mẫu theo cách khác, bài kiểm thật có thể không bắt được.
  Căn cứ: Hiện không có lỗi nào xảy ra với người dùng, chỉ là lưới an toàn yếu hơn vẻ ngoài; có thể thêm sau mà không đụng dữ liệu.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (chỉ kiểm có mặt, không kiểm quan hệ): `value` của lỗi cấy chỉ được kiểm là có, không so với giá trị đúng**
  Người dùng thấy gì: Mỗi lỗi cài sẵn trong file bẩn có kèm giá trị đúng ghi riêng, nhưng không ai kiểm giá trị này khớp với đáp án chính. Nếu hai chỗ lệch nhau, đáp án tự mâu thuẫn mà không báo.
  Căn cứ: Giá trị chính để chấm vẫn được kiểm đúng, nên chỉ là một bản ghi phụ có thể lệch; người dùng không bị ảnh hưởng và sửa sau rẻ.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (đếm trên dữ liệu, không trên quan hệ với địa chỉ thử): cặp gần trùng đếm trên căn, không đếm trên cách viết có canDich khác nhau**
  Người dùng thấy gì: Bài kiểm đếm các cặp căn gần giống nhau nhưng không kiểm có cách viết địa chỉ thử nào trỏ vào đúng hai căn của cặp. Nếu ai đó lỡ xoá hết cách viết của một cặp, bài vẫn xanh dù bộ địa chỉ thử đã thiếu ca khó.
  Căn cứ: Dữ liệu hiện có không sai và người dùng không thấy gì; chỉ là lưới kiểm lỏng, có thể siết lại bất kỳ lúc nào mà không mất dữ liệu.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (đối chứng rỗng): «ô giá ≥ 1e9 không bị đếm là số điện thoại» đúng sẵn vì bộ quét bỏ qua mọi ô số**
  Người dùng thấy gì: Bộ quét số điện thoại bỏ qua mọi ô kiểu số, nên một số thật lọt vào ô kiểu số ở cột khác sẽ không bị phát hiện. Phép kiểm cho giá tiền lớn xanh chỉ vì ô số không bao giờ được quét.
  Căn cứ: File mẫu hiện không chứa số điện thoại ở ô kiểu số nên chưa có rò rỉ thật; rủi ro chỉ khi sau này có người thêm dữ liệu, và lỗ hổng vá được bằng một phép kiểm thêm.
  file: `packages/db/tests/du-lieu-mau-thap-tang.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
