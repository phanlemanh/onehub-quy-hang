# Nạp dữ liệu mẫu lên bản thật — kế hoạch thi công (hàng 87)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Một nút GitHub Actions nạp hàng, chủ nhà (số mã hoá), người phụ trách, lead mẫu và tài khoản chủ kho vào «[Mẫu] Sàn thử» trên bản thật, chạy lại không đổi gì, gỡ chỉ đúng sàn mẫu.

**Architecture:** Bộ nạp TypeScript `packages/db/seed/nap-ban-that.ts` mở MỘT kết nối vai chủ, MỘT giao dịch. Phần nền (sàn, tài khoản, vai, khu) dùng lại `napMau` của hàng 5; phần hàng, chủ nhà, người phụ trách, lead gọi thẳng hàm ghi của API (`createListing`, `applyCommand`, `assignAgent`, `putOwner`, `createLead`) sau `set local role quy_hang_app` + `set_config` người mẫu đúng vai, rồi `reset role`. Workflow `nap-mau.yml` chạy lệnh ấy trên environment production.

**Tech Stack:** Node 24, `node --import tsx`, `pg`, `node:test`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-01-nap-mau-ban-that-design.md` · hợp đồng `_acceptance/nap-mau-ban-that/contract.md` (AC-1…AC-10) · `evals.yaml` (E1…E12)

## Global Constraints

- Không số điện thoại, tên, email thật trong mã, test, fixture, docs: email thử dạng `t-<run>-chu-kho@example.test`, số `0900 000 0xx`.
- Khoá đọc bằng `khoaSoChu(process.env, { choPhepKhoaDev: false })` (`packages/api/src/owners/khoa.ts`) TRƯỚC khi mở kết nối; thông điệp lỗi chỉ nêu tên biến `OWNER_PHONE_KEY`.
- Không sửa tệp ngoài `packages/db/seed/**`, `.github/workflows/nap-mau.yml`, `_acceptance/nap-mau-ban-that/**` — trừ một dòng thêm vào `_acceptance/config.yaml` (đã có) và Task 3 (đã xin chạm tệp).
- Không sửa `mau/du-lieu-mau.json`, không migration, không đường API mới.
- Tên sàn mẫu `TEN_SAN`, miền `MIEN_EMAIL` lấy từ `packages/db/seed/du-lieu-mau.mjs`; quản trị mẫu = người có `khoa: "quan-tri"` trong gói (`quan-tri@mau.quy-hang.test`).
- Vai chủ kho trong sàn mẫu (Hỏi-2): `["company_admin", "team_lead", "listing_agent", "buyer_agent", "telesales"]`.
- Bộ kiểm chạy bằng `node --import tsx --test "packages/db/seed/*.test.ts"` (`executors.test.nap_mau`) với `DATABASE_URL` tới Postgres dãy (D: cổng 5565) đã `npm run db:migrate`.

## Review Focus

- Sàn thật tên «[Mẫu] Sàn thử» không có quản trị mẫu: nạp phải dựng sàn mẫu riêng, gỡ không chạm — Task 1 ca `san-that-trung-ten`.
- Email chủ kho viết hoa hay có khoảng trắng: chuẩn hoá `trim().toLowerCase()` trước khi so và ghi — Task 1 ca `email-chuan-hoa`.
- Chủ kho đã là thành viên sàn mẫu với vai khác (lần nạp trước theo Hỏi-2 cũ): nạp đặt lại đúng vai, lần sau không đổi — Task 1 ca `vai-chu-kho-dat-lai`.
- Job bấm khi chưa đặt secret `OWNER_PHONE_KEY`: thoát 1 trước khi kết nối, log nêu tên biến — Task 1 ca khoá vắng + Task 2 bước env.
- Gỡ khi sàn mẫu còn tài khoản miền mẫu thuộc sàn khác (không thể theo luật nhưng phòng): chỉ xoá tài khoản miền mẫu không còn là thành viên sàn nào — Task 1 ca gỡ.

---

### Task 1: Bộ nạp và gỡ cho bản thật

**Files:**
- Create: `packages/db/seed/nap-ban-that.ts`
- Modify: `packages/db/seed/nap.mjs` (`napMau(client, d, sanId?)` — có `sanId` thì dùng sàn ấy, không tìm theo tên; vắng giữ hành vi cũ)
- Test: `packages/db/seed/nap-ban-that.test.ts`

**Interfaces:**
- Consumes: `napMau` (`nap.mjs`); `createListing`, `applyCommand`, `viewerOf`, `isRefusal` (`packages/api/src/listings/store.ts`); `assignAgent`, `putOwner` (`packages/api/src/owners/store.ts`); `createLead` (`packages/api/src/leads/store.ts`); `khoaSoChu` (`owners/khoa.ts`); `dauVetSo`, `giaiMaSo`, `nguCanhChuNha`, `nguCanhLead` (`owners/ma-hoa.ts`).
- Produces:
  - `export const VAI_CHU_KHO: readonly string[]`
  - `export async function timSanMau(client: pg.ClientBase): Promise<string[]>` — id sàn tên `TEN_SAN` có quản trị mẫu là thành viên.
  - `export async function napBanThat(client: pg.ClientBase, goi: GoiMau, opts: { khoa: KhoaSoChu; email: string }): Promise<{ san: string; moi: { hang: number; chuNha: number; lead: number } }>` — chạy TRONG giao dịch người gọi mở; ném `Error` khi một hàm ghi trả từ chối (thông điệp nêu mã hàng hay mã lead, ví dụ `L-12: invalid-payload`).
  - `export async function goBanThat(client: pg.ClientBase): Promise<{ ket: "khong-co" } | { ket: "da-go"; san: string; nguoi: number } | { ket: "tu-choi"; soSan: number }>`
  - CLI: `node --import tsx packages/db/seed/nap-ban-that.ts --nap --email <email> | --go`; một kết nối `DATABASE_URL`, `begin`/`commit`, lỗi thì `rollback` và thoát 1; `tu-choi` thoát 1; stdout `đã nạp <tên sàn>: <h> hàng, <c> chủ nhà, <l> lead mới` — không in email, id người, số.

Quy ước dựng dữ liệu (quyết ở đây, bộ kiểm dựa vào):
- `trongVai(client, userId, sanId, fn)`: `set local role quy_hang_app` + `select set_config('app.user_id',$1,true), set_config('app.company_id',$2,true)`, chạy `fn(client)`, rồi `reset role` (cả khi `fn` ném — để giao dịch rollback được).
- Toà của hàng: `buildingName` của căn mang `upi` của hàng trong `goi.danhMuc`; mã căn = `maCan`. Lead: toà = `buildingName` của toà `toa`, mã căn = `maCan` (null giữ null).
- Mỗi hàng: đầu chủ của gói (`dauChu` → người mẫu `khoa`) `createListing({buildingName, unitNumber})` → trưởng nhóm `assignAgent({userId: đầu chủ})` → đầu chủ `putOwner({ownerName, ownerPhone})` từ chủ nhà `chuNha` (số bỏ khoảng trắng) → đầu chủ `price_changed {listPrice: gia, feeInclusion: bao_phi→"included", khong_bao_phi→"excluded"}` → theo `trangThai`:
  Incomplete: dừng · Active: `details_changed {legalStatus:"Sổ hồng", occupantType:"Chủ ở"}` + `status_changed {to:"Active"}` · Pending/Closed/Hold: như Active rồi `status_changed {to}`; Closed kèm `closePrice: gia, closeDate: "2026-10-30"` · Withdrawn: từ Incomplete `status_changed {to:"Withdrawn", withdrawnReason: WITHDRAWN_REASONS[i % 3]}` với `i` = thứ tự hàng Withdrawn trong gói. `expectedVersion` = phiên bản hiện tại (đọc từ kết quả lệnh trước).
- Lead: telesales `createLead({buildingName, unitNumber, need:"sale", listPrice: 3_000_000_000 + 10_000_000*i, feeInclusion:"excluded", desiredListingTime:"now", ownerPhone})`, `i` = thứ tự lead trong gói; nạp SAU mọi hàng.
- Chạy lại (vai chủ đọc): hàng đã có = cùng `(building_name, unit_number)` trong sàn mẫu → bỏ qua cả chuỗi của hàng; chủ nhà có dòng → bỏ qua; lead đã có = cùng `(building_name, unit_number is not distinct from, owner_phone_hash = dauVetSo(số, sàn, khoa))` → bỏ qua.
- Email: `trim().toLowerCase()`; từ chối (ném trước mọi câu ghi) khi không khớp `^[^@\s]+@[^@\s]+\.[^@\s]+$` hoặc kết thúc bằng `@${MIEN_EMAIL}`. Tài khoản chưa có → tạo như `napMau` tạo người mẫu (`emailVerified` true, `name` = phần trước `@`); dòng thành viên sàn mẫu `on conflict do update set roles = VAI_CHU_KHO where roles is distinct from`.
- Sàn: `timSanMau` 1 id → dùng; 0 → `insert into companies (name)`; ≥2 → ném `có <n> sàn mẫu khớp — không nạp`. Rồi `napMau(client, goi, sanId)`.
- Gỡ: 0 → `khong-co`; ≥2 → `tu-choi`; 1 → `delete from companies where id = $1`, rồi `delete from identity."user" u where email like '%@'||MIEN_EMAIL and not exists (select 1 from company_members m where m.user_id = u.id)`.

- [ ] **Step 1: Viết bộ kiểm hỏng trước** — `nap-ban-that.test.ts`, mỗi `test()` dựng lại fixture: một sàn thật (`openCompany` của `packages/api/test-db/helpers.ts` hay SQL vai chủ) có 1 hàng, 1 chủ nhà, 1 lead, 1 thành viên; khoá thử = `{ key: randomBytes(32) }` đặt vào `process.env.OWNER_PHONE_KEY` (base64); `NODE_ENV=production`. `after()` gỡ sàn mẫu và xoá fixture. Ảnh chụp `chup(client)` = mọi bảng của schema `public` và `identity`, mọi cột, `order by` mọi cột, JSON.
  - `nap-du-goi` (E1): 6 người mẫu đúng vai gói; `company_zones` 2; `listings` 40, đếm theo `standard_status` = `{Active:14, Incomplete:6, Pending:5, Closed:5, Hold:5, Withdrawn:5}`; mỗi hàng có sự kiện `created` và `listing_agent_assignments` mới nhất = đầu chủ của gói; `listing_owners` 40, tập tên = 30 tên của gói; `leads` 12; outcome L-01 `unit_has_open_listing`, L-02 `owner_has_agent`, 10 lead còn lại `new`.
  - `trung-do-luat-tinh` (E1 chiều đỏ): bản sao gói đổi H-04 sang `Closed` (hàng mở của căn L-01) và đổi số chủ CN-01 → L-01, L-02 ra `new`; thông điệp so sánh nêu mã lead.
  - `chi-ban-ma` (E2): mọi dòng sàn mẫu `owner_phone is null`; `giaiMaSo(enc, nguCanhChuNha(san, listing), khoa)` = số gói bỏ khoảng trắng (40/40), tương tự lead; giải bằng khoá khác ném; giải bản mã dòng A với ngữ cảnh dòng B ném; `owner_phone_hash` = `dauVetSo`.
  - `khoa-sai` (E3): ba ca chạy CLI bằng `spawnSync(process.execPath, ["--import","tsx", path, "--nap","--email", e])` với `OWNER_PHONE_KEY` vắng / `"abc"` / khoá dev (`KHOA_DEV.key.toString("base64")`): mã ≠ 0, stderr có `OWNER_PHONE_KEY`, không chứa giá trị khoá; `chup` trước = sau. Đối chứng: khoá hợp lệ → mã 0.
  - `chay-lai` (E4): nạp, `chup` A; nạp lần hai, `chup` B; `assert.deepEqual(B, A)`; kết quả lần hai `moi` = `{hang:0, chuNha:0, lead:0}`. Chiều đỏ: sửa `list_price` một hàng giữa hai lần chụp → `deepEqual` đỏ (bắt bằng `assert.throws`).
  - `email-chu-kho` (E5): email mới → tài khoản được tạo, vai = `VAI_CHU_KHO`; email đã là thành viên sàn thật → dòng thành viên sàn thật nguyên vẹn; `' T-X-Chu-Kho@Example.Test '` khớp tài khoản đã có (`email-chuan-hoa`); vai cũ khác bị đặt lại, lần sau không đổi (`vai-chu-kho-dat-lai`); `abc` và `x@mau.quy-hang.test` ném trước khi ghi (`chup` không đổi); stdout/stderr CLI không chứa email; `git ls-files -z | xargs -0 grep -l <email thử>` rỗng.
  - `go` (E6): `chup` trước nạp → nạp → gỡ → `chup` bằng trước nạp trừ dòng `identity.user` của chủ kho mới tạo; tài khoản chủ kho còn với dòng thành viên sàn thật. `hai-san-mau`: tạo sàn thứ hai cùng tên + thêm quản trị mẫu làm thành viên → gỡ `tu-choi`, `chup` không đổi. `khong-co`: gỡ khi chưa nạp → `khong-co`, `chup` không đổi. `san-that-trung-ten`: sàn thật tên `TEN_SAN` không quản trị mẫu → gỡ `khong-co` không chạm nó; nạp dựng sàn mẫu khác id, sàn trùng tên không thêm dòng; đối chứng: sàn mẫu thật gỡ được.
  - `hong-giua-chung` (E7): bản sao gói với L-12 `soDienThoai: "12345"` → `napBanThat` ném, thông điệp có `L-12`; sau `rollback` `chup` bằng trước. Đối chứng: gói nguyên vẹn nạp được.
  - `doc-cheo` (E9): sau nạp, thành viên sàn thật trong `trongVai` đọc `listings`, `listing_owners`, `leads`, `listing_events` lọc `company_id = sàn mẫu` → 0 dòng mỗi bảng; thành viên sàn mẫu (đầu chủ) đọc `listings` → >0.
  - `tra-danh-muc` (E12): `createApi` dựng như `packages/api/test-db/catalog/catalog.test.ts`, đăng nhập bằng tài khoản chủ kho thử, chọn sàn mẫu, gọi đường tra danh mục → 180 căn; tra mã căn `A-01.03` ra đúng căn ấy; phiên chưa thuộc sàn nào → 403.
- [ ] **Step 2:** `DATABASE_URL=postgres://postgres:quyhang@localhost:5565/postgres node --import tsx --test "packages/db/seed/*.test.ts"` → đỏ vì `nap-ban-that.ts` chưa có.
- [ ] **Step 3:** Viết `nap-ban-that.ts` theo Interfaces và quy ước trên; sửa `napMau` nhận `sanId`.
- [ ] **Step 4:** Chạy lại Step 2 → mọi ca xanh; `node --test "packages/db/seed/*.test.mjs"` (bộ hàng 5) xanh; `npm run db:test` (bộ kiểm cách ly, E11) xanh; `npm run typecheck && npm run lint` xanh. Phá thử: tạm đổi `VAI_CHU_KHO` bỏ `telesales` → `email-chu-kho` đỏ nêu vai; hoàn lại.
- [ ] **Step 5:** Commit `feat(seed): bộ nạp mẫu cho bản thật qua hàm ghi của API`.

**Phục vụ:** E1–E7, E9–E12 · **independent:** false

### Task 2: Nút «Nạp dữ liệu mẫu» trên GitHub Actions

**Files:**
- Create: `.github/workflows/nap-mau.yml`
- Test: `packages/db/seed/nap-mau-yml.test.mjs`

**Interfaces:**
- Consumes: CLI của Task 1 (`--nap --email <e>` | `--go`).
- Produces: workflow tên `Nạp dữ liệu mẫu`.

Nội dung đã quyết: `on: workflow_dispatch` với `inputs.viec` (choice `nap`/`go`, mặc định `nap`), `inputs.email` (string, không bắt buộc — `go` không cần), `inputs.xac_nhan` (string). Một job `nap-mau`, `environment: production`, `runs-on: ubuntu-latest`, `concurrency: { group: nap-mau-production, cancel-in-progress: false }`, `env: { DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}, OWNER_PHONE_KEY: ${{ secrets.OWNER_PHONE_KEY }}, NODE_ENV: production }`. Bước theo thứ tự: (1) `Chỉ nhánh main` — `[ "$GITHUB_REF" = "refs/heads/main" ] || { echo "Nút chỉ chạy từ nhánh main"; exit 1; }`; (2) `Che email` — đọc `inputs.email` qua `env: EMAIL`, `echo "::add-mask::$EMAIL"`; (3) `Xác nhận gỡ` (chỉ khi `viec == 'go'`) — so `env: XAC_NHAN` với `[Mẫu] Sàn thử`, khác thì `exit 1`; (4) checkout, setup-node `.nvmrc` + cache npm, `npm ci`; (5) chạy `node --import tsx packages/db/seed/nap-ban-that.ts --nap --email "$EMAIL"` hay `--go`. Không dùng `${{ inputs.* }}` trực tiếp trong `run:` (chặn chèn lệnh) — chỉ qua `env`.

- [ ] **Step 1: Viết bộ kiểm hỏng trước** `nap-mau-yml.test.mjs` (đọc tệp bằng `yaml` nếu kho có sẵn, không thì phân tích dòng): `chi-workflow-dispatch` (khoá `on` chỉ một khoá), `ba-tham-so`, `environment-production`, `chan-nhanh-main` (bước đầu tiên chứa `refs/heads/main` và `exit 1`), `xac-nhan-go` (bước có `if` `go` so `[Mẫu] Sàn thử`), `che-email-truoc-khi-nap` (chỉ số bước `::add-mask::` < chỉ số bước chạy bộ nạp), `bi-mat-chi-trong-env` (mọi `secrets.` nằm dưới khoá `env`; không dòng `run` nào chứa `secrets.` hay `${{ inputs.`), `node-env-production`. Chiều đỏ cùng fixture: bản sao chuỗi tệp bỏ bước chặn nhánh → hàm kiểm trả lỗi `chặn nhánh` (hàm kiểm tách thành `kiemWorkflow(text): string[]`, ca đỏ gọi trên chuỗi đã sửa).
- [ ] **Step 2:** `node --test packages/db/seed/nap-mau-yml.test.mjs` → đỏ (tệp chưa có).
- [ ] **Step 3:** Viết `nap-mau.yml`.
- [ ] **Step 4:** Chạy lại → xanh; `actionlint` nếu máy có (không có thì bỏ, ghi một dòng).
- [ ] **Step 5:** Commit `ci(nap-mau): nút nạp và gỡ dữ liệu mẫu trên bản thật`.

**Phục vụ:** E8 · **independent:** true

### Task 3: Tài liệu vận hành

**Files:**
- Modify: `packages/db/seed/README.md` (mục «Bản thật»: lệnh, nút, gỡ, điều kiện secret)
- Modify: `docs/adr/0013-ma-hoa-so-chu.md` §5 — thêm một đoạn: bản thứ ba của khoá ở secret GitHub environment `production`, environment giới hạn nhánh `main`, dùng duy nhất cho nút nạp mẫu (Hỏi-1 hàng 87). Xin chạm tệp trước (`dieu-phoi.mjs yeu-cau cham-tep --tep docs/adr/0013-ma-hoa-so-chu.md`).

- [ ] **Step 1:** Sửa hai tệp; README nêu đúng bốn bước vận hành của thiết kế.
- [ ] **Step 2:** `npm run lint` xanh.
- [ ] **Step 3:** Commit `docs(nap-mau): vận hành nút nạp mẫu, chỗ giữ khoá`.

**Phục vụ:** (vận hành sau gộp) · **independent:** true
