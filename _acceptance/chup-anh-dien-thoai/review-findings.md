# Review findings: chup-anh-dien-thoai (round 1)

## Trong hợp đồng

- **Đăng xuất dừng hàng chờ nhưng lượt tải đang chạy vẫn tiếp tục và có thể ghi lại ảnh (cả ảnh Nội bộ) vào kho vừa xoá**
  file: apps/web/src/app/(app)/units/photos/hang-cho-may.ts:48
  severity: medium
  AC: AC-6
  source: bugs
  detail: dungHangCho() chỉ gọi b.dung() (dừng nhịp và gỡ listener online), đặt ban=null rồi chờ choKho(), tức là chỉ chờ chuỗi lệnh vào kho đang có lúc đó. Nó không chặn motLuot() đang chạy (hang-cho-anh.ts:153). Vòng for(;;) vẫn chạy tiếp: tải nốt các ảnh «cho-mang» còn lại, vì phiên máy chủ còn sống tới khi dangXuatTrenMay gọi sign-out sau đó. Mỗi kết quả về sau lại đẩy lệnh vào kho: xongAnh gọi vaoKho(xoa), khi máy chủ không nhận thì ghiTrangThai gọi vaoKho(ghi(moi)). Trong lúc đó xoaKhoCuaNguoi (react.tsx:86) đã xoá cơ sở dữ liệu, onversionchange đặt db=null, nên lay() mở lại indexedDB.open(tenKhoAnhCho(userId), 1) và tạo lại kho. Trường hợp lỗi thì ghi lại cả bản ghi có blob ảnh gốc, kể cả ảnh ngăn Nội bộ, sau khi người đã đăng xuất. Trái AC-6 (đăng xuất chủ động phải xoá hàng chờ). Cách sửa: thêm cờ «đã dừng» trong taoHangCho để motLuot và vaoKho không làm gì sau khi dung, và chờ dangChay xong trước khi xoá kho.

- **Lỗi IndexedDB của hàng chờ bị nuốt: ảnh tưởng đã «chờ trên máy» nhưng thực ra chỉ nằm trong bộ nhớ**
  file: apps/web/src/app/(app)/units/photos/hang-cho-may.ts:48
  severity: medium
  AC: AC-4
  source: bugs
  detail: `void hang.khoiDong().catch(() => {})` nuốt mọi lỗi kho.tai() (mở IndexedDB lỗi, hết dung lượng, Safari riêng tư...). Khi đó ảnh chờ của phiên trước không bao giờ được dựng lại và tải lên, cũng không có dấu hiệu nào. Lệnh ghi của ảnh mới cũng vậy: trong taoHangCho, them() gọi `void vaoKho(() => o.kho.ghi(b))` (hang-cho-anh.ts:239), còn ghiTrangThai gọi `void vaoKho(...)` (dòng 141). Lời hứa bị từ chối không ai xử lý. Màn vẫn báo «Chờ mạng — tự tải khi có mạng» và «Ảnh chờ trên máy», trong khi ảnh chỉ còn trong bộ nhớ: đóng hay tải lại app là mất ảnh. Đúng tình huống AC-4 hứa giữ ảnh.

- **Chụp ảnh khi hàng chờ không có (ban=null) thì ảnh bị bỏ trong im lặng**
  file: apps/web/src/app/(app)/units/ho-so/dien-thoai/chup-anh.tsx:148
  severity: medium
  AC: AC-3
  source: bugs
  detail: Trong nhan(), `const h = hangChoHienTai(); if (!h) return;` bỏ các tệp máy ảnh vừa trả mà không báo gì, kể cả mục «Tệp không nhận» cũng không có. ban có thể là null khi giao diện vẫn dùng được: dangXuat() trong react.tsx gọi dungHangCho() (đặt ban=null) trước khi gọi sign-out. Nếu sign-out lỗi hay mất mạng, dangXuatTrenMay trả «loi» và người ở lại app với phiên còn sống («Chưa đăng xuất được»). Effect khoiDongHangCho(userId) chỉ chạy lại khi userId đổi, nên hàng chờ không khởi động lại. Từ đó mọi ảnh chụp ở hồ sơ điện thoại bị bỏ trong im lặng.

- **Đọc lại danh sách sau khi một ảnh lên máy chủ mà lỗi thì nút và ngăn Chụp ảnh biến mất giữa lúc đang chụp**
  file: apps/web/src/app/(app)/units/ho-so/dien-thoai/anh-lon.tsx:98
  severity: low
  AC: AC-8
  source: bugs
  detail: useAnhCan đọc lại danh sách mỗi lần lanTai tăng (mỗi lần một ảnh lên máy chủ). Lần đọc lại mà lỗi (mạng chập chờn ngay sau khi tải, thường gặp lúc đi xem nhà) thì setKq({kind:'loi'}) ghi đè danh sách cũ. Ghi chú trong code nói giữ bản cũ tới khi có bản mới, nhưng chỉ đúng khi đọc thành công. coNutChup (than-dien-thoai.tsx:29) cần anh.kind === 'co', nên ChupAnh bị gỡ: ngăn đang mở đóng lại và nút Chụp ảnh (kèm số ảnh chờ) mất cho tới khi đọc lại thành công. Trong khi đó hàng chờ vẫn còn ảnh, mà người không mở lại được ngăn để xem hay bấm «Thử lại».

- **Hình dạng 5 — tuyên ma trận 5 ô mạng nhưng hai ô «có lại bằng online» và «có lại bằng nhịp 15 giây» không phân biệt được cơ chế**
  file: apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts:553
  severity: medium
  AC: AC-4
  source: measurement
  detail: Trong lechMang, sau khi bật lại mạng (`mang.on = true`), ô «có lại bằng online» gọi `nhip.quayLaiTrang()` và ô «có lại bằng nhịp 15 giây» gọi `gio.toi(CHU_KY_CHO)`. Ngay sau đó dòng 556 luôn chạy `await xong(h)`, mà `xong` (dòng 339-342) gọi thẳng `h.day()`. `day()` (hang-cho-anh.ts:181) tự mở một lượt tải mới khi đang có mạng. Nghĩa là dù sự kiện online hay nhịp 15 giây không làm gì (ví dụ `taoNhip` không gọi `thu`, hay `quayLaiTrang` không nối gì), cả ba ảnh vẫn lên máy chủ và hai ô vẫn xanh. Không có chiều đỏ nào làm hỏng lối online hay nhịp 15 giây. Hai ô trùng hẳn với lối mặc định `else await h.day()`, nên thực ra chỉ có 3 ô đo được chứ không phải 5 như E4 tuyên. Lời hứa «có lại bằng sự kiện online · có lại bằng nhịp 15 giây» chưa được đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hàng chờ ảnh không gắn sàn: ảnh chụp ở sàn A có thể được tải vào căn trùng toà/mã của sàn B**
  Người dùng thấy gì: Người làm ở hai sàn có thể chụp ảnh lúc mất mạng ở sàn này, đổi sang sàn kia, rồi ảnh (kể cả ảnh sổ đỏ) tự lên căn trùng toà và mã của sàn kia.
  Căn cứ: Nặng vì ảnh nội bộ có thể sang sàn khác và không gỡ lại được, nhưng chỉ xảy ra với người thuộc nhiều sàn và hợp đồng này chưa nói tới trường hợp đó nên cần tính năng riêng.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.ts`
  severity: high
  Đề xuất: new-contract

- **Thư viện lõi lib/sync import ngược vào một route của app**
  Người dùng thấy gì: Người dùng không thấy gì khác đi; chỉ là lớp đồng bộ gắn chặt vào màn ảnh nên sau này sửa hoặc tách dễ vướng.
  Căn cứ: Nhẹ, không mất dữ liệu và người dùng không gặp lỗi; có thể dọn sau khi cần mà không tốn nhiều.
  file: `apps/web/src/lib/sync/react.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 — fixture kho đồng bộ viết tay; lời hứa «kho đồng bộ không có khoá ảnh nào» không đo qua bên ghi thật**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng ảnh chờ không lẫn vào kho đồng bộ chung, nên nếu sau này có người sửa nhầm thì bài kiểm có thể không báo.
  Căn cứ: Nhẹ với người dùng hiện tại vì chưa có lỗi thật, chỉ là lưới an toàn mỏng; bổ sung sau khá rẻ.
  file: `apps/web/src/app/(app)/units/photos/hang-cho-anh.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 1 — đo chuỗi trong mã nguồn kho-anh-cho.ts thay vì đo kho được mở**
  Người dùng thấy gì: Bài kiểm chỉ đọc chữ trong mã chứ không mở kho thật, nên có thể không phát hiện nếu kho ảnh chờ vô tình dùng chung tên với kho đồng bộ.
  Căn cứ: Nhẹ vì chưa có lỗi thật và không ảnh hưởng người dùng ngay; củng cố sau khi cần.
  file: `apps/web/src/app/(app)/units/photos/muc-anh.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

