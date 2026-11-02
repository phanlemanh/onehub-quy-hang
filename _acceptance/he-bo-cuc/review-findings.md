# Review findings: he-bo-cuc (round 2)

## Trong hợp đồng

Không có finding nào map được vào tiêu chí.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Dòng tin của trang mẫu sống (nguồn ảnh chuẩn) vẫn chạy dữ liệu demo của ReUI: tên người, ảnh chân dung người thật từ Unsplash, chữ giao diện tiếng Anh**
  Người dùng thấy gì: Ảnh chuẩn của bố cục Dòng tin, thứ các màn sau phải so theo, đang hiện tên và ảnh mặt người thật cùng chữ tiếng Anh. Người dùng không thấy điều này trong sản phẩm thật, nhưng ảnh chuẩn sẽ dẫn các màn mới sao chép nó.
  Căn cứ: Chỉ nằm ở trang mẫu và ảnh chuẩn nội bộ, không lộ ra khách hay chủ nhà, nhưng ảnh mặt người thật nằm trong kho là điều đã cấm, và sửa dữ liệu mẫu rồi chụp lại ảnh khá rẻ nên nên làm thành một việc riêng.
  file: `apps/web/src/components/khoi/solution-crm-5/data.tsx`
  severity: medium
  Đề xuất: new-contract

- **Cột thứ hai của Hôm nay gồm năm liên kết neo không trỏ tới phần tử nào trên trang**
  Người dùng thấy gì: Ở nhà Hôm nay, cột bên có năm mục nhưng bấm vào không cuộn hay lọc gì cả, cũng không mục nào được tô sáng. Người dùng sẽ tưởng cột bị hỏng.
  Căn cứ: Không mất hay lộ dữ liệu, chỉ là mục bấm không có tác dụng và người dùng tự bỏ qua được; phần nối đã nằm trong hàng việc riêng của màn Hôm nay nên ghi lại là hạn chế đã biết.
  file: `apps/web/src/components/shell/second-column.tsx`
  severity: medium
  Đề xuất: known-limits

- **BoCuc bỏ cotPhu mà không báo khi bố cục Danh sách – chi tiết không có chiTiet**
  Người dùng thấy gì: Nếu người dựng màn quên khai phần chi tiết thì cột phụ biến mất mà không có lời nhắc nào. Người dùng cuối chỉ thấy một màn thiếu phần bên phải.
  Căn cứ: Chỉ gặp khi một màn mới được dựng sai, không chạm dữ liệu người dùng, và lỗi hiện ngay khi người dựng mở thử màn nên sửa sau vẫn rẻ.
  file: `apps/web/src/components/bo-cuc/bo-cuc.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp, số assert không bằng số phần tử): ma trận vùng nói đếm 21 ô nhưng chỉ đo HTML 20 ô**
  Người dùng thấy gì: Bài kiểm tra bố cục báo đủ 21 ô nhưng thực ra bỏ sót một ô là cột phụ của Danh sách – chi tiết. Nếu ô đó hỏng, bài kiểm tra vẫn xanh và người dùng có thể gặp màn thiếu cột phụ.
  Căn cứ: Không ảnh hưởng người dùng ngay vì màn hiện đúng, chỉ làm lưới an toàn khi sửa sau yếu đi một ô; thêm phép đo cho ô này về sau rẻ.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): dấu data-vung="dau-man" do chính test gắn vào**
  Người dùng thấy gì: Bài kiểm tra vùng đầu màn tự gắn nhãn rồi tự đọc lại nên không chứng minh được bố cục có dựng đầu màn thật. Nếu bố cục làm mất đầu màn, bài kiểm tra vẫn có thể xanh.
  Căn cứ: Hiện người dùng không gặp lỗi gì, chỉ là một phép kiểm chưa đo đúng thứ nó hứa; nếu có hỏng thì lộ ngay khi mở màn và sửa rẻ.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (assert chuỗi có mặt trong khi lời hứa là quan hệ): «mỗi kiểu một hình riêng» chỉ so nhãn data-cho-tai, còn tính khác nhau đo trên hằng của test**
  Người dùng thấy gì: Bài kiểm tra chỉ xác nhận nhãn của từng hình chờ tải chứ không chứng minh mỗi bố cục thật sự có hình khác nhau. Nếu có hai kiểu dùng chung một khung, người dùng thấy màn chờ không hợp bố cục.
  Căn cứ: Hậu quả nếu xảy ra chỉ là hình chờ tải kém sát bố cục trong vài giây, không mất dữ liệu và tải lại là hết; sửa sau rẻ.
  file: `apps/web/src/components/bo-cuc/cho-tai.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (assertion âm tính một mình): «bố cục: không dựng Frame» không có đối chứng dương trong test**
  Người dùng thấy gì: Bài kiểm tra «bố cục không bọc khung» sẽ không bắt được lỗi nếu sau này khối khung đổi cách dựng. Hiện màn vẫn đúng nên người dùng chưa thấy gì.
  Căn cứ: Rủi ro chỉ xảy ra nếu có thay đổi lớn về sau và lúc đó cũng lộ ra bằng mắt ở ảnh chuẩn, nên chi phí thêm đối chứng lớn hơn hậu quả.
  file: `apps/web/src/components/bo-cuc/bo-cuc.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): bài quét «không nút tạo trùng» chỉ bắt hai dạng cú pháp href**
  Người dùng thấy gì: Màn Bảng hàng vẫn còn một nút «Nhập Excel» riêng ngoài menu Tạo, và bài kiểm tra không bắt được nó. Người dùng có thể thấy việc nhập ở hai chỗ.
  Căn cứ: Chỉ là nút thừa dẫn tới cùng một chỗ, không mất dữ liệu, và Bảng hàng sẽ được chuyển bố cục ở hàng việc riêng nên dọn lúc đó là hợp lý.
  file: `apps/web/src/components/shell/menu-tao.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
