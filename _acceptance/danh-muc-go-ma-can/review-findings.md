# Review findings: danh-muc-go-ma-can (round 2)

## Trong hợp đồng

Không có finding nào map được vào tiêu chí chấp nhận của vòng này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đối chứng (b') không tự kiểm điều kiện của nó: chưa khẳng định mã đọc tráo thực sự ra một căn có trong danh mục**
  Người dùng thấy gì: Tính năng gõ mã căn hiện vẫn tự điền đúng và vẫn báo đúng khi mã không có trong danh mục. Chỉ có bài kiểm tự canh con số tỉ lệ có thể mất khả năng phát hiện lỗi nếu sau này bộ danh mục mẫu bị đổi, và khi đó nó vẫn báo xanh.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không làm mất hay lộ dữ liệu; rủi ro chỉ xuất hiện khi dữ liệu mẫu đổi, lúc đó ghi nhận và thêm kiểm sau là đủ.
  file: `packages/api/src/catalog/catalog.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình): đối chứng (b') đòi dung == 0 nhưng không ghim tiền đề 'found mà sai UPI'**
  Người dùng thấy gì: Người dùng gõ mã căn vẫn nhận kết quả đúng như hiện nay. Bài kiểm kèm theo có một kẽ hở nhỏ: nếu cách đọc mã đổi trong tương lai, nó có thể báo xanh dù không còn phân biệt được lỗi đếm sai.
  Căn cứ: Hậu quả nhẹ, chỉ nằm ở lưới kiểm thử chứ không ở sản phẩm, không mất dữ liệu; hôm nay lưới vẫn bắt được lỗi nên có thể ghi nhận và xử lý khi đổi cách đọc mã.
  file: `packages/api/src/catalog/catalog.test.ts`
  severity: low
  Đề xuất: known-limits

- **Toàn bộ gói dữ liệu mẫu, kể cả phần chủ nhà mẫu, bị đóng vào bundle máy chủ production, trái với comment (r1)**
  Người dùng thấy gì: Dữ liệu chủ nhà mẫu (không phải dữ liệu thật) nằm trong phần chương trình chạy trên máy chủ, nhưng không hiện ra cho người dùng hay trang khách. Chỉ có ghi chú trong mã nói sai về điều này.
  Căn cứ: Chỉ là dữ liệu mẫu, không có người dùng nào nhìn thấy và không mất hay lộ gì; hàng nạp danh mục thật sắp tới sẽ thay gói mẫu này nên sửa lúc đó rẻ hơn.
  file: `packages/api/src/catalog/sample.ts`
  severity: low
  Đề xuất: known-limits

- **Chỉ mục tra lặng lẽ ghi đè căn trùng mã trong cùng dự án: trả found sai căn thay vì ambiguous (r1)**
  Người dùng thấy gì: Khi một dự án có hai toà cùng có căn mang chung một mã, hệ thống tự điền thuộc tính của một căn mà không báo là có thể nhầm. Đầu chủ có thể nhận về diện tích, hướng của căn khác mà không hay biết.
  Căn cứ: Điền sai lặng lẽ thuộc tính căn là hậu quả khá nặng với người dùng, nhưng dữ liệu mẫu hiện không bị ảnh hưởng và chỉ xuất hiện khi nạp danh mục thật, nên xử lý cùng đợt nạp danh mục thật là hợp lý.
  file: `packages/core/src/catalog/lookup.ts`
  severity: medium
  Đề xuất: new-contract

- **Lệnh đo tỉ lệ lặng lẽ bỏ lead có mã căn không có trong danh mục, làm tỉ lệ cao giả (r1)**
  Người dùng thấy gì: Công cụ đo tỉ lệ tự điền có thể báo 100% dù bỏ qua vài mã không có trong danh mục, nếu sau này dữ liệu mẫu bị đổi. Người dùng cuối không gặp điều này, chỉ ảnh hưởng độ tin của con số báo cáo.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; con số chỉ có thể lạc quan khi dữ liệu mẫu đổi, mà bài kiểm thử vẫn chặn trường hợp đó.
  file: `packages/api/src/catalog/do-ti-le.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
