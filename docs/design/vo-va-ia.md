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
| Cột thứ hai theo nhà (`INNER_NAV`) | Bảng hàng: góc nhìn của đội, của tôi, «+ Lưu góc nhìn» · Đã gửi: Link đã gửi, Lịch xem · Cài đặt sàn: các mục cài đặt · Hôm nay: không có cột |
| Thẻ chân cột (`footer`) | Bảng hàng: độ tươi (tỉ lệ căn xác nhận trong N ngày). Nhà khác: bỏ |
| Gập cột thứ hai (tay nắm ở mép cột, đã thử trên bản xem trước 30/10) | **Mặc định gập ở Bảng hàng, Hôm nay và hồ sơ căn** — chỉ còn cột biểu tượng mảnh, bảng ăn gần hết bề ngang. Góc nhìn đã lưu vẫn một chạm: nút «Góc nhìn ▾» đầu thanh công cụ của bảng. Mở ở Đã gửi và Cài đặt sàn (ít cột, cần danh mục). Người mở hay gập thì nhớ theo người, theo nhà |

Vì sao khối này: nó là vỏ duy nhất trong 36 vỏ có đủ ba thứ §9 đòi — bộ chọn sàn/dự án trên thanh trên, ô gõ ở giữa,
và cột thứ hai đổi theo nhà (chỗ của góc nhìn đã lưu thay các tab của Sheet). Nền sáng, viền mảnh, không trang trí; có
bản tối. Đã so: `app-shell-36` (Invest Ops dùng — một cột, không có ô gõ giữa), `app-shell-13` (thanh trên rộng nhưng
không có cột theo nhà), `app-shell-14` (có thanh cách xem nhưng thừa so với bảng hàng), `app-shell-15`/`-9`/`-6` (thanh
tối, nặng).

### Điện thoại — ghép, không có khối

ReUI không có vỏ thanh tab dưới (đã tìm cả block lẫn ví dụ). Dưới `md`, vỏ `app-shell-8` ẩn cột, thay bằng:

- Thanh trên mảnh: tên nhà · nút gõ mã căn (mở `CommandDialog` toàn màn) · chuông.
- Thanh tab dưới cố định: bốn `Button` `variant="ghost"` dẫn đường (`nativeButton={false} render={<Link/>}`), biểu tượng
  lucide trên chữ, `aria-current` cho tab đang mở — Hôm nay · Bảng hàng · Gửi · Tôi; telesales: Hôm nay · Lead · Tôi.
- Ngăn và hộp thoại trên điện thoại là `Drawer` từ đáy.

Đây là bậc 6 của thang (ghép từ thành phần) — ghi ở «Chỗ hở».

### Không có vỏ

Trang khách `/s/<mã>` (đầu trang tên sàn + người gửi, mảnh) · đăng nhập và chọn sàn.

## 2. Bản đồ màn → khối đích

Mã phác thảo theo Tham chiếu §10; hàng là mã hàng của lộ trình. «Phủ»: trọn = khối là cả màn; vùng = khối là vùng
chính, phần còn lại ghép.

| Màn | Phác thảo · hàng | Archetype | Khối đích | Phủ | Đổi khi chuyển thể | Phương án phụ |
| --- | --- | --- | --- | --- | --- | --- |
| Bảng hàng, máy tính | 2, 2b · 14–16 | Table-backed management | [`data-grid-editing-6`](https://reui.io/preview/radix/data-grid-editing-6) | trọn | Cột theo RESO và cách gọi của sàn; hàng nhóm toà → loại căn lấy từ `data-grid-grouping-2`; ô lọc theo cột giữ; dòng tổng giữ; đổi hàng loạt cho hàng đã tích | `data-grid-editing-5` (menu chuột phải, thêm cột theo kiểu trường) |
| Hồ sơ căn, cột phải | 2, M5 · 17–19, 23 | Record detail | [`solution-crm-4`](https://reui.io/preview/radix/solution-crm-4) | vùng | Ngăn phủ → cột phải chia đôi bằng `resizable`, bảng vẫn bấm được; giai đoạn → trạng thái có lịch sử; thanh xác suất → mức đủ; thêm giá + lịch sử trả giá bằng `timeline`; ảnh ba ngăn bằng `Tabs` + `c-file-upload-8` | `solution-inventory-7` (có thư viện ảnh) |
| Chế độ cuộc gọi | KD1, KD2 · 28–30 | Record detail | ghép | — | Xem «Chỗ hở» | khung «bước tiếp theo» của `solution-crm-4` |
| Hôm nay, đầu chủ | 1 · 22 | Table-backed management | [`data-grid-grouping-1`](https://reui.io/preview/radix/data-grid-grouping-1) | trọn | Nhóm: Quá hạn · Hôm nay · Sắp tới; mỗi dòng một việc (gọi lại, ép giá, lead mới) kèm hạn và nút làm ngay; bỏ vòng tiến độ | `solution-crm-5` |
| Hôm nay, trưởng nhóm | TN1 · 42 | Dashboard grid | [`stats-7`](https://reui.io/preview/radix/stats-7) + [`data-grid-grouping-2`](https://reui.io/preview/radix/data-grid-grouping-2) | vùng ×2 | Ba số: lead quá hạn, hàng cũ, ngoại lệ; bảng nhóm theo người; tăng giảm bằng Badge `-light` | `stats-18` |
| Ô nhận lead + bốn nấc | L1–L3, L5 · 24, 27 | Frame stack | [`form-2`](https://reui.io/preview/radix/form-2) + [`list-11`](https://reui.io/preview/radix/list-11) | vùng ×2 | Năm mục; kiểm trùng hiện bằng `Alert` dưới ô; cột phải là lead đã nhập với Badge bốn nấc | `form-6` |
| Nhập Excel | N1, N2 · 20–21 | Wizard | [`solution-crm-6`](https://reui.io/preview/radix/solution-crm-6) | trọn | Năm bước giữ: tải · ghép cột · xem trước · trùng · tóm tắt; đọc tệp thật tự viết (khối dùng số mẫu); ghép theo mẫu file của sàn | `wizard-5` |
| Phát hàng | D · 43 | Wizard dialog | ghép quanh [`dialog-13`](https://reui.io/preview/radix/dialog-13) | vùng | Chọn mẫu → xem trước → chép bài / xuất file; lấy lựa chọn từ bảng hàng | — |
| Cài đặt sàn | S1–S6 · 45–50, 7 | Vertical rail settings | rail = cột thứ hai của vỏ; mục: [`settings-3`](https://reui.io/preview/radix/settings-3), người dùng [`solution-users-8`](https://reui.io/preview/radix/solution-users-8), trạng thái `c-sortable-5` | vùng | Mỗi mục một Frame; luật chia lead ghép (xem «Chỗ hở») | `profile-1`, `settings-9` |
| Đăng nhập | — · 6 | Auth card | [`auth-15`](https://reui.io/preview/radix/auth-15) | trọn | Bỏ nút Google/Apple/GitHub nếu không dùng; cách đăng nhập chốt ở hàng 6 | `auth-4` (bỏ nền) |
| Bảng hàng thẻ, điện thoại | M4 · 32 | — | [`product-grid-2`](https://reui.io/preview/radix/product-grid-2) + ngăn lọc [`filter-sidebar-5`](https://reui.io/preview/radix/filter-sidebar-5) | vùng ×2 | Một cột; ảnh 3:2; bỏ ô màu, giá giảm; tim → «Chọn để gửi»; ngăn lọc thành `Drawer` đáy — như Invest đã chuyển thể | `product-grid-1` |
| Hồ sơ căn, điện thoại | M3 · 33, 40–41 | Record detail | [`product-detail-5`](https://reui.io/preview/radix/product-detail-5) | vùng | Khối mua → giá + thông số chính + «Xin dẫn xem» dính đáy; bỏ màu, cỡ, sao; phần chủ nhà không có (luật ẩn ở lõi) | `product-detail-1` |
| Hôm nay, đầu khách | M6 · 37 | — | [`solution-crm-5`](https://reui.io/preview/radix/solution-crm-5) | trọn | Nhóm theo ngày giữ; loại: Căn mới · Đổi giá · Khách mở link · Lịch xem; bỏ lọc theo người | `sheet-7` |
| Hôm nay, đầu chủ trên điện thoại | M1 · 39 | — | `data-grid-grouping-1` dạng danh sách `Item` | vùng | Cùng nhóm với bản máy tính; gọi lại một chạm | — |
| Gửi | G1–G3 · 34 | Flow | ghép | — | Xem «Chỗ hở» | — |
| Đã gửi | G4 · 36 | — | [`list-11`](https://reui.io/preview/radix/list-11) | vùng | Cột: bộ căn / khách · lượt mở · quan tâm; điện thoại thành `Item` hai dòng | `solution-crm-3` |
| Trang khách | T1–T3 · 35 | — (card) | `product-grid-2` + `product-detail-5` | trọn | Bỏ giỏ; nút «Quan tâm»; dữ liệu dựng từ luật ẩn | — |
| Trang nhóm môi giới | T4 · 44 | Table-backed management | [`data-grid-virtualization-1`](https://reui.io/preview/radix/data-grid-virtualization-1) | trọn | Chỉ đọc; hiện mã căn và phí | lưới của Bảng hàng ở chế độ chỉ đọc |
| Lịch xem | — · chờ H1 | — | thành phần `event-calendar` trong Frame; chọn giờ [`schedule-4`](https://reui.io/preview/radix/schedule-4) | thành phần | Khối lịch đều họ card nên lấy thành phần | `event-calendar-2` |
| Tôi (điện thoại) | — · 38 | Frame stack | `settings-3` | vùng | Hồ sơ, sàn, cài lên màn hình chính, thông báo, đăng xuất | — |
| Trống · lỗi · báo | dùng chung | — | [`empty-state-1`](https://reui.io/preview/radix/empty-state-1), [`empty-state-2`](https://reui.io/preview/radix/empty-state-2), ngăn báo `sheet-7`, `sonner` | — | Bỏ hình minh hoạ nặng; biểu tượng lucide nhỏ | `empty-state-12` |

## 3. Chỗ hở — không có khối, ghép từ thành phần

| Chỗ | Ghép |
| --- | --- |
| Thanh tab dưới điện thoại | Như mục 1 |
| Chế độ cuộc gọi | Frame hai cột. Trái: câu hỏi khai thác (`Item` + `Checkbox`/`Collapsible`), kết quả gọi một chạm bằng `ToggleGroup` lớn có `Kbd`. Phải: máy tính giá bao phí ↔ giá về tay bằng hai `number-field` nối hai chiều |
| Góc nhìn đã lưu | Cột thứ hai của vỏ + lưu bộ lọc (`filters`), cột, cách nhóm của lưới thành một đối tượng Góc nhìn |
| Cột hồ sơ cạnh bảng | shadcn `resizable` (không khối nào kéo theo) |
| Dán ảnh từ clipboard | `c-file-upload-8` + `c-sortable-7` cho kéo thả; phần dán tự viết |
| Luật chia lead | `Field` + `Select` + bảng luật trong Frame |
| Luồng Gửi | Thẻ `product-grid-2` có `Checkbox` → thanh đáy dính đếm căn đã chọn → `Drawer` toàn màn xem trước chính trang khách → nút mở bảng chia sẻ của máy. Không tích hợp gửi tin |
| Chọn sàn sau đăng nhập | Frame giữa trang, danh sách `Item` (tên sàn + vai); trong app dùng bộ chọn sàn của vỏ |
| Hàng đợi có hạn | Badge hạn (`destructive-light` khi quá hạn); sắp theo hạn ở tầng dữ liệu |
| Đăng nhập, chọn sàn, chưa gắn sàn (tạm) | Bậc 7 — tự viết tối giản ở hàng 6 vì ReUI chưa cài; chuyển thể `auth-15` và Frame + `Item` sau khi hàng 4 gộp (ADR-0003) |

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
