# Review findings: va-anh-ban-that (round 1)

## Trong hợp đồng

- **Hình dạng 5 (ma trận khai trước bị thiếu phần tử): E2 hứa ca «đầu chủ sàn khác xin link → 403» nhưng test không có**
  file: `packages/api/test-db/photos-ban-that.test.ts:471`
  severity: medium
  AC: AC-2
  source: measurement
  detail: evals.yaml E2 liệt kê: «đầu khách xin link → 403, đầu chủ sàn khác → 403, máy chủ giả nhận 0 yêu cầu». Test chỉ có `assert.equal((await xinLink(k.app, s.dauKhach.cookie, { byteSize: 5000 })).status, 403)`, không có lời gọi xinLink nào bằng `b.dauChu.cookie` để bị từ chối. Ở đây `b.dauChu` chỉ xin link hợp lệ cho sàn của mình. Cũng trong E2, lời hứa «máy chủ giả nhận một DELETE cho đối tượng sai (trừ ca không có)» được đo bằng `assert.ok(xoa.length >= 2)` dùng cận dưới thay cho số đúng, cộng với `doiTuong.has(...) === false` ở từng ca. Với ca «không có», điều kiện sau luôn đúng vì đối tượng chưa bao giờ tồn tại. Nghĩa là không ca nào ghim được đúng một DELETE cho đúng đối tượng.
  rationale: AC-2 nêu rõ người thuộc sàn khác xin link phải bị từ chối và kho không nhận yêu cầu; ca này không được đo.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mã ảnh khai bậy lọt qua kiểm tra rồi làm vỡ câu truy vấn kiểu uuid, trả 500 thay vì 400**
  Người dùng thấy gì: Nếu ai đó cố tình gửi mã ảnh sai khuôn, hệ thống báo lỗi chung chung thay vì lời báo rõ ràng. Ảnh không bị ghi và không ai bị lộ dữ liệu.
  Căn cứ: Chỉ xảy ra khi cố tình gửi mã bậy, không mất hay lộ dữ liệu, người dùng thường không gặp, sửa sau cũng rẻ.
  file: `packages/api/src/photos/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Kiểm 'mã đã xác nhận' đọc qua luật theo dòng nên không thấy ảnh nội bộ của căn khác: thay vì 409 thì hỏng khoá chính, ra 500**
  Người dùng thấy gì: Nếu dùng lại mã của một ảnh nội bộ đã có sang căn khác, người dùng thấy lỗi chung thay vì lời báo đúng. Không có ảnh nào bị ghi đè.
  Căn cứ: Hiếm gặp, không mất hay lộ dữ liệu, người dùng chỉ cần thử lại với ảnh mới nên hậu quả nhẹ.
  file: `packages/api/src/photos/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Link PUT ký vẫn dùng được sau khi xác nhận: bản gốc đã kiểm có thể bị thay bằng tệp không phải ảnh hoặc quá 10 MB**
  Người dùng thấy gì: Trong một phút sau khi thêm ảnh, người giữ link tải lên vẫn có thể thay tệp bằng thứ khác. Chỉ người có quyền thêm ảnh của chính công ty mới làm được.
  Căn cứ: Cửa sổ rất ngắn và chỉ người trong công ty có quyền mới khai thác được, không lộ dữ liệu ra ngoài.
  file: `packages/api/src/photos/kho.ts`
  severity: medium
  Đề xuất: known-limits

- **Bản gốc tải thẳng không bao giờ được dọn nếu không xác nhận hoặc giao dịch xác nhận hỏng, và cỡ khai không được ép**
  Người dùng thấy gì: Nếu người dùng đóng tab hoặc mất mạng giữa chừng, tệp đã tải lên vẫn nằm lại trên kho và tốn dung lượng. Người dùng không thấy gì khác lạ.
  Căn cứ: Đã được ghi là hạn chế đã biết từ trước, chỉ tốn một ít dung lượng, không mất hay lộ dữ liệu.
  file: `packages/api/src/photos/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Kho ảnh trả 403 bị đổi thành null, nên lỗi khoá hay quyền của kho hiện ra như «không phải ảnh»**
  Người dùng thấy gì: Khi kho ảnh cấu hình sai hoặc mất quyền, người dùng chỉ thấy báo tệp không phải ảnh, người vận hành khó biết nguyên nhân thật.
  Căn cứ: Chỉ xảy ra khi cấu hình kho hỏng, không mất dữ liệu, nhưng làm chẩn đoán sự cố chậm hơn.
  file: `packages/api/src/photos/kho-s3.ts`
  severity: medium
  Đề xuất: known-limits

- **Hai lần xác nhận cùng mã ảnh chạy song song làm vỡ khoá chính và trả 500 thay vì 409**
  Người dùng thấy gì: Bấm gửi hai lần cùng lúc có thể khiến một lần báo lỗi chung, trong khi ảnh vẫn vào một lần duy nhất.
  Căn cứ: Ảnh không bị nhân đôi hay mất, người dùng tải lại là thấy kết quả đúng.
  file: `packages/api/src/photos/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1 (đo chỉ dẫn thay vì đầu ra): ca E1 đo cỡ thân của form do chính test dựng, không đo điều API chấp nhận**
  Người dùng thấy gì: Một bài kiểm tự động chưa chứng minh chắc việc ảnh gốc không đi qua thân yêu cầu; hành vi thật cho người dùng chưa thấy sai.
  Căn cứ: Chỉ là độ chắc của bài kiểm, người dùng không bị ảnh hưởng, bổ sung bài kiểm sau rẻ.
  file: `packages/api/test-db/photos-ban-that.test.ts`
  severity: high
  Đề xuất: known-limits

- **Hình dạng 4 (assert âm tính đứng một mình, không ghim thông điệp): xác nhận mã ảnh của sàn khác chỉ so status 400**
  Người dùng thấy gì: Bài kiểm tự động chưa chứng minh chắc lý do từ chối là cách ly giữa các sàn, dù yêu cầu vẫn bị từ chối.
  Căn cứ: Người dùng không bị ảnh hưởng, chỉ là độ chắc của bài kiểm; bổ sung sau rẻ.
  file: `packages/api/test-db/photos-ban-that.test.ts`
  severity: medium
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

