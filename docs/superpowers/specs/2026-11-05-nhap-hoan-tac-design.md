# Hoàn tác cả lần nhập (hàng 66) — thiết kế

Ngày: 2026-11-05 · Hồ sơ: `_acceptance/nhap-hoan-tac/` · Hạng T3 (đổi khuôn sự kiện của ADR-0008, migration) · Dãy G,
đợt dau-khach-nhap.

## 1. Việc

Đầu chủ vừa ghi một lần nhập (Màn Nhập Excel, hàng 65) và thấy file sai — cột ghép nhầm, nhầm tệp, nhầm đầu chủ. Hàng 66
cho người nhập **hoàn tác cả lần nhập** bằng một nút: hàng do lần nhập tạo ra khỏi Quỹ hàng, hàng có sẵn mà lần nhập đổi giá
về giá cũ. Căn đã có người sửa sau lần nhập **không bị gỡ**, mà được liệt kê kèm lý do.

Gốc: ADR-0011 quyết định 8 («Hoàn tác cả lần nhập bằng sự kiện bù — giữ chỉ thêm»), luật 11 của Tham chiếu, luật 22 của
đợt («Hoàn tác (66) bằng sự kiện bù, không xoá sự kiện»). Hàng này cũng mang ba mục chủ kho chọn «mở hợp đồng mới» ở Cổng
Bằng chứng hàng 67 (luật 54 của đợt): Ngoài-3, Ngoài-4, Ngoài-5 — §7.

## 2. Lần nhập ghi gì (vật đã có)

`writeBatch` → `lamDong` (`packages/api/src/imports/store.ts`) ghi mỗi dòng một trong bốn hành động, lưu ở `import_rows`
(`action`, `listing_id`, `lead_id`, `listing_version_before`):

| Hành động | Sự kiện lần nhập ghi (mang `import_id`) | Ngoài hàng |
|---|---|---|
| `create` | `created` · `price_changed`? · `owner_confirmed{confirmedAt}`? · `status_changed` tới Active/Pending/Hold? | gán đầu chủ; chủ nhà (`putOwner`, lớp `source`) |
| `update` | `price_changed`? · `owner_confirmed`? — không đổi trạng thái, không đổi phần khác | — |
| `supplement` | không sự kiện hàng | một lead (tin bổ sung gửi đầu chủ giữ căn) |
| `skip` | không | — |

Mọi sự kiện do lần nhập tạo mang `listing_events.import_id` (migration 024).

## 3. Phép hoàn tác

### 3.1 Sự kiện mới `voided`

Thêm loại sự kiện `voided` vào lõi hàng (`packages/core/src/listing/events.ts`), payload rỗng `{}` (khuôn chặt — khoá lạ bị
từ chối). Gấp (`fold.ts`): `ListingState.voided: boolean` (mặc định `false`, `voided` đặt `true`). **Không phải trạng thái
thứ bảy**: không đi qua `TRANSITIONS`, `standardStatus` giữ nguyên, lịch sử giữ nguyên. Không xác nhận với chủ nhà.

Sự kiện `voided` chỉ ghi được qua đường hoàn tác lần nhập: `applyCommand` từ chối nó như từ chối `created`; store hàng có
hàm riêng `voidListing` (một đường ghi — `mot-duong-ghi.test.ts` vẫn đứng).

Hàng `voided` ra khỏi **mọi danh sách đọc**: Bảng hàng (`GET /listings`, cũng là nguồn bộ đồng bộ trên máy kéo về —
`keoVe` thay cả danh sách, nên lượt kéo kế bỏ hàng đã gỡ khỏi máy), Hôm nay của đầu khách, Đã gửi,
kiểm trùng hàng mở (`hangMo`, `hangMoCungCan` — lần nhập sau cùng căn tạo hàng mới). Đọc một hàng và lệnh
sửa (`applyCommand`) lên hàng đã gỡ trả 404 như hàng không có: máy đang giữ lệnh chờ cho hàng ấy chuyển lệnh sang «cần xem» («căn không còn đọc được» — đường có sẵn của bộ gửi), không gửi lặp.
Trang khách (`public/store.ts`) coi hàng `voided` như căn không còn (dữ liệu ra ngoài
dựng từ lõi, bất biến 4). Cột `listings.voided` (migration 025) để lọc; gấp lại từ sự kiện ra đúng cột (AC-8 của hàng lõi).

### 3.2 Kế hoạch hoàn tác — hàm thuần ở lõi

`packages/core/src/listing/hoan-tac-nhap.ts`: `keHoachHoanTac(dong, suKien)` nhận các dòng `import_rows` và dãy sự kiện của
từng hàng, trả mỗi dòng một kết cục:

| Kết cục | Khi nào | Ghi gì |
|---|---|---|
| `go` (gỡ khỏi Quỹ hàng) | `create`, hàng chưa có sự kiện nào sau sự kiện cuối của lần nhập | `voided` |
| `tra-gia` | `update` có `price_changed` của lần nhập, chưa ai sửa sau, giá trước lần nhập có | `price_changed` trả giá + điều kiện phí cũ, `confirmedWithOwner: false` |
| `khong-doi` | `update` chỉ có `owner_confirmed` (hoặc không sự kiện) | không ghi; liệt kê «độ tươi theo ngày trong file vẫn giữ» (Hỏi-1) |
| `da-sua-sau` | hàng có sự kiện sau sự kiện cuối của lần nhập (bất kỳ ai, bất kỳ loại) | không ghi; liệt kê «đã có người sửa sau lần nhập» |
| `khong-tra-duoc` | `update` đổi giá mà trước lần nhập căn chưa có giá (lõi không có «xoá giá») | không ghi; liệt kê lý do |
| `tin-bo-sung` | `supplement` | không ghi; liệt kê «tin bổ sung đã gửi đầu chủ giữ căn — không thu lại» (Hỏi-2) |
| `bo-qua` | `skip` | không ghi, không liệt kê |

«Đã có người sửa sau» = phiên bản hiện tại của hàng lớn hơn `seq` lớn nhất trong các sự kiện mang `import_id` của lần nhập
(cùng luật «so phiên bản, không so giá trị» của hoàn tác ô sửa, `va-sua-tren-o` d-…-4). Giá cũ = gấp dãy sự kiện tới
`listing_version_before`.

### 3.3 Ghi — API `packages/api/src/imports/undo/**`

- `POST /api/v1/imports/{id}/undo` với `{ dryRun: true }` → trả kế hoạch (đếm theo kết cục + danh sách căn kèm lý do), không
  ghi gì. Không `dryRun` → ghi theo kế hoạch, mỗi dòng một savepoint, ghi kết cục vào `import_rows.undo_outcome` /
  `undone_at`; xong mọi dòng thì `imports.status = 'undone'`, `undone_at`, `undone_by`.
- **Gọi lại được**: dòng đã có `undo_outcome` thì bỏ qua — lần gọi đứt giữa chừng gọi lại chỉ làm dòng còn lại, không ghi
  trùng. Lần nhập đã `undone` gọi lại trả đúng kết quả đã ghi.
- **Chỉ người nhập** hoàn tác được (luật cách ly dòng của `imports` ở migration 024: sửa khi `created_by = người gọi`; người
  khác không đọc được lần nhập qua `docLanNhap`) — người khác nhận 404 như lần nhập không có. Vai phải còn là vai nhập.
- Sự kiện bù không mang `import_id` của lần nhập (chúng không phải sự kiện của lần nhập); người ghi là người hoàn tác.

### 3.4 Migration 025 (số giám sát giữ cho hàng 66, luật 25)

`025_hoan_tac_nhap.sql`: thêm `'voided'` vào `listing_events_type_check` (drop + add như 020); cột `listings.voided boolean
not null default false`; `imports.status` thêm `'undone'` + cột `undone_at`, `undone_by`; `import_rows.undo_outcome text`
(check theo bảy kết cục), `undone_at`. Grant cột mới cho `quy_hang_app` đúng mức cần (update `undo_outcome`, `undone_at`;
update `status, undone_at, undone_by` của `imports`). Không đổi luật cách ly nào; bộ kiểm cách ly thêm ca: công ty B không
hoàn tác được lần nhập của A.

## 4. Màn

Hai lối vào (Hỏi-3), cả hai đi khuôn `nhap-excel` đã duyệt (man-nhap-excel), không khối mới:

1. **Ngay sau khi ghi** — bước 5 «Đã ghi vào Quỹ hàng» thêm nút phụ «Hoàn tác lần nhập này».
2. **Lần nhập gần đây** — bước 1 của màn Nhập (dưới ô thả tệp) liệt kê tối đa 10 lần nhập đã ghi của chính người dùng
   (ngày, tên tệp, số dòng ghi, trạng thái «Đã hoàn tác»), mỗi dòng một nút «Hoàn tác». Thêm `GET /api/v1/imports` (lần
   nhập của người gọi, mới nhất trước).

Bấm «Hoàn tác» → hộp xác nhận (`AlertDialog`, qua `TrangThai`/khuôn nhóm) hiện kết quả xem thử: «Gỡ N căn khỏi Quỹ hàng ·
Trả giá cũ cho M căn · K căn không hoàn tác được» + danh sách K căn (toà, mã căn, lý do). Nút «Hoàn tác» xác nhận; xong báo
lại số đã làm và danh sách không làm được (trùng xem thử nếu không ai sửa giữa chừng). Lỗi giữa chừng → báo «Hoàn tác chưa
xong — bấm lại để làm tiếp» (gọi lại được, §3.3).

## 5. Lựa chọn và căn cứ

- `voided` là cờ khi gấp, không phải trạng thái — ADR-0011 qđ 8 (một lối).
- Nhận biết «đã sửa sau» bằng phiên bản, không so giá trị — nối luật đã duyệt của hoàn tác ô sửa (`va-sua-tren-o`); điều gì
  tính là sửa sau là Hỏi-4.
- Chỉ người nhập hoàn tác — luật cách ly dòng của `imports` (migration 024) đã khai; mở cho Trưởng nhóm là việc riêng.
- Hỏi-1 (độ tươi): khuyến nghị **giữ** độ tươi lần nhập đã nâng ở hàng có sẵn và liệt kê — lối khác là sự kiện «huỷ xác
  nhận» mới, thêm một đổi khuôn sự kiện nữa cho trường hợp hiếm.
- Hỏi-2 (tin bổ sung): khuyến nghị **không thu lại**, liệt kê — tin đã tới đầu chủ khác; thu lại cần luồng rút lead riêng.
- Hỏi-4 («sửa sau»): khuyến nghị mọi sự kiện sau lần nhập là sửa sau — kể cả của chính người nhập, kể cả xác nhận còn
  hàng; căn đã gửi link vẫn gỡ (trang khách báo căn không còn).
- Hỏi-5 (đường đo): khuyến nghị bỏ ở vòng này — ô cơ hội chưa khai ngưỡng; lối khác là lệnh đo tỉ lệ hoàn tác.
- Hỏi-3 (lối vào): khuyến nghị **cả hai** lối — chỉ nút ở bước 5 thì rời màn là mất đường hoàn tác.

### Đối chiếu ngành (ADR-0022)

| Năng lực | RESO | Follow Up Boss | Lofty | Ta làm | Ta cứng — họ cấu hình |
| --- | --- | --- | --- | --- | --- |
| Hoàn tác cả lần nhập | Không có trong Data Dictionary (chuẩn trường, không chuẩn nhập) | Danh sách lần nhập ở Admin › Import, «xoá lần nhập» xoá cả liên hệ và ghi chú của lần ấy, kể cả ghi chú gắn vào liên hệ đã có ([nguồn](https://help.followupboss.com/hc/en-us/articles/4402323239063)); trả giá trị cũ của bản ghi đã có — chưa kiểm | Hoàn tác lần nhập trong 24 giờ ([nguồn](https://help.lofty.com/hc/en-us/articles/360054872172)); cách xử bản ghi đã sửa sau — chưa kiểm | Sự kiện bù, giữ lịch sử; hàng mới ra khỏi Quỹ hàng, hàng có sẵn trả giá cũ; căn đã sửa sau thì liệt kê; không hạn giờ | Không: cả hai sản phẩm cũng viết cứng (FUB xoá hẳn, Lofty hạn 24 giờ cố định); không dòng «họ cho cấu hình» |

## 6. Ngoài phạm vi

- Hoàn tác từng dòng của lần nhập; hoàn tác một phần.
- Trưởng nhóm hoàn tác lần nhập của người khác.
- Gỡ liên hệ chủ nhà (hàng 85) mà lần nhập đã tạo — liên hệ ở lại sàn, gắn với hàng đã gỡ (lớp `source`, không ra ngoài).
- Bỏ gỡ (un-void) một hàng đã gỡ.
- Màn lịch sử lần nhập đầy đủ (lọc, tìm, xem từng dòng) — hàng 50.

## 7. Ba mục từ hàng 67 (luật 54)

- **Ngoài-3 — sửa ô bị cờ xung đột không học thành cách gọi.** `suaO` (`apps/web/src/lib/nhap/trang-thai.ts`) chỉ thêm cặp
  quy đổi khi ô «cần người» vì **giá trị lạ** (lõi không nhận chữ ấy); ô «cần người» vì **xung đột** (phí trong ô giá, lệch
  danh mục, mâu thuẫn hai cột) chỉ đổi đúng ô ấy, kế hoạch và bộ nhớ không đổi. Phân biệt bằng lý do lõi trả
  (`normalizeValue`), không bằng chữ màn.
- **Ngoài-4 — hai cột không cùng đích.** `apMau` (`packages/core/src/import/memory/mau.ts`) khử trùng đích bất kể thứ tự cột:
  cột theo mẫu giữ đích (người đã chọn ở lần trước), cột từ điển trùng đích về «chưa rõ» kèm câu hỏi «Cột X trùng đích với
  cột theo mẫu Y»; kế hoạch ra luôn qua `validatePlan`, không cột nào bị bỏ lặng.
- **Ngoài-5 — chọn tệp trước khi mẫu tải xong.** Màn chờ mẫu rồi mới ghép: đang tải thì dải báo «Đang tải mẫu đã nhớ…», tải
  xong ghép theo mẫu; tải lỗi thì ghép theo từ điển và báo «Không đọc được mẫu đã nhớ» (dải đã có của hàng 67).

## 8. Đặc tả UX

<!-- ux-spec:start -->
- **Thẻ việc:** người nhập gỡ một lần nhập sai khỏi Quỹ hàng, biết rõ căn nào không gỡ được và vì sao.
- **Khuôn IA đã chọn + căn cứ:** Luồng nhiều bước có sẵn của nhóm `nhap-excel` (khối đích solution-crm-6); hoàn tác là hành
  động phụ ở bước 1 và bước 5, xác nhận bằng hộp thoại — không màn mới, không tra mẫu ngoài (một khuôn hiển nhiên).
- **Trạng thái:** danh sách lần nhập gần đây: đang tải · trống («Chưa có lần nhập nào») · lỗi đọc · có dòng · dòng đã hoàn
  tác (nhãn, không nút). Hộp xác nhận: đang xem thử · có kế hoạch · kế hoạch không gỡ được gì («Không có căn nào hoàn tác
  được» + danh sách, nút xác nhận tắt) · đang ghi (nút khoá) · xong · lỗi giữa chừng (gọi lại).
- **Khổ:** 1440 và 375; ở 375 danh sách lần nhập xếp dọc, hộp xác nhận phủ toàn màn qua khuôn.
- **Chữ:** «Hoàn tác lần nhập này», «Gỡ N căn khỏi Quỹ hàng», «Trả giá cũ cho M căn», «K căn không hoàn tác được»,
  «Đã có người sửa sau lần nhập», «Hoàn tác chưa xong — bấm lại để làm tiếp», «Đã hoàn tác».
<!-- ux-spec:end -->
