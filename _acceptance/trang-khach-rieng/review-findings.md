# Review findings: trang-khach-rieng (round 1)

## Trong hợp đồng

Không có phát hiện nào map được vào AC.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Nút «Quan tâm» đọc localStorage không có try/catch, khác cách làm ở bao-mo.tsx**
  Người dùng thấy gì: Trên một số trình duyệt hay trình xem nhúng chặn lưu trữ, trang khách có thể hỏng ngay khi mở và khách không thấy bộ căn.
  Căn cứ: Khách ở trình duyệt bị chặn mất cả trang chứ không chỉ nút, tải lại không giúp được, nhưng chỉ gặp ở số ít trình duyệt và sửa rẻ.
  file: `apps/web/src/app/s/[code]/quan-tam.tsx`
  severity: medium
  Đề xuất: new-contract

- **Đường ghi sự kiện không mã hoá mã link, khác với đường đọc**
  Người dùng thấy gì: Nếu mã link chứa ký tự lạ, lượt mở hoặc lượt quan tâm có thể không được ghi; khách không nhận ra điều gì khác thường.
  Căn cứ: Mã link do hệ thống sinh nên hầu như không có ký tự lạ, hậu quả nhẹ và không lộ dữ liệu.
  file: `apps/web/src/app/s/[code]/su-kien.ts`
  severity: low
  Đề xuất: known-limits

- **Trong ghiSuKien, mã lỗi 23514 xuất hiện ở hai nhánh, nhánh sau không bao giờ chạy**
  Người dùng thấy gì: Một số yêu cầu sai khuôn bị báo là «căn không ghi được» thay vì «yêu cầu sai»; khách không thấy khác biệt.
  Căn cứ: Chỉ đổi mã lỗi bên trong, không mất hay lộ dữ liệu, khách không nhận ra, sửa không đáng công.
  file: `packages/api/src/public/store.ts`
  severity: low
  Đề xuất: wont-fix

- **Every API error is shown to the customer as 'link no longer opens' (silent fallback)**
  Người dùng thấy gì: Khi hệ thống gặp sự cố tạm thời, khách bị báo sai rằng link đã bị tắt và đi hỏi lại người gửi, trong khi link vẫn tốt.
  Căn cứ: Khách hiểu nhầm và có thể bỏ cuộc, sự cố không để lại dấu vết để biết; tải lại sau đó thì ổn nên không mất dữ liệu.
  file: `apps/web/src/app/s/[code]/doc.ts`
  severity: medium
  Đề xuất: new-contract

- **Quan tâm button reads window.localStorage without a guard and can crash the page**
  Người dùng thấy gì: Trên một số trình duyệt hay trình xem nhúng chặn lưu trữ, trang khách có thể hỏng ngay khi mở và khách không thấy bộ căn.
  Căn cứ: Khách ở trình duyệt bị chặn mất cả trang, tải lại không giúp được, nhưng chỉ gặp ở số ít trình duyệt và sửa rẻ.
  file: `apps/web/src/app/s/[code]/quan-tam.tsx`
  severity: medium
  Đề xuất: new-contract

- **Interest on a unit that is no longer for sale returns 409, and the UI says 'try again' forever**
  Người dùng thấy gì: Nếu căn vừa hết bán sau khi khách mở trang, khách chạm Quan tâm sẽ thấy «thử lại» mãi, không biết căn đã không còn nhận quan tâm.
  Căn cứ: Gây bối rối nhẹ, không mất hay lộ dữ liệu, tải lại trang là thấy trạng thái đúng.
  file: `apps/web/src/app/s/[code]/su-kien.ts`
  severity: low
  Đề xuất: known-limits

- **Header shows an empty company name when no unit in the share is readable anymore**
  Người dùng thấy gì: Khi mọi căn trong lần gửi đều không còn xem được, đầu trang hiện tên sàn và tên người gửi trống cùng «Gửi bạn 0 căn».
  Căn cứ: Ca hiếm, chỉ trông xấu và không lộ dữ liệu; khách vẫn hiểu là không còn căn nào.
  file: `packages/core/src/sharing/trang-khach.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 3/1 — rào route công khai chỉ kiểm «chuỗi đường có mặt», kể cả trong comment, thay vì quan hệ «route có bài rò rỉ thực sự chạy trên đầu ra của nó»**
  Người dùng thấy gì: Một cửa công khai mới có thể qua rào kiểm rò rỉ chỉ nhờ nhắc tên trong chú thích, nên dữ liệu nội bộ có thể ra ngoài mà không bị bắt.
  Căn cứ: Đây là lưới chặn rò rỉ ra khách, lỗ hổng chỉ lộ khi có người thêm cửa mới; khách chưa bị ảnh hưởng ngay nhưng nếu rò thì nặng và không rút lại được.
  file: `packages/api/src/public/rao-route.ts`
  severity: high
  Đề xuất: new-contract

- **Hình 1 — bài rò rỉ route đọc đo hàm con thanTrangKhach chứ không đo thân route thật docTrangKhach trả ra**
  Người dùng thấy gì: Nếu sau này có người thêm một trường nội bộ vào phần trả về của trang khách, bài kiểm rò rỉ có thể không phát hiện.
  Căn cứ: Hiện chưa có rò rỉ thật, chỉ là khoảng hở của bài kiểm cho thay đổi tương lai; sửa rẻ khi có thay đổi đó.
  file: `packages/api/src/public/doc.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (kèm hình 2) — bài rò rỉ trang /s/<mã> chỉ kiểm âm tính (loi rỗng), không có đối chứng dương rằng trang có dựng ra nội dung căn; thân trang thì viết tay**
  Người dùng thấy gì: Bài kiểm có thể báo xanh dù trang dựng ra rỗng, nên một lỗi làm trang trống có thể lọt qua phần kiểm rò rỉ.
  Căn cứ: Không gây rò dữ liệu cho khách, chỉ làm bài kiểm yếu đi; lỗi trang trống sẽ lộ ở các kiểm khác và sửa rẻ.
  file: `apps/web/src/app/s/[code]/trang.ro-ri.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 — ca 404 của link tắt chỉ kiểm âm tính trên chuỗi lộ, thiếu tên người gửi, không đối chứng rằng các chuỗi đó có mặt ở thân 200**
  Người dùng thấy gì: Bài kiểm link đã tắt có thể xanh vô nghĩa nếu chuỗi cần vắng mặt vốn không bao giờ xuất hiện; khách không bị ảnh hưởng trực tiếp.
  Căn cứ: Chỉ là độ chặt của bài kiểm, hành vi thật đã được kiểm ở chỗ khác, không có hậu quả cho khách.
  file: `packages/api/test-db/trang-khach.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
