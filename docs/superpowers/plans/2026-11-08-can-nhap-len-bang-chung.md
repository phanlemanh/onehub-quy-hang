# Căn nhập lên bảng chung — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps
> use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dòng tạo mới của lần nhập file ghi «còn hàng» lên Đang bán dù thiếu pháp lý, tình trạng sử dụng; mọi cửa khác giữ
điều kiện.

**Architecture:** Lõi thêm khoá `cuaVao: "nhap"` vào `TransitionContext`; `missingFor("Active")` bỏ hai điều kiện khi có khoá.
Chỉ `applyCommand` của máy chủ đặt khoá, khi lệnh mang `importId` (khuôn lệnh công khai `.strict()` không nhận khoá ấy). Cửa
nhập ghi lý do «Đang bán — còn thiếu …» và trả trạng thái căn của dòng; màn kết quả nhập đếm theo trạng thái thật.

**Tech Stack:** TypeScript, Hono + zod, Postgres, node:test, Next.js.

**Spec:** `docs/superpowers/specs/2026-11-08-can-nhap-len-bang-chung-design.md` · hợp đồng
`_acceptance/can-nhap-len-bang-chung/contract.md` · phép kiểm `_acceptance/can-nhap-len-bang-chung/evals.yaml`.

## Global Constraints

- Giá kèm điều kiện phí, mã căn, ảnh theo `listing.ready_min_real_photos` vẫn là điều kiện ở cửa nhập (luật 7, 12).
- Không migration. Không thêm trường vào khuôn `Command` của `POST /api/v1/listings/{id}/events`.
- Chữ trên giao diện và lý do dòng bằng nhãn của lõi (`nhanDieuKien`), không mã thô (`legalStatus`, `occupantType`).
- Dữ liệu mẫu `[Tên]`, `0900 000 0xx`, `[Tên sàn]`. Bộ kiểm DB chạy trên Postgres dãy G cổng 5573.
- `docs/product/tham-chieu.md`: chỉ thêm dòng (luật 12 của đợt).

## Review Focus

1. Lệnh công khai mang `importId` → phải 400 vì khoá lạ, không lách điều kiện (Task 2, E5).
2. Lệnh không đổi trạng thái sau lần nhập (điền pháp lý, đổi giá) → 200, căn ở lại Active (Task 2, E10).
3. Dòng «Đã cọc» thiếu pháp lý → Active rồi Pending, hai sự kiện mang `importId` (Task 3, E3).
4. Màn kết quả nhập nói đúng trạng thái: căn lên Đang bán không bị gọi là «Chưa đủ để rao» (Task 4, E9).
5. Hoàn tác lần nhập có căn Active → căn bị gỡ, đầu khách không thấy (Task 3, E8).

---

### Task 1: Lõi — luật trạng thái biết cửa nhập

`independent: true` · phục vụ E1

**Files:**
- Modify: `packages/core/src/listing/status.ts` (`TransitionContext` dòng 59, `missingFor` dòng 91)
- Test: `packages/core/src/listing/status.test.ts`

**Interfaces:**
- Produces: `TransitionContext.cuaVao?: "nhap"`; `export const MIEN_O_CUA_NHAP: readonly ["legalStatus", "occupantType"]`.

- [ ] **Step 1: Viết ca «cửa nhập bỏ pháp lý, tình trạng sử dụng»** — đúng ma trận của E1: bốn ô × có/không `cuaVao`
  (8 assert deepEqual), bốn ca vẫn thiếu với `cuaVao` (`listPrice`, `feeInclusion`, `unitNumber`, `realPhoto` với
  `minRealPhotos: 1`), `checkTransition("Incomplete","Active",{…, cuaVao:"nhap"}).ok === true`.
- [ ] **Step 2:** `npm test -w @quy-hang/core` → FAIL (thiếu cả hai vẫn ra `["legalStatus","occupantType"]`).
- [ ] **Step 3:** Thêm khoá và hằng; trong nhánh `Active` của `missingFor`, chỉ đẩy `legalStatus`/`occupantType` khi
  `ctx.cuaVao !== "nhap"`. Chú thích nghiệp vụ dẫn Tham chiếu §12 dòng 06/11.
- [ ] **Step 4:** `npm test -w @quy-hang/core` → PASS; phá thử: bỏ nhánh → ca đỏ nêu `legalStatus`; hoàn lại.
- [ ] **Step 5:** Commit `feat(core): luật trạng thái bỏ pháp lý, tình trạng sử dụng ở cửa nhập`.

### Task 2: Máy chủ — chỉ đường ghi lần nhập đặt cửa vào

`independent: false` (cần Task 1) · phục vụ E5, E10

**Files:**
- Modify: `packages/api/src/listings/store.ts:278` (gọi `checkTransition`)
- Test: `packages/api/test-db/imports/can-nhap-len-bang-chung.test.ts` (tạo; dựng sàn, đăng nhập, lần nhập như
  `packages/api/test-db/imports/lan-nhap.test.ts` — chép hàm `sanMoi`, `login`, `lanNhap`, `ghi` của tệp ấy)

**Interfaces:**
- Consumes: `TransitionContext.cuaVao` (Task 1). `Command.importId?: string` đã có (store.ts:46).

- [ ] **Step 1: Viết ca «cửa khác vẫn đòi pháp lý»** (E5: bốn lệnh + lead qua `POST /api/v1/leads/{id}/listing` + thân kèm
  `importId` → 400; đối chứng dương sau `details_changed legalStatus`) và ca «điền dần mục thiếu, căn ở lại Đang bán»
  (E10; dùng lần nhập — sẽ đỏ tới Task 3).
- [ ] **Step 2:** `DATABASE_URL=postgres://postgres:quyhang@localhost:5573/postgres npm run test:db -w @quy-hang/api` → E5
  xanh sẵn (luật cũ), E10 FAIL.
- [ ] **Step 3:** Ở store.ts:278 truyền `...(cmd.importId && { cuaVao: "nhap" as const })` vào ngữ cảnh `checkTransition`.
- [ ] **Step 4:** Chạy lại sau Task 3; commit cùng Task 3.

### Task 3: Cửa nhập — lý do, trạng thái dòng, các ca DB

`independent: false` (cần Task 1, 2) · phục vụ E2, E3, E4, E6, E8, E10

**Files:**
- Modify: `packages/api/src/imports/store.ts:61` (`RowResult`), `:384-396` (khối trạng thái theo file), `readImport`
- Modify: `packages/api/src/imports/routes.ts:52` (khuôn `RowResult`)
- Modify: `packages/api/test-db/imports/lan-nhap.test.ts:398` (ca E2c: vế trạng thái thành «căn Active»)
- Test: `packages/api/test-db/imports/can-nhap-len-bang-chung.test.ts`

**Interfaces:**
- Produces: `RowResult.standardStatus?: StandardStatus` cho dòng `create`/`update` (trạng thái căn sau dòng; `readImport`
  đọc từ `listings`). Lý do dòng Active còn thiếu: `Đang bán — còn thiếu ${nhãn nối «, »}` với nhãn của `nhanDieuKien`
  cho các mục trong `MIEN_O_CUA_NHAP` mà `missingFor("Active", ctx không cuaVao)` còn trả.

- [ ] **Step 1: Viết các ca** «dòng còn hàng thiếu pháp lý lên Đang bán» (E2), «Đã cọc đi qua Đang bán» (E3), «giá vẫn chặn
  ở cửa nhập» (E4), «50 căn nhập, đầu khách thấy» (E6), «hoàn tác gỡ căn đã lên Đang bán» (E8) đúng assert của evals.yaml;
  sửa ca E2c của lan-nhap.test.ts.
- [ ] **Step 2:** chạy `npm run test:db -w @quy-hang/api` (5573) → FAIL ở E2, E3, E6, E8, E10.
- [ ] **Step 3:** Sau khi chuỗi `status_changed` của dòng xong, nếu căn Active thì thêm lý do «Đang bán — còn thiếu …»;
  dòng trả `standardStatus`; thêm vào khuôn zod.
- [ ] **Step 4:** `npm run test:db -w @quy-hang/api` → PASS toàn bộ; phá thử: bỏ khoá ở Task 2 → E2 đỏ; hoàn lại.
- [ ] **Step 5:** Commit `feat(imports): căn nhập còn hàng lên Đang bán dù thiếu pháp lý, tình trạng sử dụng`.

### Task 4: Màn — kết quả nhập nói đúng trạng thái; Hôm nay qua đường màn dùng

`independent: false` (cần Task 3) · phục vụ E7, E9

**Files:**
- Modify: `apps/web/src/app/(app)/imports/new/man-nhap.tsx:416-417` (câu «Căn mới ở trạng thái Chưa đủ để rao…»)
- Create: `apps/web/src/lib/sync/test-db/can-nhap-len-bang-chung.db-test.mts` (theo `ha-tang.mts`, như
  `san-sang-ban.db-test.mts`)

**Interfaces:**
- Consumes: `RowResult.standardStatus` (Task 3); `canHomNay` (`apps/web/src/app/(app)/today/ly-do.ts:26`); `chiaNhom`
  (`@quy-hang/core/today`).

- [ ] **Step 1:** Viết ca «căn nhập vào Thiếu thông tin của người giữ» (E7) đúng assert của evals.yaml.
- [ ] **Step 2:** `DATABASE_URL=… npm run test:db -w @quy-hang/web` → chạy (lõi đã đúng; ca phải xanh — nếu đỏ là bộ
  nạp Hôm nay lệch, sửa ở đây).
- [ ] **Step 3:** Câu sau ghi: đếm dòng theo `standardStatus` — «n căn lên Đang bán, m căn ở Chưa đủ để rao» (bỏ vế bằng 0);
  bỏ cụm «Căn mới ở trạng thái Chưa đủ để rao». Giữ khối `TrangThai kind="notice"`. Badge dòng giữ biến thể theo hành động.
- [ ] **Step 4:** `npm run typecheck && npm run lint` xanh; commit `fix(imports): màn kết quả nhập đếm theo trạng thái căn`.

### Task 5: Chỗ thử và khung chụp E9

`independent: false` (cần Task 4) · phục vụ E9

**Files:**
- Create: `_acceptance/can-nhap-len-bang-chung/thu/dung.mjs` (chép `_acceptance/anh-khong-chan-ban/thu/dung.mjs`)
- Create: `_acceptance/can-nhap-len-bang-chung/thu/chup.mjs` (theo `_acceptance/anh-khong-chan-ban/thu/chup.mjs`: sàn mới,
  quản trị + đầu chủ A + đầu chủ B, lần nhập hai dòng qua API, khung `ket-qua-nhap`, `hom-nay`, `ho-so`, `bang-hang`,
  `hom-nay-b`; mỗi khung một dòng JSON và ảnh `E9-<khung>-<khổ>.png`)

- [ ] **Step 1:** Chạy `node _acceptance/can-nhap-len-bang-chung/thu/dung.mjs` rồi `chup.mjs --kho 1440` và `--kho 375`;
  mỗi dòng JSON khớp expected E9; tắt bằng `--tat`.
- [ ] **Step 2:** Commit `test(can-nhap-len-bang-chung): chỗ thử và khung chụp E9`.

### Task 6: Tài liệu

`independent: true` · không eval

**Files:**
- Modify: `docs/product/tham-chieu.md` §12 (thêm một dòng 08/11 «đã dựng», giữ dòng 06/11)
- Modify: `docs/architecture/so-diem-bien-thien.md` §B (thêm ứng viên «cửa nhập đòi pháp lý, tình trạng sử dụng — mặc định
  tắt», Hỏi-2) và dòng «Đếm»

- [ ] **Step 1:** Thêm hai dòng; commit `docs(can-nhap-len-bang-chung): Tham chiếu và ứng viên sổ điểm biến thiên`.
