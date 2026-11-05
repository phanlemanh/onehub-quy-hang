
# Review findings: bang-quyen-theo-vai (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hoàn tác trên ô Trạng thái vẫn cho phép lệnh bù «Đang bán» với người không đủ cờ, và máy chủ sẽ từ chối**
  Người dùng thấy gì: Đầu khách (hoặc đầu chủ không giữ căn) đổi hàng từ Đang bán sang Tạm ngưng sẽ thấy nút Hoàn tác, nhưng bấm vào thì luôn báo lỗi. Dữ liệu không sai hay mất, chỉ là nút hứa điều không làm được.
  Căn cứ: Hậu quả nhẹ: không mất hay lộ dữ liệu, người dùng chỉ gặp một nút hỏng và tự đổi trạng thái lại bằng tay hoặc nhờ người đủ quyền; sửa sau không đắt.
  file: `apps/web/src/app/(app)/inventory/cell-edit/hoan-tac.ts`
  severity: medium
  Đề xuất: known-limits

- **Chặn Bảng hàng chuyển cứng sang /today thay vì đích mở đầu của vỏ; Quản trị sàn bị đẩy tới nhà không có trong cột nhà của mình**
  Người dùng thấy gì: Người chỉ có vai Quản trị sàn gõ thẳng địa chỉ Bảng hàng sẽ bị chuyển sang Hôm nay, là trang họ không có trong menu, thay vì về trang Cài đặt. Họ vẫn đi tiếp được bằng menu.
  Căn cứ: Hậu quả nhẹ và không lộ dữ liệu: chỉ là trang đến hơi lạc, người dùng bấm menu là đi tiếp được.
  file: `apps/web/src/app/(app)/inventory/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Góc nhìn đã lưu của Bảng hàng thiếu cùng chốt chặn vai**
  Người dùng thấy gì: Telesales hay Quản trị sàn mở thẳng địa chỉ một góc nhìn đã lưu của Bảng hàng vẫn vào được khung màn, nhưng thấy rỗng, không có hàng nào.
  Căn cứ: Không lộ dữ liệu vì phía máy chủ đã chặn, người dùng chỉ thấy một màn trống; sửa sau rẻ.
  file: `apps/web/src/app/(app)/inventory/views/[id]/page.tsx`
  severity: low
  Đề xuất: known-limits

- **Danh sách «ba vai có Bảng hàng» bị chép thành hằng thứ hai trong lõi**
  Người dùng thấy gì: Hiện chưa có tác động lên người dùng. Về sau nếu có người đổi danh sách vai ở một chỗ mà quên chỗ kia, menu và quyền có thể lệch nhau.
  Căn cứ: Hiện không gây hại gì cho người dùng, chỉ là rủi ro bảo trì về sau; xử lý khi có dịp chạm vùng này.
  file: `packages/core/src/access/quyen-hang.ts`
  severity: low
  Đề xuất: wont-fix

- **Undo still offered for status changes whose undo would set the listing back to Đang bán, even for users without the Sẵn sàng bán flag; the undo always fails with 403**
  Người dùng thấy gì: Người không đủ quyền đưa lên Đang bán, sau khi đổi hàng từ Đang bán sang trạng thái khác, được mời bấm Hoàn tác nhưng lần nào cũng báo lỗi. Hàng giữ nguyên trạng thái mới.
  Căn cứ: Không mất hay lộ dữ liệu, người dùng tự gỡ được bằng cách nhờ người đủ quyền; chỉ gây khó chịu nhẹ.
  file: `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3: «chuỗi có mặt» trong khi lời hứa là QUAN HỆ. E6b lấy kiểm kiểu xanh làm bằng chứng cờ được dựng từ bd.me() và listAgentKey**
  Người dùng thấy gì: Chưa có lỗi nào người dùng gặp. Chỉ là chưa có bài kiểm chứng chắc chắn rằng cờ trên màn lấy đúng từ người đăng nhập và người giữ căn, nên sau này có thể lỡ mà không bị bắt.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng hôm nay, chỉ là lưới an toàn còn lỏng; bổ sung bài kiểm sau là việc vừa phải.
  file: `_acceptance/bang-quyen-theo-vai/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5: tuyên bố quét cả LỚP nhưng chỉ thử vài điểm. Ca «không có nấc Đang bán khi không đủ cờ» bỏ sót Pending → Active**
  Người dùng thấy gì: Chưa có lỗi người dùng gặp. Bài kiểm chưa thử trường hợp hàng đang ở Đang giao dịch, nên nếu sau này có lỗi ở đó sẽ không bị phát hiện sớm.
  Căn cứ: Không ảnh hưởng người dùng hiện tại; thêm một ca kiểm là rẻ nhưng không gấp.
  file: `apps/web/src/app/(app)/inventory/cell-edit/trang-thai.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4: assertion âm tính đứng một mình, không ghim thông điệp. Lệnh mang phiên bản cũ chỉ được kiểm mã 403**
  Người dùng thấy gì: Chưa có lỗi người dùng gặp. Bài kiểm chưa khẳng định lý do từ chối khi lệnh mang bản cũ, nên nếu lý do bị đổi thì người dùng có thể thấy câu báo lỗi sai mà không ai hay.
  Căn cứ: Chỉ là lưới kiểm còn lỏng, không mất dữ liệu; siết lại bài kiểm sau là rẻ.
  file: `packages/api/test-db/bang-quyen-theo-vai/bang-quyen.test.ts`
  severity: low
  Đề xuất: known-limits

- **Gần hình dạng 6: đo bản đã commit thay vì cây đang kiểm. Bài canh bài cũ đọc `git show HEAD:<tệp>`**
  Người dùng thấy gì: Không ảnh hưởng người dùng. Trên máy lập trình, một sửa chưa commit vào bài cũ có thể lọt qua bài canh, nhưng khi lên CI thì bị bắt.
  Căn cứ: Chỉ ảnh hưởng quy trình trên máy lập trình và CI vẫn bắt được, nên chi phí sửa không đáng so với hậu quả.
  file: `packages/api/test-db/bang-quyen-theo-vai/bai-cu.test.ts`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 2/9 lỗi rơi vào file không bộ đo nào phủ (apps/web/src/app/(app)/inventory/views/[id]/page.tsx, _acceptance/bang-quyen-theo-vai/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
