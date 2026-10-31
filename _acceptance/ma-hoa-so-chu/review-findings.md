# Review findings: ma-hoa-so-chu (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Owner-role maintenance code sits inside the API's src folder, outside the single query door**
  Người dùng thấy gì: Phần mã chạy lệnh mã hoá lại bằng quyền cao nằm lẫn trong mã của máy chủ API. Hiện chưa có đường nào gọi nó từ ngoài, nhưng về sau một đường API vô tình nhập nó vào thì sẽ không có rào nào báo.
  Căn cứ: Chưa gây mất hay lộ dữ liệu hôm nay và sửa sau chỉ là dời tệp, nên ghi lại để làm khi có dịp là đủ.
  file: `packages/api/src/owners/ma-hoa-lai.ts`
  severity: medium
  Đề xuất: known-limits

- **Migration 008 points to the wrong path for the re-encrypt command**
  Người dùng thấy gì: Một dòng chú thích trong tệp thay đổi cơ sở dữ liệu chỉ sai đường dẫn tới lệnh mã hoá lại. Người vận hành có thể đi nhầm chỗ khi đọc, nhưng hướng dẫn chính thức vẫn ghi đúng.
  Căn cứ: Chỉ là chữ chú thích, không ảnh hưởng dữ liệu hay hành vi, và tệp này không được phép sửa lại nên chấp nhận và ghi vết.
  file: `packages/db/migrations/008_ma_hoa_so_chu.sql`
  severity: low
  Đề xuất: wont-fix

- **The re-encrypt command has no npm script, unlike the repo's other van-hanh commands**
  Người dùng thấy gì: Lệnh mã hoá lại không có lối tắt gọn như các lệnh vận hành khác, và cách gõ lệnh ghi ở hai nơi hơi khác nhau. Người vận hành có thể gõ thiếu bước đọc cấu hình và gặp báo lỗi thiếu khoá.
  Căn cứ: Nếu gõ sai thì lệnh báo lỗi và dừng chứ không làm hỏng dữ liệu, người vận hành thử lại được, và sửa chỉ là thêm một dòng cấu hình.
  file: `packages/api/van-hanh/ma-hoa-lai.ts`
  severity: low
  Đề xuất: known-limits

- **Tham chiếu says the database rejects plain-text phone numbers in every table, but only listing_owners does**
  Người dùng thấy gì: Tài liệu sản phẩm nói cơ sở dữ liệu tự từ chối số rõ ở mọi bảng, nhưng thực tế chỉ bảng chủ nhà tự từ chối, còn bảng khác do bài kiểm tra bắt khi phát hành. Người đọc có thể tin vào sự bảo vệ mạnh hơn thực tế.
  Căn cứ: Chỉ là lời mô tả chưa chính xác, không làm lộ số, và sửa lại là đổi một câu chữ bất cứ lúc nào.
  file: `docs/product/tham-chieu.md`
  severity: low
  Đề xuất: known-limits

- **Lệnh mã hoá lại nhận mọi khoá đúng dạng và xoá số rõ trong cùng giao dịch, không kiểm khoá có khớp với khoá của API thật hay không**
  Người dùng thấy gì: Nếu người vận hành dán nhầm một khoá hợp lệ nhưng khác khoá của máy chủ thật, lệnh vẫn báo thành công và xoá số rõ. Sau đó hệ thống không mở được số chủ nào nữa và không có cách lấy lại.
  Căn cứ: Hậu quả nặng và không đảo ngược được (mất toàn bộ số chủ), nhưng chỉ xảy ra khi nhập nhầm khoá, và thêm bước kiểm trước khi xoá là việc nhỏ nên đáng làm thành việc riêng.
  file: `packages/api/src/owners/ma-hoa-lai.ts`
  severity: low
  Đề xuất: new-contract

- **Lưới quét cột số dạng chữ coi cột là 'đã chặn' khi chỉ cần chuỗi '(col IS NULL)' xuất hiện ở bất kỳ đâu trong một ràng buộc check**
  Người dùng thấy gì: Bài kiểm tra tự động có thể bỏ sót một bảng mới lưu số điện thoại rõ nếu người viết bảng đó gắn một ràng buộc trông giống nhưng vẫn cho phép số rõ. Khi đó bài kiểm tra vẫn báo xanh.
  Căn cứ: Chỉ lọt khi có người viết ràng buộc đặc biệt ở bảng tương lai, chưa có bảng nào như vậy, và siết lại phép so là sửa nhỏ làm sau cũng được.
  file: `packages/db/migrations/008_ma_hoa_so_chu.sql`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đứng một mình): kiểm «khoá con tách khỏi khoá mã hoá» chỉ so khác với đúng một cách dựng**
  Người dùng thấy gì: Bài kiểm tra chứng minh khoá dùng để so trùng số tách khỏi khoá mã hoá chỉ bắt được một kiểu làm sai. Nếu sau này ai đó dùng chung khoá theo cách ghép khác, bài kiểm tra vẫn xanh.
  Căn cứ: Mã hiện tại đúng, không có dữ liệu nào bị ảnh hưởng, và chỉ là lưới an toàn cho thay đổi tương lai nên có thể bổ sung sau.
  file: `packages/api/src/owners/ma-hoa.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (âm tính đứng một mình): ca «lệnh dòng lệnh chạy hai lần» quét lộ số trên lần chạy không xử lý dòng nào**
  Người dùng thấy gì: Bài kiểm tra việc lệnh mã hoá lại không in số điện thoại ra màn hình chạy trên dữ liệu rỗng nên không thể bắt được lỗi in số. Việc lệnh không in số vì vậy chưa được chứng minh qua lệnh thật.
  Căn cứ: Chưa có dấu hiệu lệnh in số và phần lõi đã được kiểm riêng, nên rủi ro thấp; bổ sung dữ liệu cho ca này là việc rẻ làm sau.
  file: `packages/api/test-db/ma-hoa-so-chu.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
