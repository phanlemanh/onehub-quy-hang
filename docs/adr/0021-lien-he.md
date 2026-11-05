# ADR-0021: Liên hệ — mỗi người làm việc với sàn là một liên hệ theo RESO Contacts

Ngày: 2026-11-01 · Trạng thái: **accepted** (Manh Phan duyệt Cổng Phạm vi hồ sơ `lien-he` 01/11, Hỏi-1..4 theo khuyến nghị,
Hỏi-5 chọn theo định nghĩa Keller Williams; duyệt kế hoạch 01/11) · Liên quan: Tham chiếu §4, §15; ADR-0010 (lớp trường
nguồn), ADR-0012 (ô nhận lead), ADR-0013 (mã hoá số chủ), ADR-0018 (sổ điểm biến thiên), ADR-0020 (lead bốn nấc); hàng 85
của lộ trình; hàng 86 (liên hệ khách), 47 (trường riêng), 42 (Hôm nay của trưởng nhóm), 33 (hồ sơ của đầu khách)

## Bối cảnh

Tham chiếu §4 khai «Chủ nhà» là một người — các căn của người đó, một chủ nhiều căn → một đầu chủ. Hàng 11 dựng «chủ nhà
của hàng» (mỗi hàng một dòng), hàng 24 dựng lead mang số riêng; không bản ghi nào nói hai thứ là một người. Hệ quả đo được
ở hàng 24, 25, 27: chủ trùng so dấu vết trên hai bảng, «Lên bảng» phải đoán (ADR-0020), gửi lại thành người khác, chủ hai
số thành hai người. Chuẩn ngành: RESO `Contacts` (`ContactType` nhiều giá trị, `OwnerMemberKey`, `OtherPhone`,
`ContactListings`); Keller Williams Command: lead và contact là cùng một bản ghi con người, giao dịch là Opportunity.

## Quyết định

1. **Liên hệ** (`contacts`) là một người của sàn: tên, loại (`Seller · Landlord · Buyer · Tenant`, nhiều loại trên một
   người), người giữ (một đầu chủ, RESO `OwnerMemberKey` — KW Assignee; sàn là Owner), chỗ trường riêng giữ rỗng.
2. **Số của liên hệ** (`contact_phones`): bản mã + dấu vết theo sàn (ADR-0013), nhãn `Home · Mobile · Work · Other`, một số
   chính. Một dấu vết chỉ thuộc một liên hệ trong sàn. Bản mã chuyển từ dữ liệu cũ chép nguyên kèm ngữ cảnh mã hoá gốc —
   khoá số không vào cơ sở dữ liệu nên migration không mã hoá lại được.
3. **Lớp nguồn**: liên hệ mang `Seller` hay `Landlord` trọn lớp `source` — chỉ trưởng nhóm và người giữ còn vai Đầu chủ đọc;
   chưa có người giữ thì chỉ trưởng nhóm. Telesales tạo được liên hệ qua nhập lead nhưng không đọc lại (Hỏi-4).
4. **Lead, chủ nhà của hàng gắn liên hệ**; kiểm trùng «chủ trùng» đi qua liên hệ: số → liên hệ → người giữ. «Sửa số và gửi
   lại» thêm số vào cùng người; số đã thuộc người khác thì gắn người ấy, không gộp hai liên hệ.
5. **Người giữ** đặt khi liên hệ chưa có người giữ ở các lối giao việc; giao lại hàng không tự đổi người giữ (Hỏi-3). Trả lại
   hay «Bỏ lead» mà liên hệ hết liên kết thì bỏ người giữ (giữ luật «số đã trả không neo chủ nhà», ADR-0020).
6. **Hàng tạo từ lead** (`POST /api/v1/leads/{id}/listing`) nối qua bảng `lead_listings` — bảng hàng chỉ mang cột tính từ sự
   kiện (ADR-0008). **«Lên bảng» là dữ kiện**: lần đầu hàng mang mã lead sang Sẵn sàng bán; suy theo dấu vết số bỏ hẳn (Hỏi-2).
7. **Trạng thái Lead/Liên hệ** (KW): liên hệ là «lead» tới khi một lead của họ có cuộc gọi đầu hay họ đã có hàng; suy từ dữ
   kiện, không cột lưu. Bản ghi lead của Quỹ hàng là cơ hội phía bán ở pha đầu gắn liên hệ (Hỏi-5).
8. **Chuyển dữ liệu cũ** (Hỏi-1): gộp theo dấu vết số trong từng sàn; người giữ là đầu chủ có mốc gán hay chia mới nhất;
   danh sách liên hệ gộp từ nhiều đầu chủ cho trưởng nhóm (`app.lien_he_gop_nhieu_dau_chu`). Cột số cũ giữ nguyên từng
   byte — gỡ gộp được.

## Mục chờ cho hàng 47

ADR-0018 quyết định 8 cấm lớp `source` cho bảng định nghĩa trường riêng. Trường riêng theo loại liên hệ của liên hệ chủ nhà
mang lớp nguồn — hàng 47 phải nới quyết định ấy có chủ đích (quyết định mới, chủ kho duyệt). Hàng 85 chỉ dựng chỗ
(`contacts.custom`, ràng buộc giữ rỗng), không nới.

## Hệ quả

- Hàng tạo từ lead chưa có số trên chủ nhà của hàng: «Mở số» báo chưa có số tới khi đầu chủ ghi chủ nhà, dù liên hệ có số.
- `listing_owners` còn giữ tên, số theo từng hàng cạnh liên hệ; dời hẳn sang bảng nối theo RESO `ContactListings` là việc sau.
- Chữ «liên hệ» nay là đối tượng; nút «Liên hệ đầu chủ» trên hồ sơ của đầu khách (hàng 33) va chữ — hàng 33 hỏi đổi nhãn.
- Liên hệ khách (Người mua, Người thuê gắn Lần gửi, lịch xem) là hàng 86; nguồn lead, quan hệ giữa liên hệ, thẻ là hàng sau.

## Sửa đổi 03/11 — liên hệ khách (hàng 86)

Manh Phan duyệt Cổng Phạm vi hồ sơ `lien-he-khach` 03/11, Hỏi-1..7 theo khuyến nghị. Migration `021`.

1. **Khách là liên hệ** mang `Buyer` hay `Tenant`; không bảng người thứ hai. Việc của một đầu khách với một khách là một
   **nhu cầu khách** (`prospects`, RESO `Prospecting`): liên hệ, đầu khách giữ, tên khách đầu khách gõ, Mua · Thuê · Cả
   hai, tiêu chí theo tên trường RESO (`SavedSearch`).
2. **Người giữ liên hệ không phải đầu khách.** Liên hệ khách mới không có người giữ; người giữ vẫn là của phía chủ nhà
   (quyết định 5) — kiểm trùng lead đi qua nó, nên đặt đầu khách vào đó thì lead sau của cùng người chia nhầm về đầu khách.
3. **Đầu khách không đọc liên hệ.** Đầu khách làm việc qua bản xem nhu cầu khách — không số, không mã liên hệ; liên hệ vừa
   khách vừa chủ trọn lớp nguồn (quyết định 3). Tạo nhu cầu bằng số của chủ nhà trả cùng một thân như số mới; thêm số đã
   thuộc liên hệ khác báo 409 một thân cho mọi liên hệ (Hỏi-6: đầu khách biết số ấy đã có trong sàn).
4. **Lần gửi gắn nhu cầu khách** (khách riêng) hay không gắn (nhóm môi giới); người gửi là chỗ ghi công và không đổi khi
   trưởng nhóm chuyển nhu cầu sang đầu khách khác; chỉ căn đã lên bảng, tối đa 30 (Hỏi-7). Phần ra trang khách là phong bì
   của lõi (`@quy-hang/core/sharing`): mã link, khán giả, căn, người gửi.
5. **Lịch xem** khi dựng gắn nhu cầu khách (Hỏi-4: chưa dựng, chờ phỏng vấn đầu khách — Tham chiếu §13).
6. **Còn nhu cầu khách đang mở** thì liên hệ giữ loại khách tương ứng; đóng nhu cầu (đầu khách giữ, trưởng nhóm) rồi mới
   bỏ được.
7. Nhu cầu khách mở ghi sự kiện `inquiry_received` («khách hỏi») — mốc đầu của số đo «khách hỏi → gửi được căn».

## Sửa đổi 05/11 — đổi đầu chủ hàng loạt (hàng 89)

Hồ sơ `_acceptance/doi-dau-chu-hang-loat/` (chủ kho chọn làm ở Cổng Đáng 02/11, duyệt phạm vi 05/11). Điểm 5 ở trên giữ
nguyên làm sử cho lối giao lại cũ; điều đang đúng cho lối mới:

1. **Đổi đầu chủ hàng loạt** (trưởng nhóm, trên Bảng hàng) giữ luật một chủ một đầu chủ: mọi căn khác có cùng liên hệ
   chủ nhà đi theo, và người giữ của liên hệ chủ nhà đổi sang đầu chủ mới trong cùng một giao dịch
   (`app.reassign_listing_agents`, migration 027). Mỗi lần đổi ghi người giữ cũ của từng căn và từng liên hệ.
2. **Hoàn tác** một lần: trả người giữ cũ cho căn và liên hệ còn đang do người nhận giữ. Căn hay liên hệ đã đổi tiếp sau
   đó thì giữ nguyên. Căn trước chưa có đầu chủ giữ người nhận, và liên hệ cùng chủ nhà với căn ấy cũng giữ người nhận
   (bảng gán chỉ thêm dòng — Hỏi-2).
3. **Lối gán một căn** (`PUT /listings/{id}/listing-agent`) giữ nguyên hành vi cũ ở điểm 5 (Hỏi-1). Lệch một chủ hai đầu
   chủ do lối này vẫn hiện ở danh sách liên hệ nhiều đầu chủ của trưởng nhóm.

## Sửa đổi 05/11 — ba lớp theo Keller Williams (hàng 103)

Manh Phan chọn «Áp ba lớp» 05/11, ở phần khám phá của hàng 103 (`_acceptance/man-lien-he/lead-va-lien-he.md`). Dữ liệu và
migration không đổi; đổi nghĩa và chữ trên màn.

1. **Lead là dấu trên người, một nghĩa duy nhất**: liên hệ chưa nói chuyện hai chiều (KW «Mark as Lead», RESO
   `ContactType = Lead`). Vẫn suy bằng máy theo quyết định 7. Lead không bao giờ hiện trên Bảng hàng.
2. **Việc với một người là một Cơ hội** (KW Opportunity), bốn loại: Bán `Listing` · Cho thuê `Landlord` (phía chủ) và Mua
   `Buyer` · Thuê `Tenant` (phía khách). Pha theo KW: Cultivate → Appointment → Active → Under Contract → Closed.
3. **Cơ hội phía chủ là bản ghi telesales hay đầu chủ nhập** (bảng `leads`, giữ tên mã): Đã gửi, Đã nhận thuộc Cultivate;
   Đã gọi thuộc Appointment; Lên bảng mở Active. Sau Lên bảng, pha đọc từ trạng thái hàng (Đang giao dịch → Under Contract,
   Đã bán / Đã thuê → Closed).
4. **Cơ hội phía khách là nhu cầu khách** (`prospects`, sửa đổi 03/11); lịch xem khi dựng thuộc Appointment.
5. **Hàng** là căn trên Bảng hàng, sinh khi cơ hội bán Lên bảng; Bảng hàng giữ nguyên là trung tâm của Quỹ hàng.
6. Nút «+ Lead» giữ chữ: nhập lead là thêm một người mang dấu Lead kèm một cơ hội phía chủ. Nhãn pha trên màn và chữ «Lead
   của tôi» chốt ở Cổng Phạm vi hàng 103.
7. Chưa đổi: «Sửa số và gửi lại» vẫn tạo bản ghi mới (ADR-0020 quyết định 4); nấc nuôi người (Met / Haven't Met) là hàng sau.
