# Luật chia lead — màn Cài đặt sàn (hàng 48) · thiết kế

Hàng 48 của lộ trình (dãy D, đợt `dau-khach-nhap`), mã phạm vi P11. Chủ kho ký Cổng Đáng 05/11 («Build tất cả.»).
Câu giao: «Quản trị sàn đổi cách chia lead, hạn nhận và hạn gọi, ngưỡng hai hàng đợi của Hôm nay; đổi chỉ áp cho lead
mới». Gộp thêm Ngoài-9 và Ngoài-10 của hàng 105 (luật đợt 69): danh bạ thành viên.

## Đứng trên gì

Phần máy chủ đã xong ở ba hàng trước — vòng này không thêm bảng, migration hay lối API:

- **Hàng 81** — sổ điểm biến thiên ở lõi (`packages/core/src/config/so.ts`). Sáu điểm giá trị đơn mang `man: "48"`:
  `lead_routing.strategy` (#3), `lead_routing.accept_minutes` (#1), `lead_routing.first_call_minutes` (#2),
  `lead_routing.alert_to` (#3a), `queue.call_back_after_days` (#4), `queue.price_negotiation_after_days` (#5). Sổ giữ tên,
  kiểu, khoảng, mặc định, vai được đổi và hiệu lực (`moi` · `tinh_lai`) của từng điểm.
- **Hàng 82** — lối chung `GET/PATCH /api/v1/company/settings`: mọi thành viên đọc, vai trong `aiDoi` đổi nguyên khối,
  mỗi khoá một sự kiện nhật ký ghi người và vai, cặp hạn trái luật bị từ chối nêu khoá, 403 cho vai khác.
- **Hàng 25** — lead mang dấu cách chia và hai hạn từ nhịp đầu nó vào (`app.stamp_leads`); lead đã đóng dấu giữ cách cũ.

Màn 48 là mặt người nhìn của ba hàng ấy, cộng hai mục vá danh bạ.

## Màn

`/settings/lead-routing` — mục «Luật chia lead» của nhóm «Sàn [Tên]» trong Cài đặt hợp nhất (luật đợt 62), đi khuôn
`MucCaiDat` của nhóm `cai-dat-san` (bố cục Đọc). Thân là khối `settings-3` đã chuyển thể (`MucCaiDatKhoi` +
`SettingField`), một Frame duy nhất, chân có «Hoàn lại» và «Lưu». Trang đặt `khoi` vì khung `MucCaiDat` không chuyền chân
khung (khung.tsx là tệp chung của nhóm).

Sáu dòng, hai đoạn trong cùng Frame:

| Đoạn | Dòng (tên lấy từ sổ) | Điều khiển | Câu hiệu lực (từ `hieuLuc` của sổ) |
|---|---|---|---|
| Chia lead | Cách chia lead không trùng | `Select` năm lựa chọn, dưới là một câu giải thích lựa chọn đang chọn | Áp cho lead mới — lead đã chia giữ cách cũ |
| Chia lead | Hạn nhận lead | `NumberField` phút, 1–1440 | Áp cho lead mới — lead đã chia giữ hạn cũ |
| Chia lead | Hạn gọi lần đầu | `NumberField` phút, 1–1440, không nhỏ hơn hạn nhận | Áp cho lead mới — lead đã chia giữ hạn cũ |
| Chia lead | Báo lead quá hạn cho ai | `Select` hai lựa chọn | Áp ngay |
| Hàng đợi Hôm nay | «Cần gọi lại» sau số ngày chưa xác nhận | `NumberField` ngày, 7–30 | Áp ngay cho Hôm nay của mọi đầu chủ |
| Hàng đợi Hôm nay | «Nên gọi ép giá» sau số ngày | `NumberField` ngày, 7–14 | Áp ngay cho Hôm nay của mọi đầu chủ |

Mỗi dòng ghi thêm nguồn: «Mặc định» khi sàn chưa đổi, hay dấu «Đã đổi» kèm «[Tên] · dd/mm» (người đổi lần cuối, đọc từ
`updatedBy` của lối chung và danh bạ thành viên của sàn đọc ở máy chủ khi dựng màn; người đã rời sàn → «Đã rời sàn»).

Nhãn năm cách chia theo `CONTEXT.md` dòng «Cách chia»: Theo vùng, lần lượt · Lần lượt toàn sàn · Theo vùng, ít lead đang
mở · Kho chung · Trưởng nhóm chia tay. Hai người đọc lời báo: Trưởng nhóm · Trưởng nhóm và quản trị sàn. Nhãn mặc định
giữ một chỗ có tên trong lõi (`packages/core/src/routing/nhan.ts`, luật `.claude/rules/thiet-ke-doi-chieu.md`: tới khi có
sổ từ vựng hàng 90 thì nhãn mặc định ở `packages/core`, không viết bảng trong màn), là `Record` theo thực đơn của lõi nên
thêm lựa chọn mới mà thiếu nhãn thì kiểm kiểu đỏ. Mỗi cách chia kèm một câu giải thích ngắn cùng chỗ.
Chữ «lead» giữ như từ vựng hiện hành (ADR-0021 sửa đổi 05/11 điểm 6; luật đợt 61: đổi chữ một lượt ở hàng 106); không
dùng «Luật chia» cho cách chia, «Cảnh báo» cho lời báo (cột «Không dùng» của `CONTEXT.md`).

### Lưu

Một nút Lưu cho cả màn: gửi một `PATCH /api/v1/company/settings` chỉ mang các khoá đã đổi — nguyên khối, một khoá sai thì
không khoá nào được ghi. Trước khi gửi, màn kiểm bằng chính `kiemGiaTri` của lõi (khoảng, số nguyên, hạn gọi không nhỏ hơn
hạn nhận) và báo dưới đúng ô (`FieldError`); còn ô sai thì Lưu khoá. Máy chủ trả 400 → lý do (mở đầu bằng khoá) hiện dưới
đúng dòng; 403 → báo «Chỉ quản trị sàn đổi được luật này»; lỗi mạng → báo lỗi kèm «Thử lại», giá trị đang gõ giữ nguyên.
Lưu xong → toast «Đã lưu · áp cho lead mới từ bây giờ» (hay «Đã lưu» khi chỉ đổi điểm áp ngay), các dòng đọc lại từ phản
hồi. «Hoàn lại» trả mọi ô về giá trị đang áp.

### Trạng thái đặc biệt

- **Sàn có bộ nhóm Hôm nay riêng** (`GET /api/v1/company/settings/queue` trả `source: "company"`): bộ đọc của lõi
  (`docBoNhom`) bỏ qua hai khoá ngưỡng khi bộ của sàn hợp lệ — sửa ở đây sẽ lưu mà không áp. Hai dòng ngưỡng khoá, kèm báo
  «Sàn đang dùng bộ nhóm Hôm nay riêng — ngưỡng đặt trong bộ ấy». Chưa màn nào ghi bộ riêng, nên ca này hiếm.
- **Dòng của sàn hỏng hay cặp hạn trái luật có sẵn** (`errors` của lối chung không rỗng): một báo trên đầu khung nêu điểm
  đang chạy theo mặc định; lưu giá trị đúng thì báo mất.
- **Không tải được cấu hình**: `TrangThai kind="error"` «Chưa tải được luật chia lead» kèm «Thử lại».
- **Không phải quản trị sàn**: cột mục lục không có mục (đã có ở `cotCaiDat`); mở thẳng địa chỉ → `chanMucSan` đưa về
  Cá nhân kèm «Mục này chỉ quản trị sàn mở được».

## Ngoài-9, Ngoài-10 hàng 105 — danh bạ thành viên

`apps/web/src/app/(app)/inventory/danh-ba.ts` (cột «Đầu chủ» của Bảng hàng):

- **Ngoài-9** — bản danh bạ giữ trên máy có thể cũ: người mới vào sàn chưa có trong bản ấy thì hiện nhầm «Đã rời sàn».
  Sửa: danh bạ mang cờ «đã đọc từ máy chủ trong phiên này». «Đã rời sàn» chỉ khi cờ bật và người không có trong danh bạ;
  chỉ có bản giữ trên máy thì người lạ hiện «…» (chờ), như ca chưa có danh bạ (`cot.ts`: «lúc ấy không kết luận "Đã rời
  sàn"»).
- **Ngoài-10** — đọc danh bạ hỏng (mạng, máy chủ lỗi) bị nuốt, không thử lại trong phiên. Sửa: hook trả trạng thái lỗi và
  hàm thử lại; Bảng hàng hiện một dòng báo «Chưa đọc được danh bạ thành viên — cột Đầu chủ có thể thiếu tên» kèm «Thử lại»
  (qua `TrangThai`), bấm thì đọc lại; được thì báo mất. Không tự thử lại theo nhịp.

## Đối chiếu ngành (ADR-0022)

Nguồn: `docs/product/doi-chieu-nganh.md` mục chia lead (tra 01/11, đường dẫn help center ở đó). RESO không định nghĩa
chia lead.

| Năng lực | RESO | Follow Up Boss | KW Command | Lofty | Ta làm gì | Ta viết cứng — họ cho cấu hình |
|---|---|---|---|---|---|---|
| Ai đặt luật chia | — | Sàn (chủ tài khoản, admin) | Sàn | Sàn, ba cấp | Quản trị sàn, một cấp sàn | Cấp văn phòng/đội (Lofty) — đã chốt §12 01/11: một cấp sàn |
| Cách chia | — | Lần lượt, ai nhận trước, Pond; luật theo nguồn, tag, giá, vùng | Ngẫu nhiên có trọng số, ai nhận trước, lần lượt, giao thẳng | Lần lượt, Next Up có trọng số, ai nhận trước | Thực đơn năm cách của lõi, sàn chọn một | Luật theo điều kiện, trọng số — đã chốt §12 01/11 (ADR-0018: «không đối tượng tự tạo, công thức… tới khi có số đo từ hai sàn thật») |
| Hạn nhận | — | Tối đa 30 phút, có người hứng | Đội đặt | chưa kiểm | 1–1440 phút, sàn đặt | — |
| Quá hạn | — | Người hứng | chưa kiểm | chưa kiểm | Lời báo cho trưởng nhóm (hay cả quản trị) | Người hứng nhận lead thay — lời báo đã chốt ở hàng 25 |
| Trần lead mỗi người, lịch theo giờ | — | — | Có | chưa kiểm | Không làm | Hàng sau khi có số đo (Out of scope) |
| Nhật ký đổi | — | chưa kiểm | chưa kiểm | Nhật ký nhận ở Pond | Sự kiện mỗi khoá (hàng 82); màn hiện người đổi lần cuối | — |

Mọi dòng «ta cứng» đã có quyết định ở Tham chiếu §12 (01/11, ADR-0018, chủ kho duyệt) — không mở Hỏi mới ở Cổng Phạm vi
(AGENTS.md: không hỏi lại điều đã chốt ở §12). Nhãn năm cách chia là nhãn mặc định ở lõi; sàn đổi tên khi có sổ từ vựng
(hàng 90).

## Không làm ở vòng này

- Chỉnh bộ nhóm Hôm nay (`queue.groups`, #36 ghi màn 48 — đối tượng nhiều dòng có bộ kiểm riêng của hàng 22): gộp vào
  đây vượt trần cỡ hợp đồng; tách thành hàng mới (yêu cầu giám sát D-18).
- Xem cả nhật ký đổi cấu hình; «về mặc định» một chạm; trần lead mỗi đầu chủ, lịch theo giờ (KW) — hàng sau khi có số đo.
- Bản điện thoại: Cài đặt sàn là màn máy tính (Tham chiếu §11, «Quản trị · máy tính»); khổ hẹp vẫn đọc được nhờ
  `SettingField` xếp dọc.
- Dọn dòng «Chỗ hở — Luật chia lead» ở `docs/design/vo-va-ia.md` §3: màn dựng bằng khối settings-3 (bậc 2), không ghép
  bảng luật; sửa dòng có sẵn của tệp chung là `cham-tep` (luật đợt 12) — để giám sát xếp.

<!-- <<<UX-SPEC-TEMPLATE -->
## Đặc tả UX

### 1. Luồng

- Suôn sẻ: Cài đặt › Sàn [Tên] › Luật chia lead → đổi Hạn nhận 15 → 20 và Cách chia → Lưu → toast «Đã lưu · áp cho lead
  mới từ bây giờ», dòng đổi mang «Đã đổi · [Tên] · dd/mm» (điểm ra: ở lại màn).
- Biên: vai khác mở thẳng địa chỉ → về Cá nhân kèm câu báo; sàn có bộ nhóm riêng → hai dòng ngưỡng khoá kèm báo; dòng hỏng
  có sẵn → báo nêu điểm đang chạy mặc định.
- Lỗi & quay lại: gõ ngoài khoảng → báo dưới ô, Lưu khoá, sửa lại ô; máy chủ từ chối → lý do dưới đúng dòng, giá trị giữ;
  mạng hỏng lúc lưu → báo kèm «Thử lại»; «Hoàn lại» về giá trị đang áp.

### 2. Kiểm kê màn

| Màn | MỘT việc của màn | Vào từ / ra tới |
|---|---|---|
| Luật chia lead | Đặt cách chia, hai hạn, người đọc lời báo và hai ngưỡng hàng đợi của sàn | Cột mục lục Cài đặt / ở lại màn |
| Bảng hàng (cột Đầu chủ) | Đọc danh bạ thành viên cho cột Đầu chủ, báo khi đọc hỏng | Nhà Bảng hàng / ở lại |

### 3. Bảng trạng thái

<!-- <<<UX-STATE-TABLE -->
| Trạng thái | Màn | Hiển thị gì | Người làm gì tiếp |
|---|---|---|---|
| ST-luat-chia-lead-mac-dinh | Luật chia lead | Sáu dòng, giá trị đang áp, «Mặc định» hay «Đã đổi · [Tên] · dd/mm» | Đổi ô |
| ST-luat-chia-lead-dang-sua | Luật chia lead | Ô đã đổi, Hoàn lại và Lưu bật | Lưu / Hoàn lại |
| ST-luat-chia-lead-o-sai | Luật chia lead | Báo dưới ô («Từ 1 tới 1440 phút», «Không nhỏ hơn hạn nhận lead»), Lưu khoá | Sửa ô |
| ST-luat-chia-lead-dang-luu | Luật chia lead | Nút Lưu chờ, ô khoá | Chờ |
| ST-luat-chia-lead-da-luu | Luật chia lead | Toast «Đã lưu · áp cho lead mới từ bây giờ» | Ở lại |
| ST-luat-chia-lead-loi-luu | Luật chia lead | Lý do dưới đúng dòng (400) hay báo lỗi kèm «Thử lại» (mạng) | Sửa / Thử lại |
| ST-luat-chia-lead-bo-nhom-rieng | Luật chia lead | Hai dòng ngưỡng khoá, báo «Sàn đang dùng bộ nhóm Hôm nay riêng — ngưỡng đặt trong bộ ấy» | Không |
| ST-luat-chia-lead-dong-hong | Luật chia lead | Báo trên đầu khung nêu điểm đang chạy mặc định | Lưu giá trị đúng |
| ST-luat-chia-lead-loi-tai | Luật chia lead | «Chưa tải được luật chia lead» + Thử lại | Thử lại |
| ST-luat-chia-lead-khong-quyen | Cá nhân | «Mục này chỉ quản trị sàn mở được» | Không |
| ST-bang-hang-danh-ba-loi | Bảng hàng | «Chưa đọc được danh bạ thành viên — cột Đầu chủ có thể thiếu tên» + Thử lại | Thử lại |
| ST-bang-hang-danh-ba-cu | Bảng hàng | Người chưa có trong bản danh bạ giữ trên máy hiện «…», không «Đã rời sàn» | Chờ đọc xong |
<!-- UX-STATE-TABLE>>> -->

### 4. Hành vi

- Ô số nhận số nguyên trong khoảng của sổ; hạn gọi không nhỏ hơn hạn nhận — kiểm bằng `kiemGiaTri` của lõi, cùng luật với
  máy chủ.
- Lưu chỉ gửi khoá đã đổi; Enter trong ô số không gửi biểu mẫu khi còn ô sai.
- Khổ hẹp: `SettingField` xếp dọc (orientation responsive của khối).

### 5. Xuất xứ component

| Component | Nấc (dùng / ghép / mở rộng / tạo) | Vì sao (1 dòng) |
|---|---|---|
| `MucCaiDat` + `MucCaiDatKhoi` + `SettingField` (settings-3) | dùng | Khối đã chuyển thể của nhóm cai-dat-san (bậc 2) |
| `Select` (ui), `NumberField` (reui), `Badge` (reui) | dùng | Thành phần đã cài |
| `TrangThai`, `FieldError`, toast `sonner` | dùng | Khuôn trạng thái của kho |

### 6. Khuôn IA đã chọn + căn cứ

Khuôn IA: một-cột-cuộn
Căn cứ: nhóm `cai-dat-san` khai `bo_cuc: doc`, mỗi mục một Frame dòng cài đặt (settings-3) — luồng hiển nhiên, không tra.

### 7. Thẻ việc

| Trường | Giá trị |
|---|---|
| Ai dùng | Quản trị sàn |
| Việc chính | Đặt lead mới về tay ai, hạn nhận và hạn gọi, khi nào căn vào hàng đợi gọi lại |
| Tần suất | hiếm |
| Số bản ghi | một |
| Thiết bị | máy tính |
<!-- UX-SPEC-TEMPLATE>>> -->
