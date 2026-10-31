# Chia lead và hạn (hàng 25) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Lead không trùng tự về người theo cách chia mà sàn chọn trong thực đơn năm cách, hạn nhận và hạn gọi theo cấu hình của sàn, quá hạn có lời báo trong app — đo bằng 12 tiêu chí của `_acceptance/chia-lead-va-han/contract.md`.

**Architecture:** Lõi thuần (`packages/core/src/routing`) giữ thực đơn, mặc định của sàn, luật chọn người và xét hạn. Cơ sở dữ liệu (migration 011) chở dữ kiện qua hàm security definer lọc theo sàn đang làm, cấu hình ở bảng `company_settings`. API có lối cấu hình, lối việc của đầu chủ và trưởng nhóm, và một lối việc nền gọi mỗi phút chạy `runLeadTick` cho từng sàn.

**Tech Stack:** TypeScript chặt, Hono + `@hono/zod-openapi`, `pg`, Postgres 16, `node:test` qua `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-31-chia-lead-va-han-design.md` · hợp đồng `_acceptance/chia-lead-va-han/contract.md` · evals `_acceptance/chia-lead-va-han/evals.yaml`

## Global Constraints

- Mặc định của sàn khai một chỗ: `DEFAULT_LEAD_ROUTING` ở lõi; SQL và lối API không chép 15, 30 hay `zone_round_robin` (luật thường trực G-3110-26).
- Schema chỉ đổi bằng migration mới; 011 đứng sau 008 và 009 của hàng 62 — phần cơ sở dữ liệu chỉ dựng sau khi 62 gộp vào `main`.
- Mọi bảng mới: `company_id`, `enable` + `force row level security` theo `app.current_company_id()`, grant cho `quy_hang_app`, ca trong `packages/db/tests/isolation.test.mjs` cùng PR.
- Không hàm nào đọc hay nhận số chủ dạng chữ; lead cùng số so bằng `owner_phone_hash`.
- Không sửa `packages/api/src/leads/**` và thân `app.lead_dedupe_facts`; người nhận ghi vào `matched_agent_user_id`.
- Dữ liệu thử chỉ từ bộ mẫu hàng 5 và số `0900 000 0xx`; không tên, số thật.
- `JOB_SECRET`: chỉ khai tên ở `.env.example`; giá trị do chủ kho đặt ở Vercel và Supabase.
- Postgres dãy L cổng 5563 (`quy-hang-db-L`): `DATABASE_URL=postgres://postgres:quyhang@localhost:5563/postgres`.
- Nhãn chữ theo `CONTEXT.md`; code, API, tên bảng tiếng Anh; comment nghiệp vụ tiếng Việt.
- Mỗi phép đo mới đi kèm cặp hai chiều trên cùng fixture: lành → xanh, phá → đỏ với tên ca (đúng «Chiều đỏ» ghi trong từng eval).

## Review Focus

1. Một sàn có dòng cấu hình hỏng (ghi tay ngoài API) — nhịp của sàn ấy dừng, các sàn khác vẫn chia và báo; thân kết quả nhịp đếm số sàn lỗi. Test ở Task 3.
2. Hai đầu chủ cùng bấm nhận một lead kho chung cùng lúc — đúng một 200, một 409, lead một người nhận. Test ở Task 4.
3. Hai quản trị đổi một phần cấu hình cùng lúc (một đổi hạn nhận, một đổi hạn gọi) — trạng thái cuối vẫn hạn gọi ≥ hạn nhận. Test ở Task 4.
4. Nhịp chạy khi không sàn nào có việc — 200, routed 0, alerts 0, không lỗi. Test ở Task 3.
5. Lead nhập giữa lúc nhịp đang chạy — không bị chia khi chưa đóng dấu, nhịp sau đóng dấu và chia; không lead nào bị chia mà thiếu dấu. Test ở Task 3 (ràng buộc cơ sở dữ liệu ở Task 2 bảo đảm).

---

### Task 0: Chờ hàng 62 gộp, gộp nhánh chính

**Files:** không tệp mã. **Phục vụ:** điều kiện trước của mọi task cơ sở dữ liệu. **independent:** false.

- [ ] **Step 1:** Chờ `git grep owner_phone_hash origin/main -- 'packages/db/migrations/009*'` có kết quả.
- [ ] **Step 2:** Gộp `origin/main` vào nhánh `claude/dcdv-l-25-chia-lead` bằng git (driver `tep-sinh` giữ `PRODUCT-MAP.md`, `LO-TRINH.html`; vẽ lại rồi commit).
- [ ] **Step 3:** Dựng Postgres 5563 sạch, `npm run db:migrate && npm run db:test` trên nhánh chưa có 011 mới → xanh (nền của 62).

### Task 1: Lõi — thực đơn, cấu hình, xét hạn (đã xong ở bước thiết kế)

**Files:** `packages/core/src/routing/index.ts`, `packages/core/src/routing/routing.test.ts`, `packages/core/package.json` (export `./routing`). **Phục vụ:** E1, E2. **independent:** true.

**Interfaces — Produces:** `ROUTING_STRATEGIES`, `RoutingStrategyKey`, `ALERT_AUDIENCES`, `LeadRoutingSettings`, `DEFAULT_LEAD_ROUTING`, `DEADLINE_MINUTES`, `LEAD_ROUTING_KEYS`, `readLeadRoutingSettings(rows: {key; value}[]): LeadRoutingSettings`, `applyLeadRoutingPatch(current, input): {ok:true; settings; rows} | {ok:false; error}`, `ALERT_KINDS`, `AlertKind`, `sameBuilding`, `RoutingCandidate` (có `openLeads`), `RoutingLead`, `RoutingChoice`, `STRATEGIES`, `chooseAgent(lead, candidates, strategy)`, `poolVisibleTo(lead, candidate)`, `unroutedDue(lead, now)`, `DeadlineFact` (có `acceptMinutes`, `firstCallMinutes`), `dueAlerts(fact, now)`.

- [ ] **Step 1:** `npm test -w @quy-hang/core` → `ℹ fail 0`, có các ca nêu ở E1, E2.
- [ ] **Step 2:** Phá-thử hai chiều đã ghi trong E1 (bỏ vế `openLeads`) và E2 (đổi `>=` thành `>`) → ca nêu tên đỏ; khôi phục → xanh.

### Task 2: Migration 011 và ca cách ly

**Files:** viết lại `packages/db/migrations/011_chia_lead_va_han.sql` (chưa ở `main`); sửa `packages/db/tests/isolation.test.mjs`. **Phục vụ:** E9 (phần cơ sở dữ liệu), nền của E3–E12. **independent:** false (sau Task 0).

**Interfaces — Produces (SQL, mọi hàm `security definer set search_path = ''`, lọc `app.current_company_id()` trừ hàm đầu):**
- `app.lead_job_companies() returns setof uuid`
- `app.lead_routing_settings_rows() returns table(key text, value jsonb)` — chỉ khoá `lead_routing.%`
- `app.stamp_leads(p_strategy text, p_accept int, p_first_call int) returns int` — đóng dấu lead `new`/`owner_has_agent` chưa bỏ, chưa có dấu
- `app.lead_routing_queue() returns table(lead_id uuid, building_name text, created_at timestamptz, strategy text, accept_minutes int, owner_group bytea, prior_agent text)` — lead `new` chưa người, chưa bỏ, đã đóng dấu; cũ trước
- `app.lead_routing_candidates() returns table(user_id text, roles text[], zone_names text[], on_leave boolean, joined_at timestamptz, last_routed_seq bigint, open_leads int)`
- `app.route_lead(p_lead uuid, p_agent text, p_now timestamptz) returns boolean`
- `app.lead_pool() returns table(lead_id uuid, building_name text, unit_number text, need text, created_at timestamptz)` — lead `open_pool` chưa người
- `app.claim_lead(p_lead uuid, p_now timestamptz) returns void` — P0002 không ở kho chung, 42501 người gọi không phải đầu chủ hay đang nghỉ, 23505 đã có người
- `app.lead_deadline_facts() returns table(lead_id uuid, agent_user_id text, deadline_from timestamptz, accept_minutes int, first_call_minutes int, accepted_at timestamptz, first_called_at timestamptz, strategy text, created_at timestamptz, raised text[])` — lead đã về người hay đang chờ chia
- `app.raise_lead_alert(p_lead uuid, p_kind text, p_from timestamptz, p_now timestamptz) returns boolean` — chèn khi lead thuộc sàn đang làm; trùng thì false
- `app.accept_lead(p_lead uuid, p_now timestamptz)`, `app.mark_first_call(p_lead uuid, p_now timestamptz)` — P0002, 23505
- `app.reassign_lead(p_lead uuid, p_agent text, p_now timestamptz) returns timestamptz` — 42501 không phải trưởng nhóm, P0002, 22023 lead căn trùng/đã bỏ, 23503 người nhận không phải đầu chủ; tăng `reassign_count` khi lead đã có người
- `app.lead_alerts_to_admin() returns boolean`
- Bảng `company_settings`, `member_availability`, `lead_alerts`; cột `leads`: `routed_at`, `routed_seq`, `accepted_at`, `first_called_at`, `reassign_count int not null default 0`, `routing_strategy`, `accept_minutes`, `first_call_minutes`; ràng buộc: dấu ba cột cùng có/cùng trống; lead `new` có người ⇔ có `routed_at` ⇔ có `routed_seq`; lead có người phải có dấu.

- [ ] **Step 1:** Viết ca cách ly mới trong `isolation.test.mjs` theo đúng danh sách E9 (mỗi hàm gọi dưới B trên dữ liệu A, đọc lại bằng kết nối chủ; đối chứng dưới A đổi đúng một dòng; `raise_lead_alert` và `stamp_leads` có đối chứng; insert `company_settings` mang `company_id` của A bị chặn; update/delete `leads`, `lead_alerts` bị từ chối; `lead_job_companies` một cột).
- [ ] **Step 2:** `npm run db:migrate && npm run test:isolation -w @quy-hang/db` → đỏ (hàm chưa có).
- [ ] **Step 3:** Viết 011 theo Interfaces và thiết kế §2; bỏ `leads_new_has_no_match`; không con số mặc định nào trong SQL.
- [ ] **Step 4:** Chạy lại → xanh. Phá-thử: bỏ lọc sàn trong `app.lead_routing_queue` → ca hàng đợi của B đỏ; khôi phục.
- [ ] **Step 5:** Commit `feat(chia-lead-va-han): migration 011 — cấu hình theo sàn, chia, hạn, kho chung`.

### Task 3: Nhịp việc nền

**Files:** tạo `packages/api/src/jobs/lead-tick.ts`, `packages/api/src/jobs/routes.ts`; sửa `packages/api/src/app.ts` (thêm `jobSecret?: string` vào `ApiDeps`, gọi `registerJobRoutes`), `packages/api/src/errors.ts` (+ `errors.test.ts`): `jobSecretMissing` 503, `badJobSecret` 401; `apps/web/src/lib/api.ts` (một dòng: `jobSecret: process.env.JOB_SECRET`); `.env.example` (`JOB_SECRET=`); tạo `packages/api/test-db/routing.test.ts`. **Phục vụ:** E3, E4, E5, E6, E8, E10, E12 (phần nhịp). **independent:** false (sau Task 2).

**Interfaces — Consumes:** hàm SQL của Task 2; lõi của Task 1. **Produces:** `runLeadTick(pool: pg.Pool, now: Date): Promise<{ companies: number; routed: number; alerts: number; failed: number }>`; `registerJobRoutes(api, deps)` — `POST /api/v1/jobs/lead-tick`, so khoá bằng so sánh thời gian hằng.

Thứ tự trong một sàn (một giao dịch `withCompany(pool, { userId: '', companyId })`): đọc `lead_routing_settings_rows` → `readLeadRoutingSettings` → `stamp_leads` → `lead_routing_queue` + `lead_routing_candidates` → với từng lead `chooseAgent(lead, candidates, lead.strategy)`, lead cùng `owner_group` trong nhịp dùng người của lead trước, cập nhật `lastRoutedSeq`/`openLeads` trong nhịp → `route_lead` → `lead_deadline_facts` → `dueAlerts` / `unroutedDue` → `raise_lead_alert`. Lỗi một sàn: rollback sàn ấy, `failed += 1`, sang sàn sau.

- [ ] **Step 1:** Viết các ca trong `routing.test.ts`: «chia: mười lead của bộ mẫu về đúng người, bỏ người nghỉ», «chia: đi làm lại thì nhận tiếp» (E3); «chưa chia được: …» năm ca (E4); «hạn: …» bốn ca (E5); «nhịp: khoá của lối việc nền», «nhịp: hai nhịp cùng lúc không chia hai lần» (E8); «cùng số: …» năm ca (E10); «cấu hình: đổi chỉ áp cho lead mới» (E11, phần nhịp); «chia: luồng lead mẫu dưới năm cách chia» (E12); và Review Focus: «nhịp: cấu hình hỏng của một sàn không chặn sàn khác», «nhịp: không sàn nào có việc», «nhịp: lead nhập giữa nhịp chờ nhịp sau». Cấu hình sàn thử đặt bằng PUT của Task 4 — ca nào cần thì viết ở Task 4 hoặc tạm đánh dấu chờ Task 4, không chèn thẳng bảng.
- [ ] **Step 2:** `npm run db:test` → các ca trên đỏ.
- [ ] **Step 3:** Viết `runLeadTick`, `registerJobRoutes`, mã lỗi, dòng `apps/web`, `.env.example`.
- [ ] **Step 4:** `npm run db:test` → xanh; `npm run typecheck && npm run lint`. Phá-thử theo «Chiều đỏ» của E3, E4, E5, E8, E10 → mỗi lần đúng ca nêu tên đỏ; khôi phục.
- [ ] **Step 5:** Commit `feat(chia-lead-va-han): nhịp việc nền chia và xét hạn theo cấu hình của sàn`.

### Task 4: Lối API của người

**Files:** tạo `packages/api/src/routing/routes.ts`, `packages/api/src/routing/store.ts`; sửa `packages/api/src/app.ts` (gọi `registerRoutingRoutes`), `packages/api/src/errors.ts` (+ test): `alreadyAccepted` 409, `alreadyCalled` 409, `alreadyClaimed` 409, `onLeave` 403, `notAListingAgent` 400, `leadNotAssignable` 400, `invalidSettings` 400 (thân có `reason` = `error` của `applyLeadRoutingPatch`), `teamLeadRequired` 403; sửa `packages/api/test-db/routing.test.ts`. **Phục vụ:** E6, E7, E9 (lối API), E11, phần cấu hình của E5, E12. **independent:** false (sau Task 3, cùng tệp test).

**Interfaces — Produces:** `registerRoutingRoutes(api, deps)` với các lối của thiết kế §4. Lối PUT cấu hình: một giao dịch, khoá dòng cấu hình của sàn (`pg_advisory_xact_lock` theo sàn), đọc cấu hình đã lưu → `applyLeadRoutingPatch` → upsert từng dòng `rows`. Lối kho chung lọc bằng `poolVisibleTo` với khu của người gọi; claim của người không thấy lead → 404. Ánh xạ mã SQL: P0002 → 404, 23505 → 409, 22023 → 400, 23503 → 400, 42501 → 403.

- [ ] **Step 1:** Viết các ca: «cấu hình: mặc định khi sàn chưa đặt», «cấu hình: quản trị đổi, vai khác chỉ đọc» (E11); «báo: người đọc theo cấu hình» (E5); «nhận và gọi: chỉ đầu chủ của lead», «kho chung: đầu chủ tự nhận», «nghỉ: ai đánh dấu được» (E6); năm ca «trưởng nhóm: …» (E7); «cách ly: người của B không chạm lead của A», «cách ly: cấu hình của B không đổi cách chia của A», «rò: không số chủ» (E9); Review Focus: «kho chung: hai người nhận cùng lúc», «cấu hình: hai lần đổi một phần cùng lúc».
- [ ] **Step 2:** `npm run db:test` → đỏ.
- [ ] **Step 3:** Viết routes và store.
- [ ] **Step 4:** `npm run db:test` xanh; typecheck, lint. Phá-thử theo «Chiều đỏ» của E6, E7, E9, E11 → đỏ đúng ca; khôi phục.
- [ ] **Step 5:** Commit `feat(chia-lead-va-han): lối cấu hình, nhận, kho chung, giao lại, lời báo`.

### Task 5: Tài liệu và hướng dẫn cho chủ kho

**Files:** tạo `docs/adr/0017-chia-lead-va-han.md`; sửa `docs/product/tham-chieu.md` (§12 một dòng: cách chia và hạn là cấu hình của sàn, thực đơn năm cách, mặc định theo lời chốt Hỏi-5, Hỏi-7); `CONTEXT.md` (mục «Cách chia», «Kho chung», «Lead đang mở»); `.env.example` nếu Task 3 chưa thêm. **Phục vụ:** OOS-6 (hướng dẫn bật nhịp), bất biến tài liệu. **independent:** true.

- [ ] **Step 1:** ADR-0017 gồm: quyết định (thực đơn, cấu hình, đóng dấu, dùng lại `matched_agent_user_id`, chia trong nhịp); hướng dẫn chủ kho từng bước: đặt `JOB_SECRET` ở Vercel (Production), bật `pg_cron` và `pg_net` ở dự án Supabase `quy-hang`, lưu khoá ở Supabase Vault, tạo lịch `cron.schedule('lead-tick', '* * * * *', …net.http_post…)` gọi `/api/v1/jobs/lead-tick`, câu kiểm `routed_at − created_at ≤ 60 giây`; nguồn https://supabase.com/docs/guides/cron.
- [ ] **Step 2:** `npm run lint` (bảng tham chiếu, liên kết) xanh.
- [ ] **Step 3:** Commit `docs(chia-lead-va-han): ADR-0017, Tham chiếu §12, từ vựng`.

### Task 6: Kiểm toàn kho trước S4

**Files:** không. **independent:** false (cuối).

- [ ] **Step 1:** `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build` → xanh, `TỔNG: ĐẠT`.
- [ ] **Step 2:** `npm run db:migrate && npm run db:test` trên 5563 → xanh.
- [ ] **Step 3:** Hợp đồng `status: implemented`; vào S4.
