# Review findings: trang-thai-rieng (round 3)

## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bước chuẩn bị mới của E13 gửi lệnh đổi trạng thái mà thiếu expectedVersion, nên máy chủ trả 409**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng gì. Chỉ người chạy bài kiểm nghiệm thu có thể gặp một lần bị từ chối ở bước chuẩn bị, rồi phải tự thử lại cho đúng.
  Căn cứ: Không ảnh hưởng người dùng, không mất hay lộ dữ liệu, người chạy thử lại là qua được và lần chạy trước đã tự xử lý được.
  file: `_acceptance/trang-thai-rieng/evals.yaml`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 (khẳng định âm tính đứng một mình, thiếu đối chứng dương): mốc «giữ nguyên» không ghim giá trị (r2)**
  Người dùng thấy gì: Bài kiểm chưa chứng minh chắc rằng giá chốt, ngày bán và lý do ngừng được giữ nguyên khi đổi nhãn ở căn đã bán. Nếu có lỗi, người dùng có thể thấy các thông tin này mất hoặc sai mà bài kiểm không báo.
  Căn cứ: Chỉ là chỗ hở của bài kiểm ở một tình huống hiếm, chưa có dấu hiệu sai thật; thêm một khẳng định sau này rẻ và không mất dữ liệu của người dùng.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên một lớp nhưng chỉ kiểm từng điểm): nói «gỡ cả hai nhãn» mà chỉ kiểm nhãn của một căn (r2)**
  Người dùng thấy gì: Bài kiểm chưa xác nhận căn đã bán có bỏ nhãn cũ sau khi quản trị gỡ nhãn đó. Nếu sót, căn đã bán có thể còn hiện nhãn đã bị gỡ.
  Căn cứ: Hậu quả nhẹ, chỉ ảnh hưởng một nhóm căn đã chốt và người dùng tự sửa lại nhãn được; bổ sung khẳng định sau này rẻ.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: low
  Đề xuất: known-limits

- **Khuôn mã nhãn chép hai nơi, lời chú thích nói đã dùng chung nhưng không đúng (r1)**
  Người dùng thấy gì: Hiện người dùng không thấy gì sai. Nếu sau này có người sửa quy tắc đặt mã nhãn ở một nơi mà quên nơi kia, hai chỗ có thể chấp nhận khác nhau.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, không mất dữ liệu, và chỉ là chuyện dọn dẹp nhẹ nên không đáng mở việc riêng.
  file: `packages/core/src/statuses/index.ts`
  severity: low
  Đề xuất: wont-fix

- **Hình dạng 5 — tuyên quét LỚP «mọi chỗ đọc payload ->> 'to'» nhưng ma trận đếm theo TỆP và gộp mọi migration thành một dòng (r1)**
  Người dùng thấy gì: Bộ kiểm tra chưa chắc báo đỏ nếu sau này có thêm một chỗ đọc trạng thái mới chưa tính đến nhãn riêng, nên lỗi hiển thị nhãn có thể lọt qua.
  Căn cứ: Hôm nay người dùng chưa gặp lỗi nào; rủi ro chỉ xảy ra khi có thay đổi tương lai và sửa bộ kiểm tra lúc nào cũng được.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 3 — lời hứa «hai căn deepEqual nhau trừ trường của chính căn» chỉ được đo bằng tập KHOÁ (r1)**
  Người dùng thấy gì: Bộ kiểm tra chưa chứng minh đủ rằng căn mang nhãn riêng hiện y như căn thường ở ngoài; nếu sau này có chữ khác lọt ra, kiểm tra có thể không bắt được.
  Căn cứ: Chưa có hậu quả thật với người dùng và việc củng cố kiểm tra có thể làm sau mà không mất dữ liệu.
  file: `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 4 — ca từ chối đổi nhãn trùng không ghim lý do, còn đối chứng «hàng đợi không đổi» thì rỗng nghĩa (r1)**
  Người dùng thấy gì: Bộ kiểm tra chỉ biết lệnh bị từ chối chứ không biết vì lý do gì, nên nếu lý do đổi sai thì người dùng có thể thấy thông báo lạ mà kiểm tra không báo.
  Căn cứ: Hậu quả nhẹ, người dùng chỉ có thể thấy thông báo lỗi chưa chuẩn, không mất dữ liệu, và củng cố kiểm tra sau rất rẻ.
  file: `apps/web/src/app/(app)/inventory/trang-thai-rieng.test.ts`
  severity: low
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
