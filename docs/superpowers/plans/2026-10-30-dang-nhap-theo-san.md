# Đăng nhập theo sàn — kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người trong sàn đăng nhập bằng email + mã 6 số và mọi truy vấn của API chạy trong đúng sàn của họ; chưa gắn sàn thì không thấy gì.

**Architecture:** better-auth (plugin emailOTP, `disableSignUp`) giữ danh tính ở schema `identity`, kết nối chủ riêng. Thành viên sàn là bảng `company_members` của Quỹ hàng có luật theo dòng. API chọn sàn đang làm mỗi lời gọi rồi mở giao dịch qua một hàm duy nhất `withCompany` đặt vai `quy_hang_app` + `app.user_id` + `app.company_id`.

**Tech Stack:** better-auth 1.7.14 · pg 8 · Hono + @hono/zod-openapi · Next.js 16.4.2 · node:test + tsx · Postgres 16.

**Spec:** `docs/superpowers/specs/2026-10-30-dang-nhap-theo-san-design.md` · hợp đồng `_acceptance/dang-nhap-theo-san/contract.md` · bộ đo `_acceptance/dang-nhap-theo-san/evals.yaml`

## Global Constraints

- Mã 6 chữ số; hết hạn 300 giây; `allowedAttempts` 3 — ghi thành hằng `OTP_LENGTH`, `OTP_EXPIRES_SEC`, `OTP_ALLOWED_ATTEMPTS` ở `packages/api/src/auth/constants.ts`.
- Giới hạn xin mã: `OTP_REQUEST_LIMIT = 5` lần mỗi email trong `OTP_REQUEST_WINDOW_MIN = 15` phút; lần thứ sáu → HTTP 429; đếm cả email lạ.
- `basePath` của better-auth: `/api/v1/auth`; `advanced.cookiePrefix: "qh"` → cookie phiên `qh.session_token` (bản https: `__Secure-qh.session_token`). Cookie sàn đang làm: `qh_san`.
- Mã lỗi API: 401 `chua-dang-nhap` · 403 `chua-gan-san` · 403 `khong-thuoc-san` · 409 `chon-san` · 429 `xin-ma-qua-nhieu`. Thân lỗi `{ "error": "<mã>" }`.
- Dòng nhật ký bộ gửi dev: `[ma-dang-nhap] <email> <mã>`.
- Chữ UI đúng nguyên văn bảng trạng thái của bản thiết kế (mục Đặc tả UX §3).
- Migration mới `packages/db/migrations/002_dang_nhap_theo_san.sql`; không sửa 001; số tính lại trên `origin/main` trước khi gộp (luật 3 của đợt).
- Dữ liệu mẫu: `[Sàn A]`, `[Tên]`, email `*@example.test`; không dữ liệu thật.
- Dev dãy Q: cổng 3461, `DATABASE_URL=postgres://postgres:quyhang@localhost:5545/postgres`.
- `package-lock.json` chỉ sinh bằng `npm install`.

## Review Focus

1. **Email viết hoa / có khoảng trắng** — người gõ `Ten@Example.test ` phải vào cùng tài khoản với `ten@example.test`: công cụ mở sàn và giới hạn xin mã chuẩn hoá `trim().toLowerCase()` như better-auth. Test ở Task 2 và Task 3.
2. **Cookie `qh_san` mang chuỗi không phải uuid** — API không được ném 500 (ép kiểu uuid của Postgres): coi như chưa chọn. Test ở Task 4.
3. **Phiên hết hạn giữa lúc dùng** — `GET /me` trả 401, màn về `/dang-nhap`, không trang trắng. Test 401 ở Task 4; luồng màn ở E10.
4. **Hai tab: đổi sàn ở tab này** — tab kia lời gọi kế đi theo cookie mới, không lẫn dữ liệu hai sàn trong một giao dịch: `withCompany` đọc sàn đúng một lần mỗi lời gọi. Test ở Task 4 (hai lời gọi nối tiếp đổi sàn giữa chừng).
5. **`next build` không có DATABASE_URL** (job check của CI) — dựng API lười ở lời gọi đầu, không ở lúc nạp mô-đun. Kiểm ở Task 5 bằng `npm run build` không đặt biến.

---

### Task 1: Migration 002 + bộ kiểm cách ly (AC-7) — independent: false (mọi task sau đứng trên nó)

**Files:**
- Create: `packages/db/migrations/002_dang_nhap_theo_san.sql`
- Modify: `packages/db/tests/isolation.test.mjs`

**Interfaces:**
- Produces: schema `identity` với bảng `"user"`, `session`, `account`, `verification` (đúng cột better-auth 1.7.14 sinh — xem SQL dưới) + `otp_requests (email text not null, at timestamptz not null default now())` có index `(email, at)`; hàm `app.current_user_id() returns text`; bảng `public.company_members (company_id uuid references companies on delete cascade, user_id text references identity."user"(id) on delete cascade, created_at timestamptz default now(), primary key (company_id, user_id))`.

SQL bảng better-auth (sinh bằng `getMigrations` của 1.7.14, giữ tên cột camelCase có nháy):
`"user"(id text pk, name text not null, email text not null unique, "emailVerified" boolean not null, image text, "createdAt" timestamptz default now() not null, "updatedAt" timestamptz default now() not null)` · `session(id text pk, "expiresAt" timestamptz not null, token text not null unique, "createdAt", "updatedAt" timestamptz not null, "ipAddress" text, "userAgent" text, "userId" text not null references "user" on delete cascade)` · `account(id, "accountId", "providerId", "userId" fk, "accessToken", "refreshToken", "idToken", "accessTokenExpiresAt", "refreshTokenExpiresAt", scope, password, "createdAt", "updatedAt")` · `verification(id, identifier, value, "expiresAt", "createdAt", "updatedAt")` + ba index `session_userId_idx`, `account_userId_idx`, `verification_identifier_idx`.

Luật: `revoke all on schema identity from public`; không grant gì cho `quy_hang_app` trên `identity`. `company_members`: `enable` + `force row level security`; policy `company_members_read` for select using `user_id = app.current_user_id() or company_id = app.current_company_id()`; `grant select on company_members to quy_hang_app`. `companies`: thêm policy `companies_member` for select using `exists (select 1 from company_members m where m.company_id = companies.id and m.user_id = app.current_user_id())`. `grant execute on function app.current_user_id() to quy_hang_app`.

- [ ] **Step 1: Viết ca kiểm (đỏ)** trong `isolation.test.mjs`, dựng thêm người `U1` thuộc A, `U2` thuộc A và B, sàn C không ai; helper `asUser(userId, companyId, fn)` mở rộng `asCompany` (đặt thêm `app.user_id`):
  - `«thành viên: U1 ở sàn A thấy thành viên A, không thấy thành viên B»` — `select company_id from company_members` chỉ toàn A.
  - `«thành viên: U2 chưa đặt sàn thấy hai dòng của mình và tên A, B, không thấy C»` — `select id from companies order by id` = [A, B].
  - `«thành viên: không đặt người, không đặt sàn thì rỗng»`.
  - `«thành viên: quy_hang_app không thêm được thành viên»` — insert → `/permission denied/`.
  - `«danh tính: quy_hang_app không đọc được identity.user»` — `/permission denied for schema identity/`.
- [ ] **Step 2:** `DATABASE_URL=postgres://postgres:quyhang@localhost:5545/postgres npm run db:test` → các ca mới đỏ (bảng chưa có).
- [ ] **Step 3:** Viết migration theo Interfaces.
- [ ] **Step 4:** `npm run db:migrate && npm run db:test` → 11 ca xanh, gồm ca cũ «mọi bảng dữ liệu đều bật và ép luật theo dòng» (nay phủ `company_members`).
- [ ] **Step 5: Lượt phá (MEASURE-BIRTH):** trên DB nháp (`createdb` tạm hoặc container phụ), áp bản sao migration bỏ dòng `force row level security` của `company_members` → ca «mọi bảng dữ liệu» đỏ nêu `company_members`; bản sao thêm `grant usage on schema identity to quy_hang_app; grant select on identity."user" to quy_hang_app` → ca «danh tính» đỏ. Ghi hai thông điệp vào commit message. Không commit bản sao.
- [ ] **Step 6: Commit** `feat(db): bảng thành viên sàn và schema danh tính có luật cách ly`.

### Task 2: Công cụ vận hành mở sàn (AC-9) — independent: true (chỉ cần Task 1)

**Files:**
- Create: `packages/db/scripts/mo-san.mjs` (xuất `moSan(client, { ten, email }) → Promise<{ companyId: string, userId: string }>` và chạy CLI khi gọi trực tiếp: `--ten`, `--email`, in `đã mở sàn <ten> (<companyId>) · thành viên <email>`)
- Create: `packages/db/tests/mo-san.test.mjs`
- Modify: `packages/db/package.json` — script `"van-hanh:mo-san": "node scripts/mo-san.mjs"`

**Interfaces:**
- Consumes: bảng của Task 1.
- Produces: `moSan` (dùng ở test Task 4 và bước dựng dữ liệu E10). Sàn tìm theo `name` đúng nguyên văn; tài khoản theo email đã `trim().toLowerCase()`; tài khoản mới: `id = gen_random_uuid()::text`, `name = email`, `"emailVerified" = true`; thành viên `on conflict do nothing`. Một giao dịch.

- [ ] **Step 1: Test (đỏ)** `«mở sàn»`: lần một → 1 sàn, 1 tài khoản, 1 thành viên; lần hai cùng tham số → số dòng ba bảng không đổi, cùng `companyId`/`userId`; `«mở sàn: cùng email, tên sàn khác → người thuộc hai sàn»`; `«mở sàn: email viết hoa có khoảng trắng gắn vào cùng tài khoản»`. Mỗi ca chạy trong giao dịch rồi rollback (như `isolation.test.mjs`).
- [ ] **Step 2:** `npm run db:test` → đỏ (mô-đun chưa có).
- [ ] **Step 3:** Viết `moSan` + CLI.
- [ ] **Step 4:** `npm run db:test` xanh; lượt phá: đổi `on conflict do nothing` thành insert thường trong bản sao → ca lần hai đỏ nêu bảng.
- [ ] **Step 5: Commit** `feat(db): công cụ vận hành mở sàn`.

### Task 3: Lớp cơ sở dữ liệu + danh tính của API (AC-1, AC-2, AC-11) — independent: false

**Files:**
- Modify: `packages/api/package.json` — thêm `better-auth@1.7.14`, `pg@^8.13.0`, dev `@types/pg`; scripts giữ `"test": "node --import tsx --test \"src/**/*.test.ts\""` (chỉ test không cần Postgres) và thêm `"test:db": "node --import tsx --test --test-reporter=spec \"test-db/**/*.test.ts\""` — test cần Postgres nằm ở thư mục riêng `packages/api/test-db/`, nên hai lệnh không bao giờ chồng nhau
- Modify: `package.json` gốc — `"db:test": "npm run test:isolation -w @quy-hang/db && npm run test:db -w @quy-hang/api"`
- Create: `packages/api/src/db.ts`, `packages/api/src/auth/constants.ts`, `packages/api/src/auth/sender.ts`, `packages/api/src/auth/auth.ts`, `packages/api/src/auth/otp-limit.ts`
- Create: `packages/api/test-db/helpers.ts` (helper test: ném lỗi khi thiếu `DATABASE_URL`; `pools()` trả `{ appPool, identityPool }`; `resetIdentity()` xoá dữ liệu test theo đuôi `@example.test`)
- Test: `packages/api/test-db/auth.test.ts`, `packages/api/src/auth/production.test.ts`
- Modify: `package-lock.json` qua `npm install`

**Interfaces:**
- Produces:
  - `withCompany<T>(pool: pg.Pool, ctx: { userId: string; companyId: string | null }, fn: (c: pg.PoolClient) => Promise<T>): Promise<T>` — `db.ts` chỉ xuất hàm này.
  - `type OtpSender = (m: { email: string; otp: string }) => Promise<void>`; `devSender: OtpSender` (in dòng `[ma-dang-nhap] …`); `captureSender(): { sender: OtpSender; sent: { email: string; otp: string }[] }` (cho test).
  - `createAuth(o: { identityPool: pg.Pool; secret: string; baseURL: string; sender?: OtpSender; env?: string }): Auth` — `env === "production"` mà thiếu `sender` → `throw new Error("thiếu bộ gửi mã đăng nhập")`; thiếu sender ngoài production → `devSender`. `identityPool` tạo với `options: "-c search_path=identity"`.
  - Giới hạn xin mã: `hooks.before` (createAuthMiddleware) cho path `/email-otp/send-verification-otp`: chuẩn hoá email, đếm `identity.otp_requests` trong cửa sổ, ≥ 5 → `throw new APIError("TOO_MANY_REQUESTS", { message: "xin-ma-qua-nhieu" })`, không thì ghi một dòng.

- [ ] **Step 1: Test (đỏ)** `test-db/auth.test.ts`, gọi thẳng `auth.handler(new Request(...))` (chưa qua Hono):
  - `«xin mã: email có tài khoản nhận đúng một mã 6 chữ số»` — `sent.length === 1`, `/^\d{6}$/`.
  - `«xin mã: email lạ không nhận mã nào»`.
  - `«xin mã: trả lời như nhau dù email có tài khoản hay chưa»` — so `status` và `await res.text()`.
  - `«xin mã: lần thứ sáu trong 15 phút trả 429, lần thứ năm vẫn nhận mã»`.
  - `«nhập mã: đúng mã mở phiên»` — có `set-cookie` chứa `qh.session_token`; `auth.api.getSession` trả đúng email.
  - `«nhập mã: sai mã không mở phiên»` · `«nhập mã: mã quá hạn không mở phiên»` (đặt `"expiresAt" = now() - interval '1 second'` của dòng `verification` bằng kết nối chủ — thay đồng hồ giả) · `«nhập mã: lần thứ tư sau ba lần sai không mở phiên dù đúng mã»`.
  - `production.test.ts`: `«dựng: production thiếu bộ gửi ném lỗi»` (`assert.throws(..., /thiếu bộ gửi mã đăng nhập/)`) · `«dựng: production có bộ gửi dựng được»` — dùng `new pg.Pool()` không kết nối.
- [ ] **Step 2:** `npm run db:test` và `npm test -w @quy-hang/api` → đỏ.
- [ ] **Step 3:** Viết các tệp theo Interfaces; `npm install` sinh lock.
- [ ] **Step 4:** Hai lệnh xanh; reporter in đủ tên ca. Lượt phá: tạm bỏ `disableSignUp` → ca «email lạ» đỏ; tạm đổi giới hạn thành 6 → ca «lần thứ sáu» đỏ.
- [ ] **Step 5: Commit** `feat(api): danh tính bằng mã email và một cửa truy vấn`.

### Task 4: Đường API và sàn đang làm (AC-3, AC-4, AC-5, AC-6, AC-8, nửa máy của AC-10) — independent: false

**Files:**
- Modify: `packages/api/src/app.ts` → xuất `createApi(deps: { appPool: pg.Pool; auth: Auth }): OpenAPIHono`; giữ route `health`, `openapi.json`; xoá singleton `api`.
- Modify: `packages/api/src/index.ts` — xuất `createApi`, `createAuth`, `devSender`, `API_VERSION`, kiểu `OtpSender`.
- Create: `packages/api/src/auth/company.ts` — `resolveCompany(pool, userId, cookieValue: string | undefined): Promise<{ companies: {id:string; name:string}[]; active: {id:string; name:string} | null; reason: "chua-gan-san" | "chon-san" | null }>` (đọc qua `withCompany(pool, { userId, companyId: null }, …)`; cookie không phải uuid → bỏ qua).
- Modify: `packages/api/src/app.test.ts` — dựng app bằng `createApi` với pool không kết nối cho hai ca health.
- Test: `packages/api/test-db/api.test.ts`, `packages/api/src/one-door.test.ts`

**Interfaces:**
- Consumes: `withCompany`, `createAuth`, `captureSender` (Task 3); `moSan` (Task 2, import từ `../../db/scripts/mo-san.mjs` trong test).
- Produces (HTTP): `ALL /api/v1/auth/*` → `auth.handler`; `GET /api/v1/me` → `{ user: { id, email }, companies: [{id,name}], activeCompany: {id,name} | null }`; `POST /api/v1/me/san` body `{ companyId }` → 200 + `Set-Cookie: qh_san=<id>; Path=/; HttpOnly; SameSite=Lax` hoặc 403 `khong-thuoc-san`; `GET /api/v1/san` → `{ id, name }` đọc `select id, name from companies where id = app.current_company_id()` trong `withCompany`. Mã lỗi theo Global Constraints.
- Kiểm thời chạy: `recordingPool(pool)` trong `test-db/helpers.ts` bọc `connect()`/`query()`, ghi `{ sql, currentUser }` cho mọi câu chạm bảng `public` (lấy `current_user` ngay trước câu ấy trên cùng client).

- [ ] **Step 1: Test (đỏ)** `test-db/api.test.ts` qua `app.request(...)`, người và sàn dựng bằng `moSan` với tên riêng mỗi ca:
  - `«một sàn: /san trả sàn A»` — thân trả đúng `{ id: A, name }`; `recordingPool` khẳng định câu đọc `companies` chạy với `quy_hang_app` (không thêm route chỉ-cho-test).
  - `«chưa gắn sàn: /san 403 chua-gan-san, /me sàn rỗng»` — thân không chứa tên/mã sàn nào đã dựng.
  - `«nhiều sàn chưa chọn: /san 409 chon-san»` · `«chọn B: /san trả B»` · `«chọn C không thuộc: 403, /san không trả C»` · `«bỏ khỏi B sau khi chọn: lời gọi kế không vào B»` · `«cookie qh_san giả mã C: không vào C»` · `«cookie qh_san không phải uuid: coi như chưa chọn»` · `«đổi sàn giữa hai lời gọi: lời gọi sau theo sàn mới»`.
  - `«chưa đăng nhập: /me, /san, POST /me/san đều 401»` · `«sau đăng xuất: /me 401»`.
  - `«một cửa truy vấn: thời chạy»` — chạy lại các luồng trên với `recordingPool`; `records.length > 0`; mọi `currentUser === "quy_hang_app"`; đối chứng: một `pool.query("select 1 from companies")` thẳng → bộ đếm vi phạm = 1, thông điệp chứa câu truy vấn.
  - `«luồng trọn qua HTTP»` — dựng sàn tên `[Sàn E11 <nonce>]`, xin mã, nhập mã, `/san` trả đúng tên ấy, đăng xuất, `/me` 401.
  - `one-door.test.ts` (không DB): `scanQueries(dir): { file: string; line: number }[]` — vi phạm là lời gọi `.query(` hay `.connect(` ngoài `db.ts`, `auth/auth.ts`, `auth/otp-limit.ts`, `*.test.ts` (quét `src/` — `test-db/` nằm ngoài); `«một cửa truy vấn: mã nguồn»` quét `src` → `[]`, `db.ts` có đúng một `export`; đối chứng trên thư mục mẫu tạo trong `os.tmpdir()`: tệp lành → 0, tệp có `pool.query(` → 1 vi phạm nêu đường tệp.
- [ ] **Step 2:** `npm run db:test`, `npm test -w @quy-hang/api` → đỏ.
- [ ] **Step 3:** Viết `company.ts`, route, `createApi`.
- [ ] **Step 4:** Xanh; lượt phá: tạm cho `resolveCompany` nhận cookie không kiểm thành viên → ca «cookie giả mã C» đỏ.
- [ ] **Step 5: Commit** `feat(api): sàn đang làm theo thành viên, đường /me và /san`.

### Task 5: Màn web và dựng API trong Next (AC-6 nửa màn, AC-10) — independent: false

**Files:**
- Create: `apps/web/src/lib/api.ts` — `getApi(): OpenAPIHono` dựng lười một lần từ `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`; sender: production → không truyền (để `createAuth` ném), khác → `devSender`.
- Modify: `apps/web/src/app/api/v1/[[...route]]/route.ts` — handler gọi `getApi()` mỗi request (lười).
- Create: `apps/web/src/proxy.ts` — Next 16 proxy: không có cookie `qh.session_token`/`__Secure-qh.session_token` và path không thuộc `/dang-nhap`, `/api/`, `/_next/` → redirect `/dang-nhap`; có cookie mà mở `/dang-nhap` → redirect `/`.
- Create: `apps/web/src/app/(auth)/dang-nhap/page.tsx` (client: hai bước, trạng thái ST-dang-nhap-*; map lỗi better-auth `INVALID_OTP` → «Mã không đúng. Thử lại.», `OTP_EXPIRED`/`TOO_MANY_ATTEMPTS` → «Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.»; 429 → «Bạn đã xin mã quá nhiều lần. Thử lại sau 15 phút.»)
- Create: `apps/web/src/app/(auth)/chua-gan-san/page.tsx`, `apps/web/src/app/(auth)/chon-san/page.tsx`, `apps/web/src/app/(auth)/dang-xuat.tsx` (nút client gọi `/api/v1/auth/sign-out` rồi về `/dang-nhap`)
- Modify: `apps/web/src/app/page.tsx` — server component gọi `getApi().request("/api/v1/me")` với cookie của request: 401 → redirect `/dang-nhap`; không sàn → `/chua-gan-san`; nhiều sàn chưa chọn → `/chon-san`; có sàn → «Bạn đang làm ở sàn {name}» + nút Đăng xuất; `export const dynamic = "force-dynamic"`.
- Modify: `apps/web/package.json` — thêm `"dev:q": "next dev -p 3461"` (cổng dãy Q, không đổi `dev`); phụ thuộc `pg` nếu Next cần.
- Modify: `.env.example` — thêm `BETTER_AUTH_SECRET=` (chuỗi ngẫu nhiên ≥ 32 ký tự) và `BETTER_AUTH_URL=http://localhost:3460` (chỉ thêm dòng).

**Interfaces:** Consumes `createApi`, `createAuth`, `devSender` (Task 3–4). Style: inline tối giản như `page.tsx` hiện có (Hỏi-3); không cài ReUI.

- [ ] **Step 1:** Viết màn + proxy + `getApi`.
- [ ] **Step 2:** `npm run typecheck && npm run lint && npm run build` (không đặt `DATABASE_URL`) → xanh.
- [ ] **Step 3:** Dựng dữ liệu như bước 1 của E10, chạy `DATABASE_URL=… BETTER_AUTH_SECRET=… BETTER_AUTH_URL=http://localhost:3461 npm run dev:q -w @quy-hang/web`, đi luồng E10 trên trình duyệt; mỗi trạng thái hiện đúng chữ. Dừng dev bằng `kill <PID>` đã ghi (luật 8).
- [ ] **Step 4: Commit** `feat(web): màn đăng nhập, chọn sàn, chưa gắn sàn`.

### Task 6: Tài liệu điều đang đúng — independent: true

**Files:**
- Create: `docs/adr/0003-dang-nhap-theo-san.md` — chốt bốn câu Hỏi-1..4 (Manh Phan, Cổng Phạm vi 30/10) + schema `identity`.
- Modify: `docs/architecture/kien-truc-repo-va-stack.md` §5 dòng Đăng nhập, §10 ô «Cách đăng nhập bản đầu» → trỏ ADR-0003 (sửa dòng của chính mục này, không dòng của người khác).
- Modify: `docs/product/tham-chieu.md` — §12 thêm một dòng sổ 30/10 (chỉ thêm dòng).
- Modify: `docs/design/vo-va-ia.md` — thêm dòng «Chỗ hở»: màn đăng nhập/chọn sàn tạm tự viết tới khi chuyển thể `auth-15` (luật giao diện bậc 7).
- Modify: `CONTEXT.md` — thêm dòng «Thành viên sàn | `company_member` | …», «Sàn đang làm | `active company` (cookie `qh_san`) | …», «Mã đăng nhập | `otp` | …» (chỉ thêm).
- [ ] **Step 1:** Viết; `npm run test:hooks` vẫn `TỔNG: ĐẠT`.
- [ ] **Step 2: Commit** `docs: ADR-0003 đăng nhập theo sàn, cập nhật tham chiếu`.

## Thứ tự

Task 1 → (Task 2 ‖ Task 6) → Task 3 → Task 4 → Task 5. Chạy tuần tự trong phiên (Task 2 và 6 nhỏ, không đáng tách worktree).
