## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **AC-9 viết lại nhưng eval duy nhất có criterion AC-9 là E23; E20 vẫn gắn AC-11**
  Người dùng thấy gì: Người dùng không gặp lỗi nào; chỉ là bảng chấm của cổng có thể báo AC-9 đạt mà chưa chấm riêng chữ trạng thái mật khẩu và nhãn nút ở màn Cá nhân.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu, chỉ làm bằng chứng nghiệm thu yếu hơn một chút; nhãn vẫn được bộ test kiểm nên ghi lại là đủ.
  file: `_acceptance/dang-nhap-mat-khau/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **E13 chưa đòi đủ các vế mà AC-10 vừa thêm**
  Người dùng thấy gì: Đăng xuất hiện chạy đúng; rủi ro chỉ là nếu sau này ai xoá bài test thì cổng vẫn báo đạt và lỗi đăng xuất lúc mất mạng có thể quay lại mà không ai biết.
  Căn cứ: Hiện chưa có hậu quả với người dùng, chỉ là lưới an toàn về sau mỏng hơn; người dùng tự thử lại được nếu lỗi quay lại, nên ghi nhận là đủ.
  file: `_acceptance/dang-nhap-mat-khau/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Thẻ cổng và trang bằng chứng còn là bản trước khi thu phạm vi; ảnh của ba eval đã gỡ vẫn nằm trong hồ sơ**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng; người ký có thể thấy trang bằng chứng ghi vài kiểm tra giao diện còn rớt dù phần đó đã được thu ra ngoài phạm vi.
  Căn cứ: Chỉ gây nhầm lẫn khi đọc hồ sơ, không mất dữ liệu và vẽ lại trang là xong; ghi lại để người ký biết trang cũ là đủ.
  file: `_acceptance/dang-nhap-mat-khau/evidence-page.html`
  severity: low
  Đề xuất: known-limits

- **AC-9 sau thu phạm vi được khai «đo bằng E20, E23», nhưng E20 gắn AC-11 nên phần sáu nhóm và dòng «Mật khẩu» không được chấm dưới AC-9**
  Người dùng thấy gì: Người dùng không gặp lỗi; chỉ là nếu màn Cá nhân bị hỏng thì cổng có thể báo đỏ ở tiêu chí khác, khiến người đọc khó biết phần nào của màn mật khẩu hỏng.
  Căn cứ: Hậu quả chỉ nằm ở việc đọc kết quả nghiệm thu, không ảnh hưởng người dùng hay dữ liệu; đây là bản trùng của lỗi ghép nhãn nên ghi chung một chỗ là đủ.
  file: `_acceptance/dang-nhap-mat-khau/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hai ảnh nháp tmp-pre-* bị commit vào thư mục bằng chứng của hồ sơ dang-nhap-mat-khau (r3 · tệp đã đổi)**
  Người dùng thấy gì: Hai ảnh chụp nháp của người chấm còn nằm lẫn trong thư mục bằng chứng. Người dùng cuối không bị ảnh hưởng gì; chỉ người ký hồ sơ có thể mất chút thời gian phân biệt ảnh nháp với ảnh bằng chứng thật.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; chỉ thêm hai tệp ảnh thừa vô hại, xoá lúc nào cũng được nên không đáng mở việc riêng.
  file: `_acceptance/dang-nhap-mat-khau/evidence/tmp-pre-1280.png`
  severity: low
  Đề xuất: wont-fix

- **Joining another company disables the company-issued password but leaves sessions open, so a leftover session can set a new password without the old one (r1)**
  Người dùng thấy gì: Nếu quản trị sàn cũ đã vào bằng mật khẩu tạm trước người dùng, phiên của họ vẫn sống sau khi người dùng sang sàn mới. Họ có thể đặt mật khẩu mới mà họ biết và tiếp tục đóng vai người dùng đó.
  Căn cứ: Hậu quả nặng vì lộ tài khoản sang sàn khác và người dùng khó tự phát hiện, nhưng chỉ xảy ra khi quản trị cũ cố ý vào trước; sửa sau vẫn rẻ vì chỉ là thu phiên lúc vô hiệu mật khẩu.
  file: `packages/db/migrations/034_mat_khau.sql`
  severity: high
  Đề xuất: new-contract

- **PUT /api/v1/me/password checks the current password with no attempt limit and no failure count (r1)**
  Người dùng thấy gì: Ai đang giữ một phiên mở có thể đoán mật khẩu hiện tại không giới hạn lần để đổi mật khẩu và khoá chủ tài khoản ra ngoài.
  Căn cứ: Cần có phiên hợp lệ mới khai thác được nên rủi ro vừa, nhưng hậu quả là mất tài khoản và người dùng không tự gỡ được; sửa sau không đắt.
  file: `packages/api/src/me/routes.ts`
  severity: medium
  Đề xuất: new-contract

- **Đăng nhập bằng mật khẩu: lỗi mạng bị nuốt, người dùng không thấy báo lỗi (r1)**
  Người dùng thấy gì: Khi mất mạng lúc đăng nhập, người dùng bấm nút mà không thấy câu báo lỗi nào, chỉ thấy nút bật lại.
  Căn cứ: Nhẹ vì không mất dữ liệu và người dùng chỉ cần bấm lại khi có mạng; sửa sau rất rẻ.
  file: `apps/web/src/app/(auth)/login/form.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình 6 — phép đo theo nhánh đang mở chứ không theo cây của tính năng: «không đổi auth» và «không sửa migration» đo merge-base(HEAD, main)..HEAD (r1)**
  Người dùng thấy gì: Bài kiểm cũ của một tính năng khác có thể báo đỏ oan trên nhánh này và báo xanh vô nghĩa sau khi gộp vào nhánh chính. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng độ tin của bài kiểm nội bộ, không gây mất hay lộ dữ liệu; chạy lại hoặc ghi chú là đủ, sửa sau rẻ.
  file: `_acceptance/dang-nhap-auth-15/thu/khong-doi-auth.test.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/dang-nhap-mat-khau/evals.yaml, _acceptance/dang-nhap-mat-khau/evidence-page.html) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
