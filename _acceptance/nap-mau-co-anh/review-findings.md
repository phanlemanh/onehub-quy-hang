# Review findings: nap-mau-co-anh (round 2)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Cleanup after a load error falsely reports every photo as left behind when the photo store is Postgres and the error came from SQL**
  Người dùng thấy gì: Khi lần nạp mẫu hỏng ở kho ảnh Postgres, dòng báo cuối có thể nói là tất cả ảnh còn sót lại dù thực tế đã được dọn sạch. Dữ liệu vẫn đúng, chỉ lời báo gây hiểu nhầm cho người đọc nhật ký.
  Căn cứ: Chỉ sai chữ trong lời báo lỗi, không mất hay lộ dữ liệu, ảnh vẫn được dọn đúng; người vận hành chạy lại là xong, và đường này chỉ gặp ở máy dev hoặc CI chứ không phải bản thật dùng kho Storage.
  file: `packages/db/seed/nap-ban-that.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5: tuyên quét LỚP «cả ba khoá kho ảnh» nhưng chỉ có một điểm-case**
  Người dùng thấy gì: Bài kiểm chỉ thử việc chặn in bí mật với một trong ba khoá kho ảnh. Hiện cả ba vẫn được che, nhưng nếu sau này luật bị thu hẹp thì hai khoá còn lại có thể lộ ra mà bài kiểm vẫn báo xanh.
  Căn cứ: Hiện chưa có khoá nào bị lộ, rủi ro chỉ xuất hiện nếu ai đó sửa luật sau này; bổ sung bài kiểm sau rẻ và không ảnh hưởng người dùng hôm nay.
  file: `packages/db/seed/nap-mau-yml.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 3: lời hứa là QUAN HỆ «số ảnh sót / tổng số ảnh», nhưng chỉ đo ở điểm hai số bằng nhau**
  Người dùng thấy gì: Bài kiểm chỉ thử trường hợp mọi lệnh xoá ảnh đều hỏng, nên nếu lời báo số ảnh sót bị in sai khi chỉ hỏng một phần thì bài kiểm không phát hiện. Người dùng chỉ thấy một con số sai trong nhật ký lỗi.
  Căn cứ: Ảnh hưởng chỉ là con số trong lời báo lỗi, không đụng đến dữ liệu và không ai phải làm gì thêm; công thêm ca kiểm không đáng so với hậu quả.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Luật tĩnh chặn in bí mật của workflow chưa phủ ba secret kho ảnh mới (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu sau này ai đó thêm dòng in khoá kho ảnh vào nút Nạp dữ liệu mẫu, bài kiểm tự động sẽ không báo. Hiện chưa có dòng in nào như vậy, và GitHub vẫn tự che bí mật trong log.
  Căn cứ: Hậu quả nhẹ vì hiện không có dòng in nào và GitHub đã che bí mật trong log, chỉ mất một lớp chặn dự phòng; thêm tên vào luật sau này rất rẻ.
  file: `packages/db/seed/nap-mau-yml.test.mjs`
  severity: low
  Đề xuất: known-limits

- **Byte ảnh mồ côi trên kho Storage khi lần nạp hỏng ở bước commit (sau khi napBanThat đã trả về) (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu mạng đứt đúng lúc chốt lần nạp, các ảnh đã tải lên kho vẫn nằm lại mà không còn dòng nào trỏ tới và lần gỡ sau không xoá được. Người dùng không thấy gì sai, chỉ tốn một ít dung lượng kho.
  Căn cứ: Hiếm xảy ra (chỉ khi lỗi đúng khoảnh khắc chốt), chỉ để lại ảnh mẫu vẽ bằng mã mà không có dữ liệu thật, người dùng không bị ảnh hưởng nhìn thấy; chỉ tốn dung lượng.
  file: `packages/db/seed/nap-ban-that.ts`
  severity: low
  Đề xuất: known-limits

- **Lỗi xoá byte khi dọn sau lần nạp hỏng bị nuốt hẳn, không ghi log (r1 · tệp đã đổi)**
  Người dùng thấy gì: Khi dọn ảnh sau lần nạp hỏng mà kho cũng từ chối xoá, người bấm chỉ thấy lỗi gốc và không biết còn ảnh bỏ sót trên kho.
  Căn cứ: Chỉ xảy ra khi đã có một lỗi trước đó và kho cũng lỗi xoá, hậu quả là vài ảnh mẫu thừa trên kho chứ không mất hay lộ dữ liệu thật.
  file: `packages/db/seed/nap-ban-that.ts`
  severity: low
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình: ô «bản thật · đủ ba» của ca chon-kho không có đối chứng dương, không ghim thông điệp (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bài kiểm cho trường hợp đủ ba khoá trên bản thật chưa chứng minh được là bộ nạp thật sự đi vào kho Storage. Nếu phần chọn kho hỏng theo cách khác, bài kiểm vẫn xanh.
  Căn cứ: Đây chỉ là chỗ bài kiểm lỏng, không phải lỗi thấy được của người dùng; việc ghi vào Storage đã được kiểm riêng bằng kho giả, và phần chọn kho còn được soi lại khi chạy nút thật.
  file: `packages/db/seed/nap-ban-that.test.ts`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
