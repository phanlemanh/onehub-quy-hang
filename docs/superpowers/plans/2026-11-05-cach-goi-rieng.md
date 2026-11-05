# Cách gọi riêng (hàng 45) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị sàn đặt tên riêng cho 15 trường chuẩn và cho giá trị của hai tập đóng (phí, lý do ngừng); Bảng hàng,
bản phát hàng và trang khách hiện đúng chữ ấy, lọc và đếm vẫn theo giá trị chuẩn.

**Architecture:** Một sổ từ vựng thuần ở `packages/core/src/labels` (kiểm, dựng dòng, giải từ vựng, phần ra ngoài). Lưu ở
`company_settings` với khoá `labels.(field|value).<trường>` (migration 039 nới check). API `/api/v1/company/labels`
đọc/ghi nguyên khối, chỉ ghi khoá đổi, trả về mặc định = ghi `null`. Ba mặt hiện chữ nhận `TuVung` (Bảng hàng qua
context từ máy chủ, phát hàng qua tham số của `xuatBang`, trang khách qua `tuVungRaNgoai` gắn vào thân công khai).

**Tech Stack:** TypeScript chặt, Node test runner + tsx, Hono + zod-openapi, Postgres (RLS), Next.js 16 app router, ReUI.

**Spec:** `docs/superpowers/specs/2026-11-05-cach-goi-rieng-design.md` · hợp đồng `_acceptance/cach-goi-rieng/contract.md`
· evals `_acceptance/cach-goi-rieng/evals.yaml`.

## Global Constraints

- Nhãn 1–40 ký tự sau trim; qua `detectPersonal` (số điện thoại, email, số giấy tờ) — trúng là từ chối.
- Khoá lưu: `labels.field.<trường>` (chữ) và `labels.value.<trường>` (đối tượng `{giá trị chuẩn: tên}`); trả về mặc định
  = giá trị JSON `null`, không xoá dòng.
- Không trường lớp `source` nào đổi tên được; tên giá trị riêng chỉ ra ngoài cho khoá ra `feeInclusion`.
- Chữ mặc định của từng mặt giữ nguyên khi sàn chưa đặt (AC-10).
- Không chạm: `packages/db/migrations/**` ngoài `039_*`, `package-lock.json`, `CONTEXT.md`, `PRODUCT-MAP.md`,
  `LO-TRINH.html`, `_acceptance/config.yaml`, `apps/web/src/app/(app)/units/ho-so/bang-co-ho-so.tsx` (vùng dãy H).
- Bộ kiểm cơ sở dữ liệu chạy với `DATABASE_URL=postgres://postgres:quyhang@localhost:5572/postgres` (Postgres dãy B).
- Mỗi phép đo mới có cặp hai chiều trên cùng fixture (MEASURE-BIRTH-CLAUSE).

## Review Focus

- Gõ đúng chữ mặc định vào ô → coi như mặc định, không lưu dòng (Task 1, Task 7).
- Sàn lưu xong rồi một dòng hỏng nằm trong bảng (khoá lạ, neo lạ) → màn và ba mặt vẫn dựng, dòng hỏng bị bỏ qua (Task 1).
- Lưu lần hai không đổi gì → 0 sự kiện nhật ký mới (Task 3).
- Khách riêng ẩn mã căn → nhãn mã căn không đi ra (Task 1, đã có ca).
- Đầu chủ không phải quản trị mở `/settings/labels` → về Cá nhân kèm câu báo (Task 7).

---

### Task 1: Lõi từ vựng — hoàn tất (phục vụ E3, E7, E10b; independent: false — nền của mọi task)

**Files:** Modify `packages/core/src/labels/index.ts`, `packages/core/src/labels/labels.test.ts`

**Interfaces — Produces:** `boTuVung(dong)`, `bangNhan(tv)`, `tuVungRaNgoai(tv, khoaRa)`, `nhanTruong`, `nhanGiaTri`,
`dungDongNhan(bo)`, mới: `tuVungTuBang(bang: BangNhan | {fields,values} JSON): TuVung` (đọc đúng khuôn GET trả),
`doiNhan(daLuu: readonly DongNhan[], moi: readonly DongNhan[]): DongNhan[]` (khoá đổi; khoá có trong `daLuu` khác null mà
vắng trong `moi` → `{key, value: null}`; khoá giống hệt → không có).

- [ ] Ca thêm vào `labels.test.ts`: `dungDongNhan` bỏ qua nhãn trùng chữ mặc định (`feeInclusion` «Điều kiện phí» → không
  dòng; `included` «Bao phí» → không dòng); `boTuVung` coi `null` là chưa đặt, không thêm lỗi; `doiNhan` bảng bốn dòng
  (mới, đổi, giữ nguyên, bỏ → null); `tuVungTuBang(bangNhan(tv))` deepEqual `tv`; đối chứng dương chèn `closePrice` vào
  bản sao khoá ra của `nhom_moi_gioi` → ca phát hiện `closePrice`.
- [ ] Chạy `npm test -w @quy-hang/core` → các ca mới FAIL; cài đặt; chạy lại → PASS; phá thử (bỏ nhánh null) → đúng ca đỏ.
- [ ] Commit.

### Task 2: Migration 039 + bộ kiểm cách ly (phục vụ E8; independent: true)

**Files:** `packages/db/migrations/039_cach_goi_rieng.sql` (đã có), Modify `packages/db/tests/isolation.test.mjs`

- [ ] Ca «cách gọi: dòng labels.* theo sàn»: quản trị A chèn `labels.field.feeInclusion` và `labels.value.feeInclusion`
  (đối chứng dương: A đọc được 2 dòng); người sàn B đọc `key like 'labels.%' and company_id = A` → 0 dòng; khoá
  `labels.field.Fee Inclusion`, `labels.other.feeInclusion` → `company_settings_key_check`; ca cũ `Lead Routing` giữ.
- [ ] `DATABASE_URL=… npm run db:migrate && npm run test:isolation -w @quy-hang/db` → PASS; phá thử (bỏ `or …` khỏi check
  trong DB tạm) → ca đỏ. Commit.

### Task 3: API `/api/v1/company/labels` (phục vụ E1, E2, E2b, E3b, E8, E9; independent: false — sau 1, 2)

**Files:** Create `packages/api/src/labels/store.ts`, `packages/api/src/labels/routes.ts`,
`packages/api/test-db/cach-goi-rieng/nhan.test.ts`; Modify `packages/api/src/app.ts` (import + `registerLabelsRoutes`).

**Interfaces — Produces:** `GET` → `BangNhan` (mọi vai của sàn); `PUT` thân `BoNhan` → `BangNhan` (vai `company_admin`;
403 `adminRequired`; 400 `{error, reason}` nêu khoá). Store: `readLabels(tx): Promise<BangNhan>`,
`writeLabels(tx, input): Promise<BangNhan | {refusal:"invalid",reason} | {refusal:"forbidden"}>` — một giao dịch,
upsert `(company_id,key,value,updated_by,data_class='company_internal')` chỉ các dòng `doiNhan` trả.

- [ ] Viết `nhan.test.ts` theo từng `expected` của E1, E2, E2b, E3b, E8(2), E9 (tên ca đúng như evals.yaml), dựng sàn,
  người, căn, Lần gửi qua đường ghi thật như `packages/api/test-db/cau-hinh-theo-san.test.ts`.
- [ ] Chạy `DATABASE_URL=… npm run test:db -w @quy-hang/api -- test-db/cach-goi-rieng` → FAIL; cài đặt; → PASS; phá thử
  từng chiều đỏ nêu trong evals. Commit.

### Task 4: Trang khách và nhóm môi giới (phục vụ E6b, E7b, E7c; independent: false — sau 1, 3)

**Files:** Modify `packages/core/src/sharing/trang-khach.ts` (+test), `packages/api/src/public/store.ts`,
`packages/api/src/public/doc.ro-ri.test.ts`, `apps/web/src/app/s/[code]/the-can.tsx`, `chi-tiet.tsx`, `trang.test.ts`.

**Interfaces:** `ThanTrangKhach` thêm `tuVung: TuVung`; `thanTrangKhach({..., tuVung?})` gắn
`tuVungRaNgoai(tuVung, truongRa(nguoiNhan, cauHinh))`; `NguonCongKhai.docNhan(s): Promise<DongNhan[]>`;
`docTrangKhach(nguon: Pick<NguonCongKhai,"docCan"|"docNhan">, s, today)`. Web: `nhanGiaTri(than.tuVung, "feeInclusion",
v, PHI[v])`, `nhanTruong(than.tuVung, "legalStatus", "Pháp lý")`… cho ba dòng chi tiết.

- [ ] Ca web E7b, ca rò rỉ E7c (mồi `MOI-LYDO` trên `withdrawnReason`), ca core: thân không có `tuVung` khi nguồn trả
  rỗng → `{truong:{},giaTri:{}}`. FAIL → cài → PASS → phá thử. Commit.

### Task 5: Phát hàng (phục vụ E6, E6c; independent: false — sau 1)

**Files:** Modify `packages/core/src/export/index.ts`, `packages/core/src/export/cot.ts`, Create
`packages/core/src/export/tu-vung.test.ts`; Modify `apps/web/src/app/(app)/inventory/phat-hang/chuyen-dong.ts`,
`hop-thoai.tsx`, Create `apps/web/src/app/(app)/inventory/phat-hang/tu-vung.test.ts`.

**Interfaces:** `TuyChonXuat.tuVung?: TuVung` — `xuatBang` lấy `tuVungRaNgoai(tuy.tuVung, truongRa(...))`, tiêu đề cột
`nhanTruong(tv, khoa, cot.nhan)`, `chuCuaO(ban, khoa, tv?)` dùng `nhanGiaTri` cho `feeInclusion`.
`TuyChonTrang.tuVung?` truyền thẳng; `MoXuat.tuVung` lấy từ context Bảng hàng (Task 6). `exports/new` chỉ chuyển hướng
về `/inventory?phat-hang=1` nên đi cùng đường.

- [ ] Ca E6 (core) và E6c (web, đầu vào `bangNhan` → `tuVungTuBang`); không từ vựng → bản xuất deepEqual ảnh viết trước.
  FAIL → cài → PASS → phá thử. Commit.

### Task 6: Bảng hàng (phục vụ E4, E5, E10; independent: false — sau 1, 5)

**Files:** Create `apps/web/src/app/(app)/inventory/tu-vung.tsx` (`TuVungProvider`, `useTuVung()`),
`apps/web/src/app/(app)/inventory/tu-vung.test.ts`; Modify `cot.ts` (`nhanCot(id, tv?)`, `chuCuaO(d, id, tv?)`),
`loc.ts` (`luaChon/sapDong/locDong` nhận `tv?`), `bang-hang.tsx`, `cards/the-can.tsx`, `cell-edit/tren-o.tsx`,
`cell-edit/lenh.ts`, `page.tsx` (đọc `GET /api/v1/company/labels` ở máy chủ, `tuVungTuBang`, bọc `TuVungProvider`).

- [ ] Ca E4, E5, E10 như evals; lọc chọn theo `giaTriChon`, chữ lựa chọn theo từ vựng; sắp theo chữ hiện giữ như cũ.
  FAIL → cài → PASS → phá thử. Commit.

### Task 7: Màn Cách gọi (phục vụ E3c, E9b, E11; independent: false — sau 3)

**Files:** Create `apps/web/src/app/(app)/settings/labels/page.tsx`; Modify `cach-goi.tsx`, `cach-goi-thuan.ts`,
`cach-goi.test.ts`.

- [ ] `page.tsx`: `readMe` → `chanMucSan` → `GET /api/v1/company/labels` → `<MucCaiDat title="Cách gọi" khoi><CachGoi bo=…/>`;
  403 → `TrangThai kind="notice"`. `thanLuu` bỏ ô trùng chữ mặc định. Ca E3c thêm hai ca của gap-probe.
- [ ] `npm test -w @quy-hang/web` → PASS; mở `http://localhost:3492/settings/labels` bằng quản trị mẫu, lưu, tải lại, chụp
  (đủ cột thứ hai, mục «Cách gọi» sáng). Commit.

### Task 8: Tài liệu và kiểm toàn kho (independent: false — cuối)

**Files:** Modify `docs/product/tham-chieu.md` (bảng lớp «Cách gọi riêng» → đã có màn; §12 thêm dòng sổ quyết định 05/11
cho bốn Hỏi), `docs/design/vo-va-ia.md` nếu cột «Khối đích» Cài đặt sàn cần ghi màn Cách gọi.

- [ ] `npm run typecheck && npm run lint && npm test && npm run test:hooks` → đạt; `DATABASE_URL=… npm run db:test` → đạt.
- [ ] Hợp đồng `status: implemented`; commit.
