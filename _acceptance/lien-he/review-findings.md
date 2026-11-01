## Trong hợp đồng

(không có)

## Ngoài hợp đồng — người quyết ở Gate 2

Các lỗi dưới đây nằm ngoài phạm vi đã duyệt ở Cổng Phạm vi và CHƯA qua bác bỏ đối kháng — người quyết, máy không sửa và không chấm thứ máy không được sửa.

- **Bảng mới lead_listings thiếu ca cách ly giữa công ty trong isolation.test.mjs**
  Người dùng thấy gì: Chưa có bài kiểm tự động nào chứng minh sàn này không đọc hay ghi chéo được dữ liệu nối lead với hàng của sàn khác. Nếu luật cách ly bị hỏng về sau, sẽ không có gì báo.
  Căn cứ: Hiện chưa có lỗi thật nào lộ ra và khách không thấy gì, nhưng đây là lưới an toàn cách ly giữa các công ty nên nên bổ sung sớm bằng một việc nhỏ riêng.
  file: `packages/db/tests/isolation.test.mjs`
  severity: medium
  Đề xuất: new-contract

- **lead_listings cho vai API chèn thẳng, chỉ kiểm created_by, bỏ qua luật của app.lead_for_listing**
  Người dùng thấy gì: Luật chỉ đầu chủ của lead mới tạo hàng từ lead hiện do tầng API giữ, không do cơ sở dữ liệu giữ. Nếu sau này có đường ghi khác bỏ qua API, số đo ngày lead lên bảng có thể bị ghi sai.
  Căn cứ: Người dùng đi qua API hiện nay không bị ảnh hưởng, và không có đường ghi nào khác đang tồn tại, nên chỉ cần ghi lại như một giới hạn đã biết.
  file: `packages/db/migrations/016_lien_he.sql`
  severity: medium
  Đề xuất: known-limits

- **Trạng thái «Lead / Liên hệ» của một liên hệ đổi theo người xem, vì được đếm dưới luật đọc theo dòng của leads và listing_owners**
  Người dùng thấy gì: Cùng một liên hệ có thể hiện là «lead» với người này và «liên hệ» với người khác, vì mỗi người chỉ đếm được phần hàng và lead mình thấy. Hiện chưa có màn nào hiện trạng thái này cho người dùng.
  Căn cứ: Chưa có màn hiển thị nên chưa ai thấy sai, và sửa được trước khi làm màn liên hệ; ghi lại để việc làm màn xử lý.
  file: `packages/api/src/contacts/store.ts`
  severity: medium
  Đề xuất: known-limits

- **Hàng tạo từ lead làm GET chủ nhà trả ownerName null, trái với khuôn API và kiểu của lõi**
  Người dùng thấy gì: Với hàng được tạo từ lead, màn hay bên gọi xem chủ nhà sẽ nhận tên trống thay vì báo «chưa có chủ nhà». Bên nhận có thể hiển thị lỗi hoặc ô trống khó hiểu.
  Căn cứ: Không mất dữ liệu và tự hết khi đầu chủ điền tên, nhưng trả sai khuôn đã hứa nên cần một việc sửa nhỏ riêng trước khi có màn dùng.
  file: `packages/api/src/owners/store.ts`
  severity: medium
  Đề xuất: new-contract

- **Trạng thái Lead/Liên hệ của GET contact đọc qua luật dòng của hàng và lead, nên người giữ có thể nhận sai «lead»**
  Người dùng thấy gì: Sau khi trưởng nhóm giao lại hàng hay lead, người giữ liên hệ có thể thấy liên hệ vẫn là «lead» dù đã có hàng hoặc đã gọi lần đầu. Hiện chưa có màn hiện trạng thái này.
  Căn cứ: Chỉ sai nhãn trạng thái, không mất hay lộ dữ liệu, và chưa có màn nào hiện nên chưa ai gặp; gộp xử lý với việc cùng gốc.
  file: `packages/api/src/contacts/store.ts`
  severity: low
  Đề xuất: known-limits

- **Hình dạng 5 (tuyên quét lớp nhưng chỉ là điểm-case): dòng «lead có mốc gọi nhưng đã trả lại» chỉ là bản sao của dòng 2**
  Người dùng thấy gì: Bài kiểm trạng thái liên hệ đếm là bốn trường hợp nhưng thật ra chỉ có ba, nên nếu sau này logic sai ở trường hợp lead đã trả lại thì bài kiểm vẫn xanh. Người dùng không thấy ngay.
  Căn cứ: Chỉ làm yếu lưới kiểm chứ chưa gây lỗi cho người dùng, và thêm ca sau rất rẻ.
  file: `packages/core/src/contacts/contacts.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 3 (kiểm chuỗi có mặt trong khi lời hứa là quan hệ): mục RESO và câu ADR chỉ được kiểm bằng includes rời từng chữ**
  Người dùng thấy gì: Bài kiểm tài liệu chỉ kiểm các chữ có mặt, nên nếu bảng đối chiếu RESO ghép nhầm cặp thì vẫn qua. Người dùng cuối không bị ảnh hưởng, chỉ có nguy cơ tài liệu tham chiếu sai không ai biết.
  Căn cứ: Chỉ là tài liệu nội bộ, đọc lại là thấy và sửa được ngay, không ảnh hưởng dữ liệu hay khách.
  file: `packages/core/src/contacts/contacts.test.ts`
  severity: medium
  Đề xuất: known-limits

- **Hình dạng 5 (điểm-case thay cho "từng dòng") kèm phép kiểm vòng tròn: ngữ cảnh mã hoá gốc chỉ được ghim ở một dòng contact_phones**
  Người dùng thấy gì: Bài kiểm chuyển dữ liệu cũ chỉ ghim đúng cách mã hoá số ở một dòng, nên nếu có dòng khác bị mã hoá lại sai thì có thể không bị bắt. Hậu quả xấu nhất là «Mở số» không đọc ra được số của chủ nhà đó.
  Căn cứ: Chưa có lỗi thật, nhưng chuyển dữ liệu cũ khó đảo nên nên cân nhắc thêm ca kiểm từng dòng trước khi chạy trên sàn thật.
  file: `packages/api/test-db/lien-he-chuyen.test.ts`
  severity: high
  Đề xuất: known-limits

## Chưa adversarial-verify (refuter chết)

Cụm ngoài vùng phủ: cluster: n-a (không đo được — không eval nào khai paths, hoặc dưới ngưỡng cụm).
