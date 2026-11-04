# Review findings: cau-hinh-theo-san (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A change to one half of the deadline pair is checked against reset defaults, not the stored values, so it can return 200 and still not take effect**
  Người dùng thấy gì: Nếu sàn đã có sẵn một cặp hạn nhận và hạn gọi trái luật từ dữ liệu cũ, quản trị đổi một nửa cặp vẫn thấy báo thành công nhưng giá trị không có hiệu lực. Lead vẫn chạy theo hạn mặc định 15/30 phút.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, lead vẫn chạy theo hạn mặc định an toàn, và chỉ xảy ra khi sàn đã có sẵn cặp hạn trái luật từ dữ liệu cũ; quản trị tự gỡ được bằng cách đặt cả hai hạn cùng lúc.
  file: `packages/api/src/settings/store.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
