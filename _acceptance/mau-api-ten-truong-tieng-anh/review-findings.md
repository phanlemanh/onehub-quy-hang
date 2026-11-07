# Review findings: mau-api-ten-truong-tieng-anh

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng tên cũ là object thường nên khoá trùng tên thuộc tính có sẵn cho ra lý do từ chối sai**
  Người dùng thấy gì: Nếu ai đó gửi lên mẫu có một khoá lạ trùng tên một thuộc tính sẵn có của hệ thống, lần lưu vẫn bị từ chối đúng, nhưng lời báo lỗi kèm một gợi ý tên đúng vô nghĩa. Dữ liệu của sàn không bị hỏng.
  Căn cứ: Hậu quả nhẹ: chỉ lệch chữ trong lời báo lỗi ở trường hợp rất hiếm, không mất hay lộ dữ liệu, người dùng thử lại với khoá đúng là xong; ghi lại làm hạn chế đã biết là đủ.
  file: `packages/core/src/export/mau-san.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
