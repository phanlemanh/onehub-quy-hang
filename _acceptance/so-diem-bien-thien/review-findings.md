## Trong hợp đồng

- **Hình dạng 5 (tuyên quét cả lớp nhưng ma trận tự lọc): khoá họ giá trị đơn custom_fields.<id>.share_with_partners bị loại khỏi ma trận**
  file: `packages/core/src/config/khuon.test.ts:9`
  severity: medium
  AC: AC-4
  source: measurement
  detail: evals.yaml E4 hứa ma trận phủ «mỗi khoá giá trị đơn (không map)», và E5 hứa «một assert mỗi khoá». Nhưng khuon.test.ts:9 và giai.test.ts:7 cùng lọc `d.kieu.loai !== "map" && !d.khoa.includes("<")`, nên loại luôn các khoá họ không phải map. Bị loại có #23 `custom_fields.<id>.share_with_partners` (bool) và #18 `labels.field.<trường chuẩn>` (text). #18 còn được đỡ bằng ca riêng `labels.field.unitNumber`. #23 thì không có ca nào gọi kiemGiaTri hay giaiCauHinh với một id cụ thể, nên nhánh khớp họ khoá của `timDiem` cho kiểu bool không được đo. Ngoài ra, cỡ ma trận chỉ được chặn bằng `don.length >= 20` và `soCa > don.length * 4`: không có danh sách khoá viết trước nào để số assert bằng số phần tử. Bỏ sót một khoá sẽ không làm đỏ test.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Ràng buộc chéo «hạn gọi không nhỏ hơn hạn nhận» chỉ kiểm một chiều: tăng hạn nhận vượt hạn gọi vẫn lọt**
  Người dùng thấy gì: Sàn có thể đặt thời gian nhận lead dài hơn thời gian gọi khách mà hệ thống không báo lỗi, làm cấu hình tự mâu thuẫn.
  Căn cứ: Hiện chưa có màn hay đường nào cho sàn tự đổi các hạn này nên chưa ai gặp, dữ liệu không mất và sửa lại sau vẫn rẻ; nên xử lý cùng đợt mở cấu hình theo sàn.
  file: `packages/core/src/config/khuon.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh sách cách chia lead và người nhận báo khai hai chỗ, không có gì giữ hai bên khớp nhau**
  Người dùng thấy gì: Nếu sau này thêm hoặc bớt một cách chia lead ở một nơi mà quên nơi kia, hai đường kiểm sẽ cho kết quả khác nhau cho cùng một cài đặt.
  Căn cứ: Hôm nay hai danh sách đang giống nhau nên người dùng chưa bị ảnh hưởng; rủi ro chỉ xuất hiện khi có người sửa danh sách, và sửa lúc đó rẻ.
  file: `packages/core/src/routing/index.ts`
  severity: low
  Đề xuất: known-limits

- **giaiCauHinh can return a config where the first-call deadline is shorter than the accept deadline, with no error**
  Người dùng thấy gì: Khi hệ thống bắt đầu đọc cấu hình riêng của từng sàn, một sàn chỉ đặt hạn nhận dài có thể bị áp cấu hình trái luật mà không ai được báo.
  Căn cứ: Chưa gây hại bbây giờ vì đường ghi hiện tại vẫn kiểm cặp hạn, nhưng sẽ thành lỗi thật khi hàng 82 mở đọc theo sàn nên cần xử lý trước hoặc cùng lúc đó.
  file: `packages/core/src/config/giai.ts`
  severity: low
  Đề xuất: new-contract

- **Hình dạng 4 (âm tính một mình): phép quét «không tệp nào viết lại con số ngưỡng» bỏ mất đối chứng dương**
  Người dùng thấy gì: Bài kiểm chống việc ai đó viết lại con số ngưỡng đổi giá có thể vẫn xanh dù bị hỏng, nên một con số viết cứng sau này có thể lọt qua.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, bộ kiểm khớp mặc định với sổ vẫn là lưới chính; chi phí sửa nhỏ nhưng hậu quả cũng nhẹ.
  file: `packages/core/src/pricing/hoi-lai.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 3 (assert chuỗi có mặt thay cho quan hệ vị trí): kiểm chú thích «cạnh hằng» bằng cách tìm trong cả tệp**
  Người dùng thấy gì: Bài kiểm có thể chấp nhận ghi chú «mặc định của sàn» ở sai chỗ, chỉ ảnh hưởng người đọc mã chứ không ảnh hưởng người dùng.
  Căn cứ: Chỉ là chú thích trong mã, không có tác động tới dữ liệu hay hành vi sản phẩm nên chấp nhận và ghi vết.
  file: `packages/core/src/pricing/hoi-lai.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
