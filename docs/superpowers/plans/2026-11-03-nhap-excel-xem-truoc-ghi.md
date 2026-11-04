# Kế hoạch thi công — đường ghi lần nhập (hàng 65a nhap-excel-xem-truoc-ghi)

Ngày 03/11/2026 · T3 · Hợp đồng `_acceptance/nhap-excel-xem-truoc-ghi/contract.md` (duyệt 03/11, 11 tiêu chí) · Thiết kế
`docs/superpowers/specs/2026-11-03-nhap-excel-xem-truoc-ghi-design.md`.

**Mục tiêu:** đường ghi một lần nhập file qua đúng cửa của lõi hàng, có xem thử bằng ghi, chủ nhà qua cửa chủ nhà, tin bổ sung
cho căn người khác giữ, độ tươi theo ngày trong file, cách ly theo sàn.

**Kiến trúc:** luật quyết dòng và kiểm kế hoạch ở `packages/core/src/import/`; luật đọc của đầu chủ giữ căn ở
`packages/core/src/visibility/`; máy chủ (`packages/api/src/imports/`) áp lại kế hoạch trên ô thô, đọc dữ kiện, hỏi lõi, rồi gọi
đúng các cửa có sẵn (tạo hàng, lệnh hàng, chủ nhà, phần ghi của lead). Xem thử chạy cùng đường trong giao dịch rồi lùi.

Mọi task TDD: viết ca đỏ trước, chạy thấy đỏ, viết mã, chạy thấy xanh, commit. Lệnh kiểm từng task ghi ở task.

---

### T1 — Ba lỗi hàng 64 (luật 38) · phục vụ E2 · independent: true

Files: `packages/core/src/import/{normalize,grid,plan}.ts`, `packages/core/src/import/{normalize,grid,plan}.test.ts`.
- normalize: `Object.hasOwn(opts.valueMap, k)` thay `opts.valueMap[k]`; ô không có trong bảng quy đổi → `needs_person`.
- grid: `haiTang` không nhận hai tầng khi dòng dưới là dữ liệu chỉ vì dòng trên có ô trống; ô tiêu đề trống → «Cột <chữ>».
- plan: `validatePlan` nhận bảng phân loại cột (`classifyColumns`), cột lớp `source` chỉ vào trường lớp `source` hay
  `ignore_with_reason`; cột ghép vào trường lớp `source` không mang `valueMap`.
Kiểm: `npm test -w @quy-hang/core`.

### T2 — Luật quyết dòng · phục vụ E1 · independent: true

Files: `packages/core/src/import/dong.ts` (mới), `dong.test.ts`, `index.ts` (xuất).
- `LY_DO_DONG_NHAP` (hằng chữ lý do), `quyetDongNhap(facts) → {action, reason}` theo bảng thiết kế, `dongDauMoiCan(keys)`
  (dòng đầu của mỗi căn trên cả file).
- Ca ma trận 192 phần tử viết tay; ca tập lý do so danh sách viết tay.
Kiểm: `npm test -w @quy-hang/core`.

### T3 — Xác nhận theo ngày trong file · phục vụ E8 · independent: true

Files: `packages/core/src/listing/{events,fold}.ts`, `listing.test.ts`.
- `owner_confirmed` nhận `confirmedAt` tuỳ chọn (ngày ISO, không sau `occurredAt`); `foldListing` lấy `confirmedAt` khi có.
- Lõi nhập: hằng `MOC_XAC_NHAN_NAM = 2` và `kiemNgayXacNhan(ngay, luc)` ở `packages/core/src/import/dong.ts`.
Kiểm: `npm test -w @quy-hang/core`. Chạm chung tệp với dãy D (G-5): chỉ thêm nhánh, không đổi chữ ký hàm có sẵn.

### T4 — Đầu chủ giữ căn đọc hàng «Chỉ tôi» · phục vụ E11 · independent: true (chờ G-7)

Files: `packages/core/src/visibility/index.ts` (+ test), `packages/api/src/listings/store.ts` (`FACTS_SQL` thêm người giữ căn).
- `VisibilityFacts` thêm `listingAgentUserId?`; `canRead` = người tạo ∨ đầu chủ giữ căn ∨ mức Sàn.
- Mọi chỗ dựng dữ kiện (`factsFromEvents` + truy vấn) mang người giữ căn; ca ma trận 8 phần tử.
Kiểm: `npm test -w @quy-hang/core && npm test -w @quy-hang/api`, ca cũ của trục ai thấy hàng xanh nguyên.

### T5 — Migration 024 và bộ kiểm cách ly · phục vụ E3, E5 · independent: true

Files: `packages/db/migrations/024_lan_nhap.sql` (qua skill `/new-migration`), `packages/db/tests/isolation.test.mjs`.
- `imports`, `import_rows` (`company_id`, enable + force RLS theo `app.current_company_id()`, grant `quy_hang_app`), khoá duy
  nhất `(company_id, import_id, row_number)`, `listing_events.import_id` nullable, khoá ngoài theo sàn.
- Ca cách ly A/B, ca tập cột `import_rows`.
Kiểm: `npm run db:migrate && npm run db:test` (Postgres dãy G, 5573).

### T6 — Tách phần ghi của lead · phục vụ E6 · independent: true

Files: `packages/api/src/leads/store.ts`.
- `createLead` = kiểm vai + `ghiLead(tx, v, intoContact)`; hành vi cũ không đổi (bộ kiểm lead cũ xanh nguyên).
Kiểm: `npm run db:test` (các tệp `leads*.test.ts`).

### T7 — Sự kiện mang lần nhập · phục vụ E4 · independent: false (sau T5)

Files: `packages/api/src/listings/store.ts`.
- `Command.importId?`, `createListing(tx, payload, opts?)` nhận `importId`; `ghiSuKien` ghi cột `import_id`; lệnh có `importId`
  luôn `confirmedWithOwner: false`. Bộ kiểm «một cửa» giữ.
Kiểm: `npm test -w @quy-hang/api && npm run db:test`.

### T8 — API lần nhập · phục vụ E4–E11 · independent: false (sau T1–T7)

Files: `packages/api/src/imports/{store,routes}.ts` (mới), `packages/api/src/errors.ts` (+ `errors.test.ts`), `packages/api/src/app.ts`.
- `POST /api/v1/imports` (vai, kế hoạch qua `validatePlan`, khoá căn cả file), `POST /imports/{id}/rows` (≤ 200, `dryRun`,
  áp lại kế hoạch bằng lõi, dữ kiện kiểm trùng, `quyetDongNhap`, gọi cửa có sẵn, `import_rows` theo khoá), `GET /imports/{id}`.
- Mã lỗi: `import-role-required` 403, `import-batch-too-large` 422, `import-plan-invalid` 422, `import-not-found` 404.
Kiểm: `npm run typecheck && npm test -w @quy-hang/api`.

### T9 — Bài kiểm trên Postgres thật · phục vụ E4–E11 · independent: false (sau T8)

Files: `packages/api/test-db/imports/*.test.ts` (mới) — mỗi eval một tệp, fixture dòng dựng bằng `readTable` +
`planFromDictionary` trên lưới viết tay `[Tên]`, `0900 000 0xx`.
Kiểm: `npm run db:test`.

### T10 — Tài liệu · independent: true

Files: `docs/product/tham-chieu.md` (một dòng §12), `docs/architecture/so-diem-bien-thien.md` (dòng «điều khoá» Hỏi-2 —
xin chạm thêm).
Kiểm: `npm run lint`.

---

Thứ tự: T1, T2, T3, T5, T6 song song được; T4 khi G-7 duyệt; T7 sau T5; T8 sau tất cả; T9 sau T8; T10 bất kỳ lúc nào.
Cuối: `/verify` rồi S4.
