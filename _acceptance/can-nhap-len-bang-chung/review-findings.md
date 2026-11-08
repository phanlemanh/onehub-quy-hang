# Review findings: can-nhap-len-bang-chung (round 1)

## Trong hợp đồng

- **Hình dạng 4 (assertion âm tính đứng một mình, không ghim thông điệp): lệnh công khai kèm importId chỉ được kiểm là ra 400**
  AC: AC-5
  file: `packages/api/test-db/imports/can-nhap-len-bang-chung.test.ts:546`
  severity: medium
  source: measurement
  detail: Comment ghi «khuôn lệnh từ chối khoá lạ» và E5 hứa rằng «lệnh cùng thân kèm khoá importId → 400». Test chỉ có `assert.equal(rg.status, 400, "khoá importId lạ")` và kiểm không có sự kiện mới, không đọc `error` hay `details`. Căn `gia` do `canThieu()` tạo ra vốn thiếu legalStatus. Nếu khuôn lệnh không strict mà lặng lẽ bỏ khoá lạ, lệnh vẫn ra 400 với lỗi missing-requirement, và assert xanh mà không chứng được điều đang tuyên bố (khuôn từ chối khoá lạ). Cần ghim mã lỗi invalid-payload hoặc đường dẫn khoá `importId`, để phân biệt bị chặn ở khuôn với bị chặn vì thiếu pháp lý.
  rationale: AC-5 đòi lệnh công khai kèm khoá mã lần nhập bị từ chối «vì khoá lạ»; bài thử chỉ thấy 400 nên không chứng minh được vế lý do này.

- **Hình dạng 3 (kiểm chuỗi có mặt trong khi lời hứa là quan hệ): khung hồ sơ E9 dò chữ ở cả trang thay vì dò mục còn thiếu**
  AC: AC-9
  file: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs:123`
  severity: medium
  source: measurement
  detail: E9 hứa: mức đủ của hồ sơ hiện pháp lý và tình trạng sử dụng LÀ MỤC CÒN THIẾU, và căn ở trạng thái Đang bán. Nhưng `ghiNhan("ho-so", { trangThai: s3.includes("Đang bán"), ..., thieuPhapLy: /Pháp lý/.test(s3), thieuTinhTrang: /Tình trạng sử dụng/.test(s3) })` chỉ dò chữ trên toàn bộ `document.body.innerText`. Nhãn trường «Pháp lý» và «Tình trạng sử dụng» có mặt trên hồ sơ dù mục đã điền hay chưa, còn «Đang bán» có thể đến từ danh sách chọn trạng thái hoặc chữ khác trên trang. Cả ba cờ sẽ đúng dù căn đã đủ pháp lý hoặc đang ở Chưa đủ để rao. Lời hứa là quan hệ giữa nhãn và vùng «còn thiếu» hoặc ô trạng thái, nên phải dò trong đúng phần tử mức đủ hoặc ô trạng thái.
  rationale: AC-9 đòi hồ sơ căn hiện mức đủ với hai mục còn thiếu và căn ở Đang bán; dò chữ cả trang không chứng minh được điều đó.

- **Hình dạng 4 (assertion âm tính đứng một mình): tongLoi của khung ket-qua-nhap không có đối chứng dương và không đo tông của hai dòng**
  AC: AC-9
  file: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs:106`
  severity: low
  source: measurement
  detail: E9 hứa: hai dòng không mang tông lỗi hay cảnh báo, và phải ghi biến thể badge hoặc lớp màu của dòng. Script chỉ tính `tongLoi: /destructive|error|text-destructive/.test(thongBao?.lop ?? "") || thongBao?.vai === "alert"`. Giá trị này lấy trên className của phần tử đầu tiên theo thứ tự tài liệu có `childElementCount < 6` và chứa chữ thông báo (dòng 99), không phải phần tử của hai dòng kết quả. Script cũng không ghi biến thể badge hay lớp của dòng nào. Kết quả false không có đối chứng dương cho thấy bộ dò bắt được tông lỗi khi nó có mặt. Khi className rỗng hoặc chọn nhầm phần tử, cờ vẫn ra false, tức là xanh.
  rationale: AC-9 đòi dòng nhập «không mang tông lỗi»; phép đo lấy nhầm phần tử và không có đối chứng nên không chứng minh được vế này.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Dòng file ghi «Đang giao dịch» bị báo «lên Đang bán — còn thiếu …» dù căn kết thúc ở Đang giao dịch**
  Người dùng thấy gì: Với dòng file ghi «Đang giao dịch», kết quả lần nhập có thể ghi câu «lên Đang bán — còn thiếu …» trong khi căn thật ra nằm ở Đang giao dịch. Người xem thấy hai thông tin lệch nhau nhưng căn và trạng thái vẫn đúng.
  Căn cứ: Chỉ là lời giải thích lệch ở một loại dòng hiếm, dữ liệu căn không sai và không mất gì, nên ghi lại là đủ.
  file: `packages/api/src/imports/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): cửa «sửa hàng loạt» ở E5 là thân lệnh gõ tay, không dựng từ trình sửa ô**
  Người dùng thấy gì: Phép thử cho cửa sửa hàng loạt dùng lệnh viết tay chứ không đi qua trình sửa thật trên màn. Nếu trình sửa thật gửi lệnh khác đi, bài thử vẫn xanh trong khi người dùng có thể gặp lỗi.
  Căn cứ: Chỉ làm bài thử kém chặt chứ không làm sản phẩm sai; sản phẩm vẫn từ chối đúng và có thể bổ sung phép thử sau.
  file: `packages/api/test-db/imports/can-nhap-len-bang-chung.test.ts`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 4/5 lỗi rơi vào file không bộ đo nào phủ (packages/api/test-db/imports/can-nhap-len-bang-chung.test.ts, _acceptance/can-nhap-len-bang-chung/thu/chup.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
