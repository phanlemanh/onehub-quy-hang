# Review findings: tab-toi (round 1)

## Trong hợp đồng

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Màn đăng nhập báo «Dữ liệu Quỹ hàng trên máy đã xoá» kể cả khi xoá kho lỗi**
  Người dùng thấy gì: Hiếm khi trình duyệt không xoá được dữ liệu trên máy bị báo mất, nhưng màn vẫn nói đã xoá. Người dùng tưởng dữ liệu đã sạch trong khi nó còn trên máy.
  Căn cứ: Chỉ xảy ra khi trình duyệt tự lỗi lúc xoá, hiếm gặp; nhưng nếu xảy ra thì dữ liệu còn lại mà người dùng không hay, và sửa không đắt.
  file: `apps/web/src/app/(auth)/login/may-bi-bao.tsx`
  severity: medium
  Đề xuất: known-limits

- **Lỗi đọc cơ sở dữ liệu khi tra dấu «máy bị báo mất» bị nuốt, máy mất bị coi như hết phiên thường**
  Người dùng thấy gì: Nếu máy chủ trục trặc đúng lúc máy bị báo mất kết nối lại, máy đó bị coi như hết phiên thường và dữ liệu trên máy không bị xoá. Lần kết nối sau, khi máy chủ ổn, máy mới bị xoá.
  Căn cứ: Cần trùng hai sự cố cùng lúc nên hiếm, dữ liệu chỉ chậm xoá chứ không lộ ra ngoài và lần chạm sau tự khắc phục; ghi nhận là giới hạn đã biết là đủ.
  file: `packages/api/src/auth/may-bi-bao.ts`
  severity: medium
  Đề xuất: known-limits

- **Xoá kho trong vỏ app hỏng thì bị nuốt và chốt `daBao`: không chuyển trang, không thử lại**
  Người dùng thấy gì: Khi máy bị báo mất mà việc xoá dữ liệu trên máy gặp lỗi, màn vẫn mở như bình thường và không có thông báo gì. Dữ liệu của người đó còn trên máy cho đến khi tải lại trang.
  Căn cứ: Chỉ xảy ra khi trình duyệt lỗi lúc xoá, hiếm; người dùng tự khắc phục bằng cách tải lại trang, nên chấp nhận được ở bản đầu.
  file: `apps/web/src/lib/sync/may-bi-bao.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5, tuyên quét LỚP nhưng chỉ có điểm-case: ma trận E1 «5 vai × 2 thiết bị» không đổi đầu vào mà hàm đọc**
  Người dùng thấy gì: Bài kiểm tự động nói là đã thử mọi vai và thiết bị nhưng thực ra chỉ thử hai tình huống. Người dùng không thấy lỗi gì ngay, nhưng sau này nếu màn lệch theo vai hay thiết bị thì bài kiểm sẽ không báo.
  Căn cứ: Không ảnh hưởng người dùng hiện tại, chỉ làm lưới an toàn về sau mỏng hơn; có thể ghi lại và bổ sung dần.
  file: `apps/web/src/app/(app)/me/toi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3, assert «chuỗi có mặt» trong khi lời hứa là QUAN HỆ: E3 «cùng bảng chữ với dải bật»**
  Người dùng thấy gì: Bài kiểm không thực sự so chữ thông báo ở tab Tôi với dải bật ở Hôm nay. Nếu sau này hai nơi hiện chữ khác nhau thì người dùng sẽ thấy hai câu không khớp mà bài kiểm không báo.
  Căn cứ: Hiện chữ vẫn khớp nên chưa có hại; rủi ro chỉ là lệch chữ về sau, người dùng nhìn thấy nhưng không mất dữ liệu.
  file: `apps/web/src/app/(app)/me/toi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4, assertion âm tính một mình: chiều đỏ của E4 chạy trên hàm tự viết, không đi qua thước**
  Người dùng thấy gì: Bài kiểm về thứ tự đăng xuất không bắt được lỗi đảo thứ tự. Nếu sau này ai đó đảo thứ tự, dữ liệu trên máy có thể không được xoá khi đăng xuất mà không ai biết.
  Căn cứ: Hiện đăng xuất chạy đúng; rủi ro chỉ khi sửa sai về sau, và hậu quả là dữ liệu còn trên máy nên đáng ghi lại để sửa bài kiểm sớm.
  file: `apps/web/src/app/(app)/me/toi.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4, assertion âm tính một mình: «trang /me không còn nhập Placeholder» không có đối chứng dương**
  Người dùng thấy gì: Bài kiểm chỉ xác nhận trang không còn là trang chỗ giữ, chứ không xác nhận trang dựng màn Tôi. Người dùng không bị ảnh hưởng vì màn thật đang hiện đúng.
  Căn cứ: Không có hậu quả với người dùng, lỗi trang rỗng sẽ lộ ngay khi mở màn, nên chi phí sửa vượt lợi ích.
  file: `apps/web/src/app/(app)/me/toi.test.ts`
  severity: low
  Đề xuất: wont-fix

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
