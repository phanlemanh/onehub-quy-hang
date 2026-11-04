# Review findings: dang-nhap-auth-15

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E13 test (so-thiet-ke) always fails once the branch is merged into main**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Chỉ là khi chạy lại bộ kiểm của hồ sơ này sau khi đã gộp vào nhánh chính, một phép kiểm sẽ báo đỏ dù màn đăng nhập không hỏng.
  Căn cứ: Nhẹ: không ảnh hưởng người dùng cuối, chỉ gây báo đỏ giả cho người bảo trì và họ tự nhận ra được; ghi lại để lần chạy lại sau biết là báo giả.
  file: `_acceptance/dang-nhap-auth-15/thu/so-thiet-ke.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần): phép đếm «số khoá = 4» đếm bảng viết tay của chính phép thử, không đếm CHU_LOI**
  Người dùng thấy gì: Nếu sau này ai đó thêm một loại lỗi thứ năm vào màn đăng nhập, bộ kiểm vẫn báo xanh nên có thể không ai nhận ra loại lỗi mới chưa được rà.
  Căn cứ: Nhẹ: hiện chưa có lỗi nào với người dùng, rủi ro chỉ xảy ra khi có thay đổi sau này, và sửa lúc đó vẫn rẻ.
  file: `apps/web/src/app/(auth)/khung.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): «bản cũ» đối chứng là chuỗi một dòng viết theo đúng khuôn regex, không lấy từ mã cũ thật**
  Người dùng thấy gì: Phép kiểm chống lỗi cũ (báo đã xoá dù xoá hỏng) có thể không bắt được đúng dạng mã cũ thật, nhưng màn hiện tại vẫn báo lỗi và cho thử lại đúng.
  Căn cứ: Nhẹ: màn hiện tại làm đúng, lỗi cũ không quay lại trừ khi ai đó cố tình viết lại, và tốn công sửa lớn hơn nhiều so với rủi ro.
  file: `apps/web/src/app/(auth)/login/may-bi-bao.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

