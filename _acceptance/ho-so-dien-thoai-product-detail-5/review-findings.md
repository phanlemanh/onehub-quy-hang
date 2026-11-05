# Review findings: ho-so-dien-thoai-product-detail-5 (round 2)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Trưởng nhóm không có vai đầu chủ thấy nút chính «Ghi cuộc gọi», bấm vào ra trang không tồn tại**
  Người dùng thấy gì: Trưởng nhóm không giữ căn sẽ thấy nút «Ghi cuộc gọi» ở đáy màn điện thoại, bấm vào thì ra trang báo không thấy. Nút trông dùng được nhưng không đưa đến đâu.
  Căn cứ: Hậu quả nhẹ vì không mất hay lộ dữ liệu, người dùng chỉ quay lại được ngay; nhưng sửa phải chốt trước quyền ghi cuộc gọi của trưởng nhóm nên nên đăng thành việc riêng.
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **Trưởng nhóm không có vai Đầu chủ thấy nút «Ghi cuộc gọi» dẫn tới trang 404**
  Người dùng thấy gì: Trưởng nhóm thuần thấy nút «Ghi cuộc gọi» dính đáy màn điện thoại nhưng bấm vào ra trang không tồn tại.
  Căn cứ: Không mất hay lộ dữ liệu và người dùng quay lại được ngay, nhưng cần chốt quyền ghi cuộc gọi của trưởng nhóm nên làm thành việc riêng cùng việc với lỗi trùng.
  file: `apps/web/src/app/(app)/units/ho-so/mo-hinh.ts`
  severity: medium
  Đề xuất: new-contract

- **Ảnh lớn đầu hồ sơ điện thoại không cập nhật sau khi tải ảnh lên ở mục Ảnh**
  Người dùng thấy gì: Sau khi tải ảnh đầu tiên lên, khung ảnh lớn ở đầu hồ sơ vẫn báo «Chưa có ảnh» cho tới khi đóng rồi mở lại hồ sơ. Xoá ảnh cũng vậy, khung vẫn hiện ảnh cũ.
  Căn cứ: Không mất dữ liệu, ảnh đã lưu đúng và người dùng tự khắc phục bằng cách mở lại hồ sơ; hàng 41 về chụp ảnh sẽ chạm đúng chỗ này nên sửa ở đó rẻ hơn.
  file: `apps/web/src/app/(app)/units/ho-so/dien-thoai/anh-lon.tsx`
  severity: low
  Đề xuất: known-limits

- **Script chụp trang ba lối mở trang đã bị gỡ và đọc một data-slot không tồn tại nên luôn được null**
  Người dùng thấy gì: Một công cụ chụp thử phục vụ so sánh ba lối dựng đã hết dùng và sẽ hỏng nếu ai chạy lại. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Không chạm sản phẩm và người dùng, trang nó chụp đã được gỡ nên sửa không có giá trị.
  file: `_acceptance/ho-so-dien-thoai-product-detail-5/thu/chup-ba-loi.mjs`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
