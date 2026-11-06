## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **In --doi, a rollback that failed or was never confirmed still exits 1, and the header defines exit 1 there as 'rolled back'**
  Người dùng thấy gì: Khi đổi bản thật mà việc lùi không thành công hoặc chưa xác nhận được, công cụ vẫn báo kết quả giống như đã lùi xong. Người vận hành phải đọc dòng chữ in ra để biết bản thật còn ở chế độ mới hay không.
  Căn cứ: Chỉ gây hiểu nhầm cho người đọc tín hiệu tự động, dòng chữ in ra vẫn nói rõ tình trạng, không mất dữ liệu, và việc đổi bản thật là một lần do chủ kho có mặt theo dõi.
  file: `_acceptance/pooler-che-do-giao-dich/thu/doi-ban-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **If a log read fails once while --doi is watching, the script exits 2 and leaves production on 6543 with no monitoring and no rollback**
  Người dùng thấy gì: Nếu việc đọc nhật ký bản thật hỏng một lần giữa lúc theo dõi, công cụ dừng lại và để bản thật ở chế độ mới mà không ai theo dõi và không tự lùi. Người vận hành sẽ thấy báo thiếu điều kiện chứ không phải báo đã đổi nhưng chưa được giám sát.
  Căn cứ: Hiếm xảy ra và chỉ trong lần đổi một lần có người trực; bản thật vẫn chạy bình thường và người vận hành tự lùi hay chạy lại được, nên sửa sau không gấp.
  file: `_acceptance/pooler-che-do-giao-dich/thu/doi-ban-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **Assertion âm-tính-một-mình, không ghim thông điệp: ở --doi, mã thoát 1 không phân biệt đã lùi xác nhận với lùi chưa xác nhận**
  Người dùng thấy gì: Khi đổi bản thật, công cụ dùng cùng một kết quả cho cả trường hợp đã lùi xong lẫn trường hợp chưa chắc đã lùi. Người chấm không tách được hai trường hợp nếu chỉ nhìn kết quả tự động.
  Căn cứ: Là chỗ thiếu rõ ràng ở tín hiệu báo cáo chứ không làm hỏng việc lùi thật, không mất dữ liệu, và người vận hành đọc được dòng chữ in ra để xác nhận.
  file: `_acceptance/pooler-che-do-giao-dich/thu/doi-ban-that.mjs`
  severity: medium
  Đề xuất: known-limits

- **The getApi port-switch test leaves the module-level `cached` filled and replaces the process.env object (r1)**
  Người dùng thấy gì: Bài kiểm có thể để lại trạng thái giả khiến bài kiểm thêm sau này chạy sai, nhưng người dùng sản phẩm không bị ảnh hưởng.
  Căn cứ: Chỉ ảnh hưởng người viết bài kiểm sau này, không mất dữ liệu, sửa lúc nào cũng rẻ khi có bài kiểm thứ hai gọi cùng hàm.
  file: `apps/web/src/lib/api.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính một mình): bài kiểm chỉ soi một dòng khai báo, nên tham số khởi động ở dòng khác vẫn lọt qua (r1)**
  Người dùng thấy gì: Nếu sau này ai viết lại cách dựng kết nối theo kiểu nhiều dòng, bài kiểm có thể không phát hiện việc quay lại cách cũ, và khi đó đăng nhập có thể hỏng trên bản dùng chế độ giao dịch.
  Căn cứ: Hiện không ảnh hưởng người dùng, chỉ là lưới an toàn có kẽ hở cho thay đổi tương lai, và có thể vá rẻ khi đụng tới tệp đó.
  file: `_acceptance/pooler-che-do-giao-dich/thu/cach-ly.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): sàn B, người, phiên và cookie ký đều dựng tay, không đi qua bên ghi (r1)**
  Người dùng thấy gì: Phép thử cách ly giữa hai sàn dùng dữ liệu dựng tay, nên chưa chứng minh trọn vẹn với sàn do công cụ mở sàn thật tạo ra.
  Căn cứ: Cách ly theo dòng vẫn được bộ kiểm khác bảo đảm, rủi ro thấp, và có thể đổi sang công cụ thật ở lần chạm sau.
  file: `_acceptance/pooler-che-do-giao-dich/thu/pooler-giao-dich.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ có điểm-case): ma trận mồi chiều đỏ bỏ sót các dạng viết mà chính đặc tả nêu tên (r1)**
  Người dùng thấy gì: Một số cách viết khác của cùng loại lệnh giữ trạng thái phiên chưa có bài kiểm riêng, nên nếu bộ quét bị sửa hỏng thì có thể không ai hay.
  Căn cứ: Hiện các dạng này vẫn bị bắt, nên người dùng không chịu hậu quả; chỉ là lưới kiểm chưa dày, bổ sung sau rất rẻ.
  file: `_acceptance/pooler-che-do-giao-dich/thu/quet-trang-thai-phien.test.mjs`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
