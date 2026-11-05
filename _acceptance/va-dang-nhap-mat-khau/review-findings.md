# Review findings: va-dang-nhap-mat-khau (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **A disabled account can get a false 'locked after 20 failures' event and lose all sessions**
  Người dùng thấy gì: Người đã bị vô hiệu mật khẩu vì lý do khác (mất máy, vào sàn khác) mà còn gõ sai đủ 20 lần sẽ bị ghi nhầm là «khoá do sai 20 lần» và mất các phiên đăng nhập bằng mã 6 số đã mở sau đó.
  Căn cứ: Hiếm gặp, chỉ ảnh hưởng nhật ký sai lý do và buộc đăng nhập lại bằng mã; không mất dữ liệu, người dùng tự đăng nhập lại được.
  file: `packages/api/src/auth/trang-thai-mat-khau.ts`
  severity: low
  Đề xuất: known-limits

- **Change-password returns 'wrong current password' after it has already logged the user out**
  Người dùng thấy gì: Ở lần gõ sai mật khẩu hiện tại thứ 20, người dùng bị đăng xuất ngầm nhưng màn hình vẫn báo «Mật khẩu hiện tại không đúng»; thử lại thì chỉ thấy «Có lỗi, thử lại sau ít phút» mà không biết phải đăng nhập lại.
  Căn cứ: Gây bối rối nhưng không mất dữ liệu và không lộ thông tin; người dùng tải lại trang là thấy màn đăng nhập, và sửa câu báo sau này rẻ.
  file: `packages/api/src/me/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): bài «trạng thái của hàng 6 còn đủ» chỉ dò chữ trong mã nguồn form đăng nhập**
  Người dùng thấy gì: Bài kiểm màn đăng nhập chỉ dò chữ trong mã nên có thể báo xanh dù màn thật hiển thị sai trạng thái, hoặc báo đỏ oan khi chỉ đổi cách viết mã.
  Căn cứ: Không ảnh hưởng trực tiếp người dùng cuối, chỉ làm lưới an toàn của đội lỏng hơn; ghi nhận rồi cải thiện khi đụng tới màn đăng nhập.
  file: `apps/web/src/app/(auth)/khung.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
