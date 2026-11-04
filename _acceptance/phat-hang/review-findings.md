# Review findings: phat-hang (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mã lỗi «device_reported_lost» nằm ngoài sổ mã lỗi API_ERRORS và sai khuôn tên**
  Người dùng thấy gì: Người dùng không thấy gì khác đi. Chỉ là mã báo máy bị mất đặt lệch quy ước nên các màn phải xử lý riêng, dễ sót về sau.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ gây bất tiện cho người phát triển; sửa sau vẫn rẻ và không mất dữ liệu.
  file: `packages/api/src/auth/may-bi-bao.ts`
  severity: medium
  Đề xuất: known-limits

- **Báo mất máy nuốt thân sai khuôn thay vì trả 400 invalid-payload**
  Người dùng thấy gì: Nếu yêu cầu báo mất máy gửi lên sai dạng, hệ thống vẫn chạy tiếp và có thể xoá luôn máy của người đang bấm thay vì báo lỗi.
  Căn cứ: Chỉ xảy ra khi yêu cầu sai dạng, hiếm với người dùng thường; hậu quả là phải đăng nhập lại máy đó, không lộ dữ liệu.
  file: `packages/api/src/me/routes.ts`
  severity: low
  Đề xuất: known-limits

- **The lost-device login page says the data was deleted even when deleting it failed**
  Người dùng thấy gì: Máy bị báo mất có thể hiện «Dữ liệu đã xoá» trong khi dữ liệu vẫn còn trên máy. Người dùng tin là đã an toàn nhưng thực tế chưa.
  Căn cứ: Nghiêm trọng vì báo an toàn sai về dữ liệu còn trên máy mất; người dùng không tự phát hiện được, nên đáng mở việc riêng.
  file: `apps/web/src/app/(auth)/login/may-bi-bao.tsx`
  severity: high
  Đề xuất: new-contract

- **A failed lost-device wipe from inside the app is swallowed: sync is shut down, the store stays, and there is no redirect**
  Người dùng thấy gì: Khi máy bị báo mất mà việc xoá dữ liệu trong app thất bại, người dùng vẫn ở lại trong app, dữ liệu còn nguyên và không có lời báo nào.
  Căn cứ: Dữ liệu người bị báo mất còn trên máy mà không ai biết; tuy hiếm nhưng liên quan bảo mật, nên gom cùng việc xử lý báo mất máy.
  file: `apps/web/src/lib/sync/may-bi-bao.ts`
  severity: medium
  Đề xuất: new-contract

- **An offline session that gets a permanent 4xx stays in the outbox forever and is re-sent every sync pass**
  Người dùng thấy gì: Một phiên làm việc ngoại tuyến bị máy chủ từ chối vĩnh viễn sẽ nằm mãi trong hàng đợi và bị gửi lại mỗi lần đồng bộ.
  Căn cứ: Chỉ tốn thêm một ít lưu lượng, không mất dữ liệu của người dùng; chỉ gặp khi đồng hồ máy lệch nên hiếm.
  file: `apps/web/src/lib/sync/dong-bo.ts`
  severity: medium
  Đề xuất: known-limits

- **The Gửi screen shows a failed or refused customer-list load as 'no open customers', with no retry**
  Người dùng thấy gì: Khi tải danh sách khách bị lỗi mạng, màn Gửi nói «chưa có khách đang mở» và không thử lại, khiến người môi giới tạo khách trùng.
  Căn cứ: Gây thông tin sai và có thể tạo khách trùng, nhưng tải lại trang là hết; sửa không đắt nên nên đăng thành việc riêng.
  file: `apps/web/src/app/(app)/shares/new/man-gui.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình 3 (chuỗi có mặt thay cho quan hệ): E3 tab-toi chỉ grep tên bảng nhãn trong dải bật, và oracle 7 ô so hàm với chính bảng nó đọc**
  Người dùng thấy gì: Bài kiểm tra nhãn thông báo ở tab Tôi chưa chắc bắt được trường hợp chữ ở tab Tôi lệch với chữ ở dải Hôm nay.
  Căn cứ: Không ảnh hưởng người dùng ngay, chỉ là lưới kiểm thử yếu; nếu chữ lệch thì chỉ gây khó hiểu nhẹ và sửa dễ.
  file: `apps/web/src/app/(app)/me/toi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 1 (đo chỉ dẫn thay vì đầu ra): cột «điện thoại» của ma trận 5 vai × 2 khổ ở E1 phat-hang đo mobileActions, khoá mà nút trên thanh bảng hàng không đọc**
  Người dùng thấy gì: Bài kiểm tra việc ẩn nút «Xuất bảng hàng» trên điện thoại đo chưa sát thực tế, nên có thể không phát hiện nếu nút lỡ hiện ra trên điện thoại.
  Căn cứ: Nút hiện nay vẫn ẩn đúng; nếu sau này hỏng thì chỉ là nút hiện trên điện thoại, không lộ dữ liệu và tự gỡ được.
  file: `apps/web/src/app/(app)/inventory/phat-hang/tap-can.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (chuỗi có mặt thay cho quan hệ): E9 phat-hang hứa hằng loại sự kiện «khớp hằng hàng 52 đọc» nhưng chỉ ghim chuỗi literal**
  Người dùng thấy gì: Bài kiểm tra tên sự kiện xuất chưa chứng minh được bên ghi và bên đọc dùng chung một tên, nên số liệu có thể lệch nếu sau này một bên đổi tên.
  Căn cứ: Hiện số đo vẫn đếm đúng; rủi ro chỉ là số liệu thử nghiệm lệch về sau, không ảnh hưởng người dùng và sửa rẻ.
  file: `packages/core/src/metrics/xuat.test.ts`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/9 lỗi rơi vào file không bộ đo nào phủ (packages/api/src/auth/may-bi-bao.ts, packages/api/src/me/routes.ts, apps/web/src/app/(auth)/login/may-bi-bao.tsx, apps/web/src/app/(app)/shares/new/man-gui.tsx, apps/web/src/app/(app)/me/toi.test.ts) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
