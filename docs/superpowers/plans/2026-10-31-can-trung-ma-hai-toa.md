# Kế hoạch: can-trung-ma-hai-toa

Hợp đồng: `_acceptance/can-trung-ma-hai-toa/contract.md` (đã duyệt) · thiết kế:
`docs/superpowers/specs/2026-10-31-can-trung-ma-hai-toa-design.md`.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Mã có ở hai toà ra «nhiều căn», không bị điền căn toà kia | `packages/core/src/catalog/lookup.ts` | AC-1, AC-2 (liệt đủ căn trùng) |
| Mã kèm toà ra đúng một căn; toà lạ báo riêng | `packages/core/src/catalog/lookup.ts` | AC-3 (chọn toà), AC-4 (toà lạ) |
| Màn hỏi được «mã này, toà này» qua đường tra | `packages/api/src/catalog/routes.ts` | AC-5 (đường tra) |
| Tỉ lệ tự điền tách riêng mã «nhiều căn» | `packages/api/src/catalog/do-ti-le.ts` | AC-6 (lệnh đo) |

## Task 1 — Lõi: chỉ mục nhiều căn, chọn toà, toà lạ

- Files: `packages/core/src/catalog/lookup.ts`, `packages/core/src/catalog/catalog.test.ts` (chỉ thêm ca mới).
- Làm: `units: Map<string, UnitAttributes[]>`; `lookupUnit(index, input, projectKey?, building?)`; kết cục
  `unknown_building`; ứng viên sắp theo projectKey rồi buildingName; dự án không cách đọc có chọn toà mà không khớp →
  `not_in_catalog`.
- Ca kiểm: E1 «trùng mã hai toà một dự án: ambiguous, không found», E2 «dự án có cách đọc mà danh mục ghi trùng mã ở hai
  toà: ambiguous», E3 «mã kèm toà ra đúng một căn», E4 «toà lạ: kết cục riêng, không thuộc tính»; mỗi ca có lượt phá thử
  (tạm đổi chỉ mục về đè / bỏ lọc toà → ca đỏ đúng thông điệp) rồi hoàn lại.
- Verify: `npm test -w @quy-hang/core` và `npm run typecheck`.
- Phục vụ: E1, E2, E3, E4, E7. `independent: false` (task 2, 3 dùng chữ ký mới).

## Task 2 — Đường API nhận `?building=`

- Files: `packages/api/src/catalog/routes.ts`, `packages/api/test-db/catalog/trung-ma-hai-toa.test.ts` (tệp mới, D-1).
- Làm: query `building` tuỳ chọn trong schema; `unknown_building` → 404 `not-found`.
- Ca kiểm: «trùng mã hai toà qua API: ambiguous, chọn toà ra found», «toà lạ qua API: 404 not-found», «thân trả về khi
  trùng mã chỉ mang khoá cho phép» (cùng tham số `building` trong OpenAPI). Phá thử: bỏ chuyển `building` → ca đỏ.
- Verify: `npm run db:migrate && npm run db:test` trên Postgres dãy D (5565).
- Phục vụ: E5, E8, E9. `independent: false`.

## Task 3 — Lệnh đo đếm «nhiều căn»

- Files: `packages/api/src/catalog/do-ti-le.ts`, `packages/api/src/catalog/catalog.test.ts` (chỉ thêm ca mới).
- Làm: `nhieuCan` trong kết quả; `ambiguous` là hụt, không là điền đoán; dòng thêm « · nhiều căn N» khi N > 0.
- Ca kiểm: «đo tỉ lệ: mã trùng hai toà là nhiều căn, không là điền đoán» + đối chứng bỏ toà A2. Phá thử: đếm ambiguous
  là điền đoán → ca đỏ.
- Verify: `npm test -w @quy-hang/api`.
- Phục vụ: E6. `independent: false`.

## Task 4 — Tham chiếu

- Files: `docs/product/tham-chieu.md` — thêm một dòng §12 (D-1).
- Verify: đọc lại; `npm run lint`.
