# Review findings: so-diem-bien-thien (round 2)

## Trong hợp đồng

(không có finding)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **giaiCauHinh nhận cả khoá mẫu của họ khoá ('labels.field.<trường chuẩn>') như một khoá cụ thể, không báo lỗi**
  Người dùng thấy gì: Nếu một dòng cấu hình của sàn mang đúng chữ mẫu chưa thay tên (còn đoạn trong ngoặc nhọn), hệ thống nhận im lặng thay vì báo lỗi. Giá trị đó nằm trong cấu hình nhưng không áp cho trường thật nào.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, chỉ là một dòng cấu hình vô nghĩa không báo lỗi; hiện chưa có đường nhập cấu hình thật từ sàn (thuộc hàng sau), và sửa sau rẻ.
  file: `packages/core/src/config/giai.ts`
  severity: low
  Đề xuất: known-limits

- **giaiCauHinh nhận nguyên khoá mẫu của họ khoá (vd. `custom_fields.<id>.share_with_partners`) mà không báo lỗi**
  Người dùng thấy gì: Một khoá mẫu chưa được thay bằng mã thật (ví dụ trường tuỳ chỉnh) vẫn được nhận như hợp lệ, không có cảnh báo. Người cấu hình có thể tưởng đã đặt xong trong khi chưa áp cho trường nào.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, người dùng tự phát hiện và sửa được khi nhập lại; chưa có màn hay API nhập cấu hình nên chưa ai gặp, sửa sau rẻ.
  file: `packages/core/src/config/giai.ts`
  severity: low
  Đề xuất: known-limits

- **Ràng buộc chéo «hạn gọi không nhỏ hơn hạn nhận» chỉ kiểm một chiều: tăng hạn nhận vượt hạn gọi vẫn lọt (r1)**
  Người dùng thấy gì: Sàn có thể đặt thời gian nhận lead dài hơn thời gian gọi khách mà hệ thống không báo lỗi, làm cấu hình tự mâu thuẫn.
  Căn cứ: Hiện chưa có màn hay đường nào cho sàn tự đổi các hạn này nên chưa ai gặp, dữ liệu không mất và sửa lại sau vẫn rẻ; nên xử lý cùng đợt mở cấu hình theo sàn.
  file: `packages/core/src/config/khuon.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách cách chia lead và người nhận báo khai hai chỗ, không có gì giữ hai bên khớp nhau (r1)**
  Người dùng thấy gì: Nếu sau này thêm hoặc bớt một cách chia lead ở một nơi mà quên nơi kia, hai đường kiểm sẽ cho kết quả khác nhau cho cùng một cài đặt.
  Căn cứ: Hôm nay hai danh sách đang giống nhau nên người dùng chưa bị ảnh hưởng; rủi ro chỉ xuất hiện khi có người sửa danh sách, và sửa lúc đó rẻ.
  file: `packages/core/src/routing/index.ts`
  severity: low
  Đề xuất: known-limits

- **giaiCauHinh can return a config where the first-call deadline is shorter than the accept deadline, with no error (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi hệ thống bắt đầu đọc cấu hình riêng của từng sàn, một sàn chỉ đặt hạn nhận dài có thể bị áp cấu hình trái luật mà không ai được báo.
  Căn cứ: Chưa gây hại bbây giờ vì đường ghi hiện tại vẫn kiểm cặp hạn, nhưng sẽ thành lỗi thật khi hàng 82 mở đọc theo sàn nên cần xử lý trước hoặc cùng lúc đó.
  file: `packages/core/src/config/giai.ts`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình): phép quét «không tệp nào viết lại con số ngưỡng» bỏ mất đối chứng dương (r1)**
  Người dùng thấy gì: Bài kiểm chống việc ai đó viết lại con số ngưỡng đổi giá có thể vẫn xanh dù bị hỏng, nên một con số viết cứng sau này có thể lọt qua.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, bộ kiểm khớp mặc định với sổ vẫn là lưới chính; chi phí sửa nhỏ nhưng hậu quả cũng nhẹ.
  file: `packages/core/src/pricing/hoi-lai.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ vị trí): kiểm chú thích «cạnh hằng» bằng cách tìm trong cả tệp (r1)**
  Người dùng thấy gì: Bài kiểm có thể chấp nhận ghi chú «mặc định của sàn» ở sai chỗ, chỉ ảnh hưởng người đọc mã chứ không ảnh hưởng người dùng.
  Căn cứ: Chỉ là chú thích trong mã, không có tác động tới dữ liệu hay hành vi sản phẩm nên chấp nhận và ghi vết.
  file: `packages/core/src/pricing/hoi-lai.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
