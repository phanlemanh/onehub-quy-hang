# Lõi hàng và sự kiện — thiết kế

Ngày 31/10/2026 · Hàng 8 của lộ trình (nền, dãy Q, đợt nen-dau) · Hồ sơ `_acceptance/loi-hang-va-su-kien/` · **T3**
(cơ sở dữ liệu) · đứng trên hàng 6 (đăng nhập theo sàn, ADR-0005) và hàng 7 (vai, khu — ADR-0006) · ADR mới: ADR-0008.

Câu giao: **Mọi thay đổi của hàng đi qua một lệnh API và thành sự kiện chỉ thêm; sáu trạng thái chuẩn, độ tươi và mức
đủ thông tin tính ra từ sự kiện.** Bật khi: không đường ghi nào ngoài API; độ tươi và mức đủ tính lại đúng trên bộ ca
kiểm; bảng mới có luật cách ly và ca trong bộ kiểm cách ly.

## 1. Bài toán

Mọi màn sau (bảng hàng, hồ sơ căn, Hôm nay, màn cuộc gọi, trang khách) đọc cùng một hàng. Tham chiếu §4 chốt «Sự kiện:
chỉ thêm, không sửa; ghi người và vai lúc làm» và «Độ tươi, mức đủ thông tin và lịch sử trả giá đều tính từ sự kiện,
không ai phải điền». Kiến trúc §1 chốt «Bảng sự kiện chỉ ghi thêm; số trên màn là bản tính ra từ sự kiện». Hàng này dựng
lõi đó, chưa có màn nào.

## 2. Mô hình

### Hai bảng mới (migration 004)

| Bảng | Là gì | Ghi bởi |
|---|---|---|
| `listing_events` | Sự kiện của hàng, **chỉ thêm**: `company_id`, `listing_id`, `seq` (1, 2, 3… trong một hàng), `type`, `payload` (jsonb), `actor_user_id`, `actor_roles` (vai lúc làm), `confirmed_with_owner`, `occurred_at` | API, một lệnh |
| `listings` | Bản tính ra của hàng: trạng thái chuẩn, các trường của lần rao, ngày xác nhận gần nhất, `version` (= `seq` cuối) | API, cùng giao dịch với sự kiện |

- Cả hai bảng bật và ép luật theo dòng theo `app.current_company_id()`; vai `quy_hang_app` chỉ có `select, insert` trên
  `listing_events` và `select, insert, update` trên `listings`. Trigger từ chối `update`/`delete` trên `listing_events`
  với **mọi** vai, kể cả chủ bảng — sự kiện không sửa được ở đâu cả.
- `listings` không có cột nào máy không tính lại được từ sự kiện: xoá trắng bảng rồi gấp lại từ `listing_events` ra
  đúng bảng cũ (ca kiểm «gấp lại»).
- Thông tin chủ nhà (lớp `source`: chủ nhà, số, giá đáy, ảnh sổ) **không** vào hai bảng này — Kiến trúc §1 đặt nó ở
  bảng riêng có luật chặt hơn, làm ở hàng chủ nhà. Sự kiện từ chối khoá payload thuộc lớp `source`.
- Hàng gắn căn bằng chữ (`BuildingName`, `UnitNumber` theo RESO) vì danh mục chưa nạp; gắn mã căn danh mục ở hàng nạp
  danh mục.

### Lệnh API (gốc `/api/v1`)

| Đường | Làm gì |
|---|---|
| `POST /listings` | Tạo hàng: sự kiện `created` (nấc Chưa đủ để rao) |
| `POST /listings/{listingId}/events` | **Lệnh duy nhất đổi hàng**: thân `{ type, payload, expectedVersion }` → một sự kiện + bản tính mới |
| `GET /listings` | Hàng của sàn đang làm, kèm trạng thái, độ tươi, mức đủ |
| `GET /listings/{listingId}` | Một hàng kèm lịch sử sự kiện |

Loại sự kiện bản đầu: `created`, `details_changed` (các trường của lần rao), `price_changed` (giá kèm điều kiện phí),
`status_changed`, `owner_confirmed` (gọi chủ nhà, «Còn / giữ giá»). Mã lỗi mới vào `API_ERRORS` (ADR-0007).

### Sáu trạng thái chuẩn (Tham chiếu §5, RESO `StandardStatus`)

`Incomplete` Chưa đủ để rao · `Active` Đang bán · `Pending` Đang giao dịch · `Closed` Đã bán · `Hold` Tạm ngừng ·
`Withdrawn` Ngừng hẳn. Luật đổi ở `packages/core/src/listing/`, hàm thuần:

- Vào `Closed` **bắt buộc giá chốt**; vào `Withdrawn` **bắt buộc lý do** (một trong ba lý do của §5).
- Vào `Active` chỉ khi qua điều kiện máy kiểm (luật 17) — xem Hỏi-1 về ảnh.
- Cặp nào được chuyển: bảng 6×6 ở AC-4 của hợp đồng — xem Hỏi-3.
- `Closed` và `Withdrawn` là nấc cuối của lần chào bán (mở lại = hàng mới, luật «mỗi sàn tối đa một hàng đang mở»).
- Đổi trạng thái không xoá dữ liệu: hàng đã bán giữ giá chốt và ngày bán.
- Sàn thêm nhãn, không thêm nghĩa: không có trạng thái thứ bảy (nhãn riêng của sàn làm ở Cài đặt sàn).

### Độ tươi và mức đủ — hàm thuần trên dãy sự kiện

- **Độ tươi** (luật 15): ngày của sự kiện gần nhất có `confirmed_with_owner = true`. Mặc định (luật 9): `price_changed`
  và `status_changed` tính là vừa xác nhận; `owner_confirmed` luôn là xác nhận; người gửi lệnh tắt được cờ trên từng
  lệnh. Tuổi = số ngày từ đó tới «hôm nay» truyền vào hàm (không đọc đồng hồ trong lõi). Mốc mặc định 14 ngày «cần gọi
  lại» (luật 18) để màn tô; sàn chỉnh ở Cài đặt sàn sau.
- **Mức đủ** (luật 16): danh sách hỏi = các phần của lần rao ở Tham chiếu §4 — giá kèm điều kiện phí, nội thất, pháp lý,
  tài chính, tình trạng sử dụng. Mức đủ = phần đã có / tổng, kèm danh sách còn thiếu — chính là danh sách hỏi của màn
  cuộc gọi. Ảnh vào danh sách khi có kho ảnh.
- `packages/core` có `foldListing(events, today)` trả trạng thái, các trường, độ tươi, mức đủ; API ghi bản tính bằng
  đúng hàm đó, và ca «gấp lại» so bản tính trong bảng với hàm gấp trên sự kiện.

### Hai người cùng sửa (luật 10)

Lệnh mang `expectedVersion`; khác `version` hiện tại → 409 `version-conflict`, không ghi. Riêng `status_changed` sang
`Pending` hay `Closed` («Đã cọc», «Đã bán» thắng ngay) bỏ qua phép so phiên bản. Khoá theo hàng trong giao dịch để hai
lệnh đồng thời không cùng lấy một `seq`.

## 3. Lựa chọn máy đã quyết (sổ quyết định mang căn cứ)

- Bản tính lưu bảng, không tính lúc đọc — bảng hàng kiểu Sheet vài nghìn dòng (Kiến trúc §1); vẫn gấp lại được.
- Không đọc đồng hồ trong lõi — ca kiểm độ tươi cho ra cùng số ở mọi máy.
- Thông tin chủ nhà ngoài hai bảng — Kiến trúc §1.
- Không làm hoàn tác (luật 8) ở hàng này — hoàn tác là một sự kiện mới đảo sự kiện trước, làm cùng màn sửa trên ô.

## 4. Câu chỉ người có

- **Hỏi-1 · Vào «Đang bán» khi chưa có kho ảnh.** Luật 17 kiểm «giá về tay, ảnh thật, pháp lý, tình trạng sử dụng»; kho
  ảnh chưa có. Khuyến nghị: hàng này kiểm ba điều có dữ liệu (giá kèm điều kiện phí, pháp lý, tình trạng sử dụng), điều
  «ảnh thật» thêm vào khi có kho ảnh. Lối khác: chặn hẳn «Đang bán» tới khi có kho ảnh — giá: mọi màn bảng hàng trước
  hàng ảnh không có hàng nào ở «Đang bán» để thử.
- **Hỏi-2 · Ai được gửi lệnh đổi hàng.** Chưa có quyền chi tiết theo vai (hàng 7 để «làm cùng màn đó»). Khuyến nghị:
  mọi thành viên của sàn gửi được lệnh ở hàng này, sự kiện ghi người và vai lúc làm; quyền theo vai và trục «Chỉ tôi →
  Nhóm → Toàn sàn» làm cùng màn bảng hàng. Lối khác: chỉ vai đầu chủ và trưởng nhóm — giá: phải dựng luật trục xem trước
  màn, dễ sai khi chưa có màn để thử.

- **Hỏi-3 · Bảng chuyển trạng thái.** Tham chiếu §5 nói «vào khi» cho từng trạng thái nhưng không quyết từng cặp.
  Khuyến nghị: 12 cặp ở AC-4 — `Incomplete` → `Active`/`Hold`/`Withdrawn`; `Active` → `Pending`/`Closed`/`Hold`/`Withdrawn`;
  `Pending` → `Active` (khách bỏ cọc)/`Closed`/`Withdrawn`; `Hold` → `Active`/`Withdrawn`; `Closed`, `Withdrawn` là nấc
  cuối (mở lại = hàng mới); không lùi về `Incomplete`. Lối khác: thêm `Hold` → `Incomplete` và `Active` → `Incomplete`
  (hàng mất thông tin thì lùi) — giá: hàng rời bảng hàng chung mà không có sự kiện «tạm ngừng» nào để đầu khách hiểu.
- **Hỏi-4 · Danh sách hỏi của mức đủ.** Tham chiếu §4 liệt tám phần của lần rao (thêm đầu chủ, mức hiển thị, ghi chú).
  Khuyến nghị: năm phần mô tả căn với khách (giá kèm điều kiện phí, nội thất, pháp lý, tài chính, tình trạng sử dụng),
  mỗi phần ngang nhau; đầu chủ và mức hiển thị là gán việc, ghi chú là tự do. Lối khác: đủ tám phần — giá: mức đủ không
  bao giờ đủ khi ghi chú trống, màn cuộc gọi hỏi cả điều chủ nhà không trả lời được.

## 5. Ngoài hàng này

Chủ nhà và mở số (hàng chủ nhà) · kiểm trùng «một hàng đang mở trên một căn» (hàng dòng vào) · nhãn trạng thái riêng của
sàn · hoàn tác · ảnh · lịch sử trả giá trên màn · gắn mã căn danh mục · màn nào.

## Đặc tả UX

Bỏ — hàng không có màn (ghi ở sổ quyết định).

## 6. Cách đo

- Kiểm thử thuần của `packages/core/src/listing/`: ma trận chuyển trạng thái 6×6 viết trước; độ tươi và mức đủ trên bộ ca
  kiểm cố định (ngày truyền vào).
- Kiểm thử có Postgres: lệnh API ghi đúng một sự kiện + bản tính; ca «gấp lại»; 409 phiên bản; hai lệnh đồng thời;
  `Closed` thiếu giá chốt bị từ chối.
- Bộ kiểm cách ly: hai bảng mới bật và ép luật; sàn A không đọc, không ghi hàng và sự kiện của sàn B; sửa hay xoá sự
  kiện bị từ chối kể cả bằng kết nối chủ.
- Quét mã nguồn: câu ghi vào `listings`/`listing_events` chỉ nằm ở `packages/api/src/listings/`.
