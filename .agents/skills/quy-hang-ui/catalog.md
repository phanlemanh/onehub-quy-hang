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

Chưa cài — mã ReUI nguyên bản đỏ kiểu chặt của kho (`noUncheckedIndexedAccess` ở `tsconfig.base.json`): `data-grid`,
`filters`, `cascader`, `event-calendar`, hook `use-file-upload`. Hàng đầu tiên cần chúng quyết: nới cờ cho `apps/web` hay
chuyển thể bản cài cho qua kiểu chặt. `use-copy-to-clipboard` không có trên kho ReUI.

## Khối đã chuyển thể

Khối ReUI đã cài và chuyển thể cho một màn của Quỹ hàng. Thư mục cài `components/blocks/` không giữ lại: tệp chuyển
thể nằm ở chỗ dùng.

| Khối gốc | Tệp đang dùng | Màn | Đã đổi gì khi chuyển thể |
| --- | --- | --- | --- |
| `@reui/app-shell-8` | `apps/web/src/components/shell/` (`app-shell.tsx`, `home-rail.tsx`, `second-column.tsx`, `account-menu.tsx`, `company-switcher.tsx`, `notifications.tsx`, `unit-jump.tsx`) | Vỏ máy tính mọi màn sau đăng nhập (hàng 53, ADR-0002) | Org → bộ chọn Sàn (chỉ hiện khi hơn một sàn), bỏ App/Env; ô tìm ⌘K → «Gõ mã căn» (cmdk, chỉ vai có Bảng hàng); Create → nút + Lead · Nhập Excel · Phát hàng theo vai; cột biểu tượng và cột thứ hai đọc `navigationFor` của `packages/core`, Cài đặt sàn ở đáy; menu tài khoản chuyển lên thanh trên (tên sàn, Tôi, sáng/tối, đăng xuất); ngăn thông báo trống; tay nắm và nút tìm dùng `Button` thay thẻ `<button>` trần; nhớ cột thứ hai bằng cookie `qh_cot2` theo người, sàn, nhà |
