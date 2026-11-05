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
   **Ô chưa có khuôn** (nhóm mới · đổi «Khối đích» của một màn · thêm dòng «Chỗ hở» — ADR-0019) → bước phân kỳ mở
   (`divergence: opened`) với ba lối tên cố định Trong kho · ReUI · Vẽ mới (khối đích `vo-va-ia.md` §2 là khuyến nghị đầu
   vào cho lối ReUI): `doi-chieu.mjs --ba-loi --slug <slug>` → chụp sáu ảnh `<lối>-<khổ>.png` cùng dữ liệu mẫu → điền
   `ba-loi/ba-loi.json` (nhãn, câu động cơ, câu đánh đổi mỗi lối; lối không có ứng viên ghi `{"khong_co": true,
   "da_tra": "…"}`; lời khuyên và lý do) → `doi-chieu.mjs --dung-ba-loi <slug>` → gửi `ba-loi/index.html` kèm thẻ Cổng
   Phạm vi. Màn đi khuôn sẵn của nhóm thì không cần trang, `divergence: skipped` hợp lệ.
4. **Chấm:** `ban-do-khuon.mjs --base <nhánh chính>` (0 lệch mới, gồm màn ngoài bản đồ),
   `doi-chieu.mjs --kiem-ba-loi --base <nhánh chính> --slug <slug>` (đỏ khi vòng có ô chưa có khuôn mà bỏ bước phân kỳ
   hay trang ba lối thiếu, sai, sửa tay) và `so-do-vong.mjs --slug <slug> --base <nhánh chính> --write`.
5. **Sau gộp:** chủ sản phẩm thấy lệch khi dùng → một dòng trong `docs/design/lech-lot.md`.

## Sàn thiết kế

Kho ở bậc **M1** của design-floor (`design.surface_globs` trong `_acceptance/config.yaml`: `apps/web/src/app/**`,
`apps/web/src/components/**`). Ở bước chấm của mỗi vòng chạm giao diện, `executors.design.floor` chặn mã màu thô trên
tệp giao diện mà vòng chạm. Bậc M2 (bộ token, danh mục máy-đọc) mở khi có màn thật.

## Bản đồ hệ thiết kế

Mỗi tệp của hệ thiết kế một dòng (hàng 91): lớp, việc, đường dẫn. Lớp là một trong chỉ dẫn · nền · nhãn · chọn khối ·
khuôn · bố cục · kiểm · cổng · sổ · đối chiếu. Khối máy đọc dưới đây khai mẫu đường dẫn của hệ thiết kế; kiểm chuẩn so cây
với bảng — tệp khớp mẫu mà thiếu dòng, hay dòng trỏ tệp không có, thì đỏ. Khối đã chuyển thể (`components/khoi/**`) ghi
ở `catalog.md`, không lặp ở đây.

<!-- <<<BAN-DO-HE-THIET-KE-MAU
.agents/skills/quy-hang-ui/*.md
.claude/rules/giao-dien.md
CONTEXT.md
apps/web/components.json
apps/web/src/app/globals.css
apps/web/src/components/bo-cuc/*.ts
apps/web/src/components/bo-cuc/*.tsx
apps/web/src/components/trang-thai.tsx
apps/web/src/app/mau/he-bo-cuc/**/*.ts
apps/web/src/app/mau/he-bo-cuc/**/*.tsx
design/anh-chuan/ke.json
design/patterns/*.md
docs/adr/0002-*.md
docs/adr/0019-*.md
docs/adr/0024-*.md
docs/design/*.md
_acceptance/config.yaml
_acceptance/he-bo-cuc/thu/*.cjs
packages/ui-lint/*.mjs
packages/ui-lint/*.json
packages/ui-lint/lib/*.mjs
packages/ui-lint/rules/*.mjs
!**/*.test.ts
BAN-DO-HE-THIET-KE-MAU>>> -->

| Lớp | Việc | Đường dẫn |
| --- | --- | --- |
| chỉ dẫn | Skill giao diện của kho: thứ tự thẩm quyền, thang dùng lại, lint, vòng qua bản đồ khuôn, bảng này | `.agents/skills/quy-hang-ui/SKILL.md` |
| chọn khối | Danh mục thành phần đã cài và khối đã chuyển thể, ô «Duyệt» của từng khối | `.agents/skills/quy-hang-ui/catalog.md` |
| chỉ dẫn | Luật giao diện theo đường dẫn: thang dùng lại bảy bậc, một họ khung mỗi màn, trang ba lối | `.claude/rules/giao-dien.md` |
| nhãn | Từ vựng: nhãn UI ↔ tên code, chữ trên màn lấy từ đây | `CONTEXT.md` |
| cổng | Cấu hình cổng: skill chuẩn giao diện, surface_globs, executors.design | `_acceptance/config.yaml` |
| đối chiếu | Chụp 21 ảnh chuẩn sáng và 7 tối từ trang mẫu sống | `_acceptance/he-bo-cuc/thu/chup-anh-chuan.cjs` |
| nền | Cấu hình shadcn: style base-nova, nền neutral, icon lucide, registry @reui | `apps/web/components.json` |
| nền | Token màu, chữ, bo góc và token bố cục (lề trang, khoảng khung, bề rộng đọc, ngăn, khung vỏ) | `apps/web/src/app/globals.css` |
| đối chiếu | Dữ liệu mẫu của trang mẫu sống, không gọi API | `apps/web/src/app/mau/he-bo-cuc/du-lieu-mau.ts` |
| đối chiếu | Màn mẫu của từng bố cục dựng từ khối thật | `apps/web/src/app/mau/he-bo-cuc/man-mau.tsx` |
| đối chiếu | Trang mẫu sống /mau/he-bo-cuc: thanh chọn bố cục × trạng thái × khổ | `apps/web/src/app/mau/he-bo-cuc/page.tsx` |
| đối chiếu | Tổ hợp 7 × 5 × 3 và địa chỉ của từng tổ hợp | `apps/web/src/app/mau/he-bo-cuc/to-hop.ts` |
| đối chiếu | Khuôn TrangMau: vỏ thật với người mẫu, không bộ đồng bộ | `apps/web/src/app/mau/he-bo-cuc/trang-mau.tsx` |
| đối chiếu | Một tổ hợp ở đúng khổ — máy chụp ảnh chuẩn mở thẳng địa chỉ này | `apps/web/src/app/mau/he-bo-cuc/xem/page.tsx` |
| bố cục | BoCuc: bảy bố cục giữ lề, đầu màn, xếp thân và cột phụ; không dựng Frame | `apps/web/src/components/bo-cuc/bo-cuc.tsx` |
| bố cục | ChoTai: chờ tải theo hình của từng bố cục — chỗ duy nhất dựng Skeleton | `apps/web/src/components/bo-cuc/cho-tai.tsx` |
| bố cục | CotKeoChia: cột chi tiết kéo chia cạnh thân của Danh sách – chi tiết (app-shell-11, 38%, 28–50%) — nhóm panel luôn dựng | `apps/web/src/components/bo-cuc/cot-keo-chia.tsx` |
| bố cục | Dải ngoại tuyến ở đầu màn, nội dung đã tải giữ nguyên | `apps/web/src/components/bo-cuc/dai-ngoai-tuyen.tsx` |
| bố cục | DauMan: đường dẫn luôn có, tiêu đề, điều khiển cấp màn và nút bên phải | `apps/web/src/components/bo-cuc/dau-man.tsx` |
| bố cục | Cửa nhập của hệ bố cục cho màn | `apps/web/src/components/bo-cuc/index.ts` |
| bố cục | Ma trận bảy bố cục × vùng, bản điện thoại, chia nút — một nguồn cho bố cục, test và bài quét | `apps/web/src/components/bo-cuc/ma-tran.ts` |
| bố cục | LuongToanMan: Luồng nhiều bước trên điện thoại mở ngăn phủ toàn màn, đóng là quay lại | `apps/web/src/components/bo-cuc/luong-toan-man.tsx` |
| bố cục | NganNoi: ngăn inset bên phải (sheet-9) cho ngăn báo, lọc trên điện thoại, Luồng nhiều bước; điện thoại ngăn từ đáy hay phủ toàn màn — chỗ duy nhất gọi Sheet, Drawer | `apps/web/src/components/bo-cuc/ngan-noi.tsx` |
| bố cục | TrangThai: rỗng (empty-state-1), tìm không ra (empty-state-2), lỗi, báo, chờ tải nhỏ | `apps/web/src/components/trang-thai.tsx` |
| đối chiếu | Kê ảnh chuẩn: mỗi ảnh một dòng địa chỉ, khổ, commit | `design/anh-chuan/ke.json` |
| khuôn | Khuôn Bảng hàng | `design/patterns/bang-hang.md` |
| khuôn | Khuôn Cài đặt sàn — bố cục Đọc | `design/patterns/cai-dat-san.md` |
| khuôn | Khuôn Chế độ cuộc gọi | `design/patterns/cuoc-goi.md` |
| khuôn | Khuôn Gửi — bố cục Luồng nhiều bước | `design/patterns/gui.md` |
| khuôn | Khuôn Đã gửi — bố cục Danh sách → chi tiết | `design/patterns/da-gui.md` |
| khuôn | Khuôn Trang khách — bố cục Danh sách → chi tiết, không vỏ | `design/patterns/trang-khach.md` |
| khuôn | Khuôn Hồ sơ căn | `design/patterns/ho-so-can.md` |
| khuôn | Khuôn Hôm nay của đầu chủ — bố cục Tràn | `design/patterns/hom-nay-dau-chu.md` |
| khuôn | Khuôn Hôm nay của đầu khách — bố cục Dòng tin | `design/patterns/hom-nay-dau-khach.md` |
| khuôn | Khuôn Liên hệ — bảng và hồ sơ người, bố cục Danh sách – chi tiết | `design/patterns/lien-he.md` |
| khuôn | Khuôn Hôm nay của trưởng nhóm — bố cục Bảng điều khiển | `design/patterns/hom-nay-truong-nhom.md` |
| khuôn | Khuôn Lead của tôi | `design/patterns/lead-cua-toi.md` |
| khuôn | Khuôn Nhập Excel | `design/patterns/nhap-excel.md` |
| khuôn | Khuôn Ô nhận lead | `design/patterns/o-nhan-lead.md` |
| khuôn | Khuôn Tôi — bố cục Đọc | `design/patterns/toi.md` |
| khuôn | Khuôn trang mẫu sống | `design/patterns/trang-mau.md` |
| khuôn | Khuôn trang tạm — bố cục Đọc | `design/patterns/trang-tam.md` |
| khuôn | Khuôn trạng thái: mọi chỗ trình trống · lỗi · báo đi qua TrangThai | `design/patterns/trang-thai.md` |
| khuôn | Khuôn đăng nhập, chọn sàn, chưa gắn sàn | `design/patterns/xac-thuc.md` |
| sổ | ADR vỏ, IA, chọn từ ReUI | `docs/adr/0002-vo-va-ia-chon-tu-reui.md` |
| sổ | ADR cổng chọn khối và trang ba lối | `docs/adr/0019-cong-chon-khoi.md` |
| sổ | ADR hệ bố cục | `docs/adr/0024-he-bo-cuc.md` |
| sổ | Nháp hiện trạng cổng chọn khối | `docs/design/cong-chon-khoi-hien-trang.md` |
| sổ | Lệch lọt qua lưới khuôn — mỗi lần chủ sản phẩm thấy một dòng | `docs/design/lech-lot.md` |
| đối chiếu | Đánh giá ngăn hồ sơ căn cạnh Bảng hàng (05/11): ba lối, số đo, khảo sát ReUI Pro và ngành | `docs/design/danh-gia-ngan-chi-tiet-can.md` |
| chọn khối | Vỏ, IA, khối đích và bố cục của từng màn, chỗ hở | `docs/design/vo-va-ia.md` |
| kiểm | Lệnh bài quét khuôn: mỗi nhóm một dòng tóm tắt | `packages/ui-lint/ban-do-khuon.mjs` |
| kiểm | Chặn tắt luật không lý do | `packages/ui-lint/check-bare-disables.mjs` |
| đối chiếu | Kế hoạch đối chiếu màn mới với màn mẫu hay ảnh chuẩn; trang ba lối | `packages/ui-lint/doi-chieu.mjs` |
| kiểm | Plugin ESLint quy-hang-ui: mười bốn luật | `packages/ui-lint/index.mjs` |
| kiểm | Kiểm chuẩn giao diện: cài đặt, skill, danh mục, khuôn, bố cục, ba lối, MCP, bảng này | `packages/ui-lint/kiem-chuan.mjs` |
| kiểm | Ảnh chuẩn của bảy bố cục: đủ tấm, đúng khổ, ke.json, dòng danh mục | `packages/ui-lint/lib/anh-chuan.mjs` |
| kiểm | Trang ba lối: nhiều ô một hồ sơ, dựng và kiểm | `packages/ui-lint/lib/ba-loi.mjs` |
| kiểm | Kiểm bảng này: mỗi tệp của hệ thiết kế một dòng | `packages/ui-lint/lib/ban-do-he-thiet-ke.mjs` |
| kiểm | Đọc bản đồ khuôn, kiểm cây theo khuôn | `packages/ui-lint/lib/ban-do.mjs` |
| kiểm | Bố cục có khai, khuôn dựng đúng kiểu, ngoại lệ có hạn | `packages/ui-lint/lib/bo-cuc.mjs` |
| kiểm | Cặp ảnh đối chiếu: màn mới cạnh màn mẫu hay ảnh chuẩn của bố cục | `packages/ui-lint/lib/doi-chieu.mjs` |
| kiểm | Duyệt chuỗi class cho luật | `packages/ui-lint/lib/class-strings.mjs` |
| kiểm | Gốc kho và bản đồ khuôn cho luật ESLint | `packages/ui-lint/lib/goc-kho.mjs` |
| kiểm | Kiểm .mcp.json: reui và shadcn, không khoá | `packages/ui-lint/lib/mcp.mjs` |
| kiểm | Thư mục thành phần cài nguyên bản, luật bỏ qua | `packages/ui-lint/lib/vendor.mjs` |
| kiểm | Phạm vi của ba luật bố cục | `packages/ui-lint/lib/vung-bo-cuc.mjs` |
| sổ | Mức nợ giao diện, trần 0 | `packages/ui-lint/muc-no.json` |
| kiểm | Đếm nợ giao diện so trần | `packages/ui-lint/muc-no.mjs` |
| nền | Gói ui-lint: lệnh test | `packages/ui-lint/package.json` |
| kiểm | Luật: không nhập khối cấm ngoài khuôn | `packages/ui-lint/rules/ban-do-khuon.mjs` |
| kiểm | Luật: cỡ chữ theo thang | `packages/ui-lint/rules/no-arbitrary-text-size.mjs` |
| kiểm | Luật: dùng render thay asChild (base-nova) | `packages/ui-lint/rules/no-aschild.mjs` |
| kiểm | Luật: chuyển động theo chuẩn ReUI | `packages/ui-lint/rules/no-banned-motion.mjs` |
| kiểm | Luật: Sheet, Drawer chỉ qua NganNoi | `packages/ui-lint/rules/no-direct-sheet.mjs` |
| kiểm | Luật: icon lucide, không emoji | `packages/ui-lint/rules/no-emoji-icons.mjs` |
| kiểm | Luật: màu qua token | `packages/ui-lint/rules/no-hardcoded-color.mjs` |
| kiểm | Luật: bề rộng, chiều cao, lề trang thuộc bố cục | `packages/ui-lint/rules/no-layout-arbitrary.mjs` |
| kiểm | Luật: không alert/confirm của trình duyệt | `packages/ui-lint/rules/no-native-dialogs.mjs` |
| kiểm | Luật: điều khiển qua thành phần | `packages/ui-lint/rules/no-raw-controls.mjs` |
| kiểm | Luật: không bảng màu thô | `packages/ui-lint/rules/no-raw-palette.mjs` |
| kiểm | Luật: Skeleton chỉ trong ChoTai | `packages/ui-lint/rules/no-raw-skeleton.mjs` |
| kiểm | Luật: bảng qua data-grid | `packages/ui-lint/rules/no-raw-table.mjs` |
| kiểm | Luật: tắt luật phải có lý do | `packages/ui-lint/rules/require-disable-reason.mjs` |
| sổ | Đếm lệch lọt mỗi vòng | `packages/ui-lint/so-do-vong.mjs` |
| kiểm | Tiện ích test luật | `packages/ui-lint/test-utils.mjs` |
| kiểm | Thử sàn thiết kế | `packages/ui-lint/thu-san.mjs` |
| cổng | Tìm bản kit nghiệm thu đang cài | `packages/ui-lint/tim-kit.mjs` |

## Vòng làm việc ngắn

1. Viết kế hoạch bảy dòng của `reui` (bề mặt, archetype, họ khung, mật độ, vùng, trạng thái, chuyển động) — màn vận
   hành dùng **Frame**, trang khách dùng **card**; không Card trong Frame hay ngược lại.
2. Đi thang dùng lại cho từng ô; cài khối đích; chuyển thể chỉ đổi dữ liệu, chữ, prop.
3. Mỗi vùng dữ liệu có trống (một hành động), đang tải (`Skeleton` đúng bố cục), lỗi (thử lại); sáng và tối đều đọc
   được.
4. Kiểm: `npm run typecheck && npm run lint`, rồi nhìn màn đang chạy ở khổ máy tính và 375px.
5. Bàn giao năm dòng theo `rules/quality.md` của `reui`; khối mới chuyển thể thì thêm dòng vào `catalog.md`.
