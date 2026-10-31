# Trục ai thấy hàng — kế hoạch

Hồ sơ `_acceptance/truc-ai-thay-hang/` · thiết kế `docs/superpowers/specs/2026-10-31-truc-ai-thay-hang-design.md` · T3.
Postgres dãy A: `DATABASE_URL=postgres://postgres:quyhang@localhost:5552/postgres`.

## Task 1 — Luật trục ở lõi

- Files: `packages/core/src/visibility/index.ts` (mới), `packages/core/src/visibility/visibility.test.ts` (mới),
  `packages/core/package.json` (thêm export `./visibility`).
- Làm: `VISIBILITY_LEVELS = ["Private", "Company"]`; `VisibilityFacts = { creatorUserId, statusesReached }`;
  `factsFromEvents(events)`; `visibilityOf(facts)` — `Company` khi `statusesReached` có `Active`; `canRead(viewerUserId,
  facts)` — người tạo luôn đọc, người khác chỉ ở `Company`; không nhận vai.
- Kiểm: bảng dãy sự kiện viết tay (AC-1), ma trận bốn ô + ca vai (AC-2); lượt phá-thử: đổi luật thành «đang Active» thì
  ca Active→Hold đỏ, cho vai qua thì ca vai đỏ.
- Verify: `npm test -w @quy-hang/core && npm run typecheck -w @quy-hang/core`
- Phục vụ: E1, E2 · independent: true

## Task 2 — Áp trục trên bốn đường API hàng

- Files: `packages/api/src/listings/store.ts`, `packages/api/src/listings/routes.ts`.
- Làm: `loadFacts(tx, listingId)` và câu SQL danh sách gom `creatorUserId` (actor của `seq = 1`) cùng mảng `to` của các
  `status_changed` — không chứa tên trạng thái nào; `GET /listings` lọc bằng `canRead`, kèm `visibility`;
  `GET /listings/{id}` và `POST /listings/{id}/events` trả 404 khi không đọc được — lệnh xét quyền đọc NGAY sau khi khoá
  hàng, trước phiên bản và khuôn payload; `POST /listings` trả kèm `visibility`.
- Verify: `npm run typecheck -w @quy-hang/api && npm test -w @quy-hang/api`
- Phục vụ: E3–E9 · independent: false (cần Task 1)

## Task 3 — Ca kiểm API trên Postgres

- Files: `packages/api/test-db/visibility.test.ts` (mới).
- Làm: hai sàn, mời thành viên qua `POST /api/v1/company/members` (vai `listing_agent`, `team_lead`); bảy ca theo đúng
  tên trong `evals.yaml` E3–E9, mỗi ca có đối chứng dương; lượt phá-thử trên bản sao: bỏ lọc ở danh sách, bỏ chặn ở đọc
  một, chặn lệnh sau bước phiên bản — ca tương ứng đỏ với thông điệp ghim.
- Verify: `DATABASE_URL=… npm run db:test`
- Phục vụ: E3–E9 · independent: false (cần Task 2)

## Task 4 — Tham chiếu

- Files: `docs/product/tham-chieu.md` — thêm một dòng sổ quyết định 31/10 (chỉ thêm dòng, luật 12 của đợt).
- Verify: `npm run lint`
- Phục vụ: — · independent: true
