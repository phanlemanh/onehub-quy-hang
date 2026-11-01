## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **After a change syncs, the listing loses its holder and last-change info until the next full pull, so it drops out of Hôm nay**
  Người dùng thấy gì: Sau khi đầu chủ đổi giá hay trạng thái một căn ở Bảng hàng hoặc Hồ sơ, căn đó có thể tạm biến khỏi màn Hôm nay cho đến lần tải lại dữ liệu kế tiếp. Nếu lần tải lại đó lỗi hoặc mất mạng thì căn vắng lâu hơn, và màn không báo gì.
  Căn cứ: Không mất dữ liệu và tự hết khi tải lại thành công, người dùng tự khắc phục được bằng cách mở lại hoặc chờ đồng bộ; nhưng căn biến âm thầm có thể khiến đầu chủ bỏ sót việc trong lúc chờ.
  file: `packages/api/src/listings/routes.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
