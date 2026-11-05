# Review findings: bang-hang-danh-sach-chi-tiet (round 1)

## Trong hợp đồng

- **Sổ quyết định ở Tham chiếu dẫn sai điều khoá: ghi K23, thực tế là K26**
  AC: AC-8
  file: `docs/product/tham-chieu.md:397`
  severity: low
  source: conventions
  detail: Dòng 05/11 của §12 «Sổ quyết định» ghi nguồn là «Sổ điểm biến thiên K23». Nhưng trong docs/architecture/so-diem-bien-thien.md, K23 là «Độ dài mật khẩu 8–128 ký tự» của hồ sơ dang-nhap-mat-khau. Điều khoá «kiểu mở chi tiết cố định theo bố cục» mà diff này thêm vào là K26, và commit gộp 612ec09e đã đánh số lại thành K26. Tham chiếu là nguồn sự thật của sản phẩm, nên dẫn sai sẽ trỏ người đọc tới quyết định về mật khẩu. Sửa thành K26.
  lý do vào hợp đồng: AC-8 đòi tài liệu hết lệch và có dòng 05/11 ở Tham chiếu §12 gắn với điều khoá của kiểu mở chi tiết; dòng ấy trỏ nhầm sang điều khoá về mật khẩu nên tài liệu vẫn lệch.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mã cột «dau-chu» là tiếng Việt, trái luật đặt tên tiếng Anh theo RESO, trong khi lõi đã có holderName cho đúng cột này**
  Người dùng thấy gì: Người dùng không thấy gì khác: cột Đầu chủ vẫn hiện và hoạt động bình thường. Chỉ là cách đặt tên bên trong lệch quy ước của kho.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; đổi tên về sau tốn công chuyển các góc nhìn đã lưu, nên ghi lại làm hạn chế đã biết thì rẻ hơn sửa ngay.
  file: `apps/web/src/app/(app)/inventory/cot.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh bạ đầu chủ bị đọc hai lần khi bảng có căn mà người giữ đã rời sàn**
  Người dùng thấy gì: Khi mở Bảng hàng có căn của người đã rời sàn, máy hỏi danh sách tên thành viên thêm một lần thừa. Người dùng gần như không nhận ra.
  Căn cứ: Chỉ tốn thêm một lần tải nhỏ, kết quả hiển thị vẫn đúng và không lặp vô hạn; chi phí sửa lớn hơn hậu quả.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: low
  Đề xuất: wont-fix

- **Cột «Đầu chủ» ghi sai «Đã rời sàn» cho người mới vào sàn khi danh bạ lưu trên máy đã cũ**
  Người dùng thấy gì: Căn vừa giao cho một người mới vào sàn có thể hiện nhầm «Đã rời sàn» trong lúc máy còn dùng danh sách tên cũ. Người dùng dễ hiểu lầm người đó đã nghỉ.
  Căn cứ: Hiện sai thông tin về người nhưng không mất dữ liệu và chỉ xảy ra với người mới vào sàn; tải lại khi có mạng thường tự hết, và sửa cần đặt luật hiển thị riêng nên đáng đăng việc riêng.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: medium
  Đề xuất: new-contract

- **Đọc danh bạ hỏng thì lỗi bị nuốt và không bao giờ thử lại trong phiên**
  Người dùng thấy gì: Nếu lúc mở bảng bị mất mạng hay máy chủ lỗi, cột Đầu chủ cứ hiện «…» hoặc tên cũ mà không có báo lỗi hay nút thử lại. Người dùng phải tải lại cả trang mới có tên.
  Căn cứ: Không mất dữ liệu và tải lại trang là tự gỡ được, nhưng người dùng không biết cần làm vậy; nên làm thành việc riêng có thiết kế báo lỗi và nút thử lại.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: medium
  Đề xuất: new-contract

- **Sắp theo cột «Đầu chủ»: căn chưa gán («—») không xuống cuối mà lẫn vào giữa các tên**
  Người dùng thấy gì: Khi sắp theo Đầu chủ, các căn chưa gán nằm ở đầu hoặc cuối danh sách thay vì luôn xuống cuối như các cột khác. Hơi khó đọc nhưng không sai dữ liệu.
  Căn cứ: Chỉ là thứ tự xếp, không mất hay sai dữ liệu và người dùng đổi chiều sắp là thấy được; ghi lại để sửa khi làm đợt chỉnh bảng.
  file: `apps/web/src/app/(app)/inventory/loc.ts`
  severity: low
  Đề xuất: known-limits

- **Lọc «Đầu chủ» theo tên hiển thị nên hai người trùng tên bị gộp làm một**
  Người dùng thấy gì: Hai thành viên trùng tên sẽ nằm chung một lựa chọn lọc, nên lọc ra căn của cả hai. Góc nhìn đã lưu theo tên cũng có thể ra rỗng nếu người ấy đổi tên.
  Căn cứ: Chỉ xảy ra khi trùng hoặc đổi tên, không mất dữ liệu và người dùng tự bỏ lọc được; sàn nhỏ ít gặp nên ghi hạn chế đã biết.
  file: `apps/web/src/app/(app)/inventory/cot.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1, đo chỉ dẫn thay vì đầu ra: giới hạn kéo 28–50% và mức tối thiểu 35% của thân chỉ được đọc từ thuộc tính data-* gắn kèm, thư viện không dùng các thuộc tính này**
  Người dùng thấy gì: Một bài kiểm tự động chỉ đọc nhãn chứ không thử thật giới hạn kéo của cột hồ sơ, nên về sau ai sửa giới hạn có thể không bị bắt. Người dùng hiện nay không thấy lỗi.
  Căn cứ: Giao diện hiện đúng và đã có phép đo thật bù lại, nên rủi ro chỉ nằm ở lần sửa sau; ghi lại để củng cố bài kiểm khi chạm đến bố cục này.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4, khẳng định phủ định mà không có đối chứng: kịch bản E4 tuyên có ca đối chứng «--ban-goc» trên nhánh chính nhưng ca ấy không đo gì**
  Người dùng thấy gì: Phép đo «trang không cuộn» chưa từng được thử trên một trang thật sự cuộn để chứng tỏ nó biết báo đỏ. Màn hình người dùng thấy vẫn đúng.
  Căn cứ: Không ảnh hưởng người dùng, chỉ làm độ tin cậy của bằng chứng thấp hơn lời hứa; bổ sung đối chứng tốn công trên nhánh chính nên ghi lại là đủ.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3, chỉ ghi giá trị trong khi lời hứa là quan hệ: E6 hứa «bằng bề rộng đo trên nhánh chính» nhưng không đo nhánh chính**
  Người dùng thấy gì: Chưa có số đo của bản cũ để đối chiếu bề rộng khung hồ sơ trên điện thoại, nên khẳng định «giống như trước» chưa được chứng minh bằng số. Người dùng không thấy lỗi.
  Căn cứ: Thuần là thiếu bằng chứng đối chiếu, không có hỏng hóc nào được thấy; ghi lại, sửa khi có dịp đo lại trên bản chính.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1, đo nhãn đếm thay vì dòng thực vẽ: «soDongBang» của E10 đọc chữ «n / N căn» trên thanh công cụ, không đếm dòng bảng**
  Người dùng thấy gì: Bài kiểm xác nhận «bảng vẫn đủ dòng» bằng chữ đếm trên thanh công cụ thay vì đếm dòng hiển thị thật. Người dùng hiện không bị ảnh hưởng.
  Căn cứ: Không có hỏng hóc nào được thấy, chỉ là bằng chứng gián tiếp; củng cố phép đo rẻ nhưng có thể làm khi chạm lại bài kiểm này.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 3/11 lỗi rơi vào file không bộ đo nào phủ (_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
