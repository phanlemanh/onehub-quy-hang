# Khuôn «nguồn danh mục và thị trường» v2 — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Cửa nhận `POST /api/v1/catalog/feeds` nhận gói `schemaVersion: 2` gồm danh mục có độ chắc, số thị trường, tin rao đã khớp căn; gói v1 vẫn nhận.

**Architecture:** Khuôn v2 đặt cạnh v1 trong `catalog-feed.ts`, `parseCatalogFeed` chọn theo số phiên bản. Migration 042 thêm cột `field_confidence` và hai bảng ảnh chụp mỗi khu một dòng, vai API không đọc được nội dung. `ghiGoi` thêm phần ảnh chụp trong cùng giao dịch, hai đường vào (phiên, token) dùng chung.

**Tech Stack:** TypeScript chặt, zod, Hono + zod-openapi, Postgres 16, `node:test` + tsx.

**Spec:** `docs/superpowers/specs/2026-11-09-khuon-nguon-danh-muc-v2-design.md` · hợp đồng `_acceptance/khuon-nguon-danh-muc-v2/contract.md` · tiêu chí `_acceptance/khuon-nguon-danh-muc-v2/evals.yaml`. Câu chốt từng ca nằm ở `expected` của mỗi eval; tên ca dưới đây phải trùng nguyên văn.

## Global Constraints

- Cổng Phạm vi duyệt 09/11 cả 12 câu theo khuyến nghị (thiết kế §7): loại căn = loại hình + số phòng · không chở người đăng · căn chỉ có v1 để trống nhãn, v1 ghi lại thì xoá nhãn · chưa cho đọc số thị trường, tin rao · v1 không đặt hạn · ảnh chụp cũ hơn thì giữ số mới, vẫn 200 · ba nhãn giữ cứng · nhãn bắt buộc trên chín trường · tin rao thay theo khu · chuỗi cấm từ chối cả gói · gói tự đủ · chưa chở mặt bằng.
- Nhãn: `inferred`, `single_source`, `verified`. Chín trường: `stack`, `floor`, `livingArea`, `bedroomsTotal`, `directionFaces`, `lotSizeArea`, `storiesTotal`, `frontageLength`, `accessRoadWidth`.
- `.strict()` mọi cấp. Lưới chuỗi chỉ áp cho v2. Phản hồi v1 giữ nguyên năm khoá.
- Migration số 042 (giám sát giữ): chỉ dựa đối tượng ≤ 041, lặp lại được; bản thật áp sau 052.
- Vai API không có `delete`; đọc được `subdivision_key`, `measured_at` của hai bảng mới, không đọc `segments`, `listings`, `agreement_id`. Câu ghi không dùng `excluded.<cột không có quyền đọc>`, gán từ tham số như `catalog_units`.
- Không dữ liệu cá nhân thật: `[Mẫu]`, `0900 000 0xx`.
- Trước việc đầu của S3: khai thêm vùng `packages/core/src/catalog/**` bằng `hang vung`.

## Review Focus

- Gói v2 mọi mảng rỗng → 200 mọi số đếm 0 (Việc 3, ca «v2: gói rỗng»).
- Hai mốc đo cùng thời điểm, khác múi giờ → coi là bằng, gói sau thay (Việc 3, ca «ảnh chụp: cùng thời điểm khác múi giờ»).
- Giá tiền tỷ vượt số nguyên 32 bit → nhận và giữ đúng (Việc 1, ca «giá tiền tỷ»; Việc 3 so bằng trong ca «v2: nhận gói mẫu bằng phiên và bằng token»).
- `onMarketDate` đúng dạng mà không có thật như `2026-02-30` → từ chối (Việc 1, ca «ngày không có thật»).
- `schemaVersion: "2"` là chuỗi → 422, không rơi vào khuôn v2 (Việc 1, ca «phiên bản khuôn», Việc 3, ca «phiên bản lạ qua cửa nhận»).

---

### Việc 1: Khuôn v2 và gói mẫu

`independent: false` (Việc 3 dùng) · Phục vụ **E3, E4, E5, E7, E8, E12, E14**

**Files:** Modify `packages/core/src/catalog/types.ts` hoặc tệp mới cùng thư mục cho hằng độ chắc, `packages/connect/src/catalog-feed.ts`, `packages/connect/src/catalog-feed.test.ts` (đổi `[0, 2, undefined]` thành `[0, 3, undefined]`), `packages/connect/src/index.ts` · Create `packages/connect/src/catalog-feed-v2-mau.ts`, `packages/connect/src/catalog-feed-v2.example.json`, `packages/connect/src/catalog-feed-v2.test.ts`

**Interfaces — Produces:**

- `@quy-hang/core`: `CATALOG_CONFIDENCE_LEVELS` (ba nhãn), `CATALOG_CONFIDENCE_FIELDS` (chín trường), kiểu `CatalogConfidence`.
- `catalog-feed.ts`: `CATALOG_FEED_VERSIONS = [1, 2]`, `CATALOG_FEED_V2_SCHEMA_VERSION = 2`, schema `CatalogFeedV2`, kiểu `CatalogFeedV2`, `AnyCatalogFeed = CatalogFeed | CatalogFeedV2`. `parseCatalogFeed(raw)` trả `{ ok: true; feed: AnyCatalogFeed } | { ok: false; errors }`; `schemaVersion` khác 1, 2 hay không phải số nguyên: đúng một lỗi tại `["schemaVersion"]`.
- `catalog-feed-v2-mau.ts`: `goiMauV2(): CatalogFeedV2`, thuần, cố định, đủ ba nhãn, có đoạn đất `bedroomsTotal: null`.

Lưới chuỗi: `superRefine` duyệt đệ quy mọi lá chuỗi, loại các khoá `schemaVersion`, `measuredAt`, `onMarketDate`, `feeInclusion`, `propertyType`, `propertySubType` và giá trị trong `fieldConfidence`. Bốn dáng: `/https?:\/\//i`, `/\bwww\./i`, `/\b[a-z0-9-]+\.(?:com|net|org|vn|io|info|biz|asia|co)(?:\.[a-z]{2})?\b/i`, `MAU_DOAN_SDT`. Thông báo nêu đường lá.

- [ ] Viết các ca, thấy đỏ: `npm test -w @quy-hang/connect`. Ca: «phiên bản khuôn» (E3) · «độ chắc: ma trận lệch luật», «độ chắc: chín trường» (E4) · «số thị trường: ma trận lệch khuôn» (E5) · «tin rao: ma trận lệch khuôn», «ngày không có thật», «giá tiền tỷ» (E7) · «cấm: khoá lạ», «cấm: giá trị trong mọi chuỗi», «cấm: mã tin dáng số điện thoại», «đối chứng: chuỗi sạch có dấu chấm» (E8) · «gói mẫu: sinh từ khuôn, khớp tệp» (E12) · «danh sách phiên bản» (E14).
- [ ] Viết khuôn và gói mẫu, sinh tệp ví dụ bằng `goiMauV2()`, chạy lại, xanh. Chạy `npm run typecheck` và sửa chỗ dùng `parseCatalogFeed` nếu kiểu đổi.
- [ ] Commit `feat(connect): khuôn nguồn danh mục và thị trường v2`.

### Việc 2: Migration 042 và kiểm ở cơ sở dữ liệu

`independent: false` (Việc 3 dùng) · Phục vụ **E11**

**Files:** Create `packages/db/migrations/042_danh_muc_thi_truong_v2.sql`, `packages/db/tests/khuon-v2.test.mjs`

Giá trị máy không tự suy được:

- `catalog_units.field_confidence jsonb` · hàm `app.catalog_field_confidence_ok(p jsonb) returns boolean language sql immutable set search_path = ''`, đúng khi `null` hoặc object chỉ có chín khoá và giá trị thuộc ba nhãn · check tên `catalog_units_field_confidence_check` (`drop constraint if exists` rồi thêm).
- Hai bảng như thiết kế §3: `subdivision_key text primary key references catalog_subdivisions`, `provider text not null`, `measured_at timestamptz not null`, `agreement_id uuid not null references agreements`, `segments` hay `listings jsonb not null` check là mảng, `updated_at timestamptz not null default now()`.
- `enable` + `force`. Luật: `select using (true)`, `insert with check (app.catalog_source_active(agreement_id))`, `update using (true) with check (app.catalog_source_active(agreement_id))`.
- Quyền `quy_hang_app`: `select (subdivision_key, measured_at)`, `insert`, `update`; `catalog_units` thêm `select (field_confidence)`. Không `delete`.

- [ ] Viết ca, thấy đỏ trên Postgres dãy G: «ảnh chụp: quyền và luật», «field_confidence: ràng buộc», «hai thứ tự áp migration 042».
- [ ] Viết migration. Chạy `export DATABASE_URL=postgres://postgres:quyhang@localhost:5573/postgres && npm run db:migrate && npm run test:isolation -w @quy-hang/db` → xanh.
- [ ] Commit `feat(db): độ chắc và ảnh chụp thị trường (042)`.

### Việc 3: Cửa nhận v2

`independent: false` (cần Việc 1, 2) · Phục vụ **E1, E2, E6, E9, E10, E13**

**Files:** Modify `packages/api/src/catalog/feeds-ghi.ts`, `packages/api/src/catalog/feeds.ts`, `packages/api/src/catalog/feeds-token.ts` · Create `packages/api/test-db/khuon-v2/chung.ts`, `nhan-goi-v2.test.ts`, `anh-chup.test.ts`, `tat-thoa-thuan.test.ts`

**Interfaces — Produces** (`feeds-ghi.ts`): `ghiGoi(tx, feed: AnyCatalogFeed, agreementId)` trả `{ created; updated; anhChup: { marketSnapshots; publicListingSnapshots; staleSnapshotsSkipped } | null }`; `taoPhanHoi(feed, ketQua)` dựng thân: v1 đúng năm khoá, v2 thêm ba khoá. `chung.ts` dùng lại `sanCoToken`, `goi`, `themThoaThuan`, `tin` của `test-db/token-may/chung.ts`, gói thử sửa từ `goiMauV2()` với khoá khu và UPI gắn `RUN`.

Ảnh chụp ghi từng khu một câu, `on conflict (subdivision_key) do update ... where <bảng>.measured_at <= $mốc`; `rowCount` 0 là bỏ qua. `field_confidence` thêm vào cả danh sách cột của câu căn và điều kiện `is distinct from`.

- [ ] Viết các ca, thấy đỏ: «v2: nhận gói mẫu bằng phiên và bằng token», «v2: đẩy lại không nhân đôi», «v2: gói rỗng» (E1) · «v1: phản hồi giữ tập khoá cũ», «v1 ghi lại căn thì xoá nhãn», «phiên bản lạ qua cửa nhận» (E2) · «ảnh chụp: gói sau thay gói trước của cùng khu», «ảnh chụp: cùng thời điểm khác múi giờ» (E6) · «cấm: cả gói không vào» (E9) · «tắt thoả thuận: dừng nhận v2», «tắt giữa lúc kiểm và ghi» (E10) · «v2 trên đường token: nhật ký», «OpenAPI khai phản hồi v2» (E13).
- [ ] Viết mã. Chạy executor `executors.test.khuon_v2_db` trong `_acceptance/config.yaml` → xanh, gồm cả `nhan-goi`. Chạy `npm test -w @quy-hang/api`, `npm run typecheck`, `npm run lint`.
- [ ] Commit `feat(api): cửa nhận danh mục nhận gói v2`.

### Việc 4: Tài liệu điều đang đúng

`independent: false` (ghi lại điều Việc 1–3 đã làm) · Phục vụ tiêu chí tài liệu của AGENTS.md, không có eval riêng

**Files:** Modify `docs/adr/0015-khuon-danh-muc-v1.md` (mục sửa đổi 09/11: khuôn v2, ba phần, luật ảnh chụp, v1 còn nhận) · `docs/product/tham-chieu.md` (§12 mười hai quyết định) · `CONTEXT.md` (Độ chắc ↔ `field_confidence`, Số thị trường ↔ `catalog_market_snapshots`, Tin rao đã khớp căn ↔ `catalog_public_listing_snapshots`) · `docs/product/doi-chieu-nganh.md` (mục mới từ thiết kế §5, giữ đường dẫn nguồn và chữ «chưa kiểm») · `docs/architecture/so-diem-bien-thien.md` (điều khoá K35 ba nhãn độ chắc, lý do «nghĩa chuẩn để so giữa các sàn», số đếm)

- [ ] Sửa năm tệp. Chạy `npm run lint` và `npm test`.
- [ ] Commit `docs(khuon-nguon-danh-muc-v2): cập nhật điều đang đúng`.

## Sau Việc 4

Chạy `/verify` đủ bước, gồm bộ kiểm cơ sở dữ liệu trên Postgres dãy G. Đổi `status: implemented` rồi vào S4. Báo khuôn cho Invest ở phanlemanh/onehub-invest#296 là cam kết ra ngoài, không thuộc vòng này.
