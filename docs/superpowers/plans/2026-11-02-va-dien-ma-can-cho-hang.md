# Kế hoạch thi công — va-dien-ma-can-cho-hang

02/11/2026 · dãy G · hạng T2 · hợp đồng `_acceptance/va-dien-ma-can-cho-hang/contract.md` (duyệt 02/11, Manh Phan) · thiết
kế `docs/superpowers/specs/2026-11-02-va-dien-ma-can-cho-hang-design.md`.

Thứ tự: T1 → T2 → T3, tuần tự trong phiên chính — T2 và T3 đọc hàm của T1.

## T1 — Lõi: luật «mã căn có chữ hay số»

- Tệp: `packages/core/src/listing/gan-ma-can.ts` (`kiemMaCan(chu)` → `null` hoặc `LY_DO_MA_CAN_KHONG_CHU_SO`; tập ký tự
  `[0-9A-Za-z]` như `app.unit_key`), `events.ts` (kiểm `maCan` = `chu` rồi `kiemMaCan`, dùng cho `created.unitNumber` và
  `unit_number_assigned.unitNumber`), test `gan-ma-can.test.ts`.
- Ca viết trước: ma trận 2 khuôn × 10 mã (3 hợp lệ, 7 toàn dấu) — đúng một lỗi ở `unitNumber` mang câu báo; assert số ca;
  `kiemMaCan` hai chiều cùng bảng.
- Kiểm: `npm test -w @quy-hang/core`.
- Phục vụ E1 · `independent: false`.

## T2 — Máy chủ: ca kiểm trên Postgres dãy

- Tệp: `packages/api/test-db/dien-ma-can.test.ts` — ca «gắn mã toàn dấu bị từ chối, không khoá hàng», «tạo hàng mã toàn
  dấu bị từ chối», «luật lõi khớp app.unit_key». Máy chủ không đổi mã: lệnh đã qua `validatePayload`.
- Kiểm: `npm run db:test` trên Postgres 5564.
- Phục vụ E2 · `independent: false`.

## T3 — Web: ô Mã căn báo tại chỗ

- Tệp: `apps/web/src/app/(app)/units/ho-so/ho-so.ts` (`dungLenhGanMa` gọi `kiemMaCan` sau khi cắt khoảng trắng),
  `ho-so.test.ts` ca «lệnh gắn mã căn» thêm mã toàn dấu.
- Kiểm: `npm test -w @quy-hang/web`; xem bằng mắt ở S4 (E3u).
- Phục vụ E3, E3u · `independent: false`.
