# Vỏ, IA và khối đích của từng màn

Chọn 30/10/2026 trên kho ReUI (tài khoản Pro), theo ADR-0002. Cách xếp nhà, nút theo vai và đường dẫn là điều đang
đúng của sản phẩm ở [Tham chiếu §9](../product/tham-chieu.md#9-điều-hướng); tệp này giữ phần giao diện: vỏ nào, khối nào,
đổi gì khi chuyển thể. Luật dùng lại: [`.claude/rules/giao-dien.md`](../../.claude/rules/giao-dien.md).

- Khối đích là **đích đã chọn**, không phải mã đã có. Phiên làm màn cài khối đích, chuyển thể (đổi dữ liệu, chữ, prop),
  rồi ghi vào bảng «Khối đã chuyển thể» của skill giao diện kho (hàng 4 lộ trình dựng skill ấy).
- Đổi khối đích của một màn: sửa dòng ở đây trong cùng PR, nói vì sao.
- Mọi khối cài theo style `base-nova` (Base UI). Đường xem trước dưới đây là bản Radix — cùng bố cục.
- Họ khung: màn vận hành **Frame**; trang khách **card**.

## 1. Vỏ

### Máy tính — `app-shell-8` «Inventory Admin»

[Xem trước](https://reui.io/preview/radix/app-shell-8) · cột biểu tượng + cột thứ hai đổi theo nhà + thanh trên có
bộ chọn dạng đường dẫn, ô tìm ⌘K, nút tạo, chuông.

| Vùng của khối | Thành của Quỹ hàng |
| --- | --- |
| Bộ chọn Org / App / Env | Sàn (chỉ hiện khi người thuộc hơn một sàn) / Dự án. Bỏ bộ chọn thứ ba |
| Ô tìm ⌘K giữa thanh trên | «Gõ mã căn»: gõ mã → mở hồ sơ căn; gõ tên nhà → nhảy nhà. Phím `/` và ⌘K |
| Nút «Create» | «+ Lead» (nút chính); thêm «Nhập Excel», «Phát hàng» dạng viền, ẩn theo vai |
| Chuông + ngăn thông báo | Báo lead mới, lead quá hạn, khách mở link |
| Cột biểu tượng | Hôm nay · Bảng hàng · Đã gửi · Đội · Cài đặt sàn (ở đáy) — theo bảng vai ở Tham chiếu §9 |
| Cột thứ hai theo nhà (`INNER_NAV`) | Bảng hàng: góc nhìn của đội, của tôi, «+ Lưu góc nhìn» · Đã gửi: Link đã gửi, Lịch xem · Cài đặt sàn: các mục cài đặt · Hôm nay: các hàng đợi của bộ nhóm · Đội: Tổng quan |
| Thẻ chân cột (`footer`) | Bảng hàng: độ tươi (tỉ lệ căn xác nhận trong N ngày). Nhà khác: bỏ |
| Gập cột thứ hai (tay nắm ở mép cột) | **Mọi nhà có cột thứ hai và mặc định mở** (hàng 91, chủ kho 02/11 — thay luật gập sẵn ở Bảng hàng, Hôm nay, hồ sơ căn của 30/10). Người gập thì nhớ theo người, theo sàn, theo nhà |

Vì sao khối này: nó là vỏ duy nhất trong 36 vỏ có đủ ba thứ §9 đòi — bộ chọn sàn/dự án trên thanh trên, ô gõ ở giữa,
và cột thứ hai đổi theo nhà (chỗ của góc nhìn đã lưu thay các tab của Sheet). Nền sáng, viền mảnh, không trang trí; có
bản tối. Đã so: `app-shell-36` (Invest Ops dùng — một cột, không có ô gõ giữa), `app-shell-13` (thanh trên rộng nhưng
không có cột theo nhà), `app-shell-14` (có thanh cách xem nhưng thừa so với bảng hàng), `app-shell-15`/`-9`/`-6` (thanh
tối, nặng).

**Đã chuyển thể (hàng 53, 31/10)** — tệp ở `apps/web/src/components/shell/`, thư mục cài `components/blocks/` không giữ.
Đổi so với khối: Org → bộ chọn Sàn (một sàn thì chỉ hiện tên), bỏ App và Env; chưa có bộ chọn Dự án (kho chưa có danh
mục dự án — hiện khi kết nối danh mục về); ô tìm → «Gõ mã căn» (`command`, ⌘K và `/`, chỉ vai có Bảng hàng); «Create» →
các nút + Lead · Nhập Excel · Phát hàng theo vai; menu tài khoản rời chân cột lên thanh trên (tên sàn, Tôi, sáng/tối,
đăng xuất); ngăn thông báo trống tới khi có nguồn; tay nắm cột thứ hai và nút tìm dùng `Button` của kho thay thẻ
`<button>` trần; nhà, tab và nút đọc `navigationFor` của `packages/core`. Cột thứ hai nhớ mở/gập bằng cookie `qh_cot2`
theo người, sàn đang làm và nhà. Danh mục: `.agents/skills/quy-hang-ui/catalog.md` «Khối đã chuyển thể».

### Điện thoại — ghép, không có khối

ReUI không có vỏ thanh tab dưới (đã tìm cả block lẫn ví dụ). Dưới `md`, vỏ `app-shell-8` ẩn cột, thay bằng:

- Thanh trên mảnh: tên nhà · nút gõ mã căn (mở `CommandDialog` toàn màn) · chuông.
- Thanh tab dưới cố định: `Link` dẫn đường, biểu tượng lucide trên chữ `text-xs`, `aria-current="page"` cho tab đang mở
  (tab đang mở chỉ đậm chữ và biểu tượng — chủ kho gật trên bản bấm được 31/10) — Hôm nay · Bảng hàng · Gửi · Tôi theo
  vai; telesales: Hôm nay · Lead · Tôi; người chỉ quản trị sàn: Cài đặt sàn · Tôi. Không dùng `Button` vì tab cần cao
  hơn cỡ nút của style (luật ReUI cấm ép `h-*` lên `Button`).
- Ngăn và hộp thoại trên điện thoại là `Drawer` từ đáy.

Đây là bậc 6 của thang (ghép từ thành phần) — ghi ở «Chỗ hở».

### Không có vỏ

Trang khách `/s/<mã>` (đầu trang tên sàn + người gửi, mảnh) · đăng nhập và chọn sàn.

## 2. Bản đồ màn → khối đích

**Bản đồ khuôn** (hàng 58, 31/10): nhóm màn đã có màn thật có tệp máy đọc ở [`design/patterns/`](../../design/patterns/)
— `xac-thuc`, `cai-dat-san`, `trang-tam`, `trang-thai` — mỗi tệp khai khuôn, màn mẫu, khe bắt buộc, khối cấm và ngoại lệ có
lý do; `node packages/ui-lint/ban-do-khuon.mjs` kiểm mọi màn của nhóm dựng qua khuôn; luật lint `quy-hang-ui/ban-do-khuon` chặn
nhập khối cấm lúc viết và bài quét chạy trong `npm run lint` (hàng 59). Bảng dưới giữ **lời giải thích**:
màn nào, archetype gì, khối đích nào và vì sao; bản đồ giữ **khuôn máy giữ**. Nhóm chưa có màn (bảng hàng, hồ sơ căn,
Hôm nay…) chưa có tệp — khuôn của nhóm sinh ra cùng màn đầu tiên của nhóm.

**Nhóm mới** (hàng 60). Màn đầu tiên của một archetype chưa có trong bản đồ (bắt đầu từ Bảng hàng, hàng 14) tạo mục bản
đồ `design/patterns/<nhóm>.md` và khuôn ngay trong vòng ấy, theo khối đích ở bảng dưới; vòng sau của nhóm chỉ điền khe.
Bài quét khuôn giữ luật này: mọi `apps/web/src/app/**/page.tsx` trả JSX mà không thuộc nhóm đơn vị màn nào là lệch
«màn ngoài bản đồ» (nhóm `ngoai-ban-do`) — đỏ ở `npm run lint` và ở chấm theo vòng cho tới khi có mục bản đồ. Trang chỉ
chuyển hướng (không trả JSX) không phải màn. Đường đi của màn thật đầu tiên dưới `(app)`: trang tạm đỏ (gốc không phải
`Placeholder`) → rời `nhan_dien` trang tạm (`KH-tt-roi-nhom`) → màn ngoài bản đồ đỏ → thêm mục bản đồ và khuôn → xanh.

**Đối chiếu** (hàng 60). Trước khi dựng, xếp màn vào nhóm và mở tệp màn mẫu (`mau_dang_chay.tep`) của nhóm — chép mẫu
đang chạy, không chép mã gần nhất. Vòng chạm màn của một nhóm chụp màn mới cạnh màn mẫu, cùng trạng thái
(`mau_dang_chay.trang_thai`), ở khổ 1440 và 375:

1. `node packages/ui-lint/doi-chieu.mjs --base <nhánh chính> --slug <slug>` — kế hoạch cặp ảnh và tên tệp ảnh, ghi
   `_acceptance/<slug>/doi-chieu/ke-hoach.json`.
2. Phiên `design-pass` (trình duyệt trong app) chụp từng cặp vào `_acceptance/<slug>/doi-chieu/`.
3. `node packages/ui-lint/doi-chieu.mjs --dung <slug>` — ghép `doi-chieu/index.html`; thiếu ảnh thì đỏ.
4. Gửi `doi-chieu/index.html` kèm thẻ Cổng Phạm vi **trước khi ký** — chủ sản phẩm đọc màn mới cạnh màn mẫu ở cổng
   sẵn có, không thêm lượt gọi người. Kit chưa tự in ảnh lên thẻ (mục chờ KH2, KH3 của kit).

`doi-chieu.mjs --mau --slug <slug>` lập kế hoạch cho riêng màn mẫu của mọi nhóm — dùng khi cần chứng màn mẫu chạy được.

**Ba lối — ô chưa có khuôn** (ADR-0019, hàng 84). Một vòng chạm **ô chưa có khuôn** khi, so nhánh chính: thêm nhóm mới ở
`design/patterns/` (màn đầu của nhóm), đổi ô «Khối đích» của một màn ở bảng dưới, hay thêm một dòng «Chỗ hở» ở §3 (định
dựng một ô bằng ghép hay tự viết). Khi đó bước phân kỳ của `design-pass` **phải mở** (`divergence: opened`) với ba lối tên
cố định — **Trong kho** (khối đã chuyển thể hay khuôn gần nhất, tra ở `catalog.md` «Khối đã chuyển thể»), **ReUI** (một,
hai khối tra bằng MCP `reui`; khối đích ở bảng dưới là khuyến nghị đầu vào cho lối này, không còn là lời chốt cuối) và
**Vẽ mới** (ghép từ thành phần) — rồi gửi trang ba lối kèm thẻ Cổng Phạm vi trước khi ký; ký Cổng Phạm vi là duyệt lối
được khuyên hay lối người chọn thay. Lối không có ứng viên ghi «không có» kèm điều đã tra, không bỏ cột. Trang dựng bằng
lệnh — cách làm từng bước ở skill `quy-hang-ui` «Vòng giao diện qua bản đồ khuôn»:

1. `node packages/ui-lint/doi-chieu.mjs --ba-loi --slug <slug>` — sáu ảnh phải chụp (`<lối>-<khổ>.png`, 1440 và 375) và
   khung `_acceptance/<slug>/ba-loi/ba-loi.json`.
2. Chụp ba lối cùng dữ liệu mẫu, điền khung (nhãn, câu động cơ, câu đánh đổi mỗi lối; lời khuyên và lý do).
3. `node packages/ui-lint/doi-chieu.mjs --dung-ba-loi <slug>` — ghép `ba-loi/index.html`; thiếu chữ, thiếu ảnh hay ảnh sai
   khổ thì đỏ và không ghi trang.
4. Bước chấm: `node packages/ui-lint/doi-chieu.mjs --kiem-ba-loi --base <nhánh chính> --slug <slug>` — vòng có ô chưa có
   khuôn mà `design-pass.md` vắng, ghi `skipped`, hay trang ba lối thiếu, sai hoặc sửa tay sau khi dựng thì đỏ.

Màn đi khuôn sẵn của nhóm (chỉ điền khe) thì không cần trang và `divergence: skipped` vẫn hợp lệ. `npm run lint` giữ
thêm: hồ sơ đã mở bước phân kỳ phải có `ba-loi/index.html`; trang dựng bằng lệnh phải qua bài kiểm (hồ sơ đã ký giữ
nguyên trang).

**Số đo** (hàng 60). Ở bước chấm, vòng chạm giao diện chạy
`node packages/ui-lint/so-do-vong.mjs --slug <slug> --base <nhánh chính> --write` — ghi `_acceptance/<slug>/khuon-so-do.json`:
số tệp theo khuôn, số lần răng khuôn bắt trên các commit của vòng (cận dưới: lần bắt trước khi commit không đếm), số
lệch lọt, giờ máy, token và lượt gọi người. Lệch chủ sản phẩm thấy khi dùng mà lưới đã cho qua ghi một dòng vào
[`docs/design/lech-lot.md`](lech-lot.md). `--bao` soạn một dòng báo chỉ gồm số (kho kit công khai: không tên hồ sơ, không chữ sản phẩm, không dữ liệu người dùng); máy đăng nó lên kênh liên máy của kit (issue #308
của acceptance-gate-kit) sau mỗi ba vòng giao diện đã gộp (chủ sản phẩm duyệt 31/10, Hỏi-1 hàng 60).

Mã phác thảo theo Tham chiếu §10; hàng là mã hàng của lộ trình. «Phủ»: trọn = khối là cả màn; vùng = khối là vùng
chính, phần còn lại ghép. «Bố cục»: một trong bảy bố cục của ADR-0024 (hàng 91) — khuôn của nhóm khai nó ở `bo_cuc`.

| Màn | Phác thảo · hàng | Archetype | Bố cục | Khối đích | Phủ | Đổi khi chuyển thể | Phương án phụ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Bảng hàng, máy tính | 2, 2b · 14–16 | Table-backed management | Tràn | [`data-grid-editing-6`](https://reui.io/preview/radix/data-grid-editing-6) | trọn | Cột theo RESO và cách gọi của sàn; hàng nhóm toà → loại căn lấy từ `data-grid-grouping-2`; ô lọc theo cột giữ; dòng tổng giữ; đổi hàng loạt cho hàng đã tích | `data-grid-editing-5` (menu chuột phải, thêm cột theo kiểu trường) |
| Hồ sơ căn, cột phải | 2, M5 · 17–19, 23 | Record detail | Danh sách – chi tiết | [`solution-crm-4`](https://reui.io/preview/radix/solution-crm-4) | vùng | Ngăn phủ → cột phải chia đôi bằng `resizable`, bảng vẫn bấm được; giai đoạn → trạng thái có lịch sử; thanh xác suất → mức đủ; thêm giá + lịch sử trả giá bằng `timeline`; ảnh ba ngăn bằng `Tabs` + `c-file-upload-8` | `solution-inventory-7` (có thư viện ảnh) |
| Chế độ cuộc gọi | KD1, KD2 · 28–30 | Record detail | Hồ sơ | ghép | — | Xem «Chỗ hở» | khung «bước tiếp theo» của `solution-crm-4` |
| Hôm nay, đầu chủ | 1 · 22 | Table-backed management | Tràn | [`data-grid-grouping-1`](https://reui.io/preview/radix/data-grid-grouping-1) | trọn | Nhóm theo bộ nhóm của sàn (mặc định Lead mới · Nên gọi điều chỉnh giá · Cần gọi lại · Thiếu thông tin · Mới đổi); mỗi dòng một việc kèm lý do, giá, hạn và nút làm ngay; bỏ vòng tiến độ | `solution-crm-5` |
| Hôm nay, trưởng nhóm | TN1 · 42 | Dashboard grid | Bảng điều khiển | [`dashboard-6`](https://reui.io/preview/radix/dashboard-6) bỏ vùng biểu đồ | trọn | Ba ô số: lead quá hạn, hàng cũ, ngoại lệ; bảng theo người (ca → đầu chủ, thanh phủ → tỉ lệ hàng tươi); hàng đợi ngoại lệ kèm nút làm ngay; tăng giảm bằng Badge `-light`; bỏ biểu đồ nên không cài recharts | `stats-7` + `data-grid-grouping-2` (khối của bố cục ở ADR-0024) |
| Ô nhận lead + bốn nấc | L1–L5 · 24, 27, 51 | Frame stack | Đọc | ghép (khuôn `KhungLead`) + [`list-11`](https://reui.io/preview/radix/list-11) | vùng ×2 | Năm mục; kiểm trùng hiện bằng `Alert` dưới ô; cột phải là lead đã nhập với Badge bốn nấc; điện thoại (hàng 51) một cột, cột phải thành tab Lead. Bản ghép là đích (xem «Chỗ hở») | — (`dialog-16` loại: xếp người theo % khớp, trái luật trùng tất định) |
| Nhập Excel | N1, N2 · 20–21 | Wizard | Luồng nhiều bước | [`solution-crm-6`](https://reui.io/preview/radix/solution-crm-6) | trọn | Năm bước giữ: tải · ghép cột · xem trước · trùng · tóm tắt; đọc tệp thật tự viết (khối dùng số mẫu); ghép theo mẫu file của sàn | `wizard-5` |
| Phát hàng | D · 43 | Wizard dialog | Luồng nhiều bước | [`dialog-5`](https://reui.io/preview/radix/dialog-5) (thư viện mẫu) | vùng | Thẻ mẫu → mẫu bài của sàn (Zalo · Facebook · file Excel); chọn mẫu → xem trước → chép bài / xuất file; lấy lựa chọn từ bảng hàng; không đăng thay người | — (`dialog-13` loại: form tạo dự án, không có bước chọn mẫu) |
| Cài đặt sàn | S1–S6 · 45–50, 7 | Vertical rail settings | Đọc | rail = cột thứ hai của vỏ; mục: [`settings-3`](https://reui.io/preview/radix/settings-3), người dùng [`solution-users-8`](https://reui.io/preview/radix/solution-users-8), trạng thái `c-sortable-5` | vùng | Mỗi mục một Frame; luật chia lead ghép (xem «Chỗ hở») | `profile-1`, `settings-9` |
| Đăng nhập | — · 6, hàng mới | Auth card | — (ngoài vỏ) | [`auth-15`](https://reui.io/preview/radix/auth-15) | trọn | Bỏ nút Google/Apple/GitHub (kho chỉ đăng nhập bằng mã email, ADR-0005); giữ chân điều khoản; chuyển thể là hàng lộ trình mới | `auth-19` |
| Bảng hàng thẻ, điện thoại | M4 · 32 | — | Tràn (thành thẻ) | [`product-grid-4`](https://reui.io/preview/radix/product-grid-4) + ngăn lọc [`filter-sidebar-5`](https://reui.io/preview/radix/filter-sidebar-5) | vùng ×2 | Thẻ ngang: ảnh trái, mã căn + giá phải, hàng ba thông số Diện tích · Phòng ngủ · Hướng (`LivingArea`, `BedroomsTotal`, `DirectionFaces`); bỏ mô tả; tim → ô chọn khi giữ lâu; dòng nhóm → tên toà; ngăn lọc thành `Drawer` đáy | `wishlist-1` (dòng ảnh nhỏ, dày hơn) |
| Hồ sơ căn, điện thoại | M3 · 33, 40–41 | Record detail | Hồ sơ | [`product-detail-5`](https://reui.io/preview/radix/product-detail-5) | vùng | Khối mua → giá + thông số chính + «Xin dẫn xem» dính đáy; bỏ màu, cỡ, sao; phần chủ nhà không có (luật ẩn ở lõi) | `product-detail-1` |
| Hôm nay, đầu khách | M6 · 37 | — | Dòng tin | [`solution-crm-5`](https://reui.io/preview/radix/solution-crm-5) | trọn | Nhóm theo ngày giữ; loại: Căn mới · Đổi giá · Khách mở link · Lịch xem; bỏ lọc theo người | `sheet-7` |
| Hôm nay, đầu chủ trên điện thoại | M1 · 39 | — | Tràn (thành thẻ) | `data-grid-grouping-1` dạng danh sách `Item` | vùng | Cùng nhóm với bản máy tính; gọi lại một chạm | — |
| Gửi | G1–G3 · 34 | Flow | Luồng nhiều bước | thanh chọn nhiều của [`wishlist-1`](https://reui.io/preview/radix/wishlist-1) + ghép | vùng | «4 căn · Xem trước · Gửi» dính đáy; xem trước là `Drawer` toàn màn dựng chính trang khách; Gửi mở bảng chia sẻ của máy. Xem «Chỗ hở» | — |
| Đã gửi | G4 · 36 | — | Dòng tin | [`wishlist-4`](https://reui.io/preview/radix/wishlist-4) | vùng | Mỗi link một thẻ: bìa bốn ảnh căn, tên khách, số căn, lượt mở · quan tâm, giờ mở gần nhất; bấm thẻ mở dòng phản ứng | `list-11` (bảng, hẹp thì cắt cột) |
| Trang khách | T1–T3 · 35 | — (card) | — (trang khách, card) | [`wishlist-3`](https://reui.io/preview/radix/wishlist-3) (danh sách) + [`product-detail-5`](https://reui.io/preview/radix/product-detail-5) (chi tiết) | trọn | Bỏ giỏ; «giá xác nhận X ngày trước» ở chỗ giá; căn đã cọc mờ đi; nút «Quan tâm»; dữ liệu dựng từ luật ẩn | `product-grid-2` |
| Trang nhóm môi giới | T4 · 44 | Table-backed management | Tràn | [`data-grid-virtualization-1`](https://reui.io/preview/radix/data-grid-virtualization-1) | trọn | Chỉ đọc; hiện mã căn và phí | lưới của Bảng hàng ở chế độ chỉ đọc |
| Lịch xem | — · chờ H1 | — | Tràn | thành phần `event-calendar` trong Frame; chọn giờ [`schedule-4`](https://reui.io/preview/radix/schedule-4) | thành phần | Khối lịch đều họ card nên lấy thành phần | `event-calendar-2` |
| Tôi (điện thoại) | — · 38 | Frame stack | Đọc | [`settings-2`](https://reui.io/preview/radix/settings-2) | vùng | Mỗi dòng một công tắc hay một nút: hồ sơ, sàn, cài lên màn hình chính, thông báo, đăng xuất | `settings-3` |
| Trống · lỗi · báo | dùng chung | — | — (mọi bố cục, qua `TrangThai`) | [`empty-state-1`](https://reui.io/preview/radix/empty-state-1), [`empty-state-2`](https://reui.io/preview/radix/empty-state-2), ngăn báo `sheet-7`, `sonner` | — | Bỏ hình minh hoạ nặng; biểu tượng lucide nhỏ | `empty-state-12` |

**Chọn lại bằng khoá Pro (02/11, chủ kho).** Khoá ReUI Pro dùng được qua CLI (MCP `reui` vẫn đòi đăng nhập). Quét cả 672 khối, đặt cạnh màn đang chạy và chốt: thẻ 32 `product-grid-4`; Gửi 34 thanh chọn của `wishlist-1`; trang khách 35 `wishlist-3`; Đã gửi 36 `wishlist-4`; Tôi 38 `settings-2`; trưởng nhóm 42 `dashboard-6` bỏ biểu đồ; Phát hàng 43 `dialog-5`; ô nhận lead 24, 51 bỏ `form-2`, bản ghép là đích; Đăng nhập `auth-15` bỏ OAuth thành hàng mới. Giữ: 33 `product-detail-5`, 37 `solution-crm-5`, Nhập Excel `solution-crm-6`, vỏ, Bảng hàng, Hồ sơ căn, Cài đặt sàn. Lý do và ảnh so: trang so sánh gửi chủ kho 02/11. Đổi «Khối đích» ở đây mở bước phân kỳ ở vòng của từng màn như thường lệ (khối đích là khuyến nghị đầu vào cho lối ReUI).

**Đã chuyển thể (hàng 22, 01/11) — Hôm nay, đầu chủ.** Trang ba lối (ADR-0019) chọn lối ReUI: `data-grid-grouping-1` chuyển thể trên `data-grid` đã cài — bảng nhóm không tiêu đề cột theo bộ nhóm của sàn, nhóm gập được, cột Việc · Lý do · Giá · Hạn · nút; điện thoại xếp một cột. Khuôn `KhungHomNay`, nhóm `hom-nay-dau-chu` ở bản đồ khuôn.

**Đã chuyển thể (hàng 17, 01/11) — Hồ sơ căn, cột phải.** Trang ba lối (ADR-0019) chọn lối ReUI: `solution-crm-4`
chuyển thể bằng tay ở `apps/web/src/app/(app)/units/ho-so/` (khuôn `KhungHoSoCan`, nhóm màn `design/patterns/ho-so-can.md`)
— ngăn phủ → cột chia đôi bằng `resizable` cạnh Bảng hàng; giá + mức đủ đầu cột thay thanh xác suất; khối «Key fields» →
thuộc tính căn tự điền (khoá); giai đoạn → trạng thái của lần rao đang xem, kèm danh sách các lần rao; dòng thời gian →
lịch sử sự kiện (ai, khi nào, từ gì sang gì); bỏ đội, việc kế, tài chính. Ảnh ba ngăn để hàng 18.

**Đã chuyển thể (hàng 14, 31/10) — Bảng hàng, máy tính.** `data-grid-editing-6` cài nguyên bản, chuyển thể ở
`apps/web/src/app/(app)/inventory/` (khuôn `KhungBangHang`, nhóm màn `design/patterns/bang-hang.md`). Đổi: dữ liệu từ kho
trên máy (hàng 13) ghép thuộc tính căn từ danh mục; mười chín cột theo RESO, ba cột ẩn mặc định; hàng lọc theo cột giữ;
sửa trên ô ba cột Giá, Phí, Trạng thái (hàng 15, 01/11: trình sửa nổi ghép từ Input, ToggleGroup, Popover, Select, đọc
lại «Hiểu là…», hỏi lại khi giá đổi quá 20% hay đổi phí, hoàn tác trên thông báo Sonner và Ctrl/Cmd+Z); dán, kéo điền,
đổi hàng loạt là hàng 16; nhóm Toà → Loại căn theo cách của
`data-grid-grouping-2` bằng dòng con của lưới, đổi được sang Toà hay Không nhóm; nút «Góc nhìn ▾» đầu thanh công cụ lưu bộ
lọc, cột hiện, sắp xếp, cách nhóm thành góc nhìn **trên máy theo người và sàn** — góc nhìn của đội để một hàng sau. Dưới
`md` là khối báo bảng thẻ của mục 32.

## 3. Chỗ hở — không có khối, ghép từ thành phần

Mỗi chỗ dựng bằng ghép hay tự viết (bậc 6–7 của thang) có một dòng ở đây, đủ năm ô (ADR-0019 quyết định 3): **Đã tra trên
ReUI** — `` `<truy vấn>` → <ứng viên gần nhất> `` (hay «không có»), truy vấn chạy bằng MCP `reui`; **Vì sao không đứng**;
**Hạn xem lại** — mở đầu bằng ngày `YYYY-MM-DD` hay bằng «khi » (một điều kiện). Rơi bậc xuống ghép hay tự viết trong một
vòng là một dòng `decisions.jsonl` của hồ sơ vòng ấy. Kiểm chuẩn (`npm run lint`) đỏ khi một ô trống hay chỉ «—», và in
cảnh báo có tên khi hạn là ngày đã tới — mỗi cảnh báo là một chỗ cần mở thành hàng riêng.

| Chỗ | Ghép | Đã tra trên ReUI | Vì sao không đứng | Hạn xem lại |
| --- | --- | --- | --- | --- |
| Thanh tab dưới điện thoại | Như mục 1 | `mobile bottom tab bar navigation` → app-shell-11 | Khối vỏ của ReUI là cột bên cho máy tính; không khối nào có thanh tab đáy cho điện thoại | khi ReUI có khối thanh tab đáy cho điện thoại |
| Chế độ cuộc gọi | Frame ba cột (lối Vẽ mới, Cổng Phạm vi hàng 28): thẻ lead · danh sách hỏi — mỗi nhóm một hàng `ToggleGroup` có `Kbd`, nhóm giá là ô chữ + `ToggleGroup` điều kiện phí · tính giá bao phí ↔ về tay bằng hai ô nối hai chiều, so giá toà bằng `Progress` + `Table`. Kết quả gọi một chạm thêm ở hàng 29 | `call script checklist with call outcome buttons and price calculator` → không có | Kết quả lệch đề (thẻ so sánh sản phẩm, báo cáo tác tử); thành phần `questionnaire` (ví dụ c-questionnaire-3) hỏi một câu mỗi màn, gửi cả biểu mẫu một lần và kéo theo `Card` (cấm trong Frame) — màn cuộc gọi ghi từng lựa chọn ngay, năm nhóm trên một màn | khi dựng kết quả gọi (hàng 29) hay khi ReUI có khối kịch bản gọi |
| Góc nhìn đã lưu | Cột thứ hai của vỏ + lưu bộ lọc (`filters`), cột, cách nhóm của lưới thành một đối tượng Góc nhìn | `saved views for data grid filters` → solution-dev-ops-2 | Góc nhìn đã lưu nằm trong khối nhật ký kiểm toán nguyên trang, không tách được khỏi lưới khác loại | khi làm góc nhìn của đội cho Bảng hàng |
| Cột hồ sơ cạnh bảng | shadcn `resizable` (không khối nào kéo theo) | `resizable detail panel beside table` → c-resizable-9 | Chỉ có ví dụ thành phần `resizable`; không khối nào đặt hồ sơ cạnh bảng | khi dựng cột hồ sơ căn (mục 17) |
| Dán ảnh từ clipboard | `c-file-upload-8` + `c-sortable-7` cho kéo thả; phần dán tự viết | `paste image from clipboard upload sortable` → c-file-upload-8 | Đã dùng `c-file-upload-8` và `c-sortable-7`; không ví dụ nào nhận ảnh dán từ clipboard | khi ReUI có tải ảnh bằng dán |
| Luật chia lead | `Field` + `Select` + bảng luật trong Frame | `lead assignment rules settings` → solution-ai-ops-5 | Khối luật định tuyến cho AI — dữ liệu, chữ và cách bật tắt khác hẳn luật chia lead | khi dựng màn cài đặt chia lead của Cài đặt sàn |
| Luồng Gửi | Thẻ `product-grid-4` giữ lâu để chọn → thanh chọn nhiều của `wishlist-1` dính đáy («4 căn · Xem trước · Gửi») → `Drawer` toàn màn xem trước chính trang khách → nút mở bảng chia sẻ của máy. Không tích hợp gửi tin | `select products and share preview sheet` → không có; khối Pro quét bằng CLI 02/11 → `wishlist-1` (thanh chọn) | Thanh chọn có trong `wishlist-1`; không khối nào nối chọn nhiều với xem trước trang khách rồi mở chia sẻ — phần xem trước và chia sẻ ghép | khi dựng luồng Gửi (hàng 34) |
| Chọn sàn sau đăng nhập | Frame giữa trang, danh sách `Item` (tên sàn + vai); trong app dùng bộ chọn sàn của vỏ | `workspace picker list after sign in` → không có | Kết quả là đăng nhập nhiều cách và quản nhãn; không khối nào chọn không gian làm việc sau đăng nhập | khi ReUI có khối chọn không gian làm việc |
| Hàng đợi có hạn | Badge hạn (`destructive-light` khi quá hạn); sắp theo hạn ở tầng dữ liệu | `task queue with due date overdue badge` → data-grid-grouping-1 | Đây chính là khối đích của Hôm nay, đầu chủ; Badge hạn là chi tiết trong khối, không là ô riêng | khi chuyển thể `data-grid-grouping-1` cho Hôm nay (hàng 22) |
| Đăng nhập, chọn sàn, chưa gắn sàn (tạm) | Bậc 6 — ghép `Frame` + `Field` + `Input` + `Button` ở hàng 6; chuyển thể khối `auth-15` là việc riêng (ADR-0005) | `sign in with email one-time code` → auth-17; khối Pro quét bằng CLI 02/11 → auth-15, auth-19 | Khoá Pro đã có (02/11); chủ kho chọn `auth-15` bỏ nút OAuth — chuyển thể là hàng lộ trình mới, bản ghép đứng tới khi hàng ấy gộp | khi hàng chuyển thể `auth-15` gộp |
| Ô nhận lead (hàng 24) | Bậc 6 — ghép `Frame` (khuôn `KhungLead`) + `Field` + `Input` + `Select` + `ToggleGroup` + `Button`, kết quả kiểm trùng qua `TrangThai`, hỏi lại «Bỏ lead này» bằng `AlertDialog` — **bản ghép là khối đích** (02/11). Điện thoại (hàng 51) một cột. Cột phải `list-11` chuyển thể ở hàng 27 (`apps/web/src/app/(app)/leads/mine/lead-da-nhap.tsx`, khuôn `KhungLeadCuaToi`; Hôm nay của telesales dùng cùng vùng) | `new lead intake form with duplicate check` → form-2; khối Pro quét bằng CLI 02/11 → form-2, dialog-16 | Xem bằng khoá Pro 02/11: `form-2` là khối cấu hình trang thanh toán, không thêm gì cho bản ghép; `dialog-16` xếp người theo % khớp — trái luật trùng tất định (Tham chiếu §12 mục 20) và telesales không được thấy hàng | khi ReUI có khối nhập lead kèm kiểm trùng tất định |
| Trống · lỗi · báo (`TrangThai`) | Bậc 6 — ghép `Empty` + `Alert` đã cài thành khuôn `apps/web/src/components/trang-thai.tsx` (hàng 58); khối đích `empty-state-*` là khối Pro, chuyển thể vào chính tệp ấy khi có khoá ReUI | `empty state error state` → empty-state-7 | Khối đích `empty-state-*` là khối Pro; ghép tạm chờ khoá | 2026-10-30 — khi có khoá ReUI Pro |
| Mục Ảnh của hồ sơ căn (hàng 18) | Bậc 6 — ghép `Tabs` + `Sortable` dạng lưới theo ví dụ `c-sortable-7` + `DropdownMenu` + `AlertDialog` + `Dialog` + `TrangThai` trong FramePanel của hồ sơ (`units/photos/muc-anh.tsx`) | `image upload dropzone gallery reorder` → c-file-upload-7 | Khối upload ảnh dựng trên Card — trái luật một họ khung (Card trong Frame); vùng thả và dán ghép từ thành phần đã cài | khi ReUI có khối upload ảnh dựng trên Frame |

## 4. Tránh

- Vỏ thanh tối, glassmorphism: `app-shell-6`, `-9`, `-15`, `-31`.
- Đăng nhập trang trí: `auth-4` nguyên bản (nền nhiễu), `auth-7`, `auth-13`, `auth-14`, `auth-16`.
- Lưới «advanced» tô màu ô, thanh trong ô: `data-grid-advanced-8`, `-13`, `-15`, `-16` — bảng hàng so với Sheet nên trơn.
- Thương mại nặng: `product-grid-3`, `-5`, `-6`; `product-detail-1` nguyên bản (nền màu), `-2`, `-6`.
- Lệch họ khung trên màn vận hành: khối `event-calendar-*`, `solution-crm-1`, `-2`, `-9` (họ card) — lấy thành phần.
- Lệch bộ icon / chuyển động: `onboarding-1`, `-4` (hugeicons + motion), `stats-8` (ô biểu tượng màu).

## 5. Thành phần nền cài ở hàng 4

- ReUI: `frame`, `data-grid`, `filters`, `badge`, `alert`, `timeline`, `stepper`, `sortable`, `number-field`,
  `event-calendar`, `cascader`; hook `use-file-upload`, `use-copy-to-clipboard`.
- shadcn: `sidebar`, `sheet`, `drawer`, `dialog`, `alert-dialog`, `resizable`, `command`, `dropdown-menu`,
  `context-menu`, `popover`, `select`, `combobox`, `input`, `input-group`, `field`, `textarea`, `switch`, `checkbox`,
  `radio-group`, `toggle-group`, `tabs`, `item`, `separator`, `scroll-area`, `tooltip`, `skeleton`, `empty`, `avatar`,
  `progress`, `kbd`, `calendar`, `breadcrumb`, `sonner`.
- npm: `@tanstack/react-table`, `@tanstack/react-virtual`, `date-fns`, `next-themes`.
- Đã cài 30/10 (hàng 4, hồ sơ `tang-5-giao-dien`): mọi mục shadcn ở trên và ReUI `frame`, `badge`, `alert`, `timeline`,
  `stepper`, `sortable`, `number-field` — danh mục sống ở `.agents/skills/quy-hang-ui/catalog.md`. `data-grid` cài ở hàng 14 (một dòng bản cài sửa để
  qua cờ kiểu chặt — Cổng Phạm vi hàng 14). Chưa cài: `filters`, `cascader`, `event-calendar`, `use-file-upload` (mã ReUI nguyên bản đỏ `noUncheckedIndexedAccess` của kho —
  hàng đầu tiên cần chúng quyết nới cờ cho `apps/web` hay chuyển thể bản cài); `use-copy-to-clipboard` không có trên kho
  ReUI; `@tanstack/*`, `date-fns` cài cùng khối cần chúng.
