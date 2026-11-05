# Review findings: man-lien-he (round 1)

## Trong hợp đồng

- **Liên kết cơ hội sang căn dùng tham số ?listing= mà Bảng hàng không đọc**
  file:line: `apps/web/src/app/(app)/contacts/ho-so.tsx:46`
  severity: medium
  AC: AC-6
  source: bugs
  detail: DongCoHoi dẫn tới `/inventory?listing=${o.listingId}`. Bảng hàng mở hồ sơ căn qua docCot (apps/web/src/app/(app)/units/ho-so/ho-so.ts:28), hàm này chỉ đọc `unit` (kèm toa, lan) hoặc `hang`. Không chỗ nào trong /inventory đọc `listing`, nên chạm vào cơ hội đã Lên bảng chỉ mở Bảng hàng trống chọn, không mở căn tương ứng. Lỗi không báo gì. Nên dùng `?hang=<listingId>`.
  rationale: AC-6 hứa lead đã Lên bảng «trỏ tới hồ sơ căn»; liên kết hiện tại chỉ mở Bảng hàng trống chọn nên AC-6 không đạt.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Con trỏ trang của danh sách liên hệ không được kiểm, con trỏ sai khuôn làm API trả 500**
  Người dùng thấy gì: Nếu ai đó tự sửa đường dẫn tải tiếp của danh sách, hệ thống báo lỗi chung thay vì báo yêu cầu sai. Người dùng bấm tải tiếp bình thường không gặp.
  Căn cứ: Chỉ xảy ra khi cố tình sửa tay đường dẫn, không mất hay lộ dữ liệu, tải lại là hết, nên ghi nhận là giới hạn đã biết.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Trạng thái Lead/Liên hệ tính hai cách, danh sách và hồ sơ báo khác nhau cho cùng một người**
  Người dùng thấy gì: Với người có lead đã gọi, bị trả lại rồi gửi lại, bảng có thể ghi «Liên hệ» còn hồ sơ lại ghi «Lead». Hai nơi nói khác nhau về cùng một người.
  Căn cứ: Chỉ lệch ở ca hiếm (lead gửi lại), không mất hay lộ dữ liệu và không chặn việc tìm hay gọi; nhưng dễ gây hiểu nhầm nên cần theo dõi.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Hàm tìm theo dấu vết số không tự kiểm vai, trái với chính lời đầu migration và mẫu của các hàm security definer khác**
  Người dùng thấy gì: Chỉ lớp dịch vụ đang chặn các vai không được dùng; nếu có đường gọi thẳng vào cơ sở dữ liệu thì vai khác trong cùng sàn có thể dò ra ai đang giữ một số điện thoại. Không lộ tên chủ hay số.
  Căn cứ: Chỉ lộ tên người giữ trong cùng một sàn và phải có đường gọi thẳng hiện chưa có, không lộ thông tin chủ nhà; sửa về sau cần migration mới nên đáng ghi lại.
  file: `packages/db/migrations/036_man_lien_he.sql`
  severity: low
  Đề xuất: known-limits

- **Hồ sơ người kẹt mãi ở trạng thái đang tải khi chọn lại đúng người đang mở**
  Người dùng thấy gì: Bấm lại đúng dòng đang chọn, hoặc sửa số của người đang mở, làm hồ sơ quay mãi ở trạng thái đang tải và các số đã hiện bị che lại. Phải đóng rồi mở lại hồ sơ mới thấy tiếp.
  Căn cứ: Không mất dữ liệu và người dùng tự thoát được bằng cách đóng mở lại, nhưng dễ gặp nên nên sửa sớm.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: medium
  Đề xuất: known-limits

- **Gõ 9 chữ số hoặc số sai khuôn bị báo nhầm là lỗi mạng «Chưa tải được — thử lại»**
  Người dùng thấy gì: Gõ số chưa đủ hoặc sai khuôn thì màn báo «Chưa tải được — thử lại» như bị lỗi mạng, bấm thử lại bao nhiêu lần cũng vậy. Người dùng không biết là mình gõ sai số.
  Căn cứ: Chỉ gây bối rối chứ không mất hay lộ dữ liệu; gõ đủ số đúng là tìm được bình thường.
  file: `apps/web/src/app/(app)/contacts/lien-he.ts`
  severity: medium
  Đề xuất: known-limits

- **Tìm số ra người đọc được thì bảng vẫn báo «Không tìm thấy «<số>»»**
  Người dùng thấy gì: Tìm một số ra đúng người thì hồ sơ mở bên cạnh nhưng bảng bên trái lại ghi «Không tìm thấy». Hai bên nói ngược nhau.
  Căn cứ: Chỉ là thông báo gây nhầm, người dùng vẫn thấy hồ sơ đúng và gọi được, không mất dữ liệu.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: low
  Đề xuất: known-limits

- **Trạng thái Lead/Liên hệ của cùng một người khác nhau giữa danh sách và hồ sơ khi có lead gửi lại**
  Người dùng thấy gì: Với người có lead cũ đã gọi rồi gửi lại, bộ lọc «Liên hệ» xếp họ vào Liên hệ nhưng hồ sơ lại ghi «Lead». Người xem thấy hai kết quả khác nhau cho cùng một người.
  Căn cứ: Chỉ lệch ở ca hiếm, không mất hay lộ dữ liệu; gộp chung xử lý với lỗi tính dấu hai cách.
  file: `packages/api/src/contacts/read/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên ma trận, chỉ có điểm-case): bảng vai «dùng chung cho ba đường» thiếu đường hồ sơ, thiếu dòng và không đếm dòng ở E3**
  Người dùng thấy gì: Bộ kiểm hiện không thử đủ các vai trên đường xem hồ sơ, nên nếu sau này người đã mất vai Đầu chủ hay telesales xem được hồ sơ thì không có gì báo đỏ.
  Căn cứ: Hiện sản phẩm chưa bị sai, nhưng lỗi quyền về sau sẽ lọt qua không ai thấy, và bổ sung ca kiểm bây giờ rẻ hơn nhiều so với sau khi lộ.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình 4 (âm-tính-một-mình): «không có sự kiện đổi giá đáy» là phép quét không bao giờ đỏ được**
  Người dùng thấy gì: Phép kiểm dòng thời gian không lộ giá đáy chưa chứng minh được là nó bắt được lỗi, vì chưa có ca nào thật sự đưa giá đáy vào.
  Căn cứ: Sản phẩm chưa bị sai nhưng lớp bảo vệ giá đáy chưa được thử; không ảnh hưởng người dùng hiện tại.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm-tính-một-mình): trần 50 sự kiện được kiểm khi chưa có tới 50 sự kiện**
  Người dùng thấy gì: Chưa có ca thử hồ sơ dài hơn 50 sự kiện, nên nếu giới hạn 50 bị bỏ thì bộ kiểm vẫn xanh. Người dùng có thể thấy dòng thời gian dài quá mức.
  Căn cứ: Hậu quả nhẹ, chỉ là danh sách dài hơn dự kiến, không lộ dữ liệu.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm «có mặt» trong khi hứa quan hệ): thứ tự dòng thời gian chỉ kiểm bằng phép thuộc tập**
  Người dùng thấy gì: Bộ kiểm chưa đảm bảo các sự kiện trong dòng thời gian gán đúng mốc và đúng thứ tự, nên một sự kiện gán sai giờ vẫn có thể lọt.
  Căn cứ: Nếu sai chỉ là thứ tự hiển thị lệch, không mất hay lộ dữ liệu, và người dùng đọc lại được.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm «có mặt» trong khi hứa quan hệ): pha cơ hội so như một túi giá trị, không gắn với từng lead**
  Người dùng thấy gì: Bộ kiểm chưa chắc từng cơ hội mang đúng giai đoạn của nó, nên giai đoạn bị gán lệch giữa các cơ hội vẫn có thể lọt.
  Căn cứ: Nếu sai thì chỉ hiển thị sai giai đoạn, không mất hay lộ dữ liệu, nhưng làm người dùng hiểu sai tình trạng.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên danh sách viết trước, chỉ có điểm-case): hồ sơ chỉ có một số, không kiểm nhãn và thứ tự**
  Người dùng thấy gì: Bộ kiểm chỉ thử người có một số, nên lỗi về nhãn hay thứ tự số chính và số phụ, hoặc lộ số phụ, có thể không bị bắt.
  Căn cứ: Hiện chưa thấy sai, nhưng số phụ là thông tin chủ nhà nên nếu có lỗi thì khó phát hiện; vẫn cần theo dõi.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (ma trận thiếu phần tử): danh sách theo quyền thiếu liên hệ phía khách**
  Người dùng thấy gì: Bộ kiểm chưa có người chỉ là khách, nên chưa thử được việc đầu chủ không thấy họ còn trưởng nhóm thì thấy.
  Căn cứ: Sản phẩm chưa bị sai nhưng quyền xem khách chưa được kiểm; ca này bổ sung sau cũng không muộn.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): 120 liên hệ phân trang chèn thẳng bằng SQL**
  Người dùng thấy gì: Phép thử chia trang chỉ dùng người không có số hay lead, nên chưa thử được ca một người hiện hai lần qua các trang khi có nhiều số.
  Căn cứ: Chưa thấy lỗi thật, nếu có thì chỉ là một dòng lặp lại giữa các trang, không lộ dữ liệu.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
