# Kế hoạch — gõ mã căn ra thuộc tính căn (hàng 9)

Hợp đồng `_acceptance/danh-muc-go-ma-can/contract.md` (duyệt 31/10) · thiết kế
`docs/superpowers/specs/2026-10-31-danh-muc-go-ma-can-design.md`. Hạng T2 — không Cổng 1.5. Bốn việc tuần tự: việc sau
nhập mã của việc trước.

| Người dùng thấy gì khác | Đụng đâu | Phục vụ tiêu chí |
|---|---|---|
| Mã căn gõ kiểu nào cũng ra đúng căn, hoặc được báo rõ vì sao không | `packages/core/src/catalog/` | AC-1…AC-7 (đọc mã, bốn kết cục) |
| Mọi người trong sàn tra được mã qua máy chủ, chỉ nhận thông tin danh mục | `packages/api/src/catalog/`, `app.ts` | AC-8, AC-9 (cổng vào, khoá trả ra) |
| Có số tỉ lệ mã tự điền đúng trên dữ liệu mẫu | `packages/api/src/catalog/do-ti-le.ts` | AC-10 (lệnh đo) |
| Tham chiếu ghi điều đang đúng mới | `docs/product/tham-chieu.md` | luật 6 của đợt |

## Việc 1 — lõi đọc mã (`independent: false`)

- Files: `packages/core/src/catalog/{types,code-rule,lookup,index}.ts`, `packages/core/src/catalog/catalog.test.ts`; một
  dòng `export * from "./catalog";` ở `packages/core/src/index.ts`.
- Nội dung: kiểu danh mục theo cấu trúc (`CatalogData`); `UnitCodeRule` + `UNIT_CODE_RULES` (dòng dự án mẫu);
  `readUnitCode(rule, input)`, `normalizeCode`; `buildCatalogIndex`, `lookupUnit` → `found | not_in_catalog | unreadable
  | ambiguous | unknown_project`; `checkRuleAgainstProject`; `UNIT_ATTRIBUTE_FIELDS` (mười trường, lớp `catalog`).
- Verify: `npm test -w @quy-hang/core` + `npm run typecheck`; phá thử: bỏ bước chữ hoa → ca E2 đỏ nêu chuỗi.
- Phục vụ: E1, E2, E3, E4, E5, E6, E7.

## Việc 2 — đường tra và lệnh đo (`independent: false`, sau việc 1)

- Files: `packages/api/src/catalog/{sample,routes,do-ti-le,index}.ts`, `packages/api/src/catalog/catalog.test.ts`; hai dòng
  ở `packages/api/src/app.ts`; một dòng ở `packages/api/src/app.test.ts`.
- Nội dung: `SAMPLE_CATALOG` (khoá `danhMuc` của gói mẫu); `registerCatalogRoutes(api, deps, catalog = SAMPLE_CATALOG)` —
  `GET /api/v1/catalog/units/{code}?project=`, cổng vào như đường hàng, 404 cho dự án lạ, thân chỉ mang khoá cho phép;
  `measureAutofill(catalog, rules, answers, outside)` + CLI in ba con số.
- Verify: `npm test -w @quy-hang/api` + `npm run typecheck`; phá thử: dòng cách đọc tráo tầng/trục → ca âm E10 đỏ.
- Phục vụ: E8b, E10.

## Việc 3 — bài kiểm qua HTTP trên Postgres dãy D (`independent: false`, sau việc 2)

- Files: `packages/api/test-db/catalog/catalog.test.ts`.
- Nội dung: cổng vào 401/403/409, năm vai, dự án lạ 404, tập khoá trả ra của bốn kết cục với danh mục fixture hai dự án.
- Verify: Postgres `quy-hang-db-D` cổng 5553, `npm run db:migrate && npm run db:test`.
- Phục vụ: E7b, E8, E9.

## Việc 4 — Tham chiếu (`independent: false`)

- Files: `docs/product/tham-chieu.md` — thêm một dòng sổ quyết định 31/10 (chỉ thêm dòng, luật 12).
- Verify: `npm run lint`.
