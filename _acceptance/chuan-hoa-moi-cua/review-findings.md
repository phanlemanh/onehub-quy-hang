## Trong hợp đồng

- **Hình dạng 4 — kiểm âm một mình: «duyệt hay bỏ không đổi dữ liệu đã lưu» không thể đỏ**
  file: `packages/api/test-db/chuan-hoa-moi-cua/tu-dien.test.ts:411`
  severity: medium
  AC: AC-7
  source: measurement
  detail: Căn được tạo với ô phí «bao phí» (dòng 413), là cách gõ dựng sẵn. Cách gõ được duyệt rồi bỏ lại là «phi rieng» → excluded (dòng 420). Không căn nào đã lưu mang chữ «phi rieng», nên kể cả khi code chuẩn hoá lại các căn cũ sau mỗi lần duyệt, `assert.deepEqual(await chup(), truoc)` (dòng 423) vẫn xanh. Phép kiểm này không phân biệt được bản đúng với bản sai. Kết quả của `quyet(s, id, "approve")` (dòng 421) cũng không được kiểm. Đối chứng dương ở dòng 424 chỉ đọc trạng thái cuối «rejected», tức chỉ chứng minh lệnh bỏ chạy, không chứng minh lệnh duyệt đã thành công. Kiểm đúng lời hứa của E7 cần ba điều: căn đã lưu mang đúng chữ gốc của cách gõ được duyệt, assert lệnh duyệt trả 200, và một đối chứng cho thấy lần nhập mới sau khi duyệt thì chuẩn hoá ra giá trị chuẩn.
  rationale: Phép kiểm dành cho AC-7 (duyệt không viết lại dữ liệu đã lưu) không thể đỏ nên không chứng minh được AC đó.

- **Hình dạng 3 — kiểm «chuỗi có mặt và đứng trước» trong khi lời hứa là trang chặn người trước khi đọc API**
  file: `apps/web/src/app/(app)/settings/dictionary/tu-dien.test.ts:184`
  severity: low
  AC: AC-5
  source: measurement
  detail: `chanTruocApi` chỉ so vị trí `indexOf("chanMucSan(")` với `indexOf("/api/v1/company/")` trong mã nguồn trang. Lời hứa của E5b là người không quản trị bị chuyển trang trước khi trang đọc API. Lời hứa đó cần hai điều: kết quả của lời gọi chặn được dùng để chuyển trang, và chuyển trang xảy ra trước lời gọi API. Nếu xoá dòng `if (chan) redirect(chan);` trong page.tsx, hoặc gọi `chanMucSan(...)` mà bỏ kết quả, ca vẫn xanh vì chuỗi `chanMucSan(` vẫn có mặt và vẫn đứng trước chuỗi đường API. Chiều đỏ ở dòng 192 chỉ thử đổi tên hàm, không thử bỏ bước chuyển trang.
  rationale: AC-5 hứa người không phải quản trị không mở được màn; phép kiểm không bắt được việc bỏ bước chuyển trang.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đề xuất trùng chữ gập nhưng khác giá trị bị tính thành lượt chọn cho giá trị cũ, còn nhật ký lại ghi giá trị mới**
  Người dùng thấy gì: Nếu hai người chọn hai giá trị khác nhau cho cùng một cách gõ, lựa chọn của người sau bị bỏ qua mà vẫn tính phiếu cho giá trị của người trước. Số lần chọn trên màn Từ điển và nhật ký có thể lệch với điều người dùng thật sự chọn.
  Căn cứ: Chỉ làm số liệu và nhật ký lệch nhẹ, không mất hay lộ dữ liệu, và quản trị sàn vẫn duyệt hoặc bỏ đúng giá trị đang hiển thị; sửa sau không đắt.
  file: `packages/db/migrations/051_tu_dien_cua_san.sql`
  severity: medium
  Đề xuất: known-limits

- **Proposing a different value for an existing spelling silently counts as a pick of the old value, and the audit log records the wrong value**
  Người dùng thấy gì: Khi người sau chọn giá trị khác cho cách gõ đã có đề xuất, máy báo thành công nhưng thực ra không ghi lựa chọn đó, còn nhật ký ghi một giá trị mà cách gõ không trỏ tới. Số phiếu trên màn Từ điển bị thổi phồng cho giá trị không ai chọn.
  Căn cứ: Hậu quả là số liệu và nhật ký sai lệch, không mất hay lộ dữ liệu của căn; tình huống hiếm và quản trị sàn vẫn kiểm soát ở bước duyệt.
  file: `packages/db/migrations/051_tu_dien_cua_san.sql`
  severity: medium
  Đề xuất: known-limits

- **Preview silently loses the sàn's approved spellings when reading the dictionary fails, while the server write still uses them**
  Người dùng thấy gì: Nếu màn xem trước không tải được từ điển của sàn, các ô dùng cách gõ đã duyệt lại hiện «cần người» dù khi lưu máy chủ vẫn chuẩn hoá đúng. Người dùng không được báo là từ điển chưa tải.
  Căn cứ: Chỉ xảy ra khi mạng hoặc máy chủ trục trặc, dữ liệu lưu vẫn đúng, và người dùng tải lại trang là hết; hậu quả nhẹ.
  file: `apps/web/src/lib/nhap/goi-y.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3 — ca E2 không kiểm dấu của ô hướng sau khi chọn gợi ý, dù lời hứa là ô hết «cần người»**
  Người dùng thấy gì: Phép kiểm tự động chưa chắc chắn ô hướng hết bị gắn «cần người» sau khi chọn gợi ý, dù giá trị đã đổi đúng. Nếu có lỗi, người nhập vẫn thấy cờ dù đã chọn xong.
  Căn cứ: Giá trị lưu vẫn đúng, chỉ là khoảng trống trong bài kiểm và người dùng nhìn thấy ngay nếu có sai; bổ sung kiểm sau rất rẻ.
  file: `apps/web/src/lib/nhap/goi-y.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
