# Hoàn tác cả lần nhập (hàng 66) — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Người nhập hoàn tác cả một lần nhập bằng sự kiện bù `voided` / trả giá cũ; căn đã sửa sau thì liệt kê; kèm ba sửa Ngoài-3/4/5 của hàng 67.

**Architecture:** Lõi thêm loại sự kiện `voided` (cờ khi gấp) và hàm thuần `keHoachHoanTac` quyết kết cục từng dòng. API thêm
`voidListing` trong store hàng (một đường ghi), lọc hàng đã gỡ ở mọi chỗ đọc, và đường `POST /imports/{id}/undo` (xem thử /
ghi, gọi lại được) + `GET /imports` ở `packages/api/src/imports/undo/`. Màn Nhập thêm danh sách lần nhập gần đây và hộp xác
nhận qua hàm thuần ở `apps/web/src/lib/nhap/hoan-tac.ts`.

**Tech Stack:** TypeScript chặt, node:test, Hono + zod-openapi, Postgres 16 (RLS), Next.js + ReUI base-nova.

**Spec:** `docs/superpowers/specs/2026-11-05-nhap-hoan-tac-design.md` · hợp đồng `_acceptance/nhap-hoan-tac/contract.md` ·
phép thử `_acceptance/nhap-hoan-tac/evals.yaml`.

## Global Constraints

- Chỉ thêm: không `delete`/`update` vào `listing_events`; hoàn tác là sự kiện bù (ADR-0011 qđ 8, luật 22 đợt).
- `voided` không phải trạng thái: không vào `STANDARD_STATUSES`, `TRANSITIONS`; payload `{}` khuôn chặt.
- Một đường ghi: SQL ghi `listings`/`listing_events` chỉ trong `packages/api/src/listings/` (`mot-duong-ghi.test.ts`).
- Migration mới số **025** (`025_hoan_tac_nhap.sql`); không sửa migration đã commit.
- Sự kiện bù không mang `import_id`; trả giá `confirmedWithOwner: false`.
- Chỉ người nhập (`imports.created_by`) hoàn tác; người khác 404; vai không nhập 403 `import-role-required`.
- Chữ màn nguyên văn: «Hoàn tác lần nhập này», «Hoàn tác», «Gỡ N căn khỏi Quỹ hàng», «Trả giá cũ cho M căn», «K căn không
  hoàn tác được», «Không có căn nào hoàn tác được», «Hoàn tác chưa xong — bấm lại để làm tiếp», «Đã hoàn tác», «Lần nhập gần
  đây», «Chưa có lần nhập nào», «Đang tải mẫu đã nhớ…».
- Lý do liệt kê nguyên văn: «Đã có người sửa sau lần nhập» · «Tin bổ sung đã gửi — không thu lại» · «Độ tươi theo ngày
  trong file vẫn giữ» · «Trước lần nhập căn chưa có giá».
- Dữ liệu mẫu `[Tên]`, `0900 000 0xx`; màn đi khuôn `nhap-excel` (không `Card`, trạng thái qua `TrangThai`, hộp qua
  `AlertDialog` có sẵn ở `components/ui/alert-dialog.tsx`).

## Review Focus

1. Lần nhập rất lớn (5.000 dòng): hoàn tác chạy theo gói, mỗi dòng một savepoint — lỗi giữa chừng để lại phần đã làm, gọi
   lại làm tiếp (Task 5 thêm ca 450 dòng tạo ra 3 gói).
2. Hàng tạo bởi lần nhập rồi được chính lần nhập đổi trạng thái (Active/Pending/Hold) — vẫn chỉ một `voided`, không đổi
   trạng thái (Task 5, E1 ba trạng thái).
3. Căn đã Đã bán sau lần nhập — là «sửa sau», không gọi `applyCommand` (khoá giá Đã bán sẽ từ chối) (Task 2 ma trận E3).
4. Hai tab cùng bấm hoàn tác — khoá hàng `imports ... for update` để lần thứ hai thấy `undo_outcome` của lần thứ nhất
   (Task 5).
5. Máy đang ngoại tuyến giữ lệnh chờ cho căn đã gỡ — lệnh sang «cần xem», không gửi lặp (Task 6).

---

### Task 1: Sự kiện `voided` trong lõi hàng

**independent:** true · **phục vụ:** E7

**Files:**
- Modify: `packages/core/src/listing/events.ts` (EVENT_TYPES, KHUON), `packages/core/src/listing/fold.ts` (ListingState, stepListing)
- Modify: các `switch` theo loại sự kiện: `packages/core/src/metrics/hang.ts`, `apps/web/src/app/(app)/units/ho-so/ho-so.ts` (nhãn «Đã gỡ khỏi Quỹ hàng»)
- Test: `packages/core/src/listing/voided.test.ts`

**Interfaces:**
- Produces: `EventType` có `"voided"`; `ListingState.voided: boolean` (mặc định `false`).

- [ ] **Step 1: Test** `«sự kiện voided: cờ khi gấp, không phải trạng thái»` — ma trận sáu trạng thái chuẩn × dãy (created → các
  bước tới trạng thái ấy → voided): `foldListing(...).standardStatus` = trạng thái ấy (6 assert), `.voided === true` (6);
  dãy không voided → `voided === false` (1); `validatePayload("voided", {})` = `[]`, `validatePayload("voided", {x:1})` có
  `{path:"x", reason:"khoá lạ"}` (2); `Object.keys(TRANSITIONS)` và mọi giá trị không chứa `"voided"` (1). Đếm 15.
- [ ] **Step 2:** `npm test -w @quy-hang/core` → FAIL (loại sự kiện lạ).
- [ ] **Step 3:** thêm `"voided"` vào `EVENT_TYPES` (comment: ADR-0011 qđ 8), `KHUON.voided = {}`; `ListingState.voided`,
  khởi `false`, `case "voided": s.voided = true`. `confirmsWithOwner("voided")` → false (mặc định có sẵn). Sửa các `switch`
  vét cạn mà typecheck báo.
- [ ] **Step 4:** chiều đỏ: tạm cho `case "voided"` đặt `standardStatus = "Withdrawn"` → ca đỏ nêu trạng thái đầu; hoàn lại.
- [ ] **Step 5:** `npm test -w @quy-hang/core && npm run typecheck` → PASS. Commit `feat(core): sự kiện voided — cờ khi gấp`.

### Task 2: Kế hoạch hoàn tác (hàm thuần)

**independent:** false (cần Task 1) · **phục vụ:** E3, E4

**Files:**
- Create: `packages/core/src/listing/hoan-tac-nhap.ts`, export ở `packages/core/src/listing/index.ts`
- Test: `packages/core/src/listing/hoan-tac-nhap.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type KetCucHoanTac = "go" | "tra-gia" | "khong-doi" | "da-sua-sau" | "khong-tra-duoc" | "tin-bo-sung" | "bo-qua";
  export const LY_DO_HOAN_TAC: Record<"da-sua-sau" | "tin-bo-sung" | "khong-doi" | "khong-tra-duoc", string>; // bốn câu nguyên văn ở Global Constraints
  export type DongNhap = { rowNumber: number; action: "create" | "update" | "supplement" | "skip"; listingId: string | null; versionBefore: number | null };
  export type LenhBu = { kind: "voided" } | { kind: "price"; listPrice: number; feeInclusion: string };
  export type KeHoachDong = { rowNumber: number; ketCuc: KetCucHoanTac; lyDo: string | null; listingId: string | null; lenh: LenhBu | null; expectedVersion: number | null };
  export function keHoachDong(d: DongNhap, suKien: readonly (ListingEvent & { importId: string | null })[] | null, importId: string): KeHoachDong;
  ```
- Luật (spec §3.2): sự kiện của lần nhập = `importId === importId`; «sửa sau» ⇔ có sự kiện `seq` > max seq của lần nhập
  (mọi người, mọi loại — Hỏi-4); `create` → `go`; `update` có `price_changed` của lần nhập → gấp tới `versionBefore`:
  `listPrice` null → `khong-tra-duoc`, có → `tra-gia`; `update` không đổi giá → `khong-doi`; `supplement` → `tin-bo-sung`;
  `skip` → `bo-qua` (lyDo null). `expectedVersion` = version hiện tại của dãy.

- [ ] **Step 1: Test E3** `«kế hoạch hoàn tác: đã sửa sau thì không gỡ»` — dãy dựng tay, mỗi sự kiện qua `validatePayload` (assert
  rỗng); ma trận {create, update-đổi-giá} × {details_changed, price_changed, status_changed→Closed (dãy qua Active), owner_confirmed}
  × {người nhập, người khác} → `da-sua-sau` + lyDo nguyên văn (16); không sự kiện sau → `go`, `tra-gia` (2). Đếm 18.
- [ ] **Step 2: Test E4** `«kế hoạch hoàn tác: phần không hoàn tác được»` — bốn dòng như evals E4 (12 assert, `lenh === null` ×4).
- [ ] **Step 3:** FAIL → viết `keHoachDong` → PASS. Chiều đỏ E3 (chỉ xét `actorUserId !== người nhập`) và E4 (bỏ kiểm giá
  trước) mỗi cái đỏ đúng thông điệp; hoàn lại.
- [ ] **Step 4:** commit `feat(core): kế hoạch hoàn tác lần nhập`.

### Task 3: Migration 025

**independent:** true · **phục vụ:** E6, E7b (nền)

**Files:**
- Create: `packages/db/migrations/025_hoan_tac_nhap.sql` (theo skill `/new-migration`)
- Modify: `packages/db/tests/isolation.test.mjs` (ca: sàn B không cập nhật `undo_outcome`/`status` của lần nhập sàn A)

- [ ] **Step 1:** SQL: drop/add `listing_events_type_check` thêm `'voided'` (khuôn của 020); `alter table listings add column
  voided boolean not null default false`; `imports.status` check thêm `'undone'`, cột `undone_at timestamptz`, `undone_by text`;
  `import_rows` thêm `undo_outcome text check (undo_outcome in ('go','tra-gia','khong-doi','da-sua-sau','khong-tra-duoc','tin-bo-sung','bo-qua'))`,
  `undone_at timestamptz`; grant `update (status, undone_at, undone_by)` trên `imports`, `update (undo_outcome, undone_at)` trên
  `import_rows` cho `quy_hang_app`; luật update của `import_rows` cho người tạo lần nhập (như insert ở 024).
- [ ] **Step 2:** `npm run db:migrate` hai lần (lần hai không áp lại) và `npm run db:test` → PASS. Commit
  `feat(db): 025 hoàn tác lần nhập`.

### Task 4: Store hàng — `voidListing`, lọc hàng đã gỡ

**independent:** false (Task 1, 3) · **phục vụ:** E1 (lọc), E7b, E7d

**Files:**
- Modify: `packages/api/src/listings/store.ts` (STATE_COLUMNS `voided: "voided"`, `voidListing`, `applyCommand` từ chối
  `type === "voided"` và hàng `voided`, `hangMoCungCan` thêm `and not voided`, `loadEvents` trả `importId`)
- Modify: `packages/api/src/listings/routes.ts` (GET danh sách `and not l.voided`; GET một hàng → 404 khi voided),
  `packages/api/src/today-buyer/store.ts`, `packages/api/src/da-gui/store.ts` (`not voided`), `packages/api/src/public/store.ts`
  (hàng voided → kết quả «căn không còn», như hàng không còn bán sẵn có), `packages/api/src/imports/store.ts` (`hangMo` thêm `and not voided`)
- Test: `packages/api/test-db/imports/hoan-tac.test.ts` (ca E7b, E7d — dựng ở Task 5, vì cần đường undo)

**Interfaces:**
- Produces: `export async function voidListing(tx: pg.PoolClient, listingId: string, expectedVersion: number): Promise<Applied | Refusal>`
  — khoá `for update`, version khác → `versionConflict`, ghi `voided` `{}` không xác nhận, gấp lại, cập nhật hàng.
  `loadEvents` trả `ListingEvent & { importId: string | null }`.

- [ ] **Step 1:** viết `voidListing`; `applyCommand`: `cmd.type === "voided"` → `invalidPayload` path `type` lý do «gỡ hàng chỉ qua hoàn tác lần nhập»;
  hàng `foldListing(events).voided` → `notFound` (trước kiểm khuôn).
- [ ] **Step 2:** thêm lọc ở sáu chỗ đọc. Bộ kiểm «gấp lại» có sẵn dùng STATE_COLUMNS nên tự phủ cột `voided`.
- [ ] **Step 3:** `npm test -w @quy-hang/api` (gồm `mot-duong-ghi.test.ts`) + `npm run db:test` → PASS. Commit
  `feat(api): gỡ hàng bằng voided, lọc hàng đã gỡ`.

### Task 5: Đường hoàn tác `/imports/{id}/undo`, `GET /imports`

**independent:** false (Task 2, 4) · **phục vụ:** E1, E2, E3b, E4b, E5, E6, E7b, E7d

**Files:**
- Create: `packages/api/src/imports/undo/store.ts`, `packages/api/src/imports/undo/routes.ts` (đăng ký từ `registerImportRoutes`)
- Modify: `packages/api/src/errors.ts` nếu cần mã mới (dùng `notFound` có sẵn cho người khác)
- Test: `packages/api/test-db/imports/hoan-tac.test.ts`

**Interfaces:**
- Produces:
  ```ts
  export type KetQuaHoanTac = { importId: string; status: "committed" | "undone"; go: number; traGia: number; khongDuoc: number;
    danhSach: { rowNumber: number; buildingName: string; unitNumber: string | null; lyDo: string }[] };
  export async function hoanTac(tx: pg.PoolClient, importId: string, o: { dryRun: boolean }): Promise<KetQuaHoanTac | Refusal>;
  export type LanNhapCuaToi = { id: string; fileName: string; createdAt: string; status: "committed" | "undone"; soDongGhi: number };
  export async function lanNhapCuaToi(tx: pg.PoolClient, limit = 10): Promise<LanNhapCuaToi[] | Refusal>;
  ```
  `POST /api/v1/imports/{importId}/undo` thân `{ dryRun?: boolean }` → 200 `KetQuaHoanTac`; `GET /api/v1/imports` → 200 `LanNhapCuaToi[]`.
- Luật: vai nhập (403); `select ... from imports where id=$1 and created_by = app.current_user_id() for update` — không có → 404;
  status `planned` → 404; dòng đã có `undo_outcome` → dùng lại kết cục, không ghi; mỗi dòng savepoint: `keHoachDong` →
  `voidListing` / `applyCommand(price_changed, {confirmedWithOwner:false})` → ghi `undo_outcome`, `undone_at`; mọi dòng xong →
  `imports.status='undone'`. `dryRun` → ném `XemThu` để rollback (khuôn có sẵn của `/rows`). `khongDuoc` = số dòng liệt kê
  (lyDo khác null). Biến thử `QH_THU_DUT_HOAN_TAC_SAU=<n>` chỉ đọc khi `NODE_ENV==="test"`: ném sau dòng thứ n (E6).
- [ ] **Step 1:** test-db: sáu ca của evals E1, E2, E3b, E4b, E5, E6, E7b, E7d — tên ca đúng nguyên văn trong `expected`; lần nhập ghi
  bằng `POST /imports` + `/rows` (khuôn `lan-nhap.test.ts`), thêm ca Review Focus 1 (450 dòng, đứt sau 250, gọi lại xong).
- [ ] **Step 2:** FAIL → viết store + routes → PASS trên Postgres dãy (`DATABASE_URL` cổng 5573).
- [ ] **Step 3:** chiều đỏ từng eval như ghi trong `expected` (mỗi cái một lượt phá thử, hoàn lại).
- [ ] **Step 4:** commit `feat(api): hoàn tác cả lần nhập`.

### Task 6: Máy ngoại tuyến bỏ căn đã gỡ

**independent:** true (chỉ test, đường có sẵn) · **phục vụ:** E7c

**Files:**
- Test: `apps/web/src/lib/sync/hoan-tac-nhap.test.ts` (dùng `may-chu-gia.test-helpers.ts`)

- [ ] **Step 1:** ca `«đồng bộ trên máy: hàng đã gỡ ra khỏi máy»` như evals E7c. Nếu đỏ vì bộ gửi giữ lệnh, sửa `gui.ts` tối thiểu.
- [ ] **Step 2:** `npm test -w @quy-hang/web` → PASS; chiều đỏ (máy chủ giả trả hàng 1) đỏ đúng. Commit `test(sync): căn đã gỡ rời máy`.

### Task 7: Màn — lần nhập gần đây, nút hoàn tác, hộp xác nhận

**independent:** false (Task 5) · **phục vụ:** E8, E8b, E12, E12b

**Files:**
- Create: `apps/web/src/lib/nhap/hoan-tac.ts`, `apps/web/src/lib/nhap/hoan-tac.test.ts`,
  `apps/web/src/app/(app)/imports/new/hoan-tac.tsx` (danh sách + hộp, chỉ nối hàm thuần)
- Modify: `apps/web/src/lib/nhap/goi-api.ts`, `apps/web/src/app/(app)/imports/new/man-nhap.tsx` (bước 1 và bước 5)
- Create: `_acceptance/nhap-hoan-tac/thu/chup-hoan-tac.mjs` (khuôn `_acceptance/nhap-nho-mau/thu/chup-mau.mjs`)

**Interfaces:**
- Produces (goi-api): `docLanNhapGanDay(f): Promise<LanNhapCuaToi[] | LoiGoi>`, `xemThuHoanTac(f, id): Promise<KetQuaHoanTac | LoiGoi>`,
  `hoanTacLanNhap(f, id): Promise<KetQuaHoanTac | LoiGoi>`.
- Produces (hoan-tac.ts):
  ```ts
  export type DongGanDay = { id: string; ten: string; ngay: string; nhan: string | null; coNut: boolean };
  export function danhSachGanDay(ds: readonly LanNhapCuaToi[], toiDa = 10): DongGanDay[];
  export type TrangThaiDanhSach = "dang-tai" | "trong" | "loi" | "co-dong";
  export type HopHoanTac = { buoc: "xem-thu" | "san-sang" | "dang-ghi" | "xong" | "loi"; keHoach: KetQuaHoanTac | null; loi: string | null };
  export function tieuDeHop(h: HopHoanTac): string;      // «Gỡ N căn khỏi Quỹ hàng · Trả giá cũ cho M căn · K căn không hoàn tác được»
  export function nutXacNhan(h: HopHoanTac): { tat: boolean; chu: string };  // tắt khi go+traGia=0 hay đang ghi
  ```
- [ ] **Step 1:** test E8 (đủ assert như evals, đếm theo danh sách) → FAIL → viết → PASS.
- [ ] **Step 2:** nối màn: bước 1 dưới ô thả tệp «Lần nhập gần đây» (`TrangThai` cho đang tải/trống/lỗi); bước 5 nút
  `variant="outline"` «Hoàn tác lần nhập này» mở `AlertDialog`; danh sách K căn trong thân hộp.
- [ ] **Step 3:** `npm run typecheck && npm run lint` (mức nợ 0/0, khuôn 0 lệch) → PASS; chạy `chup-hoan-tac.mjs` sáu ca ở 1440/375
  trên chỗ thử dãy G, xem ảnh. Commit `feat(web): hoàn tác lần nhập trên màn Nhập`.

### Task 8: Ngoài-3 — sửa ô xung đột không học

**independent:** true · **phục vụ:** E9

**Files:** Modify `apps/web/src/lib/nhap/trang-thai.ts` (`suaO`); Test `apps/web/src/lib/nhap/xung-dot.test.ts`

- [ ] **Step 1:** test E9 (13 assert) → FAIL.
- [ ] **Step 2:** điều kiện học thêm `oDong?.by === "normalize"` (ô cần người do lõi không nhận chữ; `fee_from_price`, `catalog`,
  `duplicate` là xung đột — chỉ đổi đúng ô). → PASS; chiều đỏ; commit `fix(nhap): ô xung đột không học thành cách gọi (Ngoài-3 hàng 67)`.

### Task 9: Ngoài-4 — hai cột không cùng đích

**independent:** true · **phục vụ:** E10

**Files:** Modify `packages/core/src/import/memory/mau.ts` (`apMau`, khử trùng đích); Test `packages/core/src/import/memory/mau.test.ts`

- [ ] **Step 1:** test E10 (13 assert, hai thứ tự) → FAIL.
- [ ] **Step 2:** sau áp mẫu: với mỗi đích chuẩn có ≥ 1 cột theo mẫu và ≥ 1 cột không theo mẫu → cột không theo mẫu thành
  `{ target: "keep_as_note", confidence: "low", reason: "trùng đích với cột theo mẫu «A» — giữ làm ghi chú, cần người chọn" }` (cùng nếp «chưa rõ» của `planFromDictionary`, plan.ts:163)
  và thêm câu hỏi `Cột «B» trùng đích với cột theo mẫu «A»`; giữ vòng `validatePlan` có sẵn. → PASS; chiều đỏ; commit
  `fix(nhap): hai cột không cùng đích ở cả hai thứ tự (Ngoài-4 hàng 67)`.

### Task 10: Ngoài-5 — chờ mẫu đã nhớ

**independent:** false (cùng `man-nhap.tsx` với Task 7 — làm sau) · **phục vụ:** E11

**Files:** Create `apps/web/src/lib/nhap/cho-mau.ts`, `apps/web/src/lib/nhap/cho-mau.test.ts`; Modify `man-nhap.tsx` (giữ lời hứa mẫu trong `useRef`, `nap` chờ nó)

**Interfaces:**
```ts
export type MauDaNho = { kind: "dang-tai" } | { kind: "co"; mau: CotMau[] } | { kind: "loi" };
export function daiBaoMau(m: MauDaNho, theoMau: number, tong: number): { title: string } | null; // «Đang tải mẫu đã nhớ…» · «Ghép theo mẫu đã nhớ — N/M cột» · «Không đọc được mẫu đã nhớ»
export async function ghepKhiCoMau(grid: Grid, ctx: ImportContext, mau: Promise<CotMau[] | LoiGoi>): Promise<{ ong: Ong; mau: MauDaNho }>;
```
- [ ] **Step 1:** test E11 (6 assert, lời hứa điều khiển tay) → FAIL → viết → PASS; chiều đỏ; nối màn; commit
  `fix(nhap): chọn tệp trước khi mẫu tải xong vẫn ghép theo mẫu (Ngoài-5 hàng 67)`.

### Task 11: Tài liệu

**independent:** true · **phục vụ:** —

**Files:** `docs/product/tham-chieu.md` §12 (một dòng: hoàn tác lần nhập bằng `voided`, năm Hỏi), `CONTEXT.md` (nhãn
«Hoàn tác lần nhập» ↔ `undo`, «Đã gỡ khỏi Quỹ hàng» ↔ `voided`), `docs/adr/0008-loi-hang-va-su-kien.md` (mục sửa đổi: loại
`voided`, theo ADR-0011 qđ 8). Commit `docs: hoàn tác lần nhập (hàng 66)`.
