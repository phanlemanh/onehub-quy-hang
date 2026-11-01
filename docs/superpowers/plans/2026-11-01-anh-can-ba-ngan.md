# Kế hoạch thi công — Ảnh căn ba ngăn (hàng 18)

Hợp đồng: `_acceptance/anh-can-ba-ngan/contract.md` (đã duyệt 01/11). Thiết kế:
`docs/superpowers/specs/2026-11-01-anh-can-ba-ngan-design.md`. Verify mỗi task theo luật kho (AGENTS.md): kiểm kiểu, lint,
test của gói chạm; task chạm `packages/db` chạy thêm bộ kiểm cách ly trên Postgres dãy H (cổng 5562). Mỗi phép đo mới đi
kèm cặp hai chiều (vật lành xanh, bản sao phá đỏ với thông điệp ghim).

## Task 1 — Luật lõi ảnh (`packages/core/src/photos/`)
- Files: `index.ts` (đã có bản đầu từ bước thiết kế), `photos.test.ts`, `bang-xem-noi-bo.json` (8 người × 5 ô, viết trước),
  dòng xuất ở `packages/core/src/index.ts` nếu cần.
- Làm: hoàn thiện `kiemTepAnh`, `docNgayChup`, `nhanAnh`, `sapXep`, `anhRaNgoai`, `anhDanhMuc`, `canSeeUnitInternal`;
  bảng ca nội bộ dùng chung với bộ kiểm cách ly.
- Verify: `npm test -w @quy-hang/core`, `npm run typecheck`.
- Phục vụ: E2, E3, E7, E8 (và bảng ca của E5). `independent: true`.

## Task 2 — Migration 012 và bộ kiểm cách ly (`packages/db`)
- Files: `packages/db/migrations/012_anh_can.sql`, `packages/db/tests/isolation.test.mjs` (thêm ca).
- Làm: ba bảng `unit_photos`, `unit_photo_files`, `unit_photo_events`; `app.can_see_unit_internal(building, unit)`; luật
  theo dòng `enable` + `force`; ràng buộc nội bộ không bìa/không ảnh mẫu, một bìa mỗi căn; trigger chỉ thêm cho sự
  kiện; quyền vai `quy_hang_app` (không `delete` trên `unit_photos`, có `delete` trên `unit_photo_files` cho Hỏi-6).
  Ca cách ly: hai sàn trùng toà/mã; bảng 40 ô nạp từ `bang-xem-noi-bo.json`; pg_class rls/force.
- Verify: Postgres dãy H — `npm run db:migrate && npm run db:test`.
- Phục vụ: E5, E9. `independent: true` (chỉ đọc JSON của task 1 — làm sau task 1 trong cùng nhánh).

## Task 3 — API ảnh (`packages/api/src/photos/`)
- Files: `routes.ts`, `store.ts`, `kho.ts` (giao diện `KhoAnh` + bản Postgres), `kho-s3.ts` (bản Supabase Storage, SigV4
  bằng `node:crypto`, mô-đun duy nhất đọc `STORAGE_S3_*`), `photos.test.ts`; một dòng đăng ký ở `app.ts`, mã lỗi ở
  `errors.ts` (`photo_not_image`, `photo_too_large`, `photo_internal_no_sample`).
- Làm: `GET/POST /api/v1/units/photos`, `PATCH/DELETE /api/v1/units/photos/{id}`, `GET …/{id}/{thumb|original}` (302 tới
  link ký 60 giây ở bản S3, byte ở bản Postgres; no-store cho nội bộ). Kiểm byte đầu và cỡ bằng luật lõi; mọi lệnh một sự
  kiện; xoá hẳn byte (Hỏi-6). Chọn bản kho: có đủ ba biến → S3, không có → Postgres; bản thật thiếu khoá → báo lỗi rõ,
  không dựng mục ảnh.
- Verify: `npm test -w @quy-hang/api` trên Postgres dãy H (test có máy chủ S3 giả và véc tơ SigV4 mẫu).
- Phục vụ: E1b, E2b, E3b, E4, E5b, E6, E6b. `independent: false` (cần task 1, 2).

## Task 4 — Mục Ảnh nối API thật (`apps/web/src/app/(app)/units/photos/`, `units/ho-so/`)
- Files: `muc-anh.tsx`, `tai-len.ts` (đã có từ bước thiết kế), `nguon-api.ts` (NguonAnh gọi API), `tai-len.test.ts`,
  `muc-anh.test.ts` (quét: không nhập `lib/sync`, không IndexedDB); `units/ho-so/cot-ho-so.tsx` thêm mục Ảnh.
- Làm: dòng lỗi gắn với ngăn đích (phát hiện 2 của bước thiết kế); quyền thêm/sửa theo `suaDuoc` API trả.
- Verify: `npm test -w @quy-hang/web`, `npm run typecheck`, `npm run lint`.
- Phục vụ: E1, E2b (phía web), E6 (phía web). `independent: false` (cần task 3 cho khuôn trả lời).

## Task 5 — Khuôn nhóm, tài liệu, gỡ trang thử
- Files: `design/patterns/ho-so-can.md` (đã thêm KH-hs-anh-noi-bo), ảnh chụp số đếm ở `packages/ui-lint/tests/*` (dòng
  snapshot — G-3110-17), `docs/adr/0014-kho-anh.md` (mục Vận hành: tên ba biến, chi phí gói Pro), `docs/product/tham-chieu.md`
  §12 một dòng, `docs/design/vo-va-ia.md` dòng đã chuyển thể; `CONTEXT.md` hai dòng nếu H-7 được duyệt; gỡ
  `proto/anh-can-ba-ngan` khi màn thật qua Cổng Bằng chứng (để S5).
- Verify: `npm test -w @quy-hang/ui-lint`, `npm run lint`.
- Phục vụ: E10b. `independent: true`.

## Task 6 — Dựng bản chấm trên máy (`_acceptance/anh-can-ba-ngan/thu/dung-h.mjs`)
- Làm: Postgres dãy H migrate, sàn mẫu có đầu chủ giữ căn A, trưởng nhóm, đầu chủ khác, đầu khách; máy chủ dev 3482, nhật
  ký ngoài cây kho; sinh ba ảnh mẫu vẽ bằng mã và một «.jpg» là chữ.
- Verify: chạy lệnh, mở `/inventory` bằng chrome-devtools, thấy mục Ảnh của căn A.
- Phục vụ: E10. `independent: true`.

Thứ tự: 1 → 2 → 3 → 4; 5 và 6 song song bất kỳ lúc nào. Xong → hợp đồng `implemented` → S4.
