# Review findings: bang-hang-danh-sach-chi-tiet (round 3)

## Trong hợp đồng

Không có.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **dung-d.mjs --ban-goc đọc PID_GOC vô điều kiện, hỏng khi máy dev nhánh chính 3478 đã chạy sẵn mà không do lệnh này dựng**
  Người dùng thấy gì: Công cụ dựng máy thử đối chứng có thể báo hỏng khi máy thử đã được dựng tay từ trước. Người dùng cuối không thấy gì; chỉ người chạy nghiệm thu phải dựng lại.
  Căn cứ: Chỉ ảnh hưởng người chạy nghiệm thu, không ảnh hưởng người dùng, và chạy lại hay dọn tệp là qua được; sửa không đáng công.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/dung-d.mjs`
  severity: low
  Đề xuất: wont-fix

- **Lệnh đo E4 và E6 trong evals.yaml thiếu --ban-goc, nên chạy lại đúng như ghi thì không bao giờ có đối chứng nhánh chính mà câu đo đòi**
  Người dùng thấy gì: Người chấm chạy lại đúng lệnh ghi trong hồ sơ sẽ không có phần so với nhánh chính, nên phép kiểm đối chứng có thể bị bỏ qua mà không ai hay. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Không chạm người dùng và không mất dữ liệu; chỉ làm phép kiểm lại yếu đi, nên ghi lại là đủ và sửa sau rẻ.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **loiTrinhDuyet đếm dồn từ đầu ca, nên dòng e4 ở khổ 1280 gộp cả lỗi của khổ 1440**
  Người dùng thấy gì: Trong biên bản đo, khổ màn nhỏ hơn bị ghi nhiều lỗi hơn thực tế, dễ gây hiểu nhầm khi đọc. Người dùng cuối không thấy khác biệt.
  Căn cứ: Chỉ làm số liệu trong biên bản đọc lệch, không ảnh hưởng người dùng; lỗi thật đã được ghi ở khổ kia nên không mất thông tin.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (khẳng định âm có ca dương nhưng ca dương không đi qua đường hỏng thật): E4 «trangKhongCuon» có thể xanh nhờ nội dung bị cắt, không phải nhờ vừa khung**
  Người dùng thấy gì: Phép kiểm trang không cuộn có thể báo đạt dù đáy bảng hay cột hồ sơ bị cắt mất một phần ở một số khổ màn. Nếu có thì người dùng sẽ không thấy hết phần dưới của bảng hoặc hồ sơ.
  Căn cứ: Chưa có bằng chứng bố cục thật bị cắt, chỉ là phép kiểm chưa đủ nhạy; tai lai trang hay đổi cỡ cửa sổ là xem được, và bổ sung ca kiểm sau không đắt.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (đo cái đang chạy ở cổng cố định thay vì cây được khai): đối chứng nhánh chính dùng lại bất kỳ máy nào ở cổng 3478 nhưng in commit của thư mục --ban-goc**
  Người dùng thấy gì: Phép so bề rộng với nhánh chính có thể vô tình so với một máy thử cũ, nên báo đạt dù không đối chiếu đúng bản gốc. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm bằng chứng đối chứng kém tin cậy trong trường hợp hiếm khi máy thử cũ còn chạy; không động tới người dùng hay dữ liệu, ghi chú là đủ.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/dung-d.mjs`
  severity: low
  Đề xuất: known-limits

- **Hồ sơ bằng chứng E3 bỏ qua 21–22 lỗi thật trên trình duyệt: cùng lúc ghi đếm được lỗi và kết luận log sạch (r2 · tệp đã đổi)**
  Người dùng thấy gì: Khi vừa mở trang Bảng hàng, trình duyệt báo lỗi ngầm và dựng lại bảng một lần ở máy người dùng; người dùng có thể thấy khung chờ nháy nhẹ. Hồ sơ nghiệm thu thì ghi nhầm là không có lỗi.
  Căn cứ: Hậu quả nhẹ: không mất dữ liệu, bảng vẫn hiện đủ sau khi dựng lại và tải lại trang là xong; lỗi có từ trước nên nên ghi vào hạn chế đã biết rồi xử lý riêng.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/evidence/E3-network.txt`
  severity: medium
  Đề xuất: known-limits

- **Mã cột «dau-chu» là tiếng Việt, trái luật đặt tên tiếng Anh theo RESO, trong khi lõi đã có holderName cho đúng cột này (r1)**
  Người dùng thấy gì: Người dùng không thấy gì khác: cột Đầu chủ vẫn hiện và hoạt động bình thường. Chỉ là cách đặt tên bên trong lệch quy ước của kho.
  Căn cứ: Không ảnh hưởng người dùng và không mất dữ liệu; đổi tên về sau tốn công chuyển các góc nhìn đã lưu, nên ghi lại làm hạn chế đã biết thì rẻ hơn sửa ngay.
  file: `apps/web/src/app/(app)/inventory/cot.ts`
  severity: medium
  Đề xuất: known-limits

- **Danh bạ đầu chủ bị đọc hai lần khi bảng có căn mà người giữ đã rời sàn (r1)**
  Người dùng thấy gì: Khi mở Bảng hàng có căn của người đã rời sàn, máy hỏi danh sách tên thành viên thêm một lần thừa. Người dùng gần như không nhận ra.
  Căn cứ: Chỉ tốn thêm một lần tải nhỏ, kết quả hiển thị vẫn đúng và không lặp vô hạn; chi phí sửa lớn hơn hậu quả.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: low
  Đề xuất: wont-fix

- **Cột «Đầu chủ» ghi sai «Đã rời sàn» cho người mới vào sàn khi danh bạ lưu trên máy đã cũ (r1)**
  Người dùng thấy gì: Căn vừa giao cho một người mới vào sàn có thể hiện nhầm «Đã rời sàn» trong lúc máy còn dùng danh sách tên cũ. Người dùng dễ hiểu lầm người đó đã nghỉ.
  Căn cứ: Hiện sai thông tin về người nhưng không mất dữ liệu và chỉ xảy ra với người mới vào sàn; tải lại khi có mạng thường tự hết, và sửa cần đặt luật hiển thị riêng nên đáng đăng việc riêng.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: medium
  Đề xuất: new-contract

- **Đọc danh bạ hỏng thì lỗi bị nuốt và không bao giờ thử lại trong phiên (r1)**
  Người dùng thấy gì: Nếu lúc mở bảng bị mất mạng hay máy chủ lỗi, cột Đầu chủ cứ hiện «…» hoặc tên cũ mà không có báo lỗi hay nút thử lại. Người dùng phải tải lại cả trang mới có tên.
  Căn cứ: Không mất dữ liệu và tải lại trang là tự gỡ được, nhưng người dùng không biết cần làm vậy; nên làm thành việc riêng có thiết kế báo lỗi và nút thử lại.
  file: `apps/web/src/app/(app)/inventory/danh-ba.ts`
  severity: medium
  Đề xuất: new-contract

- **Sắp theo cột «Đầu chủ»: căn chưa gán («—») không xuống cuối mà lẫn vào giữa các tên (r1)**
  Người dùng thấy gì: Khi sắp theo Đầu chủ, các căn chưa gán nằm ở đầu hoặc cuối danh sách thay vì luôn xuống cuối như các cột khác. Hơi khó đọc nhưng không sai dữ liệu.
  Căn cứ: Chỉ là thứ tự xếp, không mất hay sai dữ liệu và người dùng đổi chiều sắp là thấy được; ghi lại để sửa khi làm đợt chỉnh bảng.
  file: `apps/web/src/app/(app)/inventory/loc.ts`
  severity: low
  Đề xuất: known-limits

- **Lọc «Đầu chủ» theo tên hiển thị nên hai người trùng tên bị gộp làm một (r1)**
  Người dùng thấy gì: Hai thành viên trùng tên sẽ nằm chung một lựa chọn lọc, nên lọc ra căn của cả hai. Góc nhìn đã lưu theo tên cũng có thể ra rỗng nếu người ấy đổi tên.
  Căn cứ: Chỉ xảy ra khi trùng hoặc đổi tên, không mất dữ liệu và người dùng tự bỏ lọc được; sàn nhỏ ít gặp nên ghi hạn chế đã biết.
  file: `apps/web/src/app/(app)/inventory/cot.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1, đo chỉ dẫn thay vì đầu ra: giới hạn kéo 28–50% và mức tối thiểu 35% của thân chỉ được đọc từ thuộc tính data-* gắn kèm, thư viện không dùng các thuộc tính này (r1)**
  Người dùng thấy gì: Một bài kiểm tự động chỉ đọc nhãn chứ không thử thật giới hạn kéo của cột hồ sơ, nên về sau ai sửa giới hạn có thể không bị bắt. Người dùng hiện nay không thấy lỗi.
  Căn cứ: Giao diện hiện đúng và đã có phép đo thật bù lại, nên rủi ro chỉ nằm ở lần sửa sau; ghi lại để củng cố bài kiểm khi chạm đến bố cục này.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4, khẳng định phủ định mà không có đối chứng: kịch bản E4 tuyên có ca đối chứng «--ban-goc» trên nhánh chính nhưng ca ấy không đo gì (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép đo «trang không cuộn» chưa từng được thử trên một trang thật sự cuộn để chứng tỏ nó biết báo đỏ. Màn hình người dùng thấy vẫn đúng.
  Căn cứ: Không ảnh hưởng người dùng, chỉ làm độ tin cậy của bằng chứng thấp hơn lời hứa; bổ sung đối chứng tốn công trên nhánh chính nên ghi lại là đủ.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3, chỉ ghi giá trị trong khi lời hứa là quan hệ: E6 hứa «bằng bề rộng đo trên nhánh chính» nhưng không đo nhánh chính (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có số đo của bản cũ để đối chiếu bề rộng khung hồ sơ trên điện thoại, nên khẳng định «giống như trước» chưa được chứng minh bằng số. Người dùng không thấy lỗi.
  Căn cứ: Thuần là thiếu bằng chứng đối chiếu, không có hỏng hóc nào được thấy; ghi lại, sửa khi có dịp đo lại trên bản chính.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1, đo nhãn đếm thay vì dòng thực vẽ: «soDongBang» của E10 đọc chữ «n / N căn» trên thanh công cụ, không đếm dòng bảng (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm xác nhận «bảng vẫn đủ dòng» bằng chữ đếm trên thanh công cụ thay vì đếm dòng hiển thị thật. Người dùng hiện không bị ảnh hưởng.
  Căn cứ: Không có hỏng hóc nào được thấy, chỉ là bằng chứng gián tiếp; củng cố phép đo rẻ nhưng có thể làm khi chạm lại bài kiểm này.
  file: `_acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs`
  severity: low
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 5/5 lỗi rơi vào file không bộ đo nào phủ (_acceptance/bang-hang-danh-sach-chi-tiet/thu/dung-d.mjs, _acceptance/bang-hang-danh-sach-chi-tiet/evals.yaml, _acceptance/bang-hang-danh-sach-chi-tiet/thu/chay-ui.mjs) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
