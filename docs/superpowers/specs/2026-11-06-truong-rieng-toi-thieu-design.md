# Trường riêng tối thiểu (hàng 47) — thiết kế

Ngày 06/11/2026 · dãy B đợt dau-khach-nhap · hạng T3 (chạm `packages/db`: bảng định nghĩa mới, cột `listings.custom`, mở
chỗ `contacts.custom`, loại sự kiện mới của hàng; migration 043 giám sát giữ chỗ cho hàng 47 — LUAT.md luật 74). Hồ sơ:
`_acceptance/truong-rieng-toi-thieu/`. Ô cơ hội đã ký Cổng Đáng (Manh Phan, 05/11, «build»). Đứng sau hàng 45
`cach-goi-rieng`, hàng 46 `trang-thai-rieng` (đã gộp, PR #149, #153) và hàng 85 (chỗ `contacts.custom`).

## Vấn đề

Tham chiếu §7 chốt ba lớp: lõi chuẩn · cách gọi riêng · trường riêng. Bản đầu có trường riêng kiểu «có / không» và
«chọn một» (29/10). Ba câu hỏi theo thứ tự trước khi thêm gì: cùng nghĩa khác tên → đổi tên (hàng 45); cùng trường khác
giá trị → giá trị riêng neo vào chuẩn (hàng 45, 70); thật sự mới → trường riêng. **Máy dò trùng nghĩa trước khi tạo
trường riêng.** Trường riêng ở lại trong sàn: hiện ở bảng hàng, lọc được, không lên trang khách, không lên Platform.

Câu giao (hàng 47, `bat_khi`): Quản trị sàn tạo trường riêng có / không hoặc chọn một chỉ sau khi máy dò không có trường
chuẩn cùng nghĩa; trường hiện ở Bảng hàng, lọc được, không bao giờ ra trang khách; liên hệ có trường riêng theo loại,
trường của liên hệ chủ nhà mang lớp nguồn và không rời công ty; sàn khác không thấy trường của nhau.

Ràng buộc đã có: ADR-0018 quyết định 8 (giá trị là `jsonb` trên bản hàng khoá theo mã trường, đổi giá trị là một sự kiện
của hàng, bảng định nghĩa theo sàn mang lớp `custom_field` cố định, không EAV); sổ điểm biến thiên #22 (tối đa 20 trường,
30 lựa chọn mỗi trường; bỏ trường thì ẩn, giữ giá trị đã lưu) và #23 (kèm khi phát hàng cho đội khác — để hàng sau);
ADR-0021 «Mục chờ cho hàng 47»: trường của liên hệ chủ nhà mang lớp nguồn, hàng 47 phải nới quyết định 8 có chủ đích —
quyết định mới, chủ kho duyệt (Hỏi-1).

## Cách làm

### 1. Lưu ở đâu (migration 043)

- **Bảng định nghĩa `custom_fields`** (ADR-0018 quyết định 8): `company_id`, `code` (mã máy dựng một lần từ chữ, khuôn
  `^[a-z][a-z0-9_]{0,31}$`, như mã nhãn hàng 46), `target` (`listing` | `contact`), `contact_types text[]` (chỉ với
  `contact`: tập con khác rỗng của Seller · Landlord · Buyer · Tenant; với `listing` là rỗng), `kind` (`bool` |
  `single_select`), `label`, `options jsonb` (mảng `{code, label}`; `bool` thì `[]`), `data_class`, `position`,
  `archived_at` (bỏ trường = đặt mốc, không xoá dòng), `updated_by`, `updated_at`. Khoá chính `(company_id, code)`.
  - **Lớp của dòng** (`data_class`) bị ràng buộc `check` theo đúng một luật: trường của hàng → `custom_field`; trường của
    liên hệ có loại Chủ bán hay Chủ cho thuê trong `contact_types` → `source`; trường chỉ của Người mua · Người thuê →
    `custom_field`. Đây là chỗ nới quyết định 8 (Hỏi-1). Lớp nói về GIÁ TRỊ người ta ghi vào trường; tên trường và lựa
    chọn là chữ sàn gõ, vẫn qua bộ dò số điện thoại, email, giấy tờ (`detectPersonal`).
  - Luật theo dòng: `enable` + `force`; đọc — người của đúng sàn; thêm, sửa — chỉ quản trị sàn và `updated_by` là người
    gọi (như `company_settings` ở 011). Không cấp `delete`. Bộ kiểm cách ly thêm ca cho bảng.
  - **Nhật ký**: bảng chỉ thêm `custom_field_events` (khuôn 026: trigger sau insert/update ghi mã, giá trị mới, người,
    vai; trigger chặn sửa, xoá, truncate). Mọi thay đổi cấu hình vào nhật ký (Tham chiếu §4).
- **Giá trị của hàng** — cột mới `listings.custom jsonb not null default '{}'` (object; khoá là mã trường, giá trị `true`
  · `false` · mã lựa chọn). Ghi bằng loại sự kiện mới `custom_changed`, payload phẳng `{<mã>: true | false | <mã lựa
  chọn> | null}` (`null` = xoá giá trị). Check `listing_events.type` viết lại thêm `custom_changed`. Bản gập
  (`stepListing`) trộn payload vào `custom`, bỏ khoá mang `null`. `STATE_COLUMNS` thêm `custom → custom`, nên đồng bộ
  xuống máy tự mang theo; `grant update (custom)` cho vai API.
- **Giá trị của liên hệ** — mở chỗ hàng 85 đã giữ: bỏ check `custom = '{}'`, thay bằng `jsonb_typeof(custom) = 'object'`.
  Vai API vẫn chỉ `select` trên `contacts`; ghi qua hàm `security definer` mới `app.set_contact_custom(p_contact uuid,
  p_patch jsonb)`: người gọi phải đọc được liên hệ (`app.contact_readable` — người giữ còn vai Đầu chủ, hay trưởng nhóm),
  mỗi khoá là mã một trường `contact` còn sống của sàn mà `contact_types` giao với loại của liên hệ, giá trị đúng kiểu;
  sai → lỗi nêu mã, không ghi gì. Đọc liên hệ (kể cả `custom`) đi qua luật đọc liên hệ sẵn có — giá trị trường lớp nguồn
  chỉ người giữ và trưởng nhóm thấy, đúng lớp nguồn đã niêm ở 036.

### 2. Lõi — `packages/core/src/custom-fields/`

- `kiemTruongRieng(bo, ngu)`: kiểm cả bộ trường của sàn trước khi ghi — chữ 1–40 ký tự sau khi bỏ khoảng trắng hai đầu,
  qua `detectPersonal`; `kind` một trong hai; `single_select` có 1–30 lựa chọn, chữ lựa chọn 1–40, không trùng trong
  trường; `contact` phải có ít nhất một loại; tối đa 20 trường còn sống mỗi sàn (sổ #22, gộp hàng và liên hệ); không
  trường còn sống nào trùng chữ (không phân biệt hoa thường, dấu, dấu cách thừa) với trường còn sống khác cùng đối tượng.
  Lỗi nêu khoá.
- `doTrungNghia(label, target, nguCanh)` — **máy dò trùng nghĩa**: trả trường chuẩn cùng nghĩa hay `null`. Với hàng: so
  `headerKey(label)` với từ điển tiêu đề dựng sẵn (`lookupHeader`, ADR-0011 quyết định 1 — đã biết «Toà», «Hướng», «PN»,
  «Phí CN»…), với nhãn mặc định của các cột Bảng hàng, và với tên riêng sàn đã đặt cho trường chuẩn (hàng 45). Với liên
  hệ: với tên các trường chuẩn của liên hệ (Họ tên, Số điện thoại, Loại, Đầu chủ giữ) và nhãn bốn loại. Trúng → tạo bị
  từ chối kèm tên trường chuẩn; màn chỉ sang Cách gọi («đổi tên ở Cách gọi», câu hỏi thứ nhất của §7). Chỉ chạy lúc
  TẠO trường mới; đổi tên trường đã có cũng chạy lại (tên mới không được trùng nghĩa). Tất định, không gọi AI (ADR-0018
  «Chi phí AI thêm: 0»).
- `lopTruongRieng(target, contactTypes)`: luật lớp ở trên — một chỗ, bên DB lặp lại bằng `check` và bài kiểm so hai bên.
- `maTruongMoi`, `maLuaChonMoi`: dựng mã từ chữ (bỏ dấu, `_`), thêm hậu tố khi trùng, kể cả trùng mã của trường đã bỏ
  (mã không bao giờ dùng lại — giá trị cũ không nhập nhầm trường mới).
- `kiemGiaTriTruong(bo, target, contactTypes?, patch)`: khoá là mã trường còn sống cùng đối tượng (liên hệ: cùng loại),
  giá trị đúng kiểu (`bool` ↔ `true`/`false`; `single_select` ↔ mã lựa chọn còn trong trường), `null` được; lỗi nêu mã.
- `chuGiaTri(truong, giaTri)`: «Có» · «Không» · chữ lựa chọn; mã đã không còn → rỗng.

### 3. API

- `GET /api/v1/company/fields` (mọi vai của sàn): `{ fields: [{ code, target, contactTypes, kind, label, options,
  dataClass, archived }] }` — trường còn sống trước, theo `position`. Bảng hàng, hồ sơ liên hệ đọc một lần.
- `PUT /api/v1/company/fields` (quản trị sàn): nhận toàn bộ bộ trường `[{ code?, target, contactTypes?, kind, label,
  options: [{ code?, label }], archived? }]`. Kiểm bằng `kiemTruongRieng`; trường mới không mã → chạy `doTrungNghia` rồi
  dựng mã; trúng → 409 `trung-nghia` nêu trường chuẩn. Kiểu, đối tượng, lớp của trường đã có không đổi được; lựa chọn đã
  có không gỡ được, chỉ đổi chữ (Hỏi-3); bỏ trường = `archived: true`. Ghi trong một giao dịch, CHỈ dòng đổi (như hàng
  45, 46) để nhật ký không phình. Người không phải quản trị → 403.
- `POST /listings/{id}/events` với `custom_changed`: `applyCommand` kiểm bằng `kiemGiaTriTruong` trên bộ trường của sàn;
  quyền như sửa hàng (bảng quyền 046 — người có Bảng hàng).
- `PATCH /api/v1/contacts/{id}/custom`: gọi `app.set_contact_custom`; hồ sơ liên hệ (`read/store.ts`) trả thêm `custom`.
- Trang khách, phát hàng, xuất bảng KHÔNG đổi mã ra: `banRaNgoai` là danh sách trắng (không có khoá `custom`), `xuatBang`
  bỏ cột không có khoá luật ẩn. Hàng này thêm mồi rò rỉ cho `custom` và chứng bằng bài kiểm (bất biến 4).

### 4. Ba mặt

- **Cài đặt › Sàn › Trường riêng** (`settings/fields/`, mục đã có trong `MUC_SAN`, thay trang tạm «mục 47»): hai nhóm
  «Trường của hàng» và «Trường của liên hệ». Mỗi trường một dòng: chữ (sửa tại chỗ), kiểu, lựa chọn (chọn một), loại
  liên hệ (liên hệ), huy hiệu «Thông tin chủ nhà» khi lớp nguồn, nút «Bỏ trường». «Thêm trường» mở khối tạo: tên → máy dò
  ngay khi gõ; trúng thì khối nói «Đã có trường «Toà» — đổi tên ở Cách gọi» kèm liên kết, khoá «Lưu»; không trúng thì
  chọn kiểu, lựa chọn, loại liên hệ ngay trên dòng ấy.
- **Bảng hàng** (máy tính): mỗi trường của hàng còn sống là một cột (sau các cột chuẩn, ẩn được như cột khác); ô hiện «Có»
  · «Không» · chữ lựa chọn; trình sửa ô là thực đơn chọn (có «Bỏ trống»), lệnh `custom_changed`; ô lọc cột là lọc «chọn»
  trên đúng các giá trị; góc nhìn đã lưu giữ được cột và bộ lọc của trường riêng còn sống. Thẻ điện thoại không đổi ở
  vòng này (Hỏi-4).
- **Hồ sơ liên hệ** (`contacts/ho-so.tsx`): mục mới «Trường riêng» sau «Số», liệt các trường còn sống mà loại giao với loại
  của người này; người giữ và trưởng nhóm sửa được (thực đơn chọn, lưu ngay). Liên hệ không có loại nào khớp → không hiện
  mục.

### 5. Không ra ngoài

- Bản ra (`banRaNgoai`), bản xuất (`xuatBang`), thân trang khách công khai, thân thoả thuận AI: không mang `custom` hay chữ
  trường riêng. `mayFlow` vẫn từ chối `custom_field` và `source`. Liên hệ không ra ngoài sẵn (`LOP_TRUONG.contacts =
  source`).
- Kèm trường riêng khi phát hàng cho đội khác (#23) để hàng sau — vòng này trường riêng không bao giờ ra.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Sàn [Tên] › Trường riêng → nhóm «Trường của hàng», «Thêm trường», gõ «Căn góc» → máy dò không trùng →
  chọn «Có / Không» → Lưu → «Đã lưu trường riêng» (điểm ra: Bảng hàng có cột «Căn góc», đặt «Có» cho một căn,
  lọc cột thấy đúng căn ấy).
- Suôn sẻ (liên hệ): nhóm «Trường của liên hệ», «Thêm trường», «Nguồn khách» · «Chọn một» với ba lựa chọn · loại Người mua,
  Người thuê → Lưu; hồ sơ một Người mua có mục «Trường riêng» với «Nguồn khách».
- Biên: sàn chưa có trường → hai nhóm trống kèm một câu hướng dẫn ba câu hỏi của §7; đủ 20 trường → không còn «Thêm
  trường»; trường của liên hệ có loại Chủ bán → huy hiệu «Thông tin chủ nhà»; người không quản trị mở đường này → về Cá
  nhân kèm câu «Mục này chỉ quản trị sàn mở được».
- Lỗi & quay lại: tên trùng nghĩa trường chuẩn → khối báo «Đã có trường «[tên]» — đổi tên ở Cách gọi» + liên kết, «Lưu»
  khoá; tên trùng trường riêng khác, có số điện thoại / email, quá 40 ký tự, chọn một không có lựa chọn → ô viền đỏ kèm
  câu lỗi, «Lưu» khoá; bỏ trường → hộp hỏi «Bỏ trường «[tên]»? Giá trị đã ghi vẫn giữ, trường thôi hiện.»; máy chủ từ
  chối → khối báo lỗi ở chân Frame, chữ gõ giữ nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trường riêng | Thêm, đổi tên, bỏ trường riêng của hàng và liên hệ | Cột Cài đặt › Sàn / Bảng hàng, hồ sơ liên hệ, Cách gọi |
| Khối tạo trường | Đặt tên, máy dò trùng nghĩa, chọn kiểu, lựa chọn, loại liên hệ | Nút «Thêm trường» / quay về màn Trường riêng |
| Hộp bỏ trường | Xác nhận bỏ một trường | Nút «Bỏ trường» / quay về màn Trường riêng |
| Cột trường riêng ở Bảng hàng | Xem, đặt, lọc giá trị trường riêng của căn | Bảng hàng / trình sửa ô, ô lọc |
| Mục «Trường riêng» ở hồ sơ liên hệ | Xem, đặt giá trị trường riêng của một người | Hồ sơ liên hệ / — |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-truong-trong | Trường riêng | Hai nhóm trống, câu hướng dẫn ba câu hỏi, nút «Thêm trường» | Thêm trường |
| ST-truong-co | Trường riêng | Dòng mỗi trường: tên, kiểu, lựa chọn, loại liên hệ, huy hiệu lớp nguồn, «Bỏ trường» | Đổi tên hay bỏ |
| ST-truong-du-20 | Trường riêng | Đủ 20 trường, không còn «Thêm trường», câu nêu trần | Bỏ bớt để thêm |
| ST-truong-trung-nghia | Khối tạo trường | «Đã có trường «[tên]» — đổi tên ở Cách gọi» + liên kết, «Lưu» khoá | Mở Cách gọi hay đổi tên |
| ST-truong-loi-o | Trường riêng | Ô viền đỏ + câu lỗi, «Lưu» khoá | Sửa chữ |
| ST-truong-hoi-bo | Hộp bỏ trường | «Bỏ trường «[tên]»? Giá trị đã ghi vẫn giữ, trường thôi hiện.» | Xác nhận hay huỷ |
| ST-truong-dang-luu | Trường riêng | «Lưu» khoá kèm «Đang lưu…» | Chờ |
| ST-truong-da-luu | Trường riêng | «Đã lưu trường riêng» ở chân Frame | Mở Bảng hàng |
| ST-truong-loi-may-chu | Trường riêng | `TrangThai kind="error"` ở chân, chữ gõ giữ nguyên | Lưu lại |
| ST-truong-khong-quyen | Trường riêng | Chuyển về Cá nhân kèm câu báo (KH-cd-khong-quyen) | — |
| ST-cot-truong-rieng | Cột ở Bảng hàng | Ô «Có» · «Không» · chữ lựa chọn · rỗng; ô lọc liệt các giá trị | Sửa ô hay lọc |
| ST-ho-so-truong-rieng | Mục ở hồ sơ liên hệ | Các trường khớp loại người này, giá trị hay «Chưa ghi» | Chọn giá trị |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Tên 1–40 ký tự sau khi bỏ khoảng trắng hai đầu; máy dò chạy ngay khi gõ bằng cùng hàm lõi máy chủ dùng. Kiểu, đối tượng,
  loại liên hệ chỉ chọn lúc tạo; sau đó chỉ đổi tên và thêm lựa chọn. Tab theo thứ tự dòng; Enter trong ô không gửi form.
  Máy tính là chính; điện thoại một cột.
- Bảng hàng: cột trường riêng đứng sau các cột chuẩn, chữ ô theo `chuGiaTri`; trình sửa ô có «Bỏ trống» ở cuối.
- Hồ sơ liên hệ: chọn xong lưu ngay, lỗi máy chủ thì giá trị về như cũ kèm câu báo.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `MucCaiDat` (khuôn cai-dat-san) | dùng | Khuôn bắt buộc của mọi mục Cài đặt sàn |
| `SettingField` (settings-3 đã chuyển) | dùng | Dòng nhãn + mô tả + ô của khối đích Cài đặt sàn, như Cách gọi, Trạng thái |
| `Badge` biến thể `-light` | dùng | Kiểu trường và huy hiệu «Thông tin chủ nhà» |
| `AlertDialog` | dùng | Hộp bỏ trường — thành phần đã cài |
| `Input`, `Button`, `RadioGroup`, `Checkbox`, `Select`, `TrangThai` | dùng | Thành phần đã cài |
| Lưới Bảng hàng (ADR-0004), `MucHoSo` của hồ sơ liên hệ | dùng | Cột và mục mới đi đúng khuôn sẵn có |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — một form hai nhóm, tối đa 20 dòng, thuộc khối đích `settings-3` của Cài đặt sàn
(`vo-va-ia.md` dòng Cài đặt sàn), anh em với Cách gọi và Trạng thái; không có khuôn khả dĩ thứ hai nên không tra mẫu.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Quản trị sàn |
| Việc chính | Thêm trường thật sự mới của sàn cho hàng và liên hệ, sau khi máy dò không có trường chuẩn cùng nghĩa |
| Tần suất | hiếm |
| Số bản ghi | vài chục |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm 1 | Sản phẩm 2 | Ta định làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Trường riêng của sàn | Trường riêng (local field) được thêm; trường trùng nghĩa trường chuẩn thì bắt buộc dùng tên chuẩn ([Extensibility & Omissibility](https://reso.org/blog/extensibility-omissibility-dd)) | Follow Up Boss: bốn kiểu (ngày, chữ, số, chọn), chỉ chủ tài khoản tạo, tạo xong không đổi kiểu được ([Custom Fields](https://help.followupboss.com/hc/en-us/articles/360015273733-Custom-Fields)) | Lofty: sáu kiểu ([Custom Fields](https://help.lofty.com/hc/en-us/articles/360054872212-Custom-Fields)); KW Command: trường riêng của liên hệ tự tạo ([Custom Fields](https://answers.kw.com/hc/en-us/articles/27377858519059-Create-and-Edit-Custom-Fields-for-Contacts)) | Hai kiểu «có / không» và «chọn một»; máy dò trùng nghĩa trước khi tạo; kiểu cố định sau khi tạo | Chỉ hai kiểu (Tham chiếu §7, 29/10 — chữ, số, ngày để sau) · trần 20 trường, 30 lựa chọn (sổ #22) · lựa chọn đã có không gỡ (Hỏi-3) |
| Trường riêng theo loại liên hệ | `Contacts` không có loại trường theo vai | KW Command: trường riêng cho liên hệ, không nêu theo loại — chưa kiểm | Follow Up Boss: trường riêng áp cho mọi người — chưa kiểm theo loại | Trường của liên hệ khai loại áp dụng; trường của chủ nhà mang lớp nguồn | Lớp theo loại cố định ở lõi (bất biến 2) |
| Bỏ trường đang có dữ liệu | Không nói | Follow Up Boss: xoá trường — chưa kiểm dữ liệu | Lofty: chưa kiểm | Bỏ = ẩn, giữ giá trị (sổ #22), mã không dùng lại | — |

## Câu chỉ người có (Cổng Phạm vi)

- **Hỏi-1** — Nới ADR-0018 quyết định 8: trường của liên hệ có loại Chủ bán hay Chủ cho thuê mang lớp `source` (ràng buộc
  `check` theo một luật ở lõi và cơ sở dữ liệu); giá trị nằm trong `contacts.custom`, đọc theo luật đọc liên hệ (người giữ
  còn vai Đầu chủ, trưởng nhóm), ghi qua một hàm `security definer`, không bao giờ ra ngoài (khuyến nghị — đúng câu giao và
  mục chờ ADR-0021; bảo vệ dựa trên luật đọc liên hệ đã niêm ở 036, không mở thêm cửa). Lối khác: giữ quyết định 8 nguyên
  văn — trường riêng chỉ cho Người mua · Người thuê, liên hệ chủ nhà không có trường riêng ở bản đầu. Chạm bất biến 2 —
  quyết định mới của chủ kho, ADR-0018 và ADR-0021 ghi lại trong cùng PR.
- **Hỏi-2** — Máy dò trùng nghĩa là so tên tất định (bỏ dấu, chữ thường) với từ điển tiêu đề dựng sẵn của nhập Excel, nhãn
  cột Bảng hàng, tên riêng sàn đặt cho trường chuẩn và tên trường chuẩn của liên hệ; trúng thì CHẶN tạo và chỉ sang Cách gọi
  (khuyến nghị — đúng thứ tự ba câu hỏi §7 và RESO «trùng nghĩa thì dùng tên chuẩn»; tất định, không chi phí AI). Lối
  khác: chỉ cảnh báo, vẫn cho tạo — sàn có thể đặt «Hướng ban công» làm trường riêng song song với trường chuẩn Hướng.
- **Hỏi-3** — Trường đã tạo: đổi tên được, thêm lựa chọn được; kiểu, đối tượng, loại liên hệ cố định; lựa chọn đã có
  không gỡ, chỉ đổi chữ; bỏ trường = ẩn, giữ giá trị (khuyến nghị — giá trị đã ghi không bao giờ trỏ vào lựa chọn chết;
  quản trị sàn từ 046 không đọc hàng nên không đếm được căn mang một lựa chọn mà không mở thêm cửa hẹp như 049). Lối khác:
  cho gỡ lựa chọn có hỏi lựa chọn thay như nhãn trạng thái — thêm một cửa hẹp đếm và chuyển giá trị.
- **Hỏi-4** — Trường riêng của hàng hiện ở Bảng hàng trên máy tính (cột, trình sửa ô, ô lọc, góc nhìn đã lưu); thẻ điện
  thoại, hồ sơ căn, nhập Excel ghép vào trường riêng để hàng sau (khuyến nghị — câu giao đòi «hiện ở Bảng hàng, lọc được»;
  mỗi mặt thêm là một khuôn riêng). Lối khác: thêm cả hồ sơ căn — mục mới trong hồ sơ, thêm eval chụp.
- **Hỏi-5** — Trần 20 trường còn sống MỖI SÀN, gộp trường của hàng và của liên hệ (khuyến nghị — đúng chữ sổ #22, lý do
  nền tảng: cột Bảng hàng và mục hồ sơ giữ gọn). Lối khác: 20 cho hàng và 20 cho liên hệ — sửa dòng #22.

- **Hỏi-6** — Vòng này trường riêng KHÔNG đi kèm khi phát hàng cho nhóm môi giới hay đội khác, kể cả khi góc nhìn có cột
  trường riêng (khuyến nghị — sổ #23 «kèm khi phát hàng cho đội khác» là một công tắc theo trường cần mồi rò rỉ và luật
  ẩn riêng; giữ không ra cho tới hàng ấy). Lối khác: thêm công tắc «kèm khi phát hàng» từng trường ngay vòng này — nới trần
  `by_company_toggle` trong luật ẩn, thêm mồi cho bản phát, AC-5 đổi thành «chỉ trường đã bật».

## Ngoài phạm vi

- Kiểu chữ, số, ngày (Tham chiếu §7 «để sau»).
- Kèm trường riêng khi phát hàng cho đội khác (#23) — vòng này trường riêng không bao giờ ra.
- Trường riêng ở thẻ điện thoại, hồ sơ căn, nhập Excel ghép vào trường riêng (ADR-0011 `custom:` của kế hoạch nhập), thao
  tác hàng loạt (Hỏi-4).
- Gỡ một lựa chọn đã có; đổi kiểu, đối tượng, loại liên hệ của trường đã tạo (Hỏi-3).
- Lịch sử từng lần đổi giá trị trường riêng của liên hệ (liên hệ chưa có bảng sự kiện; giá trị của hàng đi qua sự kiện).
