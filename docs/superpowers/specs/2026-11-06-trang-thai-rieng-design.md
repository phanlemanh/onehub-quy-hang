# Trạng thái riêng (hàng 46) — thiết kế

Ngày 06/11/2026 · dãy B đợt dau-khach-nhap · hạng T3 (chạm `packages/db`: cột mới của `listings` và nới check khoá
`company_settings`; migration 047, giám sát cấp ở yêu cầu B-17). Hồ sơ: `_acceptance/trang-thai-rieng/`. Ô cơ hội đã ký
Cổng Đáng (Manh Phan, 05/11, «build»). Đứng sau hàng 45 `cach-goi-rieng` (đã gộp, PR #149) và hàng 82.

## Vấn đề

Sàn nói trạng thái bằng chữ của mình: «Giữ chỗ» khác «Đã cọc» trong nghiệp vụ, nhưng cả hai đều là Đang giao dịch —
căn không gửi mới được, khách thấy «đang giao dịch», báo cáo đếm vào một ô. Tham chiếu §5 chốt: sáu trạng thái chuẩn,
«sàn thêm nhãn, không thêm nghĩa»; «Giữ chỗ» phải neo vào một trạng thái chuẩn và nhận luật, màu của trạng thái đó;
không có trạng thái thứ bảy. Sổ điểm biến thiên #21 đã khai `labels.status.<nhãn>`: tối đa 3 nhãn riêng mỗi trạng thái
chuẩn, quản trị sàn đổi, lớp `company_internal`.

Câu giao (hàng 46, `bat_khi`): Quản trị sàn thêm nhãn «Giữ chỗ» neo vào một trong sáu trạng thái chuẩn, căn mang nhãn ấy
nhận đúng luật và màu của trạng thái neo ở Bảng hàng, Hôm nay và trang khách; không neo thì không lưu được; xoá nhãn
đang dùng thì máy hỏi trạng thái thay; báo cáo vẫn đếm theo sáu trạng thái chuẩn.

Khác hàng 45: tên riêng của giá trị phí là ĐỔI TÊN một giá trị (mỗi giá trị chuẩn đúng một chữ, căn không cần nhớ gì).
Nhãn trạng thái là THÊM NHÃN: nhiều nhãn neo cùng một trạng thái chuẩn, nên căn phải nhớ nó mang nhãn nào — đó là lý do
hàng này chạm bảng `listings`.

## Cách làm

### 1. Lưu ở đâu (migration 047)

- **Định nghĩa nhãn** — `company_settings`, mỗi nhãn một khoá `labels.status.<mã>` (sổ #21), giá trị
  `{"label": "Giữ chỗ", "anchor": "Pending"}`; gỡ nhãn = ghi JSON `null` (như hàng 45: trigger nhật ký 026 chỉ bắt
  insert/update, nên gỡ cũng để một sự kiện ghi người đổi). `<mã>` là chữ máy dựng một lần lúc tạo từ chữ nhãn bỏ dấu
  (`giu_cho`; trùng thì thêm `_2`), không đổi khi đổi tên — căn trỏ vào mã, nên đổi tên không đụng căn nào.
  Migration nới check khoá thêm họ `^labels\.status\.[a-z][a-z0-9_]{0,31}$`, giữ hai họ cũ của 039.
- **Nhãn của căn** — cột mới `listings.status_label text null` (rỗng = nhãn mặc định của trạng thái chuẩn), check khuôn
  mã như trên. Không khoá ngoại sang `company_settings` (khoá là chữ, và nhãn gỡ không được kéo căn đi theo): căn trỏ một
  mã không còn định nghĩa thì hiện chữ mặc định của trạng thái neo — không mất dữ liệu.
- **Sự kiện** — `status_changed` nhận thêm khoá tuỳ chọn `label` (mã nhãn hay `null`). Bản gập (`stepListing`) đặt
  `statusLabel = p.label ?? null` ở MỌI `status_changed`: đổi trạng thái mà không chọn nhãn là về nhãn mặc định, nên một
  căn «Giữ chỗ» chuyển sang Đang bán không mang nhãn cũ theo. Không loại sự kiện mới (check `listing_events.type` giữ
  nguyên).
- **Đổi nhãn trong cùng trạng thái** («Đã cọc» → «Giữ chỗ», cả hai Đang giao dịch) đi bằng `status_changed` với `to`
  bằng trạng thái hiện tại và `label` khác nhãn hiện tại. Lõi nhận đúng một ngoại lệ ấy của bảng chuyển; `to` trùng mà
  nhãn cũng trùng vẫn là «không chuyển được».
- **Chỗ đọc `payload->>'to'`** (rà ở S1: `listings/store.ts` dữ kiện «đã từng tới», `listings/lan-doi.ts` lần đổi gần nhất,
  `today/store.ts`, `today-buyer/store.ts`, `contacts/read/store.ts`, hàm SQL của migration 015/016/021/037): hàm SQL và
  «đã từng tới» hỏi «có từng lên Đang bán sau mốc X» — một sự kiện đổi nhãn không đổi kết quả. Riêng `lan-doi.ts` tách hai
  nghĩa: **lần đổi gần nhất** (nhóm «Mới đổi» của Hôm nay) GỒM sự kiện đổi nhãn và mang thêm `fromLabel`/`toLabel`; **lúc
  vào trạng thái hiện tại** (mốc «Đang bán N ngày») BỎ QUA sự kiện có `to` bằng trạng thái trước — đổi nhãn trong Đang bán
  không đặt lại số ngày. Một bài quét liệt mọi chỗ đọc, mỗi chỗ một assert (E6c).

### 2. Lõi — `packages/core/src/statuses/`

- `NHAN_TRANG_THAI_MAC_DINH`: nhãn mặc định của sáu trạng thái — chuyển từ `STATUS_LABEL` của `inventory/cot.ts` về lõi
  (một chỗ có tên, `.claude/rules/thiet-ke-doi-chieu.md`); `cot.ts` đọc lại từ đây, chữ không đổi.
- `kiemNhanTrangThai(bo)`: kiểm cả bộ nhãn của sàn trước khi ghi — chữ 1–40 ký tự sau khi bỏ khoảng trắng hai đầu, qua bộ
  dò số điện thoại, email, giấy tờ (`detectPersonal`, như hàng 45); neo PHẢI là một trong sáu trạng thái chuẩn; tối đa 3
  nhãn còn sống mỗi neo (sổ #21); chữ nhãn không trùng (không phân biệt hoa thường, bỏ dấu cách thừa) với nhãn riêng khác
  hay với nhãn mặc định của BẤT KỲ trạng thái nào — bài học Ngoài-1/3 của hàng 45: hai nghĩa không được hiện cùng một chữ.
  Lỗi nêu khoá.
- `maNhanMoi(chu, daCo)`: dựng mã từ chữ (bỏ dấu, chữ thường, `_`), thêm hậu tố khi trùng.
- `boNhanTrangThai(dong)`: từ dòng `{key, value}` → `NhanTrangThai[] = {ma, label, anchor}`; dòng hỏng hay `null` bỏ qua.
- `nhanCuaCan(nhanSan, standardStatus, statusLabel)`: chữ hiện của một căn — nhãn riêng khi mã còn sống VÀ neo đúng trạng
  thái của căn, không thì nhãn mặc định. Màu không có hàm riêng: màu đọc theo `standardStatus` như cũ.
- `kiemNhanSuKien(nhanSan, hienTai, payload)`: lệnh đổi trạng thái mang `label` thì mã phải còn sống trong bộ nhãn của sàn
  và neo đúng `payload.to`; lỗi nêu mã.
- Đếm và báo cáo (`metrics/hang.ts`) đọc `standardStatus`, không đổi.

### 3. API

- `GET /api/v1/company/statuses` (mọi vai): `{ statuses: [{ status, default, labels: [{ code, label, inUse }] }] }` — sáu
  dòng theo thứ tự chuẩn; `inUse` = số căn đang mang nhãn (đếm trong sàn).
- `PUT /api/v1/company/statuses` (quản trị sàn): nhận toàn bộ bộ nhãn `[{ code?, label, anchor }]` cộng `replace:
  { <mã bị gỡ>: <mã thay> | null }`. Kiểm bằng `kiemNhanTrangThai`; nhãn mới không mã → máy dựng mã; ghi trong một giao
  dịch, CHỈ khoá đổi (như hàng 45). Nhãn bị gỡ mà còn căn mang → thân PHẢI có `replace` cho mã ấy, và mã thay phải cùng
  neo (hay `null` = nhãn mặc định); thiếu → 409 kèm số căn. Có `replace` → mỗi căn mang nhãn gỡ nhận MỘT sự kiện
  `status_changed {to: trạng thái hiện tại, label: mã thay}` ghi bằng tên quản trị, qua cùng hàm ghi sự kiện của lõi hàng
  — không sửa thẳng bản tính. Neo của một nhãn đã có không đổi được (đổi neo = gỡ rồi tạo).
- `GET /api/v1/company/labels` (hàng 45) thêm `statuses` chỉ đọc, deepEqual thân `GET /company/statuses`, để `docTuVung`
  của Bảng hàng và Hôm nay đọc một lần (E7c); màn đọc bằng hàm `nhanTuBang` của lõi (khuôn `code` → `ma`).
- `POST /listings/{id}/events` với `status_changed` mang `label`: `applyCommand` gọi `kiemNhanSuKien` sau
  `checkTransition`; cột chiếu `statusLabel → status_label` thêm vào `STATE_COLUMNS` (đồng bộ xuống máy tự mang theo).
- Trang khách và phát hàng KHÔNG đổi: `banRaNgoai` chỉ đưa `availability` của trạng thái chuẩn — căn «Giữ chỗ» ra ngoài
  là «đang giao dịch», đúng luật của neo; chữ nhãn riêng không bao giờ ra (Hỏi-2).

### 4. Ba mặt

- **Bảng hàng** (`inventory/`): ô Trạng thái hiện `nhanCuaCan`; huy hiệu giữ màu `STATUS_BADGE` theo trạng thái chuẩn
  (neo). Trình sửa ô: thực đơn mỗi nấc đích liệt nhãn mặc định rồi các nhãn riêng neo vào nấc ấy; đang ở một nấc có nhãn
  riêng thì thêm các nhãn khác cùng nấc (đổi nhãn tại chỗ). Lọc «chọn» cột Trạng thái vẫn theo trạng thái chuẩn — lọc
  «Đang giao dịch» gồm cả căn «Giữ chỗ»; lựa chọn của ô lọc hiện nhãn mặc định (Hỏi-4). Thẻ điện thoại: căn Đang giao
  dịch hiện nhãn của căn thay chữ cứng «Đang giao dịch», màu giữ `info-light`.
- **Hôm nay** (đầu chủ): nhóm «Mới đổi» (`changed_by_other`) — người khác đổi căn sang «Giữ chỗ» thì dòng lý do đọc «Đang
  bán → Giữ chỗ — Trưởng nhóm, hôm nay»; đổi nhãn tại chỗ đọc «Đang giao dịch → Giữ chỗ — …»; gỡ nhãn có thay ghi sự kiện
  bằng tên quản trị nên các căn ấy hiện ở «Mới đổi» với dòng «Giữ chỗ → Đang giao dịch — Quản trị sàn» (đúng sự thật, đầu
  chủ biết nhãn căn mình vừa đổi). Hàng đợi khác lọc theo trạng thái chuẩn như cũ.
- **Trang khách** `/s/<mã>`: không đổi mã — chứng bằng bài kiểm rằng căn mang nhãn riêng ra ngoài như căn Đang giao dịch
  và thân không mang chữ nhãn.
- Hồ sơ căn, màn gọi, thao tác hàng loạt, Liên hệ giữ nhãn mặc định ở vòng này (Ngoài phạm vi); căn «Giữ chỗ» ở đó hiện
  «Đang giao dịch».

### 5. Màn «Trạng thái» — `settings/statuses/`

Khuôn `cai-dat-san` (`MucCaiDat`, `chanMucSan`), khối đích `settings-3` đã chuyển thể (`SettingField`), như Cách gọi.
Một Frame, sáu nhóm theo sáu trạng thái chuẩn: dòng đầu nhóm là huy hiệu màu của trạng thái + nhãn mặc định; dưới là các
nhãn riêng (ô chữ · số căn đang mang · nút gỡ) và nút «Thêm nhãn» (ẩn khi đủ 3). Chân Frame: «Lưu». Gỡ một nhãn đang có
căn mang → hộp hỏi «[n] căn đang là «Giữ chỗ». Chuyển chúng sang:» với lựa chọn các nhãn còn lại của cùng trạng thái và
nhãn mặc định; chọn xong mới lưu được.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Sàn [Tên] › Trạng thái → nhóm Đang giao dịch, «Thêm nhãn», gõ «Giữ chỗ» → Lưu → «Đã lưu trạng
  thái» (điểm ra: Bảng hàng, mở ô Trạng thái của một căn Đang bán thấy lựa chọn «Giữ chỗ»).
- Biên: sàn chưa thêm nhãn → sáu nhóm chỉ có nhãn mặc định; nhóm đủ 3 nhãn → không còn «Thêm nhãn»; người không quản trị
  mở đường này → về Cá nhân kèm câu «Mục này chỉ quản trị sàn mở được».
- Lỗi & quay lại: chữ trùng tên một trạng thái hay nhãn khác, có số điện thoại / email, quá 40 ký tự → ô viền đỏ kèm câu
  lỗi, Lưu khoá; gỡ nhãn đang có căn mang → hộp hỏi nhãn thay, huỷ hộp thì nhãn còn nguyên; máy chủ từ chối → khối báo
  lỗi ở chân Frame, chữ gõ giữ nguyên.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Trạng thái | Thêm, đổi tên, gỡ nhãn riêng neo vào sáu trạng thái chuẩn | Cột Cài đặt › Sàn / Bảng hàng, Hôm nay |
| Hộp chọn nhãn thay | Chọn nhãn cho các căn đang mang nhãn sắp gỡ | Nút gỡ của một nhãn đang dùng / quay về màn Trạng thái |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-trang-thai-mac-dinh | Trạng thái | Sáu nhóm, mỗi nhóm huy hiệu màu + nhãn mặc định, nút «Thêm nhãn» | Thêm nhãn |
| ST-trang-thai-co-nhan | Trạng thái | Nhãn riêng dưới nhóm neo, số căn đang mang, nút gỡ | Đổi tên hay gỡ |
| ST-trang-thai-du-ba | Trạng thái | Nhóm có 3 nhãn riêng, không còn «Thêm nhãn» | Gỡ bớt để thêm |
| ST-trang-thai-loi-o | Trạng thái | Ô viền đỏ + câu lỗi dưới ô, «Lưu» khoá | Sửa chữ |
| ST-trang-thai-hoi-thay | Hộp chọn nhãn thay | «[n] căn đang là «[nhãn]». Chuyển chúng sang:» + lựa chọn cùng nhóm | Chọn rồi xác nhận, hay huỷ |
| ST-trang-thai-dang-luu | Trạng thái | «Lưu» khoá kèm «Đang lưu…» | Chờ |
| ST-trang-thai-da-luu | Trạng thái | Câu «Đã lưu trạng thái» ở chân Frame | Mở Bảng hàng |
| ST-trang-thai-loi-may-chu | Trạng thái | `TrangThai kind="error"` ở chân, chữ gõ giữ nguyên | Lưu lại |
| ST-trang-thai-khong-quyen | Trạng thái | Chuyển về Cá nhân kèm câu báo (KH-cd-khong-quyen) | — |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Chữ 1–40 ký tự sau khi bỏ khoảng trắng hai đầu; ô rỗng ở nhãn mới = bỏ dòng ấy. Kiểm ngay khi gõ bằng cùng hàm lõi máy
  chủ dùng. Tab theo thứ tự nhóm; Enter trong ô không gửi form. Máy tính là chính; điện thoại một cột.
- Trình sửa ô Trạng thái ở Bảng hàng: nhãn riêng đứng ngay dưới nhãn mặc định của nấc neo, cùng huy hiệu màu.

### 5. Xuất xứ component

| Component | Nấc | Vì sao (1 dòng) |
|---|---|---|
| `MucCaiDat` (khuôn cai-dat-san) | dùng | Khuôn bắt buộc của mọi mục Cài đặt sàn |
| `SettingField` (settings-3 đã chuyển) | dùng | Dòng nhãn + mô tả + ô của khối đích Cài đặt sàn, như Cách gọi |
| `Badge` biến thể `-light` | dùng | Màu của trạng thái chuẩn, cùng bảng `STATUS_BADGE` của Bảng hàng |
| `AlertDialog` | dùng | Hộp hỏi nhãn thay — thành phần đã cài, đúng mẫu xác nhận trước thao tác có hệ quả |
| `Input`, `Button`, `RadioGroup`, `TrangThai` | dùng | Thành phần đã cài |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: luồng hiển nhiên — một form sáu nhóm, tối đa 24 dòng, thuộc khối đích `settings-3` của Cài đặt sàn
(`vo-va-ia.md` dòng Cài đặt sàn), anh em với màn Cách gọi; không có khuôn khả dĩ thứ hai nên không tra mẫu.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Quản trị sàn |
| Việc chính | Thêm nhãn trạng thái của sàn neo vào trạng thái chuẩn để mọi màn nói chữ của sàn |
| Tần suất | hiếm |
| Số bản ghi | vài chục |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->

## Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Sản phẩm 1 | Sản phẩm 2 | Ta định làm | Ta cứng — họ cấu hình |
|---|---|---|---|---|---|
| Nhãn trạng thái của sàn neo vào trạng thái chuẩn | `StandardStatus` cố định; `MlsStatus` do MLS đặt, mỗi giá trị neo đúng một `StandardStatus` ([StandardStatus](https://dd.reso.org/DD2.0/Property/StandardStatus/), [MlsStatus](https://dd.reso.org/DD2.0/Property/MlsStatus/)) | Follow Up Boss: stage hệ thống («Lead», «Closed», «Trash») không đổi tên hay xoá, phần còn lại thêm, đổi tên, xoá ([Custom Stages](https://help.followupboss.com/hc/en-us/articles/4402370671767-Custom-Stages)) | KW Command: năm Phase cố định, stage tự đặt trong từng Phase ([Customize Your Opportunity Pipelines](https://answers.kw.com/hc/en-us/articles/55206011386643-Customize-Your-Opportunity-Pipelines)) | Sáu trạng thái chuẩn giữ ở lõi; sàn thêm tối đa 3 nhãn neo mỗi trạng thái; nhãn nhận luật và màu của neo | Trần 3 nhãn mỗi neo (FUB, KW không nêu trần — chưa kiểm) · neo không đổi sau khi tạo (Hỏi-5) |
| Xoá một stage đang dùng | Không nói | FUB: xoá stage đang có người thì chuyển họ sang stage khác — chưa kiểm cách hỏi | Lofty: stage mặc định không xoá được, phần giữa tự thêm ([Pipeline Stages](https://help.lofty.com/hc/en-us/articles/115002890651-Lead-Organization-with-Pipeline-Stages)) | Gỡ nhãn đang dùng → hỏi nhãn thay cùng neo, mỗi căn một sự kiện | — |

## Câu chỉ người có (Cổng Phạm vi)

- **Hỏi-1** — Định nghĩa nhãn ở `company_settings` (mỗi nhãn một khoá `labels.status.<mã>`, nới check), căn mang mã ở cột
  mới `listings.status_label`, sự kiện `status_changed` thêm khoá `label` (khuyến nghị — đúng sổ #21, không bảng mới, không
  loại sự kiện mới). Lối khác: bảng riêng `company_status_labels` có khoá ngoại từ `listings` — thêm bảng, luật dòng,
  trigger nhật ký riêng; đổi lại chặn được căn trỏ mã đã gỡ ở cơ sở dữ liệu.
- **Hỏi-2** — Trang khách và bản phát hàng cho đội khác hiện chữ của trạng thái chuẩn («đang giao dịch»), không hiện nhãn
  riêng (khuyến nghị — nhãn là lớp `company_internal` theo sổ #21; «nhận đúng luật của neo» ở trang khách là chính
  `availability` của neo). Lối khác: cho nhãn ra ngoài qua `tuVungRaNgoai` như tên riêng của phí — phải nâng lớp dữ liệu và
  thêm mồi rò rỉ.
- **Hỏi-3** — Gỡ nhãn đang dùng: máy hỏi nhãn thay CÙNG trạng thái chuẩn (nhãn riêng khác hay nhãn mặc định), rồi mỗi căn
  nhận một sự kiện ghi tên quản trị (khuyến nghị — không đổi trạng thái chuẩn hàng loạt, vì đổi trạng thái đi qua bảng
  chuyển và điều kiện từng căn). Lối khác: cho chọn trạng thái chuẩn khác — mỗi căn phải qua `checkTransition`, căn không
  qua thì gỡ không xong.
- **Hỏi-4** — Lọc cột Trạng thái ở Bảng hàng vẫn theo sáu trạng thái chuẩn ở vòng này (khuyến nghị — câu giao chỉ đòi
  đếm theo chuẩn; lọc «Đang giao dịch» gồm cả «Giữ chỗ»). Lối khác: ô lọc thêm lựa chọn từng nhãn riêng — đổi khuôn lọc
  `chon` từ một giá trị sang cặp (trạng thái, nhãn).
- **Hỏi-5** — Neo của một nhãn cố định sau khi tạo; đổi neo = gỡ (có hỏi nhãn thay) rồi tạo nhãn mới (khuyến nghị — căn
  mang nhãn không bao giờ lệch trạng thái chuẩn). Lối khác: đổi neo khi chưa căn nào mang — thêm một nhánh kiểm.
- **Hỏi-6** — Trần 3 nhãn riêng mỗi trạng thái chuẩn (sổ #21) giữ cứng (khuyến nghị — lý do «nền tảng»: thực đơn trình
  sửa ô và thẻ điện thoại giữ gọn). Lối khác: trần là tham số của sàn (bậc 1 ADR-0018) — thêm một dòng sổ.

- **Hỏi-7** — Chặn lưu khi chữ nhãn riêng trùng nhãn mặc định của một trạng thái chuẩn hay nhãn riêng khác (không phân biệt
  hoa thường, dấu cách thừa) (khuyến nghị — hai nghĩa không hiện cùng một chữ trên Bảng hàng, cùng bài học Ngoài-1/3 của hàng
  45 mà chủ kho đã tách thành việc riêng). Lối khác: chỉ cảnh báo, vẫn cho lưu — sàn tự chịu chữ trùng; hay chỉ chặn trùng giữa
  các nhãn riêng, cho trùng nhãn mặc định.

## Ngoài phạm vi

- Trường riêng (hàng 47), từ điển gõ tắt khi nhập (hàng 70).
- Nhãn riêng ở Hồ sơ căn, màn gọi (kết quả một chạm «Đã cọc / bán…»), thao tác hàng loạt, Liên hệ, ô nhận lead, màn Gửi —
  giữ nhãn mặc định ở vòng này; đặt nhãn riêng chỉ ở trình sửa ô của Bảng hàng.
- Lọc theo từng nhãn riêng (Hỏi-4), nhãn riêng ra trang khách (Hỏi-2).
- Màu riêng cho nhãn — nhãn nhận màu của neo (Tham chiếu §5).
