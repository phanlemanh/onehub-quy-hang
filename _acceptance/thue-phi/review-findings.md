# Review findings: thue-phi (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng nhãn ngắn của khoản phí viết cứng trong màn, ngoài packages/core**
  Người dùng thấy gì: Dòng phụ ở hồ sơ căn gọi tên khoản phí bằng một bảng chữ riêng. Nếu sau này đổi tên khoản ở chỗ chung, dòng này có thể còn tên cũ.
  Căn cứ: Hiện chữ vẫn đúng và không mất dữ liệu; chỉ lệch khi đổi tên khoản sau này, và sửa lúc đó rẻ.
  file: `apps/web/src/app/(app)/units/ho-so/dinh-nghia.ts`
  severity: medium
  Đề xuất: known-limits

- **Bảng đổi mã khoản (lõi sang mã sổ) bị chép lại ở màn thay vì dùng bảng của lõi**
  Người dùng thấy gì: Màn Thuế phí giữ một bản chép riêng của bảng mã khoản. Người dùng không thấy khác biệt nào hôm nay.
  Căn cứ: Không ảnh hưởng người dùng lúc này, không mất dữ liệu; chỉ là nợ dọn mã, sửa sau rẻ và có thể làm khi đụng tới.
  file: `apps/web/src/app/(app)/settings/fees/thue-phi.ts`
  severity: low
  Đề xuất: wont-fix

- **Dòng định nghĩa bao phí đọc dấu cũ khi giá mới còn trong hàng đợi đồng bộ, và không bao giờ đọc lại**
  Người dùng thấy gì: Khi đầu chủ vừa sửa giá mà máy chưa gửi lên được (mạng yếu), dòng phụ ở hồ sơ căn có thể hiện định nghĩa và số về tay lệch nhau. Dòng sai đó đứng nguyên tới khi giá đổi lần nữa hoặc tải lại màn.
  Căn cứ: Gây hiểu nhầm số về tay trong lúc mạng yếu nhưng không mất dữ liệu, và tải lại màn là hết; chỉ sai ở cửa sổ ngắn.
  file: `apps/web/src/app/(app)/units/ho-so/dong-dinh-nghia.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4: kiểm âm tính đứng một mình. Chiều đỏ «không đọc định nghĩa hiện hành» chỉ đo số tham số và lặp lại ca dương**
  Người dùng thấy gì: Dòng phụ ở hồ sơ căn có thể vẫn đúng, nhưng bài kiểm chưa chứng minh chắc rằng số «về tay» luôn theo định nghĩa lúc ghi giá chứ không theo định nghĩa hiện hành của sàn. Nếu sau này có người sửa nhầm, bài kiểm có thể không báo.
  Căn cứ: Đây chỉ là lưới kiểm còn mỏng, không làm người dùng thấy số sai hay mất dữ liệu ngay; bổ sung ca đối chứng sau này rẻ và không gấp.
  file: `apps/web/src/app/(app)/units/ho-so/dinh-nghia.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
