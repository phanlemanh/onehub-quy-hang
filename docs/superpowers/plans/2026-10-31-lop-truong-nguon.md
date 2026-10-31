# Lớp trường nguồn — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chỉ đầu chủ giữ căn và trưởng nhóm thấy chủ nhà, giá đáy; số chủ chỉ ra qua «Mở số» và mỗi lần mở thành một sự kiện.

**Architecture:** Ba bảng mới có luật theo dòng và một hàm `security definer` mở số (migration 006); luật thuần ở
`packages/core/src/access/`; bốn lời gọi ở `packages/api/src/owners/` chạy qua `withCompany` (vai `quy_hang_app`).
Một bảng 12 ô viết tay dùng chung cho kiểm lõi và kiểm cơ sở dữ liệu.

**Tech Stack:** Postgres 16 (RLS, quyền theo cột), TypeScript, Hono + zod-openapi, `node:test` + tsx.

**Spec:** `docs/superpowers/specs/2026-10-31-lop-truong-nguon-design.md` · hợp đồng `_acceptance/lop-truong-nguon/contract.md`
(đã duyệt 31/10, Hỏi-1..3 theo khuyến nghị).

## Global Constraints

- Không sửa migration đã commit; chỉ thêm `packages/db/migrations/006_lop_truong_nguon.sql`.
- Mọi bảng mới: `enable` + `force row level security` theo `app.current_company_id()`; grant tối thiểu cho `quy_hang_app`.
- Không sửa `packages/core/src/data-classes.ts`, `packages/core/src/agreements.ts`, `packages/core/src/listing/**`.
- Tệp dùng chung (`app.ts`, `errors.ts`, `core/package.json`, `tham-chieu.md`, `CONTEXT.md`, `isolation.test.mjs`) chỉ THÊM dòng.
- Dữ liệu mẫu: tên `[Tên]`, số `0900 000 012` (chuẩn hoá `0900000012`), giá đáy `3_200_000_000`.
- Thông điệp từ chối của hàm mở số, ghim nguyên văn: `không có quyền mở số chủ`.
- Mã lỗi mới: `listing-agent-required` (403), `owner-not-set` (404).
- Postgres dãy N: `DATABASE_URL=postgres://postgres:quyhang@localhost:5551/postgres`.

## Review Focus

- Người giữ căn đổi vai (mất Đầu chủ) giữa hai lần gọi → hết thấy ngay, cả ở API lẫn hàm cơ sở dữ liệu (Task 1 ô «Đầu khách giữ căn», Task 3 ca gán lại).
- Mã hàng không phải uuid hay hàng của sàn khác ở mọi lời gọi chủ nhà → 404, không lỗi 500 (Task 3, E9b).
- Hai đầu chủ cùng nhận một hàng chưa có người giữ cùng lúc → đúng một người giữ (khoá theo hàng trong giao dịch; Task 3 ca đồng thời).
- Số viết kiểu `+84 900 000 012` / `0900.000.012` / `84900000012` → cùng một số đã chuẩn hoá (Task 2).
- `GET /listings`, `GET /listings/{id}` của hàng 8 không bao giờ kèm nguồn — quét thân (Task 3, E6).

---

### Task 1: Kho dữ liệu — migration 006 và ca cách ly

**Phục vụ:** E8, E9 (và nền cho E4b–E10) · **independent:** false (Task 3 cần) · **verify:** `DATABASE_URL=… npm run db:migrate && npm run test:isolation -w @quy-hang/db`

**Files:**
- Create: `packages/db/migrations/006_lop_truong_nguon.sql`
- Modify (chỉ thêm ca cuối tệp): `packages/db/tests/isolation.test.mjs`
- Consume: `packages/core/src/access/bang-xem-nguon.json` (Task 2 tạo — làm Task 2 bước 1 trước nếu chạy riêng)

**Interfaces:**
- Produces (SQL):
  - `app.current_user_roles() returns text[]` — vai của người đang làm ở sàn đang làm; rỗng khi không phải thành viên.
  - `app.can_see_source(p_listing uuid) returns boolean` — `'team_lead' = any(roles)` hoặc (người gán mới nhất của hàng = người đang làm và `'listing_agent' = any(roles)`).
  - `listing_agent_assignments(company_id uuid, listing_id uuid, seq int, user_id text, assigned_by text, assigned_at timestamptz default now())`, PK `(company_id, listing_id, seq)`, FK `(company_id, listing_id) → listings(company_id, id)`, FK `(company_id, user_id) → company_members`; select cả sàn; insert khi `assigned_by = app.current_user_id()` và (trưởng nhóm, hoặc tự nhận khi hàng chưa có dòng và người nhận = người gọi có vai Đầu chủ); người nhận phải có vai Đầu chủ (kiểm trong luật insert qua hàm `app.member_has_role(user text, role text)`); chỉ thêm (trigger chặn update/delete/truncate).
  - `listing_owners(company_id, listing_id, owner_name text not null check (length(btrim) between 1 and 200), owner_phone text check (owner_phone ~ '^0[0-9]{9}$'), floor_price bigint check (> 0), updated_by text, updated_at timestamptz)`, PK `(company_id, listing_id)`; select/insert/update `using/with check (company_id = current and app.can_see_source(listing_id))`; `grant select (company_id, listing_id, owner_name, floor_price, updated_by, updated_at), insert, update (owner_name, owner_phone, floor_price, updated_by, updated_at)` — KHÔNG grant select `owner_phone`.
  - `owner_phone_reveals(id bigint generated always as identity, company_id, listing_id, actor_user_id text, actor_roles text[], occurred_at timestamptz default now())`; select khi `actor_user_id = current_user_id()` hoặc trưởng nhóm; insert policy cho chủ bảng (hàm) nhưng KHÔNG grant insert cho `quy_hang_app`; chỉ thêm.
  - `app.reveal_owner_phone(p_listing uuid) returns text` — `security definer`, `set search_path = ''`; không `can_see_source` hoặc hàng không ở sàn → `raise exception 'không có quyền mở số chủ' using errcode = '42501'`; chưa có số → `raise exception 'chưa có số chủ' using errcode = 'P0002'`; còn lại insert một dòng reveal rồi trả số. Grant execute cho `quy_hang_app`.
  - `alter table listing_events add constraint listing_events_no_source check (not (payload ?| array['ownerName','ownerPhone','floorPrice','titleDeedPhoto']))`.
  - `alter table listings add constraint listings_company_id_unique` đã có (004) — dùng lại.

- [ ] **Step 1:** Viết các ca mới ở cuối `isolation.test.mjs` (đỏ trước): «lớp nguồn: ba bảng mới nằm trong phép kiểm luật theo dòng» (deepEqual `[listing_agent_assignments, listing_owners, owner_phone_reveals]` đều `ep: true`); «lớp nguồn ở cơ sở dữ liệu: bảng 12 ô của AC-2 dưới vai quy_hang_app» (nạp `bang-xem-nguon.json`, mỗi ô dựng người có `roles` của ô, dòng gán khi `giu: true`, rồi theo kết quả ô: `can_see_source`, select/update/insert `listing_owners`, `reveal_owner_phone` khớp `/không có quyền mở số chủ/` và đếm không đổi; ô thấy: select `owner_name` 1 dòng, select `owner_phone` khớp `/permission denied/`; `assert.equal(soO, 12)`); «sự kiện mở số và bảng gán chỉ thêm»; «sự kiện của hàng mang khoá nguồn bị ràng buộc từ chối» (đỏ `/listing_events_no_source/`, đối chứng `{}`); «lớp nguồn: sàn A không đọc, không ghi … của sàn B» (đối chứng A, rồi B: 0 dòng, 0 dòng, `/row-level security/`, `/không có quyền mở số chủ/`, đếm B không đổi). Dựng dữ liệu bằng kết nối chủ trong giao dịch rồi `set local role quy_hang_app`, như `asRole`.
- [ ] **Step 2:** Chạy `npm run test:isolation -w @quy-hang/db` → các ca mới ĐỎ (bảng chưa có).
- [ ] **Step 3:** Viết `006_lop_truong_nguon.sql` theo Interfaces.
- [ ] **Step 4:** `npm run db:migrate && npm run test:isolation -w @quy-hang/db` → mọi ca ok, gồm phép kiểm chung «mọi bảng dữ liệu đều bật và ép luật theo dòng».
- [ ] **Step 5 (phá-thử):** trong bản sao tạm của migration, grant select `owner_phone` → ca cột số đỏ «permission denied» không xảy ra; bỏ `and 'listing_agent' = any(roles)` → ô «Đầu khách giữ căn» đỏ nêu ô. Hoàn lại, xanh lại.
- [ ] **Step 6:** Commit `feat(db): lớp nguồn — bảng chủ nhà, gán đầu chủ, sự kiện mở số (006)`.

### Task 2: Lõi `packages/core/src/access/`

**Phục vụ:** E1, E2, E3, E4 · **independent:** true · **verify:** `npm test -w @quy-hang/core`

**Files:**
- Create: `packages/core/src/access/index.ts`, `owner-fields.ts`, `can-see-source.ts`, `owner-view.ts`, `owner-input.ts`, `bang-xem-nguon.json`, `access.test.ts`
- Modify (thêm một dòng): `packages/core/package.json` exports `"./access": "./src/access/index.ts"`

**Interfaces:**
- Produces:
  - `OWNER_FIELDS: Readonly<Record<"ownerName"|"ownerPhone"|"floorPrice", DataClass>>` (cả ba `"source"`); `checkOwnerFields(fields: Record<string, DataClass>): string[]` — lỗi mỗi trường khác `source`, khác trần `never_leaves_company`, hay ngoài `SOURCE_KEYS`.
  - `type Viewer = { userId: string; roles: readonly string[] }`; `canSeeSource(viewer: Viewer, listingAgentUserId: string | null): boolean`.
  - `type OwnerRecord = { listingAgentUserId: string | null; ownerName: string; floorPrice: number | null; hasPhone: boolean }`; `type OwnerView = { visible: true; ownerName: string; floorPrice: number | null; hasPhone: boolean } | { visible: false; listingAgentUserId: string | null }`; `ownerView(rec: OwnerRecord, viewer: Viewer): OwnerView`.
  - `findSourceLeaks(value: unknown, samples?: readonly string[]): string[]` — đường khoá của mọi khoá thuộc `SOURCE_KEYS` ở mọi cấp, và đường của mọi chuỗi chứa một mẫu.
  - `validateOwnerInput(payload: unknown): { ok: true; value: { ownerName: string; ownerPhone?: string; floorPrice?: number } } | { ok: false; errors: PayloadError[] }` — khoá cho phép đúng ba; `ownerName` bắt buộc, 1–200 ký tự; số: bỏ dấu cách/chấm/gạch, `+84`/`84` → `0`, phải khớp `^0\d{9}$`; giá đáy `Number.isSafeInteger && > 0`. Dùng `PayloadError` của `@quy-hang/core/listing`.
  - `bang-xem-nguon.json`: `[{ "vai": ["listing_agent"], "giu": true, "thay": true }, …]` — đúng 12 ô của bảng AC-2.

- [ ] **Step 1:** Viết `bang-xem-nguon.json` (12 ô, chép tay từ bảng AC-2 của hợp đồng) và `access.test.ts` với các ca có tên đúng như `expected` của E1–E4 (deepEqual, đếm `soLanSo === 12`, đối chứng dương `findSourceLeaks({a:{ownerPhone:'0900000012'}})` → `['a.ownerPhone']`, bảng ca sai khuôn nêu đường khoá).
- [ ] **Step 2:** `npm test -w @quy-hang/core` → ĐỎ (module chưa có).
- [ ] **Step 3:** Viết các tệp theo Interfaces; thêm lối con vào `package.json`.
- [ ] **Step 4:** `npm test -w @quy-hang/core && npm run typecheck` → xanh.
- [ ] **Step 5 (phá-thử):** cho `company_admin` thấy → ca ma trận đỏ nêu ô; thêm `phoneLast2` vào bản thấy → ca E3 đỏ. Hoàn lại.
- [ ] **Step 6:** Commit `feat(core): luật xem lớp nguồn — trường, ai thấy, bản trả, khuôn chủ nhà`.

### Task 3: API `packages/api/src/owners/` và ca HTTP trên Postgres thật

**Phục vụ:** E4b, E5, E6, E7, E9b, E10 · **independent:** false (cần Task 1, 2) · **verify:** `DATABASE_URL=… npm run db:test`

**Files:**
- Create: `packages/api/src/owners/routes.ts`, `packages/api/src/owners/store.ts`, `packages/api/test-db/owners.test.ts`
- Modify (chỉ thêm dòng): `packages/api/src/app.ts` (import + `registerOwnerRoutes(api, deps)`), `packages/api/src/errors.ts` (`listingAgentRequired`, `ownerNotSet`)

**Interfaces:**
- Consumes: Task 2 `canSeeSource`, `ownerView`, `validateOwnerInput`; Task 1 bảng và hàm.
- Produces: `registerOwnerRoutes(api: OpenAPIHono, deps: ApiDeps): void`; bốn lời gọi:
  - `GET /api/v1/listings/{listingId}/owner` → 200 `OwnerView`. Người không thấy nguồn luôn nhận `{visible:false, listingAgentUserId}` (đọc từ dòng gán mới nhất, `null` khi chưa ai giữ). Người thấy nguồn mà hàng chưa có chủ nhà → 404 `owner-not-set`.
  - `PUT /api/v1/listings/{listingId}/owner` body `{ownerName, ownerPhone?, floorPrice?}` → 200 `OwnerView`; khoá theo hàng (`select … from listings where id=$1 for update`); chưa có người giữ: người gọi có `listing_agent` → thêm dòng gán seq 1 rồi upsert chủ nhà, không có → 403 `listing-agent-required`; đã có người giữ: `canSeeSource` sai → 403 `listing-agent-required`.
  - `POST /api/v1/listings/{listingId}/owner/phone-reveal` → 200 `{ ownerPhone }`; lỗi `42501` → 403 `listing-agent-required`; `P0002` → 404 `owner-not-set`.
  - `PUT /api/v1/listings/{listingId}/listing-agent` body `{userId}` → 200 `{listingAgentUserId}`; người gọi không có `team_lead` → 403 `listing-agent-required`; người nhận không phải thành viên có `listing_agent` → 400 `invalid-payload`.
  - Mọi lời gọi: mã hàng không phải uuid hay không thấy hàng ở sàn đang làm → 404 `not-found`.
- [ ] **Step 1:** Viết `owners.test.ts` (đỏ): dựng sàn A, B bằng `openCompany`; tạo người bằng `createLoneUser` rồi `insert into company_members (company_id, user_id, roles)` bằng `appPool`; đăng nhập bằng mã như `listings.test.ts`. Các ca mang đúng tên trong `expected` của E4b, E5, E6, E7, E9b, E10, cộng ca «hai đầu chủ nhận cùng lúc: đúng một người giữ» (Review Focus). E6 dùng `findSourceLeaks` với mẫu `['[Tên chủ mẫu]','0900000012','0900 000 012','+84900000012','3200000000']`, đếm đúng 12 thân. Đếm dòng bằng `appPool` (kết nối chủ).
- [ ] **Step 2:** `npm run db:test` → ca mới ĐỎ (404 vì route chưa có).
- [ ] **Step 3:** Viết `store.ts` (truy vấn trong `withCompany`, đọc vai từ `company_members`, gọi `app.reveal_owner_phone`) và `routes.ts` (khuôn như `listings/routes.ts`); thêm hai mã lỗi và dòng đăng ký.
- [ ] **Step 4:** `npm run db:test && npm test -w @quy-hang/api && npm run typecheck && npm run lint` → xanh.
- [ ] **Step 5 (phá-thử):** để `GET owner` trả thêm `ownerPhone` → E5/E6 đỏ nêu đường khoá; bỏ kiểm `team_lead` ở gán → E10 đỏ. Hoàn lại.
- [ ] **Step 6:** Commit `feat(api): lời gọi chủ nhà — xem, ghi, mở số, bàn giao đầu chủ`.

### Task 4: Tài liệu — ADR 0010, Tham chiếu, từ vựng

**Phục vụ:** luật đợt 6 (sửa điều đang đúng cùng PR) · **independent:** true · **verify:** `npm run lint` (không đổi), đọc lại

**Files:**
- Create: `docs/adr/0010-lop-truong-nguon.md` (bối cảnh, quyết định — bảng 12 ô, cửa mở số, bảng gán chỉ thêm, Hỏi-1..3 —, ngoài quyết định, hệ quả: hàng mã hoá trước dữ liệu thật)
- Modify (chỉ thêm): `docs/product/tham-chieu.md` §12 một dòng 31/10; `CONTEXT.md` hai dòng cuối bảng: «Chủ nhà của hàng | `listing_owner` | …», «Mở số chủ | `owner_phone_reveal` | …»

- [ ] **Step 1:** Viết ADR và hai dòng thêm.
- [ ] **Step 2:** Commit `docs: ADR-0010 lớp trường nguồn, sổ quyết định, từ vựng`.
