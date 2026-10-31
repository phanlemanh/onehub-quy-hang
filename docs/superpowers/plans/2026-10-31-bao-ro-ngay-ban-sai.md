# Kế hoạch — bao-ro-ngay-ban-sai (hàng 57)

Thiết kế: `docs/superpowers/specs/2026-10-31-bao-ro-ngay-ban-sai-design.md` · hợp đồng:
`_acceptance/bao-ro-ngay-ban-sai/contract.md`.

## Task 1 — Lõi kiểm ngày theo lịch thật

- Files: `packages/core/src/listing/events.ts`, `packages/core/src/listing/ngay-ca.fixture.ts` (mới),
  `packages/core/src/listing/listing.test.ts`
- Việc: xuất hằng lời `NGAY_SAI_DANG` («cần ngày YYYY-MM-DD») và `NGAY_KHONG_CO_THAT` («ngày không có thật»); hàm `ngay`
  tách dạng và lịch, không dùng `Date.parse`. Tệp ca viết tay hai ma trận `NGAY_CO_THAT`, `NGAY_KHONG_CO_THAT_CA`. Hai ca
  kiểm mới, mỗi phần tử một lần so, đếm bằng độ dài ma trận; ca sai dạng ghim lời.
- Verify: `npm test -w @quy-hang/core`; phá thử — đưa `ngay` về `Date.parse` trong bản sao → ca đỏ nêu `2025-02-29`.
- Phục vụ E1, E2. `independent: false`.

## Task 2 — Đo trên Postgres thật và qua API

- Files: `packages/api/test-db/ngay-ban/ngay-ban.test.ts` (mới)
- Việc: ca «Postgres và lõi nhận cùng một tập ngày» (hai vế); ca «chốt bán với ngày không có thật: 400 nêu closeDate,
  không ghi» với đối chứng dương `2024-02-29` đọc lại ở GET và `close_date::text`.
- Verify: `npm run db:migrate && npm run db:test` (Postgres dãy X, 5554); phá thử như Task 1 → ca đỏ với 500 ở
  `2025-02-29` và vế (b) nêu «lõi nhận, Postgres từ chối».
- Phục vụ E3, E4. `independent: false` (nhập tệp ca của Task 1).
