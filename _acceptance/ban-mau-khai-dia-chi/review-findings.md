# Review findings: ban-mau-khai-dia-chi (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **E9b chỉ có chiều xanh: đường đỏ khai trong expected chưa từng được đo**
  Người dùng thấy gì: Phép tự kiểm việc cấu hình nghiệm thu không bị đổi chưa từng được thử ở chiều báo đỏ. Người dùng cuối không bị ảnh hưởng, chỉ là lưới kiểm có thể xanh nhầm.
  Căn cứ: Không đụng dữ liệu hay màn của người dùng, chỉ làm lưới kiểm lỏng hơn; bổ sung sau rẻ và không gấp.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Kiểm cấu hình trả mã 1 khi không tìm được điểm rẽ, trùng mã với «ĐÃ ĐỔI»**
  Người dùng thấy gì: Khi máy không so được với nhánh chính, phép kiểm báo như thể cấu hình đã đổi. Chỉ gây hiểu nhầm cho người chạy kiểm, không ảnh hưởng người dùng.
  Căn cứ: Chỉ xảy ra trên bản sao thiếu nhánh chính, người chạy chạy lại được; không mất dữ liệu và không chạm người dùng.
  file: `_acceptance/ban-mau-khai-dia-chi/thu/kiem-cau-hinh-khong-doi.mjs`
  severity: low
  Đề xuất: known-limits

- **Chiều đỏ E5c in «nêu tệp» nhưng không kiểm có nêu tệp**
  Người dùng thấy gì: Phép kiểm tự kiểm có thể báo đạt dù thông điệp lỗi không liệt kê tệp. Người dùng cuối không thấy ảnh hưởng.
  Căn cứ: Chỉ là lưới kiểm chưa chặt ở một chi tiết thông điệp, không ảnh hưởng người dùng và sửa sau rẻ.
  file: `_acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs`
  severity: low
  Đề xuất: known-limits

- **paths của E1 không phủ hai bề mặt mà E1 đo: trang mẫu sống và mục nhóm Hôm nay**
  Người dùng thấy gì: Nếu sau này sửa trang mẫu sống, kết quả kiểm cũ có thể bị dùng lại dù đã cũ. Hiện chưa có lỗi nào xảy ra với người dùng.
  Căn cứ: Chỉ rủi ro kiểm sót ở lần sửa sau, hiện không có lỗi thật; người làm có thể chạy lại kiểm bằng tay.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Không so được vì thiếu origin/main thì thoát mã 1, trùng nghĩa với «cấu hình ĐÃ ĐỔI»**
  Người dùng thấy gì: Khi thiếu nhánh chính, phép kiểm báo nhầm là cấu hình đã đổi. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm người chạy kiểm hiểu nhầm trong tình huống hiếm, tự thử lại được và không chạm dữ liệu.
  file: `_acceptance/ban-mau-khai-dia-chi/thu/kiem-cau-hinh-khong-doi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Bằng chứng E1 ghi «Console errors: 0» trong khi ảnh chụp trang bản mẫu hiện lỗi dev «1 Issue»**
  Người dùng thấy gì: Trang bản mẫu hiện huy hiệu lỗi ở môi trường phát triển mà hồ sơ ghi là không có lỗi. Chưa biết lỗi từ thay đổi này hay có sẵn; màn hiển thị vẫn đúng.
  Căn cứ: Huy hiệu chỉ hiện ở môi trường phát triển và chưa thấy ảnh hưởng đến màn người dùng; cần xem lại nội dung lỗi nhưng không gấp.
  file: `_acceptance/ban-mau-khai-dia-chi/evidence/E1-network.txt`
  severity: medium
  Đề xuất: known-limits

- **Chiều đỏ E5c in «nêu tệp» nhưng không kiểm tên tệp**
  Người dùng thấy gì: Phép kiểm tự kiểm vẫn báo đạt khi thông điệp lỗi bỏ danh sách tệp. Người dùng cuối không thấy ảnh hưởng.
  Căn cứ: Chỉ là lưới kiểm lỏng ở một chi tiết thông điệp, không chạm người dùng, sửa sau rẻ.
  file: `_acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 4 — Assertion âm-tính-một-mình: E9b kết luận «cấu hình không đổi» từ mọi lần git diff không thấy khác, không đối chứng dương, không có chiều đỏ**
  Người dùng thấy gì: Phép kiểm cấu hình không đổi có thể báo đạt nhầm trong vài trường hợp lạ như đường dẫn sai. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm lưới kiểm xanh nhầm ở tình huống hiếm, không có lỗi thật nào đang xảy ra với người dùng.
  file: `_acceptance/ban-mau-khai-dia-chi/thu/kiem-cau-hinh-khong-doi.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — Không ghim thông điệp: E5c in «nêu tệp» nhưng chỉ assert chuỗi «còn nhaMau», và đối chứng dương diaChiMau không có ca đỏ**
  Người dùng thấy gì: Một lớp bảo vệ của phép kiểm có thể bị gỡ mà kết quả vẫn xanh. Người dùng cuối không thấy ảnh hưởng.
  Căn cứ: Chỉ làm lưới kiểm chưa chặt, không chạm dữ liệu hay màn người dùng; sửa sau rẻ.
  file: `_acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 3 — Lời hứa QUAN HỆ «cùng danh sách mục, cùng mục sáng» của E1 được chấm trên hai tập rỗng**
  Người dùng thấy gì: Khi so Bảng hàng với bản mẫu, cả hai đều chưa có góc nhìn nên chưa thấy mục nào sáng để so. Chưa thấy sai ở màn, chỉ là chưa quan sát được trên giao diện.
  Căn cứ: Không có lỗi thật được thấy và mục sáng đã được kiểm ở chỗ khác; người dùng không mất gì.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Bộ đo E1 đọc aria-current ở cột nhà, nhưng cột nhà không có thuộc tính này (r1 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng không gặp lỗi nào: nhà vẫn sáng đúng trên màn. Chỉ là cách kiểm tra tự động ghi sai chỗ đọc, nên việc nhà có sáng hay không phải xem bằng ảnh chụp.
  Căn cứ: Nhẹ với người dùng vì sản phẩm chạy đúng, chỉ phần kiểm tra yếu đi và sửa sau rất rẻ.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: low
  Đề xuất: known-limits

- **Hình 3 — Assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: sổ design-pass chỉ được thử có/không có địa chỉ, không thử đúng địa chỉ đã khai (r1)**
  Người dùng thấy gì: Nếu sổ ghi nhầm địa chỉ khác với địa chỉ trang khai, bộ kiểm tra hiện chưa chắc bắt được. Người dùng cuối không bị ảnh hưởng, chỉ có nguy cơ sổ ghi lệch mà không ai báo.
  Căn cứ: Hậu quả nhẹ: chỉ ảnh hưởng tài liệu nội bộ của bản mẫu, không mất dữ liệu, thêm một ca thử sau này là xong.
  file: `packages/ui-lint/tests/khu-ban-mau.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 — Assert «có mặt» trong khi lời hứa là QUAN HỆ: AC-5 «sáng đúng nhà của bố cục» chỉ đo «có nhà sáng» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Trang mẫu sống có thể sáng nhầm nhà ở một bố cục mà kiểm tra tự động vẫn báo đạt. Hiện chưa thấy lỗi thật, chỉ là lưới kiểm tra chưa chặt.
  Căn cứ: Nhẹ vì chỉ là màn mẫu nội bộ, người xem thấy ngay và tải lại hay sửa đều rẻ.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 — Fixture VIẾT TAY đúng khuôn bên đọc: danh sách mục Hôm nay không rút từ writer mucHomNay/TODAY_ITEMS (r1)**
  Người dùng thấy gì: Nếu sau này đổi cách tạo liên kết vào mục nhóm của Hôm nay, kiểm tra tự động có thể vẫn xanh trong khi mục sáng bị lệch. Hiện người dùng chưa gặp gì.
  Căn cứ: Rủi ro chỉ xuất hiện khi có thay đổi sau này và dễ thấy khi dùng, sửa test rẻ nhưng không gấp.
  file: `apps/web/src/components/shell/dia-chi-mau.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — Assertion âm-tính-một-mình: E5b kết luận «không còn nhaMau» từ mọi lần grep không ra exit 0, không đối chứng dương (r1 · tệp đã đổi)**
  Người dùng thấy gì: Kiểm tra có thể báo đã sạch dù thực ra không quét được thư mục. Người dùng không bị ảnh hưởng, chỉ rủi ro sót một tên cũ trong mã.
  Căn cứ: Hậu quả rất nhẹ vì trình kiểm kiểu vẫn bắt tên cũ còn sót, nên chi phí sửa không đáng.
  file: `_acceptance/ban-mau-khai-dia-chi/evals.yaml`
  severity: low
  Đề xuất: wont-fix

⚠ Cụm ngoài vùng phủ: 4/10 lỗi rơi vào file không bộ đo nào phủ (_acceptance/ban-mau-khai-dia-chi/evals.yaml, _acceptance/ban-mau-khai-dia-chi/evidence/E1-network.txt) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
