# Gọi ép giá đợt hai (hàng 29) — thiết kế

Hàng 29 của lộ trình, dãy D, mã L6, phác thảo KD2 (Tham chiếu §10, P0). Đứng trên hàng 28 (chế độ cuộc gọi khai thác,
`/units/call?lead=`), hàng 22 (Hôm nay của đầu chủ, nhóm «Nên gọi điều chỉnh giá») và hàng 13 (bộ đồng bộ trên máy).

**Câu giao:** Đầu chủ gọi ép giá đợt hai trên máy tính: thấy lịch sử trả giá và giá đáy nội bộ, ghi kết quả bằng phím,
hạ giá theo đúng luật sửa giá.

## 1. Bất biến chạm

- **Bất biến 2 (chủ nhà không rời công ty):** giá đáy là lớp `source`. Màn đọc nó thẳng từ `GET /api/v1/listings/{id}/owner`
  (lõi `ownerView` đã trả `{visible:false}` cho người không thấy nguồn), không ghi vào kho trên máy, không vào sự kiện.
- **Bất biến 3:** không gửi gì đi; quay số là hàng 30.
- **Bất biến 1, 4:** không bảng mới, không migration, không đường ra ngoài công ty.

## 2. Đối chiếu RESO và ngành

Nguồn: [Đối chiếu ngành §10](../../product/doi-chieu-nganh.md#10-chế-độ-cuộc-gọi-kịch-bản-kết-quả-gọi-lý-do-mất).

| Năng lực / đối tượng | RESO | Lofty · REDX · KW | Ta làm | Ta viết cứng — họ cho cấu hình |
| --- | --- | --- | --- | --- |
| Kết quả cuộc gọi | Không có (RESO mô tả hàng) | Lofty: màn kết quả gọi, danh mục chưa kiểm; REDX: dialer phân loại theo kết quả, tự đặt chưa kiểm | Bốn kết quả cố định (§5): Hạ giá · Giữ giá · Đã cọc / bán… · Không nghe máy | Bộ bốn giữ cứng — Tham chiếu §5 «một bộ ở mọi màn»; ghi «Không nghe máy» → **Hỏi-2** |
| Lịch sử trả giá | `PreviousListPrice`, `OriginalListPrice`, `PriceChangeTimestamp` | Landsoft: lịch sử đổi giá (đối chiếu VN) | Dựng từ sự kiện của hồ sơ | — |
| Giá đáy nội bộ | Không có | chưa kiểm | Đọc từ chủ nhà của hàng, lớp nguồn | Ghi giá đáy kèm câu chủ nói, ngày → **Hỏi-3** |
| Xác nhận với chủ nhà khi đổi giá | Không có | chưa kiểm | Luật 9: mặc định có, tắt theo lệnh | Ô tắt trong màn → **Hỏi-4** |
| Bố cục màn cuộc gọi | — | Lofty: kịch bản cạnh dialer | ADR-0024 bố cục «Hồ sơ» | Một cột hay ba cột → **Hỏi-1** |

## 3. Thiết kế

### 3.1 Lõi — không đổi

Dùng lại: `docGia`, `canHoiLai`, `vietPhanTram` (giá), `checkTransition`, `TRANSITIONS`, `WITHDRAWN_REASONS` (trạng thái),
`soGiaToa`, `tinhVeTay` (hàng 28), `completeness`, `DANH_SACH_HOI`.

### 3.2 Màn (`apps/web/src/app/(app)/units/call/`)

- **Đường dẫn:** `/units/call?hang=<mã hồ sơ>` mở chế độ ép giá; `/units/call?lead=<mã lead>` giữ chế độ khai thác của
  hàng 28. Một trang, hai chế độ (ghi chép kiến trúc 29/10: cuộc gọi là chế độ toàn màn của hồ sơ căn).
- **Đầu màn:** đường dẫn «Hôm nay › <mã căn>», nấc «Nên gọi ép giá» (căn Đang bán), giá hiện tại kèm điều kiện phí, «Lên
  bảng N ngày · lần đổi giá gần nhất M ngày trước».
- **Kết quả cuộc gọi** (`push/ket-qua.ts`, `push/khoi-ket-qua.tsx`): bốn nút có phím H · G · B · K.
  - H Hạ giá: ô giá + điều kiện phí (Alt+1/Alt+2), dòng «Hiểu là X · trước Y · −z%», hỏi lại theo `canHoiLai`, Enter ghi
    `price_changed` qua `useSuaHang` (tính là vừa xác nhận — Hỏi-4).
  - G Giữ giá: ghi `owner_confirmed`.
  - B Đã cọc / bán…: hỏi tiếp ba lối (phím 1–3): Đã cọc → `status_changed` Pending · Sàn mình bán → Closed + giá chốt (bắt
    buộc, đọc bằng `docGia`) + ngày bán (mặc định hôm nay) · Chủ bán nơi khác → Withdrawn `sold_elsewhere`. Bảng chuyển của
    lõi quyết lối nào mở.
  - K Không nghe máy: không ghi gì, về Hôm nay (Hỏi-2).
  - Ghi xong (Hạ, Giữ, B) → nút «Về Hôm nay» và Ctrl+Enter; ghi lỗi trên máy → nói lý do bằng `moTaLoi`.
- **Lịch sử trả giá** (`push/lich-su.ts`, khối `Timeline` của ReUI): từ `lichSu` của `useHoSoHang` (kho trên máy, kéo nền),
  mới nhất trên (lịch sử chưa kéo về thì «Đang tải lịch sử»): «Tạo hồ sơ» (Hỏi-5: chưa có dòng giá lead gốc), «Lên bảng <giá>», «Hạ <cũ> → <mới>» / «Tăng …» / «Đổi điều kiện phí», «Còn · giữ giá»,
  «Đã cọc» …; mỗi dòng ngày giờ, điều kiện phí, người ghi (tên vai), «đã xác nhận với chủ» khi có.
- **Giá đáy chủ từng nói · nội bộ** (`push/gia-day.ts`): `GET /api/v1/listings/{id}/owner`; `visible:false` hay 4xx → khối
  không hiện; có giá đáy → «2,70 tỷ», so với giá về tay hiện tại «cách giá hiện tại −x%»; chưa ghi → «Chưa ghi giá đáy».
  Không lưu vào kho trên máy hay `localStorage`.
- **Danh sách hỏi, tính giá, so giá:** khối của hàng 28, hồ sơ là hồ sơ đang gọi; so giá trừ chính căn.
- **Bố cục (Hỏi-1):** khuyến nghị bố cục «Hồ sơ» của ADR-0024 — `BoCuc kieu="ho-so"` trong `KhungCuocGoi`, thân một cột
  48rem bằng `KhungHoSo` + `MucHoSo` (solution-crm-4); chế độ khai thác của hàng 28 chuyển theo, đóng ngoại lệ có hạn.
- **Hôm nay:** dòng căn ở nhóm «Nên gọi điều chỉnh giá» thêm nút «Ghi cuộc gọi» mở `/units/call?hang=<id>`; nút «Gọi» của hàng 28
  trên dòng lead đổi nhãn thành «Ghi cuộc gọi» — «Gọi» để dành cho nút quay số sau «Mở số» của hàng mở số lead (Hỏi-8).

### 3.3 API — không đổi

Đọc hồ sơ và lịch sử qua bộ đồng bộ (`GET /api/v1/listings`, `/listings/{id}`), ghi qua `POST /listings/{id}/events` của bộ
đồng bộ, giá đáy qua `GET /listings/{id}/owner`.

## 4. Đường đo

Thước của Cổng Đáng: «số căn gọi ép giá đợt hai» trong hai tuần thử. Số từ sự kiện: mỗi căn có `price_changed` hay
`owner_confirmed` ghi trong lúc ở nhóm «Nên gọi điều chỉnh giá» đợt hai (mốc ép giá ≥ 10 ngày, đã có lần đổi giá trước).
Màn này là lối ghi hai sự kiện ấy (AC-5, AC-6); đếm là việc của màn số liệu hàng sau.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Hôm nay → nhóm «Nên gọi điều chỉnh giá» → «Gọi» trên dòng căn → `/units/call?hang=<id>` → đọc lịch sử trả giá,
  giá đáy → gọi → H, gõ giá mới, Alt+1/2, Enter (hỏi lại nếu >20%) → «Về Hôm nay» (căn rời nhóm).
- Biên: chủ giữ giá (G) · căn đã cọc / bán / chủ bán nơi khác (B → 1/2/3) · không nghe máy (K, không ghi) · căn chưa có giá
  đáy · người không thấy nguồn (không khối giá đáy) · mất mạng (ghi trên máy, chỉ báo đồng bộ) · lịch sử chưa kéo về (khối
  nói «Đang tải lịch sử», kéo nền).
- Lỗi & quay lại: căn không có trên máy / không thấy → «Không thấy căn này trong kho của bạn» + «Về Hôm nay»; giá chưa hiểu
  → báo dưới ô; Sàn mình bán thiếu giá chốt → báo dưới ô; lối không hợp bảng chuyển → nút tắt kèm lý do.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Chế độ cuộc gọi ép giá | Ghi kết quả một cuộc gọi ép giá, thấy đủ căn cứ trả giá | Hôm nay (nút «Gọi» ở nhóm ép giá) / Hôm nay |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-ep-gia-dang-tai | Ép giá | Khung xương của đầu màn và các mục | Chờ |
| ST-ep-gia-khong-thay | Ép giá | «Không thấy căn này trong kho của bạn» | «Về Hôm nay» |
| ST-ep-gia-mac-dinh | Ép giá | Đầu màn, kết quả gọi chưa chọn, lịch sử, giá đáy, danh sách hỏi, tính giá, so giá | Chọn H/G/B/K |
| ST-ep-gia-ha-gia | Ép giá | Ô giá mới, điều kiện phí, «Hiểu là … · trước … · −x%» | Enter / Esc |
| ST-ep-gia-hoi-lai | Ép giá | «Đổi <cũ> → <mới> (−x%)?» Ghi / Huỷ | Enter / Esc |
| ST-ep-gia-ban | Ép giá | Ba lối Đã cọc · Sàn mình bán (giá chốt, ngày) · Chủ bán nơi khác | 1–3, Enter |
| ST-ep-gia-da-ghi | Ép giá | «Đã ghi: <kết quả>» + «Về Hôm nay» | Ctrl+Enter |
| ST-ep-gia-khong-gia-day | Ép giá | «Chưa ghi giá đáy» | Không |
| ST-ep-gia-mat-mang | Ép giá | Chỉ báo «Chưa gửi — mất mạng»; kết quả vẫn ghi trên máy | Tiếp tục |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Phím (con trỏ không ở ô chữ): H · G · B · K chọn kết quả; ở B: 1–3 chọn lối; Esc bỏ kết quả đang chọn; Ctrl+Enter về Hôm
  nay. Ở ô giá: Alt+1 / Alt+2 điều kiện phí, Enter ghi, Esc rời ô. Danh sách hỏi giữ phím của hàng 28 (Tab, 1–3, Delete).
- Hạ giá mặc định gợi giá hiện tại (gõ đè); không gợi ý mức nên hạ (luật 14).
- Khổ: máy tính ≥ 1280 theo bố cục đã chọn ở Hỏi-1; dưới `lg` xếp một cột.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `BoCuc` «Hồ sơ», `DauMan` | dùng | Bố cục của ADR-0024 |
| `KhungHoSo`, `MucHoSo`, `CapGiaTri` (solution-crm-4) | dùng | Khung hồ sơ đã chuyển thể |
| `Timeline` (ReUI) | dùng | Lịch sử trả giá |
| `ToggleGroup` + `Kbd` | ghép | Bốn kết quả có phím (dòng «Chỗ hở» Chế độ cuộc gọi) |
| `Input`, `Badge`, `Button` | dùng | Ô giá, nấc, nút |
| `TrangThai`, `Skeleton` | dùng | Trống, lỗi, đang tải |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: hồ sơ toàn màn (record detail) — Căn cứ: ghi chép kiến trúc 29/10 «cuộc gọi là chế độ toàn màn của hồ sơ căn»,
ADR-0024 xếp chế độ cuộc gọi vào bố cục «Hồ sơ»; bản phác KD2 của chủ kho cùng dáng với KD1.
<!-- UX-SPEC-TEMPLATE>>> -->

## 5. Ngoài vòng

Đồng hồ cuộc gọi, «Mở trên điện thoại», quay số, số chủ che một phần (hàng 30); ghi chú cuộc gọi, tin rao công khai, «chủ
còn căn nào khác» (Hỏi-6); dòng giá lead gốc trong lịch sử (Hỏi-5); ghi «Không nghe máy» (Hỏi-2); ghi giá đáy mới kèm câu và ngày (Hỏi-3); ô tắt xác nhận
(Hỏi-4); lưu định nghĩa bao phí kèm giá (hàng 49); bản điện thoại K1–K4.

## 6. Câu hỏi ở Cổng Phạm vi

Hỏi-1 bố cục · Hỏi-2 «Không nghe máy» · Hỏi-3 ghi giá đáy mới · Hỏi-4 ô tắt xác nhận · Hỏi-5 dòng giá lead gốc trong lịch
sử · Hỏi-6 ghi chú cuộc gọi, tin rao công khai, «chủ còn căn nào» · Hỏi-7 trưởng nhóm không vai Đầu chủ mở màn · Hỏi-8 nhãn hai nút «Gọi» trên dòng lead. Khuyến nghị và lối khác ở
`_acceptance/goi-ep-gia-dot-hai/decisions.jsonl`.
