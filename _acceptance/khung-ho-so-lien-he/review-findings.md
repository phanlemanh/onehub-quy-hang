# Review findings: khung-ho-so-lien-he (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Gõ rồi xoá ô tìm trong 250 ms làm con trỏ «Xem thêm» quay về trang 1 sau khi đã nối trang 2, nên lần bấm tiếp theo nối lặp dòng**
  Người dùng thấy gì: Nếu người dùng bấm «Xem thêm», rồi gõ và xoá nhanh một ký tự ở ô tìm, lần «Xem thêm» kế tiếp có thể hiện lặp các dòng của trang trước. Tải lại màn là hết.
  Căn cứ: Chỉ xảy ra khi thao tác đúng thứ tự và rất nhanh, không mất hay lộ dữ liệu, người dùng tự gỡ được bằng cách tải lại; hợp đồng này không hứa phần nối trang.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kèm 1): lời hứa «quay về bộ lọc cũ không kẹt» là quan hệ trạng thái, nhưng phép đo chỉ kiểm một chuỗi có mặt trong mã nguồn vung.tsx**
  Người dùng thấy gì: Bài kiểm giữ lỗi «bảng kẹt khi quay về bộ lọc cũ» chỉ xem chữ trong mã chứ không chạy thử hành vi thật. Sau này có thể báo đỏ oan khi viết lại, hoặc bỏ sót nếu lỗi quay lại.
  Căn cứ: Không ảnh hưởng người dùng hiện tại vì hành vi đang đúng; rủi ro chỉ là bắt lỗi quay lại kém trong tương lai, và sửa nên làm cùng lúc nâng bộ kiểm màn này.
  file: `apps/web/src/app/(app)/contacts/khung-ho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Bảng có thể kẹt ở «đang tải», lỗi hay danh sách rỗng khi quay lại bộ lọc cũ: dấu «bảng đang đúng bộ lọc» không bị xoá khi nội dung bảng bị thay (r2 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi gõ tìm rồi xoá ô tìm, bảng liên hệ có thể kẹt ở «đang tải», báo lỗi hay trống thay vì hiện lại danh sách đầy đủ. Người dùng phải bấm «Thử lại» hoặc tải lại trang mới thấy danh sách.
  Căn cứ: Bảng trông như hỏng nhưng không mất dữ liệu và tải lại trang là hết, nên nên sửa trong một việc riêng thay vì chặn bản này.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: high
  Đề xuất: new-contract

- **Gõ rồi trả ô tìm về bộ lọc cũ trong lúc đang đọc thì bảng kẹt ở trạng thái đang tải (r2 · tệp đã đổi)**
  Người dùng thấy gì: Nếu người dùng gõ vài chữ rồi xoá ngay trong lúc bảng đang tải, bảng đứng mãi ở khung chờ và không hiện lại danh sách. Phải tải lại trang mới thoát.
  Căn cứ: Gặp khi gõ rồi xoá nhanh, không mất dữ liệu và tải lại trang là xử lý được, nhưng nên sửa sớm vì dễ gặp.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: high
  Đề xuất: new-contract

- **Sau khi tìm theo số hoặc đọc lỗi, xoá ô tìm không hiện lại danh sách (r2 · tệp đã đổi)**
  Người dùng thấy gì: Sau khi tìm theo một số điện thoại đầy đủ hoặc gặp lỗi tải, xoá ô tìm không đưa danh sách về như cũ: bảng vẫn trống hay vẫn báo lỗi. Người dùng phải tải lại trang hoặc bấm «Thử lại».
  Căn cứ: Không mất dữ liệu và người dùng tự gỡ được bằng cách tải lại, nhưng bảng hiển thị sai trạng thái nên cần sửa trong việc riêng.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: high
  Đề xuất: new-contract

- **Hình dạng 2 — fixture viết tay: ca «nút Đóng ở cả ba trạng thái» tự cấp onDong thay vì lấy từ chỗ vung.tsx dựng (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài tự kiểm nút Đóng có thể vẫn xanh dù sau này ai đó vô tình bỏ nút Đóng khỏi màn thật. Hiện nút vẫn hoạt động đúng, chỉ là lưới an toàn yếu hơn.
  Căn cứ: Người dùng chưa bị ảnh hưởng gì, chỉ là rủi ro về sau, và đã có ảnh chụp màn thật làm bằng chứng nên ghi lại hạn chế là đủ.
  file: `apps/web/src/app/(app)/contacts/khung-ho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — hằng số viết tay: phần vỏ 322 px trong ngưỡng bề rộng bảng E3 không rút từ bố cục (r2 · tệp đã đổi)**
  Người dùng thấy gì: Bài tự kiểm bề rộng bảng dùng một con số chép tay cho phần vỏ quanh bảng. Nếu sau này vỏ rộng ra, bảng có thể bị hẹp mà bài kiểm vẫn không báo.
  Căn cứ: Hiện bảng đủ cột đúng như cam kết, rủi ro chỉ xảy ra khi bố cục đổi sau này, nên ghi hạn chế đã biết là đủ.
  file: `apps/web/src/app/(app)/contacts/khung-ho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 — tuyên quét LỚP (menu, listbox, dialog) nhưng chỉ có điểm-case menu (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm chỉ thử Esc trong menu, chưa thử riêng hộp chọn và hộp thoại. Nếu sau này ai đó làm hỏng phần đó, bài kiểm có thể không báo, và Esc có thể đóng hồ sơ nhầm.
  Căn cứ: Người dùng hiện chưa gặp lỗi nào, chỉ là lưới kiểm thưa; bổ sung các ca còn thiếu sau này rẻ và không mất dữ liệu.
  file: `apps/web/src/app/(app)/contacts/khung-ho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — ngưỡng chép tay thay vì rút từ nguồn của bố cục (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này đổi tỉ lệ cột hồ sơ, bảng có thể hẹp lại và mất cột mà bài kiểm vẫn báo xanh. Hiện tại màn hình vẫn đúng.
  Căn cứ: Hiện chưa có hậu quả với người dùng, chỉ là nguy cơ khi đổi tỉ lệ cột sau này; ghi lại để người đổi tỉ lệ biết tự soi.
  file: `apps/web/src/app/(app)/contacts/khung-ho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
