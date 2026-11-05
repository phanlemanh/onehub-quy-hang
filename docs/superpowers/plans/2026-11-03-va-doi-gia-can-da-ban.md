# Kế hoạch — va-doi-gia-can-da-ban

Thiết kế: `docs/superpowers/specs/2026-11-03-va-doi-gia-can-da-ban-design.md`. Ba việc nối tiếp (`independent: false`), chạy ở vòng chính.

| # | Việc | Tệp | Phục vụ | Kiểm |
| --- | --- | --- | --- | --- |
| 1 | Luật lõi `kiemDoiGia` + hằng lý do, xuất qua `@quy-hang/core/listing` | `packages/core/src/listing/doi-gia.ts`, `doi-gia.test.ts`, `index.ts` | E1 | `npm test -w @quy-hang/core` + lượt phá (luôn null) |
| 2 | Mã lỗi `price-locked-closed` 422; `applyCommand` xét luật trước phiên bản | `packages/api/src/errors.ts`, `errors.test.ts`, `listings/store.ts`, `test-db/doi-gia-da-ban/` | E2 | `npm run db:test` + hai lượt phá |
| 3 | Kiểm bộ đồng bộ trên API thật (máy mới, máy cũ, đối chứng) | `apps/web/src/lib/sync/test-db/doi-gia-da-ban.db-test.mts` | E3 | `npm run test:db -w @quy-hang/web` + lượt phá |
