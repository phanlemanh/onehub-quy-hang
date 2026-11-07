# Kế hoạch — doi-nhan-so-phien-ban

Hợp đồng: `_acceptance/doi-nhan-so-phien-ban/contract.md` (T2, trạng thái V). Thiết kế:
`docs/superpowers/specs/2026-11-07-doi-nhan-so-phien-ban-design.md`.

## Task 1 — Luật thắng ngay ở lõi

- Files: `packages/core/src/listing/thang-ngay.ts`, `packages/core/src/listing/index.ts`,
  `packages/core/src/listing/thang-ngay.test.ts`
- Việc: `thangNgay(to, goc, hienTai)`, `trangThaiGoc(events, expectedVersion)`, `suKienThangNgay(events, e)`; bộ kiểm AC-1
  (bảng viết tay theo nhóm, 252 bộ, chín ca có tên, bốn phá thử) và AC-2 (dãy bảy sự kiện thật).
- Verify: `npm test -w @quy-hang/core`.
- Phục vụ: E1, E2. independent: false.

## Task 2 — Máy chủ dùng luật lõi

- Files: `packages/api/src/listings/store.ts`, `packages/api/test-db/doi-nhan-so-phien-ban/doi-nhan.test.ts`
- Việc: thay phép `WINS_IMMEDIATELY.includes(to)` bằng `thangNgay(…)`; bộ kiểm API AC-3, AC-4, AC-5 trên Postgres dãy X.
- Verify: `npm run typecheck && npm run db:migrate && npm run db:test` (Postgres dãy X qua `.env.local`).
- Phục vụ: E3, E4, E5, E7. independent: false (cần Task 1).

## Task 3 — Bộ đồng bộ nhận ra thắng ngay bằng luật lõi

- Files: `apps/web/src/lib/sync/gui.ts`, `apps/web/src/lib/sync/test-db/doi-nhan-so-phien-ban.db-test.mts`
- Việc: `doiChieu` tìm sự kiện thắng bằng `suKienThangNgay`; bộ kiểm AC-6.
- Verify: `npm run test:db -w @quy-hang/web`, `npm test -w @quy-hang/web`.
- Phục vụ: E6, E7b. independent: false (cần Task 1, 2).
