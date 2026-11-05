# Review findings: man-lien-he (round 4)

## Trong hợp đồng

- **Chặn «Xem thêm» về muộn còn hở trong 250 ms chờ gõ**
  AC: AC-2
  file: apps/web/src/app/(app)/contacts/vung.tsx:85
  severity: low
  source: bugs
  detail: `luotDs` tăng ngay khi effect chạy (dòng 40). Nhưng `ds` vẫn ở trạng thái 'xong' với danh sách cũ và `cursor` cũ thêm 250 ms nữa, cho tới khi hẹn giờ gọi setDs('dang-tai'). Nếu người dùng bấm «Xem thêm» trong khoảng đó, `them()` ghi nhận lượt mới, nên lượt đã khớp, rồi gọi docDanhSach với q/loai mới nhưng cursor của bộ lọc cũ. Khi lần đọc này về sau lần đọc của effect (effect không tăng lượt thêm lần nữa), `luot === luotDs.current` vẫn đúng. Lúc đó setDs ghi đè danh sách mới bằng `ds.ds` cũ (lấy từ closure) cộng trang lạc lọc, và setCursor cũng bị đè. Đây đúng là tình huống mà commit nói đã chặn. Cách sửa: tăng `luotDs` (hoặc xoá cursor, chuyển ds sang 'dang-tai') ngay khi bộ lọc đổi, hoặc so lượt cả ở effect khi kết quả về.
  rationale: AC-2 đòi lọc/gõ tên thì chỉ còn đúng liên hệ khớp và tải tiếp theo trang không trùng không sót; kẽ hở này có thể trộn trang của bộ lọc cũ vào danh sách mới.

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Lưới Liên hệ không còn đánh dấu người đang mở hồ sơ; prop `chon` khai nhưng không dùng**
  Người dùng thấy gì: Khi mở hồ sơ một người cạnh bảng, dòng của người đó không còn được tô nên khó biết đang xem ai trong danh sách dài. Dữ liệu và việc mở hồ sơ vẫn đúng.
  Căn cứ: Chỉ làm giảm sự tiện theo dõi, không mất hay lộ dữ liệu, hồ sơ mở bên cạnh vẫn ghi rõ tên người nên người dùng không bị lạc.
  file: `apps/web/src/app/(app)/contacts/danh-sach.tsx`
  severity: medium
  Đề xuất: known-limits

- **Cột Liên hệ chép lại nguyên khối markup của NavList thay vì dùng lại**
  Người dùng thấy gì: Người dùng không thấy khác biệt gì hôm nay. Về sau nếu đổi kiểu mục ở cột thứ hai mà quên một chỗ, cột Liên hệ có thể trông lệch so với các màn khác.
  Căn cứ: Không có hậu quả nào cho người dùng hiện tại, và nếu lệch thì chỉ là lệch giao diện, phát hiện bằng mắt và sửa rẻ khi đụng tới.
  file: `apps/web/src/components/shell/second-column.tsx`
  severity: low
  Đề xuất: wont-fix

- **Trên máy tính, lọc loại chỉ còn ở cột thứ hai; gập cột là mất lọc, điện thoại không có lọc Lead**
  Người dùng thấy gì: Nếu người dùng gập cột bên trái trên máy tính, họ không còn chỗ chọn loại liên hệ; trên điện thoại thì không lọc được riêng nhóm Lead. Mở lại cột hoặc dùng máy tính là lọc được.
  Căn cứ: Không mất dữ liệu và người dùng tự gỡ được bằng cách mở lại cột, còn lọc Lead trên điện thoại là nhu cầu phụ chưa được chốt nên chưa đáng sửa ngay.
  file: `apps/web/src/app/(app)/contacts/danh-sach.tsx`
  severity: low
  Đề xuất: known-limits

- **Lọc «Lead» không ra ai thì màn báo «Chưa có liên hệ nào» thay vì «không khớp»**
  Người dùng thấy gì: Khi lọc Lead mà sàn không còn lead nào, màn nói «Chưa có liên hệ nào», dễ khiến người dùng tưởng sàn trống trong khi chỉ là bộ lọc không khớp.
  Căn cứ: Gây hiểu nhầm nhẹ nhưng không mất hay lộ dữ liệu, bỏ lọc là thấy lại danh sách đầy đủ.
  file: `apps/web/src/app/(app)/contacts/danh-sach.tsx`
  severity: medium
  Đề xuất: known-limits

- **«Xem thêm» lỗi mạng thì lặng lẽ không làm gì**
  Người dùng thấy gì: Khi mạng chập chờn lúc bấm «Xem thêm», nút không có phản ứng và không báo lỗi, người dùng không biết vì sao. Bấm lại hoặc tải lại trang là xong.
  Căn cứ: Không mất hay lộ dữ liệu và người dùng tự thử lại được ngay, chỉ gây khó chịu nhẹ khi mạng yếu.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 1, đo chỉ dẫn thay vì đầu ra: «cột thứ hai: mỗi nhà có ít nhất một mục» kiểm hàm đếm soMucCot, không kiểm cột được dựng**
  Người dùng thấy gì: Hiện người dùng không gặp lỗi gì. Nhưng nếu sau này có nhà nào bị dựng cột thứ hai rỗng thì bài kiểm vẫn báo xanh nên lỗi có thể lọt tới người dùng.
  Căn cứ: Chưa có hậu quả thấy được hôm nay, rủi ro chỉ nằm ở lần đổi sau và lỗi cột rỗng sẽ lộ ra ngay khi mở màn nên sửa muộn vẫn rẻ.
  file: `apps/web/src/app/(app)/contacts/lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Thẻ Cổng Bằng chứng và trang bằng chứng cũ hơn mã ở HEAD mà vẫn mời ký (r3 · tệp đã đổi)**
  Người dùng thấy gì: Thẻ trình ký đang nói «máy đã xong» nhưng ảnh và kết quả kiểm là của bản màn Liên hệ trước lần sửa cuối. Người ký có thể ký trên bằng chứng không khớp với bản đang nằm trên nhánh.
  Căn cứ: Màn hình không hỏng và người dùng cuối không bị ảnh hưởng, chỉ có bằng chứng trình ký lệch bản; chấm và chụp lại trước khi ký là rẻ và sửa được ngay.
  file: `_acceptance/man-lien-he/card.html`
  severity: medium
  Đề xuất: known-limits

- **Trang bằng chứng nhúng ảnh của bản trước khi đổi bố cục hồ sơ (r3 · tệp đã đổi)**
  Người dùng thấy gì: Các ảnh trong trang bằng chứng chụp từ bản màn trước khi hồ sơ người được dời sang bố cục mới. Ảnh có thể trông giống nhưng chưa có lượt chụp nào chứng minh bản hiện tại giống như vậy.
  Căn cứ: Không ảnh hưởng người dùng cuối và chỉ cần chụp lại cùng lúc với việc chấm lại thẻ; hậu quả nhẹ, tự sửa được.
  file: `_acceptance/man-lien-he/evidence-page.html`
  severity: low
  Đề xuất: known-limits

- **«Thêm» lỗi mạng thì im lặng: không báo, không thử lại (r3 · tệp đã đổi)**
  Người dùng thấy gì: Khi mạng chập chờn lúc bấm «Thêm» để xem thêm liên hệ, người dùng không thấy gì xảy ra và cũng không có nút thử lại. Họ phải tự bấm lại hoặc tải lại trang.
  Căn cứ: Không mất hay lộ dữ liệu, người dùng tự khắc phục bằng bấm lại hoặc tải lại trang; lỗi nhẹ và chỉ xảy ra khi mạng lỗi.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: low
  Đề xuất: known-limits

- **Mở số thất bại (bản mã khoá khác) vẫn ghi sự kiện «mở số» vào dòng thời gian (r2)**
  Người dùng thấy gì: Khi một số điện thoại không mở được vì lỗi dữ liệu, người dùng thấy báo «chưa mở được» nhưng sổ ghi mở số và dòng thời gian của hồ sơ vẫn hiện như đã mở số.
  Căn cứ: Chỉ xảy ra với số lưu bằng khoá khác (chủ yếu dữ liệu mẫu), không làm lộ số hay mất dữ liệu, chỉ làm sổ ghi dư vài dòng; sửa sau không đắt nhưng không chặn việc phát hành.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Số không giải mã được vẫn bị ghi là đã mở số, dù người dùng không thấy số (trả 404) (r2)**
  Người dùng thấy gì: Mỗi lần bấm «Hiện số» mà số hỏng vẫn để lại một dòng «đã mở số» trong nhật ký, dù người dùng không hề thấy số; bấm thử lại thì thêm dòng giả.
  Căn cứ: Không lộ số và không mất dữ liệu, chỉ khiến nhật ký mở số dư dòng khi dữ liệu số bị hỏng, tình huống hiếm ngoài dữ liệu mẫu; ghi lại là hạn chế đã biết rồi xử lý ở đợt sau.
  file: `packages/api/src/contacts/read/store.ts`
  severity: high
  Đề xuất: known-limits

- **Lỗi giải mã bị nuốt im lặng: khoá cấu hình sai thành 'không có ba số cuối' hoặc 404, không có log (r2)**
  Người dùng thấy gì: Nếu khoá mã hoá bị cấu hình sai, màn Liên hệ chỉ lặng lẽ hiện số bị che hoặc báo không mở được, không ai phía vận hành biết có sự cố.
  Căn cứ: Không lộ dữ liệu, người dùng thấy ngay số không mở được nên tự biết có vấn đề, chỉ khó phát hiện nguyên nhân phía vận hành; thêm cảnh báo sau không đắt.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3: bài E10e so đúng một chuỗi cố định, trong khi điều nó hứa là một quan hệ («dòng lệch ấy là báo oan vì trang nằm trong ngoai_le của trang-tam») (r2)**
  Người dùng thấy gì: Người dùng cuối không bị ảnh hưởng; chỉ là bài kiểm khuôn giao diện có thể bỏ sót nếu sau này ai đó xoá ngoại lệ của trang Liên hệ.
  Căn cứ: Không đụng tới sản phẩm hay dữ liệu người dùng, và lỗi lệch khuôn thật vẫn có thể bị bắt ở các lần kiểm khác của kho; ghi lại để nâng bài kiểm sau.
  file: `_acceptance/man-lien-he/kiem-khuon-e10d.mjs`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kèm hình 2): bài chỉ thấy chuỗi href viết tay có mặt, trong khi điều hứa là liên kết cơ hội mở được hồ sơ căn (r2 · tệp đã đổi)**
  Người dùng thấy gì: Người dùng hiện mở được hồ sơ căn từ cơ hội; chỉ có nguy cơ về sau nếu cách đọc liên kết đổi mà bài kiểm không báo.
  Căn cứ: Liên kết đang chạy đúng và nếu hỏng thì người dùng chỉ thấy bảng hàng không chọn căn, tự quay lại được, không mất dữ liệu; tăng độ chặt bài test không đáng công lúc này.
  file: `apps/web/src/app/(app)/contacts/lien-he.test.ts`
  severity: low
  Đề xuất: wont-fix

- **Con trỏ trang của danh sách liên hệ không được kiểm, con trỏ sai khuôn làm API trả 500 (r1)**
  Người dùng thấy gì: Nếu ai đó tự sửa đường dẫn tải tiếp của danh sách, hệ thống báo lỗi chung thay vì báo yêu cầu sai. Người dùng bấm tải tiếp bình thường không gặp.
  Căn cứ: Chỉ xảy ra khi cố tình sửa tay đường dẫn, không mất hay lộ dữ liệu, tải lại là hết, nên ghi nhận là giới hạn đã biết.
  file: `packages/api/src/contacts/read/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Trạng thái Lead/Liên hệ tính hai cách, danh sách và hồ sơ báo khác nhau cho cùng một người (r1)**
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

- **Hồ sơ người kẹt mãi ở trạng thái đang tải khi chọn lại đúng người đang mở (r1 · tệp đã đổi)**
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

- **Tìm số ra người đọc được thì bảng vẫn báo «Không tìm thấy «<số>»» (r1 · tệp đã đổi)**
  Người dùng thấy gì: Tìm một số ra đúng người thì hồ sơ mở bên cạnh nhưng bảng bên trái lại ghi «Không tìm thấy». Hai bên nói ngược nhau.
  Căn cứ: Chỉ là thông báo gây nhầm, người dùng vẫn thấy hồ sơ đúng và gọi được, không mất dữ liệu.
  file: `apps/web/src/app/(app)/contacts/vung.tsx`
  severity: low
  Đề xuất: known-limits

- **Trạng thái Lead/Liên hệ của cùng một người khác nhau giữa danh sách và hồ sơ khi có lead gửi lại (r1)**
  Người dùng thấy gì: Với người có lead cũ đã gọi rồi gửi lại, bộ lọc «Liên hệ» xếp họ vào Liên hệ nhưng hồ sơ lại ghi «Lead». Người xem thấy hai kết quả khác nhau cho cùng một người.
  Căn cứ: Chỉ lệch ở ca hiếm, không mất hay lộ dữ liệu; gộp chung xử lý với lỗi tính dấu hai cách.
  file: `packages/api/src/contacts/read/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình 5 (tuyên ma trận, chỉ có điểm-case): bảng vai «dùng chung cho ba đường» thiếu đường hồ sơ, thiếu dòng và không đếm dòng ở E3 (r1)**
  Người dùng thấy gì: Bộ kiểm hiện không thử đủ các vai trên đường xem hồ sơ, nên nếu sau này người đã mất vai Đầu chủ hay telesales xem được hồ sơ thì không có gì báo đỏ.
  Căn cứ: Hiện sản phẩm chưa bị sai, nhưng lỗi quyền về sau sẽ lọt qua không ai thấy, và bổ sung ca kiểm bây giờ rẻ hơn nhiều so với sau khi lộ.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: high
  Đề xuất: new-contract

- **Hình 4 (âm-tính-một-mình): «không có sự kiện đổi giá đáy» là phép quét không bao giờ đỏ được (r1)**
  Người dùng thấy gì: Phép kiểm dòng thời gian không lộ giá đáy chưa chứng minh được là nó bắt được lỗi, vì chưa có ca nào thật sự đưa giá đáy vào.
  Căn cứ: Sản phẩm chưa bị sai nhưng lớp bảo vệ giá đáy chưa được thử; không ảnh hưởng người dùng hiện tại.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 4 (âm-tính-một-mình): trần 50 sự kiện được kiểm khi chưa có tới 50 sự kiện (r1)**
  Người dùng thấy gì: Chưa có ca thử hồ sơ dài hơn 50 sự kiện, nên nếu giới hạn 50 bị bỏ thì bộ kiểm vẫn xanh. Người dùng có thể thấy dòng thời gian dài quá mức.
  Căn cứ: Hậu quả nhẹ, chỉ là danh sách dài hơn dự kiến, không lộ dữ liệu.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm «có mặt» trong khi hứa quan hệ): thứ tự dòng thời gian chỉ kiểm bằng phép thuộc tập (r1)**
  Người dùng thấy gì: Bộ kiểm chưa đảm bảo các sự kiện trong dòng thời gian gán đúng mốc và đúng thứ tự, nên một sự kiện gán sai giờ vẫn có thể lọt.
  Căn cứ: Nếu sai chỉ là thứ tự hiển thị lệch, không mất hay lộ dữ liệu, và người dùng đọc lại được.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 3 (kiểm «có mặt» trong khi hứa quan hệ): pha cơ hội so như một túi giá trị, không gắn với từng lead (r1)**
  Người dùng thấy gì: Bộ kiểm chưa chắc từng cơ hội mang đúng giai đoạn của nó, nên giai đoạn bị gán lệch giữa các cơ hội vẫn có thể lọt.
  Căn cứ: Nếu sai thì chỉ hiển thị sai giai đoạn, không mất hay lộ dữ liệu, nhưng làm người dùng hiểu sai tình trạng.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (tuyên danh sách viết trước, chỉ có điểm-case): hồ sơ chỉ có một số, không kiểm nhãn và thứ tự (r1)**
  Người dùng thấy gì: Bộ kiểm chỉ thử người có một số, nên lỗi về nhãn hay thứ tự số chính và số phụ, hoặc lộ số phụ, có thể không bị bắt.
  Căn cứ: Hiện chưa thấy sai, nhưng số phụ là thông tin chủ nhà nên nếu có lỗi thì khó phát hiện; vẫn cần theo dõi.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 5 (ma trận thiếu phần tử): danh sách theo quyền thiếu liên hệ phía khách (r1)**
  Người dùng thấy gì: Bộ kiểm chưa có người chỉ là khách, nên chưa thử được việc đầu chủ không thấy họ còn trưởng nhóm thì thấy.
  Căn cứ: Sản phẩm chưa bị sai nhưng quyền xem khách chưa được kiểm; ca này bổ sung sau cũng không muộn.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình 2 (fixture viết tay đúng khuôn bên đọc): 120 liên hệ phân trang chèn thẳng bằng SQL (r1)**
  Người dùng thấy gì: Phép thử chia trang chỉ dùng người không có số hay lead, nên chưa thử được ca một người hiện hai lần qua các trang khi có nhiều số.
  Căn cứ: Chưa thấy lỗi thật, nếu có thì chỉ là một dòng lặp lại giữa các trang, không lộ dữ liệu.
  file: `packages/api/test-db/man-lien-he.test.ts`
  severity: low
  Đề xuất: known-limits

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
