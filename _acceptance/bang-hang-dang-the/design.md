# Thiết kế: Bảng hàng dạng thẻ trên điện thoại (hàng 32)

Hàng 32 của lộ trình, màn P0 M4, phủ K2. Câu giao: «Đầu khách mở Bảng hàng trên điện thoại, lọc theo nhu cầu khách thành
thẻ, giữ lâu một thẻ để chọn nhiều căn». Đứng trên kho trên máy (13), «Sẵn sàng bán» (23) và vỏ (53). Gửi (34) và hồ sơ
căn của đầu khách (33) đứng sau hàng này.

## Chỗ đứng

- **Một địa chỉ.** Tham chiếu §1: «Bảng hàng trên máy tính là bảng kiểu Sheet, trên điện thoại là thẻ». Bảng thẻ là
  `/inventory` (và `/inventory/views/<id>`) dưới `md`, đi qua khe điện thoại `dienThoai` của khuôn `KhungBangHang` (nhóm
  `bang-hang`, `design/patterns/bang-hang.md`) — thay khối báo «dựng ở mục 32». Không đường mới. Từ `md` trở lên lưới
  của hàng 14 giữ nguyên.
- **Mã ở `apps/web/src/app/(app)/inventory/cards/`** (vùng của hàng): phần thuần (`the.ts` — lọc nhu cầu, nhóm theo toà,
  thẻ lọc, chọn được; `giu-lau.ts` — máy trạng thái giữ lâu; `anh-bia.ts` — chọn ảnh bìa) kiểm bằng `node:test`, phần
  React (`bang-the.tsx`, `the-can.tsx`, `ngan-loc.tsx`). Hai `page.tsx` của nhóm đổi một dòng — yêu cầu chạm tệp B-1.
- **Dữ liệu từ kho trên máy** như lưới máy tính (`useBoDongBo`, ghép danh mục `ghepDanhMuc`): lọc, nhóm, chọn không gọi
  mạng. Chỉ ảnh bìa gọi mạng.

## Thẻ (khối đích `product-grid-4`, `vo-va-ia.md` §2)

Chuyển thể `product-card.tsx` của `@reui/product-grid-4`: dải đầu chương → **dòng nhóm theo toà** (số căn · vạch mảnh ·
TÊN TOÀ), một dòng nhóm cho mỗi toà, không lặp trên từng thẻ; ô ảnh vuông `Item` bên trái; tiêu đề → **mã căn**, giá →
**giá «4,65 tỷ»** kèm điều kiện phí chữ nhỏ; bỏ câu chuyện; hàng ba thông số → **Diện tích · Phòng ngủ · Hướng**
(`LivingArea`, `BedroomsTotal` qua nhãn «2PN/Studio», `DirectionFaces`); huy hiệu trên ảnh → **«Đang giao dịch»** khi
căn ở nấc ấy; nút tim → **ô chọn** khi đang chọn nhiều. Thứ tự thẻ trong một toà giữ thứ tự của kho trên máy như lưới.

**Căn nào lên thẻ.** Bảng trạng thái ở Tham chiếu §4: «Trên bảng hàng chung» = Đang bán (Có) và Đang giao dịch («Có,
không gửi mới được»). Thẻ chỉ có hai nấc ấy; Đang giao dịch mang huy hiệu và không chọn được (chọn nhiều là để gửi).

**Ảnh bìa.** Kho trên máy không chở ảnh; ảnh nằm ở `GET /api/v1/units/photos?toa=&ma=` (hàng 18, «ảnh mở qua đường của
API»). Thẻ hỏi danh sách ảnh khi thẻ tới gần màn (IntersectionObserver), lấy ảnh đầu của `anhRaNgoai` trong
`packages/core/photos` (chỉ ngăn Gửi được, bìa đầu) và dựng `…/photos/<id>/thumb`. Mất mạng, căn chưa mã, không ảnh Gửi
được → ô ảnh trống có biểu tượng. Mỗi căn hỏi một lần mỗi phiên (bộ nhớ trong trang). Một tuyến ảnh bìa hàng loạt là việc
API ngoài vùng — để sau.

## Lọc theo nhu cầu (khối `filter-sidebar-5` → `Drawer` đáy qua `NganNoi`)

Năm mục, đúng các trường thẻ trình (khách hỏi gì thì thẻ hiện cái đó): **Giá** từ–đến (tỷ, hai ô `Input` bàn phím số, nhận dấu phẩy), **Phòng
ngủ** (nhiều lựa chọn: Studio, 1PN…, Chưa rõ — lấy từ dữ liệu), **Toà** (nhiều), **Diện tích** từ–đến (m²), **Hướng**
(nhiều, từ dữ liệu). Nút chân ngăn «Xem n căn» đếm ngay trên máy. Căn thiếu giá trị của một mục đang lọc không khớp mục ấy; Phòng ngủ có
lựa chọn «Chưa rõ». Tập năm mục chờ Hỏi-1 ở Cổng Phạm vi. Bộ lọc đang chạy hiện thành **thẻ lọc** (chip của
`filter-sidebar-5`) ở hàng ngang trên danh sách: chạm × bỏ một thẻ, «Xoá lọc» bỏ hết. Lọc rỗng → `TrangThai` tìm không ra
kèm «Xoá lọc». Bộ lọc sống trong trang (giữ khi mở hồ sơ rồi quay lại), không lưu qua lần tải lại.

## Chọn nhiều

Giữ một thẻ Đang bán ≥ 500 ms → vào chế độ chọn, thẻ ấy được tích; trong chế độ chọn chạm thẻ là tích/bỏ. Ngón tay dời
> 10 px hay cuộn trong lúc giữ thì huỷ (không vào chế độ chọn). Lần nhả tay sau khi giữ lâu không tính là chạm. Thanh đầu
danh sách đổi thành «n căn đã chọn · Bỏ chọn». Giữ lâu không để máy bật hành vi riêng: thẻ chặn `contextmenu`, tắt
`-webkit-touch-callout` và chọn chữ (`select-none`), ảnh `draggable={false}`; thẻ không phải thẻ `<a>` (chạm đổi URL bằng
mã) nên không có xem trước link. Lối không cần giữ lâu (bàn phím, trình đọc màn): nút «Chọn» trên thanh
đầu. Chọn sống trong trang; thanh «Xem trước · Gửi» là hàng 34 — hàng này xuất móc `useChonCan` cho 34 dùng.

## Mở hồ sơ

Ngoài chế độ chọn, chạm thẻ → `?unit=<mã>&toa=<toà>&lan=<lần rao>` (dạng URL của hàng 17) bằng `history.pushState` —
hồ sơ toàn màn điện thoại hiện như hiện nay (`HoSoDienThoai`); nút lùi của máy về lại bảng thẻ với bộ lọc, lựa chọn và vị
trí cuộn như cũ (bảng thẻ ẩn chứ không gỡ khi hồ sơ mở).

## Năm nghìn căn

Mỗi thẻ mang `data-the-can` (đếm thẻ đang dựng). Danh sách cuộn ảo theo vùng cuộn của vỏ (`@tanstack/react-virtual` đã có) trên mảng phẳng «dòng nhóm + thẻ»: chỉ dựng thẻ gần màn.

## Quét không gian (morphological-scan, preset entity-feature)

- Chân sản phẩm: Tham chiếu §1, §4, §9; `vo-va-ia.md` §2 [SUY-TỪ-REPO: docs/product/tham-chieu.md, docs/design/vo-va-ia.md].
  Chân ngành: [NGÀNH: batdongsan.com.vn — bộ lọc Mức giá · Diện tích · Số phòng ngủ · Hướng nhà · Dự án], [NGÀNH: RESO
  `SavedSearch` trên `ListPrice`, `BedroomsTotal`, `LivingArea`, `DirectionFaces`], [NGÀNH: Material Design 3 — giữ lâu để
  vào chế độ chọn].
- Trục A — nấc hàng: Đang bán | Đang giao dịch | bốn nấc không lên bảng chung [thước CE: bảng §4 Tham chiếu].
- Trục B — mục lọc: Giá | Phòng ngủ | Toà | Diện tích | Hướng | (Nội thất, Pháp lý, Tầng, Tình trạng sử dụng) [thước CE:
  ngành bds + RESO].
- Trục C — cử chỉ: chạm | giữ lâu | giữ rồi dời/cuộn | bàn phím [thước CE: Material 3].
- Trục D — mạng và ảnh: có mạng + ảnh bìa | ảnh chỉ nội bộ | không ảnh | căn chưa mã | mất mạng có kho | mất mạng chưa tải.
- Core: A×{hiện, chọn được}; B năm mục đầu; C bốn giá trị; D sáu giá trị; 5.000 căn cuộn ảo.
- Later: Nội thất, Pháp lý, Tầng, Tình trạng sử dụng làm mục lọc · lưu nhu cầu theo khách (liên hệ khách, hàng 86) ·
  sắp xếp · tuyến ảnh bìa hàng loạt · góc nhìn trên điện thoại.
- Never: hiện căn Chưa đủ để rao / Đã bán / Tạm ngừng / Ngừng hẳn trên thẻ — không thuộc bảng hàng chung.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: tab Bảng hàng (điện thoại) → danh sách thẻ nhóm theo toà → «Lọc» → chọn giá, phòng ngủ… → «Xem n căn» → thẻ
  lọc hiện trên danh sách → giữ lâu một thẻ → chạm thêm thẻ → «n căn đã chọn» (điểm ra: Gửi ở hàng 34; hôm nay dừng ở
  danh sách đã chọn) · hoặc chạm một thẻ → hồ sơ căn → lùi về danh sách.
- Biên: sàn chưa có căn Đang bán/Đang giao dịch; lọc không ra căn nào; giữ lâu thẻ Đang giao dịch; căn chưa có mã căn
  (không ảnh); 5.000 căn.
- Lỗi & quay lại: chưa từng tải kho và mất mạng → «Chưa tải được bảng hàng» + «Thử lại»; ảnh lỗi → ô ảnh trống, thẻ vẫn
  dùng được; lùi từ hồ sơ → đúng chỗ cũ.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Bảng hàng (điện thoại) | Tìm căn hợp nhu cầu một khách và gom vài căn | tab Bảng hàng, «Gõ mã căn» / hồ sơ căn, Gửi (34) |
| Ngăn lọc | Đặt nhu cầu khách thành bộ lọc | nút «Lọc» / «Xem n căn» |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-the-dang-tai | Bảng hàng (điện thoại) | Khung chờ hình thẻ (ảnh vuông + ba dòng), không chữ «Loading» | chờ |
| ST-the-trong | Bảng hàng (điện thoại) | «Chưa có căn nào trên bảng hàng chung» | về Hôm nay |
| ST-the-loc-rong | Bảng hàng (điện thoại) | «Không căn nào khớp nhu cầu» + «Xoá lọc» | bỏ bớt thẻ lọc |
| ST-the-loi | Bảng hàng (điện thoại) | «Chưa tải được bảng hàng» + «Thử lại» | thử lại khi có mạng |
| ST-the-danh-sach | Bảng hàng (điện thoại) | Dòng toà + thẻ; thanh «n căn · Lọc · Chọn» | lọc, chạm, giữ lâu |
| ST-the-dang-chon | Bảng hàng (điện thoại) | Ô chọn trên ảnh mọi thẻ Đang bán; thanh «n căn đã chọn · Bỏ chọn» | chạm để tích/bỏ |
| ST-the-anh-trong | Thẻ | Ô ảnh muted có biểu tượng ảnh | không gì |
| ST-loc-mo | Ngăn lọc | Năm mục, thẻ lọc đang chạy ở đầu, chân «Xoá lọc · Xem n căn» | đặt lọc, xem |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Dưới `md` (767 px) là thẻ; từ `md` là lưới — một địa chỉ.
- Giữ lâu 500 ms; dời > 10 px huỷ; nhả sau giữ lâu không mở hồ sơ. Giá gõ theo tỷ, chấp nhận dấu phẩy; ô «từ» lớn hơn
  «đến» thì đổi chỗ khi lọc.
- Không cuộn ngang ở 375 px; chữ tối thiểu `text-xs`; sáng và tối.

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `@reui/product-grid-4` thẻ | dùng (chuyển thể) | khối đích của màn ở `vo-va-ia.md` §2 |
| `@reui/filter-sidebar-5` | dùng (chuyển thể, Sheet → `NganNoi`) | khối đích ngăn lọc; Drawer chỉ qua NganNoi (luật no-direct-sheet) |
| `KhungBangHang` khe `dienThoai` | dùng | khuôn nhóm bang-hang |
| `TrangThai`, `Input`, `Checkbox`, `ToggleGroup`, `Item`, `Badge` | dùng | đã cài |
| Máy giữ lâu | tạo (hành vi, không phải ô giao diện) | không khối nào chở cử chỉ giữ lâu |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: danh-sách-chi-tiết (master-detail)
Căn cứ: thẻ là danh sách, chạm mở hồ sơ toàn màn rồi lùi — đúng luồng của Bảng hàng máy tính (bảng + cột hồ sơ, hàng 17)
ở khổ hẹp; không cần tra thêm.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu khách |
| Việc chính | Tìm nhanh căn hợp nhu cầu một khách và gom vài căn để gửi |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | hàng trăm trở lên |
| Thiết bị | điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->
