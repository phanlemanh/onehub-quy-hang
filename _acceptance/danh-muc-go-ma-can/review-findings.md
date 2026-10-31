
# Review findings: danh-muc-go-ma-can (round 1)

## Trong hợp đồng

- **Hình dạng 4 (kèm 3): đối chứng (b) của E10 là phép âm đứng một mình, nên không bắt được lỗi «đếm found mà không so UPI» như eval hứa**
  file: `packages/api/src/catalog/catalog.test.ts:76`
  severity: high
  AC: AC-10
  source: measurement
  detail: evals.yaml E10 ghi chiều đỏ: «hàm đo đếm found mà không so UPI → ca (b) đỏ». Đối chứng (b) ở dòng 74-76 chỉ kiểm `assert.ok(b.dung < b.tong, ...)`. Nó không ghim số lượng, không ghim mã nào hụt, cũng không ghim lý do hụt. Khi tráo tầng và trục bằng mẫu `{b}-{s}.{f}`, mọi mã có tầng từ 7 trở lên (A-08.03, A-10.05, B-14.06...) đọc ra một trục lớn hơn 06. Danh mục không có trục đó, nên kết quả là not_in_catalog, không phải found. Tôi chạy thử lookupUnit với mẫu tráo trên đúng 282 mã của dapAnMau: 108 mã ra found nhưng sai UPI, 174 mã ra not_in_catalog. Vậy nếu measureAutofill bỏ phép so `kq.unit.upi === a.upi` ở dòng 38 của do-ti-le.ts, số đúng sẽ là 108/282. Điều kiện `b.dung < b.tong` vẫn thoả, ca vẫn xanh. Phép đo chính ở dòng 62 (dung 282/282) cũng xanh, vì khi không tráo thì mọi found đều đúng căn. Lời hứa «đúng = found VỚI UPI trùng đáp án» là quan hệ giữa hai giá trị (hình dạng 3). Không assert nào trong tệp đo được quan hệ này: đối chứng âm đỏ được nhờ một cơ chế khác là not_in_catalog. Muốn bắt được thì đối chứng phải ghim phần hụt do found sai UPI: hoặc chỉ dùng mã có tầng ≤ 6, hoặc ghim `hut` gồm đúng những mã ra found với UPI khác.
  rationale: AC-10 định nghĩa «đúng căn» là found với UPI trùng đáp án, còn đối chứng được dựng để chứng minh điều đó lại vẫn xanh khi bỏ phép so UPI, nên AC-10 chưa được bảo đảm.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Toàn bộ gói dữ liệu mẫu, kể cả phần chủ nhà mẫu, bị đóng vào bundle máy chủ production, trái với comment**
  Người dùng thấy gì: Dữ liệu chủ nhà mẫu (không phải dữ liệu thật) nằm trong phần chương trình chạy trên máy chủ, nhưng không hiện ra cho người dùng hay trang khách. Chỉ có ghi chú trong mã nói sai về điều này.
  Căn cứ: Chỉ là dữ liệu mẫu, không có người dùng nào nhìn thấy và không mất hay lộ gì; hàng nạp danh mục thật sắp tới sẽ thay gói mẫu này nên sửa lúc đó rẻ hơn.
  file: `packages/api/src/catalog/sample.ts`
  severity: low
  Đề xuất: known-limits

- **Chỉ mục tra lặng lẽ ghi đè căn trùng mã trong cùng dự án: trả found sai căn thay vì ambiguous**
  Người dùng thấy gì: Khi một dự án có hai toà cùng có căn mang chung một mã, hệ thống tự điền thuộc tính của một căn mà không báo là có thể nhầm. Đầu chủ có thể nhận về diện tích, hướng của căn khác mà không hay biết.
  Căn cứ: Điền sai lặng lẽ thuộc tính căn là hậu quả khá nặng với người dùng, nhưng dữ liệu mẫu hiện không bị ảnh hưởng và chỉ xuất hiện khi nạp danh mục thật, nên xử lý cùng đợt nạp danh mục thật là hợp lý.
  file: `packages/core/src/catalog/lookup.ts`
  severity: medium
  Đề xuất: new-contract

- **Lệnh đo tỉ lệ lặng lẽ bỏ lead có mã căn không có trong danh mục, làm tỉ lệ cao giả**
  Người dùng thấy gì: Công cụ đo tỉ lệ tự điền có thể báo 100% dù bỏ qua vài mã không có trong danh mục, nếu sau này dữ liệu mẫu bị đổi. Người dùng cuối không gặp điều này, chỉ ảnh hưởng độ tin của con số báo cáo.
  Căn cứ: Không ảnh hưởng người dùng cuối và không mất dữ liệu; con số chỉ có thể lạc quan khi dữ liệu mẫu đổi, mà bài kiểm thử vẫn chặn trường hợp đó.
  file: `packages/api/src/catalog/do-ti-le.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
