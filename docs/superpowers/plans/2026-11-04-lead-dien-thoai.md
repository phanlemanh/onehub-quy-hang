# Kế hoạch thi công — lead-dien-thoai (hàng 51)

Hợp đồng `_acceptance/lead-dien-thoai/contract.md` (Cổng Phạm vi làn máy 04/11, cửa veto mở). Thiết kế
`docs/superpowers/specs/2026-11-04-lead-dien-thoai-design.md`. T2, chỉ giao diện.

## Task 1 — Ô nhận lead vào bố cục Đọc, tab Lead hai phần (phục vụ E1, E2, E3, E5, E9) · independent: false

- Files: `apps/web/src/app/(app)/leads/new/{page.tsx,khung.tsx,o-lead.tsx,tab-lead.tsx}`.
- `BoCuc kieu="doc"`; điện thoại (`md:hidden`) có thanh chọn «Nhập lead» · «Lead đã nhập» (phần sau dùng lại
  `LeadDaNhapThat` trong `KhungLeadCuaToi`); máy tính giữ một khung. Ô giá `inputMode="numeric"`; mất mạng lúc gửi báo
  «Chưa gửi được — mất mạng», năm mục giữ; dưới kết quả có lối «Xem ở Lead đã nhập».
- Verify: `npm run typecheck`, `npm run lint`, `npm test -w @quy-hang/web`.

## Task 2 — Lead đã nhập vào bố cục Danh sách – chi tiết (phục vụ E4, E6, E8) · independent: false

- Files: `apps/web/src/app/(app)/leads/mine/{page.tsx,khung.tsx}`.
- Verify: như Task 1.

## Task 3 — Dọn khuôn và chỗ hở (phục vụ E7a, E7b) · independent: false

- Files: gỡ `apps/web/src/app/(app)/proto/o-nhan-lead/`; `design/patterns/{o-nhan-lead,lead-cua-toi,trang-tam}.md`;
  `docs/design/vo-va-ia.md` §3; `packages/ui-lint/tests/kiem-chuan.test.mjs`; `.agents/skills/quy-hang-ui/catalog.md` nếu
  có dòng trang mẫu.
- Verify: `npm run lint`, `npm test -w @quy-hang/ui-lint`, lệnh khuôn.

## Task 4 — Chỗ thử và phép nhìn màn (phục vụ E1–E6, E8, E9) · independent: false

- Files: `_acceptance/lead-dien-thoai/thu/{dung-d.mjs,chay-ui.mjs}` theo khuôn hàng 42.
- Verify: chạy dựng + `chay-ui.mjs --e1` một lượt trên chỗ thử dãy D.
