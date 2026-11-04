# Kế hoạch thi công — hom-nay-truong-nhom (hàng 42)

Hợp đồng `_acceptance/hom-nay-truong-nhom/contract.md` (duyệt 04/11, năm câu theo khuyến nghị: ngoại lệ = lead chưa chia
được; người hai vai thấy bảng điều khiển trên, hàng đợi mình dưới; ba ô giữ cứng; hàng cũ đếm căn toàn sàn trên máy;
lối ReUI `dashboard-6` bỏ biểu đồ). Thiết kế `docs/superpowers/specs/2026-11-04-hom-nay-truong-nhom-design.md`. T2.

## Task 1 — API trưởng nhóm (phục vụ E1, E2, E3, E5) · independent: true

- Files: `packages/api/src/team/{routes.ts,store.ts}`, `packages/api/src/app.ts` (đăng ký), `packages/api/src/app.test.ts`
  (danh sách route ghim), `packages/api/test-db/hom-nay-truong-nhom.test.ts`.
- `GET /api/v1/team/lead-queue` → `{ items: { leadId, kind, buildingName, unitNumber, agentUserId, dueAt }[] }`, chỉ
  `team_lead`, lead đang mở: `unrouted` (outcome new, chưa người, không trả lại), `accept_overdue` (có người, chưa nhận,
  now ≥ routed_at + accept_minutes), `first_call_overdue` (đã nhận, chưa gọi, now ≥ routed_at + first_call_minutes);
  trả lại → không vào. `now` đọc từ đồng hồ cơ sở dữ liệu (`now()`); test đặt mốc bằng cách lùi `routed_at`.
- `GET /api/v1/team/listing-agents` → `{ items: { userId, displayName, onLeave, openLeads }[] }`, chỉ `team_lead`.
- Verify: `npm run typecheck`, `npm test -w @quy-hang/api`, `npm run db:migrate && npm run db:test` (DATABASE_URL dãy D 5575).

## Task 2 — Lõi hàng cũ theo người (phục vụ E4) · independent: true

- Files: `packages/core/src/today/hang-cu.ts`, `hang-cu.test.ts`, xuất ở `today/index.ts`.
- `hangCuTheoNguoi(can, homNay, cauHinh?)` → dòng `{ userId|null, mo, canGoiLai, tiLeTuoi }`, căn Closed/Withdrawn bỏ,
  `freshness` của lõi với cấu hình (hàng 81); `tongCanGoiLai(dong)`.
- Verify: `npm test -w @quy-hang/core`, `npm run typecheck`.

## Task 3 — Màn thật và khuôn (phục vụ E6–E11) · independent: false (đứng sau 1, 2)

- Files: `apps/web/src/app/(app)/today/{page.tsx,truong-nhom.tsx,truong-nhom-trang-thai.ts,truong-nhom.test.ts,
  nguon.ts}`, `apps/web/src/components/khoi/dashboard-6/*` (đã chuyển thể ở S1), `design/patterns/hom-nay-truong-nhom.md`,
  `design/patterns/hom-nay-dau-chu.md` (gỡ `ngoai_le_han` hẹn hàng này), `.agents/skills/quy-hang-ui/catalog.md` (dòng
  dashboard-6), gỡ `proto/hom-nay-truong-nhom` (luật đợt 45) và dòng của nó ở `trang-tam.md`.
- Verify: `npm run typecheck`, `npm run lint`, `npm test -w @quy-hang/web`.
