# Kế hoạch thi công — san-sang-ban (hàng 23)

Hồ sơ: `_acceptance/san-sang-ban/` (duyệt 01/11). Thiết kế: `docs/superpowers/specs/2026-11-01-san-sang-ban-design.md`.
Làm tuần tự (các task chạm chung `Requirement` của lõi).

## Task 1 — Lõi: điều ảnh thật và đọc cấu hình

- Files: `packages/core/src/listing/status.ts`, `packages/core/src/listing/san-sang.ts` (mới), `index.ts`, `status.test.ts`.
- `Requirement` thêm `realPhoto` (đứng sau `feeInclusion`, trước `legalStatus` — thứ tự nhãn của AC-5);
  `TransitionContext` thêm `realPhotoCount?`, `minRealPhotos?`; `missingFor('Active')` đòi `realPhotoCount ≥ (minRealPhotos ?? 1)`
  khi có số đếm.
- `docCauHinhSanSang(rows)` → `{ minRealPhotos, loi? }`: khoá `listing.ready_min_real_photos`, số nguyên 1–20, sai → 1
  kèm lỗi nêu khoá. Hằng khoá, mặc định, khoảng một chỗ.
- Verify: `npm test -w @quy-hang/core` (E1, kèm lượt phá: bỏ điều ảnh → ca (0, vắng) đỏ). Phục vụ E1. independent: false.

## Task 2 — API: đếm ảnh thật, đọc cấu hình, ghép ngữ cảnh

- Files: `packages/api/src/listings/store.ts`, `packages/api/test-db/san-thu.ts` (`lenBang` thêm ảnh thật),
  các bài test-db tạo hàng Đang bán qua API, `packages/api/test-db/san-sang-ban.test.ts` (mới).
- Lệnh `status_changed` sang `Active`: đếm `unit_photos` của căn (toà + mã của hàng) ngăn `shareable`, `is_sample` false,
  `removed_at` null; đọc `company_settings` khoá trên; ngữ cảnh = `{ ...hienTai, ...payload, realPhotoCount, minRealPhotos }`.
- Verify: `npm run db:test` (E2, E3; lượt phá: bỏ đếm → ca không ảnh đỏ). Phục vụ E2, E3. independent: false.

## Task 3 — Web: nhãn thiếu và nút

- Files: `apps/web/src/app/(app)/inventory/cell-edit/lenh.ts` (+ test), `tren-o.tsx` (moTaLoi dùng nhãn),
  `apps/web/src/app/(app)/units/ready/san-sang.ts` (kiemSanSang, demAnhThat, hienNutSanSang), `nut-san-sang.tsx`,
  `san-sang.test.ts`, `units/ho-so/cot-ho-so.tsx` (gắn nút, «Chưa có» đúng ô, neo mục Ảnh).
- Nút gửi lệnh qua đường lệnh của trình sửa ô (hàng đợi đồng bộ) — tìm hàm gửi mà `tren-o.tsx` dùng.
- Verify: `npm test -w @quy-hang/web`, `npm run typecheck`, `npm run lint` (E4–E7, E10; lượt phá cho từng ca). Phục vụ
  E4, E5, E5b, E6, E7, E10. independent: false.

## Task 4 — Web trên Postgres: nút tới API thật

- Files: `apps/web/src/lib/sync/test-db/san-sang-ban.db-test.mts` (mới).
- Verify: `npm run test:db -w @quy-hang/web` (E6b). independent: false.

## Task 5 — Tài liệu

- Files: `docs/architecture/so-diem-bien-thien.md` (điểm mới, K7, Đếm), `docs/product/doi-chieu-nganh.md` §7,
  `docs/adr/0008-loi-hang-va-su-kien.md`, `docs/product/tham-chieu.md` §12.
- Verify: đọc lại; E9 (judgment) ở lượt chấm. independent: true.
