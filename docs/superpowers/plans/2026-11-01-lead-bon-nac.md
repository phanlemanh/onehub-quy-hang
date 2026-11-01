# Lead bốn nấc (hàng 27) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Telesales thấy lead mình đã nhập qua bốn nấc Đã gửi → Đã nhận → Đã gọi → Lên bảng, đầu chủ trả lại được lead số sai tới khi lead lên bảng, telesales sửa số và gửi lại — đo bằng 12 tiêu chí của `_acceptance/lead-bon-nac/contract.md`.

**Architecture:** Lõi thuần (`packages/core/src/dedupe/lead-stage.ts`) tính nấc và dựng bản của telesales. Migration 015 thêm bốn cột trả lại / gửi lại, một hàm nội bộ định nghĩa «lên bảng» dùng chung cho ba hàm (`lead_board_dates`, `return_lead`, `lead_board_metric`), và `create or replace` năm hàm của hàng 24/25/62 để lead đã trả lại rời việc của đầu chủ. API thêm ba lối ở `packages/api/src/leads/`; màn `leads/mine` dựng theo lối ReUI `list-11` đã duyệt, Hôm nay của telesales hiện cùng màn.

**Tech Stack:** TypeScript chặt, Hono + `@hono/zod-openapi`, `pg`, Postgres 16, `node:test` qua `tsx`, Next.js + ReUI (`base-nova`).

**Spec:** `docs/superpowers/specs/2026-11-01-lead-bon-nac-design.md` · hợp đồng `_acceptance/lead-bon-nac/contract.md` (đã duyệt 01/11, Hỏi-1..4 theo khuyến nghị) · evals `_acceptance/lead-bon-nac/evals.yaml` · trang ba lối `_acceptance/lead-bon-nac/ba-loi/index.html`

## Global Constraints

- Migration `015_lead_bon_nac.sql`, ADR-0020 — số đã giữ chỗ ở giám sát. Không sửa migration đã commit (001–014).
- Năm hàm cũ chỉ đổi bằng `create or replace` cùng chữ ký, thân y cũ cộng đúng một điều kiện «chưa trả lại» (`returned_at is null`); bộ kiểm `leads.test.ts`, `routing.test.ts`, `ma-hoa-so-chu.test.ts`, `isolation.test.mjs` phải xanh nguyên, không sửa ca nào của chúng.
- Năm tệp dùng chung (`packages/api/src/app.ts`, `app.test.ts`, `ten-cu.test.ts`, `errors.ts`, `packages/core/src/index.ts`) chỉ thêm dòng.
- Không hàm, lối hay màn nào trả số chủ hay mã hàng cho telesales; hàm lên bảng chỉ trả `lead_id`, `board_at`.
- Lý do trả lại duy nhất: «Số không liên lạc được». Lead gửi lại đi như lead mới (Hỏi-2). Trả lại được tới khi Lên bảng (Hỏi-4).
- Dữ liệu thử chỉ từ bộ mẫu hàng 5 và số `0900 000 0xx`; tên `[Tên]`.
- Postgres dãy L cổng 5563: `DATABASE_URL=postgres://postgres:quyhang@localhost:5563/postgres`. Dev server: preview «web-l», cổng 3483.
- Nhãn chữ theo `CONTEXT.md`; code, API, tên bảng tiếng Anh; comment nghiệp vụ tiếng Việt.
- Mỗi phép đo mới có cặp hai chiều: lành → xanh, phá theo «Chiều đỏ» của eval → đỏ đúng ca nêu tên; khôi phục.

## Review Focus

1. Hai lần «Sửa số và gửi lại» cùng lúc trên một lead trả lại — đúng một 201, một 409 `already-resubmitted`, sàn chỉ thêm một lead. Test ở Task 3.
2. Telesales chưa nhập lead nào — `GET /api/v1/leads` trả `[]` 200, màn ra trống với một hành động «+ Lead». Test ở Task 3 (API) và E10 (màn).
3. Gửi lại với chính số cũ (đầu chủ bấm nhầm) — 201 outcome `new`, nhịp không giao về đầu chủ đã trả. Test ở Task 4.
4. Lead chủ trùng (`owner_has_agent`, không qua nhịp chia) bị trả lại — 200, không lời báo quá hạn nào sau đó. Test ở Task 4.
5. Chuỗi gửi lại hai lần (Z → Z′ trả lại → Z″ lên bảng) — số đo tính từ lúc nhập Z. Test ở Task 4.

---

### Task 0: Gộp nhánh chính, nền xanh

**Files:** không tệp mã. **Phục vụ:** điều kiện trước. **independent:** false.

- [ ] **Step 1:** `git merge origin/main` (bằng git, driver `tep-sinh` giữ `PRODUCT-MAP.md`, `LO-TRINH.html`; vẽ lại bằng `scripts/product-map.mjs --root .` rồi commit).
- [ ] **Step 2:** Postgres 5563 sạch: `npm run db:migrate && npm run db:test` → xanh (001–014 của main).

### Task 1: Lõi — nấc và bản của telesales

**Files:** tạo `packages/core/src/dedupe/lead-stage.ts`, `packages/core/src/dedupe/lead-stage.test.ts`; sửa `packages/core/src/dedupe/index.ts` (một dòng `export * from "./lead-stage";`). **Phục vụ:** E1. **independent:** true.

**Interfaces — Produces** (`lead-stage.ts` chỉ `import type` từ `./index`, không gọi hàm của nó):
- `LEAD_STAGES = ["sent", "accepted", "called", "on_board"] as const`, `LEAD_SIDE_STATES = ["returned", "resubmitted", "supplement", "discarded"] as const`, `type LeadStage`, `type LeadSideState`, `type LeadState = LeadStage | LeadSideState`.
- `LEAD_STAGE_LABELS: Record<LeadState, string>` = Đã gửi · Đã nhận · Đã gọi · Lên bảng · Trả lại · Đã gửi lại · Tin bổ sung · Đã bỏ; `AWAITING_ROUTING_LABEL = "Chờ chia"`; `RETURN_REASON_LABEL = "Số không liên lạc được"`.
- `type LeadStageFacts = { outcome: Outcome; matchedAgentUserId: string | null; routedAt: string | null; acceptedAt: string | null; firstCalledAt: string | null; boardAt: string | null; returnedAt: string | null; resubmittedAt: string | null; discardedAt: string | null }`.
- `leadStage(f: LeadStageFacts): LeadState` — thứ tự: `resubmittedAt` → `discardedAt` → outcome `unit_has_open_listing` (supplement) → `returnedAt` → `boardAt` → `firstCalledAt` → `acceptedAt` → sent.
- `type MyLeadRecord = LeadRecord & Omit<LeadStageFacts, "outcome" | "matchedAgentUserId" | "discardedAt"> & { resubmittedLeadId: string | null }`.
- `MY_LEAD_VIEW_KEYS` = `id, outcome, agentName, buildingName, unitNumber, need, listPrice, feeInclusion, desiredListingTime, createdAt, discarded, stage, awaitingRouting, routedAt, acceptedAt, firstCalledAt, boardAt, returnedAt, returnReason, resubmittedAt, resubmittedLeadId`; `type MyLeadView`; `myLeadView(r: MyLeadRecord, agentName: string | null): MyLeadView` — `awaitingRouting` = stage `sent` ∧ chưa có người; `returnReason` = `RETURN_REASON_LABEL` khi đã trả lại, ngược lại `null`; dựng từng khoá tường minh (không spread bản ghi).

- [ ] **Step 1:** Viết ba ca của E1: «nấc: bảng viết trước» (mỗi dòng một bộ dữ kiện → trạng thái; phủ bốn nấc, bốn trạng thái phụ, «chờ chia», từng cặp ưu tiên kề nhau, trong đó dòng «trả lại rồi hàng lên bảng» → `returned`; đếm số lần so bằng số dòng), «nấc: nhãn tiếng Việt», «nấc: bản của telesales không có số, không hàng» (`Object.keys` deepEqual `MY_LEAD_VIEW_KEYS`, không `ownerPhone`, `matchedListingId`).
- [ ] **Step 2:** `npm test -w @quy-hang/core` → đỏ (chưa có module).
- [ ] **Step 3:** Viết `lead-stage.ts` theo Interfaces.
- [ ] **Step 4:** `npm test -w @quy-hang/core` → `ℹ fail 0`; phá-thử đổi thứ tự trả lại / lên bảng → đúng dòng nêu tên đỏ; khôi phục.
- [ ] **Step 5:** Commit `feat(lead-bon-nac): lõi tính nấc và bản của telesales`.

### Task 2: Migration 015 và ca cách ly

**Files:** tạo `packages/db/migrations/015_lead_bon_nac.sql` (dùng `/new-migration`); sửa `packages/db/tests/isolation.test.mjs` (chỉ thêm ca). **Phục vụ:** E9 (phần cơ sở dữ liệu), nền của E2–E8, E12. **independent:** false (sau Task 0).

**Interfaces — Produces** (mọi hàm `security definer set search_path = ''`, `revoke all … from public`):
- Cột `leads`: `returned_at timestamptz`, `returned_by text`, `resubmitted_at timestamptz`, `resubmitted_lead_id uuid`. Ràng buộc: `leads_return_pair` (hai cột trả lại cùng có / cùng trống), `leads_resubmit_pair`, `leads_resubmit_after_return` (gửi lại ⇒ đã trả lại), `leads_return_has_agent` (trả lại ⇒ có người, outcome `new`/`owner_has_agent`, chưa bỏ), khoá ngoại `(company_id, resubmitted_lead_id) → leads (company_id, id)`. `grant select` bốn cột cho `quy_hang_app`; không grant update.
- `app.lead_board_at_all(p_company uuid) returns table(lead_id uuid, board_at timestamptz)` — **không** grant cho `quy_hang_app`. Lead có người, outcome `new`/`owner_has_agent`, chưa bỏ; `board_at` = `min(e.occurred_at)` của `listing_events` `type = 'status_changed'` ∧ `payload->>'to' = 'Active'` ∧ `occurred_at >= lead.created_at`, trên hàng mà `listing_owners.owner_phone_hash = lead.owner_phone_hash` ∧ đầu chủ hiện tại (lần gán `seq` lớn nhất ở `listing_agent_assignments`) = `lead.matched_agent_user_id`.
- `app.lead_board_dates(p_leads uuid[]) returns table(lead_id uuid, board_at timestamptz)` — lọc `app.current_company_id()`, chỉ lead `created_by = app.current_user_id()`; grant `quy_hang_app`.
- `app.return_lead(p_lead uuid) returns void` — người gọi là `matched_agent_user_id`, lead outcome `new`/`owner_has_agent`, chưa bỏ, sàn đang làm, khoá dòng; lỗi: `P0002` (không phải lead của người gọi, kể cả căn trùng), `23505` (đã trả lại), `22023` (đã Lên bảng theo `lead_board_at_all`). Ghi `returned_at = now()`, `returned_by = app.current_user_id()`. Grant `quy_hang_app`.
- `app.mark_resubmitted(p_old uuid, p_new uuid) returns void` — lead cũ của sàn đang làm, `created_by` = người gọi (`P0002`), đã trả lại (`22023`), chưa gửi lại (`23505`); lead mới cùng sàn, cùng người nhập (`P0002`). Ghi `resubmitted_at = now()`, `resubmitted_lead_id = p_new`. Grant `quy_hang_app`.
- `app.lead_board_metric(p_company uuid, p_from timestamptz, p_to timestamptz) returns table(lead_id uuid, first_created_at timestamptz, board_at timestamptz, days numeric)` — lead của `lead_board_at_all(p_company)` có `board_at` trong `[p_from, p_to)`; `first_created_at` = `created_at` của lead đầu chuỗi (đệ quy ngược: lead `p` có `p.resubmitted_lead_id` = lead đang xét); `days = round(extract(epoch from board_at - first_created_at) / 86400, 1)`; **không** grant cho `quy_hang_app`.
- `create or replace` cùng chữ ký, thân chép từ 011/009 cộng `returned_at is null`: `app.lead_job_companies` (vế lead), `app.lead_routing_candidates` (đếm `open_leads`), `app.lead_deadline_facts`, `app.lead_routing_queue` (vế lead trước của `prior_agent`: `p.returned_at is null`), `app.lead_dedupe_facts(bytea, text, text, text[])` (vế lead trước của `chu`: `d.returned_at is null`).

- [ ] **Step 1:** Thêm ca cách ly của E9: dưới sàn B, `return_lead` và `mark_resubmitted` trên lead của A ném `P0002`, đọc lại bằng kết nối chủ thấy A không đổi, đối chứng dưới A đổi đúng một dòng; `lead_board_dates` với mã lead của A không dòng, đối chứng dưới A có dòng; hàm trả đúng hai cột; `quy_hang_app` update bốn cột mới → lỗi quyền; `quy_hang_app` gọi `lead_board_metric` và `lead_board_at_all` → lỗi quyền.
- [ ] **Step 2:** `npm run db:migrate && npm run test:isolation -w @quy-hang/db` → đỏ.
- [ ] **Step 3:** Viết 015 theo Interfaces.
- [ ] **Step 4:** Chạy lại → xanh; `npm run db:test` → bộ ca hàng 24, 25, 62 xanh nguyên. Phá-thử: bỏ lọc sàn trong `lead_board_dates` → ca B đỏ; khôi phục.
- [ ] **Step 5:** Commit `feat(lead-bon-nac): migration 015 — trả lại, gửi lại, lên bảng, số đo`.

### Task 3: Lối API — liệt, trả lại, gửi lại

**Files:** sửa `packages/api/src/leads/store.ts`, `packages/api/src/leads/routes.ts`; sửa `packages/api/src/errors.ts` + `errors.test.ts` (chỉ thêm): `alreadyReturned` `already-returned` 409, `alreadyOnBoard` `already-on-board` 409, `notReturned` `not-returned` 409, `alreadyResubmitted` `already-resubmitted` 409; tạo `packages/api/test-db/san-thu.ts` (chép tối thiểu `login`, `sanMoi`, `giaoKhu`, `nhap`, `hangCoChu`, `lenBang` theo nếp của `routing.test.ts` — không sửa `routing.test.ts`), `packages/api/test-db/leads-mine.test.ts`. **Phục vụ:** E2, E3, E4, E6, E8, E9 (lối API). **independent:** false (sau Task 1, 2).

**Interfaces — Consumes:** `myLeadView`, `MyLeadRecord` (Task 1); `lead_board_dates`, `return_lead`, `mark_resubmitted` (Task 2); `createLead` có sẵn. **Produces:**
- `listMyLeads(tx): Promise<MyLeadRecord[]>` — lead `created_by = app.current_user_id()` của sàn đang làm, `created_at desc, id desc`, nối `lead_board_dates(array các mã)`.
- `returnLead(tx, id): Promise<MyLeadRecord | Refusal>` — savepoint như `discardLead`; `P0002` → `notFound`, `23505` → `alreadyReturned`, `22023` → `alreadyOnBoard`. Trả bản ghi đọc lại bằng mã (đầu chủ không phải người nhập: đọc theo sàn, không theo `created_by`).
- `resubmitLead(tx, id, body): Promise<MyLeadRecord | Refusal>` — thân chỉ `{ ownerPhone }` (khoá lạ → `invalidPayload`); đọc lead cũ của chính người gọi (vắng → `notFound`); chưa trả lại → `notReturned`; đã gửi lại → `alreadyResubmitted`; ghép năm mục của lead cũ với số mới → `createLead` (400 khi số sai) → `mark_resubmitted(old, new)`. Lỗi của `mark_resubmitted` sau khi đã chèn lead mới phải làm hỏng cả giao dịch (ném), lối bắt ngoài `withCompany` và trả 409 `already-resubmitted` — không để lại lead mới.
- Lối: `GET /api/v1/leads` → 200 `MyLeadView[]`; `POST /api/v1/leads/{leadId}/return` → 200 `MyLeadView`; `POST /api/v1/leads/{leadId}/resubmit` → 201 `MyLeadView` của lead mới. Tên đầu chủ qua `tenNguoi` có sẵn.

- [ ] **Step 1:** Viết các ca: «lead của tôi: chỉ lead mình nhập, mới nhất trước», «lead của tôi: chưa đăng nhập» (E2); «lead của tôi: bốn nấc đi qua đời lead thật» (E3); «trả lại: chỉ đầu chủ của lead, khi chưa lên bảng» (E4, bảng ca đủ dòng); «gửi lại: lead mới chép các mục, kiểm trùng như lead mới», «gửi lại: số mới vẫn qua kiểm trùng», «gửi lại: các ca từ chối» (E6); «lên bảng: bảng hàng viết trước» (E8, năm sàn); «cách ly: người của B không chạm lead của A», «rò: không số chủ» (E9, máy dò chín chữ số cuối có đối chứng dương đếm 2); Review Focus: «gửi lại: hai lần cùng lúc», «lead của tôi: chưa nhập lead nào».
- [ ] **Step 2:** `npm run db:test` → các ca trên đỏ.
- [ ] **Step 3:** Viết store, routes, mã lỗi.
- [ ] **Step 4:** `npm run db:test` xanh; `npm run typecheck && npm run lint`. Phá-thử theo «Chiều đỏ» của E2, E3, E4 (hai chiều), E6 (hai chiều), E8 → đỏ đúng ca; khôi phục.
- [ ] **Step 5:** Commit `feat(lead-bon-nac): lối liệt lead đã nhập, trả lại, sửa số và gửi lại`.

### Task 4: Nhịp chia và số đo

**Files:** sửa `packages/api/test-db/leads-mine.test.ts`; sửa 015 nếu ca đỏ chỉ ra thiếu điều kiện (015 chưa vào `main`). **Phục vụ:** E5, E7, E12. **independent:** false (sau Task 3, cùng tệp test).

**Interfaces — Consumes:** `runLeadTick(pool, now, only)` của hàng 25; `lead_board_metric` (Task 2). Mốc thời gian của E12: lùi `leads.created_at` bằng kết nối chủ (sự kiện của hàng chỉ thêm, không lùi được); W lên bảng trước mốc `từ` của khoảng đo.

- [ ] **Step 1:** Viết các ca: «trả lại: lead rời việc của đầu chủ», «trả lại: số đã trả không neo chủ nhà», «trả lại: nhịp chia không trả lead cùng số về đầu chủ đã trả» (E5, có sàn đối chứng dương); «gửi lại: lead mới đi như lead mới» (E7); «số đo: ngày lead → Sẵn sàng bán trên bộ mẫu» (E12, dòng deepEqual `[lead_id, first_created_at, board_at, days]`, vai API bị từ chối); Review Focus: «gửi lại: chính số cũ», «trả lại: lead chủ trùng không sinh lời báo», «số đo: chuỗi gửi lại hai lần».
- [ ] **Step 2:** `npm run db:test` → chạy; ca nào xanh ngay vẫn phải qua phá-thử ở Step 3.
- [ ] **Step 3:** Phá-thử theo «Chiều đỏ» của E5 (hai chiều: `lead_deadline_facts`, `lead_routing_queue`), E7, E12 → đỏ đúng ca; khôi phục; `npm run db:test` xanh cả bộ.
- [ ] **Step 4:** Commit `test(lead-bon-nac): nhịp chia bỏ lead trả lại, lead gửi lại đi như lead mới, số đo`.

### Task 5: Màn «Lead đã nhập» và Hôm nay của telesales

**Files:** tạo `apps/web/src/app/(app)/leads/mine/{page.tsx, khung.tsx, lead-da-nhap.tsx, nguon-that.tsx}`; sửa `apps/web/src/app/(app)/today/page.tsx`; sửa `design/patterns/lead-cua-toi.md`, `design/patterns/trang-tam.md` (bỏ ba dòng ngoại lệ của trang mẫu); gỡ `apps/web/src/app/(app)/proto/lead-bon-nac/` (ảnh ba lối giữ ở `_acceptance/lead-bon-nac/ba-loi/`); sửa `packages/ui-lint/tests/*` chỉ ở dòng nêu đường trang mẫu nếu bài khuôn đòi; tạo `packages/api/test-db/dung-man-lead-bon-nac.ts` (tệp chạy tay, không đuôi `.test.ts`: trên sàn mẫu «[Mẫu] Sàn thử» của Postgres 5563, dùng `createApi` trong tiến trình với bắt mã đăng nhập như `helpers.makeAuth`, nhập lead của telesales mẫu qua lối thật rồi đưa từng lead tới một nấc — chờ chia, đã nhận, đã gọi, lên bảng, trả lại, đã gửi lại, tin bổ sung — bằng `runLeadTick` và lối của đầu chủ mẫu; in mã lead từng nấc, không in số). **Phục vụ:** E10, E11. **independent:** false (sau Task 3: màn và tệp dựng dữ liệu gọi lối thật).

**Interfaces — Consumes:** `MyLeadView`, `LEAD_STAGE_LABELS`, `AWAITING_ROUTING_LABEL`, `understoodPrice`, `NEED_LABELS` của `@quy-hang/core/dedupe`; ba lối của Task 3. **Produces:** `KhungLeadCuaToi` (khuôn thật: một `Frame` stacked, thanh đầu «Lead đã nhập» + nút «+ Lead» → `/leads/new`); `LeadDaNhap({ nguon })` client — chuyển thể từ `proto/lead-bon-nac/reui/lead-da-nhap.tsx` (list-11: bảng ba cột Lead · Nấc · Giờ và đầu chủ, `Badge` `-light` theo nấc, 375 thu cột ba xuống dưới tên; dòng trả lại có lý do, `Input` số mới không hiện số cũ, nút «Sửa số và gửi lại»); `nguon-that.tsx`: `lay()` → `GET /api/v1/leads`, `guiLai(id, ownerPhone)` → `POST …/resubmit` (400 hiện lý do của `details`). Ba trạng thái: trống qua `TrangThai` với một hành động «+ Lead», đang tải `Skeleton` đúng bố cục dòng, lỗi qua `TrangThai` có «Thử lại». `today/page.tsx`: vai có `telesales` → `KhungLeadCuaToi` + `LeadDaNhap`; vai khác → `Placeholder` như cũ. Mục bản đồ `lead-cua-toi`: `khuon.nhap` → `@/app/(app)/leads/mine/khung`, `nhan_dien` = `leads/mine/page.tsx`, `mau_dang_chay` = `/leads/mine`.

- [ ] **Step 1:** Dựng bốn tệp, sửa Hôm nay, bản đồ khuôn; gỡ trang mẫu.
- [ ] **Step 2:** `npm run typecheck && npm run lint` (gồm `khuôn: <n> nhóm · 0 lỗi đọc · 0 lệch`, mức nợ 0); `npm test -w @quy-hang/ui-lint` xanh; `node packages/ui-lint/ban-do-khuon.mjs --base origin/main` → 0 lệch mới.
- [ ] **Step 3:** `npx tsx packages/api/test-db/dung-man-lead-bon-nac.ts` trên 5563 → in bảy dòng nấc. Preview «web-l» (3483): nhìn `/today` và `/leads/mine` ở 1440 và 375, sáng và tối; bấm «Sửa số và gửi lại»; tự kiểm theo bước của E10 trước S4.
- [ ] **Step 4:** Commit `feat(lead-bon-nac): màn Lead đã nhập ở Hôm nay của telesales (ReUI list-11)`.

### Task 6: Tài liệu

**Files:** tạo `docs/adr/0020-lead-bon-nac.md`; sửa `docs/product/tham-chieu.md` (§10 hàng «Hôm nay · Lead đã nhập và bốn nấc» ghi đã có; §12 dòng chốt Hỏi-1..4), `CONTEXT.md` (mục «Lead đã nhập», «Nấc», «Trả lại», «Gửi lại», «Lên bảng» — đối chiếu nhãn với `LEAD_STAGE_LABELS`), `docs/design/vo-va-ia.md` (dòng khối đích «Lead đã nhập» = `list-11` nếu chưa có). **Phục vụ:** bất biến tài liệu, Đường đo. **independent:** true.

- [ ] **Step 1:** ADR-0020: quyết định (bốn nấc suy từ dữ kiện; lên bảng suy theo dấu vết số + đầu chủ + Active sau lúc nhập; trả lại tới khi lên bảng; gửi lại là lead mới; số đo bằng `app.lead_board_metric` chạy bằng kết nối chủ, câu gọi mẫu `select * from app.lead_board_metric('<mã sàn>', '<từ>', '<đến>')`); hệ quả: lên bảng sẽ chính xác hơn khi hàng 17/22 gắn lead với hàng bằng mã.
- [ ] **Step 2:** `npm run lint` (kiểm tham chiếu, liên kết) xanh.
- [ ] **Step 3:** Commit `docs(lead-bon-nac): ADR-0020, Tham chiếu, từ vựng`.

### Task 7: Kiểm toàn kho trước S4

**Files:** không tệp mới. **independent:** false (cuối).

- [ ] **Step 1:** `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build` → xanh, `TỔNG: ĐẠT`.
- [ ] **Step 2:** `npm run db:migrate && npm run db:test` trên 5563 → xanh.
- [ ] **Step 3:** `node packages/ui-lint/so-do-vong.mjs --slug lead-bon-nac --base origin/main --write`; hợp đồng `status: implemented`; vào S4 (xin lượt `s4`).
