# Review findings: bang-quyen-theo-vai (round 2)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 6 — đo checkout của tác giả thay vì cây đang kiểm: rào bài cũ tự bỏ qua trong CI vì bản sao nông**
  Người dùng thấy gì: Phép kiểm bảo đảm sáu bài kiểm cũ không bị sửa lén chỉ thật sự chạy trên máy người viết. Trên hệ thống kiểm tự động nó bị bỏ qua mà vẫn hiện là đạt, nên nếu ai đó sửa các bài cũ thì hệ thống tự động không bắt được.
  Căn cứ: Không làm người dùng mất hay lộ dữ liệu và không đổi hành vi sản phẩm. Rủi ro chỉ là lỗi sửa lén bài kiểm có thể lọt qua khâu tự động, nhưng vẫn bị bắt khi chạy trên máy người viết và khi người ký xem lại, nên ghi hạn chế đã biết là đủ.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hoàn tác trên ô Trạng thái vẫn cho phép lệnh bù «Đang bán» với người không đủ cờ, và máy chủ sẽ từ chối (r1)**
  Người dùng thấy gì: Đầu khách (hoặc đầu chủ không giữ căn) đổi hàng từ Đang bán sang Tạm ngưng sẽ thấy nút Hoàn tác, nhưng bấm vào thì luôn báo lỗi. Dữ liệu không sai hay mất, chỉ là nút hứa điều không làm được.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, người dùng chỉ gặp một nút hỏng và tự đổi trạng thái lại bằng tay hoặc nhờ người đủ quyền; sửa sau không đắt.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **Chặn Bảng hàng chuyển cứng sang /today thay vì đích mở đầu của vỏ; Quản trị sàn bị đẩy tới nhà không có trong cột nhà của mình (r1)**
  Người dùng thấy gì: Người chỉ có vai Quản trị sàn gõ thẳng địa chỉ Bảng hàng sẽ bị chuyển sang Hôm nay, là trang họ không có trong menu, thay vì về trang Cài đặt. Họ vẫn đi tiếp được bằng menu.
  Căn cứ: Hậu quả nhẹ và không lộ dữ liệu: chỉ là trang đến hơi lạc, người dùng bấm menu là đi tiếp được.
  file: `apps/web/src/app/(app)/inventory/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Góc nhìn đã lưu của Bảng hàng thiếu cùng chốt chặn vai (r1)**
  Người dùng thấy gì: Telesales hay Quản trị sàn mở thẳng địa chỉ một góc nhìn đã lưu của Bảng hàng vẫn vào được khung màn, nhưng thấy rỗng, không có hàng nào.
  Căn cứ: Không lộ dữ liệu vì phía máy chủ đã chặn, người dùng chỉ thấy một màn trống; sửa sau rẻ.
  file: `apps/web/src/app/(app)/inventory/views/[id]/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Danh sách «ba vai có Bảng hàng» bị chép thành hằng thứ hai trong lõi (r1)**
  Người dùng thấy gì: Hiện chưa có tác động lên người dùng. Về sau nếu có người đổi danh sách vai ở một chỗ mà quên chỗ kia, menu và quyền có thể lệch nhau.
  Căn cứ: Hiện không gây hại gì cho người dùng, chỉ là rủi ro bảo trì về sau; xử lý khi có dịp chạm vùng này.
  file: `packages/core/src/access/quyen-hang.ts`
  severity: low
  Đề xuất: wont-fix

- **Undo still offered for status changes whose undo would set the listing back to Đang bán, even for users without the Sẵn sàng bán flag; the undo always fails with 403 (r1)**
  Người dùng thấy gì: Người không đủ quyền đưa lên Đang bán, sau khi đổi hàng từ Đang bán sang trạng thái khác, được mời bấm Hoàn tác nhưng lần nào cũng báo lỗi. Hàng giữ nguyên trạng thái mới.
  Căn cứ: Không mất hay lộ dữ liệu, người dùng tự gỡ được bằng cách nhờ người đủ quyền; chỉ gây khó chịu nhẹ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: «chuỗi có mặt» trong khi lời hứa là QUAN HỆ. E6b lấy kiểm kiểu xanh làm bằng chứng cờ được dựng từ bd.me() và listAgentKey (r1)**
  Người dùng thấy gì: Chưa có lỗi nào người dùng gặp. Chỉ là chưa có bài kiểm chứng chắc chắn rằng cờ trên màn lấy đúng từ người đăng nhập và người giữ căn, nên sau này có thể lỡ mà không bị bắt.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng hôm nay, chỉ là lưới an toàn còn lỏng; bổ sung bài kiểm sau là việc vừa phải.
  file: `_acceptance/bang-quyen-theo-vai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: tuyên bố quét cả LỚP nhưng chỉ thử vài điểm. Ca «không có nấc Đang bán khi không đủ cờ» bỏ sót Pending → Active (r1)**
  Người dùng thấy gì: Chưa có lỗi người dùng gặp. Bài kiểm chưa thử trường hợp hàng đang ở Đang giao dịch, nên nếu sau này có lỗi ở đó sẽ không bị phát hiện sớm.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; thêm một ca kiểm là rẻ nhưng không gấp.
  file: `apps/web/src/app/(app)/inventory/cell-edit/trang-thai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: assertion âm tính đứng một mình, không ghim thông điệp. Lệnh mang phiên bản cũ chỉ được kiểm mã 403 (r1)**
  Người dùng thấy gì: Chưa có lỗi người dùng gặp. Bài kiểm chưa khẳng định lý do từ chối khi lệnh mang bản cũ, nên nếu lý do bị đổi thì người dùng có thể thấy câu báo lỗi sai mà không ai hay.
  Căn cứ: Chỉ là lưới kiểm còn lỏng, không mất dữ liệu; siết lại bài kiểm sau là rẻ.
  file: `packages/api/test-db/bang-quyen-theo-vai/bang-quyen.test.ts`
  severity: low
  Đề xuất: known-limits

- **Gần hình dạng 6: đo bản đã commit thay vì cây đang kiểm. Bài canh bài cũ đọc `git show HEAD:<tệp>` (r1 · tệp đã đổi)**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Trên máy lập trình, một sửa chưa commit vào bài cũ có thể lọt qua bài canh, nhưng khi lên CI thì bị bắt.
  Căn cứ: Chỉ ảnh hưởng quy trình trên máy lập trình và CI vẫn bắt được, nên chi phí sửa không đáng so với hậu quả.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Bulk «Đổi trạng thái» still offers «Đang bán» to people who lack the «Sẵn sàng bán» flag (r1)**
  Người dùng thấy gì: Đầu khách hay đầu chủ không giữ căn vẫn thấy lựa chọn «Đang bán» khi đổi trạng thái nhiều căn cùng lúc. Bấm vào thì máy chủ từ chối và các căn đó rơi vào «Cần xem».
  Căn cứ: Không mất dữ liệu và máy chủ vẫn chặn đúng, nhưng người dùng bị mời làm điều không được và phải dọn lại danh sách «Cần xem»; sửa riêng một màn thì rẻ.
  file: `apps/web/src/app/(app)/inventory/bulk/lo.ts`
  severity: medium
  Đề xuất: new-contract

- **Undo of «Đang bán → Tạm ngừng» sends an Active command the new flag rule rejects (r1)**
  Người dùng thấy gì: Đầu khách đổi một căn từ «Đang bán» sang tạm ngừng rồi bấm Hoàn tác sẽ bị máy chủ từ chối và căn rơi vào «Cần xem». Căn không bị đưa lên «Đang bán» trái phép.
  Căn cứ: Hiếm gặp, không lộ quyền và không mất dữ liệu; người dùng tự đưa căn về đúng trạng thái được.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **E9c guard always skips in CI (shallow checkout, no main ref), so the check never runs where it is supposed to protect (r1 · tệp đã đổi)**
  Người dùng thấy gì: Rào tự kiểm việc sửa bài cũ chỉ chạy được trên máy tác giả, còn trên hệ thống kiểm tự động thì bị bỏ qua mà vẫn báo xanh. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm yếu một lưới an toàn nội bộ, không chạm người dùng; sửa sau cũng rẻ.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **After merge, E9c breaks every future branch that adds or edits any test file under test-db (r1 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi gộp, các vòng làm việc sau nếu thêm hay sửa bài kiểm cơ sở dữ liệu có thể bị rào này chặn oan. Người dùng cuối không thấy gì.
  Căn cứ: Chỉ gây vướng cho đội làm việc, không ảnh hưởng người dùng; gỡ được khi gặp, nhưng nên ghi để vòng sau biết.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo checkout của tác giả thay vì cây đang kiểm): E9c tự bỏ qua trong CI và đọc bản HEAD thay vì tệp đang có trên đĩa (r1 · tệp đã đổi)**
  Người dùng thấy gì: Rào tự kiểm việc sửa bài cũ có thể bỏ sót việc xoá điều kiểm chưa commit và bị bỏ qua trên hệ thống kiểm tự động. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ là lưới an toàn nội bộ yếu đi, không mất dữ liệu hay lộ quyền cho người dùng; sửa sau không đắt.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm «chuỗi không có mặt» trong khi lời hứa là quan hệ): ca nấc Trạng thái khi không đủ cờ chỉ kiểm thiếu Active (r1)**
  Người dùng thấy gì: Bài kiểm có thể không bắt được lỗi làm người không đủ cờ mất luôn các nấc trạng thái khác. Người dùng chỉ gặp nếu sau này có người cài sai.
  Căn cứ: Hành vi hiện tại đúng, chỉ là bài kiểm lỏng; rủi ro thấp và thêm một phép so thì rẻ nhưng không cần mở việc riêng.
  file: `apps/web/src/app/(app)/inventory/cell-edit/trang-thai.test.ts`
  severity: medium
  Đề xuất: wont-fix

- **Hình dạng 2 (dữ liệu mẫu viết tay đúng khuôn bên đọc): ca «ô Trạng thái: cờ lấy từ lõi» không đi qua đường lấy người giữ căn của trình sửa thật (r1)**
  Người dùng thấy gì: Bài kiểm không đo đúng đường lấy người giữ căn mà màn thật dùng, nên một lỗi ở đó có thể lọt. Căn trên máy cũ chưa có thông tin người giữ có thể được coi là chưa ai giữ.
  Căn cứ: Nhẹ, chỉ là chỗ bài kiểm chưa phủ, không mất dữ liệu; người dùng tải lại đồng bộ là đủ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/trang-thai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): ca phiên bản cũ chỉ kiểm mã 403, không kiểm lý do (r1)**
  Người dùng thấy gì: Bài kiểm cho lệnh phiên bản cũ chưa ghim lý do từ chối nên một lý do khác vẫn lọt. Người dùng cuối không thấy khác biệt.
  Căn cứ: Hành vi đã được kiểm chặt ở ca cùng lệnh phía trên; rủi ro thấp, không cần mở việc.
  file: `packages/api/test-db/bang-quyen-theo-vai/bang-quyen.test.ts`
  severity: low
  Đề xuất: wont-fix

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
