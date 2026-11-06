# Review findings: va-deploy-csdl-tam (round 2)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Đổi điều đang đúng của bước deploy nhưng ADR-0009 §7 và Tham chiếu §12 vẫn tả bước cũ; chú thích CI trỏ tới mục sửa đổi không có**
  Người dùng thấy gì: Tài liệu quyết định vẫn nói bản thật được chạy bộ kiểm cách ly, trong khi thực tế đã đổi. Người đọc tài liệu sẽ hiểu sai cách sàn được bảo vệ khi phát hành.
  Căn cứ: Không mất dữ liệu và không ảnh hưởng người dùng cuối, chỉ làm tài liệu lệch thực tế; sửa sau rẻ và đã được ghi là việc theo sau.
  file: `.github/workflows/ci.yml`
  severity: medium
  Đề xuất: new-contract

- **Mất lưới bất biến 2 trên bản thật: không còn ca chặn deploy khi bảng sạch số rõ mà ràng buộc bản mã chưa bật**
  Người dùng thấy gì: Khi phát hành, hệ thống không còn tự dừng nếu số điện thoại chủ nhà chưa được chặn lưu dạng rõ ở bản thật. Một lỗi ở khâu này có thể lọt qua mà không ai biết cho tới khi có người tự soi.
  Căn cứ: Đây là lưới bảo vệ thông tin chủ nhà nên nghiêm trọng nếu lọt, nhưng chỉ xảy ra khi cấu hình bản thật sai; thêm lại vào bước kiểm nhanh sau này tương đối rẻ và chủ kho cần thấy ở cổng.
  file: `packages/db/scripts/kiem-nhanh.mjs`
  severity: medium
  Đề xuất: new-contract

- **Thước đã ký của moi-truong-that và bat-rang-buoc-ban-ma (executors.script.kiem_ci) đổi từ ĐẠT sang HỎNG ở vế thứ tự; executor cach_ly_that còn tả việc chạy cách ly trên bản thật**
  Người dùng thấy gì: Hai hồ sơ nghiệm thu đã ký trước đây sẽ báo hỏng nếu bị chấm lại, dù sản phẩm vẫn chạy bình thường. Đây là lệch giữa thước đo cũ và cách phát hành mới.
  Căn cứ: Không ảnh hưởng người dùng, chỉ làm chấm lại hồ sơ cũ báo đỏ; sửa thước rẻ và đã được giao cho hồ sơ cũ.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 5 (ma trận toàn phần): chốt đếm 24 không bắt được dòng trùng hay dòng thiếu**
  Người dùng thấy gì: Bài kiểm của công cụ soi luật có thể vẫn xanh nếu sau này ai đó vô tình sao chép một dòng thay vì thêm ca mới. Hiện tại các ca đang đủ và đúng.
  Căn cứ: Chỉ làm yếu bài kiểm trong tương lai, không ảnh hưởng người dùng hôm nay; người sửa sau sẽ tự thấy khi đọc bài kiểm.
  file: `packages/db/tests/kiem-nhanh.test.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp): ma trận bỏ sót trạng thái 'ép mà chưa bật' có thật trong Postgres**
  Người dùng thấy gì: Một tổ hợp cấu hình hiếm của bảng chưa có ca kiểm riêng, dù công cụ vẫn báo đúng là chưa bật.
  Căn cứ: Hành vi hiện tại đã đúng và tổ hợp này rất hiếm gặp; chi phí thêm ca kiểm vượt xa rủi ro.
  file: `packages/db/tests/kiem-nhanh.test.mjs`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 4 (âm tính một mình): trần thời gian chỉ được kiểm là 'khác 0', không ghim giá trị đã đặt**
  Người dùng thấy gì: Nếu ai đó bỏ mất giới hạn thời gian của bước kiểm nhanh, bài kiểm có thể không báo trên một số máy chủ. Hiện giới hạn vẫn đang được đặt.
  Căn cứ: Không ảnh hưởng người dùng hôm nay và dễ phát hiện khi sửa đoạn này; chỉ là lưới kiểm lỏng hơn mong muốn.
  file: `packages/db/tests/kiem-nhanh.test.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
