# Đăng nhập bằng mật khẩu do sàn cấp — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị sàn cấp mật khẩu tạm; người đăng nhập bằng email + mật khẩu, đặt mật khẩu mới trước khi vào vỏ; mã 6 số giữ nguyên; đăng xuất lỗi thì báo và cho thử lại.

**Architecture:** Ba bảng mới ở schema `identity` cùng một hàm `security definer` và một trigger trong migration 034. API bọc `/sign-in/email` trước đường bắt-tất-cả của better-auth: giới hạn thử, mật khẩu tạm và mã đổi đếm ở cơ sở dữ liệu; phiên vẫn do thư viện tạo (`auth.api.signInEmail(..., asResponse: true)`). Web thêm nút «Dùng mật khẩu», màn `/dat-mat-khau`, hộp cấp ở Người dùng, dòng «Mật khẩu» ở Cá nhân, và đăng xuất ba kết cục.

**Tech Stack:** Postgres 16, better-auth 1.7.14 (`emailAndPassword`, `better-auth/crypto` `hashPassword`/`verifyPassword`), Hono + `@hono/zod-openapi`, Next.js (base-nova, lucide), `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-04-dang-nhap-mat-khau-design.md` · hợp đồng `_acceptance/dang-nhap-mat-khau/contract.md` · tiêu chí `_acceptance/dang-nhap-mat-khau/evals.yaml` (mỗi task ghi eval nó làm xanh).

## Global Constraints

- Độ dài mật khẩu người đặt: **8–128 ký tự Unicode** (đếm `[...s].length`, không byte); nhận dấu cách, chữ có dấu; không luật trộn loại; không ép đổi định kỳ.
- Mật khẩu tạm: 16 ký tự từ bảng chữ không dễ nhầm, bốn nhóm bốn ký tự nối bằng `-` khi hiển thị; hạn **72 giờ**; dùng lại được tới khi đặt xong hay hết hạn; mỗi lần đăng nhập tạm cấp mã đổi mới (**15 phút**, lưu băm SHA-256), huỷ mã cũ.
- Giới hạn thử: **5 sai / 15 phút** theo email (email lạ cũng đếm) → 429 `password_rate_limited`; **20 sai liên tiếp** → vô hiệu (`khoa-20`).
- Mã lỗi: `invalid_email_or_password` 401, `password_disabled` 403, `temp_password_expired` 403, `password_rate_limited` 429, `user_in_other_company` 409, `change_token_invalid` 403, `password_too_short`/`password_too_long`/`password_common`/`password_guessable` 400.
- Ba quyết định Cổng Phạm vi: Hỏi-2 email trước, nút phụ «Dùng mật khẩu»; Hỏi-3 giữ cứng ba số (lý do «quyền và an toàn»); Hỏi-6 dòng «Mật khẩu» ở nhóm «Hồ sơ».
- Không bao giờ in thân yêu cầu hay mật khẩu, mã đổi ra nhật ký; lỗi chỉ in mã.
- Migration mới duy nhất `034_mat_khau.sql`; không sửa migration đã commit. Không dữ liệu cá nhân thật trong test (`@example.test`, `[Tên]`).
- Chữ UI đúng nguyên văn bảng trạng thái của Đặc tả UX trong thiết kế.

## Review Focus

1. Email viết hoa / có khoảng trắng — đếm giới hạn và tra tài khoản phải theo `trim().toLowerCase()`; thêm ca vào Task 4 (`gioi-han-thu`: «Email@…» và «email@…» chung một cửa sổ).
2. Hai yêu cầu đặt lần đầu song song cùng mã đổi — chỉ một thành công; Task 4 ca «mã đổi: hai lời gọi song song, một 200 một 403» (xoá mã bằng `update … where change_token_hash = $1 returning`).
3. Quản trị tự cấp cho chính mình — được phép như người khác (là thành viên, chỉ ở sàn mình); phiên của chính quản trị bị thu; Task 5 ca «tự cấp: phiên mình bị thu».
4. Người bị bỏ khỏi sàn rồi được mời lại cùng sàn — trigger chỉ vô hiệu khi người có dòng `company_members` ở sàn **khác** sàn đang chèn; Task 1 ca cách ly «mời lại cùng sàn không vô hiệu».
5. Mật khẩu có ký tự tổ hợp (NFD) — chuẩn hoá NFC trước khi đếm và băm, ở mọi đường; Task 2 dòng bảng «chữ có dấu NFD 8 ký tự nhận, đăng nhập bằng NFC khớp» và Task 4 dùng cùng hàm.

---

### Task 1: Migration 034 và bộ kiểm cách ly

**Files:**
- Create: `packages/db/migrations/034_mat_khau.sql`
- Modify: `packages/db/tests/isolation.test.mjs` (thêm ca cuối tệp, khuôn `test(..., { skip }, ...)`)

**Interfaces:**
- Produces: bảng `identity.password_state`, `identity.password_failures`, `identity.password_events` (cột như thiết kế §3.1); hàm `app.cap_mat_khau_tam(p_user uuid, p_hash text, p_expires timestamptz) returns void` ném `P0002` (không phải thành viên sàn đang làm), `42501` (không quản trị), SQLSTATE riêng `QH409` thông điệp `user_in_other_company`; trigger `company_members_vo_hieu_mat_khau` `before insert`. Khoá tư vấn: `pg_advisory_xact_lock(hashtextextended('mat-khau:' || user_id::text, 0))`.

- [ ] **Step 1: Viết ca cách ly đỏ** — «quy_hang_app không đọc ghi identity.password_state, password_failures, password_events» (select/insert/update mỗi bảng ra mã `42501`); «cap_mat_khau_tam: quản trị sàn A không cấp được cho người cũng ở sàn B» (vai `quy_hang_app`, ngữ cảnh quản trị A → lỗi `QH409`, `identity.account` không đổi); «trigger: vào sàn khác vô hiệu mật khẩu san-cap, giữ tu-doi»; «mời lại cùng sàn không vô hiệu».
- [ ] **Step 2: Chạy, thấy đỏ** — `npm run db:migrate && npm run db:test` → các ca mới FAIL (bảng/hàm chưa có).
- [ ] **Step 3: Viết `034_mat_khau.sql`** — thứ tự: ba bảng; `revoke all … from public, quy_hang_app`; hàm (chủ `quy_hang_owner`, `set search_path = pg_catalog, identity, public`); `grant execute … to quy_hang_app`; hàm trigger + trigger. Hàm ghi `identity.account` (`"providerId" = 'credential'`, `"accountId" = user id`), upsert `password_state` (`kind 'tam'`, `origin 'san-cap'`, xoá khoá/streak/mã đổi), `delete from identity.session where "userId" = p_user`, chèn sự kiện `cap` với `company_id = app.current_company_id()`, `actor_user_id = app.current_user_id()`.
- [ ] **Step 4: Chạy lại, xanh** — `npm run db:migrate && npm run db:test` → mọi ca PASS, không SKIP (E11).
- [ ] **Step 5: Commit** — `feat(db): 034 mật khẩu — ba bảng identity, hàm cấp tạm, trigger vào sàn khác`.

### Task 2: Luật mật khẩu và máy sinh mật khẩu tạm

**Files:**
- Create: `packages/api/src/auth/mat-khau.ts`, `packages/api/src/auth/mat-khau-pho-bien.ts` (mảng chữ thường ~1000 dòng, đóng gói, không tải ngoài), `packages/api/src/auth/mat-khau.test.ts`

**Interfaces:**
- Produces:
  - `chuanHoa(pw: string): string` — NFC.
  - `kiemMatKhau(pw: string, email: string): { ok: true } | { ok: false; code: "password_too_short" | "password_too_long" | "password_common" | "password_guessable" }`.
  - `sinhMatKhauTam(): string` — 16 ký tự từ `BANG_CHU_TAM` (`crypto.randomInt`), không gạch nối; `nhomBon(s: string): string` cho hiển thị.
  - Hằng `MAT_KHAU_MIN = 8`, `MAT_KHAU_MAX = 128`, `TAM_HAN_GIO = 72`, `MA_DOI_PHUT = 15`, `SAI_TOI_DA = 5`, `SAI_CUA_SO_PHUT = 15`, `SAI_LIEN_TIEP_KHOA = 20`, `BANG_CHU_TAM` (bỏ `0 O o 1 l I`) — đặt ở `constants.ts`.

- [ ] **Step 1: Viết bảng kiểm E12** — ≥ 11 dòng đúng danh sách của E12 cộng dòng NFD của Review Focus 5; assert `bang.length >= 10`; ca «mật khẩu tạm: bảng chữ và độ dài» sinh 1000, mỗi cái `/^[BANG_CHU_TAM]{16}$/`, `new Set().size === 1000`.
- [ ] **Step 2: Chạy, đỏ** — `npm test -w @quy-hang/api -- --test-name-pattern "mật khẩu"` → FAIL (chưa có mô-đun).
- [ ] **Step 3: Viết `mat-khau.ts`** — dễ đoán = một ký tự lặp; dãy tăng/giảm ≥ 8 của số hay chữ; dãy hàng phím `qwertyuiop`/`asdfghjkl`/`zxcvbnm` chứa ≥ 6 ký tự liên tiếp; chứa phần trước «@» (≥ 3 ký tự) hay `quyhang`/`quỹ hàng` sau khi bỏ dấu và cách.
- [ ] **Step 4: Chạy, xanh** — cùng lệnh → PASS.
- [ ] **Step 5: Commit** — `feat(api): luật mật khẩu và máy sinh mật khẩu tạm`.

### Task 3: Bật mật khẩu ở thư viện, đóng đường lõi

**Files:**
- Modify: `packages/api/src/auth/auth.ts` (`emailAndPassword: { enabled: true, disableSignUp: true, minPasswordLength: MAT_KHAU_MIN, maxPasswordLength: MAT_KHAU_MAX, password: { hash/verify mặc định } }`), `packages/api/src/auth/constants.ts` (`AUTH_DISABLED_PATHS` thêm tám đường của thiết kế §3.2; `PASSWORD_WRAPPED_PATHS = ["/sign-in/email"]`), `packages/api/src/auth/duong-gui-ma.ca.ts` (bảng xếp loại thêm đường lõi)
- Create: `packages/api/src/auth/duong-mat-khau.test.ts`
- Modify: `packages/api/test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts` (ca «đường lõi mật khẩu đóng»)

- [ ] **Step 1: Viết ca E8** — đọc `Object.values(auth.api)` lấy `.path` của bản đã cài; lọc `/password|sign-up|verification-email|verify-email/`; mỗi đường thuộc đúng một trong `AUTH_DISABLED_PATHS` ∪ `PASSWORD_WRAPPED_PATHS`; ca đối chứng bỏ `/change-password` khỏi bảng sao chép thì hàm kiểm trả đúng tên đường ấy.
- [ ] **Step 2: Viết ca E9** — mỗi đường 404 × 10 POST có `email`, `password`: status 404, `sent.length` không đổi, `otp_requests` và `password_failures` không thêm dòng.
- [ ] **Step 3: Chạy, đỏ** — `npm test -w @quy-hang/api` và `npm run db:test` → hai ca mới FAIL.
- [ ] **Step 4: Sửa `auth.ts`, `constants.ts`, bảng xếp loại** — chạy lại → PASS; `auth.test.ts`, `session.test.ts` vẫn xanh.
- [ ] **Step 5: Commit** — `feat(api): bật mật khẩu của thư viện, đóng đường lõi không dùng`.

### Task 4: Đăng nhập bằng mật khẩu, đặt lần đầu

**Files:**
- Create: `packages/api/src/auth/dang-nhap-mat-khau.ts` (đăng ký route), `packages/api/src/auth/trang-thai-mat-khau.ts` (đọc/ghi `password_state`, `password_failures`, sự kiện qua `identityPool`)
- Modify: `packages/api/src/app.ts` (gọi `registerPasswordAuth(api, deps)` **trước** dòng `api.on(["GET","POST"], \`${AUTH_BASE_PATH}/*\`…)`), `packages/api/src/errors.ts` (mã lỗi Global Constraints)
- Test: `packages/api/test-db/dang-nhap-mat-khau/{dang-nhap-tam,dat-lan-dau,dang-nhap-tu-dat,gioi-han-thu}.test.ts`

**Interfaces:**
- Consumes: `kiemMatKhau`, `chuanHoa`, hằng Task 2; bảng Task 1.
- Produces: `registerPasswordAuth(api: OpenAPIHono, deps: ApiDeps): void`; `ghiMatKhau(pool, userId, hash, state: Partial<PasswordState>): Promise<void>`; `thuPhien(pool, userId, giuToken?: string): Promise<number>`; `ghiSuKien(pool, e: { userId; companyId?; actorUserId; kind }): Promise<void>`.

- [ ] **Step 1: Viết bốn tệp test** — đúng các ca của E3, E4, E5, E6 (tên ca nguyên văn trong `evals.yaml`), cộng hai ca Review Focus 1, 2.
- [ ] **Step 2: Chạy, đỏ** — `npm run db:test` → các ca mới FAIL.
- [ ] **Step 3: `POST /api/v1/auth/sign-in/email`** — đúng năm bước của thiết kế §3.2; so mật khẩu bằng `verifyPassword({ hash, password: chuanHoa(pw) })`; email lạ vẫn gọi `verifyPassword` trên một băm giả cố định để thời gian tương đương; bước 5 trả nguyên `auth.api.signInEmail({ body: { email, password }, headers, asResponse: true })`.
- [ ] **Step 4: `POST /api/v1/auth/password/first`** — tiêu thụ mã đổi một lần bằng `update … set change_token_hash = null where change_token_hash = $1 and change_token_expires_at > now() returning user_id`; kiểm luật (từ chối thì **không** tiêu thụ: kiểm luật trước, tiêu thụ sau); `hashPassword`, `ghiMatKhau` (`kind 'tu-dat'`, giữ `origin`), sự kiện `dat-lan-dau`, rồi `signInEmail` với mật khẩu mới.
- [ ] **Step 5: Chạy, xanh** — `npm run db:test` → PASS; bộ cũ xanh.
- [ ] **Step 6: Commit** — `feat(api): đăng nhập bằng mật khẩu, mật khẩu tạm và đặt lần đầu`.

### Task 5: Quản trị cấp mật khẩu tạm

**Files:**
- Modify: `packages/api/src/thanh-vien.ts` (route `POST ${BASE}/members/{userId}/temp-password` dùng `quanTri`)
- Test: `packages/api/test-db/dang-nhap-mat-khau/cap-mat-khau.test.ts`, `san-khac.test.ts`

**Interfaces:**
- Consumes: `sinhMatKhauTam`, `TAM_HAN_GIO`; `app.cap_mat_khau_tam` (Task 1) gọi trong `withCompany(appPool, ctx, tx => …)`.
- Produces: 200 `{ tempPassword: string, expiresAt: string }`; 403 `API_ERRORS.adminRequired`; 404 theo mã «không phải thành viên» sẵn có của `thanh-vien.ts` (map `P0002`); 409 `user_in_other_company` (map `QH409`).

- [ ] **Step 1: Viết ca E1, E2** (tên ca nguyên văn) cộng Review Focus 3; ca quét nhật ký bắt `console.*`, `process.stdout/stderr.write` trong lời gọi.
- [ ] **Step 2: Chạy, đỏ.**
- [ ] **Step 3: Viết route** — `hashPassword(chuanHoa(tam))`, gọi hàm, trả một lần; không `console` nào nhận biến chứa mật khẩu.
- [ ] **Step 4: Chạy, xanh** — `npm run db:test`.
- [ ] **Step 5: Commit** — `feat(api): quản trị sàn cấp mật khẩu tạm`.

### Task 6: Đổi mật khẩu ở Cá nhân, báo mất máy, `/me`

**Files:**
- Modify: `packages/api/src/me/routes.ts` (`PUT ${BASE}/password`; report-lost thêm vô hiệu trước `revokeOtherSessions`), `packages/api/src/app.ts` (`GET /api/v1/me` thêm `password: "khong" | "co" | "vo-hieu"`)
- Test: `packages/api/test-db/dang-nhap-mat-khau/doi-mat-khau.test.ts`

- [ ] **Step 1: Viết ca E7** (nguyên văn) cộng ca «/me: password theo ba trạng thái».
- [ ] **Step 2: Chạy, đỏ.**
- [ ] **Step 3: Viết** — có mật khẩu dùng được (`account.password` và không `disabled_at`) thì `currentPassword` bắt buộc và phải khớp (sai → 403 `invalid_current_password`), mật khẩu tạm không bao giờ khớp (`kind = 'tam'` coi như chưa có, không nhận làm current); `origin 'tu-doi'`, xoá `disabled_*`; `thuPhien(pool, userId, tokenHienTai)`; sự kiện `doi`.
- [ ] **Step 4: Chạy, xanh** — gồm `tab-toi/thiet-bi.test.ts`.
- [ ] **Step 5: Commit** — `feat(api): đổi mật khẩu ở Cá nhân, báo mất máy vô hiệu mật khẩu`.

### Task 7: Quét nhật ký mọi đường mang mật khẩu

**Files:**
- Test: `packages/api/test-db/dang-nhap-mat-khau/nhat-ky.test.ts`

- [ ] **Step 1: Viết bảng chín lời gọi của E21** — bộ bắt bọc `console.log/info/warn/error/debug` và `process.stdout.write`/`stderr.write`; assert `bang.length === 9`; đối chứng dương in chuỗi mồi rồi bắt được.
- [ ] **Step 2: Chạy** — `npm run db:test` → PASS (các route Task 4–6 đã không in).
- [ ] **Step 3: Phá-thử** — tạm thêm `console.error(body)` ở nhánh từ chối của `/password/first`, chạy, lưu đầu ra vào `_acceptance/dang-nhap-mat-khau/evidence/E21-pha-thu.log` (ca đỏ nêu tên đường), gỡ dòng, chạy lại xanh. Cùng cách cho E1 (in thân trả lời đường cấp → `E1-pha-thu.log`) và E6 (đếm cửa sổ chỉ cho email có tài khoản → `E6-pha-thu.log`).
- [ ] **Step 4: Commit** — `test(api): quét nhật ký mọi đường mang mật khẩu, phá-thử E1 E6 E21`.

### Task 8: Đăng xuất ba kết cục (luật 55)

**Files:**
- Modify: `apps/web/src/components/shell/dang-xuat-tren-may.ts` (trả `Promise<"xong" | "o-lai" | "loi">`), `apps/web/src/components/shell/account-menu.tsx:124`, `apps/web/src/app/(app)/me/toi-that.tsx:104`, `apps/web/src/app/(auth)/dang-xuat.tsx` (đi qua `dangXuatTrenMay`)
- Create: `apps/web/src/components/shell/dang-xuat-tren-may.test.ts`

- [ ] **Step 1: Viết bảng bốn kết cục + «thử lại sau lỗi thì xong»** của E13; bộ giả ghi thứ tự `dangXuat` → `goi`.
- [ ] **Step 2: Chạy, đỏ** — `npm test -w @quy-hang/web`.
- [ ] **Step 3: Sửa** — `res.ok` mới `ve()` và `"xong"`; lỗi mạng hay `!res.ok` → `"loi"`. Ba nơi gọi hiện «Chưa đăng xuất được» + nút «Thử lại» (thử lại chỉ gọi máy chủ, kho đã xoá: thêm `DangXuatDeps.daXoa?: boolean` để bỏ bước hỏi).
- [ ] **Step 4: Chạy, xanh**; phá-thử: trả `"xong"` khi 500 → ca «máy chủ 500» đỏ, lưu `evidence/E13-pha-thu.log`, hoàn lại.
- [ ] **Step 5: Commit** — `feat(web): đăng xuất lỗi thì báo và cho thử lại`.

### Task 9: Màn đăng nhập bằng mật khẩu và Đặt mật khẩu mới

**Files:**
- Modify: `apps/web/src/app/(auth)/login/form.tsx` (bước `"mat-khau"` mới của `Buoc`; nút phụ «Dùng mật khẩu» dưới «Gửi mã đăng nhập»), `apps/web/src/proxy.ts` (`/dat-mat-khau` đi như `/login`)
- Create: `apps/web/src/app/(auth)/dat-mat-khau/page.tsx`, `form.tsx`, `apps/web/src/lib/ma-doi.ts` (giữ mã đổi trong biến mô-đun: `datMaDoi(t)`, `layMaDoi(): string | null`, `xoaMaDoi()` — không `sessionStorage`, không URL)

- [ ] **Step 1: Nạp skill `reui` rồi `quy-hang-ui`**; viết bảy dòng kế hoạch giao diện của ReUI; dùng `Khung`, `Field`, `FieldError`, `InputGroup` + `InputGroupButton` (`Eye`/`EyeOff`).
- [ ] **Step 2: Viết form** — chữ đúng ST-dang-nhap-* và ST-dat-mat-khau-*; map mã lỗi → câu dưới ô; `mustChange` → `datMaDoi`, `router.replace("/dat-mat-khau")`; trang không có mã → ST-dat-mat-khau-het-phien; lưu xong → `router.replace("/")`.
- [ ] **Step 3: Kiểm máy** — `npm run typecheck && npm run lint && npm run build`.
- [ ] **Step 4: Commit** — `feat(web): đăng nhập bằng mật khẩu và màn Đặt mật khẩu mới`.

### Task 10: Hộp cấp ở Người dùng, dòng Mật khẩu ở Cá nhân

**Files:**
- Modify: `apps/web/src/app/(app)/settings/users/quan-nguoi.tsx` (việc «Cấp mật khẩu» mỗi dòng; `AlertDialog` hỏi → `Dialog` kết quả, nút «Chép» → «Đã chép» 2 giây), `apps/web/src/app/(app)/me/toi.ts` (`DONG_MAT_KHAU` thuộc nhóm `"ho-so"`; `nhanMatKhau(p: "khong"|"co"|"vo-hieu")`), `apps/web/src/app/(app)/me/toi-that.tsx` (dòng + `Dialog` đặt/đổi), `apps/web/src/app/(app)/me/toi.test.ts`

- [ ] **Step 1: Viết ca E20** — sáu nhóm giữ thứ tự `THU_TU`; dòng «Mật khẩu» thuộc `ho-so`; `nhanMatKhau` ra «Chưa đặt» / «Đã đặt» / «Đã khoá — đặt mật khẩu mới».
- [ ] **Step 2: Chạy, đỏ → viết → xanh** — `npm test -w @quy-hang/web`.
- [ ] **Step 3: Dựng hai hộp** theo ST-cap-mat-khau-*, ST-toi-mat-khau-*; 409 → câu sàn khác, không tên sàn.
- [ ] **Step 4: Kiểm máy** — `npm run typecheck && npm run lint && npm run build`.
- [ ] **Step 5: Commit** — `feat(web): cấp mật khẩu tạm ở Người dùng, dòng Mật khẩu ở Cá nhân`.

### Task 11: Tài liệu, bàn dựng trạng thái, kiểm migration

**Files:**
- Modify: `docs/adr/0005-dang-nhap-theo-san.md` (mục «Bổ sung 04/11 — mật khẩu do sàn cấp»), `design/patterns/xac-thuc.md` (màn «Đặt mật khẩu mới»), `docs/product/tham-chieu.md` §12 (dòng `dang-nhap-mat-khau`), `CONTEXT.md` («Mật khẩu tạm ↔ temp password»), `docs/architecture/so-diem-bien-thien.md` (ba dòng «điều khoá», lý do «quyền và an toàn»), `docs/product/doi-chieu-nganh.md` (Salesforce, Follow Up Boss — mật khẩu)
- Create: `_acceptance/dang-nhap-mat-khau/thu/migration-tai-lieu.test.mjs` (ca E15 nguyên văn, kể cả đối chứng `M …002_dang_nhap_theo_san.sql`), `_acceptance/dang-nhap-mat-khau/thu/dung-trang-thai.mjs <email> <trạng-thái>` (đặt bằng kết nối chủ: `tam`, `tam-het`, `cho`, `khoa`, `tu-dat`, `khong`, `vo-hieu`; in mật khẩu thử ra stdout cho phiên chụp)

- [ ] **Step 1: Viết `thu/migration-tai-lieu.test.mjs`, chạy đỏ** — `node --test "_acceptance/dang-nhap-mat-khau/thu/*.test.mjs"`.
- [ ] **Step 2: Sửa tài liệu → chạy xanh.**
- [ ] **Step 3: Viết `dung-trang-thai.mjs`**, thử từng trạng thái trên DB 5572.
- [ ] **Step 4: Commit** — `docs: mật khẩu do sàn cấp — ADR-0005, khuôn, Tham chiếu, từ vựng, điều khoá`.

### Task 12: Kiểm trọn

- [ ] **Step 1:** `/verify` đủ sáu bước (kể cả DB) — bảng kết quả.
- [ ] **Step 2:** Chụp E10, E14, E22 trên máy chủ thử 3492 (`dung-b.mjs`), ảnh vào `evidence/`, rồi tắt máy chủ (`dung-b.mjs --tat`).
- [ ] **Step 3:** `contract.md` `status: implemented`; commit — `chore(acceptance): dang-nhap-mat-khau — S3 xong`.
