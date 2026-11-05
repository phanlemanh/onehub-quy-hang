# Review findings: man-lien-he (round 2)

## Trong hợp đồng

Không có mục nào.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Mở số thất bại (bản mã khoá khác) vẫn ghi sự kiện «mở số» vào dòng thời gian**
  Người dùng thấy gì: Khi một số điện thoại không mở được vì lỗi dữ liệu, người dùng thấy báo «chưa mở được» nhưng sổ ghi mở số và dòng thời gian của hồ sơ vẫn hiện như đã mở số.
  Căn cứ: Chỉ xảy ra với số lưu bằng khoá khác (chủ yếu dữ liệu mẫu), không làm lộ số hay mất dữ liệu, chỉ làm sổ ghi dư vài dòng; sửa sau không đắt nhưng không chặn việc phát hành.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Số không giải mã được vẫn bị ghi là đã mở số, dù người dùng không thấy số (trả 404)**
  Người dùng thấy gì: Mỗi lần bấm «Hiện số» mà số hỏng vẫn để lại một dòng «đã mở số» trong nhật ký, dù người dùng không hề thấy số; bấm thử lại thì thêm dòng giả.
  Căn cứ: Không lộ số và không mất dữ liệu, chỉ khiến nhật ký mở số dư dòng khi dữ liệu số bị hỏng, tình huống hiếm ngoài dữ liệu mẫu; ghi lại là hạn chế đã biết rồi xử lý ở đợt sau.
  file: `packages/api/src/contacts/read/store.ts`
  severity: high
  Đề xuất: known-limits

- **Lỗi giải mã bị nuốt im lặng: khoá cấu hình sai thành 'không có ba số cuối' hoặc 404, không có log**
  Người dùng thấy gì: Nếu khoá mã hoá bị cấu hình sai, màn Liên hệ chỉ lặng lẽ hiện số bị che hoặc báo không mở được, không ai phía vận hành biết có sự cố.
  Căn cứ: Không lộ dữ liệu, người dùng thấy ngay số không mở được nên tự biết có vấn đề, chỉ khó phát hiện nguyên nhân phía vận hành; thêm cảnh báo sau không đắt.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3: bài E10e so đúng một chuỗi cố định, trong khi điều nó hứa là một quan hệ («dòng lệch ấy là báo oan vì trang nằm trong ngoai_le của trang-tam»)**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng; chỉ là bài kiểm khuôn giao diện có thể bỏ sót nếu sau này ai đó xoá ngoại lệ của trang Liên hệ.
  Căn cứ: Không đụng tới sản phẩm hay dữ liệu người dùng, và lỗi lệch khuôn thật vẫn có thể bị bắt ở các lần kiểm khác của kho; ghi lại để nâng bài kiểm sau.
  file: `_acceptance/man-lien-he/kiem-khuon-e10d.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kèm hình 2): bài chỉ thấy chuỗi href viết tay có mặt, trong khi điều hứa là liên kết cơ hội mở được hồ sơ căn**
  Người dùng thấy gì: Người dùng hiện mở được hồ sơ căn từ cơ hội; chỉ có nguy cơ về sau nếu cách đọc liên kết đổi mà bài kiểm không báo.
  Căn cứ: Liên kết đang chạy đúng và nếu hỏng thì người dùng chỉ thấy bảng hàng không chọn căn, tự quay lại được, không mất dữ liệu; tăng độ chặt bài test không đáng công lúc này.
  file: `apps/web/src/app/(app)/contacts/lien-he.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Con trỏ trang của danh sách liên hệ không được kiểm, con trỏ sai khuôn làm API trả 500 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Nếu ai đó tự sửa đường dẫn tải tiếp của danh sách, hệ thống báo lỗi chung thay vì báo yêu cầu sai. Người dùng bấm tải tiếp bình thường không gặp.
  Căn cứ: Chỉ xảy ra khi cố tình sửa tay đường dẫn, không mất hay lộ dữ liệu, tải lại là hết, nên ghi nhận là giới hạn đã biết.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Trạng thái Lead/Liên hệ tính hai cách, danh sách và hồ sơ báo khác nhau cho cùng một người (r1 · tệp đã đổi)**
  Người dùng thấy gì: Với người có lead đã gọi, bị trả lại rồi gửi lại, bảng có thể ghi «Liên hệ» còn hồ sơ lại ghi «Lead». Hai nơi nói khác nhau về cùng một người.
  Căn cứ: Chỉ lệch ở ca hiếm (lead gửi lại), không mất hay lộ dữ liệu và không chặn việc tìm hay gọi; nhưng dễ gây hiểu nhầm nên cần theo dõi.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Hàm tìm theo dấu vết số không tự kiểm vai, trái với chính lời đầu migration và mẫu của các hàm security definer khác (r1)**
  Người dùng thấy gì: Chỉ lớp dịch vụ đang chặn các vai không được dùng; nếu có đường gọi thẳng vào cơ sở dữ liệu thì vai khác trong cùng sàn có thể dò ra ai đang giữ một số điện thoại. Không lộ tên chủ hay số.
  Căn cứ: Chỉ lộ tên người giữ trong cùng một sàn và phải có đường gọi thẳng hiện chưa có, không lộ thông tin chủ nhà; sửa về sau cần migration mới nên đáng ghi lại.
  file: `packages/db/migrations/036_man_lien_he.sql`
  severity: low
  Đề xuất: known-limits

- **Hồ sơ người kẹt mãi ở trạng thái đang tải khi chọn lại đúng người đang mở (r1)**
  Người dùng thấy gì: Bấm lại đúng dòng đang chọn, hoặc sửa số của người đang mở, làm hồ sơ quay mãi ở trạng thái đang tải và các số đã hiện bị che lại. Phải đóng rồi mở lại hồ sơ mới thấy tiếp.
  Căn cứ: Không mất dữ liệu và người dùng tự thoát được bằng cách đóng mở lại, nhưng dễ gặp nên nên sửa sớm.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: medium
  Đề xuất: known-limits

- **Gõ 9 chữ số hoặc số sai khuôn bị báo nhầm là lỗi mạng «Chưa tải được — thử lại» (r1)**
  Người dùng thấy gì: Gõ số chưa đủ hoặc sai khuôn thì màn báo «Chưa tải được — thử lại» như bị lỗi mạng, bấm thử lại bao nhiêu lần cũng vậy. Người dùng không biết là mình gõ sai số.
  Căn cứ: Chỉ gây bối rối chứ không mất hay lộ dữ liệu; gõ đủ số đúng là tìm được bình thường.
  file: `apps/web/src/app/(app)/contacts/lien-he.ts`
  severity: medium
  Đề xuất: known-limits

- **Tìm số ra người đọc được thì bảng vẫn báo «Không tìm thấy «<số>»» (r1)**
  Người dùng thấy gì: Tìm một số ra đúng người thì hồ sơ mở bên cạnh nhưng bảng bên trái lại ghi «Không tìm thấy». Hai bên nói ngược nhau.
  Căn cứ: Chỉ là thông báo gây nhầm, người dùng vẫn thấy hồ sơ đúng và gọi được, không mất dữ liệu.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: low
  Đề xuất: known-limits

- **Trạng thái Lead/Liên hệ của cùng một người khác nhau giữa danh sách và hồ sơ khi có lead gửi lại (r1 · tệp đã đổi)**
  Người dùng thấy gì: Với người có lead cũ đã gọi rồi gửi lại, bộ lọc «Liên hệ» xếp họ vào Liên hệ nhưng hồ sơ lại ghi «Lead». Người xem thấy hai kết quả khác nhau cho cùng một người.
  Căn cứ: Chỉ lệch ở ca hiếm, không mất hay lộ dữ liệu; gộp chung xử lý với lỗi tính dấu hai cách.
  file: `packages/api/src/contacts/read/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên ma trận, chỉ có điểm-case): bảng vai «dùng chung cho ba đường» thiếu đường hồ sơ, thiếu dòng và không đếm dòng ở E3 (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm hiện không thử đủ các vai trên đường xem hồ sơ, nên nếu sau này người đã mất vai Đầu chủ hay telesales xem được hồ sơ thì không có gì báo đỏ.
  Căn cứ: Hiện sản phẩm chưa bị sai, nhưng lỗi quyền về sau sẽ lọt qua không ai thấy, và bổ sung ca kiểm bây giờ rẻ hơn nhiều so với sau khi lộ.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình 4 (âm-tính-một-mình): «không có sự kiện đổi giá đáy» là phép quét không bao giờ đỏ được (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép kiểm dòng thời gian không lộ giá đáy chưa chứng minh được là nó bắt được lỗi, vì chưa có ca nào thật sự đưa giá đáy vào.
  Căn cứ: Sản phẩm chưa bị sai nhưng lớp bảo vệ giá đáy chưa được thử; không ảnh hưởng người dùng hiện tại.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm-tính-một-mình): trần 50 sự kiện được kiểm khi chưa có tới 50 sự kiện (r1 · tệp đã đổi)**
  Người dùng thấy gì: Chưa có ca thử hồ sơ dài hơn 50 sự kiện, nên nếu giới hạn 50 bị bỏ thì bộ kiểm vẫn xanh. Người dùng có thể thấy dòng thời gian dài quá mức.
  Căn cứ: Hậu quả nhẹ, chỉ là danh sách dài hơn dự kiến, không lộ dữ liệu.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm «có mặt» trong khi hứa quan hệ): thứ tự dòng thời gian chỉ kiểm bằng phép thuộc tập (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm chưa đảm bảo các sự kiện trong dòng thời gian gán đúng mốc và đúng thứ tự, nên một sự kiện gán sai giờ vẫn có thể lọt.
  Căn cứ: Nếu sai chỉ là thứ tự hiển thị lệch, không mất hay lộ dữ liệu, và người dùng đọc lại được.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm «có mặt» trong khi hứa quan hệ): pha cơ hội so như một túi giá trị, không gắn với từng lead (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm chưa chắc từng cơ hội mang đúng giai đoạn của nó, nên giai đoạn bị gán lệch giữa các cơ hội vẫn có thể lọt.
  Căn cứ: Nếu sai thì chỉ hiển thị sai giai đoạn, không mất hay lộ dữ liệu, nhưng làm người dùng hiểu sai tình trạng.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên danh sách viết trước, chỉ có điểm-case): hồ sơ chỉ có một số, không kiểm nhãn và thứ tự (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm chỉ thử người có một số, nên lỗi về nhãn hay thứ tự số chính và số phụ, hoặc lộ số phụ, có thể không bị bắt.
  Căn cứ: Hiện chưa thấy sai, nhưng số phụ là thông tin chủ nhà nên nếu có lỗi thì khó phát hiện; vẫn cần theo dõi.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (ma trận thiếu phần tử): danh sách theo quyền thiếu liên hệ phía khách (r1 · tệp đã đổi)**
  Người dùng thấy gì: Bộ kiểm chưa có người chỉ là khách, nên chưa thử được việc đầu chủ không thấy họ còn trưởng nhóm thì thấy.
  Căn cứ: Sản phẩm chưa bị sai nhưng quyền xem khách chưa được kiểm; ca này bổ sung sau cũng không muộn.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): 120 liên hệ phân trang chèn thẳng bằng SQL (r1 · tệp đã đổi)**
  Người dùng thấy gì: Phép thử chia trang chỉ dùng người không có số hay lead, nên chưa thử được ca một người hiện hai lần qua các trang khi có nhiều số.
  Căn cứ: Chưa thấy lỗi thật, nếu có thì chỉ là một dòng lặp lại giữa các trang, không lộ dữ liệu.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
