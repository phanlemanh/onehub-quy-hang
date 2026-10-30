# Kế hoạch thi công — tang-5-giao-dien

Hồ sơ đã duyệt 2026-10-30 (Manh Phan). Hạng T2: không có Gate 1.5. Chạy tuần tự trong vòng chính — các việc chạm chung
`package.json`/`package-lock.json` nên không tách worktree song song (`independent: false` cho tất cả).

| # | Việc | Tệp | Kiểm từng việc | Phục vụ |
|---|---|---|---|---|
| 1 | Cài nền ReUI cho app: shadcn base-nova, Tailwind 4, thành phần nền, trang giữ chỗ | `apps/web/components.json`, `apps/web/postcss.config.mjs`, `apps/web/package.json`, `apps/web/src/app/{globals.css,layout.tsx,page.tsx}`, `apps/web/src/lib/utils.ts`, `apps/web/src/components/{ui,reui}/**`, `package-lock.json` | `npm run typecheck && npm run build` | E1, E2, E3, E4 |
| 2 | Gói lint `packages/ui-lint`: mười luật + test, kiểm directive trần, mức nợ + trần | `packages/ui-lint/**`, `package-lock.json` | `npm test -w @quy-hang/ui-lint` (gồm lượt phá-thử của muc-no, check-bare-disables) | E6, E7 |
| 3 | Gắn lint vào kho: `eslint.config.mjs`, script `lint` ở gốc | `eslint.config.mjs`, `package.json` | `npm run lint` in `mức nợ giao diện: 0/0` | E6, E7 |
| 4 | Skill: `quy-hang-ui` (SKILL + catalog), chép `reui`, symlink `.claude/skills` | `.agents/skills/**`, `.claude/skills/quy-hang-ui`, `.claude/skills/reui` | đọc lại; symlink `readlink` | E5, E10 |
| 5 | Kiểm chuẩn + bài thử sàn + cấu hình cổng | `packages/ui-lint/{kiem-chuan.mjs,thu-san.mjs,tests/*}`, `_acceptance/config.yaml` | `node packages/ui-lint/kiem-chuan.mjs`; `node packages/ui-lint/thu-san.mjs`; test hai chiều trong gói | E1, E5, E8, E9, E11 |
| 6 | Tài liệu: Tham chiếu, vỏ và IA, luật giao diện, bản đồ kho | `docs/product/tham-chieu.md`, `docs/design/vo-va-ia.md`, `.claude/rules/giao-dien.md`, `AGENTS.md` | đọc lại | AC-5 |

Kết: `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build` xanh, rồi contract → `implemented`.
