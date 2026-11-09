# Review findings: va-bai-o-la-do-ngau-nhien (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Dòng sổ đảo ba định tuyến nhưng chỉ rút một dòng: Ngoài-4 và Ngoài-6 vẫn còn hiệu lực là Known limits**
  Người dùng thấy gì: Sổ quyết định của hồ sơ còn ghi hai giới hạn đã hết đúng, nên người đọc hồ sơ có thể hiểu nhầm. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm lệch giấy tờ hồ sơ, không ảnh hưởng người dùng hay dữ liệu, và sửa lại sau rất rẻ.
  file: `_acceptance/va-bai-o-la-do-ngau-nhien/decisions.jsonl`
  severity: low
  Đề xuất: known-limits

- **Notes của hợp đồng vẫn ghi nhánh sẽ đỏ vì chưa vẽ lại hai tệp sinh, trong khi điều đó đã hết đúng**
  Người dùng thấy gì: Hợp đồng còn nêu một hạn chế đã được khắc phục, nên người ký có thể đọc nhầm rằng nhánh chưa gộp được. Không ảnh hưởng người dùng sản phẩm.
  Căn cứ: Chỉ là ghi chú lỗi thời trong giấy tờ, không mất dữ liệu, và gỡ đi bất cứ lúc nào cũng rẻ.
  file: `_acceptance/va-bai-o-la-do-ngau-nhien/contract.md`
  severity: low
  Đề xuất: known-limits

- **Bộ đo 300 lần báo xanh giả khi tên ca không còn khớp mẫu lọc**
  Người dùng thấy gì: Nếu ai đó đổi tên ca kiểm, phép đo 300 lần vẫn báo đạt dù không chạy gì, khiến kết quả đo kém đáng tin. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của công cụ đo nội bộ, xảy ra khi có người đổi tên ca, và đã được ghi nhận từ trước.
  file: `_acceptance/va-bai-o-la-do-ngau-nhien/thu/lap.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5, tuyên quét lớp «mã máy» nhưng chiều xanh chỉ ghim 2 trong 4 trường được miễn: company_id và user_id không có ca mang 011**
  Người dùng thấy gì: Nếu ai đó vô tình bỏ một trong hai chỗ miễn trừ cho mã sàn hoặc mã người, bài kiểm vẫn xanh phần lớn các lần chạy, và lỗi đỏ ngẫu nhiên có thể quay lại. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm bài kiểm nội bộ yếu hơn ở một kiểu sửa sai hiếm, không đụng dữ liệu thật, và bổ sung ca kiểm sau này không đắt.
  file: `packages/api/test-db/imports/o-la.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5, «số assert = số phần tử» của ma trận cột là đếm tự sinh, ma trận không viết trước**
  Người dùng thấy gì: Nếu bộ ca kiểm bị hụt một cột thì phép đếm vẫn không báo. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm bài kiểm nội bộ bỏ sót khi có người làm hụt ca, không mất dữ liệu, và đã được ghi nhận từ trước.
  file: `packages/api/test-db/imports/o-la.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5, tuyên đủ ba biến thể giờ ghi nhưng chỉ assert hai**
  Người dùng thấy gì: Nếu bộ sinh dữ liệu mất dạng giờ ghi đủ sáu chữ số lẻ thì bài kiểm vẫn xanh mà không báo. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ làm bài kiểm nội bộ kém chặt ở một dạng dữ liệu, không ảnh hưởng người dùng, và đã được ghi nhận từ trước.
  file: `packages/api/test-db/imports/o-la.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4, «đỏ 0» âm tính một mình: lượt chạy không có ca nào vẫn tính là xanh**
  Người dùng thấy gì: Phép đo 300 lần có thể báo đạt dù không chạy ca nào nếu tên ca bị đổi, nên kết quả đo có thể sai. Người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ tin cậy của công cụ đo nội bộ, chỉ xảy ra khi có người đổi tên ca, và đã được ghi nhận từ trước.
  file: `_acceptance/va-bai-o-la-do-ngau-nhien/thu/lap.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
