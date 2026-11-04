# Review findings: man-nhap-excel

## Trong hợp đồng

- **A stale write-progress object resends old packets to the old import after going back and re-previewing**
  AC: AC-4
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:145`
  severity: high
  source: bugs
  detail: The write button runs `const t = ghi ?? batDauGhi(s)`, and `ghi` is never cleared. It is not cleared when the preview changes (`boDong`/`suaO`/`doiDichCot` set xemThu=null), when the user goes back, or when a new file is loaded. Example: writing fails at packet N, so the error shows and the Back button reappears because dangGhi=false. The user goes back, skips or edits rows (or loads another file), previews again and gets a new importId in s.xemThu. Pressing write at step 5 still uses the old `ghi`: it resends the old packets (built from goiDong of the old state) to the old importId and labels the button «Thử lại gói N». The data written does not match the preview that was just shown, and rows the user has since skipped can still be written. Fix: reset `ghi` (setGhi(null)) whenever s.xemThu changes or a new importId is created, or check that ghi.importId === s.xemThu.importId.
  rationale: Sau khi bỏ dòng hay sửa ô, bản ghi vẫn gửi dòng cũ, trái với «dòng bỏ gửi skip: true» và «giá trị gửi lên là giá trị người sửa».

- **Hình dạng 5 (tuyên quét lớp nhưng một nhánh rỗng): ca «đọc tệp: bộ thử hàng 64 ra đúng lưới lõi» không đọc tệp xlsx thật nào**
  AC: AC-1
  file: `apps/web/src/lib/nhap/doc-tep.test.ts:41`
  severity: medium
  source: measurement
  detail: Theo evals E1, ca này phải so lưới của bộ đọc màn với lưới lõi trên mọi tệp của sinhBoThu(), trong đó mau-a và mau-b đọc bằng docXlsx. Nhưng nhánh `if (t.bytes && laZip(t.bytes))` (dòng 44) không bao giờ chạy. Trong packages/core/test/import/sinh.ts, mau() trả `{ ten, grid, dapAn }` mà không có bytes, và chỉ hai tệp csv có bytes. Vì vậy mau-a và mau-b rơi vào nhánh else: lưới đã đọc sẵn được exceljs ghi lại thành tệp mới rồi so với chính lưới đó. Tệp mau-a.xlsx và mau-b.xlsx thật không bao giờ đi qua docTep, nên quan hệ docTep(tệp) = docXlsx(tệp) không được đo. Hai assert đếm `so >= 8` và `so === bo.length` chỉ đếm số tệp, không đếm nhánh nào đã chạy, nên vẫn xanh khi nhánh xlsx có 0 phần tử.
  rationale: AC-1 đòi bộ đọc đọc mau-a.xlsx và mau-b.xlsx ra đúng lưới lõi nhưng bài kiểm không đọc tệp xlsx thật nào nên AC chưa được chứng.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Chú thích của writeBatch bị tách khỏi hàm, nằm thừa trên dauChuCuaSan**
  Người dùng thấy gì: Không ảnh hưởng người dùng; chỉ làm người đọc code thấy mô tả nhầm khi rê chuột.
  Căn cứ: Không có hậu quả nào với người dùng, không mất dữ liệu, sửa rẻ nhưng không đáng mở việc riêng.
  file: `packages/api/src/imports/store.ts`
  severity: low
  Đề xuất: wont-fix

- **Trình gọi API của màn nhập không bắt lỗi khi đọc thân của phản hồi thành công, màn có thể kẹt ở «Đang ghi»**
  Người dùng thấy gì: Hiếm khi máy chủ trả về trang không đọc được; khi đó màn có thể đứng ở «Đang ghi» và không hiện nút Thử lại, người dùng phải tải lại trang.
  Căn cứ: Rất hiếm gặp, tải lại trang là thoát được và gói đã ghi được gửi lại không bị nhân đôi nên không mất hay trùng dữ liệu.
  file: `apps/web/src/lib/nhap/goi-api.ts`
  severity: low
  Đề xuất: known-limits

- **canCuaTep sends skipped rows too, so a later duplicate row is still skipped as a duplicate of a row the user dropped**
  Người dùng thấy gì: Khi hai dòng trùng căn và người dùng bỏ dòng đầu để giữ dòng sau, cả hai dòng đều không được ghi, căn muốn giữ bị mất khỏi lần nhập.
  Căn cứ: Căn muốn giữ không vào được hàng và người dùng không tự xử lý được trên màn, nhưng thấy được ở bước xem trước và có thể nhập lại; sửa nằm ở luật trùng nên nên làm thành việc riêng.
  file: `apps/web/src/lib/nhap/trang-thai.ts`
  severity: high
  Đề xuất: new-contract

- **Failing to load the agent list is swallowed silently, leaving a team lead stuck at step 1 with no explanation**
  Người dùng thấy gì: Nếu danh sách Đầu chủ không tải được, Trưởng nhóm bị kẹt ở bước một, nút Tiếp không bấm được và không có thông báo vì sao.
  Căn cứ: Chỉ xảy ra khi mạng hay máy chủ lỗi, không mất dữ liệu và tải lại trang là thử lại được.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Failing to load the catalog silently falls back to an import context without a catalog**
  Người dùng thấy gì: Nếu danh mục không tải được, màn vẫn chạy và có thể hiện dấu, giá trị khác với kết quả máy chủ tính khi ghi, mà không báo lỗi.
  Căn cứ: Hiếm gặp và bước xem thử trên máy chủ vẫn cho số thật trước khi ghi, nên ít khi dẫn đến ghi sai; tải lại trang là thoát.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (không ghim thông điệp): các ca lỗi của «đọc tệp: lỗi có tên» so với hằng của chính module đang kiểm**
  Người dùng thấy gì: Nếu ai đó vô tình đổi hay làm mất lời hướng dẫn khi tải tệp .xls, bài kiểm vẫn xanh và người dùng thấy thông báo kém rõ.
  Căn cứ: Chỉ ảnh hưởng chất lượng chữ thông báo, không mất dữ liệu, sửa lại dễ khi phát hiện.
  file: `apps/web/src/lib/nhap/doc-tep.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm một mình): E9 «cotNguonChiHinhDang» chỉ kiểm chuỗi số không xuất hiện**
  Người dùng thấy gì: Bài chụp màn chỉ chứng minh số điện thoại chủ nhà không hiện, chưa chứng minh cột nguồn hiện chữ mô tả hình dạng.
  Căn cứ: Không lộ dữ liệu, chỉ là bằng chứng chưa đủ chặt; người duyệt vẫn xem được ảnh chụp.
  file: `_acceptance/man-nhap-excel/thu/chup-man.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (thông điệp ghim thiếu): «ghép cột: cột nguồn sang trường ngoài lớp nguồn bị chặn» không ghim tên trường đích**
  Người dùng thấy gì: Bài kiểm không bắt được trường hợp thông báo lỗi ghép cột thiếu hay nêu nhầm tên trường đích, người dùng khi đó khó biết sửa chỗ nào.
  Căn cứ: Chỉ ảnh hưởng độ rõ của thông báo; việc chặn ghép sai vẫn được kiểm nên dữ liệu chủ nhà vẫn an toàn.
  file: `apps/web/src/lib/nhap/duong-ong.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
