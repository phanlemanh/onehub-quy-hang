# Trạng thái riêng (hàng 46) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị sàn thêm nhãn trạng thái riêng neo vào một trong sáu trạng thái chuẩn; căn mang nhãn hiện đúng chữ, màu và
luật của neo ở Bảng hàng, Hôm nay, trang khách; đếm vẫn theo sáu trạng thái chuẩn.

**Architecture:** Định nghĩa nhãn ở `company_settings` (khoá `labels.status.<mã>`), căn mang mã ở cột mới
`listings.status_label` đặt bằng `status_changed {to, label}`; lõi `@quy-hang/core/statuses` giữ mọi luật (kiểm bộ nhãn,
chữ của căn, kiểm nhãn của sự kiện); API `/company/statuses`; ba mặt đọc bộ nhãn qua `TuVung` của hàng 45.

**Tech Stack:** TypeScript chặt, Hono + zod-openapi, PostgreSQL 16 (luật theo dòng), Next.js App Router, node:test qua tsx.

**Spec:** `docs/superpowers/specs/2026-11-06-trang-thai-rieng-design.md` · hợp đồng `_acceptance/trang-thai-rieng/contract.md`
(đã duyệt 05/11) · tiêu chí `_acceptance/trang-thai-rieng/evals.yaml`.

## Global Constraints

- Migration đúng tệp `packages/db/migrations/047_trang_thai_rieng.sql` (giám sát cấp B-17); không sửa migration đã commit.
- Khuôn mã nhãn `^[a-z][a-z0-9_]{0,31}$` — một hằng `MA_NHAN_RE` ở lõi, check của migration chép đúng khuôn.
- Trần 3 nhãn còn sống mỗi trạng thái chuẩn; chữ 1–40 ký tự sau khi bỏ khoảng trắng hai đầu; không số điện thoại, email, giấy tờ;
  không trùng nhãn mặc định hay nhãn riêng khác (`chuSo`: bỏ hoa thường, dấu cách thừa) — Hỏi-7 đã duyệt.
- Nhãn mặc định sáu trạng thái: Chưa đủ để rao · Đang bán · Đang giao dịch · Đã bán · Tạm ngừng · Ngừng hẳn (lõi
  `NHAN_TRANG_THAI_MAC_DINH`, chữ không đổi so với `STATUS_LABEL` cũ).
- Nhãn lớp `company_internal`: không bao giờ vào thân trang khách hay bản xuất (bất biến 4).
- Dữ liệu thử: «[Tên]», `0900 000 0xx`; mã nhãn trong ca: `giu_cho` («Giữ chỗ», neo `Pending`).
- Bộ kiểm DB chạy với `DATABASE_URL=postgres://postgres:quyhang@localhost:5572/postgres` (Postgres dãy B).

## Review Focus

- Đổi nhãn tại chỗ (`to` = trạng thái hiện tại) đi qua MỌI chỗ đọc `status_changed` — mốc «Đang bán N ngày», dữ kiện «đã từng
  tới», hàm SQL — không đặt lại mốc nào (Task 4 E6c, Task 3 hang-doi).
- Gỡ nhãn kèm thay khi một căn trong số căn mang nhãn đã bị người khác đổi trạng thái giữa lúc hỏi và lúc lưu: máy chỉ ghi sự
  kiện cho căn còn mang mã ấy ở thời điểm ghi, trong giao dịch có khoá (Task 4, ca «gỡ nhãn: căn đã đổi giữa chừng»).
- Bộ nhãn tải về Bảng hàng cũ hơn máy chủ (nhãn vừa gỡ): ô hiện chữ mặc định, thực đơn không còn lựa chọn ấy, lệnh cũ mang mã đã
  gỡ bị máy chủ từ chối 400 và bản trên máy hoàn lại (Task 7 ca «mã đã gỡ», Task 4 E4).
- Nhãn có chữ hoa thường khác nhau giữa hai lần lưu («giữ chỗ» → «Giữ chỗ») là đổi tên cùng mã, không tạo mã mới (Task 2).
- Sàn chưa đặt nhãn: mọi đường cũ (Bảng hàng, Hôm nay, trang khách, phát hàng) cho đúng chữ cũ từng byte (Task 7 E10, Task 8).

---

### Task 1: Migration 047 và ca cách ly

**independent:** true · **phục vụ:** E9 (1), tiền đề E1, E3

**Files:**
- Create: `packages/db/migrations/047_trang_thai_rieng.sql`
- Modify: `packages/db/tests/isolation.test.mjs` (thêm ca cuối tệp)

- [ ] **Step 1: Ca kiểm** «trạng thái riêng: dòng labels.status.* theo sàn và cột status_label» — quản trị A chèn
  `labels.status.giu_cho` value `{"label":"Giữ chỗ","anchor":"Pending"}` và A đọc lại được 1 dòng (đối chứng dương); người
  sàn B `select … where key like 'labels.status.%' and company_id = A` → 0 dòng; chèn khoá `labels.status.Giu Cho` →
  lỗi `company_settings_key_check`; khoá `Lead Routing` và `labels.field.feeInclusion`, `labels.value.feeInclusion` giữ hành
  vi cũ; `update listings set status_label = 'giu_cho'` qua; `= 'Giữ chỗ'` → lỗi `listings_status_label_check`.
- [ ] **Step 2:** `npm run db:migrate && node --test packages/db/tests/isolation.test.mjs` → ca mới FAIL (cột/khoá chưa có).
- [ ] **Step 3: Viết 047**: `alter table listings add column status_label text constraint listings_status_label_check check
  (status_label is null or status_label ~ '^[a-z][a-z0-9_]{0,31}$')`; `grant update (status_label) on listings to
  quy_hang_app` theo đúng mẫu grant cột của các migration trước (đọc 004/020 để chép mẫu); drop/add
  `company_settings_key_check` thêm vế `or key ~ '^labels\.status\.[a-z][a-z0-9_]{0,31}$'`, giữ nguyên hai vế của 039.
  Comment đầu tệp theo khuôn 039 (lý do, số do giám sát cấp B-17).
- [ ] **Step 4:** cùng lệnh → PASS; chiều đỏ: tạm bỏ vế `labels\.status` khỏi bản sao check → ca nêu `company_settings_key_check`.
- [ ] **Step 5: Commit** `feat(db): trang-thai-rieng — migration 047 cột status_label, khoá labels.status.*`

### Task 2: Lõi `statuses` — bài kiểm và các hàm còn thiếu

**independent:** true · **phục vụ:** E2, E6b, E10b

**Files:**
- Modify: `packages/core/src/statuses/index.ts` (đã có: `kiemNhanTrangThai`, `maNhanMoi`, `boNhanTrangThai`, `nhanCuaCan`,
  `kiemNhanSuKien`, `nhanTuBang`, `NHAN_TRANG_THAI_MAC_DINH`)
- Create: `packages/core/src/statuses/statuses.test.ts`

**Interfaces — Produces:**
- `kiemNhanTrangThai(gui: NhanGui[], daCo: NhanTrangThai[]): {ok:true; nhan: NhanTrangThai[]} | {ok:false; loi:string}`
- `dongNhanTrangThai(nhan: NhanTrangThai[]): {key:string; value:{label:string;anchor:StandardStatus}}[]` — dòng sẽ ghi
- `doiNhanTrangThai(daLuu: {key;value}[], moi: NhanTrangThai[]): {key:string; value: {label;anchor} | null}[]` — chỉ khoá đổi;
  mã vắng trong `moi` mà đang sống → `null`; so value bằng chuỗi khoá đã sắp (như `chuSo` của hàng 45)
- `bangTrangThai(nhan: NhanTrangThai[], inUse: Record<string, number>): { statuses: {status; default; labels:{code;label;inUse}[]}[] }`

- [ ] **Step 1: Bài kiểm** (tên ca đúng như evals): «trạng thái riêng: kiểm bộ nhãn» — bảng mười hai dòng của E2 (mỗi dòng
  một assert, đếm `assert.equal(BANG.length, 12)`); `maNhanMoi("Giữ chỗ", [])` = `"giu_cho"`, với `["giu_cho"]` = `"giu_cho_2"`;
  đổi chữ «giữ chỗ» → «Giữ chỗ» với `code: "giu_cho"` giữ mã. «trạng thái riêng: đếm theo chuẩn» — `tiLeHangMo` (đọc chữ ký ở
  `packages/core/src/metrics/hang.ts`) trên bốn bản hàng viết trước cho `Object.keys(theoTrangThai)` deepEqual
  `STANDARD_STATUSES`, Pending 3, Active 1; hàng đợi mặc định xếp căn Pending/giu_cho cùng nhóm căn Pending/null.
  «trạng thái riêng: sàn chưa đặt» — `boNhanTrangThai([])` deepEqual `[]`; dòng hỏng bỏ qua không ném. Thêm ca cho
  `doiNhanTrangThai` (gửi lại cùng bộ → `[]`; gỡ mã sống → một dòng `null`) và `bangTrangThai` (sáu dòng thứ tự chuẩn).
- [ ] **Step 2:** `node --import tsx --test packages/core/src/statuses/statuses.test.ts` → FAIL ở hàm chưa có.
- [ ] **Step 3:** viết `dongNhanTrangThai`, `doiNhanTrangThai`, `bangTrangThai`.
- [ ] **Step 4:** cùng lệnh PASS; chiều đỏ: bỏ khối kiểm trùng nhãn mặc định → dòng «Đang bán» đỏ (hoàn lại).
- [ ] **Step 5: Commit** `feat(core): trang-thai-rieng — lõi nhãn trạng thái và bài kiểm`

### Task 3: Lõi hàng — sự kiện, bản gập, mốc của Hôm nay

**independent:** false (sau Task 2) · **phục vụ:** E3b, E10b, tiền đề E6c, E7

**Files:**
- Modify: `packages/core/src/listing/events.ts:58-63` (khoá `label` của `status_changed`), `packages/core/src/listing/fold.ts`
  (`ListingState.statusLabel: string | null`, `stepListing`), `packages/core/src/today/kieu.ts` (`LanDoi` thêm
  `fromLabel?: string | null; toLabel?: string | null`; `DuKienCan` thêm `lucVaoTrangThai: string | null`),
  `packages/core/src/today/hang-doi.ts:16` (`lucLenDangBan = c.standardStatus === "Active" ? c.lucVaoTrangThai : null`)
- Create: `packages/core/src/listing/nhan-trang-thai.test.ts`

- [ ] **Step 1: Bài kiểm** «bản gập: nhãn trạng thái» — chuỗi sáu sự kiện của E3b, statusLabel từng bước
  `[null, null, "giu_cho", null, "giu_cho", null]`; validatePayload nhận `label: "giu_cho"` và `null`, từ chối `"Giữ chỗ"` và
  `7`; `checkTransition("Pending","Pending")` không qua; `kiemNhanSuKien` cho Pending/null → Pending/giu_cho `doiNhanTaiCho:
  true`, Pending/giu_cho → Pending/giu_cho lỗi. Bài kiểm có từ trước của `listing/**` và `today/**` sửa đúng một chỗ: fixture
  `DuKienCan` thêm `lucVaoTrangThai` (giá trị = `lastStatusChange.at` cũ khi to Active), không đổi kỳ vọng nào khác.
- [ ] **Step 2:** `node --import tsx --test packages/core/src/listing/nhan-trang-thai.test.ts` → FAIL.
- [ ] **Step 3:** sửa bốn tệp như Files; `stepListing` đặt `s.statusLabel = (p.label as string | null | undefined) ?? null` ở
  mọi `status_changed`; `foldListing` khởi tạo `statusLabel: null`.
- [ ] **Step 4:** `npm test -w @quy-hang/core` PASS; `npm run typecheck` sẽ đỏ ở API/web vì `ListingState`/`DuKienCan` mới —
  Task 4, 7, 8 sửa; ghi lại danh sách lỗi.
- [ ] **Step 5: Commit** `feat(core): trang-thai-rieng — sự kiện mang nhãn, bản gập, mốc vào trạng thái`

### Task 4: API — `/company/statuses`, lệnh đổi trạng thái, lần đổi, đồng bộ

**independent:** false (sau Task 1, 3) · **phục vụ:** E1, E2b, E3, E3d, E4, E5, E6c, E7b, E7c, E8, E9 (2)

**Files:**
- Create: `packages/api/src/statuses/routes.ts`, `packages/api/src/statuses/store.ts`,
  `packages/api/test-db/trang-thai-rieng/nhan.test.ts`
- Modify: `packages/api/src/app.ts` (đăng ký route), `packages/api/src/labels/store.ts` + `routes.ts` (GET thêm `statuses`),
  `packages/api/src/listings/store.ts` (`STATE_COLUMNS.statusLabel = "status_label"`; `applyCommand` gọi `kiemNhanSuKien` với
  bộ nhãn của sàn đọc trong cùng giao dịch; đổi nhãn tại chỗ bỏ `checkTransition`), `packages/api/src/listings/lan-doi.ts`
  (sc lấy thêm `label` của sự kiện cuối và của sự kiện trước; cột mới `vao_at` = `occurred_at` của `status_changed` cuối có `to`
  khác `to` của sự kiện cùng loại liền trước), `packages/api/src/today/store.ts` (đưa `lucVaoTrangThai`)

**Interfaces — Produces:** `readStatuses(tx): BangTrangThai`, `writeStatuses(tx, input): BangTrangThai | {refusal:
"forbidden"} | {refusal:"invalid"; reason} | {refusal:"in-use"; code; count}` — 409 cho `in-use`; `nhanCuaSan(tx):
NhanTrangThai[]` (dùng ở `applyCommand` và lan-doi). Thân PUT: `{ labels: NhanGui[], replace?: Record<string, string|null> }`.

- [ ] **Step 1: Bài kiểm DB** — một tệp, các ca đúng tên trong evals: thêm nhãn (E1), bộ nhãn sai (E2b), căn mang nhãn (E3),
  nhãn đi qua đồng bộ (E3d — gọi đường kéo của `packages/api/src/sync/routes.ts`), luật của neo và mã lạ (E4), trang khách theo
  neo (E5), mọi chỗ đọc payload to (E6c — bảng viết trước sáu chỗ: `listings/store.ts`, `listings/lan-doi.ts`,
  `today/store.ts`, `today-buyer/store.ts`, `contacts/read/store.ts`, `packages/db/migrations/*.sql` gộp một dòng; ca đếm bằng
  `grep -rln "payload ->> 'to'"` khớp số tệp), Hôm nay mang nhãn (E7b), từ vựng mang bộ nhãn (E7c), đổi tên và gỡ nhãn (E8),
  sàn khác và vai khác (E9-2), cộng ca Review Focus «gỡ nhãn: căn đã đổi giữa chừng» (một trong hai căn đổi sang Active trước
  PUT → chỉ căn còn giu_cho nhận sự kiện). Dựng sàn qua đường ghi thật như `test-db/cach-goi-rieng/nhan.test.ts`.
- [ ] **Step 2:** `DATABASE_URL=… node --import tsx --test packages/api/test-db/trang-thai-rieng/nhan.test.ts` → FAIL.
- [ ] **Step 3:** viết store: kiểm vai quản trị (`rolesOf`), `pg_advisory_xact_lock(hashtextextended('trang-thai:'||sàn,0))`,
  `kiemNhanTrangThai(than.labels, nhanCuaSan)`; mã bị gỡ mà `select count(*) from listings where status_label = $1` > 0 cần
  `replace[mã]` (thiếu → in-use), mã thay phải cùng neo hay `null`; ghi `doiNhanTrangThai`; với mỗi căn còn mang mã gỡ (đọc
  trong giao dịch) gọi đúng hàm ghi sự kiện mà `applyCommand` dùng với `{type:"status_changed", payload:{to: trạng thái hiện
  tại, label: thay}}`; trả `readStatuses`. Route theo khuôn `labels/routes.ts` (vào, tra lỗi 400/401/403/409).
- [ ] **Step 4:** cùng lệnh PASS; `npm run db:test` PASS; chiều đỏ từng ca như evals (hoàn lại sau mỗi lần).
- [ ] **Step 5: Commit** `feat(api): trang-thai-rieng — /company/statuses, lệnh mang nhãn, lần đổi tách mốc`

### Task 5: Bộ kiểm rò rỉ

**independent:** true (chỉ cần `ListingState.statusLabel` của Task 3) · **phục vụ:** E5b

**Files:** Create `packages/core/src/redaction/nhan-trang-thai.ro-ri.test.ts`

- [ ] **Step 1:** ca «rò rỉ: nhãn trạng thái riêng không ra ngoài» — bản hàng Pending `statusLabel: "MOI-NHAN-TT"` (mồi ngoài
  khuôn mã, chỉ để quét): `JSON.stringify(banRaNgoai(...))` cho `khach_rieng`, `nhom_moi_gioi` không chứa mồi, không khoá
  `statusLabel`, `availability === "under_contract"`; `xuatBang` nhóm môi giới không chứa mồi; đối chứng dương: hàm bọc thêm
  `statusLabel` vào kết quả → bộ quét bắt mồi.
- [ ] **Step 2–4:** `npm run test:ro-ri` — ca mới chạy được và xanh ngay (luật đã đúng); chiều đỏ bằng đối chứng dương.
- [ ] **Step 5: Commit** `test(core): trang-thai-rieng — rò rỉ nhãn trạng thái`

### Task 6: Màn Trạng thái `settings/statuses`

**independent:** true (chỉ dựa khuôn thân API của Task 4 Interfaces) · **phục vụ:** E2c, E8b, E9b, E11, E13, E14, E14b

**Files:**
- Create: `apps/web/src/app/(app)/settings/statuses/page.tsx` (khuôn `settings/labels/page.tsx`: `chanMucSan` → redirect, đọc
  `GET /api/v1/company/statuses`, `MucCaiDat title="Trạng thái" … khoi`), `.../statuses/trang-thai.test.ts`
- Modify (đã có): `trang-thai-thuan.ts`, `trang-thai.tsx`; `design/patterns/trang-tam.md` (thêm `ngoai_le` cho
  `settings/statuses/page.tsx`, `ly_do` «Màn thật Trạng thái (hàng 46) — thuộc nhóm cai-dat-san, rời trang tạm theo
  KH-tt-roi-nhom»); `_acceptance/trang-thai-rieng/kiem-khuon-e14.mjs` (đã chép — chạy, sửa nếu đối chứng đỏ)

- [ ] **Step 1: Bài kiểm** «màn trạng thái: thân lưu và khoá Lưu» (E2c), «màn trạng thái: hỏi nhãn thay» (E8b), «màn trạng
  thái: trang gọi chặn mục sàn và chuyển hướng» (E9b) — giá trị đúng như evals.
- [ ] **Step 2:** `node --import tsx --test "apps/web/src/app/(app)/settings/statuses/trang-thai.test.ts"` → FAIL (page chưa có).
- [ ] **Step 3:** viết `page.tsx`; sửa `trang-tam.md`.
- [ ] **Step 4:** PASS; `npm run lint` sạch; `node _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs` in «E14b: chỉ có dòng báo
  oan đã khai».
- [ ] **Step 5: Commit** `feat(web): trang-thai-rieng — màn Cài đặt › Trạng thái`

### Task 7: Bảng hàng — chữ, màu, trình sửa ô, thẻ điện thoại, áp trên máy

**independent:** false (sau Task 3; bộ nhãn từ `docTuVung` cần Task 4 GET labels) · **phục vụ:** E3c, E4b, E6, E10, E12

**Files:**
- Modify: `packages/core/src/labels/index.ts` (`TuVung.trangThai?: readonly NhanTrangThai[]`; `tuVungTuBang` đọc `statuses`
  qua `nhanTuBang`) — vùng `packages/core/src/labels/**` khai thêm bằng `hang vung` trước khi sửa
- Modify: `apps/web/src/app/(app)/inventory/cot.ts` (`DongBang.statusLabel`; `STATUS_LABEL` = `NHAN_TRANG_THAI_MAC_DINH`;
  `chuCuaO` ca `standardStatus` → `nhanCuaCan(tv?.trangThai, d.standardStatus, d.statusLabel)`; `giaTriChon` giữ trạng thái
  chuẩn), `bang-hang.tsx` (huy hiệu dùng `MAU_TRANG_THAI` + `chuCuaO`), `cell-edit/lenh.ts` (`luaChonTrangThai(hang, nhan):
  {to; label: string|null; chu}[]` — nấc đích theo `TRANSITIONS`, mỗi nấc nhãn mặc định rồi nhãn riêng; đang có nhãn riêng thì
  thêm các lựa chọn cùng nấc; `dungLenhTrangThai` nhận `label`), `cell-edit/tren-o.tsx` (thực đơn đọc `luaChonTrangThai`),
  `cards/the-can.tsx` (Pending hiện `nhanCuaCan`), `apps/web/src/lib/sync/ap-tren-may.ts` (đổi nhãn tại chỗ dùng
  `kiemNhanSuKien` thay `checkTransition`)
- Create: `apps/web/src/app/(app)/inventory/trang-thai-rieng.test.ts`

- [ ] **Step 1: Bài kiểm** — bốn ca đúng tên evals E3c, E4b, E6, E10 cộng ca Review Focus «mã đã gỡ»: căn mang mã không còn
  trong bộ nhãn → ô «Đang giao dịch», thực đơn không có lựa chọn ấy.
- [ ] **Step 2:** `node --import tsx --test "apps/web/src/app/(app)/inventory/trang-thai-rieng.test.ts"` → FAIL.
- [ ] **Step 3:** sửa các tệp như Files.
- [ ] **Step 4:** PASS; `npm test -w @quy-hang/web` — bài kiểm có từ trước của inventory/** xanh không đổi kỳ vọng.
- [ ] **Step 5: Commit** `feat(web): trang-thai-rieng — Bảng hàng hiện và đặt nhãn trạng thái`

### Task 8: Hôm nay — dòng lần đổi đọc nhãn, mốc vào trạng thái

**independent:** false (sau Task 3; bộ nhãn cần Task 4) · **phục vụ:** E7, E15

**Files:**
- Modify: `apps/web/src/app/(app)/today/ly-do.ts` (`chuNac(v, label, nhan)` qua `nhanCuaCan`; `chuLanDoi(l, loai, bayGio,
  nhan?)`; `lucLenDangBan` như core Task 3), trang Hôm nay đầu chủ đọc `docTuVung` (đường đọc từ vựng của hàng 45) và truyền
  `tuVung.trangThai` xuống `lyDo`
- Create: `apps/web/src/app/(app)/today/nhan-trang-thai.test.ts`

- [ ] **Step 1: Bài kiểm** «hôm nay: dòng lần đổi đọc nhãn» — giá trị đúng như E7; bộ nhãn dựng bằng `nhanTuBang` từ thân API
  viết trước.
- [ ] **Step 2–4:** FAIL rồi PASS; bài kiểm có từ trước của today/** xanh.
- [ ] **Step 5: Commit** `feat(web): trang-thai-rieng — Hôm nay đọc nhãn trạng thái`

### Task 9: Tài liệu điều đang đúng

**independent:** true · **phục vụ:** —

**Files:** `docs/product/tham-chieu.md` (§5 nhãn riêng neo, §12 Sổ quyết định một dòng 06/11 Hỏi-1..7),
`docs/architecture/so-diem-bien-thien.md` (#21: bảng `company_settings` khoá `labels.status.<mã>`, migration 047),
`docs/design/vo-va-ia.md` (dòng Cài đặt sàn › Trạng thái: khối đích settings-3 đã dùng), `docs/product/doi-chieu-nganh.md`
(§6: Quỹ hàng làm gì ở hàng 46).

- [ ] **Step 1:** sửa bốn tệp; **Step 2:** `npm run lint` (kiểm liên kết tài liệu nếu có) sạch; **Step 3: Commit**
  `docs: trang-thai-rieng — Tham chiếu, sổ điểm biến thiên, IA`

### Kết S3

- [ ] `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build` xanh; `npm run db:migrate && npm run
  db:test` xanh trên 5572; `node "$AG/scripts/design-floor-s3.mjs" --root . --slug 'trang-thai-rieng'`; hợp đồng
  `status: implemented`.
