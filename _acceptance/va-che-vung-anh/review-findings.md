# Review findings: va-che-vung-anh (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trần cao khung vẽ dùng dvh, trong khi kho đang dùng svh cho trần cao theo màn**
  Người dùng thấy gì: Trên điện thoại, hộp che có thể đổi cỡ một chút khi thanh địa chỉ của trình duyệt hiện hoặc ẩn lúc đang mở. Che vùng vẫn dùng được và không mất dữ liệu.
  Căn cứ: Hậu quả nhẹ, chỉ là khung đổi cỡ nhẹ theo thanh địa chỉ. Không mất dữ liệu, người dùng không cần làm gì để dùng tiếp, và trình che sẽ chuyển sang ngăn nổi ở hàng sau nên không đáng sửa riêng.
  file: `apps/web/src/app/(app)/units/photos/redact/trinh-che.tsx`
  severity: low
  Đề xuất: known-limits

- **Kiểm ranh giới bỏ sót tệp ngoài vùng khi tệp đó bị dời (rename) vào trong vùng**
  Người dùng thấy gì: Công cụ kiểm có thể báo đạt dù một tệp ngoài phạm vi bị dời vào vùng được phép. Người dùng không thấy ảnh hưởng nào, chỉ là lưới an toàn nội bộ hở một góc.
  Căn cứ: Không ảnh hưởng người dùng cuối và hiện không có tệp nào bị dời như vậy. Người duyệt PR vẫn nhìn thấy thay đổi, nên ghi lại là đủ.
  file: `_acceptance/va-che-vung-anh/thu/ranh-gioi.mjs`
  severity: low
  Đề xuất: known-limits

- **E2 đo ảnh nhỏ bằng getBoundingClientRect (tính cả viền) nhưng đòi đúng 400×300, nên sẽ trượt oan**
  Người dùng thấy gì: Bài kiểm có thể chấm trượt oan một bản vá đúng vì đo cả viền 2 điểm ảnh. Người dùng không thấy gì khác, chỉ là người chấm phải tự nới chuẩn khi đo.
  Căn cứ: Không ảnh hưởng người dùng cuối. Chỉ có thể gây một lần chấm trượt oan, và người chấm tự nhận ra rồi chạy lại hoặc nới chuẩn được.
  file: `_acceptance/va-che-vung-anh/evals.yaml`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
