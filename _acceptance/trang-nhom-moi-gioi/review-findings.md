## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ kiểm cách ly gọi migrate.mjs thật, trái cam kết «không để lại dữ liệu» ở đầu tệp**
  Người dùng thấy gì: Khi chạy bộ kiểm cách ly trên máy hay cơ sở dữ liệu thử còn thay đổi chờ áp, bộ kiểm có thể tự áp các thay đổi đó. Người dùng sàn không bị ảnh hưởng; chỉ người phát hành có thể thấy kết quả kiểm phụ thuộc trạng thái cơ sở dữ liệu lúc chạy.
  Căn cứ: Không ảnh hưởng người dùng sàn và không mất hay lộ dữ liệu; trên hệ thống kiểm tự động cơ sở dữ liệu đã được cập nhật sẵn nên không có gì đổi, nên chỉ cần ghi lại là hạn chế đã biết.
  file: `packages/db/tests/isolation.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Bộ kiểm cách ly giờ chạy lệnh migrate thật và có thể tự áp migration còn chờ vào cơ sở dữ liệu đang kiểm**
  Người dùng thấy gì: Nếu chạy bộ kiểm cách ly trên cơ sở dữ liệu chưa cập nhật xong, bộ kiểm có thể lặng lẽ áp phần còn thiếu rồi vẫn báo đạt. Người dùng sàn không thấy gì; chỉ người phát hành có thể bị báo đạt khi cơ sở dữ liệu chưa ở đúng trạng thái.
  Căn cứ: Hậu quả nhẹ và chỉ xảy ra khi cơ sở dữ liệu thử chưa cập nhật xong; không mất hay lộ dữ liệu của sàn, người phát hành tự phát hiện được khi chạy lại, nên ghi lại là hạn chế đã biết.
  file: `packages/db/tests/isolation.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Branch adds a second copy of the fee-item set, its labels and its default instead of using @quy-hang/core/fees (r2)**
  Người dùng thấy gì: Hiện trang môi giới vẫn hiện đúng các khoản phí. Nếu sau này sàn đổi bộ khoản phí hay tên gọi, trang môi giới có thể lệch so với màn Cài đặt phí cho tới khi có người sửa thêm một chỗ.
  Căn cứ: Hôm nay người dùng không thấy gì sai, rủi ro chỉ xuất hiện khi bộ khoản phí đổi, và sửa sau vẫn rẻ nên ghi lại là đủ.
  file: `packages/core/src/sharing/trang-moi-gioi.ts`
  severity: medium
  Đề xuất: known-limits

- **Share-level 'Bao phí' snapshot can contradict the per-price stamp that migration 050 already stores (r2)**
  Người dùng thấy gì: Nếu sàn đổi định nghĩa phí sau khi một giá đã được nhập, trang môi giới có thể ghi giá đó đã gồm các khoản mà thực ra lúc tính giá chưa gồm. Môi giới có thể hiểu sai giá đã gồm những phí nào.
  Căn cứ: Có thể làm môi giới bên ngoài hiểu sai giá, nhưng chỉ khi sàn đã đổi định nghĩa phí giữa chừng, và muốn khớp từng giá thì phải làm thành một tính năng riêng.
  file: `packages/api/src/contacts/prospects.ts`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
