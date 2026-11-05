## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **On phones, opening Today from a notification (?lead=) or from a group link (?nhom=) no longer scrolls to or highlights the row**
  Người dùng thấy gì: Trên điện thoại, khi chạm vào thông báo hoặc liên kết nhóm để vào Hôm nay, đầu chủ chỉ thấy cả danh sách, không được cuộn tới và không thấy nổi bật đúng việc cần xem. Họ phải tự tìm việc đó trong danh sách.
  Căn cứ: Không mất dữ liệu và đầu chủ vẫn tự tìm được việc bằng cách cuộn, nhưng thông báo là lối vào hay dùng nên sẽ gặp thường xuyên; sửa cần một việc riêng có hợp đồng.
  file: `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 3 — kiểm «chuỗi có mặt» trong khi lời hứa là quan hệ trên/dưới của thẻ hai tầng (E2)**
  Người dùng thấy gì: Hiện tại thẻ trên điện thoại hiển thị đúng, nhưng nếu sau này ai đó vô tình đảo tên căn với lý do và giá, bài kiểm tự động sẽ không báo. Đầu chủ khi đó sẽ thấy thẻ sai thứ tự mà không ai hay.
  Căn cứ: Hôm nay người dùng không bị ảnh hưởng gì, chỉ là lưới an toàn cho lần sửa sau còn lỏng; ghi lại là đủ và bổ sung bài kiểm lúc nào cũng được, rẻ.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — assertion âm tính một mình: mở số chủ 404 chỉ kiểm ok=false, không ghim lời «chưa có số» (E4)**
  Người dùng thấy gì: Khi căn không có số chủ để mở, hiện không có bài kiểm nào bảo đảm đầu chủ được báo đúng lời «chưa có số». Nếu sau này lỗi này bị báo nhầm thành mất mạng hay hết phiên, đầu chủ sẽ hiểu sai nguyên nhân.
  Căn cứ: Hiện chưa thấy người dùng bị sai lời báo, chỉ là bài kiểm chưa khoá; đầu chủ thử lại hoặc gọi tay được nên hậu quả nhẹ, sửa bài kiểm rẻ nhưng không gấp.
  file: `apps/web/src/app/(app)/today/mobile/goi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — chiều đỏ không ghim thông điệp: xếp nhóm theo tên chỉ kiểm length > 0 (E1)**
  Người dùng thấy gì: Bài kiểm xác nhận thứ tự nhóm trên điện thoại giống máy tính có thể báo lệch vì lý do khác thay vì đúng lý do thứ tự. Người dùng không thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng người dùng và các bài kiểm khác trong cùng tệp đã ghim đúng chỗ lệch; chi phí sửa nhỏ nhưng lợi ích gần như không có.
  file: `apps/web/src/app/(app)/today/mobile/danh-sach.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

