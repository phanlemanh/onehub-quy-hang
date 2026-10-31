# Review findings: ma-hoa-so-chu (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Migration 008 trỏ sai đường dẫn của lệnh mã hoá lại**
  Người dùng thấy gì: Một ghi chú trong tệp dựng cơ sở dữ liệu chỉ nhầm tên tệp chạy lệnh mã hoá lại. Người vận hành đọc ghi chú đó có thể chạy nhầm, nhưng tài liệu hướng dẫn chính đã chỉ đúng lệnh.
  Căn cứ: Hậu quả nhẹ, không mất hay lộ dữ liệu, nhầm thì chạy lại đúng lệnh; tệp đã chốt không được sửa nên sửa lại sẽ tốn công hơn nhiều so với lợi ích.
  file: `packages/db/migrations/008_ma_hoa_so_chu.sql`
  severity: low
  Đề xuất: wont-fix

- **Đường ghi lead đọc khoá số chủ ở mỗi yêu cầu, không theo nếp đọc một lần lúc dựng như đường chủ nhà**
  Người dùng thấy gì: Hai chỗ ghi số điện thoại chủ nhà lấy khoá theo hai cách khác nhau. Người dùng không thấy khác biệt nào, nhưng sau này sửa một chỗ có thể quên chỗ kia.
  Căn cứ: Hiện không gây lỗi hay lộ số nào cho người dùng, chỉ là rủi ro bảo trì về sau; ghi lại để biết là đủ.
  file: `packages/api/src/leads/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — phép thử chỉ kiểm chiều bị từ chối, nhưng không ghim lỗi: ca vai API chèn lead có số rõ đạt nhờ một luật khác**
  Người dùng thấy gì: Bài kiểm tra việc chặn số điện thoại rõ của lead ở một trong hai đường vẫn xanh dù luật chặn chính bị gỡ, vì một luật khác chặn thay. Việc chặn trong thực tế vẫn hoạt động, nhưng bài kiểm tra có thể không báo động nếu luật chính bị bỏ.
  Căn cứ: Số thật vẫn bị chặn nên chưa mất hay lộ dữ liệu; chỉ là lưới kiểm tra mỏng hơn ở một đường, và có thể bổ sung sau với chi phí thấp.
  file: `packages/db/tests/isolation.test.mjs`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
