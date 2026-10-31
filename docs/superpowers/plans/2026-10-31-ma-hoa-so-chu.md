# Mã hoá số chủ nhà — kế hoạch thi công (hàng 62)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Số chủ nhà chỉ nằm trong cơ sở dữ liệu ở dạng bản mã; «Mở số» giải ra số cho người thấy nguồn.

**Architecture:** Mã hoá AES-256-GCM ở tầng API (`packages/api/src/owners/`), khoá `OWNER_PHONE_KEY` chỉ ở môi trường
app. Migration 008 thêm cột bản mã và dấu vết, chặn số rõ bằng ràng buộc `NOT VALID`, dựng lại hàm mở số trả `bytea`.
Lệnh `ma-hoa-lai.ts` chuyển dòng cũ rồi `validate`.

**Tech Stack:** TypeScript chặt, `node:crypto`, `pg`, Hono, Postgres 16, `node --test` + `tsx`.

**Spec:** `docs/superpowers/specs/2026-10-31-ma-hoa-so-chu-design.md` · hợp đồng `_acceptance/ma-hoa-so-chu/contract.md` ·
bộ đo `_acceptance/ma-hoa-so-chu/evals.yaml`

## Global Constraints

- Không thêm thư viện (không chạm `package-lock.json`); chỉ `node:crypto`.
- Khuôn bản mã: `0x01 ‖ nonce 12 ‖ thẻ 16 ‖ thân`; số chuẩn hoá 10 chữ số → bản mã 39 byte.
- Ngữ cảnh chủ nhà: `listing_owners:<company_id>:<listing_id>`. Dấu vết: HMAC-SHA256 32 byte, khoá con HKDF-SHA256 nhãn
  `quy-hang/owner-phone-hash/v1`, dữ liệu `<company_id>:<số>`.
- Khoá: base64 của đúng 32 byte; khoá dev = SHA-256 của `quy-hang-khoa-dev-so-chu-khong-dung-cho-du-lieu-that`.
- Thông điệp lỗi nêu tên biến `OWNER_PHONE_KEY`, không bao giờ giá trị khoá hay số.
- Ràng buộc: `listing_owners_phone_chi_ban_ma` (`owner_phone is null`, NOT VALID), `listing_owners_phone_enc_khuon`,
  `listing_owners_phone_hash_khuon`, `listing_owners_phone_cap` (enc và hash cùng có hoặc cùng vắng).
- Dữ liệu mẫu `0900 000 0xx`, tên `[Tên]`. Tệp ngoài vùng được phép (trả lời G-1): migration 008,
  `packages/db/tests/isolation.test.mjs`, `packages/api/test-db/owners.test.ts`, `packages/api/test-db/ma-hoa-so-chu.test.ts`,
  `.env.example` (thêm dòng), `docs/adr/0013-ma-hoa-so-chu.md`; `docs/product/tham-chieu.md` chỉ thêm dòng (luật 6, 12).
- Postgres dãy G: `DATABASE_URL` cổng 5564 ở `.env.local`.

## Review Focus

1. Số nhập có khoảng trắng hay `+84` — phải chuẩn hoá trước khi mã hoá và trước khi tính dấu vết (ca dấu vết bốn dạng, Task 1).
2. `NODE_ENV` vắng trên máy dev mà `.env.local` có khoá sai dạng — phải ném, không rơi về khoá dev (Task 2, bảng 6 ca).
3. Hai yêu cầu `PUT owner` song song trên cùng hàng — khoá hàng `for update` có sẵn giữ; không đổi.
4. Mở số khi bản mã hỏng — trả lỗi mà giao dịch huỷ, không còn dòng sự kiện (Task 4, AC-8).
5. Lệnh mã hoá lại chạy khi chưa áp migration 008 — phải thoát khác 0 có thông điệp, không ghi gì (Task 5, ca kiểm cột).

---

### Task 1: Bộ mã hoá và dấu vết

**Phục vụ:** E1, E2, E3 · **independent:** true

**Files:**
- Create: `packages/api/src/owners/ma-hoa.ts`
- Test: `packages/api/src/owners/ma-hoa.test.ts`

**Interfaces:**
- Produces:
  - `type KhoaSoChu = { key: Buffer }` (32 byte; giữ tên trường `key` nội bộ)
  - `maHoaSo(so: string, nguCanh: string, khoa: KhoaSoChu): Buffer`
  - `giaiMaSo(banMa: Buffer, nguCanh: string, khoa: KhoaSoChu): string` — ném `Error("bản mã số chủ không giải được")`
  - `dauVetSo(so: string, companyId: string, khoa: KhoaSoChu): Buffer`
  - `nguCanhChuNha(companyId: string, listingId: string): string`
  - `timDangSo(text: string, so: string): string | null` — trả dạng bị bắt trong bốn dạng, dùng chung cho mọi ca quét

- [ ] **Step 1: Viết ca hỏng** — `ma-hoa.test.ts` với các ca tên đúng như `evals.yaml` E1–E3: «mã hoá: khứ hồi ra đúng
  số, khuôn 0x01 ‖ nonce ‖ thẻ ‖ thân» (độ dài 39, byte 0 = 1), «mã hoá: hai lần ra hai bản mã khác», «mã hoá: bản mã
  không mang số ở bốn dạng» (quét hex/base64/utf8 + đối chứng cấy), «mã hoá: sai ngữ cảnh, sai khoá, sửa một byte đều
  bị từ chối» (bảng 7 ca, `assert.equal(dem, 7)`, thông điệp không chứa số và khoá), «dấu vết: cùng số cùng sàn bằng
  nhau, khác sàn hay khác số thì khác» (qua `normalizePhone` của `@quy-hang/core/access`), «dấu vết: không mang số, khoá
  con tách khỏi khoá mã hoá» (so với `createHmac("sha256", khoa.key)` tính trực tiếp).
- [ ] **Step 2:** `npm test -w @quy-hang/api` → FAIL (module chưa có).
- [ ] **Step 3: Cài** — `randomBytes(12)`, `createCipheriv("aes-256-gcm")` với `setAAD(Buffer.from(nguCanh))`; giải: kiểm
  byte 0 và độ dài ≥ 29 trước, bọc mọi lỗi giải mã thành một thông điệp cố định. Dấu vết: `hkdfSync("sha256", key, "",
  "quy-hang/owner-phone-hash/v1", 32)` rồi HMAC.
- [ ] **Step 4:** `npm test -w @quy-hang/api` → PASS. Phá thử: bỏ `setAAD` → ca sai ngữ cảnh đỏ; hoàn lại.
- [ ] **Step 5: Commit** `feat(owners): bộ mã hoá số chủ và dấu vết`.

### Task 2: Đọc khoá, chặn production thiếu khoá

**Phục vụ:** E4 · **independent:** false (cần Task 1, cần ADR của Task 6 cho ca lệnh sinh khoá — ca đó viết ở Task 6)

**Files:**
- Create: `packages/api/src/owners/khoa.ts`, `packages/api/src/owners/khoa.test.ts`
- Modify: `packages/api/src/owners/routes.ts` (`registerOwnerRoutes` gọi `khoaSoChu()` lúc dựng)

**Interfaces:**
- Consumes: `KhoaSoChu`, `maHoaSo` (Task 1)
- Produces: `khoaSoChu(env?: NodeJS.ProcessEnv, opts?: { choPhepKhoaDev?: boolean }): KhoaSoChu` — mặc định
  `choPhepKhoaDev = env.NODE_ENV !== "production"`; `KHOA_DEV: KhoaSoChu`; `laKhoaDev(k: KhoaSoChu): boolean`.

- [ ] **Step 1: Ca hỏng** — «khoá: production thiếu khoá thì createApi ném» (`assert.throws(() => createApi(deps),
  /OWNER_PHONE_KEY/)`, deps giả: `appPool`/`identityPool` là `new pg.Pool()` không kết nối, `auth` từ `createAuth` với
  `captureSender`), «khoá: production với khoá dev bị từ chối», «khoá: sai dạng bị từ chối ở mọi môi trường» (3 giá trị ×
  2 môi trường, `assert.equal(dem, 6)`, thông điệp không chứa giá trị), «khoá: dev thiếu khoá vẫn dựng và vẫn mã hoá».
  Mỗi ca lưu và trả lại `process.env`.
- [ ] **Step 2:** chạy → FAIL. **Step 3:** cài; `registerOwnerRoutes` lấy khoá một lần, truyền vào store.
- [ ] **Step 4:** PASS; phá thử bỏ nhánh production → ca đầu đỏ «không ném». **Step 5: Commit** `feat(owners): khoá số chủ`.

### Task 3: Migration 008 và bộ kiểm cách ly

**Phục vụ:** E5, E7 · **independent:** true (song song Task 1 về tệp; chạy test cần cả hai)

**Files:**
- Create: `packages/db/migrations/008_ma_hoa_so_chu.sql`
- Modify: `packages/db/tests/isolation.test.mjs` (ca chèn dòng 517, mở số 572 và 637 → bản mã; thêm ca mới)

**Interfaces:**
- Produces (SQL): cột `owner_phone_enc bytea`, `owner_phone_hash bytea`; `has_phone` theo `owner_phone_enc`; bốn ràng buộc
  tên ở Global Constraints; `app.reveal_owner_phone(uuid) returns bytea` (drop rồi tạo, giữ thân xét quyền + ghi sự kiện,
  `revoke all … from public`, `grant execute … to quy_hang_app`); grant `insert (owner_phone_enc, owner_phone_hash)`,
  `update (owner_phone_enc, owner_phone_hash)` cho `quy_hang_app`, không grant select hai cột; grant lại `select (has_phone)`.
  Hàm SQL `app.cot_so_ro_chua_chan() returns table(cot text)` — liệt `schema.bảng.cột` kiểu chữ tên chứa `phone` thiếu
  ràng buộc `check (<cột> is null)` (cho ca quét và cho hàng sau dùng lại).
- [ ] **Step 1: Ca hỏng** (tên đúng E5): «số chủ: cơ sở dữ liệu từ chối số rõ ở mọi vai», «số chủ: bản mã sai khuôn bị từ
  chối», «số chủ: vai API không đọc ba cột số», «lược đồ: mọi cột chữ tên chứa phone bị ràng buộc is null» (kèm cấy
  `public.x_quet(x_phone text)` trong giao dịch hoàn lại → hàm trả `public.x_quet.x_phone`). Ba ca cũ dùng hằng
  `BAN_MA_MAU` (Buffer 39 byte bắt đầu 0x01, sinh trong tệp bằng `node:crypto`) và so Buffer.
- [ ] **Step 2:** `npm run db:migrate && npm run test:isolation -w @quy-hang/db` → FAIL.
- [ ] **Step 3:** viết migration theo Interfaces (dùng `/new-migration` để đối chiếu khuôn).
- [ ] **Step 4:** chạy lại → PASS; phá thử bỏ ràng buộc chặn số rõ → ca đầu đỏ; hoàn lại.
- [ ] **Step 5: Commit** `feat(db): migration 008 — số chủ chỉ ở dạng bản mã`.

### Task 4: API ghi bản mã, mở số giải mã

**Phục vụ:** E6, E7, E8 · **independent:** false (cần Task 1–3)

**Files:**
- Modify: `packages/api/src/owners/store.ts` (`putOwner`, `revealPhone` nhận `khoa: KhoaSoChu`), `packages/api/src/owners/routes.ts`
- Modify: `packages/api/test-db/owners.test.ts:93-94` (đọc `owner_phone` null, enc 39 byte)
- Create: `packages/api/test-db/ma-hoa-so-chu.test.ts`

**Interfaces:**
- Consumes: `maHoaSo`, `giaiMaSo`, `dauVetSo`, `nguCanhChuNha`, `timDangSo` (Task 1); `khoaSoChu` (Task 2)
- Produces: `putOwner(tx, listingId, payload, khoa)`, `revealPhone(tx, listingId, khoa)`.
- [ ] **Step 1: Ca hỏng** (tên đúng E6–E8): «mã hoá số chủ: ghi qua API chỉ để lại bản mã», «mã hoá số chủ: hàm mở số trả
  bản mã, không trả số», «mã hoá số chủ: bản mã chép sang hàng khác hay bị sửa không ra số» (hai hàng `0900000021`,
  `0900000022`; kết cục ≥ 400, thân không số, sự kiện không đổi; khôi phục → ra `0900000022`).
- [ ] **Step 2:** `npm run test:db -w @quy-hang/api` → FAIL. **Step 3:** cài: `putOwner` lấy `app.current_company_id()`,
  ghi `owner_phone = null, owner_phone_enc, owner_phone_hash`; `revealPhone` đọc `bytea`, giải mã, lỗi giải mã → `throw`
  để giao dịch huỷ (lỗi máy chủ chung, thông điệp không số).
- [ ] **Step 4:** PASS (cả `owners.test.ts` của hàng 11). Phá thử: đổi ngữ cảnh khi giải → ca chép bản mã đỏ «mở số B ra số A»
  không xảy ra mà ca khôi phục đỏ. **Step 5: Commit** `feat(owners): ghi bản mã, mở số giải mã`.

### Task 5: Lệnh mã hoá lại

**Phục vụ:** E9 · **independent:** false (cần Task 1–4)

**Files:**
- Create: `packages/api/src/owners/ma-hoa-lai.ts`
- Modify: `packages/api/test-db/ma-hoa-so-chu.test.ts`

**Interfaces:**
- Produces: `maHoaLai(client: pg.ClientBase, khoa: KhoaSoChu): Promise<{ daMaHoa: number; daCoBanMa: number }>` (không
  begin/commit — bên gọi giữ giao dịch; cuối cùng `validate constraint`); phần chạy dòng lệnh: `khoaSoChu(process.env,
  { choPhepKhoaDev: false })` + từ chối khoá dev, `begin` → `maHoaLai` → `commit`, in một dòng `đã mã hoá N dòng, M dòng
  đã là bản mã`; lỗi → stderr chỉ thông điệp, exit 1.
- [ ] **Step 1: Ca hỏng** (tên đúng E9): «mã hoá lại: số rõ thành bản mã, chạy lại không đổi byte» (giao dịch: `alter table
  … drop constraint listing_owners_phone_chi_ban_ma`, chèn 3 dòng `0900000031..33` ở 2 sàn, dựng lại NOT VALID;
  `maHoaLai` 3 rồi 0; so byte; `convalidated`; mở số từng dòng qua API — dùng ca riêng commit thật trên sàn thử của
  `RUN` rồi dọn bằng `cleanup` nếu không đi được trong giao dịch), «mã hoá lại: lệnh dòng lệnh chạy hai lần», «mã hoá lại:
  thiếu khoá hay khoá dev thì từ chối, không chạm dòng».
- [ ] **Step 2:** FAIL. **Step 3:** cài. **Step 4:** PASS; phá thử bỏ `where owner_phone is not null` (mã hoá lại dòng đã có) →
  ca so byte đỏ. **Step 5: Commit** `feat(owners): lệnh mã hoá lại số chủ`.

### Task 6: ADR-0013, biến môi trường, Tham chiếu, ca lệnh sinh khoá

**Phục vụ:** E10, E4 (ca lệnh sinh khoá) · **independent:** false (cần Task 2)

**Files:**
- Create: `docs/adr/0013-ma-hoa-so-chu.md` (khối mã đánh dấu `<!-- <<<SINH-KHOA -->` … `<!-- SINH-KHOA>>> -->` chứa
  `openssl rand -base64 32`)
- Modify: `.env.example` (thêm `OWNER_PHONE_KEY=` + một dòng chú thích), `docs/product/tham-chieu.md` (thêm dòng sổ §12)
- Modify: `packages/api/src/owners/khoa.test.ts` (ca «khoá: lệnh sinh khoá ghi trong ADR-0013 cho khoá hợp lệ»)
- [ ] **Step 1:** ca hỏng → FAIL (ADR chưa có). **Step 2:** viết ADR đủ năm ý của E10 (sinh khoá, chỗ giữ theo Hỏi-1/Hỏi-3,
  mất khoá mất số, đếm rồi chạy mã hoá lại, xoá cột là hàng sau) + so trùng theo Hỏi-2 + thứ tự gộp với hàng 24.
- [ ] **Step 3:** PASS. **Step 4: Commit** `docs(adr): ADR-0013 mã hoá số chủ`.

### Task 7: Kiểm trọn và chuyển S4

- [ ] `npm run typecheck && npm run lint && npm test && npm run test:hooks` xanh; `npm run db:migrate && npm run db:test` xanh
  trên Postgres dãy G; vẽ lại `PRODUCT-MAP.md` nếu cần; contract `status: implemented`.
