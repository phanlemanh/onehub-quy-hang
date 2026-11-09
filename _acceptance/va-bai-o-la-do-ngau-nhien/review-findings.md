# Review findings: va-bai-o-la-do-ngau-nhien (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thêm hàng lộ trình và hồ sơ mới nhưng chưa vẽ lại hai tệp sinh, job gate của CI sẽ đỏ**
  Người dùng thấy gì: Nhánh chưa cập nhật hai tệp bản đồ sản phẩm và lộ trình, nên bước kiểm cuối của kho sẽ báo đỏ và chưa gộp được cho tới khi vẽ lại.
  Căn cứ: Chỉ chặn việc gộp chứ không làm mất hay lộ dữ liệu, và vẽ lại rồi lưu lại là xong trong vài phút.
  file: `docs/plan/lo-trinh.json`
  severity: high
  Đề xuất: known-limits

- **Phép kiểm bỏ sót số điện thoại nằm trong giá trị dạng đối tượng, trái lời hứa quét mọi cột thêm sau này**
  Người dùng thấy gì: Nếu sau này sổ chi phí AI thêm một cột chứa dữ liệu lồng nhau, số điện thoại lọt vào đó có thể không bị bài kiểm bắt và bài vẫn xanh.
  Căn cứ: Hiện sổ chưa có cột như vậy nên chưa có lỗ thật, và lỗ chỉ mở khi có người thêm cột loại này, lúc đó sửa bài kiểm còn rẻ.
  file: `packages/api/test-db/imports/vet-so-trong-so.ts`
  severity: medium
  Đề xuất: known-limits

- **Giờ ghi của phản biện context sạch muộn hơn commit chứa nó và muộn hơn dấu niêm Gate 1**
  Người dùng thấy gì: Hồ sơ ghi giờ phản biện muộn hơn thực tế, nên người ký có thể hiểu nhầm phản biện chạy sau khi niêm.
  Căn cứ: Chỉ là sai một mốc giờ trong hồ sơ, không ảnh hưởng người dùng hay dữ liệu, và lịch sử commit đã cho thấy giờ thật.
  file: `_acceptance/va-bai-o-la-do-ngau-nhien/gap-probe.md`
  severity: low
  Đề xuất: wont-fix

- **Phép kiểm bỏ lọt số điện thoại nằm trong giá trị JSON lồng (cột jsonb, mảng chứa object)**
  Người dùng thấy gì: Số điện thoại nằm trong dữ liệu lồng nhau của một cột tương lai có thể lọt qua bài kiểm mà không báo đỏ.
  Căn cứ: Chưa có cột nào như vậy trong sổ hôm nay nên chưa mất hay lộ gì, và có thể bổ sung khi thêm cột đó.
  file: `packages/api/test-db/imports/vet-so-trong-so.ts`
  severity: medium
  Đề xuất: known-limits

- **Nhánh làm đỏ `product-map --check`: thêm hàng lộ trình và hồ sơ nhưng chưa vẽ lại hai tệp sinh**
  Người dùng thấy gì: Hai tệp bản đồ sản phẩm và lộ trình đang lệch với hồ sơ mới, nên kiểm tra cuối của kho sẽ đỏ và chưa gộp được.
  Căn cứ: Chỉ chặn việc gộp, không ảnh hưởng người dùng, và vẽ lại hai tệp rồi lưu là khắc phục ngay.
  file: `docs/plan/lo-trinh.json`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5, tuyên quét LỚP nhưng ma trận thiếu kiểu giá trị đối tượng: số nằm trong cột jsonb lọt qua**
  Người dùng thấy gì: Bộ ca thử của bài kiểm không có trường hợp số điện thoại nằm trong dữ liệu lồng, nên nếu có cột như vậy sau này bài vẫn xanh dù số đã vào sổ.
  Căn cứ: Chưa có cột loại này trong sổ hiện tại nên chưa có hậu quả thật, và thêm ca thử sau này không tốn nhiều.
  file: `packages/api/test-db/imports/o-la.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5, «số assert = số phần tử» là đếm tự sinh, không thể đỏ**
  Người dùng thấy gì: Phép đếm kiểm tra bộ ca đủ số lượng tự khớp với chính nó, nên nếu bộ ca bị hụt một cột thì phép đếm không báo.
  Căn cứ: Hậu quả nhẹ vì còn một chốt khác giữ các cột chính, và không có dữ liệu nào bị ảnh hưởng.
  file: `packages/api/test-db/imports/o-la.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5, tuyên đủ ba biến thể giờ ghi nhưng chỉ assert hai**
  Người dùng thấy gì: Bài kiểm không tự xác nhận có dòng giờ ghi đủ sáu chữ số lẻ, nên nếu bộ sinh đổi và mất dạng này thì bài vẫn xanh.
  Căn cứ: Hiện bộ sinh vẫn tạo dạng này nên chưa có hậu quả, và nếu mất thì chỉ làm bài kiểm yếu đi chứ không mất dữ liệu.
  file: `packages/api/test-db/imports/o-la.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4, «đỏ 0» âm tính một mình: lần chạy không có ca nào vẫn tính là xanh**
  Người dùng thấy gì: Nếu tên ca kiểm bị đổi, bộ đo 300 lần có thể chạy rỗng mà vẫn báo đạt, làm kết quả đo kém tin cậy.
  Căn cứ: Chỉ xảy ra khi ai đó đổi tên ca và bộ đo này chỉ dùng một lần ở bước nghiệm thu, nên không ảnh hưởng người dùng.
  file: `_acceptance/va-bai-o-la-do-ngau-nhien/thu/lap.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
