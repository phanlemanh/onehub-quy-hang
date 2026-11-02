## Trong hợp đồng

(không có finding)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 3 — lời hứa là QUAN HỆ (đường ghi nằm dưới mã sàn mẫu) nhưng tập đường mong được dựng bằng chính hàm của bên ghi, nên quan hệ ấy không được đo độc lập**
  Người dùng thấy gì: Bài kiểm vẫn xanh nếu hàm dựng đường ảnh của API bỏ sót hay đặt sai mã sàn, vì cả hai bên dùng chung một hàm. Ảnh có thể bị ghi vào sai thư mục kho mà bài kiểm này không báo.
  Căn cứ: Chỉ là khoảng hở của một bài kiểm, không làm mất hay lộ dữ liệu của người dùng. Lỗi dựng đường sai sẽ lộ ra ở các bài kiểm khác của API hoặc khi thử thật, và bổ sung phép đo độc lập sau này rẻ, tách riêng được.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
