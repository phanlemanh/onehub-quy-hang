# Kế hoạch — răng giữ khuôn (hàng 59)

Thiết kế: `docs/superpowers/specs/2026-10-31-rang-giu-khuon-design.md` · hồ sơ `_acceptance/rang-giu-khuon/`. Tuần tự.

## T1 — Luật lint `ban-do-khuon` và đăng ký plugin
- Files: `packages/ui-lint/rules/ban-do-khuon.mjs`, `packages/ui-lint/index.mjs`, `packages/ui-lint/lib/ban-do.mjs` (`nhomCuaTep`, số dòng của lệch), `packages/ui-lint/tests/{index,cau-hinh}.test.mjs`
- Verify: `npm test -w @quy-hang/ui-lint` · phục vụ E1, E2, E3, E4, E7b · independent: false

## T2 — Bài quét trong kiem-chuan
- Files: `packages/ui-lint/kiem-chuan.mjs`, `packages/ui-lint/tests/kiem-chuan.test.mjs`
- Verify: `node packages/ui-lint/kiem-chuan.mjs` · phục vụ E4, E5, E7 · independent: false

## T3 — Chế độ `--base`
- Files: `packages/ui-lint/ban-do-khuon.mjs` · Verify: E6 · independent: false

## T4 — Bài kiểm hai chiều và tài liệu
- Files: `packages/ui-lint/tests/rang-giu-khuon.test.mjs`, `.agents/skills/quy-hang-ui/SKILL.md`, `docs/design/vo-va-ia.md`
- Verify: phá thử từng răng → đỏ; hoàn lại → xanh · phục vụ mọi eval · independent: false
