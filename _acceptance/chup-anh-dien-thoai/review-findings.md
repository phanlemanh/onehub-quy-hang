## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 3 (đo chuỗi có mặt thay vì quan hệ): E7 không đo được thứ tự «lượt tải đang dở xong rồi mới xoá kho»**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng khi đăng xuất, ảnh đang tải dở được chờ xong rồi mới xoá kho. Nếu sau này ai đó đổi thứ tự này, bài kiểm vẫn xanh và một ảnh đang tải dở có thể bị mất hoặc tải lại sai chỗ.
  Căn cứ: Hiện chưa có lỗi thật nào với người dùng, chỉ là lưới kiểm chưa bắt được một thay đổi tương lai; hậu quả nhẹ, hiếm gặp và sửa bài kiểm cũng không đắt.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-may.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (kiểm âm một mình): `conChayLucXoa` vẫn false nếu hàm xoá giả không hề được gọi**
  Người dùng thấy gì: Bài kiểm có thể vẫn xanh dù lệnh xoá kho không chạy lần nào khi đăng xuất hay máy bị báo mất. Hiện chưa thấy lỗi thật, chỉ là lưới kiểm chỗ này chưa chắc tay.
  Căn cứ: Không có hậu quả đang xảy ra cho người dùng, các bài kiểm khác của việc xoá khi đăng xuất đã che phần lớn rủi ro này, nên chấp nhận và ghi vết là đủ.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-may.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

