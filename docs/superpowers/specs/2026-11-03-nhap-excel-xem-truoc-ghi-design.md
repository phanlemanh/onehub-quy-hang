# Đường ghi lần nhập (hàng 65a nhap-excel-xem-truoc-ghi)

Ngày 03/11/2026 · Hạng T3 · dãy G đợt dau-khach-nhap · Nguồn: ô cơ hội `_acceptance/nhap-excel-xem-truoc-ghi/opportunity.md`
(Cổng Đáng «build» 02/11), [Nhập dữ liệu](../../architecture/nhap-du-lieu.md) §6, §8, ADR-0011 quyết định 5, 8, 11,
luật 20, 22, 25, 38 của đợt, quyết định G-4 của giám sát (03/11).

## Phạm vi sau khi tách (G-4)

Hàng 65 tách hai: **65a — đường ghi lần nhập** (hàng này: migration 024, API `/api/v1/imports`, kiểm trùng, chủ nhà qua cửa
ADR-0010, ba lỗi hàng 64 theo luật 38) và **65b — màn Nhập Excel** (hàng mới `man-nhap-excel` đứng sau 65: wizard
`solution-crm-6`, đọc tệp bằng exceljs, xem trước từng ô, design-pass). Hàng này không có màn; mọi điều «người thấy» đo ở
mặt API mà màn 65b sẽ đọc. Hàng `man-nhap-excel` được thêm vào lộ trình trong PR của hàng này (lệnh thêm-hàng của kit).

## Vấn đề

Lõi nhập của hàng 64 đọc file, ghép cột, chuẩn hoá từng ô — nhưng chưa có đường nào đưa kết quả vào sổ hàng. Đường ghi phải
giữ bốn điều đã chốt: một cửa ghi hàng (ADR-0008), chủ nhà qua cửa chủ nhà và liên hệ (ADR-0010, hàng 85), căn đã có hàng
mở thành tin bổ sung (luật 20), và độ tươi theo ngày trong file thay vì «hôm nay» (luật 11, ADR-0011 quyết định 8).

## Thiết kế

### Luồng

1. Trình duyệt (65b) đọc tệp, lập kế hoạch bằng lõi (`planFromDictionary`), người sửa kế hoạch.
2. `POST /api/v1/imports` — mở một lần nhập: tên tệp, băm tệp, sheet, kiểu tệp, hàng tiêu đề, **kế hoạch** (JSON). Máy chủ
   kiểm kế hoạch bằng `validatePlan` của lõi (kể cả luật lớp nguồn mới, dưới). Trả `importId`, trạng thái `planned`.
3. `POST /api/v1/imports/{id}/rows` — một gói tối đa **200 dòng** (`rows: [{ row: <số dòng của file>, cells: [...] , agentUserId?, skip? }]`),
   cờ `dryRun`. Máy chủ **áp lại kế hoạch bằng lõi** trên ô thô (không tin giá trị trình duyệt đã chuẩn hoá — một nguồn luật),
   đọc dữ kiện kiểm trùng từ cơ sở dữ liệu, rồi hỏi lõi `quyetDongNhap` cho từng dòng. `dryRun: true` → trả hành động từng
   dòng và đếm, **không ghi gì** (giao dịch lùi). `dryRun: false` → ghi cả gói trong một giao dịch.
4. `GET /api/v1/imports/{id}` — trạng thái và đếm (tạo · cập nhật · tin bổ sung · bỏ theo lý do).

Bản xem trước vẫn sống ở trình duyệt (§8); máy chủ chỉ trả hành động và lý do — không trả lại ô nguyên văn.

### Lõi: quyết một dòng (`packages/core/src/import/dong.ts`)

`quyetDongNhap(facts)` thuần, tất định; `facts` gồm: dấu ô (còn ô `blocked`/`needs_person` ở trường bắt buộc không), trạng
thái theo file, đã gặp cùng căn ở dòng trước của lần nhập chưa, người nhập bỏ dòng không, đầu chủ của dòng hợp lệ không, và
hàng mở trên căn (không có · người giữ hiệu lực giữ · người khác giữ và người gửi đọc được · người gửi không đọc được).
**Người giữ hiệu lực** của dòng là người gửi khi người gửi là Đầu chủ, là `agentUserId` của dòng khi người gửi là Trưởng
nhóm; «đọc được» luôn xét theo người gửi (người gọi API). Ra đúng một hành động:

| Dữ kiện (xét theo thứ tự) | Hành động | Lý do (chữ trên màn 65b) |
| --- | --- | --- |
| Người bỏ dòng | `skip` | «bạn bỏ dòng này» |
| Ô chặn hay cần người ở toà, mã căn, giá chào | `skip` | «còn ô cần bạn xem» |
| Cùng căn đã ở dòng trước | `skip` | «trùng dòng <n> trong file» |
| Trạng thái file Đã bán hay Ngừng hẳn | `skip` | «file ghi đã bán/ngừng — không nhập» (ADR-0011 qđ 11) |
| Đầu chủ của dòng không hợp lệ (Trưởng nhóm gửi) | `skip` | «chưa có đầu chủ giữ căn» |
| Căn có hàng mở, người giữ hiệu lực giữ | `update` | sự kiện đổi giá / đổi chi tiết trên hàng ấy |
| Căn có hàng mở, người khác giữ, người nhập đọc được | `supplement` | tin bổ sung gửi đầu chủ giữ căn (luật 20) |
| Căn có hàng mở người nhập không đọc được | `supplement` | «căn đã có hàng của người khác trong sàn» — không lộ gì thêm |
| Còn lại | `create` | hàng mới |

Ma trận này là dữ liệu kiểm của AC-1.

**Trùng trong file xét trên cả file, không theo gói.** `POST /imports` nhận thêm khoá căn (toà + mã căn đã chuẩn hoá —
lớp danh mục) của mọi dòng; máy chủ tính một lần dòng đầu của mỗi căn và lưu ở lần nhập. Mỗi gói, xem thử hay ghi, đọc cùng
bảng ấy, nên dòng 250 trùng dòng 10 ra «trùng dòng 10» ở cả hai — kể cả khi gói đầu chưa ghi — và không bao giờ thành
cập nhật đè lên hàng vừa tạo. Trạng thái «Đang bán» theo file: hàng mới vẫn tạo ở Chưa đủ để rao rồi xin chuyển qua
bảng chuyển của lõi; thiếu điều kiện thì ở lại và ghi lý do (§6).

### Ba lỗi hàng 64 (luật 38)

- **Ngoài-4 — cột lớp nguồn chỉ vào trường lớp nguồn.** `validatePlan` thêm luật: cột mà `classifyColumns` xếp lớp `source`
  (số, tên chủ, giá đáy) chỉ được ghép vào trường lớp `source` (`ownerName`, `ownerPhone`, `floorPrice`) hoặc bỏ có lý do;
  ghép vào ghi chú nội bộ, trường riêng hay trường rao → lỗi kế hoạch nêu cột và trường. Cột ghép vào trường lớp nguồn
  (kể cả cột «Giá đáy» lõi không dò ra theo hình mà theo đích) không được mang `valueMap` — bảng quy đổi là giá trị nguyên
  văn, sẽ nằm trong `imports.plan`. Máy chủ từ chối kế hoạch ấy (422).
- **Ngoài-5 — tiêu đề có ô trống.** `readTable` không nhận hai tầng tiêu đề chỉ vì một ô tiêu đề trống: dòng dữ liệu đầu
  giữ nguyên là dòng dữ liệu; cột tiêu đề trống được đặt tên «Cột <chữ>».
- **Ngoài-2 — ô mang tên thuộc tính hệ thống.** Bảng quy đổi tra bằng `Object.hasOwn`: ô «constructor», «toString»,
  «__proto__» ở cột có bảng quy đổi thành ô cần người, lần áp không sập.

### Ghi (`packages/api/src/imports/`)

- **Một cửa.** Hàng mới đi `createListing` rồi `applyCommand` của `packages/api/src/listings/store.ts`; cập nhật đi
  `applyCommand`. Không câu SQL nào khác vào `listings`/`listing_events` — bộ kiểm «một cửa» giữ. Lệnh của lần nhập luôn
  `confirmedWithOwner: false` và mang `import_id` (cột mới).
- **Chủ nhà.** Dòng có tên chủ hay số chủ → `putOwner` của cửa chủ nhà (ADR-0010): số mã hoá, dấu vết, liên hệ qua
  `app.contact_for_owner` — cùng số với liên hệ đã có thì là cùng liên hệ. Người nhập là đầu chủ thì giữ căn.
- **Tin bổ sung.** Dòng `supplement` có đủ năm mục lead (toà, giá, phí, số; nhu cầu mặc định «Bán», thời điểm «Chưa rõ»)
  → một lead kết quả «căn đã có hàng mở» ghi qua chính phần ghi của `createLead` (tách khỏi kiểm vai của route, không có
  đường ghi lead thứ hai), đầu chủ giữ căn được báo như hàng 26. Thiếu số hay giá → `import_rows` ghi «căn đã có hàng mở —
  dòng thiếu số hay giá nên không gửi tin bổ sung». Hỏi-1 ở Cổng Phạm vi.
- **Ai nhập.** Đầu chủ và Trưởng nhóm (ADR-0011 qđ 11, G-4: đã chốt). Đầu chủ: mọi hàng mới do mình giữ. Trưởng nhóm:
  mỗi dòng mang `agentUserId` (cột «Đầu chủ» trình duyệt đã ghép) phải là thành viên sàn có vai Đầu chủ, không thì dòng
  `skip` «chưa có đầu chủ giữ căn». Vai khác → 403.
- **Hàng mới vào «Chỉ tôi»** của người tạo (hàng 12) — đúng như hàng tạo tay. Lõi hiện chỉ cho **người tạo** đọc hàng «Chỉ
  tôi» (`canRead`): hàng Trưởng nhóm nhập cho Đầu chủ A sẽ là «Chỉ tôi» của Trưởng nhóm, A giữ căn mà không đọc được.
  Hỏi-5 ở Cổng Phạm vi.
- **Gói và lặp lại.** Gói > 200 dòng → 422. `import_rows` khoá duy nhất `(import_id, row_number)`: gửi lại gói đã ghi trả
  đúng kết quả cũ, không thêm hàng, sự kiện hay lead. Một dòng bị lõi từ chối thành `skip` có lý do, không lùi cả gói;
  lỗi bất ngờ lùi cả gói.

### Độ tươi theo ngày trong file (luật 11)

Sự kiện `owner_confirmed` nhận `confirmedAt` tuỳ chọn (lõi `events.ts`): ngày không sau lúc ghi, không trước mốc sàn (mặc
định 2 năm); `foldListing` lấy `confirmedAt` khi có, `occurredAt` khi không. Lần nhập chỉ ghi `owner_confirmed` khi dòng có
ô «Ngày xác nhận» hợp lệ; không có cột ngày thì hàng là «chưa xác nhận» (`lastConfirmedAt` rỗng). Mọi sự kiện khác của lần
nhập mang `confirmedWithOwner: false`, nên luật 9 không đóng dấu «vừa xác nhận hôm nay».

### Dữ liệu (migration 024)

`imports` (người, vai, tên tệp, băm, sheet, kiểu, hàng tiêu đề, kế hoạch JSON, trạng thái `planned → committed`, đếm) và
`import_rows` (số dòng, hành động, lý do, `listing_id`, `lead_id`, phiên bản hàng trước khi ghi — **không** giữ ô nguyên văn),
cả hai `company_internal`, bật và ép luật theo dòng theo `app.current_company_id()`, cấp cho `quy_hang_app`, có ca trong bộ
kiểm cách ly. `listing_events.import_id` (nullable, khoá ngoài theo sàn). Kế hoạch chỉ chứa tiêu đề và đích — lõi kiểm không
có giá trị của lớp nguồn trong `valueMap` của cột lớp nguồn. Hoàn tác (`reverted`, sự kiện `voided`) thuộc hàng 66, migration 025.

## Đối chiếu ngành

| Năng lực | RESO | Follow Up Boss | Lofty | Ta làm | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- | --- |
| Dòng trùng bản ghi đã có | — (không chuẩn hoá nhập) | Liên hệ đã có: không đổi người giữ, giai đoạn; báo «Updated» ([nguồn](https://help.followupboss.com/hc/en-us/articles/4402323033751)) | Bản ghi đã có thắng ở người giữ, giai đoạn; trường khác cập nhật; chủ tài khoản chỉnh cách đè ([nguồn](https://help.lofty.com/hc/en-us/articles/360054872172)) | Căn có hàng mở: người giữ cập nhật, người khác → tin bổ sung, không đổi người giữ | Cách xử dòng trùng cứng theo luật 20 — Lofty cho chủ tài khoản chọn |
| Trùng trong tệp | — | Gộp, báo «Duplicate» (nguồn trên) | chưa kiểm | Giữ dòng đầu, dòng sau bỏ có lý do; màn 65b cho chọn | — |
| Báo cáo lần nhập | — | Added · Updated · Duplicate | Lịch sử nhập, hoàn tác trong 24 giờ | Tạo · cập nhật · tin bổ sung · bỏ theo lý do; hoàn tác ở hàng 66 | — |
| Cỡ một lượt | — | chưa kiểm | 10.000 dòng một lượt | Gói 200 dòng, không trần số gói | — |

Cả hai sản phẩm nhập **liên hệ**, không nhập bảng hàng; nhập bảng hàng từ tệp của sàn vẫn **chưa kiểm** (Đối chiếu ngành §11).
Dòng «ta cứng — họ cấu hình» thành Hỏi-2 ở Cổng Phạm vi. Bài học Lofty (cấu hình cách đè) thêm vào Đối chiếu ngành §11.

## Lối đã so

| Câu | Lối chọn | Lối loại — vì sao |
| --- | --- | --- |
| Ai chuẩn hoá ô khi ghi | Máy chủ áp lại kế hoạch bằng lõi trên ô thô | Tin giá trị trình duyệt gửi: hai nguồn luật, trình duyệt sửa được giá trị qua mặt kiểm |
| Kiểm trùng ở xem trước | Cùng đường ghi với `dryRun`, lùi giao dịch | Hàm đếm riêng: hai bộ luật, xem trước nói một đằng, ghi làm một nẻo |
| Tin bổ sung | Lead «căn đã có hàng mở» qua phần ghi của lead | Bảng tin riêng: bề mặt mới, đầu chủ giữ căn không thấy ở chỗ đã quen (hàng 26) |
| Lỗi một dòng | Dòng thành «bỏ» có lý do, gói vẫn ghi | Lùi cả gói: một ô lạ chặn 199 dòng đúng |

## Đặc tả UX

Không có ở hàng này — màn thuộc hàng `man-nhap-excel` (65b, G-4). Chữ lý do trong bảng trên là chữ API trả để màn đọc.
