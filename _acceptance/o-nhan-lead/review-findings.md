## Trong hợp đồng

- **Gửi lead có thể chạy hai lần trong lúc chờ tra mã căn, vì cờ «đang gửi» chỉ bật sau lượt tra**
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx:115`
  severity: medium
  AC: AC-10
  detail: Trước thay đổi này, `gui()` gọi `setDangGui(true)` trước lần `await` đầu tiên, nên nút «Gửi lead» và các ô bị khoá ngay khi gửi. Giờ `gui()` chờ `await docMa()` (một lần gọi mạng tới /api/v1/catalog/units/...) trước `setDangGui(true)` ở dòng 128. Trong lúc chờ, nút submit và các ô vẫn bật: bấm lần nữa hay nhấn Enter lần nữa sẽ chạy `gui()` thứ hai, rồi cả hai cùng gọi `nguon.gui(than)`. Lối POST /api/v1/leads không chống gửi lặp (không có khoá idempotency, và migration 007 chỉ có `unique (company_id, id)`), nên sinh ra hai lead cho cùng một chủ nhà. Đây là lùi so với chống gửi đôi đã có. Cách sửa: bật `dangGui` (hoặc một ref chặn gửi lại) trước bước tra mã.
  rationale: AC-10 đòi trong lúc gửi nút «Đang kiểm trùng…» khoá; ở đây nút vẫn bật suốt lượt tra mã sau khi bấm gửi nên AC-10 không đạt.
  source: conventions

- **Gửi lead không còn khoá trong lúc chờ tra mã, nên gửi hai lần tạo hai lead**
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx:116`
  severity: medium
  AC: AC-10
  detail: Bản sửa thêm `await docMa()` (một lượt gọi mạng `traMa`) TRƯỚC `setDangGui(true)` (dòng 128). Trước đây `gui` đặt dangGui ngay, trước lượt await đầu tiên. Giờ trong lúc chờ tra mã, nút «Gửi lead» và các ô vẫn mở (chúng chỉ bị khoá theo `dangGui`). Bấm đúp hay Enter hai lần thì `gui` chạy hai lần song song; mỗi lần tự tra mã rồi đều gọi `nguon.gui(than)`, tức hai lượt POST /api/v1/leads với cùng nội dung. Kết quả là hai bản ghi lead, và bản sau thường bị kiểm trùng xếp vào trùng với bản trước. Cách sửa: đặt dangGui (hoặc một cờ ref) trước lượt await tra mã, và thoát ngay nếu đang gửi.
  rationale: AC-10 yêu cầu nút «Đang kiểm trùng…» khoá trong lúc gửi; lượt chờ tra mã diễn ra sau khi bấm mà nút chưa khoá nên gửi hai lần được.
  source: bugs

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lối «tra lúc gửi» bỏ qua khi còn căn của lần tra trước: sửa mã căn rồi nhấn Enter sẽ gửi căn cũ**
  Người dùng thấy gì: Nếu telesales tra xong một mã căn rồi sửa sang mã khác và bấm Enter ngay, lead có thể được gửi theo căn cũ trong khi ô vẫn hiện mã mới. Kết quả kiểm trùng khi đó tính theo căn sai.
  Căn cứ: Lead lưu sai căn và kết quả kiểm trùng sai nhưng chỉ xảy ra ở một thao tác hiếm; dữ liệu sai nằm lại trong lead và khó nhận ra sau khi ô đã được xoá, còn sửa thì rẻ.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: new-contract

- **Đổi mã căn sau một lần tra thành công rồi bấm Enter thì lead gửi căn cũ**
  Người dùng thấy gì: Nếu telesales tra xong một căn rồi đổi mã và bấm Enter ngay, lead có thể gửi đi với căn và toà của lần tra trước. Sau khi gửi thành công ô được xoá nên người dùng không thấy dấu vết sai.
  Căn cứ: Lead mang căn và toà sai, người dùng không tự phát hiện được sau khi gửi; nhưng chỉ xảy ra khi sửa mã rồi bấm Enter ngay, và sửa thì rẻ.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: new-contract

- **Màn nhập lead coi mọi lỗi không phải 400 (401/403/409) là lỗi mạng (r1)**
  Người dùng thấy gì: Khi phiên hết hạn, bị gỡ quyền nhập lead hoặc đổi sàn ở tab khác, màn vẫn báo «Chưa gửi được — kiểm mạng». Người dùng sẽ gửi lại mãi mà không biết lý do thật.
  Căn cứ: Chỉ xảy ra ở vài tình huống hiếm, không mất hay lộ dữ liệu, chữ đã gõ vẫn còn; người dùng tải lại trang hoặc đăng nhập lại là hết.
  file: `apps/web/src/app/(app)/leads/new/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Kết quả «chủ trùng» có thể hiện chữ «null» khi không tìm được tên đầu chủ (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trong ca hiếm không tìm được tên đầu chủ, thông báo chủ trùng sẽ hiện chữ «null» thay cho tên. Telesales vẫn thấy lead đã về đầu chủ nhưng không biết là ai.
  Căn cứ: Chỉ là lỗi hiển thị chữ ở ca hiếm, kết quả kiểm trùng và việc ghi lead vẫn đúng, không mất dữ liệu; sửa sau rất rẻ.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: low
  Đề xuất: known-limits

- **API đọc tên người bằng truy vấn tự viết ở tệp đường, bỏ qua lối chung accounts.ts và không ghi rõ schema identity (r1)**
  Người dùng thấy gì: Tên đầu chủ mà telesales thấy có thể là email của đầu chủ thay vì tên thật, nhất là với tài khoản được mời. Thông báo vẫn đúng người nhưng kém thân thiện.
  Căn cứ: Không ảnh hưởng độ đúng của kết quả kiểm trùng và không lộ dữ liệu ngoài công ty; chỉ là cách hiện tên, dọn lại sau không tốn nhiều.
  file: `packages/api/src/leads/routes.ts`
  severity: low
  Đề xuất: known-limits

- **Unit code is silently dropped when lookup is ambiguous, not in catalog, or fails, so the unit duplicate check never runs (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi mã căn khớp nhiều khu, không có trong danh mục hoặc tra mã bị lỗi, mã căn gõ vào bị bỏ im lặng sau khi chọn toà. Khi đó căn đã có hàng mở vẫn có thể báo «không trùng», và có thể tạo thêm lead trên căn đã có hàng.
  Căn cứ: Đây là lỗ hổng thật của việc chặn trùng căn, người dùng không tự thấy hay tự sửa được; nhưng chỉ ở ca mã mơ hồ hay ngoài danh mục nên nên làm thành việc riêng.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: medium
  Đề xuất: new-contract

- **«Bỏ lead» failures are swallowed with no feedback (r1)**
  Người dùng thấy gì: Nếu bấm «Bỏ lead này» mà bị lỗi, hộp xác nhận đóng lại và màn không đổi, không có báo gì. Người dùng không biết lần bỏ đã được ghi hay chưa.
  Căn cứ: Dữ liệu không bị sai hay lộ, người dùng bấm lại được và lần sau sẽ thấy kết quả; chỉ gây bối rối ở ca lỗi hiếm.
  file: `apps/web/src/app/(app)/leads/new/nguon-that.tsx`
  severity: medium
  Đề xuất: known-limits

- **Every non-201/400 response is shown as a network error (r1)**
  Người dùng thấy gì: Hết phiên, không đủ quyền hay lỗi máy chủ đều hiện như lỗi mạng, bảo người dùng thử lại dù sẽ lại thất bại. Ở vài ca lỗi 400, màn gửi xong mà không hiện lỗi nào.
  Căn cứ: Chỉ gặp ở tình huống hiếm, không mất hay lộ dữ liệu, chữ đã gõ còn nguyên; tải lại hay đăng nhập lại là xong.
  file: `apps/web/src/app/(app)/leads/new/nguon-that.tsx`
  severity: low
  Đề xuất: known-limits

- **Stale unit code is kept after the building changes, and a late lookup can refill the form (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu đổi toà sau khi mã căn đã được đọc, lead gửi đi mang mã căn của toà cũ nên có thể bỏ sót hàng đang mở. Nếu bấm gửi ngay lúc đang tra mã, form có thể tự điền lại chữ cũ sau khi đã trống.
  Căn cứ: Cần đúng thao tác đổi toà hoặc bấm quá nhanh nên hiếm; hậu quả là bỏ sót một lần chặn trùng hay form điền lại, người dùng thấy và sửa được.
  file: `apps/web/src/app/(app)/leads/new/o-lead.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 — kiểm âm tính đứng một mình: dữ kiện chủ ở sàn A chỉ được kiểm là notEqual(U_DC_B), không ghim vào đầu chủ của A (r1)**
  Người dùng thấy gì: Bài kiểm cách ly giữa các sàn có thể vẫn báo xanh dù đầu chủ của sàn khác lọt vào kết quả kiểm trùng của sàn mình. Nếu có lỗi rò, bài kiểm có thể không bắt được trước khi phát hành.
  Căn cứ: Đây là lưới an toàn của luật cách ly giữa công ty, nếu hỏng thì lộ dữ liệu giữa các sàn mà không ai biết; nên làm việc riêng nhỏ để siết lại, chưa có dấu hiệu rò thật.
  file: `packages/db/tests/isolation.test.mjs`
  severity: medium
  Đề xuất: new-contract

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

