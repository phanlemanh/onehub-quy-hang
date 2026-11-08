# Khuôn xác nhận danh mục v1 — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Loại kết nối `catalog_confirmation` chỉ mở lớp danh mục (lõi + cơ sở dữ liệu), và sự kiện «xác nhận danh mục» v1 chỉ dựng được bằng hàm của lõi, đọc được bằng khuôn ở `packages/connect`.

**Architecture:** Trần theo loại nằm ở `agreements.ts` (bảng `KIND_LIMITS`) và migration 040. Hàm dựng ở đường xuất riêng `@quy-hang/core/confirmation` (dùng `node:crypto` cho mã mờ). Khuôn zod `.strict()` ở `packages/connect/src/catalog-confirmation.ts` lấy hằng (hướng RESO, trường báo sai, phiên bản) từ lõi, không chép.

**Tech Stack:** TypeScript chặt, zod 3, `node:test` + tsx, Postgres 16 (`pg`), `node:crypto` HMAC-SHA256.

**Spec:** `docs/superpowers/specs/2026-11-08-khuon-xac-nhan-danh-muc-design.md` · hợp đồng `_acceptance/khuon-xac-nhan-danh-muc/contract.md` · evals `_acceptance/khuon-xac-nhan-danh-muc/evals.yaml`

## Global Constraints

- Cổng Phạm vi duyệt 08/11: mốc `observedOn` theo **ngày** `YYYY-MM-DD` · không có ô «xác minh chủ với sổ» · toà chỉ trỏ bằng `buildingKey` có trong danh mục · sáu trường báo sai giữ cứng (`unitNumber`, `livingArea`, `bedroomsTotal`, `directionFaces`, `floor`, `stack`) · mã mờ = HMAC-SHA256 khoá riêng từng bên nhận.
- Mã mờ: `HMAC-SHA256(khoa, "quy-hang/xac-nhan/v1/office:" + companyId)` và `"…/member:" + userId`, base64url không đệm, 43 ký tự; khoá < 32 byte hay vắng → không dựng.
- Dạng đóng: mã căn sau `normalizeCode` khớp `^[A-Z0-9]+([.\-_/][A-Z0-9]+)*$`, ≤ 12 ký tự, không chuỗi ≥ 8 chữ số liền · mã trục `^[A-Z0-9]{1,6}$` · `buildingKey` `^[A-Za-z0-9][A-Za-z0-9_.:-]{0,79}$` · UPI `^urn:onehub:upi:` · hướng ra RESO `North, Northeast, East, Southeast, South, Southwest, West, Northwest`.
- Khung toà: `storiesTotal` nguyên 1–120 · `skippedFloors` nguyên, tăng ngặt, mỗi số 1..storiesTotal · `stacks` 1–60 phần tử, không trùng.
- Migration `040_xac_nhan_danh_muc.sql`: chỉ dựa đối tượng ≤ 039 (`agreements` ở 001, `agreements_kind_check` ở 035), viết lặp lại được (`drop constraint if exists` rồi `add`), giao hoán với 041–052 (điều kiện giám sát G-0811-7/8).
- Không chạm `docs/plan/lo-trinh.json`, `_acceptance/config.yaml`, `CONTEXT.md`, `packages/core/src/data-classes.ts`; tệp dùng chung chỉ thêm dòng (luật đợt 12). Không dữ liệu cá nhân thật: `[Tên]`, `0900 000 0xx`.
- Hàm dựng trả `{ ok: true, suKien } | { ok: false, loi: { truong: string; thongDiep: string }[] }`, không ném. Lõi không đọc đồng hồ: `today` là đối số.

## Review Focus

- Danh mục thật ghi hướng tiếng Việt và mã căn có thể chưa chuẩn hoá → báo sai trùng nghĩa phải bị chặn (Task 3, ca «trùng danh mục» 8 phần tử).
- Một chỗ gọi sau này truyền cả một căn nội bộ vào hàm dựng → mọi khoá ngoài danh sách khai bị từ chối nêu tên, không lọc lặng (Task 3, ma trận 6 × 3).
- Thoả thuận đọc từ cơ sở dữ liệu lệch (thêm `transaction` + điều khoản riêng) → `mayFlow` vẫn chặn từng lớp (Task 1).
- Bản thật áp 040 sau 052 → ràng buộc đúng như trên cơ sở dữ liệu mới (Task 2, ca áp lại).
- `companyId` trùng `userId` → mã sàn khác mã người nhờ tiền tố miền (Task 3, E10).

## Bảng tóm tắt cho người duyệt

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Loại kết nối «Xác nhận danh mục» chỉ mở lớp danh mục, giá chốt không mở được | `packages/core/src/agreements.ts` | AC-1 (trần theo loại ở lõi) |
| Cơ sở dữ liệu tự chặn thoả thuận loại ấy mang lớp khác, đúng cả trên bản thật | `packages/db/migrations/040_xac_nhan_danh_muc.sql` | AC-2 (chặn ở cơ sở dữ liệu) |
| Lời xác nhận chỉ dựng được bằng hàm của lõi, mã sàn và mã người được che | `packages/core/src/confirmation/**` | AC-4…AC-10 (luật dựng) |
| Invest có mẫu phiên bản 1 và tệp ví dụ để kiểm gói | `packages/connect/src/catalog-confirmation*` | AC-3, AC-4, AC-5, AC-8 (mẫu) |
| Tài liệu sản phẩm ghi điều đã chốt | ADR-0027, Tham chiếu, Đối chiếu ngành, Sổ điểm biến thiên | luật đợt 6 |

---

### Task 1: Trần theo loại kết nối ở lõi

`independent: false` (Task 2, 3 dùng `catalog_confirmation`) · Phục vụ: E1

**Files:**
- Modify: `packages/core/src/agreements.ts`
- Test: `packages/core/src/agreements.test.ts`

**Interfaces:**
- Produces: `CONNECTION_KINDS` thêm `"catalog_confirmation"` (cuối danh sách); `KIND_LIMITS: Readonly<Partial<Record<ConnectionKind, { direction: Direction; dataClasses: readonly DataClass[]; specialTerms: false }>>>` với `catalog_confirmation: { direction: "outbound", dataClasses: ["catalog"], specialTerms: false }`; hằng `KIND_LABEL_CATALOG_CONFIRMATION = "Xác nhận danh mục"`.

- [ ] **Step 1: Viết ba ca đỏ** — «xác nhận danh mục: trần theo loại, bảy lớp» (ma trận `DATA_CLASSES × [false, true]`, đếm 14; thoả thuận liệt đủ bảy lớp; chỉ `catalog` ok; lớp khác reason chứa «Xác nhận danh mục», riêng `source` giữ lý do lớp nguồn); «xác nhận danh mục: lỗi cấu trúc» (đối chứng `[]`; ma trận `DATA_CLASSES` trừ catalog + chiều vào + `specialTerms: true`, đếm 8, mỗi lần có lỗi chứa «Xác nhận danh mục»); «sáu loại cũ và ai_processing giữ hành vi» (mỗi loại khác, đếm `CONNECTION_KINDS.length − 1`, outbound `transaction` + `specialTerms: true` → ok).
- [ ] **Step 2:** `npm test -w @quy-hang/core -- --test-name-pattern "xác nhận danh mục|sáu loại cũ"` → FAIL (loại chưa có).
- [ ] **Step 3:** Thêm loại, `KIND_LIMITS`; `agreementErrors` đẩy lỗi «Thoả thuận «Xác nhận danh mục» chỉ …» cho chiều sai, mỗi lớp ngoài danh sách, `specialTerms`; `mayFlow` — sau dòng chặn `source`, trước kiểm kind/direction: loại có giới hạn mà lớp ngoài `dataClasses` của giới hạn → `{ ok: false, reason: "Thoả thuận «Xác nhận danh mục» chỉ mở lớp danh mục." }`.
- [ ] **Step 4:** `npm test -w @quy-hang/core` → PASS cả bộ (kể cả `custom-fields.test.ts` lặp mọi loại).
- [ ] **Step 5: Phá thử** — tạm gỡ nhánh giới hạn trong `mayFlow` → ca bảy lớp đỏ nêu `transaction`; hoàn lại. Commit `feat(core): loại kết nối catalog_confirmation chỉ mở lớp danh mục`.

### Task 2: Migration 040 và bài kiểm cơ sở dữ liệu

`independent: false` (sau Task 1) · Phục vụ: E2, E14

**Files:**
- Create: `packages/db/migrations/040_xac_nhan_danh_muc.sql` — bằng skill `/new-migration` nếu nó cho đặt số giữ chỗ, không thì viết tay theo khuôn 035
- Create: `packages/db/tests/xac-nhan-danh-muc.test.mjs`
- Test: `packages/core/src/agreements.test.ts` (ca E14)

**Interfaces:**
- Consumes: danh sách loại của Task 1.
- Produces: ràng buộc `agreements_kind_check` (tám loại) và `agreements_xac_nhan_chi_danh_muc`.

- [ ] **Step 1: Viết `xac-nhan-danh-muc.test.mjs`** theo nếp `danh-muc-dung-chung.test.mjs` (sàn riêng `00000000-0000-4000-8000-0000000c0b01`, `set local role quy_hang_app`, `set_config('app.company_id', …)`, mỗi ca rollback, `skip` khi vắng `DATABASE_URL` trừ CI). Bốn ca đúng tên E2: «cơ sở dữ liệu chỉ nhận lớp danh mục» (ma trận 6 lớp; transaction/behavior/shareable_listing/custom_field ghim `agreements_xac_nhan_chi_danh_muc`; source/company_internal ghim tên cũ rồi trong savepoint chủ bảng `alter table agreements drop constraint agreements_never_source, drop constraint agreements_internal_stays` và insert lại → tên mới; ba phần tử inbound, special_terms, update; đối chứng rowCount 1) · «mọi loại kết nối đều thêm được» (danh sách rút từ thân 040 bằng `rutLoai(sql)`, đếm = 8) · «thứ tự của bản thật: áp lại 040 sau 052» (chủ bảng `client.query(readFileSync(040))` trong giao dịch, rồi chạy lại phần tử transaction + đối chứng) · «không migration nào sau 040 đổi lại ràng buộc» (`timGhiDe(teps)` trên mọi `NNN_*.sql` với NNN > 40; đối chứng âm chuỗi thử).
- [ ] **Step 2: Viết ca E14** «danh sách loại của ràng buộc cơ sở dữ liệu trùng CONNECTION_KINDS» trong `agreements.test.ts`: đọc 040 theo đường `new URL("../../db/migrations/", import.meta.url)`, `rutLoai(sql)` = các chuỗi `'…'` trong `check (kind in (…))` của `agreements_kind_check`; so tập, độ dài 8; đối chứng âm SQL thiếu `catalog_confirmation` → hàm so gọi tên loại thiếu.
- [ ] **Step 3:** Postgres dãy G: `DATABASE_URL=postgres://postgres:quyhang@localhost:5573/postgres npm run db:migrate && npm run test:isolation -w @quy-hang/db` → FAIL (chưa có 040).
- [ ] **Step 4:** Viết 040: `alter table agreements drop constraint if exists agreements_kind_check; … add constraint agreements_kind_check check (kind in (…8…)); alter table agreements drop constraint if exists agreements_xac_nhan_chi_danh_muc; … add constraint agreements_xac_nhan_chi_danh_muc check (kind <> 'catalog_confirmation' or (direction = 'outbound' and data_classes = array['catalog']::text[] and not special_terms));` kèm đầu tệp nói hàng 95, luật 74, điều kiện thứ tự.
- [ ] **Step 5:** Lệnh eval `executors.script.nhap_tac_tu` (migrate + db:test trên 5573) → PASS; `npm test -w @quy-hang/core` → PASS. Phá thử: bỏ ràng buộc mới khỏi 040 trên một cơ sở dữ liệu tạm → ca 6 lớp đỏ nêu `transaction`; hoàn lại. Commit `feat(db): 040 ràng buộc thoả thuận xác nhận danh mục chỉ lớp danh mục`.

### Task 3: Hàm dựng ở lõi — `@quy-hang/core/confirmation`

`independent: false` (sau Task 1) · Phục vụ: E4, E7, E8, E9, E10, E12, E13

**Files:**
- Create: `packages/core/src/confirmation/khuon.ts` (hằng, kiểu, bảng lớp), `ma-mo.ts`, `dang-dong.ts`, `dung.ts`, `index.ts`
- Create: `packages/core/src/confirmation/dung.test.ts`, `ma-mo.test.ts`, `lop.test.ts`, `dau.test.ts`
- Modify: `packages/core/package.json` — thêm `"./confirmation": "./src/confirmation/index.ts"`

**Interfaces:**
- Consumes: `Agreement`, `mayFlow` (Task 1); `CatalogData`, `normalizeCode` (`../catalog`); `DIRECTIONS` (`../import/dictionaries`); `LOP_TRUONG`, `KhoaCanNoiBo`, `canMoi`, `timRoRi`, `GiaTriMoi` (`../redaction`); `CEILING`, `DataClass`.
- Produces (khuon.ts): `CATALOG_CONFIRMATION_SCHEMA_VERSION = 1` · `LOAI_SU_KIEN = ["building_frame","unit_attributes","correction"] as const` · `TRUONG_BAO_SAI` (sáu trường, thứ tự Global Constraints) · `HUONG_RESO` (tám giá trị) · `KHOA_VO = ["schemaVersion","eventType","officeKey","memberKey","observedOn"] as const` · `KHOA_RIENG: Record<LoaiSuKien, readonly string[]>` (danh sách ghim của E8) · `LOP_TRUONG_KHUON = { buildingKey: "catalog", skippedFloors: "catalog", stacks: "catalog" }` · `NGUON_LOP: Record<string, KhoaCanNoiBo>` (khoá căn → chính nó, `storiesTotal → buildingFloorsTotal`, `field`/`correctValue` → không tra: `field` là tên trường, `correctValue` lấy lớp của trường mà `field` chỉ) · `kiemLopKhoa(khoaRieng, lopKhuon, lopTruong, nguon): string[]` · kiểu `KhungToa`, `ThuocTinhCan`, `BaoSai`, `SuKienXacNhan` mang dấu `declare const DAU_LOI: unique symbol` (`{ readonly [DAU_LOI]: true }`, chỉ ở kiểu).
- Produces (ma-mo.ts): `maMo(khoa: Uint8Array, mien: "office" | "member", id: string): string`.
- Produces (dang-dong.ts): `chuanHoaMaCan(raw: string): string | null` · `docHuong(raw: string): Huong | null` (nhận nhãn `DIRECTIONS` hoặc RESO) · `laMaTruc(s: string): boolean`.
- Produces (dung.ts): `type NguCanh = { thoaThuan: Agreement; danhMuc: CatalogData; khoaBenNhan: Uint8Array | undefined; companyId: string; userId: string; today: string }` · `type Loi = { truong: string; thongDiep: string }` · `type KetQua<T> = { ok: true; suKien: T } | { ok: false; loi: Loi[] }` · `dungKhungToa(dau: { buildingKey: string; storiesTotal: number; skippedFloors: number[]; stacks: string[] }, nc: NguCanh): KetQua<KhungToa>` · `dungThuocTinhCan(dau: { buildingKey: string; upi: string | null; unitNumber: string; livingArea?: number; bedroomsTotal?: number; directionFaces?: string; floor?: number; stack?: string }, nc): KetQua<ThuocTinhCan>` · `dungBaoSai(dau: { buildingKey: string; upi: string; field: TruongBaoSai; correctValue: string | number }, nc): KetQua<BaoSai>`.
- Thứ tự khoá đầu ra cố định: vỏ (`schemaVersion, eventType, officeKey, memberKey, observedOn`) rồi phần riêng theo `KHOA_RIENG` — để tệp ví dụ của Task 4 ổn định từng byte.

- [ ] **Step 1: Viết ca đỏ** đúng tên các eval: E4 (ma trận 6 × 3 đếm 18 + timRoRi trên mồi mọi khoá `LOP_TRUONG` lớp ≠ catalog của `canMoi()`, kiểu mồi suy theo giá trị: số điện thoại → `so_dien_thoai`, số → `so_tien`, chuỗi → `chu`) · E7 (năm phần tử + đối chứng `a-12.06`, `Đông Nam`→`Southeast`) · E8 (năm thoả thuận + danh sách ghim + rời bảng + hai đối chứng âm) · E9 (`dau.test.ts`: `// @ts-expect-error` trên `const x: SuKienXacNhan = { …đủ khoá… }`) · E10 · E12 (danh mục đọc `../../../db/seed/mau/du-lieu-mau.json`, lấy `.danhMuc.subdivisions`; căn A-01.01; 6 + 8 + 5 phần tử) · E13 (đúng + 8 phần tử).
- [ ] **Step 2:** `npm test -w @quy-hang/core` → FAIL (module chưa có).
- [ ] **Step 3:** Viết bốn tệp theo Interfaces. Kiểm theo thứ tự: khoá lạ của `dau` (so `Object.keys(dau)` với danh sách khai; khoá thuộc danh sách «không bao giờ có» nhắn «không bao giờ rời sàn») → thoả thuận (`kind === "catalog_confirmation"` và `mayFlow(…, "catalog", { at: new Date(today + "T00:00:00Z"), kind, direction: "outbound" }).ok`) → `today` khớp ngày → khoá bên nhận ≥ 32 byte → danh mục (toà, căn) → dạng đóng từng trường → luật riêng loại (báo sai: so sau chuẩn hoá với giá trị danh mục; khung toà: dải, tăng ngặt, trùng). Gom mọi lỗi, không dừng ở lỗi đầu (trừ khoá lạ và thoả thuận — trả ngay).
- [ ] **Step 4:** `npm test -w @quy-hang/core && npm run typecheck` → PASS. Phá thử E9: gỡ dấu khỏi `SuKienXacNhan` → `npm run typecheck` báo TS2578 ở `dau.test.ts`; hoàn lại. Phá thử E10: bỏ tiền tố miền → ca officeKey ≠ memberKey đỏ; hoàn lại.
- [ ] **Step 5:** Commit `feat(core): hàm dựng sự kiện xác nhận danh mục v1`.

### Task 4: Khuôn v1 ở `packages/connect` và tệp ví dụ

`independent: false` (sau Task 3) · Phục vụ: E3, E5, E6, E11

**Files:**
- Create: `packages/connect/src/catalog-confirmation.ts`, `catalog-confirmation.test.ts`, `catalog-confirmation.example.json`
- Modify: `packages/connect/src/index.ts` (thêm một dòng `export * from "./catalog-confirmation";`)

**Interfaces:**
- Consumes: hằng và hàm dựng của Task 3 qua `@quy-hang/core/confirmation`.
- Produces: `CatalogConfirmation` (zod; `z.discriminatedUnion("eventType", [KhungToaSchema, ThuocTinhCanSchema, BaoSaiSchema])`, mọi object `.strict()`; `correctValue` = `z.union([z.number(), chuỗi mã căn regex, chuỗi mã trục regex, z.enum(HUONG_RESO)])` + `superRefine` kiểu theo `field`; `observedOn` regex ngày; `officeKey`/`memberKey` regex 43 ký tự) · `parseCatalogConfirmation(raw: unknown): { ok: true; event: CatalogConfirmation } | { ok: false; errors: { path: (string|number)[]; message: string }[] }` · `CATALOG_CONFIRMATION_SCHEMA_VERSION` (xuất lại từ lõi).

- [ ] **Step 1: Viết ca đỏ** đúng tên E3, E5 (ca «mọi đối tượng strict» + ma trận rút từ hàm đi cây), E6 (hàm `chuoiThieuMau(schema)` đi `ZodDiscriminatedUnion/ZodUnion/ZodObject/ZodArray/ZodNullable/ZodOptional/ZodEffects`; số chuỗi ghim; đối chứng âm) và E11; khoá bên nhận thử `new Uint8Array(32).fill(7)`, sàn `[Sàn mẫu]` id cố định, ngày `2026-11-08`, danh mục từ bộ dữ liệu mẫu.
- [ ] **Step 2:** `npm test -w @quy-hang/connect` → FAIL.
- [ ] **Step 3:** Viết khuôn; sinh tệp ví dụ một lần bằng chính ba hàm dựng (`node --import tsx -e …` in `JSON.stringify([...], null, 2) + "\n"`), đầu tệp không chú thích (JSON).
- [ ] **Step 4:** `npm test -w @quy-hang/connect && npm run typecheck && npm run lint` → PASS. Phá thử E5: bỏ `.strict()` ở `ThuocTinhCanSchema` → hai ca đỏ nêu đường; hoàn lại.
- [ ] **Step 5:** Commit `feat(connect): khuôn sự kiện xác nhận danh mục v1 và tệp ví dụ`.

### Task 5: Tài liệu điều đang đúng, bản đồ

`independent: true` (chỉ tài liệu) · Phục vụ: luật đợt 6, 27 (không eval máy)

**Files:**
- Create: `docs/adr/0027-khuon-xac-nhan-danh-muc.md` (khuôn như ADR-0015: bối cảnh, năm quyết định của Cổng Phạm vi, hệ quả, không làm)
- Modify (chỉ thêm dòng): `docs/product/tham-chieu.md` §12 dòng 08/11 · `docs/product/doi-chieu-nganh.md` mục mới «12. Xác nhận danh mục» (RESO EntityEvent, Google Maps, Waze, kèm nguồn) · `docs/architecture/so-diem-bien-thien.md` một dòng điều khoá «sáu trường báo sai, ba loại sự kiện — nghĩa chuẩn để so giữa các sàn»
- Vẽ lại `PRODUCT-MAP.md`, `LO-TRINH.html` bằng `scripts/product-map.mjs --root .` sau khi dời tệp chưa theo dõi ra ngoài cây (luật 79).

- [ ] **Step 1:** Viết ADR và ba dòng thêm; `node scripts/product-map.mjs --root . --check` → khớp sau khi vẽ lại.
- [ ] **Step 2:** `npm run lint` → PASS. Commit `docs: ADR-0027 khuôn xác nhận danh mục v1, Tham chiếu và đối chiếu ngành`.

### Sau Task 5

- `/verify` của kho (kiểm kiểu, lint, test, build, bài tự kiểm rào, bộ cách ly trên 5573). Hợp đồng sang `implemented`, xin lượt `s4` rồi S4.
