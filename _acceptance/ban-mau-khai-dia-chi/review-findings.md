# Review findings: ban-mau-khai-dia-chi (round 1)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bộ đo E1 đọc aria-current ở cột nhà, nhưng cột nhà không có thuộc tính này**
  Người dùng thấy gì: Người dùng không gặp lỗi nào: nhà vẫn sáng đúng trên màn. Chỉ là cách kiểm tra tự động ghi sai chỗ đọc, nên việc nhà có sáng hay không phải xem bằng ảnh chụp.
  Căn cứ: Nhẹ với người dùng vì sản phẩm chạy đúng, chỉ phần kiểm tra yếu đi và sửa sau rất rẻ.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình 3 — Assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: sổ design-pass chỉ được thử có/không có địa chỉ, không thử đúng địa chỉ đã khai**
  Người dùng thấy gì: Nếu sổ ghi nhầm địa chỉ khác với địa chỉ trang khai, bộ kiểm tra hiện chưa chắc bắt được. Người dùng cuối không bị ảnh hưởng, chỉ có nguy cơ sổ ghi lệch mà không ai báo.
  Căn cứ: Hậu quả nhẹ: chỉ ảnh hưởng tài liệu nội bộ của bản mẫu, không mất dữ liệu, thêm một ca thử sau này là xong.
  file: `packages/ui-lint/tests/khu-ban-mau.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — Assert «có mặt» trong khi lời hứa là QUAN HỆ: AC-5 «sáng đúng nhà của bố cục» chỉ đo «có nhà sáng»**
  Người dùng thấy gì: Trang mẫu sống có thể sáng nhầm nhà ở một bố cục mà kiểm tra tự động vẫn báo đạt. Hiện chưa thấy lỗi thật, chỉ là lưới kiểm tra chưa chặt.
  Căn cứ: Nhẹ vì chỉ là màn mẫu nội bộ, người xem thấy ngay và tải lại hay sửa đều rẻ.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 — Fixture VIẾT TAY đúng khuôn bên đọc: danh sách mục Hôm nay không rút từ writer mucHomNay/TODAY_ITEMS**
  Người dùng thấy gì: Nếu sau này đổi cách tạo liên kết vào mục nhóm của Hôm nay, kiểm tra tự động có thể vẫn xanh trong khi mục sáng bị lệch. Hiện người dùng chưa gặp gì.
  Căn cứ: Rủi ro chỉ xuất hiện khi có thay đổi sau này và dễ thấy khi dùng, sửa test rẻ nhưng không gấp.
  file: `apps/web/src/components/shell/dia-chi-mau.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — Assertion âm-tính-một-mình: E5b kết luận «không còn nhaMau» từ mọi lần grep không ra exit 0, không đối chứng dương**
  Người dùng thấy gì: Kiểm tra có thể báo đã sạch dù thực ra không quét được thư mục. Người dùng không bị ảnh hưởng, chỉ rủi ro sót một tên cũ trong mã.
  Căn cứ: Hậu quả rất nhẹ vì trình kiểm kiểu vẫn bắt tên cũ còn sót, nên chi phí sửa không đáng.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 3/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ban-mau-khai-dia-chi/evals.yaml) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
