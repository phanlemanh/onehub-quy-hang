# Trường riêng tối thiểu (hàng 47) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Quản trị sàn tạo trường riêng có / không hay chọn một cho hàng và liên hệ theo loại, sau máy dò trùng nghĩa; trường
của hàng là cột lọc được ở Bảng hàng; trường của liên hệ chủ nhà mang lớp nguồn; không gì ra ngoài.

**Architecture:** Bảng định nghĩa `custom_fields` + nhật ký chỉ thêm (migration 043); giá trị của hàng ở `listings.custom`
qua sự kiện `custom_changed` (gập ở lõi, chiếu qua `STATE_COLUMNS`, đồng bộ tự mang); giá trị của liên hệ ở `contacts.custom`
qua hàm `security definer`. Lõi `@quy-hang/core/custom-fields` (đã có từ S1) giữ mọi luật; API và màn chỉ gọi lõi.

**Tech Stack:** TypeScript, Postgres (luật theo dòng), Hono + OpenAPI, Next.js, node:test.

**Spec:** `docs/superpowers/specs/2026-11-06-truong-rieng-toi-thieu-design.md` · hợp đồng
`_acceptance/truong-rieng-toi-thieu/contract.md` · tiêu chí `_acceptance/truong-rieng-toi-thieu/evals.yaml`.

## Global Constraints

- Chữ UI tiếng Việt; mã, bảng, API tiếng Anh. Dữ liệu thử «[Tên]», `0900 000 0xx`.
- Mã trường, mã lựa chọn khuôn `^[a-z][a-z0-9_]{0,31}$`; tên 1–40 ký tự sau khi bỏ khoảng trắng hai đầu, qua `detectPersonal`.
- Trần 20 trường còn sống mỗi sàn (gộp hàng và liên hệ), 30 lựa chọn mỗi trường.
- Lớp: hàng → `custom_field`; liên hệ có Seller hay Landlord → `source`; còn lại → `custom_field` (`lopTruongRieng`).
- Bỏ trường = `archived_at`, giữ giá trị; mã không dùng lại. Kiểu, đối tượng, loại liên hệ cố định; lựa chọn chỉ thêm, đổi chữ.
- Không sửa migration đã commit; một migration mới `043_truong_rieng.sql`. Mọi bảng mới `enable` + `force row level security`.
- Bảng hàng: trường của hàng chỉ ở máy tính (cột, sửa ô, lọc, góc nhìn). Không ra trang khách, phát hàng, xuất, AI.
- Luật 46: quản trị sàn không đọc hàng — không đếm căn theo giá trị trường riêng.

## Review Focus

- Bộ trường «chưa tải» (GET lỗi, ngoại tuyến) phải khác bộ rỗng: Bảng hàng không dựng cột custom và không ghi đè góc nhìn
  (Task 6, E4c).
- Lệnh `custom_changed` đặt lúc ngoại tuyến cho trường bị bỏ trong lúc ấy: 400 làm lùi bản trên máy (Task 6, E4e).
- Trường liên hệ nhiều loại (Seller + Buyer) là `source` ở cả lõi lẫn check DB (Task 1, E6d).
- Đường đọc liên hệ mới thêm sau này lộ `custom` — bài quét đếm đường bằng grep (Task 4, E7c).
- Đổi tên trường đã có thành tên trùng nghĩa trường chuẩn bị chặn như tạo mới (Task 2, E2b/E3).

---

### Task 1: Migration 043 + bộ kiểm cách ly

independent: false · phục vụ E6d, E7, E9, E10b

**Files:**
- Create: `packages/db/migrations/043_truong_rieng.sql`
- Modify: `packages/db/tests/isolation.test.mjs` (ba ca mới); `packages/db/tests/` bảng «mọi bảng có luật dòng» nếu kho có danh sách viết tay
- Create: `packages/core/src/custom-fields/ma-tran-lop.json` (ma trận chung 8 dòng của E6b/E6d: `{target, contactTypes, lop}`)

**Interfaces:**
- Produces: bảng `custom_fields(company_id uuid, code text, target text, contact_types text[], kind text, label text,
  options jsonb, data_class text, position int, archived_at timestamptz, updated_by text, updated_at timestamptz, pk(company_id, code))`;
  bảng `custom_field_events(id bigserial, company_id, code, value jsonb, actor_user_id, actor_roles, at)`;
  cột `listings.custom jsonb not null default '{}'`; `listing_events.type` thêm `custom_changed`;
  `contacts.custom` check `jsonb_typeof(custom)='object'`; hàm `app.set_contact_custom(p_contact uuid, p_patch jsonb) returns jsonb`.

- [ ] Viết ba ca isolation (đỏ): «trường riêng: bảng định nghĩa theo sàn» (E9), «trường riêng: giá trị của liên hệ chủ nhà theo
  lớp nguồn» (E7), «trường riêng: check lớp khớp luật của lõi» (E6d, đọc `ma-tran-lop.json`, 8 × 2 assert).
- [ ] Viết migration: bảng + check `data_class` bằng đúng biểu thức
  `(target='listing' and data_class='custom_field') or (target='contact' and data_class = case when contact_types && array['Seller','Landlord'] then 'source' else 'custom_field' end)`;
  check `target`, `kind`, khuôn mã, `contact_types <@ array['Seller','Landlord','Buyer','Tenant']`, `cardinality>0` khi contact;
  luật dòng (đọc: `company_id = app.current_company_id()`; thêm/sửa: thêm `'company_admin' = any(app.current_user_roles())`
  và `updated_by = app.current_user_id()`), grant select/insert/update, không delete; trigger nhật ký + chặn sửa/xoá/truncate
  nhật ký (chép khuôn 026); cột `listings.custom` + `grant update (custom)`; viết lại check type của `listing_events`
  (giữ mọi giá trị 025 + `custom_changed`); `alter table contacts drop constraint contacts_custom_check` rồi thêm check object;
  hàm `app.set_contact_custom` (`security definer`, `search_path ''`): `app.contact_readable(san, p_contact)` sai → lỗi
  `không có quyền`; mỗi khoá phải là mã trường `contact` còn sống của sàn có `contact_types && loại của liên hệ`, giá trị
  đúng kiểu (`boolean` cho bool; chuỗi mã lựa chọn có trong `options` cho single_select; `null` xoá) → lỗi nêu mã; ghi
  `custom = (custom || patch_khong_null) - khoa_null`, trả `custom` mới; grant execute cho `quy_hang_app`.
- [ ] `npm run db:migrate && npm run db:test` (DATABASE_URL dãy B 5572) — ba ca xanh, bộ cũ xanh.
- [ ] Phá thử: bỏ `force` ở bản sao → ca E9 đỏ nêu sàn B; check chỉ xét Seller → E6d đỏ dòng [Landlord]. Hoàn lại.
- [ ] Commit `feat(db): truong-rieng — migration 043 bảng trường riêng, listings.custom, contacts.custom`.

### Task 2: Lõi — kiểm thử trường riêng và sự kiện `custom_changed`

independent: true · phục vụ E2, E3, E4b, E6b, E7b

**Files:**
- Modify: `packages/core/src/custom-fields/index.ts` (đã có)
- Create: `packages/core/src/custom-fields/custom-fields.test.ts`
- Modify: `packages/core/src/listing/events.ts` (`custom_changed` vào `EVENT_TYPES`, khuôn payload), `packages/core/src/listing/fold.ts`
  (`custom: Record<string, boolean|string>` trong `ListingState`, gập bằng `tronGiaTri`)
- Create: `packages/core/src/listing/truong-rieng.test.ts`

**Interfaces:**
- Consumes: `ma-tran-lop.json` (Task 1).
- Produces: `kiemTruongRieng(gui, daCo, nguCanh)`, `doTrungNghia(label, target, nguCanh)`, `lopTruongRieng`, `kiemGiaTriTruong(bo, target, contactTypes, patch)`,
  `tronGiaTri`, `chuGiaTri`, `truongCuaDoiTuong`, `boTuThan` (đã có, chữ ký giữ nguyên); `ListingState.custom`.

- [ ] Viết ca «máy dò trùng nghĩa» (E2, 12 dòng), «kiểm bộ trường» (E3, đủ dòng của evals), «lớp của trường riêng» (E6b, đọc
  `ma-tran-lop.json`), «trường riêng không vào thoả thuận» (E7b), «bản gập: trường riêng» (E4b) — chạy, đỏ ở phần chưa có.
- [ ] `validatePayload("custom_changed", p)`: object phẳng ≥1 khoá, khoá khuôn mã, giá trị `boolean` · chuỗi khuôn mã · `null`.
  `stepListing`: `s.custom = tronGiaTri(s.custom, p)`; `foldListing` khởi `custom: {}`.
- [ ] `npm test -w @quy-hang/core` xanh; phá thử từng chiều đỏ nêu trong evals (thay vì trộn; bỏ trần 20; chỉ xét Seller).
- [ ] Commit `feat(core): truong-rieng — kiểm bộ trường, máy dò, sự kiện custom_changed`.

### Task 3: API — `/company/fields` và lệnh `custom_changed`

independent: false (sau Task 1, 2) · phục vụ E1, E2b, E3b, E4, E4d, E5b, E8, E9b, E10b

**Files:**
- Create: `packages/api/src/custom-fields/{routes.ts,store.ts}` (khuôn `statuses/`), đăng ký trong `packages/api/src/app.ts`
- Modify: `packages/api/src/listings/store.ts` (`STATE_COLUMNS.custom = "custom"`; `applyCommand` với `custom_changed`)
- Create: `packages/api/test-db/truong-rieng/truong.test.ts`

**Interfaces:**
- Produces: `GET /api/v1/company/fields` → `{ fields: TruongRieng[] }` (còn sống trước, theo `position`, rồi đã bỏ);
  `PUT /api/v1/company/fields` body `{ fields: TruongGui[] }` → 200 thân như GET · 400 `{error, reason}` · 409
  `{error:"trung-nghia", reason, standardField}` · 403. `docBoTruong(tx): Promise<TruongRieng[]>` dùng chung cho listings và contacts.

- [ ] Viết các ca DB trong `truong.test.ts` đúng tên ở evals E1, E2b, E3b, E4, E4d, E5b, E8, E9b, E10b (đỏ).
- [ ] `store.ts`: `docBoTruong`; `writeFields(tx, gui)`: vai `company_admin` không có → forbidden; `pg_advisory_xact_lock`
  theo sàn; `kiemTruongRieng(gui, daCo, { tuVung })` (tuVung đọc như `labels/store.ts`); lỗi có `trungNghia` → 409; upsert CHỈ
  dòng đổi (so label, options, archived); `archived` → `archived_at = now()`; `position` theo thứ tự gửi.
- [ ] `applyCommand`: loại `custom_changed` → `kiemGiaTriTruong(await docBoTruong(tx), "listing", null, payload)`; lỗi → 400
  nêu mã; qua → ghi sự kiện như loại khác (`expectedVersion` như `details_changed`).
- [ ] `npm run db:test` (gồm test-db) xanh; phá thử: bỏ `doTrungNghia` → E2b đỏ; bỏ `custom` khỏi `STATE_COLUMNS` → E4d đỏ.
- [ ] Commit `feat(api): truong-rieng — /company/fields, custom_changed`.

### Task 4: API liên hệ — ghi và đọc `custom`, mọi đường không lộ

independent: false (sau Task 1, 3) · phục vụ E6, E7c

**Files:**
- Modify: `packages/api/src/contacts/routes.ts`, `packages/api/src/contacts/store.ts` (route `PATCH /api/v1/contacts/{id}/custom`
  gọi `app.set_contact_custom`), `packages/api/src/contacts/read/store.ts` (hồ sơ trả `custom` — CHỈ hồ sơ, đã qua `contact_readable`)
- Test: `packages/api/test-db/truong-rieng/truong.test.ts` (ca E6, E7c)

**Interfaces:**
- Produces: `PATCH /api/v1/contacts/{contactId}/custom` body `Record<string, boolean|string|null>` → 200 `{ custom }` · 400 nêu mã ·
  403/404 như hồ sơ; thân hồ sơ liên hệ thêm `contact.custom`.

- [ ] Viết ca E6 và E7c (bảng đường × người; đếm route GET của `contacts/**` và tệp đọc `contacts` bằng grep; quét migration
  hàm `security definer` đọc `contacts` không `select *`/`c.*`).
- [ ] Route + store; hồ sơ select thêm `c.custom`; mọi đường khác KHÔNG thêm cột.
- [ ] `npm run db:test` xanh; phá thử: thêm `custom` vào thân danh sách → ô A2 × danh sách đỏ.
- [ ] Commit `feat(api): truong-rieng — giá trị trường riêng của liên hệ`.

### Task 5: Màn Cài đặt › Trường riêng

independent: true (sau Task 2; gọi API Task 3 lúc chạy) · phục vụ E3c, E10, E11, E14, E14b

**Files:**
- Create: `apps/web/src/app/(app)/settings/fields/page.tsx` (khuôn `statuses/page.tsx`: `chanMucSan`, GET fields + đọc tuVung)
- Modify: `apps/web/src/app/(app)/settings/fields/{truong-rieng.tsx,truong-rieng-thuan.ts}` (đã có)
- Create: `apps/web/src/app/(app)/settings/fields/truong-rieng.test.ts`
- Modify: `apps/web/src/components/shell/placeholder.tsx` (bỏ khoá `/settings/fields`); `design/patterns/trang-tam.md`
  (`ngoai_le` cho `settings/fields/page.tsx`), `packages/ui-lint/tests/{ban-do-khuon,rang-bo-cuc}.test.mjs` (bảng đếm)

- [ ] Viết «màn trường riêng: thân lưu, máy dò và khoá Lưu» (E3c) và phần màn của «bảng hàng: sàn không có trường riêng» (E10).
- [ ] `page.tsx`; nhận lỗi GET → `TrangThai kind="error"`.
- [ ] `npm test -w @quy-hang/web`, `npm run lint` xanh; `node _acceptance/truong-rieng-toi-thieu/kiem-khuon-e14.mjs` xanh.
- [ ] Commit `feat(web): truong-rieng — màn Cài đặt › Trường riêng`.

### Task 6: Bảng hàng — cột, sửa ô, lọc, góc nhìn, hàng đợi ngoại tuyến

independent: false (sau Task 2) · phục vụ E4c, E4e, E10, E12

**Files:**
- Create: `apps/web/src/app/(app)/inventory/truong-rieng.ts` (cột custom), `apps/web/src/app/(app)/inventory/truong-rieng.test.ts`
- Modify: `inventory/{cot.ts,ghep-danh-muc.ts,loc.ts,bang-hang.tsx,goc-nhin.ts,page.tsx,cell-edit/lenh.ts}`, `doc-tu-vung.ts` (thêm `docTruongRieng`)
- Modify: `apps/web/src/lib/sync/{types.ts,ap-tren-may.ts}` nếu bản trên máy cần khoá `custom`
- Create: `apps/web/src/lib/sync/truong-rieng.test.ts`

**Interfaces:**
- Consumes: `TruongRieng`, `chuGiaTri`, `truongCuaDoiTuong` (lõi); `ListingState.custom`.
- Produces: `type CotRiengId = \`custom:${string}\``; `cotTruongRieng(bo: TruongRieng[] | null): CotRieng[]` (null → `[]`);
  `chuOTruongRieng(dong: DongBang, code: string, bo): string`; `luaChonTruongRieng(dong[], code, bo)`; `lenhTruongRieng(code, v: boolean|string|null)`
  → `{type:"custom_changed", payload:{[code]: v}}`; `docTruongRieng(cookie): Promise<TruongRieng[] | null>`;
  `DongBang.custom: Record<string, boolean|string>`; góc nhìn: `giuCotRieng(cachXem, bo | null)` — null giữ nguyên, bỏ id
  chỉ khi trường có trong bộ với `archived`.

- [ ] Viết «bảng hàng: cột trường riêng» (E4c, gồm dòng «chưa tải»), «bảng hàng: sàn không có trường riêng» (E10), «hàng đợi
  ngoại tuyến: lệnh trường riêng» (E4e, máy chủ giả `may-chu-gia`).
- [ ] Nối cột custom sau cột chuẩn ở `bang-hang.tsx`, lọc «chọn» qua `chuOTruongRieng`, trình sửa ô thực đơn chọn + «Bỏ trống».
- [ ] `npm test -w @quy-hang/web`, typecheck, lint xanh; phá thử theo chiều đỏ của E4c/E4e/E10.
- [ ] Commit `feat(web): truong-rieng — cột trường riêng ở Bảng hàng`.

### Task 7: Hồ sơ liên hệ — mục «Trường riêng»

independent: true (sau Task 2; API Task 4 lúc chạy) · phục vụ E6c, E13

**Files:**
- Modify: `apps/web/src/app/(app)/contacts/{ho-so.tsx,lien-he.ts}`; Create: `apps/web/src/app/(app)/contacts/truong-rieng.ts`, `truong-rieng.test.ts`

**Interfaces:**
- Produces: `truongCuaNguoi(bo, contactTypes): TruongRieng[]`; `chuMucTruong(t, v)` («Chưa ghi» khi vắng); `thanPatch(code, v)`.

- [ ] Viết «hồ sơ liên hệ: mục trường riêng» (E6c).
- [ ] Mục `MucHoSo` «Trường riêng» sau «Số»; `Select` mỗi trường, lưu ngay qua PATCH, lỗi thì lùi + câu báo; không mục khi rỗng.
- [ ] `npm test -w @quy-hang/web`, lint xanh.
- [ ] Commit `feat(web): truong-rieng — mục trường riêng ở hồ sơ liên hệ`.

### Task 8: Rò rỉ, tài liệu, sổ

independent: true · phục vụ E5, E14 (gián tiếp)

**Files:**
- Create: `packages/core/src/redaction/truong-rieng.ro-ri.test.ts` (mồi `custom` + bộ trường mồi; `banRaNgoai`, `xuatBang`)
- Modify: `docs/product/tham-chieu.md` (§7 dựng 06/11, sổ quyết định §12 Hỏi-1..6), `docs/architecture/so-diem-bien-thien.md`
  (#22 «Mở · hàng 47», trần gộp 20; điều khoá K31 kiểu/đối tượng cố định, lựa chọn không gỡ), `docs/adr/0018-cau-hinh-theo-san.md`
  (quyết định 8 sửa đổi 06/11 — lớp nguồn cho trường của liên hệ chủ nhà), `docs/adr/0021-lien-he.md` (đóng «Mục chờ cho hàng 47»),
  `docs/product/doi-chieu-nganh.md` (dòng trường riêng theo loại), `docs/design/vo-va-ia.md` (Cài đặt › Trường riêng đã dựng),
  `CONTEXT.md` nếu thêm nhãn

- [ ] Viết ro-ri test (đỏ khi bản ra chép `custom`); `npm run test:ro-ri` xanh.
- [ ] Sửa tài liệu; `npm run lint` (bài kiểm tài liệu) xanh. Lưu ý `contacts.test.ts:119` đọc ADR-0021 — giữ chuỗi «hàng 47», «ADR-0018», «quyết định 8».
- [ ] Commit `docs: truong-rieng — Tham chiếu, sổ điểm biến thiên, ADR-0018/0021`.

### Task 9: Hoàn tất S3

independent: false · phục vụ mọi eval

- [ ] `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run test:ro-ri`; `npm run db:test` dãy B.
- [ ] Chạy khối DESIGN-FLOOR-S3; contract `status: implemented`; commit.
