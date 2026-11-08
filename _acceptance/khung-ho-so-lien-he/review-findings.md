# Review findings: khung-ho-so-lien-he (round 1)

## Trong hợp đồng

- **Each filter change now also reads the contact list on the server, and the client reads it again**
  file: `apps/web/src/app/(app)/contacts/page.tsx:441`
  severity: low
  AC: AC-7
  source: conventions
  detail: The page server now reads the first page of the contact list on every request (`trangDauLienHe(loc, goi)` at lines 441-449). Changing a filter calls `router.replace` with a new `?type=` or `?status=`, which re-runs this server page. So each filter change runs one extra list query on the server and waits for it before the new URL takes effect. That server result is then thrown away: `VungLienHe` only uses `dau` to seed its first state (`useState(dau ? ...)`), and after the first read (`daDoc.current = true`) `canDocLan` always returns true, so the client reads the same list again. The net result is two list queries per filter change, and the filter takes effect later than before. This goes against the AC «đổi bộ lọc hỏi ngay» and the speed goal of this round. Suggestion: only prefetch on the first visit, or reuse `dau` when its key matches the new filter key instead of reading again on the client.

- **Đổi bộ lọc giờ phải chờ máy chủ đọc danh sách xong, rồi máy khách lại đọc lần nữa**
  file: `apps/web/src/app/(app)/contacts/page.tsx:418`
  severity: medium
  AC: AC-7
  source: bugs
  detail: Trang này là force-dynamic và giờ đọc searchParams rồi chờ trangDauLienHe trước khi trả kết quả. setLoai trong vung.tsx gọi router.replace('/contacts?type=…'), nên mỗi lần đổi bộ lọc máy chủ dựng lại trang và đọc danh sách xong mới trả về. Chỉ khi đó useSearchParams mới đổi và effect mới chạy. Lúc này lanDau là false nên effect bỏ qua `dau` vừa đọc và gọi docDanhSach thêm một lần. Kết quả là mỗi lần đổi loại hay Lead có hai lần đọc nối tiếp: lần ở máy chủ bị bỏ, lần ở máy khách mới được dùng. Điều này đi ngược ý định trong henDoc('doi-loc') = 0, tức đổi bộ lọc thì hỏi ngay. Trước vòng này, lượt dựng lại ở máy chủ không có lần đọc danh sách nào.

- **Hồ sơ đang tải hay bị lỗi không có nút «Đóng hồ sơ»; trên máy tính chỉ còn Esc để đóng**
  file: `apps/web/src/app/(app)/contacts/ho-so.tsx:105`
  severity: low
  AC: AC-2
  source: bugs
  detail: onDong chỉ được gắn vào DauHoSo trong nhánh 'xong'. Ở nhánh 'dang-tai' (ChoTai) và 'loi' (TrangThai) hàm trả về sớm, nên không có nút đóng. Cột phụ trên máy tính không còn cách nào khác để đóng (BoCuc/CotKeoChia không tự thêm nút). Vì vậy khi tải hồ sơ hỏng, người dùng chỉ đóng được bằng Esc, mà Esc lại không chạy khi đang ở ô tìm. Trong khi đó luật KH-lh-mot-khung (design/patterns/lien-he.md) ghi khung có nút «Đóng hồ sơ» «cả lúc đang tải và lỗi». Bài kiểm E2 chỉ thử trạng thái 'xong' nên không bắt được chỗ thiếu này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hình dạng 5 — tuyên quét LỚP (menu, listbox, dialog) nhưng chỉ có điểm-case menu**
  Người dùng thấy gì: Bài kiểm chỉ thử Esc trong menu, chưa thử riêng hộp chọn và hộp thoại. Nếu sau này ai đó làm hỏng phần đó, bài kiểm có thể không báo, và Esc có thể đóng hồ sơ nhầm.
  Căn cứ: Người dùng hiện chưa gặp lỗi nào, chỉ là lưới kiểm thưa; bổ sung các ca còn thiếu sau này rẻ và không mất dữ liệu.
  file: `apps/web/src/app/(app)/contacts/khung-ho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 — ngưỡng chép tay thay vì rút từ nguồn của bố cục**
  Người dùng thấy gì: Nếu sau này đổi tỉ lệ cột hồ sơ, bảng có thể hẹp lại và mất cột mà bài kiểm vẫn báo xanh. Hiện tại màn hình vẫn đúng.
  Căn cứ: Hiện chưa có hậu quả với người dùng, chỉ là nguy cơ khi đổi tỉ lệ cột sau này; ghi lại để người đổi tỉ lệ biết tự soi.
  file: `apps/web/src/app/(app)/contacts/khung-ho-so.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
