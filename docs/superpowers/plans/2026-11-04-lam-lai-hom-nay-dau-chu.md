# Kế hoạch thi công — lam-lai-hom-nay-dau-chu (hàng 92)

Hợp đồng `_acceptance/lam-lai-hom-nay-dau-chu/contract.md` (Cổng Phạm vi làn máy 04/11). T2, chỉ giao diện.

## Task 1 — Hàm thuần mốc hạn và bảng nút (phục vụ E2, E3) · independent: true
- Files: `apps/web/src/app/(app)/today/viec-dong.ts`, `viec-dong.test.ts`.
- `mucHan(hanIso, bayGio)` → `qua` · `sap` (< 15 phút) · `thuong` · `khong`; `nutCuaViec(v)` → `{ chinh, phu[] }` theo bảng AC-3.
- Verify: `npm test -w @quy-hang/web`.

## Task 2 — Chuyển thể solution-agents-2 và dựng lại lưới (phục vụ E1, E4, E5, E6, E9) · independent: false
- Files: `apps/web/src/components/khoi/solution-agents-2/**`, `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx`.
- Verify: `npm run typecheck`, `npm run lint`, `npm test -w @quy-hang/web`.

## Task 3 — Dọn khuôn (phục vụ E7a, E7b, E8) · independent: false
- Files: gỡ `apps/web/src/app/(app)/proto/hom-nay-dau-chu/`; `design/patterns/{hom-nay-dau-chu,trang-tam}.md`;
  `.agents/skills/quy-hang-ui/catalog.md`; `docs/design/vo-va-ia.md`; `packages/ui-lint/tests/**` (đếm lại từ cây, luật 51).
- Verify: `npm test -w @quy-hang/ui-lint`, lệnh khuôn.

## Task 4 — Chỗ thử và phép nhìn màn (phục vụ E1, E4, E5, E6, E9) · independent: false
- Files: `_acceptance/lam-lai-hom-nay-dau-chu/thu/{dung-d.mjs,chay-ui.mjs}` theo khuôn hàng 51.
