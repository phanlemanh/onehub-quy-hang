# Review findings: ghim-lai-ban-that-qua-ci

## Trong hợp đồng

(không có finding nào map được vào AC)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Danh sách cho phép chỉ so chuỗi lệnh, còn tệp mà lệnh chạy thì do nhánh PR viết, nên vẫn ghi được vào cơ sở dữ liệu thật**
  Người dùng thấy gì: Một nhánh cố tình viết mã độc vẫn có thể làm nút bấm ghi vào dữ liệu thật, dù bộ chặn báo cho chạy. Nút chỉ an toàn trước nhầm lẫn, chưa an toàn trước người cố ý.
  Căn cứ: Hậu quả nặng vì có thể ghi vào dữ liệu thật và khó hoàn tác, nhưng cần người có quyền mở nút mới khai thác được và sửa cần thiết kế lại cách cô lập nên nên đăng thành việc riêng.
  file: `.github/scripts/chan-ghim-ban-that.mjs`
  severity: high
  Đề xuất: new-contract

- **`npm ci` chạy mã của nhánh PR trước bộ chặn, trên cùng runner, nên phá được lời gác «lấy từ main»**
  Người dùng thấy gì: Mã trong nhánh có thể chạy trước khi bộ chặn kịp kiểm và sửa chính bộ chặn hoặc chèn mã vào bước đang giữ chuỗi kết nối thật. Khi đó lời hứa nhánh không sửa được bộ chặn không còn đúng.
  Căn cứ: Nặng vì có thể lộ hoặc dùng chuỗi kết nối bản thật, nhưng chỉ người mở được nút chạy tay mới kích hoạt và sửa là một thay đổi thứ tự bước tách biệt, rẻ, nên đăng thành việc riêng.
  file: `.github/workflows/ghim-lai-ban-that.yml`
  severity: high
  Đề xuất: new-contract

- **Luồng nắm bí mật bản thật và bộ chặn của nó không nằm trong t3_paths**
  Người dùng thấy gì: Sau này ai đổi rào giữ chuỗi kết nối bản thật có thể bị xếp mức duyệt nhẹ hơn, không cần chủ kho ký. Người dùng không thấy ngay nhưng lớp bảo vệ có thể bị nới mà ít người biết.
  Căn cứ: Không gây hại ngay hôm nay và người dùng không bị ảnh hưởng, nhưng nếu bỏ qua thì các lần sửa rào sau có thể lọt mà không có chữ ký; sửa là một dòng cấu hình rẻ.
  file: `_acceptance/config.yaml`
  severity: medium
  Đề xuất: new-contract

- **Bộ chặn bỏ sót feature_loop.model_carry_cmd: nhánh chạy được lệnh tuỳ ý với chuỗi kết nối bản thật**
  Người dùng thấy gì: Một nhánh chỉ cần thêm một dòng cấu hình là làm nút chạy lệnh bất kỳ trên dữ liệu thật, trong khi bộ chặn vẫn báo cho chạy. Nút có thể ghi vào dữ liệu thật dù đã hứa là không.
  Căn cứ: Nặng vì ghi được vào dữ liệu thật và khó hoàn tác, người dùng không tự gỡ được; nhưng phải do nhánh cố ý và chữa là chặn thêm một khoá nên đăng thành việc riêng ưu tiên cao.
  file: `.github/scripts/chan-ghim-ban-that.mjs`
  severity: high
  Đề xuất: new-contract

- **Lệnh trong danh sách cho phép vẫn chạy mã lấy từ nhánh, và npm ci chạy mã của nhánh trước bộ chặn**
  Người dùng thấy gì: Nút chỉ giữ được trước nhầm lẫn, chưa giữ được trước một nhánh cố tình phá để chạm dữ liệu thật hoặc bí mật. Câu mô tả là nhánh không sửa được bộ chặn chưa đúng hẳn.
  Căn cứ: Cùng rủi ro với hai phát hiện trước, gộp xử lý chung; nặng nếu bị khai thác nhưng cần người có quyền chạy nút và sửa không đắt.
  file: `.github/workflows/ghim-lai-ban-that.yml`
  severity: medium
  Đề xuất: new-contract

- **Kiểm repin_ci_blank_env bằng regex, không gắn với mục feature_loop**
  Người dùng thấy gì: Nếu ai đó dời cấu hình sang chỗ khác, bộ chặn vẫn báo đạt dù bộ kiểm chung thấy chuỗi kết nối thật. Chỉ xảy ra khi cấu hình bị sửa lệch có chủ ý hoặc do nhầm.
  Căn cứ: Nhẹ vì phải có người sửa cấu hình theo cách lạ mới gặp, không mất dữ liệu và bị chặn thêm ở lần xem PR; ghi lại là đủ.
  file: `.github/scripts/chan-ghim-ban-that.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 3 — kiểm 'chuỗi có mặt' trong khi lời hứa là QUAN HỆ: tệp được quét phải chính là tệp được tải**
  Người dùng thấy gì: Sau này có người thêm đường tải tệp khác không qua quét thì bài tự kiểm vẫn xanh, nên tệp mang bí mật có thể rời GitHub mà không ai biết. Hiện luồng đang đúng.
  Căn cứ: Hiện chưa gây hại vì luồng hôm nay đã quét đúng tệp, chỉ là lưới an toàn cho lần sửa sau còn thủng; sửa sau không đắt nên ghi lại.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 6 — bộ chặn được đo bằng kit cài trên máy tác giả, không phải kit đúng KIT_TAG mà luồng dùng**
  Người dùng thấy gì: Bài tự kiểm có thể báo đạt trên máy có kit lệch phiên bản trong khi nút chạy thật dùng phiên bản khác. Chỉ ảnh hưởng độ tin cậy của phép đo, không ảnh hưởng người dùng trực tiếp.
  Căn cứ: Nhẹ vì lệch chỉ xảy ra khi kit cài trên máy khác phiên bản ghim, người chạy thử tự phát hiện được qua lượt bấm đầu tiên; ghi lại là đủ.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 — tuyên 'mỗi vế một ca' nhưng chỉ đếm, và số đếm là hằng viết tay**
  Người dùng thấy gì: Nếu sau này thêm một vế gác mà quên thêm ca thử, bài tự kiểm vẫn xanh nên có thể có vế gác chưa từng được thử. Hiện tại đủ cả.
  Căn cứ: Nhẹ vì hiện số vế và số ca khớp nhau, rủi ro chỉ phát sinh ở lần sửa sau và người sửa sẽ thấy dòng đếm sai; ghi lại là đủ.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: low
  Đề xuất: known-limits

- **Hình 3 — vế 'chỉ chạy từ main' kiểm chuỗi có mặt ở bất kỳ đâu trong tệp, không kiểm vị trí của nó so với bước dùng bí mật**
  Người dùng thấy gì: Nếu phép gác chỉ chạy từ main bị dời ra sau bước dùng bí mật hoặc chỉ còn trong lời chú thích, bài tự kiểm vẫn báo đạt, nên nút có thể chạy từ nhánh khác mà không ai hay. Hiện luồng đang đặt đúng.
  Căn cứ: Nhẹ vì luồng hôm nay đặt đúng chỗ, lỗi chỉ lộ khi có người sửa luồng sai thứ tự, và PR đó sẽ qua mắt người xem; ghi lại là đủ.
  file: `_acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
