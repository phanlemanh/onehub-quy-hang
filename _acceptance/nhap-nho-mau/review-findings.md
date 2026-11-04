# Review findings: nhap-nho-mau (round 2)

## Trong hợp đồng

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): E5 tự gọi docMau trong bài thử, không đo màn có gọi GET /imports/templates hay không**
  AC: AC-5
  file: `apps/web/src/lib/nhap/test-db/nho-mau.db-test.mts:72`
  severity: medium
  source: measurement
  detail: Hàm nhapLai trong bài thử tự gọi `docMau(f)` rồi truyền kết quả vào `chayOng(doc.grid, ctx, mau as never)`. Màn thật đi đường riêng: man-nhap.tsx dòng 73 gọi docMau(fetch) và dòng 108 gọi chayOng(..., mau). Evals E5 ghi chiều đỏ là «màn không gọi GET /imports/templates → ca đỏ nêu cột đổi đích». Nhưng nếu xoá lời gọi docMau hoặc bỏ tham số mau ở man-nhap.tsx, ca «nhớ mẫu: nhập lại là ghép sẵn» vẫn xanh, vì bài thử tự dựng lại đường nối thay cho màn. Vậy phép đo chỉ chứng được lõi và API, không chứng được chiều đỏ đã hứa về màn.
  rationale: AC-5 đòi kế hoạch của màn bằng kế hoạch đã ghi; phép đo không chứng được đường nối của màn.

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ma trận «bốn lớp cột không học» của E6 thật ra bị chặn bởi đích, không phải bởi lớp cột**
  AC: AC-6
  file: `apps/web/src/lib/nhap/nho-mau.test.ts:44`
  severity: medium
  source: measurement
  detail: KHONG_HOC tuyên bốn lớp (nguồn, tên người, chữ tự do, chưa rõ), nhưng bài thử chỉ ghim lớp của «Hướng» (`o.lop[huong].cls === 'source'`) và đích directionFaces của nó. Chạy planFromDictionary trên LUOI thì ra: «Tên chủ» → ownerName, «Mô tả» → keep_as_note, «Nhãn» → keep_as_note. Cả ba đích này đều ngoài TRUONG_CACH_GOI, nên hocCachGoi đã từ chối ở vế đích trước khi xét lớp. Kết quả là ba trong bốn hàng xanh bất kể luật LOP_HOC_DUOC ra sao: bỏ kiểm lớp, hay thêm 'person'/'free_text' vào LOP_HOC_DUOC, thì ba hàng ấy vẫn xanh. Lớp không được đo thật cho tên người, chữ tự do và chưa rõ. Ngoài ra `assert.equal(so + 5, 13)` cộng hằng 5 viết tay, không đếm các assert của phần đầu.
  rationale: AC-6 nêu rõ bốn lớp cột không học nhưng phép đo không chứng được từng lớp.

- **Hình dạng 3 (assert một thuộc tính trong khi lời hứa là quan hệ «không đổi»): «cột ghi chú không đổi» chỉ so mark, mà cột này có mark không thể đổi**
  AC: AC-6
  file: `apps/web/src/lib/nhap/nho-mau.test.ts:36`
  severity: medium
  source: measurement
  detail: Assert chỉ so `s.ong.dong.map(d => d.cells[gc].mark)` trước và sau khi sửa. Theo từ điển, «Ghi chú» trong LUOI có đích privateRemarks với phép text (đã chạy kiểm), nên ô của nó không bao giờ là needs_person, có valueMap hay không thì mark cũng như nhau. Vì vậy nếu suaO gấp nhầm bảng quy đổi «đã cọc rồi» → «Đã cọc» sang cột ghi chú (lỗi mà assert này muốn chặn), mark vẫn giữ nguyên và ca vẫn xanh. Muốn đo đúng lời hứa «cột ghi chú không đổi» thì phải so `plan.columns[gc]` (valueMap) hoặc giá trị đã đổi của ô, không chỉ mark.
  rationale: AC-6 hứa sửa ô ở cột khác thì kế hoạch không đổi; assert chỉ so mark nên không chứng được.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Hai khối JSDoc chồng nhau trên suaO — bản một dòng cũ còn sót**
  Người dùng thấy gì: Chỉ là một dòng ghi chú cũ còn sót trong mã, người dùng không thấy khác biệt nào.
  Căn cứ: Không ảnh hưởng gì tới người dùng hay dữ liệu, dọn lúc nào cũng được.
  file: `apps/web/src/lib/nhap/trang-thai.ts`
  severity: low
  Đề xuất: wont-fix

- **Chú thích của taoMau ghi sai nơi lưu tiêu đề (imports.header_row)**
  Người dùng thấy gì: Một dòng ghi chú trong mã nói sai chỗ lưu tiêu đề; người dùng không gặp gì.
  Căn cứ: Không đổi hành vi nào, chỉ có nguy cơ người sửa sau đọc nhầm, sửa rẻ nhưng không cấp bách.
  file: `packages/core/src/import/memory/mau.ts`
  severity: low
  Đề xuất: wont-fix

- **Sửa một ô bị cờ vì xung đột (phí trong ô giá, lệch danh mục) bị học thành cách gọi: ô cùng chữ ở các dòng khác bị đổi ngầm, và lần nhập sau còn nhớ cách đổi đó**
  Người dùng thấy gì: Khi người sửa một ô bị báo xung đột (ví dụ phí bao hay không bao), các dòng khác cùng chữ có thể bị đổi theo ngầm, và lần nhập sau còn nhớ cách đổi sai đó.
  Căn cứ: Nặng vì dữ liệu giá và phí có thể sai âm thầm và lặp lại ở các lần nhập sau, nên cần một việc riêng để định lại khi nào máy được học.
  file: `apps/web/src/lib/nhap/trang-thai.ts`
  severity: high
  Đề xuất: new-contract

- **apMau để lọt hai cột cùng đích khi cột theo mẫu đứng trước cột từ điển, hoặc khi một cột bị đưa về từ điển sau bước khử trùng**
  Người dùng thấy gì: Trong một số trường hợp hai cột của file cùng được ghép vào một trường, cột sau bị bỏ qua mà không báo.
  Căn cứ: Hiếm gặp nhưng làm mất dữ liệu một cột không báo; người dùng thấy ở bước xem trước nên còn tự sửa được, cần quyết định riêng cách xử lý.
  file: `packages/core/src/import/memory/mau.ts`
  severity: medium
  Đề xuất: new-contract

- **Chọn tệp trước khi mẫu tải xong thì màn lặng lẽ ghép theo từ điển, không báo gì**
  Người dùng thấy gì: Nếu chọn file quá nhanh khi mẫu đã nhớ chưa tải xong, màn ghép theo cách thường mà không báo, người dùng tưởng máy quên mẫu.
  Căn cứ: Nhẹ vì không mất dữ liệu và người dùng có thể tải lại hoặc chọn lại file, nhưng dễ gây hiểu nhầm là mẫu không hoạt động.
  file: `apps/web/src/app/(app)/imports/new/man-nhap.tsx`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 4 (assertion âm tính một mình, không ghim thông điệp): ma trận ba lý do vô hiệu của E2 chỉ assert «không theo mẫu»**
  Người dùng thấy gì: Bài kiểm tự động chưa phân biệt rõ ba lý do máy bỏ mẫu của một cột; hành vi với người dùng không đổi.
  Căn cứ: Chỉ làm bài kiểm yếu hơn mong muốn, không ảnh hưởng người dùng, không mất dữ liệu.
  file: `packages/core/src/import/memory/mau.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (assertion âm tính rỗng): E3 kiểm vắng mặt hai giá trị chưa từng được chèn vào kế hoạch**
  Người dùng thấy gì: Bài kiểm tự động có hai kiểm tra thừa về số điện thoại và giá mẫu; việc bảo vệ thông tin chủ nhà vẫn được kiểm bằng các giá trị còn lại.
  Căn cứ: Không ảnh hưởng người dùng và không lộ dữ liệu, sửa chỉ để bài kiểm gọn hơn.
  file: `packages/core/src/import/memory/mau.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 1 (đo nguồn thay vì đầu ra): ca kiểm nối của E8 grep văn bản man-nhap.tsx bằng regex**
  Người dùng thấy gì: Việc khoá thanh bước khi máy chủ đang chạy được kiểm bằng cách đọc mã, không chạy thật trên màn; đổi cách viết mã có thể làm bài kiểm đỏ oan.
  Căn cứ: Không có hậu quả trực tiếp cho người dùng, chỉ làm bài kiểm kém bền; ghi nhận hạn chế là đủ.
  file: `apps/web/src/lib/nhap/nho-mau.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
