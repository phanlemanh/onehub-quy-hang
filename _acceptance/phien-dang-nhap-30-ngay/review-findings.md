# Review findings: phien-dang-nhap-30-ngay (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gói API (tầng dưới) giờ phụ thuộc vào ứng dụng web và Next.js, dù không khai báo các phụ thuộc này**
  Người dùng thấy gì: Người dùng không thấy gì khác: đăng nhập 30 ngày vẫn chạy đúng. Chỉ là phần kiểm thử của lớp API đang dựa vào phần giao diện web, nên về sau dễ vỡ hoặc rối khi dựng lại môi trường.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ gây phiền cho người làm kỹ thuật về sau, và dọn lại bất cứ lúc nào cũng rẻ.
  file: `packages/api/test-db/session.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
