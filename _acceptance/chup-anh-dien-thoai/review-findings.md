## Trong hợp đồng

- **Đổi người dùng chỉ tắt nhịp thử, hàng chờ cũ vẫn tải và vẫn ghi kho**
  AC: AC-4
  file: `apps/web/src/app/(app)/units/photos/hang-cho-may.ts:24`
  severity: medium
  source: bugs
  detail: Khi `userId` khác, `khoiDongHangCho` gọi `ban?.dung()`, nhưng hàm này chỉ chạy `nhip.dung()` và gỡ trình nghe «online». Nó không gọi `hang.dung()` mới thêm ở vòng này. Vì `daDung` của hàng cũ vẫn là false, nếu hàng cũ đang ở giữa vòng `motLuot` thì nó tiếp tục lấy ảnh `cho-mang` kế tiếp của người A và gửi bằng cookie phiên lúc đó, tức có thể là phiên của người B. Nó cũng tiếp tục ghi hay xoá trong kho `quy-hang-anh-cho:A`. Đây đúng là lỗ AC-6 mà vòng này định bịt, nay còn ở lối đổi người. Cần gọi `await ban.hang.dung()` (hoặc `dungHangCho()`) trước khi dựng hàng mới.
  rationale: AC-4 chỉ cho ảnh chờ tải tiếp sau khi chính người chụp đăng nhập; hàng cũ tải ảnh của người A bằng phiên người B là vi phạm.

- **Hai lối xoá kho khác chưa dừng hàng chờ, kho ảnh chờ vẫn có thể bị lượt tải đang dở mở lại**
  AC: AC-6
  file: `apps/web/src/lib/sync/react.tsx:42`
  severity: medium
  source: bugs
  detail: Vòng này chỉ thêm `dungHangCho()` trước khi xoá kho ở lối `dangXuat` trong vỏ. Hai lối khác vẫn xoá kho mà không dừng hàng chờ. (1) Máy bị báo mất (react.tsx:40-43): `xoaMayBiBao(u)` gọi thẳng `xoaKhoCuaNguoi`. (2) Đăng xuất ở màn chọn sàn và màn chưa có sàn (app/(auth)/dang-xuat.tsx:19): chỉ `xoaKhoCuaNguoi(userId)`, trong khi `ban` là biến cấp module nên vẫn chạy nếu người vào đó bằng chuyển trang phía máy khách từ vỏ. Ở cả hai lối, lượt đang dở xong thì `ghiTrangThai`/`xongAnh` gọi `vaoKho`, và `kho-anh-cho.ts` mở lại cơ sở dữ liệu (`indexedDB.open` sau `onversionchange`). Như vậy kho vừa xoá được tạo lại, có thể kèm bản ghi ảnh ngăn Nội bộ ở trạng thái `loi`, ngay trên chiếc máy bị báo mất. Đây chính là tình huống mà bài kiểm «E7 đăng xuất giữa lúc đang tải» dùng làm đối chứng dương.
  rationale: AC-6 đòi máy bị báo mất xoá mọi ảnh chờ; lối này để kho được tạo lại kèm ảnh Nội bộ.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đăng xuất phải chờ hết lượt tải ảnh đang chạy vì lượt tải không bị huỷ, nên có thể treo lâu**
  Người dùng thấy gì: Khi mạng yếu và đang tải ảnh lớn, bấm Đăng xuất có thể đứng chờ khá lâu trước khi xong. Cuối cùng ảnh chờ vẫn bị xoá.
  Căn cứ: Chỉ làm chậm chứ không làm mất hay lộ dữ liệu, người dùng chờ hoặc tải lại là xong, và sửa cần thêm cơ chế huỷ lượt tải khá tốn công.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.ts`
  severity: medium
  Đề xuất: known-limits

- **Một lần xoá hay ghi kho bị lỗi làm cờ «kho lỗi» bật mãi, ngăn chụp báo «Máy không giữ được ảnh chờ» cả khi đáng lẽ không báo**
  Người dùng thấy gì: Sau một lần lỗi nhỏ khi dọn kho, ngăn chụp có thể báo sai rằng máy không giữ được ảnh chờ cho tới khi tải lại trang.
  Căn cứ: Chỉ là lời báo sai gây lo, không mất ảnh nào, và người dùng tự hết báo bằng cách tải lại trang.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.ts`
  severity: low
  Đề xuất: known-limits

- **Đăng xuất phải chờ lượt tải đang dở chạy xong, không huỷ được, nên có thể treo**
  Người dùng thấy gì: Bấm Đăng xuất lúc đang tải ảnh có thể bị đứng chờ, và ảnh đang bay vẫn lên máy chủ sau khi người đã bấm.
  Căn cứ: Ảnh đó vốn là ảnh của chính người ấy nên không lộ gì, chỉ chậm; tự hết sau khi lượt tải xong, sửa đắt hơn hậu quả.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên một lớp nhưng chỉ đo một điểm): bài «E7 đăng xuất giữa lúc đang tải» tự viết tay thứ tự dừng-rồi-xoá, không chạy qua đường xoá kho thật nào**
  Người dùng thấy gì: Bài kiểm đăng xuất giữa lúc tải chưa phủ đúng đường thật, nên nếu sau này ai đảo thứ tự dừng và xoá thì bài kiểm vẫn xanh.
  Căn cứ: Không ảnh hưởng người dùng hôm nay, chỉ giảm độ tin của lưới kiểm lần sau; lỗ hành vi thật được xử lý ở mục khác.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (dữ liệu vào viết tay đúng khuôn bên đọc): bài kho-loi đưa thẳng `khoLoi: true` vào KhayChup thay vì lấy từ hàng chờ**
  Người dùng thấy gì: Bài kiểm lời báo máy không giữ được ảnh chưa chứng minh được dây nối thật từ kho lỗi tới màn hình.
  Căn cứ: Mức nhẹ, không gây hại trực tiếp cho người dùng, và lời báo này đã tự lộ ra khi dùng thật nên không đáng mở việc.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo hàm phụ thay vì đầu ra): bài «E3 không có hàng chờ… không tệp nào bị bỏ im lặng» chỉ gọi `khongNhanTep`**
  Người dùng thấy gì: Bài kiểm chưa chứng minh được rằng khi máy không có hàng chờ thì tệp bị từ chối vẫn được báo cho người chụp.
  Căn cứ: Nhánh hiếm, hậu quả nhẹ (người chụp lại được), sửa bài kiểm không đổi hành vi cho người dùng.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

