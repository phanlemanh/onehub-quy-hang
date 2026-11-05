# Review findings: va-gui-can-da-go

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ kiểm cách ly giờ chạy cả bộ áp migration: phá cam kết «chỉ rollback» và có thể ghi vào cơ sở dữ liệu thật**
  Người dùng thấy gì: Nếu bộ kiểm cách ly được chạy trỏ vào hệ thống thật, nó có thể tự áp các thay đổi cơ sở dữ liệu còn chờ ngoài quy trình phát hành, và không hoàn lại được. Dữ liệu khách không bị lộ, nhưng cam kết «môi trường thật chỉ được đọc» bị phá.
  Căn cứ: Hậu quả nặng nhưng chỉ xảy ra khi ai đó chạy bộ kiểm này trên hệ thống thật; thay đổi đã áp thì không tự gỡ được, còn chuyển ca kiểm sang chỗ đúng thì rẻ và làm sau không mất gì.
  file: `packages/db/tests/isolation.test.mjs`
  severity: high
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
