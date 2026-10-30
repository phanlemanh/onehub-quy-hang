# Thiết kế: tang-5-giao-dien — chuẩn giao diện của kho trước màn đầu tiên

Ngày 2026-10-30 · hàng 4 lộ trình · dãy G đợt nen-dau · hạng T2 · ô cơ hội đã ký `build` (Manh Phan, 30/10).

## Bài toán

Kho chưa có màn nào. Hàng 53 (vỏ ứng dụng) và mọi hàng mở màn đứng sau hàng này. Nếu màn đầu tiên dựng trước bộ chuẩn
thì nợ giao diện sinh cùng màn — đúng điều Invest đang trả (52/619 tệp còn hex thô, đo 29/10). Hàng này đặt bốn thứ
trước: thành phần ReUI cài theo style của kho, skill giao diện của kho, lint giao diện có mức nợ, sàn thiết kế M1 — rồi
khai chúng vào cấu hình cổng để mọi vòng chạm giao diện tự nạp.

Ngưỡng của ô (`opportunity.md`): mức nợ lint giao diện bằng 0 và CI chặn tăng; sàn thiết kế M1 chặn mã màu thô; cấu
hình cổng khai skill giao diện.

## Nguồn đã đọc (thay cho hỏi-đáp — vòng chạy trong đợt)

- `AGENTS.md` (luật UI: chọn trên kho ReUI trước; style `base-nova`, icon lucide, như onehub-invest)
- `.claude/rules/giao-dien.md` (thang dùng lại bảy bậc), `docs/adr/0002-vo-va-ia-chon-tu-reui.md`, `docs/design/vo-va-ia.md`
- `eslint.config.mjs` — comment «Luật UI dùng chung (gói lint UI tách từ onehub-invest) gắn vào khi dựng màn đầu tiên»
- onehub-invest: `app/eslint-plugin-onehub-ui/` (10 luật + kiểm directive trần + báo cáo), `.claude/skills/onehub-ui/`,
  `.agents/skills/reui/` (skill ReUI bản `68f0e6fa91`), `app/components.json`
- Kit 2.35.0: GUIDE §5.2 «Wire `executors.design`», `scripts/design-floor-bac.mjs` (M1 = `design.surface_globs` khớp ít
  nhất một tệp git theo dõi), `scripts/design-floor-s4.mjs` (M1 chặn hex thô trên tệp giao diện mà vòng chạm)
- Trang tri thức `wiki/dot/ban-dau-2910.md` (dòng «Nguồn:» của ô)

## Bốn phần

### 1. Thành phần ReUI (apps/web)

- `apps/web/components.json`: `style: base-nova`, `baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`,
  registry `@reui` (`https://reui.io/r/{style}/{name}.json`, Bearer `${REUI_LICENSE_KEY}`) — y khuôn Invest.
- Tailwind 4 qua `@tailwindcss/postcss` (`apps/web/postcss.config.mjs`), `apps/web/src/app/globals.css` do shadcn sinh
  (token oklch sáng/tối, `tw-animate-css`), `layout.tsx` nạp nó; `apps/web/src/lib/utils.ts` (`cn`).
- Tập thành phần nền, cài nguyên bản bằng shadcn CLI, không sửa tay: `button`, `badge`, `input`, `separator`,
  `skeleton`, `tooltip` (shadcn base-nova) và `@reui/frame` (họ khung của màn vận hành). Chỉ hàng miễn phí — máy chưa
  có `REUI_LICENSE_KEY`, khối Pro (vỏ `app-shell-8`) cài ở hàng 53 khi chủ kho đặt khoá.
- Trang giữ chỗ `/` dựng lại bằng `Frame` + `Badge` + `Button` với token ngữ nghĩa — để thành phần đã cài được dùng thật
  và nhìn được ở hai chế độ sáng/tối. Vỏ hàng 53 thay trang này.

### 2. Skill giao diện của kho

- `.agents/skills/quy-hang-ui/SKILL.md` — lớp mỏng trên skill ReUI, chỉ giữ điều ReUI không biết về kho: thứ tự thẩm
  quyền (bất biến `AGENTS.md` → skill `reui` → `quy-hang-ui`), thang dùng lại (trỏ `.claude/rules/giao-dien.md`), vỏ
  và khối đích (trỏ `docs/design/vo-va-ia.md`), luật lint giao diện và mức nợ, sàn thiết kế, chữ tiếng Việt (nhãn lấy
  từ `CONTEXT.md`), vòng làm việc ngắn. Kèm `catalog.md`: «Thành phần đã cài» (khớp từng tệp dưới
  `components/ui` và `components/reui` — máy kiểm) và «Khối đã chuyển thể» (khuôn, rỗng tới màn đầu tiên).
- `.agents/skills/reui/` — skill ReUI chính chủ bản `68f0e6fa91`, chép nguyên từ Invest (cùng bản MCP đang trả).
- Claude Code đọc `.claude/skills/`: `.claude/skills/quy-hang-ui` và `.claude/skills/reui` là symlink tương đối vào
  `.agents/skills/` — một nguồn, hai đường nạp (Codex, Cursor đọc `.agents/skills`).
- Không chạy bộ cài ReUI (`curl … | node -`): nó ghi cấu hình MCP, `.cursor/`, và một khối vào `AGENTS.md` — ngoài vùng.

### 3. Lint giao diện có mức nợ

- Gói mới `packages/ui-lint` (`@quy-hang/ui-lint`, workspace) — chuyển từ `eslint-plugin-onehub-ui` của Invest, tên
  plugin `quy-hang-ui`. Mười luật: `no-raw-table`, `no-raw-controls`, `no-native-dialogs`, `no-raw-palette`,
  `no-hardcoded-color`, `no-arbitrary-text-size`, `no-banned-motion`, `no-aschild`, `no-emoji-icons`,
  `require-disable-reason`. Mỗi luật một tệp test RuleTester có cả ca xanh lẫn ca đỏ và lời nhắn ghim.
- `eslint.config.mjs` gắn plugin cho `apps/web/src/**/*.{ts,tsx}` ở mức `error`, trừ thư mục vendor
  `apps/web/src/components/{ui,reui}/**` (cài nguyên bản, không sửa tay).
- **Mức nợ** (định nghĩa chờ Hỏi-1 ở Cổng Phạm vi; bản nháp theo khuyến nghị) = tổng `count` của luật
  `quy-hang-ui/*` trong `eslint-suppressions.json` ở gốc kho (tệp ESLint 9 ghi khi `--suppress-rule`/`--suppress-all`;
  vắng tệp = 0). Ngoại lệ `eslint-disable … quy-hang-ui/<luật> -- <lý do>` được đếm và in riêng («ngoại lệ có lý do:
  n»), không chặn. **Trần nợ** ở `packages/ui-lint/muc-no.json` = `{"tran": 0}`.
- `packages/ui-lint/muc-no.mjs` in `mức nợ giao diện: <n>/<trần> · ngoại lệ có lý do: <m>` và thoát 1 khi:
  (a) mức nợ > trần — thông điệp gọi tên luật; (b) trần lớn hơn trần trên nhánh chính — «trần chỉ được giảm».
  Trần nhánh chính đọc bằng `git show origin/main:packages/ui-lint/muc-no.json`; ref vắng (checkout nông của CI) →
  tự `git fetch --depth=1 origin main` một lần. Nhánh chính chưa có tệp (chính PR này) → «nhánh chính chưa có trần —
  đặt trần lần đầu», không chặn. Vẫn không đọc được nhánh chính → trên CI (`CI=true`) thoát 1 «không so được trần với
  nhánh chính: <lý do>»; trên máy chỉ cảnh báo. Mọi ca có test hai chiều; fixture suppressions sinh bằng chính
  `eslint --suppress-rule` trên tệp vi phạm thật (round-trip bên ghi), không viết tay.
- `check-bare-disables.mjs` bắt `eslint-disable` trần — dạng luật không tự bắt được; thư mục app truyền bằng đối số,
  mặc định suy từ vị trí script (`../../apps/web`).
- Gốc kho `npm run lint` = `eslint . && node packages/ui-lint/check-bare-disables.mjs && node packages/ui-lint/muc-no.mjs
  && node packages/ui-lint/kiem-chuan.mjs`. Job `check` của CI chạy `npm run lint` ở gốc → CI chặn tăng nợ và chặn
  lệch chuẩn mà không đổi `.github/workflows`. `kiem-chuan.mjs` còn đọc `.github/workflows/ci.yml` và kiểm job `check`
  có bước `npm run lint` — để lời «CI mang nó» có thước.

### 4. Sàn thiết kế M1 và cấu hình cổng

`_acceptance/config.yaml` — chỉ THÊM dòng (luật 12 của đợt):

```yaml
feature_loop:
  ui_standards_skill: quy-hang-ui
  suite_keys: [...]                  # typecheck, lint, test các gói, ui_lint, build
executors:
  test:
    ui_lint: "npm test -w @quy-hang/ui-lint"
  script:
    typecheck: "npm run typecheck"
    lint: "npm run lint"
    build: "npm run build"
    giao_dien: "node packages/ui-lint/kiem-chuan.mjs"
    san_m1: "node packages/ui-lint/thu-san.mjs"
  design:
    floor: "node \"${CLAUDE_PLUGIN_ROOT}/scripts/design-floor-s4.mjs\" --root ."
design:
  surface_globs: ["apps/web/src/app/**", "apps/web/src/components/**"]
```

`executors.script.giao_dien` = `node packages/ui-lint/kiem-chuan.mjs`: kiểm trạng thái cây của bộ chuẩn — `components.json`
đúng style, thành phần nền có mặt và đều liệt trong `catalog.md`, hai skill có mặt và symlink trỏ đúng, cấu hình cổng
khai đủ khoá. Cặp hai chiều trong test của gói (cây lành → xanh; bản sao bị phá → đỏ, thông điệp gọi tên khoá).

`design-floor-bac.mjs` khi đó in M1; `design-floor-s4.mjs` chặn hex thô trên tệp giao diện mà vòng chạm.

`executors.script.san_m1` = `node packages/ui-lint/thu-san.mjs` (biến `CLAUDE_PLUGIN_ROOT` vắng thì lệnh cấu hình đặt nó từ
`packages/ui-lint/tim-kit.mjs` — đọc sổ plugin đã cài, không đoán thư mục cache) — bài thử sàn trên kho thật lẫn kho tạm:
1. Tìm kit: `CLAUDE_PLUGIN_ROOT` (như `product_map`); vắng hay thiếu `scripts/design-floor-s4.mjs` → thoát 2 «thiếu
   CLAUDE_PLUGIN_ROOT» — DỪNG-lỗi có tên, không đoán đường cache.
2. Chạy `design-floor-bac.mjs --root <kho> --json` trên kho thật → phải ra `M1`.
3. Kho tạm `git init` trong thư mục tạm của hệ thống (ngoài cây kho): chép NGUYÊN `_acceptance/config.yaml` thật (không
   viết tay), commit mốc trên nhánh `main`, rồi nhánh thử thêm một commit chạm `apps/web/src/app/thu.tsx`.
   Ca đỏ: tệp có `#ff0000` → `design-floor-s4.mjs --root <tạm> --base main` mã 2. Ca xanh: cùng tệp, cùng nhánh, dòng
   đó đổi thành `bg-primary` → mã 0. Hai ca trên cùng kho tạm, cùng tệp.
4. In `bậc: M1 · sàn: hex → 2, token → 0`, thoát 0; lệch bất kỳ → thoát 1 kèm ca lệch.

Không vào CI (cần kit) — chạy ở S4 của vòng này và mọi vòng sau.

## Đặc tả UX

<!-- ux-spec: chỉ một trang giữ chỗ; không có luồng -->
- Surface chạm: `/` (trang giữ chỗ) — một Frame: tiêu đề «Quỹ hàng», mô tả một câu, Badge «Đang dựng», nút viền dẫn
  tới `/api/v1/health`. Trạng thái: tĩnh — không có vùng dữ liệu nên không có trống/tải/lỗi.
- Khuôn IA: «Frame stack» một khung (archetype của ReUI compose) — hiển nhiên, không tra mẫu.
- Sáng/tối: token của base-nova; tối bật bằng lớp `dark` trên `<html>`. Công tắc giao diện là việc của vỏ (hàng 53).

## Rủi ro

- `package-lock.json` đổi — dãy Q cũng thêm gói (better-auth). Xung đột thì gộp `origin/main` rồi `npm install` sinh lại
  lock (luật 9), không sửa tay.
- shadcn CLI cần mạng tới registry shadcn/ReUI lúc S3; không có thì DỪNG-lỗi có tên, không tự viết tay thành phần.
- `feature_loop.suite_keys`: dãy Q cũng xin thêm khoá này (yêu cầu Q-1) — gộp sau thì giữ cả hai bên, hợp nhất danh sách.
