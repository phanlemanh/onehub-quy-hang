# Danh mục giao diện của kho

Hai bảng dưới là điều đang có trong kho, không phải điều nên có. Đích của từng màn ở `docs/design/vo-va-ia.md`.

## Thành phần đã cài

Mỗi tệp dưới `apps/web/src/components/ui/` và `apps/web/src/components/reui/` một dòng; cột «Thành phần» là tên tệp
không đuôi. `npm run lint` (bước kiểm chuẩn `packages/ui-lint/kiem-chuan.mjs`) đỏ khi một tệp có trên đĩa mà thiếu
dòng.

| Thành phần | Thư mục | Nguồn cài | Dùng cho |
| --- | --- | --- | --- |
| alert-dialog | ui | `npx shadcn@latest add alert-dialog` | xác nhận việc khó đảo |
| avatar | ui | `npx shadcn@latest add avatar` | ảnh người |
| badge | ui | `npx shadcn@latest add badge` | nhãn trung tính của shadcn; trạng thái có màu dùng `reui/badge` |
| breadcrumb | ui | `npx shadcn@latest add breadcrumb` | đường dẫn trên thanh trên |
| button-group | ui | kèm khi cài thành phần khác | nhóm nút (đi cùng input-group) |
| button | ui | `npx shadcn@latest add button` | mọi nút; dẫn đường bằng `render={<Link/>}` + `nativeButton={false}` |
| calendar | ui | `npx shadcn@latest add calendar` | chọn ngày |
| card | ui | kèm `@reui/app-shell-8` | khung của trang khách; màn vận hành dùng Frame |
| checkbox | ui | `npx shadcn@latest add checkbox` | tích chọn |
| combobox | ui | `npx shadcn@latest add combobox` | chọn có gõ tìm |
| collapsible | ui | kèm khi cài `@reui/solution-crm-5` | mở/gập chi tiết từng tin trong dòng hoạt động |
| command | ui | `npx shadcn@latest add command` | ô «Gõ mã căn» (⌘K) |
| context-menu | ui | `npx shadcn@latest add context-menu` | menu chuột phải trên bảng |
| dialog | ui | `npx shadcn@latest add dialog` | hộp thoại |
| drawer | ui | `npx shadcn@latest add drawer` | ngăn từ đáy trên điện thoại |
| dropdown-menu | ui | `npx shadcn@latest add dropdown-menu` | menu thả |
| empty | ui | `npx shadcn@latest add empty` | trạng thái trống |
| field | ui | `npx shadcn@latest add field` | nhãn + ô + lỗi của form |
| input-group | ui | `npx shadcn@latest add input-group` | ô nhập kèm nút/biểu tượng |
| input | ui | `npx shadcn@latest add input` | ô nhập một dòng |
| item | ui | `npx shadcn@latest add item` | dòng danh sách hai tầng trên điện thoại |
| kbd | ui | `npx shadcn@latest add kbd` | phím tắt |
| label | ui | kèm khi cài thành phần khác | nhãn ô (đi cùng field) |
| popover | ui | `npx shadcn@latest add popover` | bảng nổi nhỏ |
| progress | ui | `npx shadcn@latest add progress` | thanh tiến độ |
| radio-group | ui | `npx shadcn@latest add radio-group` | chọn một |
| resizable | ui | `npx shadcn@latest add resizable` | chia đôi bảng ↔ hồ sơ căn |
| scroll-area | ui | `npx shadcn@latest add scroll-area` | vùng cuộn |
| select | ui | `npx shadcn@latest add select` | chọn một trong danh sách |
| separator | ui | `npx shadcn@latest add separator` | đường chia trong vùng |
| sheet | ui | `npx shadcn@latest add sheet` | ngăn phủ cạnh trên máy tính |
| sidebar | ui | `npx shadcn@latest add sidebar` | cột nhà và cột thứ hai của vỏ máy tính (hàng 53) |
| skeleton | ui | `npx shadcn@latest add skeleton` | trạng thái đang tải, đúng bố cục thật |
| sonner | ui | `npx shadcn@latest add sonner` | toast báo |
| spinner | ui | kèm khi cài thành phần khác | vòng chờ trong nút |
| switch | ui | `npx shadcn@latest add switch` | bật/tắt cài đặt |
| table | ui | kèm `@reui/list-11` | bảng nhỏ trong Frame của khối `list-11` (lối «ReUI» của trang ba lối hàng 27); bảng dữ liệu lớn vẫn dùng `reui/data-grid` |
| tabs | ui | `npx shadcn@latest add tabs` | thẻ trong một vùng |
| textarea | ui | `npx shadcn@latest add textarea` | ô nhập nhiều dòng |
| toggle-group | ui | `npx shadcn@latest add toggle-group` | nhóm nút bật |
| toggle | ui | kèm khi cài thành phần khác | nút bật (đi cùng toggle-group) |
| tooltip | ui | `npx shadcn@latest add tooltip` | chú thích nút biểu tượng; `TooltipProvider` đã bọc ở `layout.tsx` |
| alert | reui | `npx shadcn@latest add @reui/alert` | báo trạng thái có màu (ReUI) |
| badge | reui | `npx shadcn@latest add @reui/badge` | nhãn trạng thái có màu (biến thể `-light`) |
| frame | reui | `npx shadcn@latest add @reui/frame` | họ khung của màn vận hành |
| icon-stack | reui | kèm `@reui/timeline` | chồng biểu tượng (đi cùng timeline) |
| number-field | reui | `npx shadcn@latest add @reui/number-field` | ô số (giá, diện tích) |
| rating | reui | kèm `@reui/app-shell-8` | chấm sao (chưa dùng; khối kéo theo) |
| sortable | reui | `npx shadcn@latest add @reui/sortable` | kéo sắp xếp (trạng thái của sàn) |
| stepper | reui | `npx shadcn@latest add @reui/stepper` | các bước của luồng |
| timeline | reui | `npx shadcn@latest add @reui/timeline` | lịch sử giá, trạng thái |
| data-grid | reui | kèm `@reui/data-grid-editing-6` (thư mục `reui/data-grid/`, mười hai tệp) | lưới của Bảng hàng: cuộn ảo, hàng lọc, chọn ô và chép; một dòng của `data-grid-cell-selection.tsx` sửa để qua cờ kiểu chặt (Hỏi-1 của hàng 14) |

Chưa cài — mã ReUI nguyên bản đỏ kiểu chặt của kho (`noUncheckedIndexedAccess` ở `tsconfig.base.json`):
`filters`, `cascader`, `event-calendar`, hook `use-file-upload`. Hàng đầu tiên cần chúng quyết: nới cờ cho `apps/web` hay
chuyển thể bản cài cho qua kiểu chặt. `use-copy-to-clipboard` không có trên kho ReUI.

## Khối đã chuyển thể

Khối ReUI đã cài và chuyển thể cho một màn của Quỹ hàng — chỗ tra «trong kho» (bậc 2 của thang dùng lại, ADR-0019 quyết
định 4). Thư mục cài `components/blocks/` không giữ lại: tệp chuyển thể nằm ở chỗ dùng và mang chú thích «chuyển thể …
<khối>». Mỗi dòng đủ chín ô: **Archetype** theo `docs/design/vo-va-ia.md`; **Nhóm đang dùng** là tên nhóm của
`design/patterns/` (hay `vỏ`); **Ảnh chuẩn** là một ảnh PNG có trong kho; **Phiên bản ReUI** là phiên bản skill ReUI lúc
chuyển thể; **Duyệt** là `ngày · người ký Cổng Phạm vi · hồ sơ`. Kiểm chuẩn đỏ khi thiếu ô, trỏ sai tệp, hay khi mã
chuyển thể một khối mà bảng chưa có dòng.

| Khối gốc | Archetype | Nhóm đang dùng | Tệp đang dùng | Màn | Ảnh chuẩn | Phiên bản ReUI | Duyệt | Đã đổi gì khi chuyển thể |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `@reui/app-shell-8` | Inventory Admin | vỏ | `apps/web/src/components/shell/` (`app-shell.tsx`, `home-rail.tsx`, `second-column.tsx`, `account-menu.tsx`, `company-switcher.tsx`, `notifications.tsx`, `unit-jump.tsx`) | Vỏ máy tính mọi màn sau đăng nhập (hàng 53, ADR-0002) | `_acceptance/vo-ung-dung/evidence/E3-quan-tri.png` | reui skill 68f0e6fa91 | 2026-10-31 · Manh Phan · vo-ung-dung | Org → bộ chọn Sàn (chỉ hiện khi hơn một sàn), bỏ App/Env; ô tìm ⌘K → «Gõ mã căn» (cmdk, chỉ vai có Bảng hàng); Create → nút + Lead · Nhập Excel · Phát hàng theo vai; cột biểu tượng và cột thứ hai đọc `navigationFor` của `packages/core`, Cài đặt sàn ở đáy; menu tài khoản chuyển lên thanh trên (tên sàn, Tôi, sáng/tối, đăng xuất); ngăn thông báo trống; tay nắm và nút tìm dùng `Button` thay thẻ `<button>` trần; nhớ cột thứ hai bằng cookie `qh_cot2` theo người, sàn, nhà |
| `@reui/data-grid-editing-6` | Table-backed management | bang-hang | `apps/web/src/app/(app)/inventory/` (`bang-hang.tsx`, `hang-loc.tsx`, `thanh-cong-cu.tsx`, `bieu-thuc-so.ts`, `loc.ts`) | Bảng hàng trên máy tính (hàng 14, ADR-0004) | `_acceptance/bang-hang-kieu-sheet/evidence/E3-bang.png` | reui skill 68f0e6fa91 | 2026-11-01 · Manh Phan · bang-hang-kieu-sheet | Dữ liệu từ kho trên máy (hàng 13) ghép danh mục; mười chín cột theo RESO và nhãn `CONTEXT.md`, ba cột ẩn mặc định; hàng lọc theo cột giữ (chữ Việt, luật số đọc dấu phẩy, Giá gõ theo tỷ); chỉ đọc — bỏ sửa ô, dán, kéo điền, hoàn tác, đổi trạng thái hàng loạt, xuất file, tìm chung; thêm nhóm Toà → Loại căn theo cách của `data-grid-grouping-2` (dòng con TanStack), menu «Góc nhìn ▾», chọn cách nhóm, menu cột; bỏ thanh trạng thái vùng chọn và chân tổng theo cột, giữ dòng «n / N căn» |
| `@reui/solution-crm-4` | Record detail | ho-so-can, trang-mau | `apps/web/src/app/(app)/units/ho-so/` (`cot-ho-so.tsx`, `khung.tsx`, `nut-bao-sai.tsx`, `bang-co-ho-so.tsx`), `apps/web/src/components/khoi/solution-crm-4/ho-so.tsx` | Hồ sơ căn, cột phải cạnh Bảng hàng và toàn màn (hàng 17, ADR-0019 lối ReUI) | `_acceptance/cot-ho-so-can/ba-loi/reui-1440.png` | reui skill 68f0e6fa91 | 2026-11-01 · Manh Phan · cot-ho-so-can | Dựng bằng thành phần đã cài, không cài khối; ngăn phủ → cột `resizable`; giá + mức đủ đầu cột; trường chính → thuộc tính căn tự điền; giai đoạn → lần rao đang xem và các lần rao; dòng thời gian → lịch sử sự kiện; bỏ đội, việc kế, tài chính |
| `@reui/data-grid-grouping-1` | Table-backed management | hom-nay-dau-chu | `apps/web/src/app/(app)/today/` (`hom-nay-dau-chu.tsx`, `khung.tsx`, `ly-do.ts`) | Hôm nay, đầu chủ (hàng 22, ADR-0019 lối ReUI) | `_acceptance/hom-nay-dau-chu/ba-loi/reui-1440.png` | reui skill 68f0e6fa91 | 2026-11-01 · Manh Phan · hom-nay-dau-chu | Dựng bằng `data-grid` đã cài, không cài khối: nhóm theo bộ nhóm đang áp của sàn thay giai đoạn lộ trình, bỏ đầu cột và vòng tiến độ, cột Việc · Lý do · Giá · Hạn · nút làm ngay, căn đọc từ kho trên máy, khung hẹp dồn lý do và nút xuống dưới tên |
| `@reui/settings-3` | Frame stack | trang-mau | `apps/web/src/components/khoi/settings-3/` (`muc-cai-dat.tsx`, `setting-field.tsx`) | Bố cục Đọc của hệ bố cục; Cài đặt sàn khi chuyển (hàng 91) | `design/anh-chuan/doc-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Giữ `SettingField` và khung gốc (Frame, đầu khung, FramePanel không lề, FieldGroup, chân căn phải); gỡ `max-w-3xl` ở gốc; bỏ ô chọn màu, tuỳ chọn trình soạn và dữ liệu demo; tiêu đề, mô tả, chân thành prop |
| `@reui/stats-7` | Dashboard grid | trang-mau | `apps/web/src/components/khoi/stats-7/` (`stats.tsx`, `data.tsx`) | Bố cục Bảng điều khiển (hàng 91) | `design/anh-chuan/bang-dieu-khien-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Ô số thành prop `cards`; bỏ dữ liệu demo; màu chữ số thô → token `success`/`info` |
| `@reui/solution-users-8` | Frame stack | cai-dat-san | `apps/web/src/components/khoi/solution-users-8/` (`team-access.tsx`, `people-tab.tsx`, `zones-tab.tsx`, `member-dialog.tsx`, `value-faces.tsx`, `data.ts`, `columns.ts`, `icons.tsx`), `apps/web/src/app/(app)/settings/users/quan-nguoi.tsx` | Cài đặt sàn › Người dùng (hàng 7, chuyển ở hàng 91) | `design/anh-chuan/doc-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Giữ khung TeamAccess (đầu khối đếm + nút mời, Tabs line có số đếm, AlertDialog xác nhận, TooltipProvider), Section Frame + dòng Item có vạch ngăn, ô tìm, nút biểu tượng có gợi ý, hộp mời; gỡ `max-w-6xl` và `<main min-h-svh>`; tab People → Thành viên (nhiều vai thành nhãn, vùng ở cột trạng thái, chọn vai → hộp sửa vai + vùng bằng ô tích); tab Alerts → Vùng (danh sách + thêm vùng); hộp mời một email, ô tích vai và vùng, không loại Member/Guest; bỏ khách, lời mời chờ, ghế, xuất CSV, ma trận cảnh báo, dữ liệu demo, Skeleton, sonner; trống, tìm không ra, lỗi qua `TrangThai` |
| `@reui/solution-crm-5` | Frame stack | trang-mau | `apps/web/src/components/khoi/solution-crm-5/` (`activity-timeline.tsx`, `data.tsx`) | Bố cục Dòng tin và thân Hồ sơ (hàng 91) | `design/anh-chuan/dong-tin-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Chốt kiểu cho `noUncheckedIndexedAccess` (người phụ trách vắng thì không dựng thẻ); gỡ `max-w-2xl` ở gốc; cỡ chữ 10–11px → `text-xs`; màu thô → token; dữ liệu demo giữ tới khi màn thật chuyển |
| `@reui/sheet-9` | Record detail | trang-mau | `apps/web/src/components/bo-cuc/ngan-noi.tsx` | Ngăn nổi của hệ bố cục; chi tiết trượt phải ở Danh sách – chi tiết (hàng 91) | `design/anh-chuan/danh-sach-chi-tiet-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Giữ vỏ inset (cách mép 1rem, bo góc, `w-[min(32rem,calc(100vw-2rem))]`), đầu ngăn `min-h-12` có viền, thân `ScrollArea`, chân dính đáy; bỏ các dòng sửa tại chỗ của phiếu — thân là hồ sơ dùng chung; thêm kiểu `phuBang` không khoá, không phủ mờ (ghép từ Popup của Base UI) để bảng vẫn bấm được; điện thoại mở `Drawer` từ đáy |
| `@reui/empty-state-1` | Frame stack | trang-thai | `apps/web/src/components/trang-thai.tsx` | Trống · lỗi · báo mọi màn (hàng 91) | `design/anh-chuan/tran-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Chuyển thể vào `TrangThai`: Empty không viền, đầu, mô tả, hàng hành động (`hanhDong`); bỏ hình minh hoạ, dùng biểu tượng lucide nhỏ (vo-va-ia §2) |
| `@reui/empty-state-2` | Frame stack | trang-thai | `apps/web/src/components/trang-thai.tsx` | Trống vì lọc không ra (hàng 91) | `design/anh-chuan/tran-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Như `empty-state-1`; hành động «Bỏ lọc» thay hàng gợi ý tìm kiếm |
| `@reui/c-button-group-51` | Inventory Admin | vỏ | `apps/web/src/components/shell/menu-tao.tsx` | Menu Tạo trên thanh trên (hàng 91) | `design/anh-chuan/tran-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | «New ▾» → việc tạo theo vai từ `navigationFor`; nút chính là việc tạo đầu của vai; điện thoại thêm nút «+» |
| `@reui/product-grid-4` | Table-backed management | bang-hang | `apps/web/src/app/(app)/inventory/cards/` (`the-can.tsx`, `bang-the.tsx`) | Bảng hàng thẻ trên điện thoại, khe `dienThoai` của Bảng hàng (hàng 32) | `_acceptance/bang-hang-dang-the/evidence/chuan/the-375.png` | reui skill 68f0e6fa91 | 2026-11-03 · Manh Phan · bang-hang-dang-the | Giữ ô ảnh vuông `Item` muted trái, dòng tiêu đề + giá chung chân chữ, hàng ba thông số `dl` trên vạch mảnh; tiêu đề → mã căn, giá → «4,65 tỷ» kèm điều kiện phí; bỏ câu chuyện; ba thông số → Diện tích · Phòng ngủ · Hướng (nhãn chữ thường cho tiếng Việt); huy hiệu → «Đang giao dịch»; tim → ô chọn khi chọn nhiều (giữ lâu 500 ms hay nút «Chọn»); dải đầu chương → dòng nhóm toà một lần mỗi toà; ảnh `w-28` cho khổ 375; lưới hai cột → danh sách cuộn ảo một cột |
| `@reui/filter-sidebar-5` | Table-backed management | bang-hang | `apps/web/src/app/(app)/inventory/cards/ngan-loc.tsx` | Ngăn lọc theo nhu cầu khách của bảng thẻ (hàng 32) | `_acceptance/bang-hang-dang-the/evidence/chuan/the-375.png` | reui skill 68f0e6fa91 | 2026-11-03 · Manh Phan · bang-hang-dang-the | Sheet → `NganNoi` (ngăn đáy trên điện thoại); năm mục Giá · Phòng ngủ · Toà · Diện tích · Hướng (Hỏi-1); thanh trượt giá → hai ô số theo tỷ; ô tích có số đếm cho Toà, Hướng; nút bật cho Phòng ngủ; thẻ lọc đang chạy dùng `Button` thay `<button>` trần, cũng hiện trên danh sách; chân «Xoá lọc · Xem n căn»; bỏ màu, cỡ, chất liệu, hãng, sao, công tắc |

## Ảnh chuẩn của bố cục

Bảy bố cục của hệ bố cục (ADR-0024, hàng 91) — mỗi bố cục bốn ảnh chụp từ trang mẫu sống ở trạng thái mặc định: ba khổ
sáng và khổ 1440 tối. Màn mới của một nhóm chưa có màn mẫu đối chiếu với ảnh chuẩn của `bo_cuc` nhóm khai
(`doi-chieu.mjs --base`). Chụp lại: `PW=<node_modules/playwright> node _acceptance/he-bo-cuc/thu/chup-anh-chuan.cjs`
trên máy dev 3484; địa chỉ, khổ, giao diện và commit của từng tấm ở `design/anh-chuan/ke.json`.

| Bố cục | Mã | Ảnh chuẩn | Trang mẫu |
| --- | --- | --- | --- |
| Tràn | `tran` | `design/anh-chuan/tran-1440.png` · `-1024` · `-375` · `-1440-toi` | `/mau/he-bo-cuc/xem?bo-cuc=tran&trang-thai=mac-dinh` |
| Danh sách – chi tiết | `danh-sach-chi-tiet` | `design/anh-chuan/danh-sach-chi-tiet-1440.png` · `-1024` · `-375` · `-1440-toi` | `/mau/he-bo-cuc/xem?bo-cuc=danh-sach-chi-tiet&trang-thai=mac-dinh` |
| Đọc | `doc` | `design/anh-chuan/doc-1440.png` · `-1024` · `-375` · `-1440-toi` | `/mau/he-bo-cuc/xem?bo-cuc=doc&trang-thai=mac-dinh` |
| Hồ sơ | `ho-so` | `design/anh-chuan/ho-so-1440.png` · `-1024` · `-375` · `-1440-toi` | `/mau/he-bo-cuc/xem?bo-cuc=ho-so&trang-thai=mac-dinh` |
| Bảng điều khiển | `bang-dieu-khien` | `design/anh-chuan/bang-dieu-khien-1440.png` · `-1024` · `-375` · `-1440-toi` | `/mau/he-bo-cuc/xem?bo-cuc=bang-dieu-khien&trang-thai=mac-dinh` |
| Luồng nhiều bước | `luong-nhieu-buoc` | `design/anh-chuan/luong-nhieu-buoc-1440.png` · `-1024` · `-375` · `-1440-toi` | `/mau/he-bo-cuc/xem?bo-cuc=luong-nhieu-buoc&trang-thai=mac-dinh` |
| Dòng tin | `dong-tin` | `design/anh-chuan/dong-tin-1440.png` · `-1024` · `-375` · `-1440-toi` | `/mau/he-bo-cuc/xem?bo-cuc=dong-tin&trang-thai=mac-dinh` |
