# Review findings: bat-rang-buoc-ban-ma

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 3 — chỉ kiểm chuỗi có mặt, trong khi điều cần đo là lời nhắc được gắn đúng tên tệp 013 (quan hệ)**
  Người dùng thấy gì: Bài kiểm tự động chưa chứng minh được rằng lời nhắc về số điện thoại chưa mã hoá luôn ghi rõ là do bước nâng cấp nào phát ra. Nếu phần ghi nguồn này sai, bài kiểm vẫn báo xanh, nhưng nội dung lời nhắc và việc bật ràng buộc vẫn đúng.
  Căn cứ: Hậu quả nhẹ: chỉ là nhãn nguồn trong log deploy có thể sai mà không bị bắt, không mất hay lộ dữ liệu, người vận hành vẫn đọc được tên bảng và lệnh cần chạy; sửa sau rẻ và không gấp.
  file: `packages/api/test-db/bat-rang-buoc-migrate.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
