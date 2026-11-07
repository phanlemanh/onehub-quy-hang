# Review findings: va-bang-hang-e11-hieu-nang (round 1)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lệnh dựng E3 (dung-e3.sh) không dựng được chỗ thử như bước của bài nhìn mô tả**
  Người dùng thấy gì: Người chấm bằng mắt có thể không vào được bảng hàng 5.000 căn theo đúng các bước ghi sẵn, hoặc vô tình xem nhầm bản chạy thử cũ. Sản phẩm của người dùng không bị đổi.
  Căn cứ: Chỉ ảnh hưởng người kiểm tay, không ảnh hưởng người dùng thật; chạy lại tay các bước dựng là xong, không mất dữ liệu.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/dung-e3.sh`
  severity: high
  Đề xuất: known-limits

- **kiem-e11.sh để lại máy chủ dev 3585 chạy tách rời, không tắt**
  Người dùng thấy gì: Sau khi đo xong, một máy chủ thử vẫn chạy ngầm trên máy người kiểm, chiếm cổng và tốn CPU cho đến khi tắt tay. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Hậu quả nhẹ và chỉ trên máy kiểm; tắt tiến trình tay là hết, sửa sau rẻ.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh`
  severity: medium
  Đề xuất: known-limits

- **dung-e3.sh: «--build --nhan 5000» không nạp 5.000 căn, không build cây hiện tại, và bản build không in mã đăng nhập nên bước E3 không làm được**
  Người dùng thấy gì: Người kiểm tay không đăng nhập được hoặc thử trên bảng ít căn hơn dự kiến, nên bài nhìn ô tích khó làm đúng như đã viết. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ làm khó người kiểm, không mất hay lộ dữ liệu; có thể dựng tay rồi thử lại, sửa sau không đắt.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/dung-e3.sh`
  severity: high
  Đề xuất: known-limits

- **chia-doi.mjs: commit build hỏng làm cả lượt chia đôi dừng hẳn thay vì bị bỏ qua**
  Người dùng thấy gì: Khi tìm commit gây chậm mà gặp bản không dựng được, công cụ dừng giữa chừng và người kiểm phải chạy lại tay. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Công cụ điều tra dùng một lần, lỗi chỉ gây gián đoạn có báo rõ và chạy lại được; sửa không đáng công.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/chia-doi.mjs`
  severity: medium
  Đề xuất: wont-fix

- **kiem-e11.sh tự dựng thiếu căn và phiên của do-cuon, rồi do-cap.sh nuốt mất lỗi nên không biết vì sao không đo được**
  Người dùng thấy gì: Trên máy chưa dựng sẵn dữ liệu, lượt đo báo không đo được cặp nào mà không nói lý do, làm người kiểm mất thời gian dò. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Thất bại ồn ào chứ không cho kết quả sai, người kiểm dựng dữ liệu trước rồi chạy lại là được; không mất dữ liệu.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/kiem-e11.sh`
  severity: medium
  Đề xuất: known-limits

- **chia-doi.mjs: không có commit nào chứa bản tốt thì lặng lẽ kết luận bản chậm là commit chậm đầu tiên**
  Người dùng thấy gì: Nếu người kiểm nhập sai mã bản tốt, công cụ vẫn đưa ra một kết luận trông hợp lệ nhưng sai. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Chỉ xảy ra khi nhập sai tham số, người kiểm đối chiếu lại là phát hiện ngay; sửa không đáng công.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/chia-doi.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (đối chứng không vào kết luận): thước cặp bỏ qua kết luận và đối chứng bận của máy đo cuộn**
  Người dùng thấy gì: Một lượt đo không hợp lệ (bảng không cuộn hết) vẫn có thể được tính là một cặp đo xong và cho kết quả xanh, nên kết luận về độ mượt có thể lạc quan hơn thực tế.
  Căn cứ: Rủi ro là báo xanh nhầm về hiệu năng cuộn, không mất dữ liệu; ba cặp đo và bài đối chứng AC-2 vẫn làm lộ phần lớn trường hợp, sửa sau không đắt.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/do-cap.sh`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 6 (không đo cây đang kiểm): «DỰNG D» của E3 không build cây hiện tại và không nạp 5.000 căn như lời hứa**
  Người dùng thấy gì: Bài nhìn ô tích có thể xem nhầm một bản build cũ hoặc bảng ít căn hơn, nên người kiểm tưởng đã xem bản mới mà thực ra chưa. Người dùng cuối không bị ảnh hưởng.
  Căn cứ: Rủi ro nằm ở độ tin cậy của bước kiểm tay, không đụng dữ liệu người dùng; dựng đúng bản rồi xem lại là xong.
  file: `_acceptance/va-bang-hang-e11-hieu-nang/thu/dung-e3.sh`
  severity: medium
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
