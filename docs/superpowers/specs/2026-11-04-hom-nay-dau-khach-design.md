# Hôm nay của đầu khách (hàng 37) — thiết kế

Hồ sơ `_acceptance/hom-nay-dau-khach/` · Cổng Đáng: build (Manh Phan 02/11) · dãy L, đợt `dau-khach-nhap` · hạng T2.

## Việc

Đầu khách mở Hôm nay trên điện thoại và thấy, theo ngày, ba loại tin về các link mình đã gửi:

- **Khách phản ứng** — khách mở link hay chạm «Quan tâm» (sự kiện `share_events` của hàng 35).
- **Vừa đổi** — căn trong một link còn mở đổi giá rao hay đổi trạng thái sau lúc gửi (luật «vừa đổi» của lõi, hàng 36).
- **Căn mới** — căn vừa lên Đang bán sau lúc gửi và khớp một bộ đã gửi (luật khớp ở lõi, Hỏi-2).

Mỗi tin chạm vào là mở đúng chỗ làm tiếp: chi tiết Lần gửi ở Đã gửi (`/shares?lan=<id>`), hay luồng Gửi với căn mới
(`/shares/new?can=<id>`). Máy không gửi gì — người tự bấm gửi (bất biến 3). Lịch xem (loại thứ tư ở `vo-va-ia.md` §2)
chờ điều kiện ở Tham chiếu §13 nên ngoài vòng này.

Hợp đồng mang thêm mục «Ngoài-3 hàng 36» (luật đợt 56): ngăn chi tiết của Đã gửi có trạng thái đang tải và lỗi tải kèm
thử lại qua `TrangThai`, không còn trống.

## Dữ liệu và luật

- **Nguồn**: `shares` của chính người xem (người gửi = người xem), `share_events`, `listing_events` (`price_changed`,
  `status_changed`), `listings` và danh mục (số phòng ngủ) — cùng nguồn Đã gửi đọc. Không đọc bảng chủ nhà, không số khách,
  không lớp `source` (bất biến 2). Link đã tắt không sinh tin «Vừa đổi», «Căn mới»; tin phản ứng đã có trước lúc tắt vẫn hiện.
- **Cửa API**: `GET /api/v1/today/buyer` (vai Đầu khách; khác 403). Trả danh sách tin đã dựng, mỗi tin một `kind`
  (`reaction` · `changed` · `new_match`), mốc giờ, Lần gửi (id, người nhận), căn (id, tên căn), và phần riêng của loại.
- **Lõi** (`packages/core/src/today/dau-khach.ts`): hàm thuần dựng tin từ sự kiện đã lọc — gom phản ứng theo Lần gửi × ngày,
  «vừa đổi» dùng lại `vuaDoi`/`giaLucGui` của hàng 36, «căn mới» dùng luật khớp mới `khopBoDaGui` đứng trên `LUAT_GOI_Y`
  (cùng toà, cùng số phòng ngủ, giá trong ±15% giá lúc gửi của một căn trong bộ — Hỏi-2). Cửa sổ: 7 ngày gần nhất, nhóm
  theo ngày giờ Việt Nam (Hỏi-3). Mọi ngưỡng là mặc định dựng sẵn, sàn chỉnh sau (trang nền tri thức, đợt ban-dau-2910).
- **Màn**: vùng «Đầu khách» trong `/today`, dựng khuôn `KhungHomNayDauKhach` (nhóm mới `hom-nay-dau-khach`) ở
  `apps/web/src/app/(app)/today/buyer/`. Nối vào `page.tsx` và `vungTheoVai` của `/today` là hai dòng thêm — hai tệp ấy
  thuộc vùng hàng 92, nên phần nối chờ hàng 92 gộp (hàng 37 «sau: 36, 92»).

## Đối chiếu ngành (ADR-0022)

Nguồn: `docs/product/doi-chieu-nganh.md` §4 và §8 (đường dẫn nguồn của từng sản phẩm ở trang ấy).

| Năng lực | RESO | Sản phẩm cùng ngành | Ta định làm | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|
| Căn mới khớp khách | `Prospecting` (tiêu chí tìm đã lưu), `ContactListings` | KW Command: Saved Search là bộ tiêu chí động của từng khách · Lofty: Property Alerts tự chọn căn theo hỏi đầu và hành vi | Khớp theo **bộ đã gửi**: cùng toà, cùng số phòng ngủ, giá ±15% một căn trong bộ (`khopBoDaGui` trên `LUAT_GOI_Y`) | **Có** — họ khớp theo tiêu chí của khách; ta khớp theo bộ đã gửi với ngưỡng dựng sẵn → Hỏi-2 |
| Cửa sổ và nhóm tin | — | Lofty: bộ lọc mặc định «Today's Opportunities» không sửa được, cộng bộ của đội và bộ riêng · BoomTown: danh sách mặc định Today's To-Dos không sửa được | 7 ngày gần nhất, nhóm theo ngày | **Có** — Lofty cho đội và người thêm bộ riêng → Hỏi-3 |
| Loại tin | `ContactListings` (phản hồi theo căn) | Lofty: theo dõi mở, bấm; hành vi sinh «Opportunity» theo tiêu chí cố định · BoldTrail: theo dõi mở bằng pixel | Ba loại cố định: Khách phản ứng · Vừa đổi · Căn mới; nhãn đặt một chỗ có tên ở `packages/core` | **Có** — Lofty cố định tiêu chí Opportunity nhưng cho đội tạo bộ lọc → Hỏi-4 |
| Gửi tự động | `Prospecting` (gửi theo lịch) | Lofty Property Alerts, BoomTown e-Alert tự gửi | Không tự gửi: tin chỉ mở luồng Gửi | Không — bất biến 3 (người luôn là người bấm gửi) |

## Lựa chọn

- Bố cục «Dòng tin» theo khối đích `solution-crm-5` ở `vo-va-ia.md` §2 — Hỏi-1 trình ba lối.
- Người nhiều vai thấy hợp các vùng của mọi vai (Tham chiếu §9); trưởng nhóm không có vai Đầu khách không thấy vùng này.
- Không đánh dấu đã đọc, không đẩy thông báo ở vòng này (Out of scope).

<!-- UX-SPEC:START -->
<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: tab Hôm nay → vùng «Đầu khách» liệt tin theo ngày (Hôm nay · Hôm qua · ngày) → chạm một tin → chi tiết Lần gửi
  ở Đã gửi, hay luồng Gửi với căn mới (điểm ra: Đã gửi / Gửi).
- Biên: chưa gửi link nào hay 7 ngày không có gì mới → trống kèm «Gửi căn»; người không có vai Đầu khách không thấy vùng.
- Lỗi & quay lại: tải lỗi → «Chưa tải được — thử lại» kèm nút «Thử lại»; mở chi tiết Lần gửi lỗi → ngăn chi tiết báo lỗi kèm
  thử lại (Ngoài-3 hàng 36), đóng ngăn là về danh sách.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Hôm nay — vùng Đầu khách | Biết khách nào vừa phản ứng và căn nào vừa đổi hay mới khớp để làm tiếp ngay | Tab Hôm nay / Đã gửi chi tiết, Gửi |
| Đã gửi — ngăn chi tiết | Xem một Lần gửi (đã có, hàng 36) — thêm mở thẳng từ `?lan=` và trạng thái tải, lỗi | Hôm nay, danh sách Đã gửi / Gửi |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-hndk-dang-tai | Hôm nay — Đầu khách | khung chờ của bố cục | chờ |
| ST-hndk-trong | Hôm nay — Đầu khách | «Chưa có gì mới trong 7 ngày» + nút «Gửi căn» | mở Bảng hàng để chọn căn gửi |
| ST-hndk-loi | Hôm nay — Đầu khách | «Chưa tải được — thử lại» + nút «Thử lại» | thử lại |
| ST-hndk-co-tin | Hôm nay — Đầu khách | nhóm theo ngày; mỗi dòng: nhãn loại, người nhận, tên căn, chi tiết (lượt mở · quan tâm / giá cũ → mới / trạng thái mới / «khớp bộ gửi [người nhận]»), giờ | chạm dòng |
| ST-dg-ct-dang-tai | Đã gửi — ngăn chi tiết | khung chờ trong ngăn | chờ |
| ST-dg-ct-loi | Đã gửi — ngăn chi tiết | «Chưa tải được — thử lại» + nút «Thử lại» | thử lại / đóng ngăn |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Điện thoại 375 là khổ chính: một cột, không cuộn ngang; máy tính dùng cùng dòng tin, cột rộng tối đa của vỏ.
- Giờ hiện theo giờ Việt Nam; nhóm ngày theo ngày Việt Nam.
- Một Lần gửi có nhiều lượt mở trong một ngày là MỘT dòng phản ứng (lượt mở · quan tâm cộng dồn, giờ gần nhất).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| Khối `solution-crm-5` (ReUI Pro) | ghép | khối đích của `vo-va-ia.md` §2 cho «Hôm nay, đầu khách» (Hỏi-1) |
| `TrangThai`, `ChoTai`, `Item`, `Badge` | dùng | trạng thái và dòng đã có trong kho |
| `KhungHomNayDauKhach` | tạo | khuôn của nhóm màn mới |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: dòng «Hôm nay, đầu khách» ở `docs/design/vo-va-ia.md` §2 chốt bố cục «Dòng tin» (`solution-crm-5`, nhóm theo ngày);
chạm dòng ra màn khác chứ không mở chi tiết tại chỗ, nên không phải danh-sách-chi-tiết.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Đầu khách |
| Việc chính | Biết khách vừa phản ứng, căn đã gửi vừa đổi, căn mới khớp để gửi tiếp |
| Tần suất | mỗi ngày nhiều lần |
| Số bản ghi | vài chục |
| Thiết bị | điện thoại |
<!-- UX-SPEC-TEMPLATE>>> -->
<!-- UX-SPEC:END -->
