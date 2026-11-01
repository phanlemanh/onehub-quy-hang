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
