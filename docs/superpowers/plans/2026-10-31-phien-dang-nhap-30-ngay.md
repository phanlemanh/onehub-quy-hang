# Phiên đăng nhập 30 ngày — kế hoạch

Hồ sơ `_acceptance/phien-dang-nhap-30-ngay/` · thiết kế `docs/superpowers/specs/2026-10-31-phien-dang-nhap-30-ngay-design.md` · T2.
Postgres dãy A: `DATABASE_URL=postgres://postgres:quyhang@localhost:5552/postgres`.

## Task 1 — Hằng và cấu hình phiên
- Files: `packages/api/src/auth/constants.ts`, `packages/api/src/auth/auth.ts`, `packages/api/src/auth/session.test.ts` (mới).
- Làm: `SESSION_EXPIRES_SEC = 30 * 86400`, `SESSION_UPDATE_AGE_SEC = 86400`; `createAuth` khai `session: { expiresIn, updateAge }`.
- Verify: `npm test -w @quy-hang/api` — phá thử: đổi hằng → ca đỏ nêu số ghim.
- Phục vụ: E6, E7 · independent: false

## Task 2 — ADR-0005 và Tham chiếu
- Files: `docs/adr/0005-dang-nhap-theo-san.md` (thêm mục), `docs/product/tham-chieu.md` (thêm một dòng §12).
- Verify: `npm test -w @quy-hang/api` (ca E7) · independent: false

## Task 3 — Cookie trượt khi mở trang
- Files: `apps/web/src/lib/session-refresh.ts` (mới), `apps/web/src/proxy.ts`.
- Làm: hỏi `GET /api/v1/auth/get-session` trong tiến trình khi có cookie phiên (hai tên), chép nguyên văn `Set-Cookie`.
- Verify: `npm run typecheck && npm run build -w @quy-hang/web` · Phục vụ: E5 · independent: false

## Task 4 — Ca kiểm trên Postgres
- Files: `packages/api/test-db/session.test.ts` (mới).
- Làm: năm ca theo tên trong `evals.yaml` E1–E5, mỗi ca có đối chứng; phá thử: bỏ `session`, `updateAge` 2 ngày, proxy không chép Set-Cookie.
- Verify: `DATABASE_URL=… npm run db:test` · Phục vụ: E1–E5 · independent: false
