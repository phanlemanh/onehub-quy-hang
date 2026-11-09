# Review findings: va-khuon-v2-moc-tuong-lai (round 3)

## Trong hợp đồng

Không có finding nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mẫu liên kết rút gọn dùng \b và cờ i nên từ chối cả gói vì tên có dấu chấm hợp lệ, trái AC-4 và cái bẫy chính tệp đã ghi**
  Người dùng thấy gì: Một vài tên địa danh viết tắt có dấu chấm, như «T.Me Linh», bị nhận nhầm là tên miền, nên cả gói danh mục bị từ chối. Bên đẩy phải đổi cách viết tên rồi đẩy lại.
  Căn cứ: Hậu quả nhẹ: chỉ gặp ở vài cách viết hiếm, không mất dữ liệu, và bên đẩy tự khắc phục được bằng cách đổi tên rồi đẩy lại.
  file: `packages/connect/src/catalog-feed.ts`
  severity: low
  Đề xuất: known-limits

- **Bỏ .io và .co khỏi mẫu không phân biệt hoa thường làm lọt tên miền viết hoa chữ đầu mà bản trước đã chặn**
  Người dùng thấy gì: Tên miền kiểu «Nhadat.io» viết hoa chữ đầu giờ lọt qua lưới chặn và có thể vào các trường tên, trong khi bản trước đã chặn. Thông tin liên hệ kiểu này có thể xuất hiện trong dữ liệu danh mục.
  Căn cứ: Là lỗi lọt lưới thật nhưng chỉ ảnh hưởng chuỗi do người gõ, không làm lộ dữ liệu chủ nhà, và sửa sau vẫn rẻ vì chỉ cần siết lại một mẫu kiểm.
  file: `packages/connect/src/catalog-feed.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4, không ghim thông điệp: chữ «Mốc đo» khớp cả lỗi khuôn lẫn lỗi «tương lai», nên phép đo phút múi giờ từ 60 không phân biệt được cổng nào từ chối**
  Người dùng thấy gì: Bài kiểm hiện không phân biệt được gói có múi giờ sai bị từ chối vì lý do nào. Nếu sau này có người làm hỏng phần sửa này, bên đẩy có thể nhận lời báo sai lý do mà không bài kiểm nào đỏ.
  Căn cứ: Sản phẩm hiện chạy đúng nên người dùng chưa gặp hại gì, rủi ro chỉ nằm ở lần sửa sau, và bổ sung bài kiểm vào lúc nào cũng rẻ.
  file: `packages/connect/src/catalog-feed-va.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5, tuyên quét LỚP nhưng ma trận thiếu phần tử: thẻ hứa «mọi trường chữ do người gõ» trong khi ma trận sáu đường thiếu stack**
  Người dùng thấy gì: Bài kiểm chưa thử tên miền ở trường «tầng/dãy» của căn nên nếu trường này lọt lưới thì không ai biết. Lời hứa quét mọi trường chữ trên thẻ mô tả rộng hơn những gì bài kiểm thực sự phủ.
  Căn cứ: Không có bằng chứng trường này bị lọt, chỉ là chưa được kiểm; hậu quả nhẹ, không mất dữ liệu, và thêm một ca kiểm sau rất rẻ.
  file: `packages/connect/src/catalog-feed-va.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).

