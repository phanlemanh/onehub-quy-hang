---
schema_version: 1
feature: "Kho có bộ chuẩn giao diện trước màn sản phẩm đầu tiên: thành phần ReUI, skill giao diện của kho, lint giao diện có mức nợ, sàn thiết kế M1"
slug: tang-5-giao-dien
owner: phanlemanh@gmail.com
risk_tier: T2
surfaces: [ui, config, ci]
status: verified
design_doc: _acceptance/tang-5-giao-dien/design.md
approved_by: Manh Phan
approved_at: 2026-10-30T02:27:06Z
---

# Acceptance Contract: tang-5-giao-dien

## Context

Kho chưa có màn nào; hàng 53 (vỏ ứng dụng) và mọi hàng mở màn đứng sau hàng này. Vòng đặt bộ chuẩn giao diện trước màn
đầu tiên để màn ấy sinh ra với nợ bằng 0: thành phần ReUI cài theo style của kho, skill giao diện của kho, lint giao
diện có mức nợ mà CI chặn tăng, sàn thiết kế M1 — rồi khai vào cấu hình cổng.

Source input: hàng 4 của `docs/plan/lo-trinh.json` · ô cơ hội `_acceptance/tang-5-giao-dien/opportunity.md` (ký `build`).

## Criteria

- AC-1: Given `apps/web` sau vòng, When đọc `apps/web/components.json`, Then style là `base-nova`, `baseColor` là
  `neutral`, `iconLibrary` là `lucide`, có registry `@reui`; và thành phần nền `button`, `badge`, `input`, `separator`,
  `skeleton`, `tooltip` nằm dưới `apps/web/src/components/ui/`, `frame` dưới `apps/web/src/components/reui/`.
- AC-2: Given thành phần đã cài, When chạy `npm run typecheck` và `npm run build` ở gốc kho, Then cả hai thoát 0 — tức
  Tailwind 4, `globals.css` và các thành phần biên dịch được cùng app.
- AC-3: Given máy chủ dev chạy, When mở `/` ở chế độ sáng rồi bật lớp `dark` trên `<html>`, Then trang dựng bằng Frame,
  Badge «Đang dựng» và nút «Kiểm API» thấy được ở cả hai chế độ; tỉ lệ tương phản của tiêu đề với nền hiệu dụng (tổ
  tiên gần nhất có nền không trong suốt) từ 4.5 trở lên ở cả hai chế độ, và nền hiệu dụng sáng khác tối.
- AC-4: Given kho sau vòng, When một agent mở việc giao diện, Then skill `quy-hang-ui` có ở `.agents/skills/quy-hang-ui/`
  và nạp được qua `.claude/skills/quy-hang-ui`; skill `reui` chính chủ có ở `.agents/skills/reui/` và nạp được qua
  `.claude/skills/reui`; `catalog.md` của `quy-hang-ui` liệt đúng từng thành phần đã cài dưới `components/ui` và
  `components/reui`; `npm run lint` chạy bước kiểm này nên CI bắt skill lệch thành phần.
- AC-5: Given skill `quy-hang-ui`, When người duyệt đọc nó cùng `AGENTS.md`, `.claude/rules/giao-dien.md` và
  `docs/design/vo-va-ia.md`, Then skill nêu thứ tự thẩm quyền, trỏ thang dùng lại và bản đồ khối đích thay vì chép lại,
  nêu luật lint và mức nợ, và không mâu thuẫn bốn bất biến. (judgment)
- AC-6: Given bộ luật `quy-hang-ui` (mười luật), When chạy test của gói `@quy-hang/ui-lint`, Then mỗi luật có ít nhất một
  ca đỏ và một ca xanh, ca đỏ ghim `messageId`; và `eslint.config.mjs` áp bộ luật ở mức `error` cho
  `apps/web/src/**/*.{ts,tsx}` trừ `components/ui` và `components/reui`.
- AC-7: Given cây sau vòng, When chạy `npm run lint` ở gốc kho, Then lint thoát 0 và in `mức nợ giao diện: 0/0`; Given
  một bản sao có một vi phạm `quy-hang-ui/*` (mới, bị suppress bằng `eslint --suppress-rule`, hay `eslint-disable` trần),
  When chạy cùng bước kiểm, Then thoát khác 0 và thông điệp gọi tên luật; nâng trần trong `muc-no.json` cao hơn trần trên
  nhánh chính cũng thoát khác 0, còn nhánh chính chưa có tệp trần thì không chặn; trên CI không đọc được nhánh chính thì
  thoát khác 0 có tên. Job `check` của `.github/workflows/ci.yml` có bước `npm run lint` ở gốc (máy kiểm), nên CI chặn
  tăng.
- AC-8: Given `_acceptance/config.yaml` sau vòng, When chạy `design-floor-bac.mjs` và bộ kiểm chuẩn
  `packages/ui-lint/kiem-chuan.mjs`, Then bậc in ra là M1; cấu hình khai `feature_loop.ui_standards_skill: quy-hang-ui`
  trỏ skill có thật, `design.surface_globs` khớp tệp giao diện, `executors.design.floor`, `executors.test.ui_lint`;
  và `design-floor-s4.mjs` trên một nhánh thử chạm tệp giao diện có hex thô thì thoát 2 (chặn), không hex thì 0.

## Coverage

Quét bằng morphological-scan (preset tự dựng — không khớp preset có sẵn), hai trục:

- Trục A — phần của bộ chuẩn: thành phần · skill · lint + mức nợ · sàn thiết kế · cấu hình cổng
  [thước CE: câu giao hàng 4 + `bat_khi` của `docs/plan/lo-trinh.json`; đối chiếu `[NGÀNH: onehub-invest]` — cùng chủ,
  cùng bốn phần đã chạy ở đó]
- Trục B — kiểu bằng chứng: có mặt đúng khuôn · chạy được/biên dịch · chặn vi phạm (đỏ) · không chặn oan (xanh) ·
  CI mang nó [thước CE: luật MEASURE-BIRTH của kit — cặp hai chiều cùng fixture]
- Core (ô có nghĩa → AC): thành phần×khuôn (AC-1), thành phần×biên dịch (AC-2), thành phần×nhìn thấy (AC-3),
  skill×khuôn (AC-4), skill×nội dung (AC-5), lint×chặn/không chặn oan (AC-6), mức nợ×chặn + CI (AC-7),
  sàn + cổng×khuôn/chặn/không chặn oan (AC-8), skill×CI (AC-4 qua `npm run lint`).
- Later: sàn×CI — `design-floor-s4.mjs` cần kit (`CLAUDE_PLUGIN_ROOT`), chạy ở S4 của vòng, không ở CI; hex thô ở CI
  vẫn bị luật `no-hardcoded-color` chặn.
- Never: thành phần×chặn (thành phần không có gì để chặn).

## Đường đo

- Thước: mức nợ lint giao diện · số từ: dòng `mức nợ giao diện: <n>/<trần>` của `npm run lint` · bảo đảm bởi: AC-7
- Thước: CI chặn tăng · số từ: job `check` của CI (`npm run lint`) đỏ khi nợ vượt trần · bảo đảm bởi: AC-7
- Thước: sàn M1 chặn mã màu thô · số từ: mã thoát `design-floor-s4.mjs` (2 = chặn) và bậc của `design-floor-bac.mjs` · bảo đảm bởi: AC-8
- Thước: cổng khai skill giao diện · số từ: khoá `feature_loop.ui_standards_skill` + `kiem-chuan.mjs` · bảo đảm bởi: AC-8

## Out of scope

- Vỏ ứng dụng `app-shell-8` và mọi khối Pro — hàng 53, cần `REUI_LICENSE_KEY` do chủ kho đặt.
- Bộ token và danh mục thành phần máy-đọc (`design_floor.tokens`/`registry`, bậc M2) — sau khi có màn thật.
- Design gate a11y/slop (`executors.design.gate`/`static`, cần `jsdom`) — chưa có màn để chấm.
- Công tắc sáng/tối và theo `prefers-color-scheme` — việc của vỏ.
- Nối `design-floor-s4.mjs` vào CI — cần kit; chạy ở S4 của vòng. CI mang `npm run lint` (gồm mức nợ và kiểm chuẩn).
- Không đổi `.github/workflows/**`.

## Notes

- Ba tệp ngoài ranh giới (`package-lock.json`, `eslint.config.mjs`, `_acceptance/config.yaml`) được giám sát duyệt ở yêu
  cầu G-1 (30/10): lock chỉ sinh bằng `npm install`; config chỉ THÊM dòng.
- Bộ luật chuyển từ `onehub-invest/app/eslint-plugin-onehub-ui` (cùng chủ kho), đổi tên plugin `quy-hang-ui`.
