# Thiết kế — Liên hệ (hàng 85, T3)

Hàng 85 của lộ trình (dãy L, đợt `dau-chu-dong-vao`), đứng trên hàng 27 (lead bốn nấc, ADR-0020), hàng 11 (lớp trường
nguồn, ADR-0010), hàng 24 (ô nhận lead, ADR-0012), hàng 62 (mã hoá số chủ, ADR-0013). Câu giao: «Mỗi người làm việc với
sàn là một liên hệ (RESO Contacts): một người, nhiều số (bản mã + dấu vết), một hay nhiều loại liên hệ — Chủ bán, Chủ
cho thuê, Người mua, Người thuê… (ContactType) — và một người giữ; lead và hàng gắn vào liên hệ chủ nhà…». Cổng Đáng:
build (Manh Phan 01/11). Migration `016`, ADR-0021 giữ chỗ ở giám sát. Liên hệ khách (Người mua, Người thuê gắn Lần gửi,
lịch xem) là hàng 86; cơ chế định nghĩa trường riêng là hàng 47.

## 1. Đối chiếu ngành (luật thường trực S1 của đợt)

| Quỹ hàng | RESO Data Dictionary 2.0 | Keller Williams | Hiện ở kho | Lệch |
| --- | --- | --- | --- | --- |
| Liên hệ (mới) | `Contacts` — «a member's clients and other contacts»; khoá `ContactKey`; người giữ `OwnerMemberKey` (FK `Member`); tên `FullName` | Contact (danh bạ) | không có | — |
| Loại liên hệ | `ContactType` (String List, **Multi**): `Seller` «owner selling», `Landlord` «owner renting/leasing out», `Buyer`, `Tenant`, `Lead` «may be a potential buyer or seller», `Prospect`… | lead → contact sau cuộc nói chuyện hai chiều | không có | Một người nhiều loại là chuẩn (Multi) |
| Số của liên hệ | `MobilePhone`, `HomePhone`… và `OtherPhone` (nhiều số, `OtherPhoneType`, `ResourceName` + `ResourceRecordKey`); `PreferredPhone` | Primary Phone + Additional Phone, nhãn Home · Mobile · Work · Other | số nằm trên từng hàng (`listing_owners`) và từng lead (`leads`) | Một người hai số đang thành hai người |
| Chủ nhà của hàng | `ContactListings` (`ContactKey` ↔ `ListingKey`) | Opportunity đường ống Listings gắn contact | `listing_owners` — mỗi hàng một dòng tên + số | Tham chiếu §4 khai «Chủ nhà» là một người (các căn của người đó); mã dựng «chủ nhà của hàng» |
| Lead | `ContactType = Lead` (con người) | Cùng một bản ghi con người với contact: ô «Mark as Lead»; lead = ít thông tin, trao đổi một chiều; contact = đã nói chuyện hai chiều; giao dịch là Opportunity (pha Cultivate…) | bản ghi riêng, mang số riêng | Bản ghi «lead» của Quỹ hàng ứng với Opportunity pha đầu + nguồn lead; trạng thái Lead/Liên hệ của người suy từ cuộc gọi đầu — Hỏi-5 |
| Người giữ | `OwnerMemberKey` | Tài khoản nhóm: Owner (bản ghi của nhóm) ≠ Assignee (người làm việc, tạo Opportunity); Lead Pool, Lead Routing | sàn giữ bản ghi; đầu chủ là người giữ | Sàn ↔ Owner, người giữ ↔ Assignee — khớp; kho chung của hàng 25 ↔ Lead Pool |
| Nguồn gốc liên hệ | `LeadSource` («person or source that provided the contact») | lead source | không có | Ghi `created_by` thay, đủ cho hàng này |
| Trường riêng | — (RESO dùng trường chuẩn; sàn tự thêm) | custom fields của Command | ADR-0018 quyết định 8: trường riêng cho hàng, cấm lớp `source` | Liên hệ chủ nhà là lớp nguồn → mục chờ cho hàng 47 (§6) |

## 2. Hàng làm gì

1. **Liên hệ là một người của sàn.** Bảng `contacts`: tên (`full_name`, có thể trống — lead từ telesales chưa có tên),
   loại (`contact_types text[]`, giá trị RESO `Seller · Landlord · Buyer · Tenant`), người giữ (`owner_member_user_id`,
   RESO `OwnerMemberKey`), chỗ trường riêng (`custom jsonb`), người tạo, mốc.
2. **Một số → một người trong sàn.** Bảng `contact_phones`: bản mã, dấu vết (cùng hàm dấu vết theo sàn của ADR-0013),
   ngữ cảnh mã hoá, nhãn (`Home · Mobile · Work · Other` — KW, RESO `PreferredPhone`), cờ số chính, người thêm, mốc. Số đầu
   tiên của liên hệ là số chính; số chuyển từ dữ liệu cũ và số từ lead mang nhãn `Mobile`. Duy nhất `(sàn, dấu vết)`: một số chỉ thuộc một liên hệ. Một liên hệ nhiều số.
3. **Lớp nguồn.** Liên hệ mang `Seller` hay `Landlord` là chủ nhà: tên, số, loại, trường riêng đều lớp `source` (bất biến 2)
   — chỉ người giữ (còn vai Đầu chủ) và trưởng nhóm đọc; vai API không đọc được cột số; số chỉ ra qua cửa mở số có ghi sự
   kiện (đường mở số của hàng 11 giữ nguyên). Telesales tạo được liên hệ (qua nhập lead) nhưng không đọc lại được.
4. **Lead gắn liên hệ.** Nhập lead: tìm liên hệ theo dấu vết số; không có thì tạo, loại theo nhu cầu (Bán → `Seller`,
   Cho thuê → `Landlord`, Cả hai → cả hai). Lead mang `contact_id`.
5. **Chủ nhà của hàng gắn liên hệ.** Ghi chủ nhà (`PUT /listings/{id}/owner`): tìm liên hệ theo dấu vết số, không có thì tạo;
   `listing_owners` mang `contact_id`; giá đáy vẫn theo từng hàng (giá đáy của căn ấy).
6. **Kiểm trùng theo liên hệ.** Vế «chủ trùng» của `app.lead_dedupe_facts`: số → liên hệ → người giữ liên hệ. Chủ nhà hai số,
   một số trên hàng, số kia trên lead → cùng một liên hệ, cùng đầu chủ.
7. **Người giữ.** Liên hệ chủ nhà nhận người giữ khi lần đầu có đầu chủ: ghi chủ nhà của hàng (đầu chủ giữ căn), lead chủ
   trùng, nhịp chia hay trưởng nhóm giao lead. Lead trả lại mà liên hệ không còn hàng nào và lead đang mở nào khác → bỏ người
   giữ (giữ đúng luật «số đã trả không neo chủ nhà» của ADR-0020).
8. **«Sửa số và gửi lại» thêm số vào cùng người.** Lead gửi lại gắn cùng `contact_id` của lead cũ; số mới thêm vào liên hệ
   ấy (trừ khi số mới đã thuộc liên hệ khác — khi đó lead mới gắn liên hệ của số, như kiểm trùng).
9. **Hàng tạo từ lead.** `POST /api/v1/leads/{id}/listing` — đầu chủ của lead (chưa trả lại, chưa bỏ) tạo hàng: toà, căn từ
   lead; hàng mang `origin_lead_id`; chủ nhà của hàng là liên hệ của lead; đầu chủ giữ căn. «Lên bảng» thay định nghĩa:
   lần đầu hàng có `origin_lead_id` = lead (hay = lead gửi lại sau nó trong chuỗi) sang Sẵn sàng bán — dữ kiện, không suy.
10. **Lead hay Liên hệ (KW).** Bản xem của liên hệ có trạng thái `lead` (chưa nói chuyện hai chiều) hay `contact` (đã nói
    chuyện): suy từ dữ kiện — liên hệ thành `contact` khi một lead của họ có mốc gọi lần đầu, hay khi đầu chủ ghi chủ nhà của
    hàng; không cột lưu.
11. **Một người nhiều loại.** `PATCH /api/v1/contacts/{id}` (người giữ, trưởng nhóm) thêm hay bỏ loại; vẫn một liên hệ.
    `GET /api/v1/contacts/{id}` trả bản của người được xem (lõi dựng, không số). Màn liên hệ là hàng sau.
12. **Chuyển dữ liệu cũ.** Migration 016 dựng liên hệ từ `listing_owners` và `leads` hiện có, gộp theo dấu vết số trong
    từng sàn; chạy lại không đổi gì.
13. **Tài liệu.** Tham chiếu thêm mục «Tri thức ngành và RESO» (bảng §1 thành bảng thường trực); CONTEXT.md thêm «Liên hệ»,
    «Loại liên hệ», «Người giữ», sửa «Lead» theo Hỏi-5; ADR-0021.

## 3. Dữ liệu (migration 016)

- `contacts (company_id, id, full_name, contact_types text[] check ⊆ {Seller, Landlord, Buyer, Tenant} và không rỗng,
  owner_member_user_id, custom jsonb not null default '{}' check (custom = '{}'), created_by, created_at, updated_by,
  updated_at)` — luật theo dòng: đọc = sàn đang làm ∧ (trưởng nhóm ∨ người giữ còn vai Đầu chủ); không cấp ghi thẳng.
- `contact_phones (company_id, id, contact_id, phone_enc bytea, phone_hash bytea, enc_context text, phone_type, added_by,
  added_at)` — duy nhất `(company_id, phone_hash)`; vai API không đọc ba cột số; ghi qua hàm.
- `leads.contact_id`, `listing_owners.contact_id`, `listings.origin_lead_id` — khoá ngoại cùng sàn.
- Hàm security definer: `app.contact_for_phone(hash, phone_enc, enc_context, types[])` (tìm hay tạo, trả mã liên hệ, cộng
  loại), `app.set_contact_holder(contact, user)` (chỉ khi chưa có người giữ), `app.add_contact_types`,
  `app.create_listing_from_lead(lead, listing_id)`; `create or replace`: `lead_dedupe_facts` (vế chủ qua liên hệ),
  `lead_board_at_all` (theo `origin_lead_id`), `return_lead` (bỏ người giữ khi hết liên kết), `route_lead`,
  `reassign_lead`, `claim_lead` (đặt người giữ khi chưa có).
- **Bản mã chép, không giải lại.** Khoá số chỉ ở môi trường app (ADR-0013) nên migration không mã hoá lại được: dòng
  `contact_phones` chuyển từ dữ liệu cũ chép nguyên bản mã kèm `enc_context` gốc (`listing_owners:<sàn>:<hàng>` hay
  `leads:<sàn>:<lead>`); số mới dùng `contact_phones:<sàn>:<mã dòng>`. Giải mã luôn đọc `enc_context` của chính dòng.

## 4. Lõi (`packages/core/src/contacts/`)

- `CONTACT_TYPES = ["Seller", "Landlord", "Buyer", "Tenant"]`, `CONTACT_TYPE_LABELS` (Chủ bán · Chủ cho thuê · Người mua ·
  Người thuê), `typesForNeed(need)`, `isOwnerContact(types)` (mang Seller hay Landlord → lớp nguồn),
  `validateContactPatch`, `contactView(record, viewer)` (người không được xem → chỉ `{ visible: false }`; không bao giờ số).

## 5. Phương án đã cân

- **Bỏ `listing_owners`, dời hẳn sang `contact_listings`**: đúng RESO `ContactListings` hơn, nhưng đụng đường mở số, luật
  nguồn và bộ kiểm 12 ô của hàng 11, 62 cùng lúc. Chọn thêm `contact_id` vào `listing_owners`; dời hẳn là việc sau.
- **Người giữ suy từ liên kết thay vì lưu**: không bao giờ lệch, nhưng RESO có `OwnerMemberKey` là trường lưu, và kiểm trùng
  cần đọc nhanh một người. Chọn lưu, cập nhật ở đúng các hàm giao việc.
- **Giải mã lại số cũ bằng lệnh vận hành** (như `ma-hoa-lai.ts`): một ngữ cảnh duy nhất, nhưng thêm một bước vận hành phải
  nhớ chạy trước khi đọc được. Chọn chép bản mã kèm ngữ cảnh gốc.

## 6. Trường riêng — chỗ, chưa cơ chế

`contacts.custom` có mặt, ràng buộc giữ rỗng tới hàng 47. **Mục chờ cho hàng 47 (ghi ở ADR-0021):** ADR-0018 quyết định 8
cấm lớp `source` cho bảng định nghĩa trường riêng; trường riêng của liên hệ chủ nhà mang lớp nguồn — hàng 47 phải nới có
chủ đích (quyết định mới, chủ kho duyệt), hàng 85 không nới.

## 7. Câu chỉ người có

- **Hỏi-1 — dữ liệu cũ gộp thế nào khi hai hàng (hay hàng và lead) cùng số mà khác đầu chủ**: khuyến nghị gộp thành một
  liên hệ, người giữ là đầu chủ có lần gán hay lần chia mới nhất, và in danh sách các liên hệ gộp từ nhiều đầu chủ cho
  trưởng nhóm xem. Lối khác: tách thành nhiều liên hệ theo đầu chủ — trái «một số → một người», kiểm trùng vẫn hai ngả.
- **Hỏi-2 — «Lên bảng» của lead nhập trước hàng 85**: khuyến nghị bỏ hẳn suy luận (lead cũ không có hàng mang mã lead thì
  không lên bảng); dữ liệu hiện chỉ có ở sàn thử. Lối khác: giữ suy luận cũ làm lối dự phòng cho lead không có liên kết — số
  đo trộn hai định nghĩa.
- **Hỏi-3 — trưởng nhóm giao lại một hàng thì người giữ liên hệ có đổi theo**: khuyến nghị không tự đổi ở hàng này (người giữ
  liên hệ chỉ đặt khi chưa có); lệch giữa người giữ liên hệ và đầu chủ giữ căn hiện ở Hôm nay của trưởng nhóm (hàng 42).
  Lối khác: đổi theo — các hàng khác của cùng chủ đứng tên đầu chủ cũ, luật «một chủ → một đầu chủ» gãy theo hướng khác.
- **Hỏi-4 — telesales có thấy tên liên hệ của lead mình nhập**: khuyến nghị không (liên hệ chủ nhà trọn lớp nguồn; lead từ
  telesales chưa có tên). Lối khác: thấy tên — mở một trường nguồn cho vai không giữ nguồn.
- **Hỏi-5 — chữ «Lead» trong từ vựng** (chủ kho chọn theo KW, 01/11): «Lead — trạng thái của một liên hệ chưa nói chuyện hai
  chiều (KW «Mark as Lead»; RESO `ContactType = Lead`). Bản ghi lead của Quỹ hàng là cơ hội phía bán ở pha đầu gắn liên hệ ấy
  (KW Opportunity, pha Cultivate), không phải hàng».

## 7b. Bất biến chạm

1. Cách ly: hai bảng mới bật và ép luật theo dòng theo sàn; bộ kiểm cách ly thêm ca, và phép kiểm «mọi bảng bật luật» tự
   bắt bảng mới.
2. Chủ nhà không rời công ty: liên hệ chủ nhà trọn lớp nguồn; cột số không cấp đọc; `cot_so_ro_chua_chan` vẫn rỗng.
3. Người bấm gửi: không chạm.
4. Phần nội bộ không ra trang khách: không chạm (liên hệ không có cửa ra).
