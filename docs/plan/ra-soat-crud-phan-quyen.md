# Rà soát tạo · xem · sửa · gỡ và quyền theo vai (05/11)

Đây là bản đề xuất, chưa phải điều đang đúng. Máy soát trên `main` `d98ea15c` (05/11), đọc mã thật ở bốn lớp: API
(`packages/api/src`), luật theo dòng (`packages/db/migrations`), lõi (`packages/core/src`) và màn
(`apps/web/src/app/(app)`). Tài liệu không ghi `docs/plan/lo-trinh.json`, không mở ô cơ hội, không sửa mã. Hàng lộ trình
ở mục 6 là đề xuất để chủ kho chọn.

Câu hỏi: mỗi hạng mục nghiệp vụ đã đủ tạo, xem, sửa, gỡ chưa, và mỗi thao tác cho vai nào.

## Trả lời ngắn

- **Bốn chỗ hở giám sát nêu đều đúng**, kể cả chỗ «chưa rõ». Hàng tạo nhầm chỉ gỡ được qua hoàn tác lần nhập. Lead nhập
  sai không sửa được. Liên hệ trùng không gộp, không ẩn được. Vùng không đổi tên, không xoá được. Tiêu chí nhu cầu khách
  không sửa được: API không có lối, màn cũng không.
- **Chỗ nặng nhất là chỗ giám sát chưa nêu: sửa hàng không kiểm vai.** Ai đọc được một hàng «Toàn sàn» thì đổi được
  giá và trạng thái qua API, kể cả Telesales và Quản trị sàn. Hai vai này không có nhà Bảng hàng. Luật 21 viết
  «telesales không thấy hàng», nhưng API vẫn cho họ đọc và sửa.
- **Thao tác có ở API mà màn chưa có lối:** đóng nhu cầu khách, chuyển nhu cầu khách, ghi chủ nhà cho hàng, sửa loại liên
  hệ. Không có trường hợp ngược lại, tức màn hiện nút mà API từ chối, trừ hai nút nhỏ ghi ở mục 5.
- **Phần chỉ thêm là đúng thiết kế, không phải chỗ hở**: sự kiện của hàng, Lần gửi (chỉ tắt link), lần xuất, nhật ký cấu
  hình, vết mở số. Ngành cũng giữ vết như vậy, xem mục 4.

Ký hiệu cho cả hai bảng:

- **Vai**: TS là Telesales, ĐC là Đầu chủ, ĐK là Đầu khách, TN là Trưởng nhóm, QT là Quản trị sàn.
- **✓** là có. **✗** là không có.
- **✓ mình** là chỉ trên bản ghi của chính người ấy. Điều kiện ghi ở cột căn cứ.
- **«API»** là API cho làm nhưng màn chưa có lối.
- Căn cứ ghi `tệp:dòng`. Viết tắt `NNN:dòng` là migration `packages/db/migrations/NNN_*.sql`. Mọi đường API tính từ
  `packages/api/src/`, mọi đường màn tính từ `apps/web/src/app/(app)/`.

## 1. Bảng một: hạng mục × tạo · xem · sửa · gỡ

Mỗi ô ghi hai phần, phần đứng trước là API, phần đứng sau là màn.

| Hạng mục | Tạo | Xem | Sửa | Gỡ | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| **Hàng** (lần rao) | ✓ · ✓ qua lead, nhập file | ✓ · ✓ | ✓ · ✓ sửa trên ô, hàng loạt, hồ sơ, cuộc gọi | **Chỉ qua hoàn tác lần nhập** · như API | «Ngừng hẳn» là nấc cuối, không phải gỡ: buộc một trong ba lý do (chủ đã bán nơi khác, chủ đổi ý, không liên lạc được) và hàng vẫn nằm trong danh sách, số liệu. **Hở G2** |
| **Ảnh căn** | ✓ · ✓ | ✓ · ✓ | ✓ đổi ngăn, bìa, thứ tự, che vùng · ✓ | ✓ gỡ mềm · ✓ | Đủ |
| **Chủ nhà của hàng** | ✓ · ✗ (vào qua lead, nhập file) | ✓ · ✓ qua Liên hệ, màn gọi | «API» | ✗ (dòng gán chỉ thêm) | Mở số ✓ · ✓, mỗi lần một vết. Sửa chủ nhà nay đi qua liên hệ (G3) |
| **Lead** (cơ hội phía chủ) | ✓ · ✓ | ✓ · ✓ | **✗ · ✗** | Bỏ: chỉ lead trùng căn | Nhận, gọi, trả lại, giao lại là chuyển nấc, không phải sửa. «Sửa số và gửi lại» chỉ mở khi lead bị trả lại và tạo lead mới. **Hở G4** |
| **Liên hệ** | ✗ · ✗ (sinh từ lead, nhập file, nhu cầu khách) | ✓ · ✓ | Chỉ loại liên hệ «API» · ✗ | **✗ · ✗** | Không sửa tên hay số, không gộp, không ẩn, không xoá. Người giữ chỉ đổi kèm «Đổi đầu chủ». **Hở G3** |
| **Nhu cầu khách** | ✓ · ✓ «Khách mới» ở màn Gửi | ✓ · ✓ | **Tiêu chí ✗ · ✗.** Chuyển người giữ «API» | Đóng «API», không mở lại | **Hở G5** |
| **Lần gửi** | ✓ · ✓ | ✓ · ✓ | ✗ (đúng thiết kế) | Tắt link ✓ · ✓, không bật lại | Đủ theo thiết kế: Lần gửi là chỗ ghi công |
| **Lịch xem** | — | — | — | — | Chưa dựng, chờ phỏng vấn (chân trời H1) |
| **Lần nhập** | ✓ · ✓ | 10 lần gần nhất của mình · ✓ | — | Hoàn tác ✓ · ✓ | Đủ |
| **Mẫu nhập** | Tự học từ lần nhập | ✓ · ✗ (trang tạm) | ✗ · ✗ | ✗ · ✗ | Hàng 50 đã giữ việc này, xem G8 |
| **Lần xuất** | ✓ · ✓ | ✗ · ✗ | — | — | Chỉ ghi nhật ký, không ai đọc lại. Thấp, G10 |
| **Thành viên** | ✓ · ✓ | ✓ · ✓ | ✓ vai, vùng, mật khẩu tạm · ✓ | ✓ · ✓ | Đủ. Sàn luôn còn một quản trị |
| **Vùng** | ✓ · ✓ | ✓ · ✓ | **✗ · ✗** | **✗ · ✗** (chỉ bỏ gắn vùng khỏi người) | **Hở G6** |
| **Cấu hình: chia lead, hàng đợi** | — | ✓ · trang tạm | ✓ · trang tạm | — | Hàng 48 đang làm (dãy D) |
| **Cấu hình: cách gọi, trạng thái riêng, trường riêng, thuế phí** | — | — | — | — | Hàng 45, 46, 47, 49 mới có ô cơ hội. Xem G9 |
| **Đổi đầu chủ hàng loạt** | ✓ · ✓ | ✓ · ✓ hộp hỏi | — | Hoàn tác ✓ · ✓ (một lần) | Đủ |
| **Góc nhìn đã lưu** | trên máy · ✓ | trên máy · ✓ | trên máy · ✓ | trên máy · ✓ | Góc nhìn của đội để hàng sau, theo quyết định 31/10 |
| **Máy, thông báo đẩy** | ✓ · ✓ | ✓ · ✓ | — | Báo mất máy ✓ · ✓; gỡ từng máy ✗ | Gỡ từng máy để sau, theo quyết định 03/11 |

## 2. Bảng hai: thao tác × vai

| Thao tác | TS | ĐC | ĐK | TN | QT | Căn cứ |
| --- | --- | --- | --- | --- | --- | --- |
| Xem hàng «Toàn sàn» | **«API»** | ✓ | ✓ | ✓ | **«API»** | `listings/routes.ts:116,141` lọc bằng `core/visibility/index.ts:44-49`, không xét vai. Nhà Bảng hàng ở `core/navigation.ts:61-67`. **Lệch luật 21** |
| Xem hàng «Chỉ tôi» | ✓ mình | ✓ mình | ✓ mình | ✗ | ✗ | `visibility/index.ts:44-49`: người tạo hay đầu chủ giữ căn. Đúng quyết định 31/10 |
| Tạo hàng thẳng | «API» | «API» | «API» | «API» | «API» | `listings/routes.ts:74-83`, `listings/store.ts:170`, không xét vai. Màn chỉ tạo hàng qua lead hay nhập file |
| Sửa giá, phí, trạng thái hàng «Toàn sàn» | **«API»** | ✓ | ✓ | ✓ | **«API»** | `listings/store.ts:185-244` không xét vai. Luật theo dòng chỉ cách ly công ty (`004:78-82`). Màn không lọc vai (`inventory/bang-hang.tsx:193,534`). **Hở G1** |
| Đưa lên «Đang bán» | «API» | ✓ giữ căn, hoặc căn chưa ai giữ | **✓ qua ô Trạng thái** | ✓ | «API» | Nút «Sẵn sàng bán» theo cờ `core/access/lop-phu-ho-so.ts:11-15`. Nhưng ô Trạng thái của bảng và API nhận `Active` từ mọi người đọc được hàng (`inventory/cell-edit/lenh.ts:164`, `listings/store.ts:215-224`). **Lệch API và màn, G1** |
| Gắn mã căn (một lần) | «API» | ✓ | ✓ | ✓ | «API» | `listings/store.ts:207,226-230`. Màn `units/ho-so/o-ma-can.tsx:86`, không lọc vai |
| Gỡ hàng tạo nhầm | ✗ | ✓ mình, chỉ qua hoàn tác lần nhập | ✗ | ✓ mình, như ĐC | ✗ | `listings/store.ts:200` từ chối `voided` ở lối thường. `imports/undo/store.ts:41-44,126-127`. **Hở G2** |
| Xem chủ nhà, mở số chủ | ✗ | ✓ giữ căn | ✗ | ✓ | ✗ | `006:76-91`, `core/access/can-see-source.ts:7-10`, `owners/store.ts:67-72` |
| Ghi chủ nhà | ✗ | ✓ giữ căn, hoặc căn chưa ai giữ | ✗ | ✓ chỉ căn đã có người giữ | ✗ | `owners/store.ts:82-90`, `006:113-118`. Màn không có lối |
| Gán đầu chủ (một căn, hàng loạt, hoàn tác) | ✗ | ✗ | ✗ | ✓ | ✗ | `owners/store.ts:154`, `listings/doi-dau-chu.ts:74,91,111`, `027:57,103,160` |
| Tải, sửa, gỡ ảnh | ✗ | ✓ giữ căn | ✗ | ✓ | ✗ | `photos/store.ts:64,73,116,151`, `012:29-38` |
| Xem ảnh ngăn Gửi được / Nội bộ | ✓ / ✗ | ✓ / ✓ giữ căn | ✓ / ✗ | ✓ / ✓ | ✓ / ✗ | `012:72-74` |
| Nhập lead | ✓ | ✓ | ✗ | ✓ | ✗ | `leads/store.ts:59-71`, `core/navigation.ts:69-76` |
| Xem lead | ✓ mình nhập | ✓ mình nhập, mình được giao | ✗ | ✓ | ✗ | `leads/store.ts:181,241`, `today/store.ts:136,157`, `007:44-49` |
| Sửa lead | ✗ | ✗ | ✗ | ✗ | ✗ | Vai của API không có quyền sửa bảng lead (`007:52-56`). **Hở G4** |
| Bỏ lead | ✓ mình nhập, chỉ lead trùng căn | như TS | ✗ | như TS | ✗ | `016:431-451`. Màn `leads/new/o-lead.tsx:462-482`, chỉ ngay sau khi gửi |
| Nhận, ghi gọi, trả lại lead | ✗ | ✓ được giao | ✗ | ✗ | ✗ | `011:369`, `023:8`, `016:235-256`. API chỉ xét «được giao»; người được giao luôn mang vai ĐC lúc chia (`016:312`) |
| Tự nhận lead ở kho chung | ✗ | ✓ toà mình phụ trách | ✗ | ✗ | ✗ | `routing/store.ts:137-143`, `016:340-341` |
| Giao lại lead | ✗ | ✗ | ✗ | ✓ | ✗ | `016:374-375`. Màn `today/truong-nhom.tsx:83` |
| Sửa số và gửi lại | ✓ mình nhập, lead đã trả | như TS | ✗ | như TS | ✗ | `leads/store.ts:290-300` |
| Xem liên hệ | ✗ | ✓ mình giữ | ✗ | ✓ | ✗ | `016:25-29`, `contacts/read/routes.ts:39` |
| Sửa loại liên hệ | ✗ | «API» mình giữ | ✗ | «API» | ✗ | `021:283-287`. Khuôn chỉ nhận một khoá `contactTypes` (`core/contacts/index.ts:47`) |
| Sửa tên, số; gộp, ẩn, xoá liên hệ | ✗ | ✗ | ✗ | ✗ | ✗ | Vai của API chỉ đọc bảng liên hệ (`016:30`). **Hở G3** |
| Tạo nhu cầu khách | ✗ | ✗ | ✓ | ✗ (thiếu vai ĐK) | ✗ | `contacts/prospects.ts:102`, `021:127-135` |
| Xem nhu cầu khách | ✗ | ✗ | ✓ mình giữ | ✓ | ✗ | `021:33-37` |
| Sửa tiêu chí nhu cầu | ✗ | ✗ | ✗ | ✗ | ✗ | Chỉ có hai câu sửa bảng nhu cầu: đóng (`021:201`) và đổi người giữ (`021:227`). **Hở G5** |
| Đóng nhu cầu khách | ✗ | ✗ | «API» mình giữ | «API» | ✗ | `021:183-194`, `contacts/routes.ts:142`. Màn không có nút |
| Chuyển nhu cầu khách | ✗ | ✗ | ✗ | «API» | ✗ | `021:210-227`, `contacts/routes.ts:117`. Màn không có nút |
| Tạo Lần gửi | ✗ | ✗ | ✓ | ✓ chỉ cho nhóm môi giới khi không có vai ĐK | ✗ | `037:14-22`, `contacts/prospects.ts:207` |
| Xem Lần gửi, tắt link | ✗ | ✗ | ✓ mình gửi | ✓ | ✗ | `da-gui/store.ts:43`, `021:84-89`, `033:17` |
| Nhập file, hoàn tác lần nhập | ✗ | ✓ mình nhập | ✗ | ✓ mình nhập, nhập hộ một ĐC | ✗ | `imports/store.ts:44,82,217-221`, `imports/undo/store.ts:41-44`, `024:29` |
| Xuất bảng hàng | ✗ | ✓ | ✗ | ✓ | ✗ | `exports/routes.ts:28,57` |
| Thành viên, vùng, cấu hình sàn | ✗ | ✗ | ✗ | ✗ | ✓ | `thanh-vien.ts:64-69,284`, `003:22-27,43`, `011:22-29`, `settings/routes.ts:76`, `routing/routes.ts:96`, `today/routes.ts:88` |
| Đọc cấu hình sàn | ✓ | ✓ | ✓ | ✓ | ✓ | `settings/routes.ts:52`, `011:21` |
| Báo nghỉ | ✓ mình | ✓ mình | ✓ mình | ✓ mọi người | ✓ mọi người | `routing/store.ts:58`, `011:82` |
| Đọc lời báo lead | ✗ | ✗ | ✗ | ✓ | ✓ khi sàn bật | `routing/store.ts:158-162`, `011:123` |

**Khách và môi giới sàn khác** không đăng nhập. Họ chỉ đọc trang khách theo mã link và ghi «Quan tâm» (`031:41,57`,
`037:45`). Dữ liệu ra ngoài dựng một chỗ ở `banRaNgoai` (`core/redaction/ban-ra.ts:162-175`); lớp nguồn không có trong
danh sách trường được ra. Lớp này không có chỗ hở trong lần soát.

## 3. Chỗ hở, xếp theo tác động

Mỗi chỗ hở được xếp theo ba câu hỏi: hỏng dữ liệu đang sống không, có lệch điều đã chốt không, và người dùng có lối
vòng không.

| # | Chỗ hở | Tác động | Loại |
| --- | --- | --- | --- |
| **G1** | **Sửa hàng không kiểm vai.** Ai đọc được hàng «Toàn sàn» đều đổi được giá, phí, trạng thái và gắn mã căn qua API, kể cả TS và QT, hai vai không có nhà Bảng hàng. Ô Trạng thái của bảng đưa được hàng lên «Đang bán», dù nút «Sẵn sàng bán» đã ẩn với ĐK. Luật theo dòng của hàng chỉ cách ly công ty | **Cao.** Giá và trạng thái sai lan ngay ra trang khách sống. Lệch luật 21 («telesales không thấy hàng») và bảng nhà theo vai ở §9. Cờ «Sẵn sàng bán» ở màn nói một đằng, API làm một nẻo | Quyền lệch Tham chiếu; lệch API và màn |
| **G2** | **Gỡ hàng tạo nhầm.** Hàng tạo từ lead hay tạo thẳng không gỡ được. «Ngừng hẳn» không có lý do «nhập nhầm», hàng vẫn ở mọi danh sách và vào số đo hai tuần thử | **Cao.** Hàng rác đứng mãi trên Bảng hàng và chặn kiểm trùng: căn đã có hàng mở thì lead mới thành tin bổ sung | Thiếu thao tác |
| **G3** | **Liên hệ trùng không gộp, không ẩn được; không sửa tên hay số.** Một người có hai số nhập ở hai lúc thành hai liên hệ. Hệ thống không có lối nào để dồn lại thành một | **Cao, tăng dần.** Kiểm trùng đi qua liên hệ (ADR-0021), nên liên hệ trùng làm «một chủ một đầu chủ» trượt: chủ thứ hai về đầu chủ khác | Thiếu thao tác |
| **G4** | **Sửa lead nhập sai.** Telesales gõ nhầm toà, giá hay nhu cầu thì không sửa được. Lead nhập nhầm mà không trùng căn cũng không bỏ được | **Trung bình.** Lead sai đi tới đầu chủ, tốn một cuộc gọi, rồi chờ trả lại | Thiếu thao tác |
| **G5** | **Nhu cầu khách: tiêu chí không sửa được.** Đóng và chuyển nhu cầu có ở API nhưng màn không có nút. Đóng rồi không mở lại được | **Trung bình.** Khách đổi ý (thêm phòng, nâng giá) thì đầu khách phải mở nhu cầu mới, Lần gửi cũ tách khỏi nhu cầu mới. Trưởng nhóm không chuyển được khách khi đầu khách nghỉ | Thiếu thao tác; API có, màn không |
| **G6** | **Vùng không đổi tên, không ngừng dùng được** | **Thấp tới trung bình.** Gõ sai tên vùng thì để mãi; vùng cũ còn trong danh sách chia lead | Thiếu thao tác |
| **G7** | **Rào ở cơ sở dữ liệu mỏng hơn API ở hai chỗ.** (1) Hàng và sự kiện hàng: luật theo dòng không xét vai (`004:23,78-82`). (2) Bảng thoả thuận: thành viên nào cũng thêm, sửa được (`001:67-71`); hiện chưa có đường API nào ghi bảng này | **Thấp hôm nay, cao khi có đường mới.** Bất biến 1 yêu cầu chặn ở kho dữ liệu, không chỉ ở API | Rào |
| **G8** | **Mẫu nhập**: sổ điểm cho ĐC, TN, QT sửa (`core/config/so.ts:112`) nhưng luật ghi cấu hình chỉ cho QT (`011:22-29`), và bảng `import_templates` mà sổ khai chưa có trong migration | **Thấp.** Hàng 50 đã giữ việc này | Lệch sổ điểm và cơ sở dữ liệu |
| **G9** | **Hàng 45, 46, 47, 49** mới có ô cơ hội. Câu giao chỉ nói «thêm», «đặt», chưa nói gỡ hay đổi một nhãn, trường, tỉ lệ đang có dữ liệu | **Thấp, nếu kịp đưa vào Cổng Phạm vi** | Thiếu câu trong câu giao |
| **G10** | Lần xuất chỉ ghi, không ai đọc lại được. Hoàn tác «Đổi đầu chủ» làm được bởi bất kỳ trưởng nhóm nào, không riêng người đã đổi (`027:160`) | **Thấp** | Ghi để biết |

**Chỗ giám sát nêu và kết quả xác minh:**

| Giám sát nêu | Kết quả | Căn cứ |
| --- | --- | --- |
| Gỡ căn tạo nhầm chỉ qua hoàn tác lần nhập | **Đúng** | `listings/store.ts:200`; màn không có nút gỡ |
| Không sửa được lead nhập sai | **Đúng.** Ngoài ra lead nhập nhầm mà không trùng căn cũng không bỏ được | `007:52-56`; `016:431-451` |
| Không gộp hay ẩn được liên hệ trùng | **Đúng.** Cũng không sửa được tên hay số | `016:30`; `contacts/routes.ts:41,54` |
| Không đổi tên hay xoá được khu | **Đúng.** Đây là «Vùng» (khu chia việc của sàn), không phải «Khu» của danh mục | `003:45`; `components/khoi/solution-users-8/zones-tab.tsx:63-71` |
| Chưa rõ: sửa tiêu chí nhu cầu khách | **Không sửa được, ở cả API và màn.** API có lối sửa nhu cầu nhưng chỉ nhận đổi người giữ, và chỉ cho TN | `core/contacts/prospects.ts:110`, `021:220` |

## 4. Đối chiếu ngành (ADR-0022)

| Nguồn | Gỡ, xoá | Gộp liên hệ | Quyền theo vai | Bài học cho Quỹ hàng |
| --- | --- | --- | --- | --- |
| **RESO Data Dictionary** | `StandardStatus` có giá trị `Delete`, nghĩa là hợp đồng chào bán không hề hợp lệ hay bị huỷ hiệu lực. Bản ghi mang `Delete` có thể không còn hiện trong luồng dữ liệu ([RESO FAQ](https://www.reso.org/knowledge-base/data-topics-faq/), định nghĩa trích lại ở [reso_dd](https://docs.rs/reso_dd/0.1.0/reso_dd/enum.StandardStatus.html), chưa tra bản gốc). `Contacts.ContactStatus` có Active, Inactive, Deleted ([ddwiki ContactStatus](https://ddwiki.reso.org/display/DDW20/ContactStatus+Field)) | Không quy định | `OwnerMemberKey` là người giữ liên hệ. RESO không định nghĩa quyền theo vai; đó là việc của từng hệ thống | «Gỡ hàng tạo nhầm» khớp nghĩa `Delete` của RESO: hàng không hề có, không phải một lần chào bán đã dừng. Quỹ hàng đã có sự kiện `voided` (cờ, không phải trạng thái thứ bảy) nên chỉ cần mở thêm lối, không thêm trạng thái. Liên hệ nên «ngừng theo dõi» (Inactive), không xoá cứng |
| **Keller Williams Command** | Liên hệ: lưu trữ trước, xoá sau, khôi phục được ([Archive, Delete, or Restore](https://answers.kw.com/hc/en-us/articles/360015701654-Archive-Delete-or-Restore-Contacts)). Cơ hội: «Mark as Lost» vào số liệu, tách với «Archive» dành cho cơ hội tạo nhầm, không vào số liệu ([Mark as Lost or Archive](https://answers.kw.com/hc/en-us/articles/360022415873-Mark-an-Opportunity-as-Lost-or-Archive-an-Opportunity)) | Máy dò cặp trùng theo tên, email, số; bấm Gộp thì dồn về liên hệ chính, tag và ghi chú cộng lại ([Merge Duplicates](https://answers.kw.com/hc/en-us/articles/17122629213459-Identify-and-Merge-Duplicate-Contacts-in-Command), [dữ liệu khi gộp](https://answers.kw.com/hc/en-us/articles/22714630416019-How-Data-is-Handled-When-Merging-Contacts-in-Command)). Ở đội, gộp là vĩnh viễn và thành viên quyền Standard chỉ gộp liên hệ mình giữ ([Team merge](https://answers.kw.com/hc/en-us/articles/22734474488211-Identify-and-Merge-Duplicate-Team-Contacts-in-Command-Teams)) | Ba nấc quyền theo ứng dụng: Standard, Enhanced, Unlimited ([Team Permission Levels](https://answers.kw.com/hc/en-us/articles/360052475813-Team-Permission-Level-Details)) | Tách «tạo nhầm» (gỡ, ngoài số liệu) với «mất» (vào số liệu) là đúng hình mà G2 và G4 cần. Người thường gộp liên hệ mình giữ, người nấc cao gộp toàn đội |
| **Follow Up Boss** | Chỉ chủ tài khoản và Admin xoá được liên hệ, và xoá không lấy lại được. Thành viên khác chỉ đưa vào stage Trash ([Deleting a Contact](https://help.followupboss.com/hc/en-us/articles/4402372098967-Deleting-a-Contact)) | Tự gộp khi trùng email, hoặc trùng số kèm họ tên; có lệnh gộp tay cho ca lẻ ([help](https://help.followupboss.com/hc/en-us/articles/11460704008855)) | Agent chỉ thấy lead được giao; vai cố định Owner, Admin, Agent, Lender ([Users, Roles & Permissions](https://help.followupboss.com/hc/en-us/articles/4402370636567-Users-Roles-Permissions)) | Người làm thường chỉ «bỏ vào thùng», việc xoá thật dồn về một vai. Agent chỉ thấy và sửa phần được giao: cùng hướng với việc chặn vai không có Bảng hàng ở G1 |

Tóm lại: cả ba nguồn đều tránh xoá cứng ở tay người làm hằng ngày. Cả hai sản phẩm đều có gộp liên hệ và giới hạn gộp theo
người giữ. Không sản phẩm nào cho một vai không làm việc với hàng sửa hàng.

## 5. Ngoài phạm vi, thấy trong lúc soát

- Hai nút «Gửi căn» trỏ tới `/inventory/cards`, ở `shares/danh-sach.tsx:68` và `today/buyer/dong-tin.tsx:86`.
  Đường này không có trang (`inventory/cards/` không có `page.tsx`), nên nhiều khả năng ra trang «không có». Bảng thẻ
  hiện ở `/inventory` dưới khổ điện thoại.
- Thanh Gửi trên bảng thẻ điện thoại (`inventory/cards/bang-the.tsx:226`) hiện cả cho ĐC, nhưng màn Gửi từ chối vai này
  (`shares/new/page.tsx:20`).
- Trang `/inventory` không chặn vai (`inventory/page.tsx:11` chỉ đòi có sàn). TS hay QT gõ thẳng địa chỉ vẫn vào được.
  Chỗ này gộp vào G1.

## 6. Đề xuất hàng lộ trình

Máy chỉ đề xuất; chưa ghi `lo-trinh.json`. Hạng T3 vì mọi hàng dưới đây đổi cơ sở dữ liệu hay rào quyền
(`_acceptance/config.yaml`). G8 và G9 không cần hàng mới: đưa vào Cổng Phạm vi của hàng 50 và các hàng 45, 46, 47, 49.

| Đề xuất | Vai | Câu giao | `bat_khi` đề xuất | Hạng |
| --- | --- | --- | --- | --- |
| **G1** `quyen-sua-hang-theo-vai` | Trưởng nhóm | Chỉ người có nhà Bảng hàng (Đầu chủ, Đầu khách, Trưởng nhóm) đọc và sửa được hàng; Telesales và Quản trị sàn chỉ thấy kết quả lead và cấu hình; đưa hàng lên «Đang bán» theo đúng cờ «Sẵn sàng bán» ở mọi lối | Bộ kiểm vai: mỗi lệnh ghi hàng (đổi giá, đổi trạng thái, gắn mã căn, tạo thẳng) gọi bằng từng vai cho ra đúng bảng kỳ vọng viết trước. Telesales và Quản trị sàn nhận «không có hàng này» ở cả API lẫn luật theo dòng. Lệnh đưa lên Đang bán từ ô Trạng thái của Đầu khách bị từ chối như nút đã ẩn | T3 |
| **G2** `go-hang-tao-nham` | Đầu chủ | Đầu chủ gỡ một hàng tạo nhầm khỏi Quỹ hàng: hàng chưa từng lên Đang bán thì người tạo tự gỡ; hàng đã lên thì trưởng nhóm gỡ kèm lý do; gỡ là sự kiện bù như hoàn tác lần nhập, lịch sử giữ, hoàn tác được trong phiên | Hàng gỡ ra khỏi Bảng hàng, Hôm nay, Đã gửi, kiểm trùng và số đo hai tuần thử; lead mới trên cùng căn không còn thành tin bổ sung; trang khách báo căn không còn; hàng có Lần gửi đang bật thì hộp hỏi kể đủ link sẽ tắt; vai khác bị từ chối ở cơ sở dữ liệu | T3 |
| **G3** `gop-lien-he-trung` | Trưởng nhóm | Trưởng nhóm gộp hai liên hệ là cùng một người, và đầu chủ gộp hai liên hệ mình giữ: số, loại, căn, lead, nhu cầu dồn về một người, chọn người giữ; người giữ sửa được tên; liên hệ không còn làm việc thì «ngừng theo dõi», không xoá | Sau gộp, kiểm trùng theo số nào của người ấy cũng ra một liên hệ và một đầu chủ; vết mở số và lịch sử của cả hai còn nguyên; gộp ghi người, vai, lúc; đầu chủ gộp liên hệ người khác giữ bị từ chối; liên hệ ngừng theo dõi không hiện ở danh sách mặc định nhưng vẫn chặn trùng số | T3 |
| **G4** `sua-lead-da-nhap` | Telesales | Telesales sửa toà, căn, nhu cầu, giá và thời gian của lead mình nhập khi lead còn «Đã gửi» chưa ai nhận, và bỏ lead nhập nhầm có ghi lý do; sau khi đầu chủ nhận thì sửa ở hàng | Mỗi lần sửa thành một vết chỉ thêm; sửa toà hay căn chạy lại kiểm trùng và chia lại theo luật của sàn; lead đã nhận thì lối sửa bị từ chối; bỏ lead nhập nhầm không tính vào số đo lead → Sẵn sàng bán | T3 |
| **G5** `sua-nhu-cau-khach` | Đầu khách | Đầu khách sửa tiêu chí, Mua · Thuê và tên khách của nhu cầu mình giữ, đóng và mở lại nhu cầu; trưởng nhóm chuyển nhu cầu sang đầu khách khác ngay trên màn | Mỗi lần sửa một sự kiện của nhu cầu; Lần gửi cũ vẫn gắn đúng nhu cầu sau khi sửa; bảng thẻ lọc theo tiêu chí mới; chuyển nhu cầu thì Lần gửi đi theo, công vẫn của người gửi; đầu khách sửa nhu cầu người khác bị từ chối | T3 |
| **G6** `doi-ten-vung` | Quản trị sàn | Quản trị sàn đổi tên vùng và ngừng dùng vùng không còn ai phụ trách; vùng ngừng dùng không nhận lead mới, lead cũ giữ nguyên | Đổi tên hiện đúng ở danh sách người dùng, kho chung và lời báo; ngừng dùng vùng còn người phụ trách bị chặn kèm danh sách người; mỗi lần đổi ghi người, vai, lúc; sàn khác không thấy | T3 |

G7 nên đi cùng G1: luật theo dòng của hàng xét vai trong cùng hàng ấy. Phần bảng thoả thuận nên vào một hàng vá riêng của
dãy nền, vì đó là bất biến 1.

## 7. Khuyến nghị

**Làm G1 trước, gộp G7 vào cùng hàng.**

Căn cứ:

- Đây là chỗ hở duy nhất hỏng dữ liệu đang sống. Giá và trạng thái sai lan thẳng ra trang khách qua link sống.
- Nó lệch điều đã chốt (luật 21; bảng nhà theo vai ở §9), nên không cần chủ kho chốt lại hướng.
- Ngành làm cùng một kiểu: Follow Up Boss chỉ cho agent thấy phần được giao, KW chia quyền theo nấc.
- G2 phụ thuộc vào nó: chưa rõ ai được sửa hàng thì cũng chưa rõ ai được gỡ hàng.

Một điều chỉ cần đọc lại, không phải câu hỏi mới: §12 ngày 31/10 ghi «hàng Toàn sàn mọi thành viên sàn sửa được». Đề
xuất G1 đọc câu ấy là «mọi thành viên có Bảng hàng», để khớp luật 21. Đầu khách vẫn sửa được như đã chốt.
