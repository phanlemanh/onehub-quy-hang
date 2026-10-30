## Trong hợp đồng

- **PATCH that removes the admin's own admin role then hits zone rules as a non-admin: either a 403 or zones silently not removed**
  AC: AC-4
  file: `packages/api/src/thanh-vien.ts:165`
  severity: medium
  source: bugs
  detail: Inside one transaction the handler first runs `update company_members set roles = $2` (line 166) and then `datKhu` (line 168). datKhu's delete and insert on member_zones are gated by RLS policies that call app.current_user_is_admin(). That is a STABLE SQL function and it queries company_members. Under READ COMMITTED every new statement sees earlier writes from the same transaction. So when an admin edits their own row and unticks 'Quản trị sàn' while another admin still exists, the later statements no longer count them as admin. (1) If any zone is ticked, the insert fails the WITH CHECK, Postgres returns 42501, and the API answers 403 'can-quan-tri'. The UI shows the generic 'Có lỗi, thử lại.' and the self-demotion cannot be saved. (2) If the admin had zones and unticks all of them, the delete matches 0 rows under the USING clause with no error, the role change commits, and the API returns 200. The old zones stay in place without any error (silent failure). The UI always sends both roles and zoneIds, so the screen reaches this path. Fix: run datKhu before the roles update, or compare the zone set before deleting.
  rationale: Giao khu phải cho thành viên mang đúng các khu đã chọn; ở đường tự gỡ vai quản trị, lần lưu báo 403 hoặc lặng lẽ giữ khu cũ nên không đúng các khu ấy.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gửi trùng mã khu trong zoneIds làm API trả 500**
  Người dùng thấy gì: Nếu một khu bị chọn hai lần trong cùng một lần lưu, quản trị gặp lỗi chung chung và lần lưu đó không được ghi. Chọn lại cho đúng là lưu được.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, chỉ lần lưu đó thất bại, người dùng thử lại được, và giao diện hiện tại khó tạo ra tình huống này.
  file: `packages/api/src/thanh-vien.ts`
  severity: medium
  Đề xuất: known-limits

- **Biểu thức kiểm mã khu quá lỏng, mã sai định dạng lọt xuống Postgres và thành 500**
  Người dùng thấy gì: Khi mã khu gửi lên bị sai hình dạng, người dùng nhận lỗi chung thay vì thông báo khu không hợp lệ. Không có dữ liệu nào bị ghi sai.
  Căn cứ: Chỉ xảy ra khi gọi thẳng vào API với mã bịa, màn hình bình thường không tạo ra; không mất hay lộ dữ liệu và thử lại được.
  file: `packages/api/src/thanh-vien.ts`
  severity: medium
  Đề xuất: known-limits

- **Lời mời bị từ chối vẫn tạo tài khoản mới (tạo tài khoản nằm ngoài giao dịch)**
  Người dùng thấy gì: Khi một lời mời bị từ chối giữa chừng, email đó vẫn có tài khoản nhưng chưa thuộc sàn nào. Lần mời lại sau đó vẫn hoạt động bình thường.
  Căn cứ: Tài khoản mồ côi không có quyền gì và không lộ dữ liệu; mời lại là xong, nên hậu quả nhẹ và hiếm gặp.
  file: `packages/api/src/thanh-vien.ts`
  severity: low
  Đề xuất: known-limits

- **Users page reads the error body as a member list for any non-403 status**
  Người dùng thấy gì: Nếu phiên hết hạn hoặc máy chủ lỗi đúng lúc mở trang Người dùng, trang bị sập thay vì báo lỗi. Tải lại hoặc đăng nhập lại là dùng tiếp được.
  Căn cứ: Chỉ xảy ra khi phiên hết hạn hoặc máy chủ lỗi, không mất dữ liệu và người dùng tự khắc phục bằng tải lại.
  file: `apps/web/src/app/settings/users/page.tsx`
  severity: low
  Đề xuất: known-limits

- **The zone ID check lets malformed strings through, and the API returns 500 instead of 400**
  Người dùng thấy gì: Mã khu sai hình dạng làm lần lưu thất bại với lỗi chung thay vì thông báo rõ. Không dữ liệu nào bị ghi.
  Căn cứ: Chỉ gặp khi gọi thẳng API với mã bịa, không mất hay lộ dữ liệu, thử lại được.
  file: `packages/api/src/thanh-vien.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm-tính-một-mình): đường DELETE trong ma trận «năm đường» không có đối chứng quản trị và không ghim thông điệp**
  Người dùng thấy gì: Bài kiểm việc chặn người thường bỏ thành viên chưa chứng minh chặt rằng quản trị bỏ được và lý do chặn đúng. Người dùng không thấy khác biệt.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp; chỉ làm bài kiểm kém chặt, bổ sung sau rẻ.
  file: `packages/api/test-db/members.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (đầu vào viết tay đã chuẩn sẵn): ca «email viết hoa có khoảng trắng» tự trim trước khi gửi**
  Người dùng thấy gì: Bài kiểm nói đã phủ email có khoảng trắng nhưng thực ra chưa thử đầu vào thô. Người dùng không thấy khác biệt ngay.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; nếu sau này bỏ bước làm sạch thì bài kiểm không bắt được, nhưng sửa bài kiểm rẻ.
  file: `packages/api/test-db/members.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4: so «cùng mã, cùng hình dạng thân» mà không neo chiều dương**
  Người dùng thấy gì: Bài kiểm so hai lời mời giống nhau nhưng chưa xác nhận cả hai thật sự thành công. Người dùng không thấy khác biệt.
  Căn cứ: Chỉ làm bài kiểm kém chặt, không gây hại cho người dùng; các ca khác đã phủ việc mời thành công.
  file: `packages/api/test-db/members.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: các phép kiểm rowCount = 0 ở tầng cơ sở dữ liệu không có đối chứng cùng câu lệnh cho thấy bằng 1**
  Người dùng thấy gì: Bài kiểm cách ly chưa chứng minh rằng việc bị chặn là do luật chứ không phải do câu lệnh vốn không khớp dòng nào. Người dùng không thấy khác biệt.
  Căn cứ: Chưa có dấu hiệu rò rỉ thật; chỉ là bằng chứng kiểm kém chặt, sửa sau rẻ.
  file: `packages/db/tests/isolation.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tên ca hứa hai tầng, assert chỉ một): ca E4 «…ở API (400) và ở cơ sở dữ liệu (khoá ngoại)» không đo tầng cơ sở dữ liệu**
  Người dùng thấy gì: Tên một bài kiểm hứa kiểm cả hai tầng chặn khu của sàn khác nhưng chỉ kiểm một tầng. Người dùng không thấy khác biệt.
  Căn cứ: Hành vi sản phẩm không bị ảnh hưởng, tầng còn lại đã được kiểm ở chỗ khác; chỉ gây hiểu nhầm nhẹ cho người đọc.
  file: `packages/api/test-db/members.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/11 lỗi rơi vào file không bộ đo nào phủ (packages/api/test-db/members.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
