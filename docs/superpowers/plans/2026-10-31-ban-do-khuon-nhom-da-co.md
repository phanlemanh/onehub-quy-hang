# Kế hoạch — bản đồ khuôn cho các nhóm màn đã có (hàng 58)

Thiết kế: `docs/superpowers/specs/2026-10-31-ban-do-khuon-nhom-da-co-design.md` · hồ sơ `_acceptance/ban-do-khuon-nhom-da-co/`.
Làm tuần tự trong phiên chính; bộ đo chạy trên cây thật nên mã giao diện đi trước bản đồ.

## T1 — Khuôn và màn dựng qua khuôn

- Files: `apps/web/src/components/trang-thai.tsx` (mới), `apps/web/src/app/settings/khung.tsx` (mới),
  `apps/web/src/app/settings/users/page.tsx`, `apps/web/src/app/settings/users/quan-nguoi.tsx`,
  `apps/web/src/components/shell/placeholder.tsx`, `apps/web/src/components/shell/notifications.tsx`
- Verify: `npm run typecheck && npm run lint`
- Phục vụ: E3, E4, E6, E7 · independent: false

## T2 — Bộ đọc bản đồ, lệnh và bài kiểm

- Files: `packages/ui-lint/lib/ban-do.mjs`, `packages/ui-lint/ban-do-khuon.mjs`, `packages/ui-lint/tests/ban-do-khuon.test.mjs`
- Verify: `npm test -w @quy-hang/ui-lint`; mỗi phép đo mới có cặp hai chiều trên cùng bản sao (lành → xanh, phá → đỏ có
  thông điệp ghim)
- Phục vụ: E1–E5 · independent: false (đọc bản đồ của T3)

## T3 — Bốn tệp bản đồ và lời trỏ ở vo-va-ia

- Files: `design/patterns/{xac-thuc,cai-dat-san,trang-tam,trang-thai}.md`, `docs/design/vo-va-ia.md` §2
- Verify: `node packages/ui-lint/ban-do-khuon.mjs` thoát 0
- Phục vụ: E1, E8 · independent: false

## T4 — Máy chủ dev của dãy D cho bài nhìn

- Files: `.claude/launch.json` (thêm cấu hình `web-d`, cổng 3473, Postgres 5553)
- Verify: JSON đọc được
- Phục vụ: E6, E7 · independent: true
