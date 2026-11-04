# Review findings: dang-nhap-auth-15 (round 2)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hai dòng trong E11-network.txt ghi hai đường dẫn khác nhau cho cùng một yêu cầu nhập mã sai**
  Người dùng thấy gì: Hồ sơ nghiệm thu có một dòng ghi nhầm địa chỉ của yêu cầu nhập mã sai, nên người đọc hồ sơ có thể phân vân. Người dùng cuối không bị ảnh hưởng gì.
  Căn cứ: Chỉ là chữ chép sai trong hồ sơ, không đụng màn hình hay dữ liệu của người dùng; ghi lại là đủ, ai cần thì sửa sau với chi phí rất rẻ.
  file: `_acceptance/dang-nhap-auth-15/evidence/E11-network.txt`
  severity: low
  Đề xuất: known-limits

- **E11-network.txt ghi sai đường dẫn API ở dòng lỗi console, mâu thuẫn với dòng request ngay bên dưới**
  Người dùng thấy gì: Hồ sơ nghiệm thu ghi sai địa chỉ ở dòng lỗi, mâu thuẫn với dòng bên dưới, nên khó đối chiếu lỗi với đúng yêu cầu. Người dùng cuối không thấy gì khác.
  Căn cứ: Chỉ ảnh hưởng người đọc hồ sơ, không làm mất hay lộ dữ liệu và không đổi hành vi đăng nhập; ghi nhận là đủ vì hậu quả rất nhẹ.
  file: `_acceptance/dang-nhap-auth-15/evidence/E11-network.txt`
  severity: low
  Đề xuất: known-limits

- **E13 test (so-thiet-ke) always fails once the branch is merged into main (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Chỉ là khi chạy lại bộ kiểm của hồ sơ này sau khi đã gộp vào nhánh chính, một phép kiểm sẽ báo đỏ dù màn đăng nhập không hỏng.
  Căn cứ: Nhẹ: không ảnh hưởng người dùng cuối, chỉ gây báo đỏ giả cho người bảo trì và họ tự nhận ra được; ghi lại để lần chạy lại sau biết là báo giả.
  file: `_acceptance/dang-nhap-auth-15/thu/so-thiet-ke.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (thiếu ma trận toàn phần): phép đếm «số khoá = 4» đếm bảng viết tay của chính phép thử, không đếm CHU_LOI (r1)**
  Người dùng thấy gì: Nếu sau này ai đó thêm một loại lỗi thứ năm vào màn đăng nhập, bộ kiểm vẫn báo xanh nên có thể không ai nhận ra loại lỗi mới chưa được rà.
  Căn cứ: Nhẹ: hiện chưa có lỗi nào với người dùng, rủi ro chỉ xảy ra khi có thay đổi sau này, và sửa lúc đó vẫn rẻ.
  file: `apps/web/src/app/(auth)/khung.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay): «bản cũ» đối chứng là chuỗi một dòng viết theo đúng khuôn regex, không lấy từ mã cũ thật (r1)**
  Người dùng thấy gì: Phép kiểm chống lỗi cũ (báo đã xoá dù xoá hỏng) có thể không bắt được đúng dạng mã cũ thật, nhưng màn hiện tại vẫn báo lỗi và cho thử lại đúng.
  Căn cứ: Nhẹ: màn hiện tại làm đúng, lỗi cũ không quay lại trừ khi ai đó cố tình viết lại, và tốn công sửa lớn hơn nhiều so với rủi ro.
  file: `apps/web/src/app/(auth)/login/may-bi-bao.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/2 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dang-nhap-auth-15/evidence/E11-network.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.

