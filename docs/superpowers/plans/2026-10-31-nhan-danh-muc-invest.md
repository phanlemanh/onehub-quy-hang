# Nhận danh mục Invest — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Gói danh mục theo khuôn v1 vào vùng danh mục dùng chung qua `POST /api/v1/catalog/feeds`, chỉ khi sàn được nền
tin có thoả thuận `catalog_source` chiều vào đang hiệu lực; gói sai hay thoả thuận không hiệu lực thì không một dòng nào.

**Architecture:** Lõi thoả thuận nhận loại và chiều mong đợi (Hỏi-4). Khuôn v1 ở `packages/connect` gọi bảng loại hình của
lõi (Hỏi-5). Migration 010 dựng ba bảng dùng chung có luật theo dòng chặn ghi ở cơ sở dữ liệu. Đường nhận ở
`packages/api/src/catalog/feeds.ts` kiểm khuôn → thoả thuận → ghi một giao dịch dưới `withCompany`.

**Tech Stack:** TypeScript, zod `.strict()`, Hono + `@hono/zod-openapi`, Postgres 16 + RLS, `node:test`.

**Spec:** `docs/superpowers/specs/2026-10-31-nhan-danh-muc-invest-design.md` · hợp đồng
`_acceptance/nhan-danh-muc-invest/contract.md` (AC-1…AC-10) · `evals.yaml` (E1…E11).

## Global Constraints

- Khuôn `.strict()` ở mọi cấp; `CATALOG_FEED_SCHEMA_VERSION = 1`; bỏ v0.
- Tên trường RESO như lõi sau hàng 72: `subdivisionKey`, `subdivisionName`, `complexName`, `buildingKey`, `buildingName`,
  `unitNumber`, `upi`, `stack`, `floor`, `livingArea`, `bedroomsTotal`, `directionFaces`, `propertyType`,
  `propertySubType`, `lotSizeArea?`, `storiesTotal?`, `frontageLength?`, `accessRoadWidth?`.
- Migration số **010** (`010_danh_muc_dung_chung.sql`), ADR **0015** (`docs/adr/0015-khuon-danh-muc-v1.md`) — giữ chỗ.
- Chạm tệp đã được giám sát cho (D-11): `packages/core/src/agreements.ts` — chỉ thêm tham số có mặc định, mọi lời gọi cũ
  giữ hành vi, có ca kiểm chứng; `package-lock.json` — gộp `origin/main` mới nhất rồi `npm install` một lần;
  `packages/connect/package.json`. Lõi KHÔNG phụ thuộc ngược connect.
- Không con số mặc định của sàn nào; trần nào phát sinh → hằng có tên trong lõi, chú thích «mặc định của sàn».
- Dữ liệu thử: nhãn `[Mẫu]`, UPI `urn:onehub:upi:thu:…`; không tên, số thật.
- Postgres dãy D cổng 5565: `DATABASE_URL=postgres://postgres:quyhang@localhost:5565/postgres`.
- Mã lỗi mới ở `packages/api/src/errors.ts`: `agreementInactive { code: "agreement-inactive", status: 403 }`,
  `invalidFeed { code: "invalid-feed", status: 422 }`.

## Review Focus

1. Gói rỗng (`subdivisions: []`) — nhận 200 với mọi số đếm 0, không lỗi (Task 4 thêm ca).
2. Hai khu cùng `subdivisionKey` trong một gói — lỗi khuôn nêu khoá trùng, không để upsert lần hai đè lần một (Task 2).
3. Căn đổi khu giữa hai gói (cùng UPI, khu khác) — cập nhật `subdivision_key`, đếm là updated (Task 4, trong ca E5).
4. Sàn được tin có hai thoả thuận `catalog_source`, một tạm dừng một đang bật — nhận bằng thoả thuận đang bật (Task 4).
5. Thân gói không phải JSON hay không phải object — 422 `invalid-feed`, không 500 (Task 4).

---

### Task 1: Lõi thoả thuận nhận loại và chiều mong đợi — independent: true

**Files:** Modify `packages/core/src/agreements.ts` · Test `packages/core/src/agreements.test.ts`
**Phục vụ:** E6, E8 (điều kiện loại), E10 (hồi quy lõi).

**Interfaces — Produces:** `FlowContext` thêm `kind?: ConnectionKind` và `direction?: Direction`. `mayFlow(agreement,
dataClass, ctx)` — khi `ctx.kind` có mặt mà khác `agreement.kind` → `{ ok: false, reason: "Thoả thuận không đúng loại kết
nối." }`; khi `ctx.direction` có mặt mà khác → `{ ok: false, reason: "Thoả thuận không đúng chiều." }`. Kiểm hai điều này
ngay sau trần lớp `source`, trước kiểm trạng thái.

- [ ] Ca «mayFlow: loại và chiều mong đợi» — `lead_source` inbound active có `catalog` với `{ kind: "catalog_source" }` →
  ok false; `catalog_source` outbound với `{ direction: "inbound" }` → ok false; `catalog_source` inbound với cả hai → ok
  true (đối chứng dương).
- [ ] Ca «mayFlow: lời gọi cũ không truyền loại giữ nguyên hành vi» — `lead_source` inbound có `catalog`, ctx chỉ `{ at }`
  → ok true (như trước).
- [ ] Chạy `npm test -w @quy-hang/core` thấy hai ca đỏ; thêm hai trường; chạy lại xanh, mọi ca cũ xanh.
- [ ] Phá thử: bỏ kiểm `kind` → ca thứ nhất đỏ nêu «không đúng loại»; khôi phục.
- [ ] Commit `feat(core): mayFlow nhận loại và chiều mong đợi`.

### Task 2: Khuôn v1 mang luật loại hình — independent: true

**Files:** Modify `packages/connect/src/catalog-feed.ts`, `packages/connect/package.json`, `package-lock.json` · Test
`packages/connect/src/catalog-feed.test.ts` (thay ca v0).
**Phục vụ:** E1, E2, E3.

**Interfaces — Produces:** `CATALOG_FEED_SCHEMA_VERSION = 1`; `CatalogFeed` (zod) và type `CatalogFeed`;
`parseCatalogFeed(raw: unknown): { ok: true; feed: CatalogFeed } | { ok: false; errors: { path: (string|number)[];
message: string }[] }`. Hình feed khớp `CatalogData` của lõi cộng `schemaVersion`, `provider`, `measuredAt`.
**Consumes:** `unitFieldErrors` từ `@quy-hang/core`.

- [ ] `git fetch && git merge origin/main`; thêm `"@quy-hang/core": "*"` vào dependencies của connect; `npm install` một
  lần; kiểm `git diff package-lock.json` chỉ đổi mục `packages/connect`.
- [ ] Ca E1 «khuôn v1: gói mẫu đúng khuôn đọc ra đủ khu, toà, căn» (2 khu, 3 toà, một căn hộ đủ chín trường, một nhà phố
  `Townhouse` đủ bốn trường thấp tầng khác null, khác nhau; đếm và deepEqual; version === 1; cùng gói `schemaVersion: 0` bị
  từ chối).
- [ ] Ca E1 «khuôn v1: dữ liệu mẫu của lõi đổi sang khuôn rồi đọc lại» — đọc `packages/db/seed/mau/du-lieu-mau.json` theo
  đường suy từ `import.meta.url`, bọc `{ schemaVersion: 1, provider: "[Mẫu]", measuredAt, subdivisions }` → ok true; tập
  khoá từng cấp bằng bản lõi.
- [ ] Ca E1 «khuôn v1: luật loại hình nằm trong khuôn» — ma trận 3 phần tử (`Residential/Land`, căn hộ mang
  `lotSizeArea`, nhà phố mang `stack`), số lần so 3; mỗi phần tử đúng một lỗi, path tới căn, message nêu trường; đối
  chứng dương.
- [ ] Ca E2 «khuôn v1: khoá lạ ở từng cấp bị từ chối, nêu đúng đường khoá» — 4 phần tử (`extra`, `ownerName`, `note`,
  `ownerPhone`), path viết trước.
- [ ] Ca E3 «khuôn v1: phiên bản sai và UPI trùng bị từ chối» — 0, 2, vắng → path `['schemaVersion']`; UPI trùng ở hai toà
  → lỗi nêu UPI; khu trùng `subdivisionKey` → lỗi nêu khoá (Review Focus 2); đối chứng.
- [ ] Chạy `npm test -w @quy-hang/connect` đỏ; dựng khuôn: `superRefine` ở gốc gom UPI trùng, khoá khu trùng, và
  `unitFieldErrors(unit)` của mỗi căn thành issue với path `['subdivisions',i,'buildings',j,'units',k, field]`;
  `parseCatalogFeed` dùng `safeParse` và trả `errors` theo `issue.path`/`issue.message`. Chạy lại xanh.
- [ ] Phá thử: bỏ `.strict()` cấp căn → phần tử `ownerPhone` đỏ; bỏ kiểm UPI trùng → ca E3 đỏ nêu UPI; khôi phục.
- [ ] `npm run typecheck` xanh (lõi không import connect). Commit `feat(connect): khuôn danh mục v1`.

### Task 3: Vùng danh mục dùng chung (migration 010) — independent: true

**Files:** Create `packages/db/migrations/010_danh_muc_dung_chung.sql` (dùng skill `/new-migration`) · Test
`packages/db/tests/danh-muc-dung-chung.test.mjs`.
**Phục vụ:** E8, E11 (và ca quét chung của `isolation.test.mjs`).

**Interfaces — Produces:**
- `catalog_subdivisions (subdivision_key text pk, subdivision_name text not null, complex_name text, provider text not
  null, measured_at timestamptz not null, agreement_id uuid not null references agreements(id), updated_at timestamptz
  not null default now())`.
- `catalog_units (upi text pk, subdivision_key text not null references catalog_subdivisions, building_key text not null,
  building_name text not null, unit_number text not null, stack text, floor int, living_area numeric, bedrooms_total int,
  direction_faces text, property_type text not null, property_sub_type text not null, lot_size_area numeric,
  stories_total int, frontage_length numeric, access_road_width numeric, provider text not null, measured_at timestamptz
  not null, agreement_id uuid not null references agreements(id), updated_at timestamptz not null default now())`.
- `catalog_trusted_companies (company_id uuid pk references companies(id))`.
- `app.catalog_source_active(agreement_id uuid) returns boolean` (security invoker, stable): công ty đang đặt có trong
  danh sách tin VÀ tồn tại thoả thuận `id = $1`, `company_id = app.current_company_id()`, `kind = 'catalog_source'`,
  `direction = 'inbound'`, `status = 'active'`, `valid_from <= now()`, `valid_until is null or now() < valid_until`,
  `'catalog' = any(data_classes)`.
- Luật: cả ba bảng `enable` + `force row level security`. Hai bảng danh mục: select `using (true)`; insert `with check
  (app.catalog_source_active(agreement_id))`; update `using (true) with check (app.catalog_source_active(agreement_id))`;
  grant `select, insert, update` cho `quy_hang_app`, không delete. Danh sách tin: select `using (true)`, grant `select`.

- [ ] Ca «danh mục dùng chung: thoả thuận không hợp lệ thì không ghi được» — 9 phần tử (không có, paused, ended,
  valid_until qua, valid_from chưa tới, thiếu `catalog`, `lead_source`, outbound, thoả thuận hợp lệ của công ty được tin
  khác); insert và update bằng `quy_hang_app` → SQLSTATE `42501`; số lần so 9; đối chứng dương cùng dữ liệu.
- [ ] Ca «danh mục dùng chung: sàn tự tạo thoả thuận mà không được tin không ghi được».
- [ ] Ca «danh mục dùng chung: không ai tự thêm mình vào danh sách tin» (42501).
- [ ] Ca «danh mục dùng chung: không ai xoá được» (42501 hoặc 0 dòng, dòng còn).
- [ ] Ca «danh mục dùng chung: mọi sàn và lời gọi chưa đặt sàn đọc được».
- [ ] Ca «danh mục dùng chung: ba bảng bật và ép luật theo dòng» (pg_class, số bảng 3).
- [ ] Ca E11 «danh mục dùng chung: tập cột đúng danh sách viết trước» (information_schema, danh sách viết tay; không tên
  khớp `owner|phone|price|photo`).
- [ ] Chạy `npm run db:migrate && npm run test:isolation -w @quy-hang/db` đỏ; viết migration; chạy lại xanh, ca quét chung
  của `isolation.test.mjs` xanh.
- [ ] Phá thử: `with check (true)` → ca đầu đỏ; bỏ điều kiện `kind` → phần tử `lead_source` đỏ; khôi phục.
- [ ] Commit `feat(db): vùng danh mục dùng chung (010)`.

### Task 4: Cửa nhận `POST /api/v1/catalog/feeds` — independent: false (sau Task 1, 2, 3)

**Files:** Create `packages/api/src/catalog/feeds.ts` · Modify `packages/api/src/errors.ts`, `packages/api/src/app.ts`
(đăng ký `registerFeedRoutes`) · Test `packages/api/test-db/catalog/nhan-goi.test.ts`.
**Phục vụ:** E4, E5, E6, E7, E9.

**Interfaces — Consumes:** Task 1 `mayFlow(..., { at, kind: "catalog_source", direction: "inbound" })`; Task 2
`parseCatalogFeed`; Task 3 bảng và hàm. **Produces:** `registerFeedRoutes(api: OpenAPIHono, deps: ApiDeps, hooks?: {
truocKhiGhi?: () => Promise<void> })` — móc chỉ cho tệp kiểm. Thân 200: `{ subdivisions: number, buildings: number,
units: number, created: number, updated: number }`.

Luồng: phiên → sàn (401/403 như `thanh-vien.ts`) → `app.current_user_is_admin()` (403 `admin-required`) →
`parseCatalogFeed` (422 `{ error: "invalid-feed", errors }`) → trong `withCompany`: `select now()`, đọc thoả thuận của
sàn, chọn cái đầu tiên `mayFlow` ok; không có hoặc sàn không có trong `catalog_trusted_companies` → 403
`agreement-inactive`; `await hooks?.truocKhiGhi?.()`; upsert khu rồi căn (`on conflict ... do update`), đếm created/updated
bằng `(xmax = 0)` của `returning`; lỗi `42501` → 403 `agreement-inactive`.

- [ ] Ca E4 «nhận gói: thoả thuận đang bật, gói đúng khuôn vào vùng dùng chung» (chủ bảng thêm sàn vào danh sách tin;
  so mọi cột theo UPI, căn hộ + nhà phố đủ bốn trường).
- [ ] Ca E5 «nhận gói: gửi lại không nhân đôi, đổi một căn thì cập nhật đúng căn ấy» (khoá thân viết trước; created/updated
  1/0; căn đổi khu đếm updated — Review Focus 3).
- [ ] Ca E6 «nhận gói: thoả thuận không đang bật thì 403 và không ghi dòng nào» (9 phần tử + phần tử giữa giao dịch qua
  `truocKhiGhi` đổi status bằng kết nối chủ bảng; đếm hai bảng; bật lại 200; hai thoả thuận một dừng một bật → 200 —
  Review Focus 4).
- [ ] Ca E7 «nhận gói: gói sai khuôn thì 422 và không ghi dòng nào» (khoá lạ căn cuối, v0, `Residential/Land`, căn hộ có
  `lotSizeArea`, thân không phải object — Review Focus 5; đếm hai bảng).
- [ ] Ca E9 «nhận gói: cổng vào 401/403 và OpenAPI»; ca gói rỗng → 200 số đếm 0 (Review Focus 1).
- [ ] Chạy `npm run db:migrate && npm run test:db -w @quy-hang/api` đỏ; dựng đường; chạy lại xanh.
- [ ] Phá thử: chỉ kiểm status → phần tử hết hạn đỏ; bỏ `kind` khỏi ctx → phần tử `lead_source` đỏ; khôi phục.
- [ ] Commit `feat(api): cửa nhận danh mục`.

### Task 5: ADR-0015 và Tham chiếu — independent: false (sau Task 2–4)

**Files:** Create `docs/adr/0015-khuon-danh-muc-v1.md` · Modify `docs/product/tham-chieu.md` (mục Danh mục; §12 một dòng
1/11) · `CONTEXT.md` chỉ khi cần nhãn mới (vùng danh mục dùng chung).

- [ ] ADR ghi: v0 → v1 và vì sao; hình khuôn = `CatalogData` của lõi; luật loại hình nằm trong khuôn; luật nhận ngoài khuôn
  chỉ là thoả thuận `catalog_source` inbound và danh sách tin; khoá máy và gói cũ hơn để sau.
- [ ] Commit `docs: ADR-0015 khuôn danh mục v1`.

### Task 6: Hồi quy toàn kho

- [ ] `npm run typecheck && npm run lint && npm test && npm run test:hooks` xanh; `npm run db:migrate && npm run db:test`
  xanh (E9, E10: ca hàng 9, 63, 72 có mặt và ok).
