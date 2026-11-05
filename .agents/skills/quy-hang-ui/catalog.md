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
| `@reui/settings-3` | Frame stack | trang-mau | `apps/web/src/components/khoi/settings-3/` (`muc-cai-dat.tsx`, `setting-field.tsx`) | Bố cục Đọc của hệ bố cục; Cài đặt sàn khi chuyển (hàng 91) | `design/anh-chuan/doc-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Giữ `SettingField` và khung gốc (Frame, đầu khung, FramePanel không lề, FieldGroup, chân căn phải); gỡ `max-w-3xl` ở gốc; bỏ ô chọn màu, tuỳ chọn trình soạn và dữ liệu demo; tiêu đề, mô tả, chân thành prop |
| `@reui/settings-2` | Frame stack | toi | `apps/web/src/components/khoi/settings-2/` (`privacy-settings.tsx`, `setting-row.tsx`), `apps/web/src/app/(app)/me/man-toi.tsx` | Tôi (hàng 38) | `_acceptance/tab-toi/ba-loi/reui-1440.png` | reui skill 68f0e6fa91 | 2026-11-03 · Manh Phan · tab-toi | Giữ khung gốc PrivacySettings (Frame, đầu khung, FramePanel không lề) và dòng SettingRow (ô biểu tượng, tiêu đề, mô tả, hành động phải); hành động thành children; bỏ huy hiệu Pro/Beta, chân Cancel/Save và dữ liệu demo; gỡ `max-w-2xl` ở gốc và bóng `rgba` của ô biểu tượng (luật no-hardcoded-color) |
| `@reui/dialog-5` | Wizard dialog | bang-hang | `apps/web/src/components/khoi/dialog-5/` (`hop-buoc.tsx`, `ray-buoc.tsx`), `apps/web/src/app/(app)/inventory/phat-hang/hop-thoai.tsx` | Xuất bảng hàng (hàng 43) | `_acceptance/phat-hang/anh-chuan/dialog-5-buoc-3-1440.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · phat-hang | Giữ khung TemplateLibraryDialog (DialogContent rộng cao cố định, đầu hộp, Separator, cột trái RadioGroup + Item bọc Label, khung phải ScrollArea ẩn thanh cuộn, DialogFooter có dòng tóm tắt và hàng nút); cột trái thành bốn bước của luồng (bước đã qua bấm để quay lại); bỏ ô tìm, ảnh picsum, ô màu palette và IconPlaceholder (icon lucide), thẻ mẫu là Item thay `<button>` trần; chấm ngăn `bg-gray-300` thành `bg-border` |
| `@reui/stats-7` | Dashboard grid | trang-mau | `apps/web/src/components/khoi/stats-7/` (`stats.tsx`, `data.tsx`) | Bố cục Bảng điều khiển (hàng 91) | `design/anh-chuan/bang-dieu-khien-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Ô số thành prop `cards`; bỏ dữ liệu demo; màu chữ số thô → token `success`/`info` |
| `@reui/dashboard-6` | Dashboard grid | hom-nay-truong-nhom | `apps/web/src/components/khoi/dashboard-6/` (`coverage-dashboard.tsx`, `data.tsx`), `apps/web/src/app/(app)/today/truong-nhom.tsx` | Hôm nay, trưởng nhóm (hàng 42, ADR-0019 lối ReUI) | `_acceptance/hom-nay-truong-nhom/ba-loi/reui-1440.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · hom-nay-truong-nhom | Giữ MetricPanel, CoverageTable, ActionQueue và khung trang; ba ô số Lead quá hạn · Ngoại lệ · Hàng cũ; bảng theo người → theo đầu chủ (cột phủ → tỉ lệ tươi, Relief → cần gọi lại), chân «Chỉ tính căn toàn sàn»; hàng đợi → lead quá hạn và chưa chia được, nút «Giao lại» mở chọn đầu chủ; bỏ vùng biểu đồ (recharts), bộ chọn ngày, Export, toast hoàn tác, trình đơn «…», `min-h-svh` và dữ liệu demo; IconPlaceholder → lucide |
| `@reui/solution-agents-2` | Table-backed management | hom-nay-dau-chu | `apps/web/src/components/khoi/solution-agents-2/` (`o-dong.tsx`), `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`, bảng nút `apps/web/src/app/(app)/today/viec-dong.ts` | Hôm nay, đầu chủ (hàng 92, quyết định 14A; ô hạn theo `data-grid-base-5`) | `_acceptance/lam-lai-hom-nay-dau-chu/evidence/E1-hom-nay-1440.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · lam-lai-hom-nay-dau-chu | Giữ ô tên hai tầng và trình đơn ⋯ của dòng (RunActionsCell), nhóm thu gọn dùng dòng nhóm có sẵn của `data-grid`; thêm một nút viền cố định bề rộng là việc đầu của nhóm; cột Lý do và Hạn gộp thành «Vì sao hôm nay» hai tầng, hạn tô `destructive` khi quá, `warning` khi còn dưới 15 phút (mốc của ô SLA `data-grid-base-5`); bỏ ô tìm, lọc cần chú ý, nút mật độ, avatar, badge môi trường, IconPlaceholder (→ lucide), sonner, dữ liệu demo |
| `@reui/solution-users-8` | Frame stack | cai-dat-san | `apps/web/src/components/khoi/solution-users-8/` (`team-access.tsx`, `people-tab.tsx`, `zones-tab.tsx`, `member-dialog.tsx`, `value-faces.tsx`, `data.ts`, `columns.ts`, `icons.tsx`), `apps/web/src/app/(app)/settings/users/quan-nguoi.tsx` | Cài đặt sàn › Người dùng (hàng 7, chuyển ở hàng 91) | `design/anh-chuan/doc-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Giữ khung TeamAccess (đầu khối đếm + nút mời, Tabs line có số đếm, AlertDialog xác nhận, TooltipProvider), Section Frame + dòng Item có vạch ngăn, ô tìm, nút biểu tượng có gợi ý, hộp mời; gỡ `max-w-6xl` và `<main min-h-svh>`; tab People → Thành viên (nhiều vai thành nhãn, vùng ở cột trạng thái, chọn vai → hộp sửa vai + vùng bằng ô tích); tab Alerts → Vùng (danh sách + thêm vùng); hộp mời một email, ô tích vai và vùng, không loại Member/Guest; bỏ khách, lời mời chờ, ghế, xuất CSV, ma trận cảnh báo, dữ liệu demo, Skeleton, sonner; trống, tìm không ra, lỗi qua `TrangThai` |
| `@reui/solution-crm-5` | Frame stack | trang-mau | `apps/web/src/components/khoi/solution-crm-5/` (`activity-timeline.tsx`, `data.tsx`) | Bố cục Dòng tin và thân Hồ sơ (hàng 91) | `design/anh-chuan/dong-tin-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Chốt kiểu cho `noUncheckedIndexedAccess` (người phụ trách vắng thì không dựng thẻ); gỡ `max-w-2xl` ở gốc; cỡ chữ 10–11px → `text-xs`; màu thô → token; dữ liệu demo giữ tới khi màn thật chuyển |
| `@reui/sheet-9` | Record detail | trang-mau | `apps/web/src/components/bo-cuc/ngan-noi.tsx` | Ngăn nổi của hệ bố cục; chi tiết trượt phải ở Danh sách – chi tiết (hàng 91) | `design/anh-chuan/danh-sach-chi-tiet-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Giữ vỏ inset (cách mép 1rem, bo góc, `w-[min(32rem,calc(100vw-2rem))]`), đầu ngăn `min-h-12` có viền, thân `ScrollArea`, chân dính đáy; bỏ các dòng sửa tại chỗ của phiếu — thân là hồ sơ dùng chung; thêm kiểu `phuBang` không khoá, không phủ mờ (ghép từ Popup của Base UI) để bảng vẫn bấm được; điện thoại mở `Drawer` từ đáy |
| `@reui/empty-state-1` | Frame stack | trang-thai | `apps/web/src/components/trang-thai.tsx` | Trống · lỗi · báo mọi màn (hàng 91) | `design/anh-chuan/tran-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Chuyển thể vào `TrangThai`: Empty không viền, đầu, mô tả, hàng hành động (`hanhDong`); bỏ hình minh hoạ, dùng biểu tượng lucide nhỏ (vo-va-ia §2) |
| `@reui/empty-state-2` | Frame stack | trang-thai | `apps/web/src/components/trang-thai.tsx` | Trống vì lọc không ra (hàng 91) | `design/anh-chuan/tran-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | Như `empty-state-1`; hành động «Bỏ lọc» thay hàng gợi ý tìm kiếm |
| `@reui/c-button-group-51` | Inventory Admin | vỏ | `apps/web/src/components/shell/menu-tao.tsx` | Menu Tạo trên thanh trên (hàng 91) | `design/anh-chuan/tran-1440.png` | reui skill 68f0e6fa91 | 2026-11-02 · Manh Phan · he-bo-cuc | «New ▾» → việc tạo theo vai từ `navigationFor`; nút chính là việc tạo đầu của vai; điện thoại thêm nút «+» |
| `@reui/product-grid-4` | Table-backed management | bang-hang | `apps/web/src/app/(app)/inventory/cards/` (`the-can.tsx`, `bang-the.tsx`) | Bảng hàng thẻ trên điện thoại, khe `dienThoai` của Bảng hàng (hàng 32) | `_acceptance/bang-hang-dang-the/evidence/chuan/the-375.png` | reui skill 68f0e6fa91 | 2026-11-03 · Manh Phan · bang-hang-dang-the | Giữ ô ảnh vuông `Item` muted trái, dòng tiêu đề + giá chung chân chữ, hàng ba thông số `dl` trên vạch mảnh; tiêu đề → mã căn, giá → «4,65 tỷ» kèm điều kiện phí; bỏ câu chuyện; ba thông số → Diện tích · Phòng ngủ · Hướng (nhãn chữ thường cho tiếng Việt); huy hiệu → «Đang giao dịch»; tim → ô chọn khi chọn nhiều (giữ lâu 500 ms hay nút «Chọn»); dải đầu chương → dòng nhóm toà một lần mỗi toà; ảnh `w-28` cho khổ 375; lưới hai cột → danh sách cuộn ảo một cột |
| `@reui/filter-sidebar-5` | Table-backed management | bang-hang | `apps/web/src/app/(app)/inventory/cards/ngan-loc.tsx` | Ngăn lọc theo nhu cầu khách của bảng thẻ (hàng 32) | `_acceptance/bang-hang-dang-the/evidence/chuan/the-375.png` | reui skill 68f0e6fa91 | 2026-11-03 · Manh Phan · bang-hang-dang-the | Sheet → `NganNoi` (ngăn đáy trên điện thoại); năm mục Giá · Phòng ngủ · Toà · Diện tích · Hướng (Hỏi-1); thanh trượt giá → hai ô số theo tỷ; ô tích có số đếm cho Toà, Hướng; nút bật cho Phòng ngủ; thẻ lọc đang chạy dùng `Button` thay `<button>` trần, cũng hiện trên danh sách; chân «Xoá lọc · Xem n căn»; bỏ màu, cỡ, chất liệu, hãng, sao, công tắc |
| `@reui/solution-crm-6` | Wizard | nhap-excel | `apps/web/src/components/khoi/solution-crm-6/` (`khung-buoc.tsx`, `buoc.tsx`), `apps/web/src/app/(app)/imports/khung.tsx` | Nhập Excel (hàng man-nhap-excel, ADR-0019 lối ReUI) | `_acceptance/man-nhap-excel/ba-loi/reui-1440.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · man-nhap-excel | Giữ khung ImportWizard (Frame xếp tầng, đầu khung tên tệp + số dòng, StepperNav đánh số, thân bước, chân câu của bước + Lùi/Tiếp) và bảng ghép cột MapStepFields (cột tệp · mẫu · trường, Select trong ô, Alert trên bảng), FlagBadge, SummarySection; bước, chữ, nút thành prop; bỏ form nộp giả, toast, dữ liệu demo, bước tải giả (`use-file-upload` không qua kiểu chặt), khoá trùng và lựa chọn ghi đè (luật trùng ở máy chủ), vòng nét đứt quay của chỉ báo bước; chấm màu thô của FlagBadge → biến thể Badge |
| `@reui/auth-15` | Auth card | xac-thuc | `apps/web/src/app/(auth)/khung.tsx`, `apps/web/src/app/(auth)/login/form.tsx` | Đăng nhập, Chọn sàn làm việc, Chưa thuộc sàn nào (hàng 93) | `_acceptance/dang-nhap-auth-15/design-pass/dang-nhap-1440.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · dang-nhap-auth-15 | Giữ dấu hiệu trên đầu, cột `max-w-88` giữa trang với tiêu đề `text-3xl`, ô `InputGroup` có biểu tượng đầu ô và lời dặn dưới ô, nút rộng trọn cột, chân trang chữ nhỏ ở đáy; khối vào chính khuôn `Khung` nên ba màn của nhóm cùng dùng; bỏ ba nút Google/Apple/GitHub và dải «Or continue with» (ADR-0005), ba liên kết và dòng bản quyền ở chân trang; dấu hiệu ReUI → ô hộp `BoxesIcon` của vỏ cạnh chữ «Quỹ hàng» (Hỏi-2); câu chân trang trung tính không liên kết (Hỏi-1); magic link → mã 6 số hai bước của hàng 6; chữ `text-[0.9375rem]` của dấu hiệu → `text-sm` (luật no-arbitrary-text-size) |
| `@reui/wishlist-3` | — (card) | trang-khach | `apps/web/src/app/s/[code]/the-can.tsx` | Bộ căn của trang khách `/s/<mã>` (hàng 35) | `_acceptance/trang-khach-rieng/ba-loi/reui-375.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · trang-khach-rieng | Giữ thẻ ảnh vuông `Item` muted + huy hiệu góc trái, khối chữ, giá, chú thích, nút chính chân thẻ; huy hiệu tín hiệu → trạng thái khách thấy («Đã có người đặt cọc», «Tạm ngưng», «Không còn»); dòng hiệu bỏ (tên căn đã có toà); giá → «4,25 tỷ» kèm bao phí; chú thích → «Giá xác nhận X ngày trước»; nút giỏ → «Quan tâm» viền; nút xoá, tab lọc, giỏ bỏ; căn không còn bán: ảnh và giá mờ, huy hiệu giữ rõ, không nút |
| `@reui/wishlist-4` | — (card) | da-gui | `apps/web/src/app/(app)/shares/the-lan-gui.tsx` | Thẻ một Lần gửi ở màn Đã gửi (hàng 36) | `_acceptance/da-gui/ba-loi/reui-375.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · da-gui | Giữ bìa ghép bốn ảnh, khối chữ, dòng số phụ; tiêu đề → người nhận (tên nhu cầu khách hay «Nhóm môi giới»); dòng phụ → số căn · giờ gửi; số liệu → lượt mở · lượt quan tâm, giờ mở gần nhất; huy hiệu «Đã tắt»; nút chia sẻ, xoá của khối bỏ; link một căn thì bìa một ảnh đầy (design-pass); cả thẻ là nút mở chi tiết |
| `@reui/product-detail-5` | — (card) | trang-khach | `apps/web/src/app/s/[code]/chi-tiet.tsx` | Chi tiết một căn của trang khách (hàng 35), `?can=<thứ tự>` | `_acceptance/trang-khach-rieng/ba-loi/reui-chi-tiet-375.png` | reui skill 68f0e6fa91 | 2026-11-04 · Manh Phan · trang-khach-rieng | Giữ ảnh lớn bo góc, khối tên + thông số, vạch, hộp giá + nút chính rộng; carousel → cuộn ngang có điểm dừng (carousel chưa cài); tiêu đề → tên căn theo người nhận; bảng thuộc tính → Pháp lý · Nội thất · Hướng · Hiện trạng; nút mua → «Quan tâm»; đánh giá, sản phẩm liên quan, chọn biến thể bỏ |

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
