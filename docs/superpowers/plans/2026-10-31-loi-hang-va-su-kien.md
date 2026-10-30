# Kế hoạch thi công — loi-hang-va-su-kien

Hồ sơ `_acceptance/loi-hang-va-su-kien/` · **T3** · thiết kế `docs/superpowers/specs/2026-10-31-loi-hang-va-su-kien-design.md` ·
Cổng Phạm vi duyệt 30/10 (Hỏi-1..4 theo khuyến nghị).

Ràng buộc chung:
- Không thêm phụ thuộc mới (không đổi `package-lock.json`): khuôn chặt của payload viết tay trong `packages/core`, không
  dùng zod ở lõi; API vẫn dùng zod như các đường khác.
- Lõi hàng xuất qua lối con `@quy-hang/core/listing` — không sửa `packages/core/src/index.ts` (dãy G đang làm tệp ấy).
- Mọi phép đo mới đi kèm cặp hai chiều trên cùng fixture: vật lành xanh, phá vật thì đỏ với thông điệp ghim.

## Task 1 — Trạng thái và điều kiện (lõi thuần)

- **Files:** `packages/core/src/listing/status.ts`, `packages/core/src/listing/status.test.ts`, `packages/core/package.json`
  (thêm `"./listing": "./src/listing/index.ts"`), `packages/core/src/listing/index.ts`.
- Sáu `StandardStatus`; bảng chuyển 12 cặp (AC-4); `checkTransition(from, to, ctx)` trả `{ ok } | { ok: false, reasons }`;
  điều kiện vào `Closed` (giá chốt), `Withdrawn` (một trong ba lý do), `Active` (giá kèm điều kiện phí, pháp lý, tình
  trạng sử dụng — Hỏi-1).
- Kiểm thử: ma trận 36 cặp viết tay; bảng ca điều kiện; giá trị thứ bảy bị từ chối.
- **Verify:** `npm test -w @quy-hang/core && npm run typecheck`, kèm lượt phá: mở thêm một cặp → ca ma trận đỏ nêu cặp.
- **Phục vụ:** E4, E5b. **independent: true**

## Task 2 — Sự kiện, khuôn chặt, hàm gấp, độ tươi, mức đủ (lõi thuần)

- **Files:** `packages/core/src/listing/events.ts`, `fold.ts`, `freshness.ts`, `completeness.ts` và ba tệp `.test.ts`.
- Năm loại sự kiện và khuôn payload chặt từng loại (`validatePayload` từ chối khoá lạ ở mọi cấp, trả đường khoá);
  `foldListing(events, today)` → trạng thái, các trường của lần rao, giá chốt và ngày bán, `version`, độ tươi, mức đủ;
  độ tươi theo `confirmed_with_owner` (mặc định luật 9, tắt được); mức đủ năm mục ngang nhau (Hỏi-4).
- Kiểm thử: bộ ca độ tươi (bảy ca của E6), bộ ca mức đủ (E7), khoá lạ và bốn khoá chủ nhà ở cấp đầu và lồng.
- **Verify:** `npm test -w @quy-hang/core && npm run typecheck`, kèm lượt phá: sai một ngày → ca độ tươi đỏ nêu tên ca.
- **Phục vụ:** E6, E7, E10 (lõi). **independent: false** (cùng thư mục, dùng kiểu của Task 1)

## Task 3 — Migration 004 và bộ kiểm cách ly

- **Files:** `packages/db/migrations/004_loi_hang_va_su_kien.sql` (tạo mới bằng `/new-migration`),
  `packages/db/tests/isolation.test.mjs` (thêm ca).
- `listings` (bản tính: `company_id`, `id`, `building_name`, `unit_number`, `status`, `fields` jsonb, `closing_price`,
  `closed_at`, `last_confirmed_at`, `version`, `created_at`) và `listing_events` (chỉ thêm, unique `(company_id,
  listing_id, seq)`, khoá ngoại đôi giữ cùng sàn); cả hai `enable` + `force row level security`; grant tối thiểu; trigger
  từ chối `update`/`delete` trên `listing_events` cho mọi vai.
- Ca mới: sự kiện không sửa xoá được (E2); không hàm nào ghi vào hai bảng, đối chứng dương trong giao dịch huỷ (E3b);
  sàn A không đọc, không ghi hàng và sự kiện của B, đối chứng cùng câu (E10).
- **Verify:** `npm run db:migrate && npm run db:test` trên Postgres dãy Q (5545), kèm lượt phá: bỏ trigger → ca E2 đỏ.
- **Phục vụ:** E2, E3b, E10. **independent: true**

## Task 4 — Lệnh API `/listings`

- **Files:** `packages/api/src/listings/routes.ts`, `packages/api/src/listings/store.ts`, `packages/api/src/app.ts`
  (đăng ký), `packages/api/src/errors.ts` + `errors.test.ts` (mã mới), `packages/api/src/ten-cu.test.ts` không đụng.
- `POST /listings`, `POST /listings/{listingId}/events`, `GET /listings`, `GET /listings/{listingId}`; mỗi lệnh một
  giao dịch qua `withCompany`: khoá theo hàng (`select … for update`), xét phiên bản (trừ «thắng ngay»), xét bảng chuyển
  trên trạng thái hiện tại, kiểm khuôn chặt, ghi một sự kiện `seq = version + 1` kèm người và vai, ghi bản tính bằng
  `foldListing`. Mã lỗi mới: `version-conflict` 409, `invalid-transition` 400, `missing-requirement` 400,
  `invalid-payload` 400 — vào `API_ERRORS`, ca E3b của hàng trước cập nhật ma trận.
- Cập nhật ca «OpenAPI liệt đúng bộ đường» của hàng trước thêm bốn cặp mới.
- **Verify:** `npm test -w @quy-hang/api && npm run typecheck && npm run lint`.
- **Phục vụ:** E1, E5, E9, E10 (API). **independent: false** (cần Task 1–3)

## Task 5 — Kiểm thử có Postgres của lệnh

- **Files:** `packages/api/test-db/listings.test.ts`.
- Ca theo `expected` của E1, E5, E8 (cột lấy từ `information_schema`, đối chứng sửa tay một cột), E9 (bốn ca, hai ca
  đồng thời bằng hai kết nối song song), E10 (404 chéo sàn, khuôn chặt qua API).
- **Verify:** `npm run db:migrate && npm run db:test`, kèm lượt phá: bỏ khoá theo hàng → ca đồng thời đỏ nêu seq trùng.
- **Phục vụ:** E1, E5, E8, E9, E10. **independent: false**

## Task 6 — Quét «một đường ghi»

- **Files:** `packages/api/src/listings/mot-duong-ghi.test.ts`.
- Quét `packages/*/src`, `packages/db/scripts`, `packages/db/migrations`, `apps/web/src` theo E3, hai đối chứng dương.
- **Verify:** `npm test -w @quy-hang/api`, kèm lượt phá: cấy câu ghi ngoài thư mục → đỏ nêu tệp.
- **Phục vụ:** E3. **independent: false** (cần Task 3–4 để có câu ghi thật cho phép quét)

## Task 7 — Tài liệu

- **Files:** `docs/adr/0008-loi-hang-va-su-kien.md`, `docs/product/tham-chieu.md` (thêm một dòng §12; §5 thêm một dòng
  bảng chuyển — chỉ thêm dòng).
- **Phục vụ:** ghi điều đang đúng (AGENTS.md). **independent: true**

## Thứ tự

Task 1 ∥ Task 3 ∥ Task 7 → Task 2 → Task 4 → Task 5 → Task 6 → `/verify` → S4.
