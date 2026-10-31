# Review findings: mo-san-trung-ten (round 1)

## Trong hợp đồng

Không có finding nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Thẻ cổng của mo-san-trung-ten vẫn hứa điều chủ kho vừa bỏ: «đặt sàn nào cũng vậy»**
  Người dùng thấy gì: Thẻ để chủ kho đọc và ký vẫn ghi một lời hứa cũ: người của sàn mới không đọc được dữ liệu sàn cũ dù đặt sàn nào. Thực tế hệ thống chỉ giữ lời hứa này khi người đó không là thành viên sàn cũ, nên chủ kho có thể ký một điều không đúng.
  Căn cứ: Hậu quả là người ký hiểu sai mức bảo vệ dữ liệu giữa các công ty, nhưng không mất dữ liệu; vẽ lại thẻ từ hợp đồng đã sửa là việc rẻ và làm trước khi ký.
  file: `_acceptance/mo-san-trung-ten/card-plain.json`
  severity: high
  Đề xuất: new-contract

- **Ca cách ly gọi phép đo của mình là «đường chọn sàn của API» nhưng tự viết lại câu truy vấn bằng vai chủ**
  Người dùng thấy gì: Một dòng trong bộ kiểm tự nhận là đã kiểm cách chọn sàn của hệ thống thật, nhưng thực ra chỉ kiểm một câu hỏi tự viết lại. Nếu cách chọn sàn thật đổi, bài kiểm này vẫn báo xanh.
  Căn cứ: Hậu quả nhẹ: phần cách ly dữ liệu chính vẫn được đo ở chỗ khác, chỉ lời mô tả nói quá, và sửa sau rất rẻ.
  file: `packages/db/tests/isolation.test.mjs`
  severity: low
  Đề xuất: known-limits

- **The signer's card still promises the old AC-4: "whichever company they set, they cannot read the old company's data"**
  Người dùng thấy gì: Thẻ ký vẫn hứa rằng người của sàn mới không đọc được dữ liệu sàn cũ dù đặt sàn nào. Điều này không đúng: nếu ai đó tự đặt sàn cũ, cơ sở dữ liệu không chặn, chỉ có phần API chặn.
  Căn cứ: Người ký có thể tin rằng cơ sở dữ liệu tự chặn trong khi chưa có; không mất dữ liệu ngay vì API vẫn chặn, và vẽ lại thẻ cùng ghi hàng việc kiểm thành viên là rẻ.
  file: `_acceptance/mo-san-trung-ten/card-plain.json`
  severity: medium
  Đề xuất: new-contract

- **Hình dạng 2 (fixture viết tay đúng khuôn bên đọc): ca cách ly chép tay câu chọn sàn thay vì gọi đường chọn sàn thật của API**
  Người dùng thấy gì: Bộ kiểm dùng một câu hỏi chép tay thay vì đúng cách hệ thống chọn sàn cho người dùng. Nếu cách chọn thật đổi, bài kiểm vẫn xanh và có thể che một lỗi.
  Căn cứ: Rủi ro vừa và chỉ lộ khi cách chọn sàn thật đổi sau này; điều chính (người mới không là thành viên sàn cũ) đã được đo, nên ghi lại là hạn chế đã biết là đủ.
  file: `packages/db/tests/isolation.test.mjs`
  severity: medium
  Đề xuất: known-limits

⚠ Cụm ngoài vùng phủ: 2/4 lỗi rơi vào file không bộ đo nào phủ (_acceptance/mo-san-trung-ten/card-plain.json) — dừng và quyết: mở rộng hợp đồng hay rút phạm vi.
