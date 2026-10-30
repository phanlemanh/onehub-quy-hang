# Review findings: moi-nguoi-vai-khu (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 4 — kiểm âm tính một mình: ca «tự gỡ vai quản trị và bỏ hết khu» không có đối chứng dương rằng khu cũ đã được giao**
  Người dùng thấy gì: Một ca kiểm tự động về việc quản trị tự gỡ vai mình và bỏ hết khu có thể báo xanh dù bước giao khu ban đầu không ghi được. Người dùng không gặp lỗi gì trên màn; chỉ là lưới kiểm lỏng hơn ở đúng ca này.
  Căn cứ: Không ảnh hưởng người dùng hay làm mất dữ liệu, chỉ làm lưới kiểm lỏng hơn ở một ca; ca anh em bên cạnh đã kiểm đối chứng nên rủi ro thấp, ghi lại để bổ sung sau.
  file: `packages/api/test-db/members.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Gửi trùng mã khu trong zoneIds làm API trả 500 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu một khu bị chọn hai lần trong cùng một lần lưu, quản trị gặp lỗi chung chung và lần lưu đó không được ghi. Chọn lại cho đúng là lưu được.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, chỉ lần lưu đó thất bại, người dùng thử lại được, và giao diện hiện tại khó tạo ra tình huống này.
  file: `packages/api/src/thanh-vien.ts`
  severity: medium
  Đề xuất: known-limits

- **Biểu thức kiểm mã khu quá lỏng, mã sai định dạng lọt xuống Postgres và thành 500 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi mã khu gửi lên bị sai hình dạng, người dùng nhận lỗi chung thay vì thông báo khu không hợp lệ. Không có dữ liệu nào bị ghi sai.
  Căn cứ: Chỉ xảy ra khi gọi thẳng vào API với mã bịa, màn hình bình thường không tạo ra; không mất hay lộ dữ liệu và thử lại được.
  file: `packages/api/src/thanh-vien.ts`
  severity: medium
  Đề xuất: known-limits

- **Lời mời bị từ chối vẫn tạo tài khoản mới (tạo tài khoản nằm ngoài giao dịch) (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi một lời mời bị từ chối giữa chừng, email đó vẫn có tài khoản nhưng chưa thuộc sàn nào. Lần mời lại sau đó vẫn hoạt động bình thường.
  Căn cứ: Tài khoản mồ côi không có quyền gì và không lộ dữ liệu; mời lại là xong, nên hậu quả nhẹ và hiếm gặp.
  file: `packages/api/src/thanh-vien.ts`
  severity: low
  Đề xuất: known-limits

- **Users page reads the error body as a member list for any non-403 status (r1)**
  Người dùng thấy gì: Nếu phiên hết hạn hoặc máy chủ lỗi đúng lúc mở trang Người dùng, trang bị sập thay vì báo lỗi. Tải lại hoặc đăng nhập lại là dùng tiếp được.
  Căn cứ: Chỉ xảy ra khi phiên hết hạn hoặc máy chủ lỗi, không mất dữ liệu và người dùng tự khắc phục bằng tải lại.
  file: `apps/web/src/app/settings/users/page.tsx`
  severity: low
  Đề xuất: known-limits

- **The zone ID check lets malformed strings through, and the API returns 500 instead of 400 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Mã khu sai hình dạng làm lần lưu thất bại với lỗi chung thay vì thông báo rõ. Không dữ liệu nào bị ghi.
  Căn cứ: Chỉ gặp khi gọi thẳng API với mã bịa, không mất hay lộ dữ liệu, thử lại được.
  file: `packages/api/src/thanh-vien.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm-tính-một-mình): đường DELETE trong ma trận «năm đường» không có đối chứng quản trị và không ghim thông điệp (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm việc chặn người thường bỏ thành viên chưa chứng minh chặt rằng quản trị bỏ được và lý do chặn đúng. Người dùng không thấy khác biệt.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp; chỉ làm bài kiểm kém chặt, bổ sung sau rẻ.
  file: `packages/api/test-db/members.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (đầu vào viết tay đã chuẩn sẵn): ca «email viết hoa có khoảng trắng» tự trim trước khi gửi (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm nói đã phủ email có khoảng trắng nhưng thực ra chưa thử đầu vào thô. Người dùng không thấy khác biệt ngay.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; nếu sau này bỏ bước làm sạch thì bài kiểm không bắt được, nhưng sửa bài kiểm rẻ.
  file: `packages/api/test-db/members.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: so «cùng mã, cùng hình dạng thân» mà không neo chiều dương (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm so hai lời mời giống nhau nhưng chưa xác nhận cả hai thật sự thành công. Người dùng không thấy khác biệt.
  Căn cứ: Chỉ làm bài kiểm kém chặt, không gây hại cho người dùng; các ca khác đã phủ việc mời thành công.
  file: `packages/api/test-db/members.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: các phép kiểm rowCount = 0 ở tầng cơ sở dữ liệu không có đối chứng cùng câu lệnh cho thấy bằng 1 (r1)**
  Người dùng thấy gì: Bài kiểm cách ly chưa chứng minh rằng việc bị chặn là do luật chứ không phải do câu lệnh vốn không khớp dòng nào. Người dùng không thấy khác biệt.
  Căn cứ: Chưa có dấu hiệu rò rỉ thật; chỉ là bằng chứng kiểm kém chặt, sửa sau rẻ.
  file: `packages/db/tests/isolation.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tên ca hứa hai tầng, assert chỉ một): ca E4 «…ở API (400) và ở cơ sở dữ liệu (khoá ngoại)» không đo tầng cơ sở dữ liệu (r1 · tệp đã đổi)**
  Người dùng thấy gì: Tên một bài kiểm hứa kiểm cả hai tầng chặn khu của sàn khác nhưng chỉ kiểm một tầng. Người dùng không thấy khác biệt.
  Căn cứ: Hành vi sản phẩm không bị ảnh hưởng, tầng còn lại đã được kiểm ở chỗ khác; chỉ gây hiểu nhầm nhẹ cho người đọc.
  file: `packages/api/test-db/members.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
