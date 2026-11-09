# Token máy của kết nối — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bên kia của một thoả thuận đẩy gói danh mục bằng `Authorization: Bearer qhm_…`, không phiên; token gắn đúng một thoả thuận và lời gọi kế bị từ chối ngay khi token bị thu hồi hay thoả thuận tắt.

**Architecture:** Hai bảng mới ở migration 041 (`machine_tokens`, `machine_token_calls`) cùng hàm tra theo băm kiểu `app.share_by_code`. API quản trị cấp, đọc, thu hồi dưới phiên quản trị sàn. Cửa `POST /api/v1/catalog/feeds` rẽ hai đường theo header: có Bearer thì chỉ đi đường token, một giao dịch gồm khoá dòng token, kiểm thoả thuận, ghi gói, ghi nhật ký `accepted`; từ chối hay lỗi ghi nhật ký ở giao dịch riêng sau rollback.

**Tech Stack:** TypeScript chặt, Hono + zod-openapi, Postgres 16 với luật theo dòng, vai `quy_hang_app`, `node:crypto`, `node:test` + tsx.

**Spec:** `docs/superpowers/specs/2026-11-09-token-may-ket-noi-design.md` · hợp đồng `_acceptance/token-may-ket-noi/contract.md` · tiêu chí `_acceptance/token-may-ket-noi/evals.yaml`. Câu chốt từng ca nằm ở trường `expected` của mỗi eval; tên ca dưới đây phải trùng nguyên văn.

## Global Constraints

- Cổng Phạm vi duyệt 09/11 theo khuyến nghị: Bearer tĩnh · tối đa 2 token còn sống mỗi thoả thuận · token lạ không ghi nhật ký · chưa làm màn · không hạn riêng · `paused` và quá hạn chỉ chặn tạm, `ended` thu hồi hẳn · sai, lạ, đã thu hồi chung 401 `invalid-machine-token` · chưa giới hạn tần suất, chưa dọn nhật ký.
- Token: `qhm_` + 43 ký tự base64url của 32 byte ngẫu nhiên, dạng `^qhm_[A-Za-z0-9_-]{43}$`. Băm SHA-256 hex. `display_prefix` = tám ký tự đầu phần ngẫu nhiên.
- Mã lỗi mới ở `API_ERRORS`, thêm cả vào ma trận `errors.test.ts`: `invalidMachineToken` 401 `invalid-machine-token` · `tokenScope` 403 `token-scope` · `tokenKindNotSupported` 400 `token-kind-not-supported` · `tokenLimitReached` 409 `token-limit-reached` · `internalError` 500 `internal-error`.
- `outcome` là tập đóng: `accepted`, `invalid_payload`, `wrong_connection`, `agreement_inactive`, `token_revoked`, `server_error`.
- Migration số 041 (giám sát giữ): chỉ dựa đối tượng ≤ 040, viết lặp lại được (`if not exists`, `drop … if exists` rồi tạo, `create or replace`); bản thật áp sau 052.
- Truy vấn chỉ qua `withCompany` (`one-door.test.ts`). Đường token gọi với `userId: ""`.
- Token rõ và băm không vào nhật ký, không vào `console`. Không dữ liệu cá nhân thật trong test: `[Tên]`, `[Sàn …]`.
- Đường phiên của cửa nhận giữ nguyên kết quả. Không đổi khuôn danh mục v1, không chạm `packages/connect`.
- Trước việc đầu của S3: khai thêm vùng `docs/product/doi-chieu-nganh.md`, `docs/architecture/so-diem-bien-thien.md`, `docs/superpowers/plans/**` cho hàng bằng `hang vung`.

## Review Focus

- `agreementId` hay `tokenId` không phải UUID trên đường dẫn → 404, không 500 (Việc 3, ca «đường dẫn sai dạng»).
- Sàn là bên kia của thoả thuận (`counterparty_company_id`) đọc được dòng thoả thuận qua luật 001, nhưng không được cấp, xem, thu hồi token của nó → 404 (Việc 3, ca «sàn bên kia của thoả thuận»).
- `Authorization: Basic …` đi đường phiên như cũ; `Bearer` không có giá trị đi đường token và 401 (Việc 4, ca «scheme khác và Bearer rỗng»).
- Thân không phải JSON kèm token hợp lệ → 422 và một dòng `invalid_payload` (Việc 4, ca «thân hỏng có token»).
- Kết thúc thoả thuận chỉ thu hồi token của chính nó và không ghi đè `revoked_by` của token đã thu hồi tay (Việc 2, ca «kết thúc thoả thuận thu hồi đúng phạm vi»).

---

### Việc 1: Luật token ở lõi

`independent: false` (Việc 3 dùng) · Phục vụ **E10**

**Files:** Modify `packages/core/src/agreements.ts` · Test `packages/core/src/agreements.test.ts`

**Interfaces — Produces:** `MACHINE_TOKEN_KINDS: readonly { kind: ConnectionKind; direction: Direction }[]` = `catalog_source`/`inbound`, `catalog_confirmation`/`outbound` · `MACHINE_TOKEN_LIMIT = 2` · `machineTokenAllowed(kind: ConnectionKind, direction: Direction): boolean`.

- [ ] Viết ca «cấp token theo loại kết nối» theo E10, thấy đỏ: `npm test -w @quy-hang/core`
- [ ] Thêm ba xuất trên, chạy lại, xanh.
- [ ] Commit `feat(core): loại kết nối được cấp token máy`.

### Việc 2: Migration 041 và kiểm ở cơ sở dữ liệu

`independent: false` (Việc 3, 4 dùng) · Phục vụ **E5, E8, E11**

**Files:** Create `packages/db/migrations/041_token_may_ket_noi.sql`, `packages/db/tests/token-may.test.mjs`, `packages/db/tests/token-may-thu-tu.test.mjs` · Modify `packages/db/tests/isolation.test.mjs`

**Interfaces — Produces:** bảng và hàm `app.machine_token_by_hash(p_hash text) returns table (token_id uuid, company_id uuid, agreement_id uuid, revoked boolean)`.

Các giá trị máy không tự suy được:

- `agreements`: chỉ mục duy nhất `agreements_id_company_uq (id, company_id)`.
- `machine_tokens`: `id uuid primary key default gen_random_uuid()`, `company_id … references companies on delete cascade`, `agreement_id`, `token_hash` duy nhất và check `^[0-9a-f]{64}$`, `display_prefix` check `^[A-Za-z0-9_-]{8}$`, `created_by text not null`, `created_at`, `revoked_at`, `revoked_by text`; khoá ngoại `machine_tokens_agreement_fkey (agreement_id, company_id)`; chỉ mục duy nhất `(id, company_id)`; chỉ mục `(agreement_id) where revoked_at is null`.
- `machine_token_calls`: `id` tương tự, `company_id`, `token_id`, `agreement_id`, `called_at default now()`, `method`, `route`, `http_status int` check 100–599, `outcome` check tập đóng tên `machine_token_calls_outcome_check`; khoá ngoại `(token_id, company_id)` và `(agreement_id, company_id)`; chỉ mục `(company_id, token_id, called_at desc)`.
- Cả hai bảng `enable` + `force`. Quyền `quy_hang_app`: `machine_tokens` có `select, insert, update (revoked_at, revoked_by)`; `machine_token_calls` có `select, insert`.
- Luật sửa `machine_tokens`: `using (company_id = app.current_company_id() and revoked_at is null) with check (company_id = app.current_company_id() and revoked_at is not null)`.
- Trigger `after update of status on agreements`, điều kiện `new.status = 'ended' and old.status is distinct from 'ended'`, hàm `security definer set search_path = ''`, cập nhật `where agreement_id = new.id and company_id = new.company_id and revoked_at is null`, `revoked_by = 'system:agreement-ended'`.
- `app.machine_token_by_hash`: `language sql stable security definer set search_path = ''`, lọc `p_hash ~ '^[0-9a-f]{64}$'`, `revoke all … from public; grant execute … to quy_hang_app`.

- [ ] Viết các ca, thấy đỏ trên Postgres dãy G (cổng 5573): trong `isolation.test.mjs` ca «machine_tokens» và «machine_token_calls» (E5); trong `token-may.test.mjs` các ca «khoá ngoại ghép», «tra theo băm» (E5), «thu hồi một chiều», «nhật ký chỉ thêm», «trạng thái đích» (E8), «kết thúc thoả thuận thu hồi đúng phạm vi» (hai thoả thuận cùng sàn: chỉ token của thoả thuận `ended` bị thu hồi, `revoked_by` đúng chuỗi; token đã thu hồi tay giữ `revoked_at`, `revoked_by`); trong `token-may-thu-tu.test.mjs` ca «hai thứ tự áp migration» (E11), tạo và xoá cơ sở dữ liệu tạm tên riêng theo lượt.
- [ ] Viết migration. Chạy: `export DATABASE_URL=postgres://postgres:quyhang@localhost:5573/postgres && npm run db:migrate && npm run test:isolation -w @quy-hang/db` → xanh.
- [ ] Commit `feat(db): token máy và nhật ký gọi (041)`.

### Việc 3: API cấp, đọc, thu hồi token

`independent: false` (cần Việc 1, 2; Việc 4 dùng) · Phục vụ **E1, E2**

**Files:** Create `packages/api/src/auth/token-may.ts`, `packages/api/src/auth/token-may-routes.ts`, `packages/api/test-db/token-may/chung.ts`, `packages/api/test-db/token-may/quan-ly.test.ts` · Modify `packages/api/src/errors.ts`, `packages/api/src/errors.test.ts`, `packages/api/src/app.ts`

**Interfaces — Produces** (`auth/token-may.ts`):

- `taoToken(): { token: string; hash: string; displayPrefix: string }` · `bamToken(token: string): string`
- `docBearer(header: string | undefined): { token: string } | null` — scheme `bearer` không phân biệt hoa thường, `null` khi không phải Bearer; Bearer không giá trị trả `{ token: "" }`.
- `traToken(pool: pg.Pool, token: string): Promise<{ tokenId: string; companyId: string; agreementId: string; revoked: boolean } | null>` — sai dạng trả `null`, không chạm cơ sở dữ liệu.
- `registerMachineTokenRoutes(api: OpenAPIHono, deps: ApiDeps): void` ở `token-may-routes.ts`, gọi trong `createApi` ngay sau `registerFeedRoutes`.

Thứ tự lệnh: phiên 401 → sàn đang làm → quản trị 403 → thoả thuận 404 → (cấp) 400 → 403 → 409. Mọi câu đọc thoả thuận lọc thêm `company_id = app.current_company_id()`. Lời cấp khoá dòng thoả thuận bằng `for no key update`, để không đụng khoá của các câu ghi danh mục. Hiệu lực xét bằng `mayFlow(a, "catalog", { at, kind: a.kind, direction: a.direction })`. Thu hồi: update 0 dòng thì đọc lại, có dòng là 204, không có là 404.

- [ ] Viết `chung.ts` (đăng nhập, mở sàn, thêm thoả thuận, cấp token qua API, dọn nhật ký và token trước khi xoá thoả thuận) và các ca, thấy đỏ: «cấp token: hiện một lần, lưu băm» (E1) · «quyền quản lý token: ma trận ba người ba lệnh», «cấp token: loại kết nối không cấp được», «cấp token: thoả thuận không hiệu lực», «trần token còn sống», «hai lời cấp song song», «thu hồi ở mọi trạng thái», «tokenId khác thoả thuận», «thu hồi lại» (E2) · «đường dẫn sai dạng» (id không phải UUID ở cả ba lệnh ra 404) · «sàn bên kia của thoả thuận» (ba lệnh ra 404, không đổi dòng nào).
- [ ] Viết mã. Chạy: `DATABASE_URL=postgres://postgres:quyhang@localhost:5573/postgres npx -w @quy-hang/api node --import tsx --test --test-concurrency=1 "test-db/token-may/quan-ly.test.ts"` và `npm test -w @quy-hang/api` → xanh.
- [ ] Commit `feat(api): cấp, đọc, thu hồi token máy`.

### Việc 4: Cổng token ở cửa nhận danh mục

`independent: false` (cần Việc 3) · Phục vụ **E3, E4, E6, E7, E9**

**Files:** Create `packages/api/src/catalog/feeds-ghi.ts`, `packages/api/src/catalog/feeds-token.ts`, `packages/api/test-db/token-may/cua-nhan.test.ts`, `packages/api/test-db/token-may/pham-vi.test.ts`, `packages/api/test-db/token-may/nhat-ky.test.ts` · Modify `packages/api/src/catalog/feeds.ts`

**Interfaces:**

- `feeds-ghi.ts`: chuyển nguyên `ghiGoi`, `AgreementRow`, `toAgreement` khỏi `feeds.ts`, không đổi thân.
- `FeedHooks` thêm `sauKhiTraToken?: () => Promise<void>` và `truocGhiNhatKy?: (outcome: string) => Promise<void>`.
- `nhanBangToken(c: Context, token: string, deps: ApiDeps, hooks: FeedHooks): Promise<Response>` ở `feeds-token.ts`; `feeds.ts` gọi nó ngay đầu xử lý khi `docBearer` khác `null`.

Trình tự của `nhanBangToken`: `traToken`, `null` thì 401 kèm `WWW-Authenticate: Bearer error="invalid_token"`, không nhật ký → `sauKhiTraToken` → `revoked` thì 401 và `token_revoked` → đọc thân và `parseCatalogFeed`, giữ kết quả, chưa trả → một `withCompany({ userId: "", companyId })`: khoá `select 1 from machine_tokens where id = $1 and revoked_at is null for share` (0 dòng → `token_revoked`) → đọc thoả thuận → khác `catalog_source`/`inbound` thì 403 `token-scope` → sàn ngoài danh sách tin hay `mayFlow` từ chối thì 403 `agreement-inactive` → kết quả sai khuôn thì 422 `invalid_payload` → `truocKhiGhi` → `ghiGoi` theo đúng `agreementId` của token → `truocGhiNhatKy("accepted")` → chèn dòng `accepted` → commit.

Từ chối ném một lỗi mang entry và `outcome`; sau rollback ghi dòng ở `withCompany` thứ hai. `42501` từ câu ghi gói quy về `agreement_inactive`. Lỗi khác ghi `server_error`, trả 500 `internal-error`, `console.error` chỉ mã lỗi. Ghi nhật ký từ chối mà lỗi thì vẫn trả mã từ chối. OpenAPI: `api.openAPIRegistry.registerComponent("securitySchemes", "machineToken", { type: "http", scheme: "bearer" })`, route thêm `security: [{ machineToken: [] }, {}]` và mã 500.

- [ ] Viết các ca, thấy đỏ: «đẩy gói bằng token: không phiên, không Origin», «đẩy lại không nhân đôi», «gói sai khuôn» (E3) · «từ chối lời gọi kế», «Bearer hỏng kèm cookie quản trị», «mở lại thoả thuận», «tắt giữa lúc kiểm và ghi», «thu hồi sau bước tra», «thu hồi giữa lúc ghi» (E6) · «scheme khác và Bearer rỗng», «thân hỏng có token» ở `cua-nhan.test.ts`; «token ngoài loại kết nối», «đổi chiều sau khi cấp», «token không mở route nào khác», «cookie sàn khác kèm token» (E4) ở `pham-vi.test.ts`; «nhật ký: một lời gọi một dòng», «token lạ không sinh dòng», «ghi nhật ký lỗi thì gói không vào» (E7), «token không vào console», «OpenAPI khai đường token» (E9) ở `nhat-ky.test.ts`.
- [ ] Tách `feeds-ghi.ts`, chạy `test-db/catalog/nhan-goi.test.ts` thấy vẫn xanh, rồi viết đường token.
- [ ] Chạy executor của hàng: lệnh `executors.test.token_may_db` trong `_acceptance/config.yaml` → xanh, gồm cả bộ `nhan-goi`. Chạy `npm run typecheck && npm run lint`.
- [ ] Commit `feat(api): cửa nhận danh mục bằng token máy`.

### Việc 5: Tài liệu điều đang đúng

`independent: false` (ghi lại điều Việc 1–4 đã làm) · Phục vụ tiêu chí tài liệu của AGENTS.md, không có eval riêng

**Files:** Modify `docs/adr/0015-khuon-danh-muc-v1.md` (mục sửa đổi 09/11: khoá máy đã làm, cách gọi, mã lỗi) · `docs/product/tham-chieu.md` (§12 tám quyết định, dòng lịch sử) · `CONTEXT.md` (từ «Token máy» ↔ `machine_token`) · `docs/product/doi-chieu-nganh.md` (mục mới cách gọi máy-máy, lấy từ thiết kế §6, giữ đường dẫn nguồn và chữ «chưa kiểm») · `docs/architecture/so-diem-bien-thien.md` (một dòng điều khoá `MACHINE_TOKEN_LIMIT`, lý do «quyền và an toàn»)

- [ ] Sửa năm tệp. Chạy `npm run lint` và bộ kiểm tài liệu của kho nếu `npm test` có ca đếm điều khoá (số đếm ở đầu phần C phải khớp).
- [ ] Commit `docs(token-may-ket-noi): cập nhật điều đang đúng`.

## Sau Việc 5

Chạy `/verify` đủ bước, gồm bộ kiểm cách ly trên Postgres dãy G. Đổi `status: implemented` rồi vào S4.
