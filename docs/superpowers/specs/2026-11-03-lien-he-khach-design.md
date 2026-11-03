# Thiết kế — Liên hệ khách (hàng 86, T3)

Hàng 86 của lộ trình (dãy L, đợt `dau-khach-nhap`), bước hai của hàng 85 (ADR-0021). Câu giao: «Đầu khách lưu khách là
một liên hệ loại Người mua hoặc Người thuê, gắn nhu cầu, Lần gửi và lịch xem vào liên hệ ấy; một khách hai số vẫn là một
người; số khách không ra trang khách». Cổng Đáng: build (Manh Phan 02/11). Ngưỡng của ô: «Một khách hai số có hai Lần gửi:
cả hai gắn một liên hệ Người mua; liên hệ vừa Người mua vừa Chủ bán vẫn một người, phần chủ nhà vẫn lớp nguồn; trang khách
không lộ số hay trường nội bộ của liên hệ; bộ kiểm cách ly xanh». Migration `021` giữ chỗ ở giám sát (tin L-0311-2).
Không có màn: Gửi (34), Trang khách (35), Đã gửi (36), Hôm nay của đầu khách (37) dựng trên dữ liệu của hàng này.

## 1. Đối chiếu ngành (ADR-0022)

| Năng lực / đối tượng | RESO DD 2.0 | KW Command | Lofty / Follow Up Boss | Ta định làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Khách là một người | `Contacts`, `ContactType` Multi: `Buyer`, `Tenant` | Contact; cùng bản ghi cho mọi vai của người | Một người một hồ sơ, nhiều số ([FUB Phone Labels](https://help.followupboss.com/hc/en-us/articles/4402372233495-Phone-Number-Labels)) | Khách là liên hệ của hàng 85, loại `Buyer` / `Tenant`; số qua `contact_phones` (bản mã + dấu vết) | — |
| Việc của đầu khách với một khách | `Prospecting` — «a contact being sent listings by a member»: `ContactKey`, `OwnerMemberKey`, `SavedSearchKey`, `Active` | Opportunity đường ống Buyers, có Assignee riêng ([Contacts Overview](https://documentation.kw.com/html/kellercloud/command/contacts/overview-contacts.html)) | FUB: người được giao trên hồ sơ (chưa kiểm vai mua riêng) | Bảng **nhu cầu khách** `prospects` (RESO `Prospecting`): liên hệ + đầu khách giữ + nhu cầu + tên khách đầu khách gọi | — |
| Nhu cầu | `SavedSearch` (`SearchQuery` tự do theo trường RESO) | Saved Search của khách, dùng mọi bộ lọc tìm kiếm (đối chiếu ngành dòng 8) | Lofty Property Alerts theo bộ lọc tìm kiếm (đối chiếu ngành dòng 8) | Tập trường đóng theo tên RESO: `SubdivisionName`, `BuildingName`, `BedroomsTotalMin`, `LivingAreaMin`, `ListPriceMax`, `LeaseAmountMax`, ghi chú | **Ta cứng** tập trường — họ cho mọi bộ lọc → Hỏi-3 |
| Lần gửi | `Prospecting` gửi theo lịch; `ContactListings` (căn đã gửi cho liên hệ) | Collection gửi khách | Lofty: link bộ căn gửi khách (chưa kiểm) | Bảng `shares` + `share_listings`: người gửi (ghi công), khách riêng hay nhóm môi giới, nhu cầu khách, mã link | — |
| Trần căn của một Lần gửi | — | Collection (trần chưa kiểm) | Lofty bộ căn (trần chưa kiểm) | 30 căn | **Ta cứng** 30 — chưa kiểm họ → Hỏi-7 |
| Lịch xem | `ShowingAppointment` (chưa kiểm tên trong DD 2.0) | Appointment trên Opportunity | Lịch hẹn của hồ sơ | Không dựng ở hàng này — Tham chiếu §13 chờ phỏng vấn → Hỏi-4 | — |
| Khách do hai người phục vụ | — | Collaborators trên Opportunity | Chưa kiểm | Mỗi đầu khách một nhu cầu riêng trên cùng liên hệ → Hỏi-1 | — |

Bài học: RESO tách con người (`Contacts`) khỏi việc gửi căn cho người ấy (`Prospecting` + `SavedSearch`); KW tách con người
khỏi Opportunity. Quỹ hàng giữ «một người là một liên hệ» và đặt việc của đầu khách vào nhu cầu khách — không bảng người
thứ hai.

## 2. Hàng làm gì

1. **Nhu cầu khách** (`prospects`, RESO `Prospecting`): một đầu khách phục vụ một khách. Mang liên hệ của khách, đầu khách
   giữ (`owner_member_user_id`, `buyer_agent`), tên khách đầu khách gõ (`display_name`), loại giao dịch (Mua · Thuê · Cả
   hai → `Buyer` · `Tenant` · cả hai, giống nhu cầu của lead ra loại chủ nhà ở hàng 85), tiêu chí (tập trường RESO đóng),
   mốc. Không cột số. Đầu khách giữ hay trưởng nhóm đóng nhu cầu (`POST /api/v1/prospects/{id}/close`); nhu cầu đóng vẫn
   đọc được, không nhận Lần gửi mới.
2. **Khách vào bằng số.** `POST /api/v1/prospects` (đầu khách): tên, số, loại giao dịch, tiêu chí. Số đi đúng đường của
   hàng 85: dấu vết theo sàn → `app.contact_for_phone`; số chưa thuộc ai → liên hệ mới loại `Buyer`/`Tenant`, **không người
   giữ** (người giữ liên hệ là của phía chủ nhà, ADR-0021 §5 — đặt đầu khách vào đó thì lead sau của cùng người sẽ chia nhầm
   về đầu khách); số đã thuộc một liên hệ → nhu cầu gắn liên hệ ấy, liên hệ được thêm loại, người giữ không đổi. Thân trả
   giống hệt nhau trong hai trường hợp — lối tạo nhu cầu không cho dò số nào là của chủ nhà.
3. **Một khách hai số.** `POST /api/v1/prospects/{id}/phones` thêm số vào đúng liên hệ của nhu cầu. Số đã thuộc liên hệ ấy →
   200 không đổi gì; số thuộc liên hệ khác → 409, một thân cho mọi liên hệ, không nói của ai, không gộp (luật «không gộp
   hai liên hệ» của hàng 85). Lối này cho đầu khách biết số ấy đã có trong sàn — Hỏi-6.
   Nhu cầu thứ hai (của đầu khách khác hay của chính mình) tạo bằng số thứ hai → cùng liên hệ.
4. **Lần gửi** (`shares`, `share_listings`): `POST /api/v1/shares` — người gửi là người gọi (ghi công), khán giả `client`
   (khách riêng — bắt buộc một nhu cầu khách của người gọi) hay `agents` (nhóm môi giới — không nhu cầu; luật 21 của đợt),
   danh sách căn (1–30) đều đã lên bảng (nấc «Toàn sàn» của hàng 12), mã link ngẫu nhiên 12 ký tự cho `/s/<mã>`. `GET
   /api/v1/prospects/{id}/shares` liệt các Lần gửi của nhu cầu. Lượt mở, quan tâm, tắt link là hàng 35, 36.
5. **Ai thấy.** Nhu cầu khách và Lần gửi của nó: đầu khách giữ nhu cầu, trưởng nhóm; Lần gửi còn thấy được bởi người gửi.
   Đầu chủ, telesales, quản trị, đầu khách khác: 404. Liên hệ mang loại chủ nhà vẫn trọn lớp nguồn — đầu khách không đọc được
   liên hệ, kể cả khi chính họ thêm số vào (`GET /api/v1/contacts/{id}` → 404); liên hệ chỉ khách (không người giữ) chỉ
   trưởng nhóm đọc, như luật đọc của 016.
6. **Đầu khách đổi người không mất lịch sử.** `PATCH /api/v1/prospects/{id}` (trưởng nhóm) đổi đầu khách giữ nhu cầu sang
   một thành viên còn vai Đầu khách; mọi Lần gửi cũ đi theo nhu cầu, người gửi giữ nguyên (ghi công không đổi). Đầu khách
   cũ không còn thấy nhu cầu, vẫn thấy Lần gửi của chính mình.
7. **Khách cũng là chủ.** Lead của một người đã là khách: `contact_for_phone` cộng `Seller` và đặt người giữ đầu chủ như
   hàng 85; kiểm trùng ra đúng như số chưa có đầu chủ. Ngược lại, chủ nhà trở thành khách: liên hệ cộng `Buyer`, đầu chủ giữ
   liên hệ thấy loại `Seller, Buyer` và số lượng số, không thấy nhu cầu khách. Bỏ loại khách khỏi liên hệ khi còn nhu cầu
   đang mở loại ấy → 400.
8. **Trang khách không lộ liên hệ.** Lõi `packages/core/src/sharing` dựng **phong bì công khai** của một Lần gửi — đúng các
   khoá viết trước (mã link, khán giả, danh sách mã hàng theo thứ tự, mã người gửi) — không bao giờ mang nhu cầu, liên hệ,
   tên khách, số. Luật ẩn trường của căn là hàng 31 (`packages/core/src/redaction`); trang khách (35) dựng từ hai lõi ấy.
9. **Tài liệu.** Tham chiếu §4 (dòng Lần gửi, dòng Nhu cầu khách), §12 Sổ quyết định, §15 (RESO `Prospecting`,
   `SavedSearch`); ADR-0021 mục «Sửa đổi 03/11 — liên hệ khách»; Đối chiếu ngành thêm dòng `Prospecting`.

## 3. Dữ liệu (migration 021)

- `prospects (company_id, id, contact_id → contacts, owner_member_user_id text not null, display_name 1–200 ký tự,
  need check in ('purchase','lease','purchase_or_lease'), criteria jsonb object, closed_at, created_by, created_at,
  updated_at)`; bật + ép luật theo dòng; đọc: cùng sàn và (trưởng nhóm, hay người giữ còn vai Đầu khách); vai API chỉ
  `select` — ghi qua hàm `security definer` (`app.open_prospect`, `app.add_prospect_phone`, `app.reassign_prospect`).
- `prospect_events (company_id, id, prospect_id → prospects, type, actor_user_id, actor_roles, occurred_at, payload)` —
  chỉ thêm (Tham chiếu §4 «Sự kiện»); loại `inquiry_received` («khách hỏi», luật 35 của đợt: mốc đầu của số đo «Thời gian
  khách hỏi → gửi được căn»), `phone_added`, `reassigned`, `closed`; tên ở hằng `PROSPECT_EVENT_TYPES` của lõi để hàng 52
  đọc. Không số trong payload. Đọc như nhu cầu khách; vai API không ghi thẳng, không sửa, không xoá.
- `shares (company_id, id, code unique toàn hệ ~ '^[A-Za-z0-9_-]{12}$', sender_user_id, audience in ('client','agents'),
  prospect_id → prospects null, check (audience = 'client') = (prospect_id is not null), created_at, disabled_at)`;
  `share_listings (company_id, share_id → shares, listing_id → listings, position)`, khoá `(share_id, listing_id)`; bật + ép
  luật theo dòng; đọc: cùng sàn và (người gửi, trưởng nhóm, hay người giữ nhu cầu); ghi qua `app.create_share`.
- `contact_phones.enc_context` nhận thêm ngữ cảnh `prospects:<sàn>:<nhu cầu>`; ràng buộc mới thay ràng buộc cũ trong
  021 (016 không sửa).
- `app.set_contact_types` đổi bằng `create or replace` cùng chữ ký: thêm vế từ chối bỏ `Buyer`/`Tenant` khi còn nhu cầu
  đang mở cần loại ấy (`23514`).
- Không cột số dạng chữ nào; bản mã của số khách mang ngữ cảnh của nhu cầu tạo ra nó.

## 4. Lõi

- `packages/core/src/contacts`: `typesForProspectNeed`, `validateProspectInput` (khoá lạ → lỗi, tiêu chí đúng tập trường,
  số theo khuôn của lead), `validateProspectPatch`, `prospectView` (khoá viết trước, không số, không mã liên hệ).
- `packages/core/src/sharing` (`@quy-hang/core/sharing`): `validateShareInput` (khán giả, nhu cầu, 1–30 căn không trùng),
  `newShareCode`, `SHARE_PUBLIC_KEYS` + `publicEnvelope(record)` — chép đúng khoá viết trước, bỏ mọi thứ khác.

## 5. Phương án đã cân

- **Bảng khách riêng** (buyers): chết vì luật thiết kế «một người là một liên hệ» (ADR-0022, ADR-0021).
- **Đầu khách làm người giữ liên hệ**: chết vì kiểm trùng lead đi qua người giữ liên hệ (016 `lead_dedupe_facts`) — lead
  sau của cùng người sẽ ra «chủ đã có đầu chủ» về đầu khách.
- **Đầu khách đọc liên hệ** (mở luật đọc 016 cho `buyer_agent`): liên hệ vừa khách vừa chủ là lớp nguồn trọn liên hệ
  (bất biến 2) — mở là lộ tên, loại, người giữ phía chủ. Nên đầu khách làm việc qua nhu cầu khách với tên mình gõ (Hỏi-2).
- **Gửi gắn thẳng liên hệ** (không qua nhu cầu): đầu khách không được đọc liên hệ, nên cũng không chọn được liên hệ;
  đổi đầu khách thì không có chỗ chuyển. Gửi gắn nhu cầu, nhu cầu gắn liên hệ.

## 6. Câu chỉ người có

- **Hỏi-1** — Khách đã do đầu khách khác phục vụ (cùng số): khuyến nghị mỗi đầu khách một nhu cầu riêng trên cùng liên
  hệ, không báo cho người thứ hai, trưởng nhóm thấy cả hai; lối khác: báo «khách đã có đầu khách» và chặn — giá: lộ việc của
  người khác và tranh khách sớm hơn khi chưa có luật ghi công.
- **Hỏi-2** — Tên khách: khuyến nghị tên trên nhu cầu, đầu khách tự gõ, không đọc tên của liên hệ; lối khác: một tên trên
  liên hệ — giá: liên hệ vừa là chủ thì tên là lớp nguồn, đầu khách không đọc được.
- **Hỏi-3** — Nhu cầu là tập trường RESO cố định (khu, toà, phòng ngủ tối thiểu, diện tích tối thiểu, giá mua tối đa, giá
  thuê tối đa, ghi chú) — **ta cứng, họ cấu hình** (KW Saved Search, Lofty Property Alerts dùng mọi bộ lọc). Khuyến nghị giữ
  cứng vì nghĩa chuẩn để so (Bảng hàng thẻ hàng 32 lọc theo đúng các trường này); trường thêm của sàn đi hàng 47. Lối khác:
  tiêu chí là bộ lọc lưu được của Bảng hàng — giá: phải chờ góc nhìn lưu được.
- **Hỏi-4** — Lịch xem: khuyến nghị không dựng ở hàng này (Tham chiếu §13 «Xin dẫn xem và lịch xem chờ câu này»), chỉ ghi
  luật: lịch xem khi dựng gắn nhu cầu khách; lối khác: dựng bảng lịch xem tối thiểu ngay — giá: đoán quy trình dẫn xem
  trước phỏng vấn.
- **Hỏi-5** — Đầu khách không mở lại số khách trong app ở hàng này (đã nói chuyện qua Zalo); lối khác: cửa «Mở số khách»
  có ghi sự kiện như số chủ — giá: thêm một cửa đọc số cần luật riêng.

- **Hỏi-6** — Thêm số thuộc liên hệ khác: khuyến nghị 409 một thân, chấp nhận đầu khách biết số đã có trong sàn (ngang
  mức telesales thấy kết quả kiểm trùng lúc nhập lead); lối khác: trả như đã có mà không thêm — giá: lời trả sai sự thật,
  liên hệ thiếu số.
- **Hỏi-7** — Trần 30 căn một Lần gửi: khuyến nghị giữ cứng (lý do nền tảng: trang khách nhẹ trên điện thoại); lối khác:
  tham số của sàn mặc định 30 (ADR-0018 bậc 1) — giá: thêm khoá cấu hình ở hàng 82.

## 7. Bất biến chạm

(1) cách ly — ba bảng mới bật + ép luật theo dòng, ca trong `packages/db/tests/isolation.test.mjs`; (2) chủ nhà — liên hệ
vừa khách vừa chủ vẫn trọn lớp nguồn, đầu khách không đọc; (3) người bấm gửi — Lần gửi chỉ là bản ghi, không gửi gì; (4)
trang khách — phong bì công khai của lõi không mang liên hệ, nhu cầu hay số.
