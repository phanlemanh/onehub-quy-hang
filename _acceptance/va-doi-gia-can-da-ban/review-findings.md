# Review findings: va-doi-gia-can-da-ban

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mô tả OpenAPI cho 422 của lệnh hàng chưa nêu ca mới price-locked-closed**
  Người dùng thấy gì: Tài liệu API công bố cho bên ngoài chưa nhắc rằng đổi giá một căn Đã bán sẽ bị từ chối. Hệ thống vẫn từ chối đúng và trả lý do rõ, chỉ là người đọc tài liệu không biết trước.
  Căn cứ: Nhẹ: không mất hay lộ dữ liệu, hành vi thật đúng và có lý do tiếng Việt, người tích hợp thấy ngay khi gặp lỗi; sửa một dòng mô tả rẻ nên có thể làm ở lượt sau.
  file: `packages/api/src/listings/routes.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
