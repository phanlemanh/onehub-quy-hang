# Kế hoạch thi công — va-ma-can-lead

03/11/2026 · dãy G · hồ sơ `_acceptance/va-ma-can-lead/` (Cổng Phạm vi duyệt 03/11). Thiết kế:
`docs/superpowers/specs/2026-11-02-va-ma-can-lead-design.md`. Ba task phụ thuộc nhau — làm tuần tự, TDD.

## Task 1 — Lõi: ô nhận lead theo luật mã căn (E1, AC-1)

- Test trước: `packages/core/src/dedupe/dedupe.test.ts` thêm ca «lead: mã căn phải có chữ hay số» — ma trận 10 mã
  (3 hợp lệ, 7 toàn dấu), đếm ca = 10, đối chứng lead không mã, quan hệ `validateLeadInput.ok === (kiemMaCan === null)` trên
  ma trận cộng 'Ａ1', '1⁄2', '٣'. Chạy: đỏ ở 7 mã toàn dấu.
- Code: `packages/core/src/dedupe/index.ts` — `unitNumber` qua `chu` mà `kiemMaCan` báo → lỗi `unitNumber` mang
  `LY_DO_MA_CAN_KHONG_CHU_SO`. Nhập `kiemMaCan` từ `../listing/gan-ma-can`.
- Xanh: `npm test -w @quy-hang/core`.

## Task 2 — API: hai đường dựng lại bỏ mã rác (E3, E4; AC-3, AC-4)

- Code: `packages/api/src/leads/store.ts` — `createListingFromLead` và `resubmitLead` chỉ mang `unitNumber` khi
  `kiemMaCan(unit_number) === null`. Bản ghi lead cũ không đổi.

## Task 3 — Bài kiểm Postgres (E2, E3, E4)

- `packages/api/test-db/va-ma-can-lead.test.ts`: nhập «---» → 400 không ghi, «A-12.05» → 201; lead mã rác (đổi cột bằng
  kết nối chủ, SELECT xác nhận `app.unit_key IS NULL`) → tạo hàng 201 chưa mã, gắn mã sau 200; trả lại rồi gửi lại → 201
  lead mới không mã. Đối chứng dương cùng đường.
- Xanh: `npm run db:migrate && npm run db:test` trên Postgres dãy G (cổng 5564).

## Kiểm cuối

`npm run typecheck && npm run lint && npm test` rồi S4.
