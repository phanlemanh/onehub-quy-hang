---
name: quy-hang-ui
description: "Chuẩn giao diện riêng của onehub-quy-hang, là lớp mỏng nằm trên skill ReUI chính chủ. Dùng cho MỌI việc giao diện trong apps/web (bàn làm việc trên máy tính và điện thoại, trang khách /s/<mã>, đăng nhập): dựng hay sửa màn, vùng, bảng, form, trạng thái tải/trống/lỗi, màu, chữ tiếng Việt, cài khối ReUI, dọn chỗ tự vẽ tay. Nạp SAU skill `reui`. Skill này giữ điều ReUI không biết về Quỹ hàng: thứ tự thẩm quyền, thang dùng lại, bản đồ khối đích, luật lint quy-hang-ui và mức nợ, sàn thiết kế, danh mục thành phần đã cài."
---

# quy-hang-ui

Lớp mỏng của kho, đặt trên ReUI. Ở đây chỉ có điều ReUI không biết về Quỹ hàng. Luật bố cục, màu, chuyển động, khoảng
cách và chữ chung nằm trong skill `reui` (`.agents/skills/reui/`); tệp này trỏ về đó, không chép lại.

## Thứ tự thẩm quyền

1. **Bốn bất biến của `AGENTS.md`** — cách ly giữa công ty; thông tin chủ nhà không rời công ty; người luôn là người
   bấm gửi (chỉ mở bảng chia sẻ của thiết bị); phần nội bộ không ra trang khách. Giao diện KHÔNG phải chỗ ẩn dữ liệu:
   dữ liệu ra ngoài dựng từ luật ẩn ở `packages/core`, màn chỉ hiện thứ lõi đã cho phép. Không có khối, prop hay
   «chế độ xem» nào nới được bốn điều này.
2. **Skill `reui`** và style đã cài: `apps/web/components.json` giữ `"style": "base-nova"`, `baseColor: neutral`,
   `iconLibrary: lucide`. Không đổi style, theme hay bán kính.
3. **`quy-hang-ui`** (skill này): chỉ bổ sung, không ghi đè tầng trên.

Hai tầng vênh nhau thì tầng trên thắng; ghi chỗ lệch vào phần bàn giao.

## Đọc theo thứ tự

1. `reui`: `SKILL.md`, rồi `rules/compose.md` trước khi dựng màn; tới bước kiểm thì `rules/quality.md` và
   `rules/anti-patterns.md`.
2. Thang dùng lại: `.claude/rules/giao-dien.md` — mỗi ô của màn đọc từ trên xuống, dừng ở bậc đầu tiên đứng được
   (cần không → khối đã chọn → khối ReUI khác → ví dụ `c-*` → thành phần → ghép → tự viết).
3. Vỏ, IA và khối đích từng màn: `docs/design/vo-va-ia.md` (ADR-0002). Màn nào đã có khối đích thì cài đúng khối đó;
   đổi khối đích là sửa dòng ở đó trong cùng PR.
4. `catalog.md` cạnh tệp này: thành phần đã cài và khối đã chuyển thể — xem trước khi gọi MCP `reui` để cài thêm.
5. Nhãn chữ trên giao diện lấy từ `CONTEXT.md` (nhãn UI ↔ tên code); chữ tiếng Việt, ngắn, nói việc người làm.

## Cài thêm

- Thành phần shadcn: `cd apps/web && npx shadcn@latest add <tên> --yes`. Thành phần, ví dụ ReUI:
  `npx shadcn@latest add @reui/<tên> --yes` — tên đúng như MCP `reui` trả về.
- Khối Pro cần `REUI_LICENSE_KEY` trong `.env.local` của máy — người đặt, agent không ghi `.env*`.
- Thành phần cài vào `apps/web/src/components/ui` (shadcn) và `apps/web/src/components/reui` (ReUI) là **bản cài nguyên
  bản**: không sửa tay, luật lint giao diện không quét. Cần đổi → chuyển thể ở chỗ dùng (dữ liệu, chữ, prop).
- Cài xong → thêm một dòng vào bảng «Thành phần đã cài» của `catalog.md`. `npm run lint` (bước kiểm chuẩn) đỏ khi
  bảng thiếu thành phần nào đang có trên đĩa.

## Vết chọn khối (ADR-0019 quyết định 3–4)

- **Bậc 2 của thang dùng lại tra bảng «Khối đã chuyển thể» của `catalog.md`** — khối trong kho kèm archetype, nhóm đang
  dùng và ảnh chuẩn — trước khi tìm khối ReUI khác.
- Chuyển thể một khối mới → trong cùng PR thêm một dòng đủ chín ô vào bảng ấy (archetype, nhóm, tệp, màn, ảnh chuẩn PNG có
  trong kho, `reui skill <mã>`, `ngày · người ký Cổng Phạm vi · hồ sơ`, đã đổi gì), và tệp chuyển thể mang chú thích
  «chuyển thể … <khối>» — kiểm chuẩn nhận khối đã chuyển thể qua chú thích ấy và đỏ khi bảng chưa có dòng.
- Ghép hay tự viết một ô (bậc 6–7) → trong cùng PR thêm một dòng «Chỗ hở» đủ năm ô ở `docs/design/vo-va-ia.md` §3 (đã tra
  gì trên ReUI, vì sao không đứng, hạn xem lại), và một dòng `decisions.jsonl` của hồ sơ nói vì sao rơi bậc.

## Lint giao diện và mức nợ

Bộ luật `quy-hang-ui` (`packages/ui-lint`) áp mức error cho `apps/web/src/**/*.{ts,tsx}`, trừ hai thư mục cài nguyên
bản. Mười một luật — mỗi luật nói chỗ dùng thay:

| Luật | Cấm | Dùng thay |
|---|---|---|
| `no-raw-table` | `<table>` tự dựng | `data-grid` của ReUI |
| `no-raw-controls` | `<button>`, `<input>`, `<select>`, `<textarea>` trần | `Button`, `Input`, `Select`, `Textarea` |
| `no-native-dialogs` | `confirm/alert/prompt`, lớp phủ `fixed inset-0` | `AlertDialog`, `Dialog`, `Sheet`, toast `sonner` |
| `no-raw-palette` | `text-red-500`… cho trạng thái hay thiếu cặp `dark:` | token ngữ nghĩa, Badge/Alert theo biến thể |
| `no-hardcoded-color` | `#hex`, `rgb()`, `oklch()`, `-[#…]` trong class/style | token màu của theme |
| `no-arbitrary-text-size` | `text-[10px]` | thang chữ, tối thiểu `text-xs` |
| `no-banned-motion` | `transition-all`, `animate-bounce`, `ease-in/out`, duration lạ, `framer-motion` | `transition-colors`, chuẩn chuyển động của `reui` |
| `no-aschild` | `asChild` (Radix) | prop `render` của Base UI |
| `no-emoji-icons` | emoji làm icon | icon lucide |
| `require-disable-reason` | `eslint-disable` luật giao diện không kèm lý do | `// eslint-disable-next-line quy-hang-ui/<luật> -- <lý do>` |
| `ban-do-khuon` | tệp thuộc một nhóm của `design/patterns/` nhập khối cấm của nhóm (so theo tên gốc); bản đồ đọc lỗi | khuôn của nhóm (`Khung`, `MucCaiDat`, `Placeholder`, `TrangThai`); sửa bản đồ |
| màn ngoài bản đồ (bài quét khuôn, không phải luật ESLint) | `page.tsx` trả JSX mà không thuộc nhóm đơn vị màn nào của `design/patterns/` | thêm mục bản đồ `design/patterns/<nhóm>.md` và khuôn trong cùng vòng |

**Mức nợ** = số vi phạm luật `quy-hang-ui/*` bị cho qua hàng loạt (`eslint --suppress-*`, ghi ở
`eslint-suppressions.json`). Trần ở `packages/ui-lint/muc-no.json` bằng **0** và chỉ được giảm so với nhánh chính;
`npm run lint` in `mức nợ giao diện: <n>/<trần>` và đỏ khi vượt — job `check` của CI chạy nó. Ngoại lệ thật ghi tay
ngay tại chỗ kèm lý do: được đếm và in riêng («ngoại lệ có lý do: n»), không cộng vào nợ, người duyệt PR đọc lý do.
Không dùng `--suppress-*` để làm xanh lint.

**Bản đồ khuôn** (`design/patterns/`, hàng 58–59): luật `ban-do-khuon` chặn nhập khối cấm lúc viết; bước kiểm chuẩn
cuối `npm run lint` chạy thêm bài quét khuôn (gốc khuôn, khe bắt buộc, trạng thái trần) và in
`khuôn: <n> nhóm · <k> lỗi đọc · <m> lệch`. Chấm theo vòng: `node packages/ui-lint/ban-do-khuon.mjs --base <ref>`.

## Vòng giao diện qua bản đồ khuôn

Luật và lý do ở `docs/design/vo-va-ia.md` §2 «Nhóm mới», «Đối chiếu», «Số đo»; ở đây là thứ tự làm.

1. **Xếp nhóm trước khi dựng.** Màn thuộc nhóm nào của `design/patterns/`? Mở và đọc tệp màn mẫu
   (`mau_dang_chay.tep`) của nhóm trước khi viết dòng nào; dựng qua khuôn, điền khe.
2. **Nhóm mới thì tạo mục bản đồ ngay trong vòng ấy:** `design/patterns/<nhóm>.md` đủ chín khoá (khuôn, màn mẫu, khe,
   khối cấm, ngoại lệ có lý do, luật) và tệp khuôn, theo khối đích ở `vo-va-ia.md` §2. Màn thật dưới `(app)` thì rời
   `nhan_dien` trang tạm cùng PR. Không dựng khuôn cho nhóm chưa có màn.
3. **Thiết kế (`design-pass`):** `doi-chieu.mjs --base <nhánh chính> --slug <slug>` → chụp từng cặp màn mới · màn mẫu
   ở 1440 và 375 → `doi-chieu.mjs --dung <slug>` → gửi `doi-chieu/index.html` kèm thẻ Cổng Phạm vi trước khi ký.
4. **Chấm:** `ban-do-khuon.mjs --base <nhánh chính>` (0 lệch mới, gồm màn ngoài bản đồ) và
   `so-do-vong.mjs --slug <slug> --base <nhánh chính> --write`.
5. **Sau gộp:** chủ sản phẩm thấy lệch khi dùng → một dòng trong `docs/design/lech-lot.md`.

## Sàn thiết kế

Kho ở bậc **M1** của design-floor (`design.surface_globs` trong `_acceptance/config.yaml`: `apps/web/src/app/**`,
`apps/web/src/components/**`). Ở bước chấm của mỗi vòng chạm giao diện, `executors.design.floor` chặn mã màu thô trên
tệp giao diện mà vòng chạm. Bậc M2 (bộ token, danh mục máy-đọc) mở khi có màn thật.

## Vòng làm việc ngắn

1. Viết kế hoạch bảy dòng của `reui` (bề mặt, archetype, họ khung, mật độ, vùng, trạng thái, chuyển động) — màn vận
   hành dùng **Frame**, trang khách dùng **card**; không Card trong Frame hay ngược lại.
2. Đi thang dùng lại cho từng ô; cài khối đích; chuyển thể chỉ đổi dữ liệu, chữ, prop.
3. Mỗi vùng dữ liệu có trống (một hành động), đang tải (`Skeleton` đúng bố cục), lỗi (thử lại); sáng và tối đều đọc
   được.
4. Kiểm: `npm run typecheck && npm run lint`, rồi nhìn màn đang chạy ở khổ máy tính và 375px.
5. Bàn giao năm dòng theo `rules/quality.md` của `reui`; khối mới chuyển thể thì thêm dòng vào `catalog.md`.
