# Điền mã căn cho hàng — thiết kế (dien-ma-can-cho-hang)

02/11/2026 · dãy G · đứng sau hàng 23 (`san-sang-ban`, chọn «C»).

## Bài toán

Hàng tạo từ lead có thể mới biết toà, chưa biết mã căn (lead: `unit_number` tuỳ chọn, ADR-0012). Hàng 23 chốt «C»:
hàng chưa có mã căn báo thiếu riêng «mã căn» và không lên Đang bán, vì ảnh gắn căn theo toà + mã
(`_acceptance/san-sang-ban/decisions.jsonl` dòng 13). Hôm nay chưa có đường nào điền mã căn sau khi hàng đã tạo:

- sự kiện `created` bất biến, `details_changed` chỉ nhận bốn phần của lần rao; không loại sự kiện nào đổi mã căn;
- ràng buộc `listing_events.type` (migration 004) chỉ nhận năm loại;
- hồ sơ căn mở theo mã căn trên địa chỉ (`?unit=<mã>`), nên hàng chưa có mã không mở được hồ sơ.

Kết quả: hàng ấy kẹt ở «Còn thiếu: Mã căn» mãi mãi.

## Hướng (khuyến nghị)

1. **Lõi — sự kiện mới «gắn mã căn»** (`unit_number_assigned`, khuôn chặt `{unitNumber}`). Gấp hàng: đặt `unitNumber`.
   Luật lõi: chỉ nhận khi hàng chưa có mã — hàng đã có mã thì từ chối (`unit-number-already-set`). Mã căn là thuộc
   tính căn, đã có thì khoá (Tham chiếu luật 6); sửa mã đặt nhầm là việc khác (Out of scope).
2. **Cơ sở dữ liệu — migration 020** nới ràng buộc `listing_events.type` thêm loại mới. Không bảng mới, không cột mới
   (`listings.unit_number` đã có, chiếu theo `STATE_COLUMNS`). Hàng lên T3 vì chạm `packages/db/**`.
3. **API — một đường lệnh** `POST /api/v1/listings/{id}/events` như mọi sự kiện (ADR-0008). Thêm hai kiểm ở máy chủ:
   - hàng đã có mã → 422 `unit-number-already-set`;
   - sàn đã có hàng đang mở khác trên cùng căn (toà + mã so bằng `app.unit_key`) → 422 `unit-already-listed`, kèm mã
     hàng kia (Tham chiếu §4: «mỗi sàn tối đa một hàng đang mở trên một căn»).
   Quyền theo đúng quyền sửa hàng hiện có, không thêm vai.
4. **Sẵn sàng bán** — không đổi luật: khi hàng có mã, «Còn thiếu» thôi nêu «mã căn» và xét ảnh như hàng có mã (lõi
   `missingFor` đã làm vậy khi `unitNumber` có giá trị).
5. **Hồ sơ căn mở theo hàng khi chưa có mã** — địa chỉ `?hang=<mã hàng>` bên cạnh `?unit=`. Hồ sơ của hàng chưa có mã
   hiện ô «Mã căn» đánh dấu «Chưa có» cùng ô nhập và nút «Lưu mã căn». Lưu đi qua hàng đợi lệnh trên máy (như sửa trên ô);
   máy chủ nhận thì địa chỉ chuyển sang `?unit=<mã>&toa=…&lan=…` và mục «Còn thiếu» làm mới; máy chủ từ chối (trùng căn)
   thì lỗi hiện tại ô, giữ chữ đã gõ.
6. **Lối vào** — ba chỗ đang chỉ hiện chữ «chưa có mã căn» thành lối mở hồ sơ:
   - Bảng hàng: bấm dòng hàng chưa có mã mở cột hồ sơ theo `?hang=` (hôm nay bấm không làm gì);
   - Hôm nay: dòng «Chưa có mã căn · <toà>» mở hồ sơ;
   - «Còn thiếu: Mã căn» trong hồ sơ đưa con trỏ tới ô mã căn.
7. **Mã ngoài danh mục** — cho điền, như hàng tạo có mã ngoài danh mục hôm nay (nhãn «Chưa có trong danh mục»); ô gợi ý
   mã của toà lấy từ danh mục đã giữ trên máy khi toà có trong danh mục (Hỏi-2).

Quyết định ghi ở ADR-0026 (loại sự kiện «gắn mã căn», vì sao không mở sự kiện đổi chi tiết).

## Đối chiếu ngành

| Năng lực | RESO | Sản phẩm khác | Ta làm | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- |
| Mã căn của một tin rao | `Property.UnitNumber` (DD 2.0) | kvCORE, Lofty: sửa địa chỉ và số căn của tin rao ở màn sửa tin — chưa kiểm được có ghi vết hay không; Follow Up Boss không giữ tin rao (chưa kiểm) | gắn một lần bằng sự kiện riêng, có vết; đã có thì khoá | sửa mã đã có: họ cho sửa tự do — ta khoá (Hỏi-3) |
| Một tin rao mở mỗi căn | không có luật chuẩn (MLS tự đặt) | MLS thường chặn tin trùng địa chỉ — chưa kiểm cụ thể | chặn khi gắn mã trùng hàng mở khác của sàn | không — luật của Tham chiếu §4 (lý do **nghĩa chuẩn để so**) |
| Mã căn ngoài danh mục | không có | chưa kiểm | cho điền, nhãn «Chưa có trong danh mục» | Hỏi-2 |

## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Bảng hàng hoặc Hôm nay (dòng «Chưa có mã căn · Toà A») → hồ sơ căn của hàng → gõ mã ở ô «Mã căn» → «Lưu mã
  căn» → hồ sơ chuyển sang căn vừa gắn, «Còn thiếu» bỏ «Mã căn» (điểm ra: hồ sơ căn đầy đủ, ảnh gắn được).
- Biên: hàng đã có mã — ô không hiện, mã chỉ đọc; toà có danh mục — ô gợi ý mã của toà; mất mạng — lệnh xếp hàng đợi,
  hồ sơ hiện mã ngay theo bản trên máy, dải đồng bộ báo đang chờ.
- Lỗi & quay lại: máy chủ từ chối vì căn đã có hàng đang mở → lỗi tại ô nêu mã hàng kia, chữ đã gõ giữ nguyên, sửa rồi
  lưu lại; mã rỗng → nút «Lưu mã căn» báo «Gõ mã căn» tại ô, không gửi.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hồ sơ căn (cột cạnh Bảng hàng và toàn màn) | gắn mã căn cho hàng chưa có mã | Bảng hàng, Hôm nay, «Còn thiếu» / hồ sơ căn theo mã |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ho-so-chua-co-ma | Hồ sơ căn | ô «Mã căn» với dấu «Chưa có», ô nhập, nút «Lưu mã căn» | gõ mã rồi lưu |
| ST-ho-so-dang-luu | Hồ sơ căn | nút «Đang lưu…», ô khoá | chờ |
| ST-ho-so-trung-can | Hồ sơ căn | lỗi tại ô «Căn này đã có hàng đang mở: <mã hàng>» | sửa mã hoặc mở hàng kia |
| ST-ho-so-ma-rong | Hồ sơ căn | lỗi tại ô «Gõ mã căn» | gõ mã |
| ST-ho-so-da-gan | Hồ sơ căn | hồ sơ theo mã mới, «Còn thiếu» không còn «Mã căn» | tiếp việc rao |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Mã căn 1–200 ký tự sau khi bỏ khoảng trắng hai đầu (khuôn `chu` của lõi); so trùng bằng `app.unit_key` (bỏ ký tự
  không phải chữ, số; viết hoa).
- Enter trong ô là lưu; Esc trả ô về rỗng.
- Điện thoại 375: ô và nút xếp dọc, không cuộn ngang.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MucHoSo` + `CapGiaTri` (solution-crm-4 đã chuyển thể) | dùng | mục «Thuộc tính căn» của hồ sơ đã có |
| `Field`, `Input`, `Button` (shadcn) | ghép | một ô nhập một nút, như các ô sửa khác của kho |
| `TrangThai` | dùng | lỗi tại chỗ theo luật trạng thái chung |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: luồng hiển nhiên — sửa một trường trong hồ sơ đang mở cạnh Bảng hàng (khuôn ho-so-can, hàng 17), không tra mẫu.

## Kiểm thử

- Lõi: khuôn sự kiện mới (ma trận khoá hợp lệ/lạ), gấp hàng, từ chối khi đã có mã, `missingFor` trước/sau.
- Cơ sở dữ liệu + API (Postgres dãy): migration áp được; gắn mã 201; đã có mã 409; trùng hàng mở cùng căn 409 nêu mã
  hàng kia; hàng đã đóng cùng căn không chặn; người không có quyền sửa hàng 403; bộ kiểm cách ly xanh.
- Web: `docCot` nhận `?hang=`; tìm hàng theo mã hàng; lệnh «gắn mã căn» vào hàng đợi; lối vào ở Bảng hàng và Hôm nay.
- Xem bằng mắt (máy dev dãy G): hồ sơ hàng chưa có mã ở 1440 và 375, lưu mã, ca trùng căn.
