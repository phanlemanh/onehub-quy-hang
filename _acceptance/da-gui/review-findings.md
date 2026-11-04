# Review findings: da-gui (round 1)

## Trong hợp đồng

- **app.disable_share mở cửa khi app.user_id rỗng: phép so sánh <> với NULL rơi vào nhánh cho phép**
  AC: AC-7
  file: `packages/db/migrations/032_tat_link.sql:15`
  severity: medium
  source: conventions
  detail: Điều kiện chặn là `if s.sender_user_id <> app.current_user_id() and not ('team_lead' = any (app.current_user_roles()))`. Hàm app.current_user_id() trả null khi chưa đặt app.user_id (migration 002). Khi đó `<>` cho ra NULL, cả biểu thức thành NULL hoặc false, nên IF không raise và hàm SECURITY DEFINER vẫn update shares.disabled_at. Tức là một phiên chỉ có app.company_id, không có người, tắt được mọi link của sàn. Các hàm cũ cùng loại để phép so người ở dạng dương, null thì rơi về phía chặn, ví dụ 017_mo_so_lead.sql:22 `actor_user_id = app.current_user_id() or 'team_lead' = any(...)`. Nên viết `s.sender_user_id is distinct from app.current_user_id()` hoặc chặn `app.current_user_id() is null` từ đầu. Ca trong isolation.test.mjs không có phiên thiếu user_id nên lỗ này chưa được kiểm.
  rationale: AC-7 đòi hàm tắt link chỉ cho người gửi hoặc trưởng nhóm; phiên không có người vẫn tắt được là làm AC-7 (và AC-5 phần người khác bị từ chối) thất bại.

- **«Vừa đổi giá» không hiện khi căn chưa có giá lúc gửi rồi được đặt giá sau đó**
  AC: AC-3
  file: `packages/api/src/da-gui/store.ts:197`
  severity: medium
  source: bugs
  detail: `giaLucGui = giaTruoc ?? Number(c.list_price)`. Giá chỉ được đặt bằng sự kiện `price_changed`, vì `created` không mang listPrice. Nên khi trước lúc gửi chưa có `price_changed` nào, tức căn gửi với «Giá liên hệ», giá lúc gửi thật là null. Nhưng code lấy giá HIỆN TẠI của listings làm giá lúc gửi. Nếu sau lúc gửi căn được đặt giá X, thì `c.list_price = X`, `giaLucGui = X`, và `vuaDoi` so `X !== X` nên trả null: căn đã đổi giá nhưng không được đánh dấu «Vừa đổi», cũng không có «Gợi ý căn thay». Fallback đúng phải là null khi không có `price_changed` trước lúc gửi, không phải giá hiện tại.
  rationale: AC-3 đòi căn đổi giá sau lúc gửi mang nhãn «Vừa đổi»; căn gửi lúc giá liên hệ rồi được đặt giá thì không có nhãn, làm AC-3 thất bại.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Route Đã gửi bỏ qua mẫu OpenAPI (createRoute + zod) mà các route /api/v1/shares cùng cụm đang dùng**
  Người dùng thấy gì: Các route của màn Đã gửi chưa được liệt kê trong tài liệu API cho bên ngoài. Người dùng màn hình không thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng người dùng hiện tại và không làm mất hay lộ dữ liệu; chỉ là tài liệu thiếu, bổ sung sau với chi phí thấp.
  file: `packages/api/src/da-gui/routes.ts`
  severity: medium
  Đề xuất: known-limits

- **Ngăn chi tiết Lần gửi trống im lặng khi tải lỗi (và trong lúc đang tải)**
  Người dùng thấy gì: Khi mở chi tiết một link mà tải lỗi hoặc còn đang tải, đầu khách chỉ thấy một ngăn trống, không biết là lỗi hay đang chờ và không có nút thử lại.
  Căn cứ: Không mất dữ liệu và đóng mở lại hay tải lại trang là xong, nhưng người dùng dễ tưởng link không có gì; sửa khá rẻ.
  file: `apps/web/src/app/(app)/shares/man-da-gui.tsx`
  severity: medium
  Đề xuất: new-contract

- **Assertion âm-tính-một-mình: kiểm «không có tên chủ nhà» dò một chuỗi mà fixture không bao giờ ghi**
  Người dùng thấy gì: Một bài kiểm bảo vệ việc không lộ tên chủ nhà trên màn Đã gửi thực ra không thể báo đỏ, nên nếu sau này tên chủ lọt ra thì bài kiểm này sẽ không bắt được.
  Căn cứ: Hiện chưa có rò rỉ thật, các bài quét khác vẫn còn; nhưng lưới an toàn yếu đi nên nên ghi lại và vá khi có dịp, sửa rẻ.
  file: `packages/api/test-db/da-gui.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: «thân chi tiết không mang giá đáy» không kiểm rằng giá đáy đã thật sự được ghi**
  Người dùng thấy gì: Bài kiểm xác nhận giá đáy không lộ ra có thể vẫn xanh dù giá đáy chưa hề được lưu, nên chưa chắc đã chứng minh được điều nó định chứng minh.
  Căn cứ: Không ảnh hưởng người dùng trực tiếp, chỉ làm bằng chứng kiểm yếu đi; ghi lại và siết sau, sửa rẻ.
  file: `packages/api/test-db/da-gui.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
