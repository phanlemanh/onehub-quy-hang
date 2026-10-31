# Ô nhận lead — thiết kế (hàng 24, T3)

Hàng 24 của lộ trình, dãy L đợt `dau-chu-dong-vao`. Câu giao: *Telesales nhập lead đủ năm mục trên máy tính và thấy
ngay kết quả kiểm trùng: không trùng, đã có đầu chủ, hay căn đã có hàng mở.* Màn P0 «Cửa vào · Ô nhận lead · Telesales ·
máy tính» (Tham chiếu §10, phác thảo L1–L3); luật sản phẩm 19–21 (Tham chiếu §8). Đứng trên hàng 5 (dữ liệu mẫu), 9 (gõ
mã căn), 11 (lớp trường nguồn), 53 (vỏ). Hồ sơ: `_acceptance/o-nhan-lead/`. ADR đi kèm: ADR-0012 (số giữ chỗ luật 24).

## 1. Vấn đề và chỗ đứng

Telesales gọi lọc chủ nhà rồi nhập lead. Hôm nay họ dán vào nhóm Zalo; hai người gọi trúng một chủ, hay gọi trúng một
căn sàn đã có hàng, là chuyện thường. Luật 20: kiểm trùng ngay lúc nhập — chủ nhà đã có đầu chủ thì lead về người đó;
căn đã có hàng mở thì lead thành tin bổ sung (vẫn cho «Bỏ lead này», có ghi lại); còn lại chia theo luật của sàn.
Luật 21: telesales thấy kết quả của lead, không thấy hàng.

Hàng này dựng **cửa vào và phép kiểm trùng**. Chia lead theo luật sàn, hạn 15/30 phút và báo trưởng nhóm là hàng 25;
thông báo là 26; bốn nấc và danh sách lead đã nhập (cột phải của L1) là 27.

## 2. Lựa chọn chính

**Lead là một bản ghi riêng, chưa là hàng (Hỏi-4, khuyến nghị).** Tham chiếu §4 nói «Lead là hàng ở nấc đầu». Nhưng trục ai thấy hàng
(hàng 12) cho người tạo hàng đọc được hàng ấy: nếu telesales tạo hàng thì telesales thấy hàng — trái luật 21; và đầu chủ
nhận lead lại không đọc được hàng «Chỉ tôi» của telesales. Nên lead ở bảng `leads` riêng; lead thành hàng khi đầu chủ
nhận (hàng 25/22 — người tạo hàng khi ấy là đầu chủ, «Chỉ tôi» đúng người). Lối khác còn sống: lead là hàng nấc Chưa đủ
để rao kèm ngoại lệ «telesales chỉ thấy kết quả» ở trục ai thấy hàng — mở lại luật đã ký của hàng 12; nên là câu của chủ
kho. Chọn bảng riêng thì Tham chiếu §4 sửa câu «Lead là hàng ở nấc đầu» trong cùng PR (mục 7).

**Lead mang năm mục (luật 19):**

| Mục | Khoá | Dạng | Ghi chú |
|---|---|---|---|
| Số chủ nhà | `ownerPhone` | số Việt Nam, chuẩn hoá về 10 chữ số | lớp `source`; dùng lại `normalizePhone` của hàng 11 |
| Căn hoặc toà | `buildingName`, `unitNumber?` | toà bắt buộc, căn tuỳ chọn | từ gõ mã căn (hàng 9) hoặc chọn toà của danh mục |
| Nhu cầu | `need` | một trong `sale` · `lease` · `sale_or_lease` | nhãn «Bán · Cho thuê · Cả hai» — Hỏi-1 |
| Giá kèm điều kiện phí | `listPrice`, `feeInclusion` | số đồng nguyên dương + `included`/`excluded` | như lõi hàng (luật 7); máy nói lại «Hiểu là…» |
| Thời gian muốn ra hàng | `desiredListingTime` | một trong `now` · `within_1_month` · `within_3_months` · `undecided` | nhãn «Ngay · Trong 1 tháng · 1–3 tháng · Chưa định» — Hỏi-2 |

Khuôn chặt như lõi hàng: khoá lạ bị từ chối, thiếu mục nào nêu đúng mục ấy.

**Kiểm trùng: cơ sở dữ liệu chở dữ kiện, lõi quyết.** Như trục ai thấy hàng (`FACTS_SQL` → `canRead`), một hàm
`app.lead_dedupe_facts(phone, building, unit)` (security definer, chỉ trong sàn đang làm) trả hai dữ kiện:

- *hàng mở trên căn* — hàng của sàn cùng toà và cùng mã căn (so sau khi bỏ dấu cách, gạch, chấm và viết hoa) ở trạng
  thái chưa phải nấc cuối (Chưa đủ để rao, Đang bán, Đang giao dịch, Tạm ngừng — Tham chiếu §5: Đã bán và Ngừng hẳn là
  nấc cuối, mở lại là hàng mới); kèm đầu chủ giữ hàng ấy (dòng gán mới nhất);
- *đầu chủ của chủ nhà* — đầu chủ đang giữ một hàng có chủ nhà mang số này (`listing_owners`), hoặc đầu chủ mà một lead
  trước cùng số đã về (lead chưa bị bỏ); lấy lần gán mới nhất. Lead trước cùng số còn chờ chia (chưa người nhận) không
  tính — Hỏi-5.

Hàm cần vì số chủ là cột vai API không được đọc (hàng 11), và vì hàng «Chỉ tôi» của người khác vẫn phải được tính —
«mỗi sàn tối đa một hàng đang mở trên một căn» là gốc của kiểm trùng (Tham chiếu §4). Hàm chỉ trả mã hàng và người,
không trả số, không trả phần nào của hàng.

Lõi (`packages/core/src/dedupe`) quyết kết quả từ hai dữ kiện:

| Hàng mở trên căn | Đầu chủ của chủ nhà | Kết quả |
|---|---|---|
| có | có / không | `unit_has_open_listing` — tin bổ sung cho đầu chủ của hàng ấy |
| không | có | `owner_has_agent` — lead về đầu chủ ấy |
| không | không | `new` — chờ chia theo luật của sàn (hàng 25) |

Căn trùng thắng chủ trùng: tạo lead thường trên căn đã có hàng mở là đẻ ra hàng mở thứ hai trên một căn khi lead thành
hàng — trái gốc kiểm trùng. Lead chỉ biết toà thì không có dữ kiện căn.

**Telesales thấy kết quả, không thấy hàng.** Bản trả cho telesales dựng ở lõi (`leadResultView`): kết quả, tên đầu
chủ nhận (Hỏi-3), lúc nhập, cờ đã bỏ — không mã hàng, không trường nào của hàng, không số chủ (chốt 29/10: telesales
không thấy lại số sau khi gửi). Vai API không có quyền đọc cột `leads.owner_phone`.

**«Bỏ lead này»** chỉ ở lead kết quả căn trùng, chỉ người nhập, một lần; ghi người và lúc vào chính dòng lead (dòng
không xoá). Bỏ rồi thì lead không còn là tin bổ sung, và không tính là «đầu chủ của chủ nhà» cho lần kiểm sau.

**Ai nhập được**: vai có nút «+ Lead» ở bảng vai của lõi (`packages/core/src/navigation.ts`) — telesales, đầu chủ,
trưởng nhóm. Vai khác nhận 403.

**Gửi lead cần mạng.** Kiểm trùng chạy trên máy chủ; mất mạng thì báo và giữ nguyên chữ đã gõ. Lead không vào hàng đợi
của bộ đồng bộ trên máy (hàng 13) — ngoại tuyến thật chỉ ở điện thoại, đo trước (luật 31).

## 3. Dữ liệu (migration 007)

Bảng `leads` (cột theo RESO khi có): `id`, `company_id`, `created_by`, `building_name`, `unit_number`, `need`,
`list_price`, `fee_inclusion`, `desired_listing_time`, `owner_phone` (check `^0[0-9]{9}$`), `outcome`,
`matched_agent_user_id`, `matched_listing_id`, `created_at`, `discarded_by`, `discarded_at`. Luật theo dòng: `enable` +
`force`; đọc: cùng sàn và (người nhập, hoặc đầu chủ được khớp, hoặc trưởng nhóm); thêm: cùng sàn và `created_by` là người
đang làm. Grant đọc mọi cột trừ `owner_phone`; không grant `update`/`delete` — bỏ lead đi qua hàm `app.discard_lead(id)`
(security definer: đúng người nhập, đúng kết quả căn trùng, chưa bỏ). Bộ kiểm cách ly thêm một ca: sàn khác cùng số,
cùng căn không ra dữ kiện, không đọc được lead của nhau.

Hàng 62 (migration 008) mã hoá số chủ thì mã hoá cả `leads.owner_phone` và đổi thân `app.lead_dedupe_facts` — đã báo
dãy G qua giám sát. Hàng 25 thêm đầu chủ được chia vào lead thì mở rộng vế «lead trước cùng số» của hàm.

## 4. API

`/api/v1/leads` (Hono + OpenAPI, cùng khuôn `listings`):

- `POST /api/v1/leads` — kiểm năm mục ở lõi (400 kèm `details`), chuẩn hoá số, trong một giao dịch: lấy dữ kiện → lõi
  quyết → ghi lead. Trả 201 bản của telesales.
- `GET /api/v1/leads/{id}` — bản của telesales cho lead của chính mình; lead người khác nhập → 404 như không có.
- `POST /api/v1/leads/{id}/discard` — «Bỏ lead này»; kết quả khác căn trùng → 400, đã bỏ → 409.
- `GET /api/v1/leads/buildings` — tên toà của danh mục để chọn «chỉ biết toà».

## 5. Màn

`/leads/new` (vỏ đã có nút «+ Lead»). Khối đích `form-2` (vo-va-ia §2): năm ô trong một Frame; kết quả kiểm trùng hiện
bằng Alert dưới ô (qua khuôn `TrangThai`). Cột phải `list-11` (lead đã nhập + bốn nấc) là hàng 27 — vòng này không dựng. Tệp nhóm khuôn
`design/patterns/o-nhan-lead.md` (luật 18 của đợt).

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: «+ Lead» → gõ số chủ, mã căn (hoặc chọn toà), nhu cầu, giá + điều kiện phí, thời gian → «Gửi lead» → Alert
  kết quả dưới ô, ô trống lại cho lead kế (điểm ra: gõ lead kế hoặc rời màn).
- Biên: chỉ biết toà (không có dữ kiện căn); mã căn chưa có trong danh mục (báo như hàng 9, vẫn chọn toà được); căn trùng
  → «Bỏ lead này» → hỏi lại → «Đã bỏ lead, có ghi lại».
- Lỗi & quay lại: thiếu mục → lỗi dưới đúng ô, không gửi; máy chủ từ chối khuôn → lỗi dưới ô theo `details`; mất mạng /
  máy chủ lỗi → Alert lỗi, chữ đã gõ giữ nguyên, bấm «Gửi lead» lần nữa.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Ô nhận lead (máy tính) | Nhập một lead đủ năm mục và thấy kết quả kiểm trùng | Nút «+ Lead» của vỏ / lead kế, Hôm nay |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-lead-trong | Ô nhận lead | Năm ô trống, «Gửi lead» | Gõ |
| ST-lead-thieu | Ô nhận lead | Lỗi dưới từng ô thiếu, ví dụ «Cần số chủ nhà» | Điền ô thiếu |
| ST-lead-dang-gui | Ô nhận lead | Nút «Đang kiểm trùng…» khoá, ô khoá, kết quả cũ đã ẩn | Chờ |
| ST-lead-khong-trung | Ô nhận lead | Alert: «Không trùng — lead chờ chia theo luật của sàn»; năm ô trống lại, tiêu điểm về ô số chủ | Gõ lead kế |
| ST-lead-co-dau-chu | Ô nhận lead | Alert: «Chủ nhà đã có đầu chủ [Tên] — lead đã về [Tên]»; năm ô trống lại | Gõ lead kế |
| ST-lead-can-trung | Ô nhận lead | Alert: «Căn [mã] đã có hàng mở của [Tên] — lead thành tin bổ sung cho [Tên]», nút «Bỏ lead này» | Để nguyên, hoặc bỏ |
| ST-lead-da-bo | Ô nhận lead | Alert: «Đã bỏ lead này — có ghi lại» | Gõ lead kế |
| ST-lead-loi | Ô nhận lead | Alert lỗi: «Chưa gửi được — kiểm mạng rồi gửi lại», chữ đã gõ giữ nguyên | Bấm «Gửi lead» lần nữa |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Số chủ: nhận dấu cách, chấm, gạch, +84; sai dạng báo «Cần số điện thoại Việt Nam 10 chữ số».
- Giá: gõ số đồng; dòng «Hiểu là: 3,2 tỷ, đã bao phí» đổi theo giá và điều kiện phí (luật 7).
- Mã căn: tra danh mục khi rời ô (hàng 9); thấy căn thì hiện toà + mã, không thấy thì báo và mở chọn toà.
- Enter ở ô cuối gửi; sau khi gửi, tiêu điểm về ô số chủ. Máy tính là chính; điện thoại (L4, L5) là P1 — màn không vỡ ở
  bề ngang điện thoại nhưng không chăm.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Khối `form-2` | dùng (chuyển thể) | Khối đích của màn ở vo-va-ia §2 |
| `Frame`, `Field`, `Input`, `ToggleGroup`, `Select`, `Button` | dùng | Thành phần đã cài, khối form ghép từ chúng |
| `TrangThai` (khuôn nhóm `trang-thai`, ghép `Alert` reui) | dùng | Kết quả kiểm trùng và lỗi mạng dưới biểu mẫu — vo-va-ia §2 «Alert dưới ô», qua cửa chung |
| `AlertDialog` | dùng | Hỏi lại trước «Bỏ lead này» |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: một biểu mẫu năm ô và một kết quả — luồng hiển nhiên, không tra; khối đích `form-2` đã chọn ở ADR-0002.
<!-- UX-SPEC-TEMPLATE>>> -->

## 6. Kiểm

- Lõi: khuôn năm mục, bảng bốn ô của kết quả, bản trả cho telesales không mang khoá hàng hay số (cặp hai chiều).
- Cơ sở dữ liệu + API (Postgres dãy L): ca trùng căn, trùng số lấy từ bộ dữ liệu mẫu hàng 5 (lead L-01 trên căn đã có
  hàng mở, lead L-02 mang số chủ nhà CN-01), hàng nấc cuối không tính, số viết dạng khác vẫn khớp, sàn khác không khớp,
  «Bỏ lead này», vai.
- Màn: chấm trên bản đang chạy (ui-check) — năm ô, ba dạng kết quả, lỗi thiếu mục.

## 7. Đổi tài liệu

- Tham chiếu §12 thêm một dòng sổ quyết định (lead là bản ghi riêng tới khi đầu chủ nhận; năm mục; kiểm trùng; ADR-0012).
  §4 dòng «Hàng»: câu «Lead là hàng ở nấc đầu» sửa theo Hỏi-4 (sửa dòng có sẵn — chạm tệp đã xin, luật 12 của đợt).
- `docs/design/vo-va-ia.md`: bảng khối đã chuyển thể thêm `form-2` → Ô nhận lead.
- ADR-0012: lead là bản ghi riêng, dữ kiện kiểm trùng ở cơ sở dữ liệu, quyết ở lõi.

## 8. Câu chỉ người biết (lên Cổng Phạm vi)

- **Hỏi-1 — nhu cầu có những giá trị nào.** Khuyến nghị: «Bán · Cho thuê · Cả hai», giá là giá chủ muốn cho nhu cầu
  ấy. Lối khác: chỉ «Bán» (khớp lõi hàng chỉ có giá bán) — giá: mục «nhu cầu» thành ô một giá trị, lead cho thuê không
  vào được.
- **Hỏi-2 — thời gian muốn ra hàng nhập thế nào.** Khuyến nghị: bốn nấc «Ngay · Trong 1 tháng · 1–3 tháng · Chưa định»
  (telesales nghe «tầm tháng sau» chứ không nghe ngày). Lối khác: chọn ngày — giá: telesales phải đoán ngày, hàng đợi
  sắp được theo ngày.
- **Hỏi-4 — lead là bản ghi riêng hay hàng ở nấc đầu.** Khuyến nghị: bảng `leads` riêng tới khi đầu chủ nhận (không chạm
  luật đã ký của trục ai thấy hàng). Lối khác: lead là hàng nấc Chưa đủ để rao kèm ngoại lệ telesales ở trục ai thấy hàng —
  giá: mở lại hồ sơ hàng 12, mọi màn hàng phải lọc lead ra.
- **Hỏi-5 — lead trùng số với một lead khác đang chờ chia.** Khuyến nghị: giữ ba kết quả của luật 20 (ra «Không trùng»),
  hàng 25 chia lead cùng số cho cùng người; số đo «lead trùng bị chặn» chưa đếm loại này tới hàng 25. Lối khác: thêm kết
  quả thứ tư «Trùng lead đang chờ chia» — giá: một chữ trên màn, một ca kiểm, một dạng cho hàng 25 và 27.
- **Hỏi-6 — loại hình bất động sản.** RESO tách loại hình bằng `PropertyType` (Residential, ResidentialLease, Land,
  CommercialSale…) và `PropertySubType` (Condominium, Townhouse, SingleFamilyResidence…); RESO không có thực thể «dự án» —
  gần nhất là `SubdivisionName` — nên «dự án» là đặc trưng Việt Nam, đặt tên riêng (`projectName`). Khuyến nghị: hàng 24
  chỉ nhận căn hộ (Residential · Condominium) trong dự án có danh mục; nhà phố, nhà riêng và loại hình khác là hàng mới, kèm
  trường loại hình ở lõi hàng và kiểm trùng theo địa chỉ chuẩn hoá. Lối khác: thêm ô loại hình và địa chỉ ngay ở hàng 24,
  kiểm trùng nhà ngoài dự án chỉ theo số chủ — giá: lead ấy chưa thành hàng được vì hàng bắt buộc có toà.
- **Hỏi-3 — telesales có thấy tên đầu chủ nhận lead không.** Khuyến nghị: thấy tên (đầu chủ là người trong sàn; telesales
  biết lead đi đâu để hỏi lại). Lối khác: chỉ thấy loại kết quả — giá: telesales phải hỏi trưởng nhóm.
