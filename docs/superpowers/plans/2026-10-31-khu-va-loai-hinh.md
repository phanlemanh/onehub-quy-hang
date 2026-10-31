# Kế hoạch: khu-va-loai-hinh

Hợp đồng: `_acceptance/khu-va-loai-hinh/contract.md` (duyệt 31/10, Hỏi-1..3 theo khuyến nghị) · thiết kế:
`docs/superpowers/specs/2026-10-31-khu-va-loai-hinh-design.md`. Bốn việc, tuần tự (việc sau dùng tên việc trước đặt).

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Phần gõ mã căn gọi khu theo RESO, căn biết loại hình, căn sai loại bị chặn | `packages/core/src/catalog/*` | AC-1, AC-5, AC-6, AC-7 (tên mới, loại hình, bảng, chặn) |
| 180 căn mẫu mang loại hình căn hộ, sinh lại y hệt | `packages/db/seed/*` | AC-4 (dữ liệu mẫu) |
| Đường tra nhận `?subdivision=`, từ chối `?project=`; tỉ lệ tự điền không đổi | `packages/api/src/catalog/*`, `packages/api/test-db/catalog/*` | AC-2, AC-3, AC-5 (đường tra, hồi quy) |
| Tài liệu và màn Người dùng gọi «Khu», «Vùng phụ trách» | `CONTEXT.md`, Tham chiếu, ADR-0016, màn Người dùng | AC-8, AC-9 (tài liệu, nhãn) |

## Task 1 — Lõi tra: tên khu, loại hình, bảng trường, chặn sai loại

- Files: `types.ts`, `code-rule.ts`, `lookup.ts`, `index.ts` (nếu cần xuất thêm), tệp mới `property-type.ts` và
  `khu-va-loai-hinh.test.ts`; đổi khoá trong thân ca của `catalog.test.ts`, `trung-ma-hai-toa.test.ts` (giữ tên ca).
- Làm: `CatalogSubdivisionData`, `subdivisions`, `subdivisionKey/subdivisionName`, `unknown_subdivision`;
  `propertyType`/`propertySubType` ở căn và kết quả tra (12 trường); `PROPERTY_SUBTYPE_FIELDS`; `unitFieldErrors`,
  `catalogFieldErrors`; `buildCatalogIndex` ném lỗi khi danh mục có căn sai loại.
- Ca mới: E1 (quét tên cũ, chạy được khi Task 4 xong), E6, E7, E8, E9 — mỗi ca một lượt phá thử rồi hoàn lại.
- Verify: `npm test -w @quy-hang/core`, `npm run typecheck` (lỗi kiểu ở API, seed là việc của Task 2–3). independent: false.

## Task 2 — Dữ liệu mẫu

- Files: `packages/db/seed/du-lieu-mau.mjs`, `mau-file.mjs`, `mau/du-lieu-mau.json` (sinh lại), tệp kiểm seed nếu đọc
  `projects`.
- Làm: `subdivisions`, `subdivisionKey`, `subdivisionName`; mỗi căn `Residential/Condominium`; sinh lại tất định.
- Verify: `npm run db:migrate && node --test "packages/db/seed/*.test.mjs"` trên Postgres dãy D. independent: false.

## Task 3 — Đường tra, lệnh đo, ca kiểm Postgres

- Files: `packages/api/src/catalog/routes.ts`, `do-ti-le.ts`, `catalog.test.ts`, `trung-ma-hai-toa.test.ts`;
  `packages/api/test-db/catalog/catalog.test.ts`, `trung-ma-hai-toa.test.ts`.
- Làm: query `.strict()` với `subdivision`, `building`; `unknown_subdivision` → 404; lệnh đo đọc `subdivisions`; ca mới
  «danh mục: tham số project cũ bị từ chối 400» và «loại hình: thân found qua API mang đúng mười hai khoá viết trước».
- Verify: `npm test -w @quy-hang/api`, `npm run db:test`. independent: false.

## Task 4 — Tài liệu và nhãn

- Files: `CONTEXT.md` (dòng «Căn», «Khu», «Khu phụ trách», thêm «Loại hình»), `docs/product/tham-chieu.md` (§4, §9, các
  chỗ gọi khu chứa căn, một dòng §12), `docs/adr/0016-moi-loai-hinh.md` (trạng thái, Hỏi-1..3), màn
  `apps/web/src/app/settings/users/quan-nguoi.tsx` («Khu phụ trách» → «Vùng phụ trách»).
- Verify: E1 xanh; `npm run lint`, `npm run typecheck`. independent: false.
