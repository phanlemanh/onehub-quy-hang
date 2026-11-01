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
| `@reui/solution-crm-4` | Record detail | ho-so-can | `apps/web/src/app/(app)/units/ho-so/` (`cot-ho-so.tsx`, `khung.tsx`, `nut-bao-sai.tsx`, `bang-co-ho-so.tsx`) | Hồ sơ căn, cột phải cạnh Bảng hàng và toàn màn (hàng 17, ADR-0019 lối ReUI) | `_acceptance/cot-ho-so-can/ba-loi/reui-1440.png` | reui skill 68f0e6fa91 | 2026-11-01 · Manh Phan · cot-ho-so-can | Dựng bằng thành phần đã cài, không cài khối; ngăn phủ → cột `resizable`; giá + mức đủ đầu cột; trường chính → thuộc tính căn tự điền; giai đoạn → lần rao đang xem và các lần rao; dòng thời gian → lịch sử sự kiện; bỏ đội, việc kế, tài chính |
