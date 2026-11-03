# Kế hoạch thi công: ghi-thiet-bi-va-mat-mang

Hồ sơ: `_acceptance/ghi-thiet-bi-va-mat-mang/` (Cổng Phạm vi duyệt 03/11, Manh Phan; Hỏi-1, Hỏi-2 theo khuyến nghị).
Thiết kế: `_acceptance/ghi-thiet-bi-va-mat-mang/design.md`. Hạng T3 — kế hoạch này chờ duyệt (Gate 1.5).

Postgres dãy D: `quy-hang-db-dkn-D` cổng 5575 (`DATABASE_URL` trong `.env.local`, giám sát ghi — yêu cầu D-8).

## Task 1 — Cơ sở dữ liệu: migration 028 và bài kiểm (independent: true)

- Files: `packages/db/migrations/028_thiet_bi_va_mat_mang.sql` (mới) · `packages/db/tests/thiet-bi-mat-mang.test.mjs`
  (mới) · `packages/db/tests/isolation.test.mjs` (chỉ thêm một ca).
- Việc: `alter table listing_events add column device text check (device in ('desktop','mobile'))`, `add column
  made_offline boolean not null default false`; bảng `offline_sessions` (cột, check, khoá duy nhất, `enable` + `force
  row level security`, policy đọc theo sàn, policy ghi theo sàn + người, trigger chỉ-thêm và chặn truncate như
  `listing_events`, grant `select, insert` cho `quy_hang_app`).
- Verify: `npm run db:migrate && npm run test:isolation -w @quy-hang/db`.
- Phục vụ: E1, E2.

## Task 2 — Lõi: kiểu sự kiện và hai số đo (independent: true)

- Files: `packages/core/src/listing/events.ts` (hai trường tuỳ chọn của `ListingEvent`) · `packages/core/src/metrics/kieu.ts`
  (`LuotMatMang`, `DauVaoSoDo.matMang?`) · `packages/core/src/metrics/thiet-bi.ts` (mới: `thietBiTheoVai`, `matMangDienThoai`)
  · `packages/core/src/metrics/so-do.ts` (nối hai mã) · `packages/core/src/metrics/danh-sach.ts` (bỏ `thieu` hai mã) ·
  `packages/core/src/metrics/thiet-bi-mat-mang.test.ts` (mới) · `packages/core/src/metrics/so-do.test.ts` (ca «chưa có sự
  kiện» sáu → bốn mã, Hỏi-1) · `_acceptance/so-do-hai-tuan-thu/evals.yaml` (E8 khai `status: not-run` +
  `superseded_by: ghi-thiet-bi-va-mat-mang#AC-9`, Hỏi-1) cùng một dòng sổ `gate2` của hàng 52 nêu Hỏi-1.
- Verify: `npm test -w @quy-hang/core` và `npm run typecheck`.
- Phục vụ: E8, E9.

## Task 3 — API: ghi thiết bị, dấu mất mạng, đường lượt mất mạng (independent: false — sau Task 1, Task 2)

- Files: `packages/api/src/listings/store.ts` (`ghiSuKien` nhận `device`, `madeOffline`; `toEvent`, `loadEvents` đọc hai
  cột) · `packages/api/src/listings/routes.ts` (đọc đầu `x-quy-hang-device`, khoá `madeOffline` của `Command`) ·
  `packages/api/src/sync/routes.ts` (mới: `POST /api/v1/sync/offline-sessions`) · `packages/api/src/app.ts` (đăng ký) ·
  `packages/api/test-db/thiet-bi-mat-mang.test.ts` (mới).
- Verify: `npm test -w @quy-hang/api` và `npm run db:test` (Postgres dãy).
- Phục vụ: E3, E4.

## Task 4 — Bộ đồng bộ trên máy (independent: true — máy chủ giả, không cần Task 3)

- Files (cham-tep D-7): `apps/web/src/lib/sync/thiet-bi.ts` (mới: `thietBi(rong, cao)` theo cạnh ngắn, `thietBiCuaMay()`)
  · `apps/web/src/lib/sync/goi-fetch.ts` (đầu `x-quy-hang-device`) · `apps/web/src/lib/sync/types.ts`
  (`PendingOp.madeOffline?`, `Ngan.offlineSince?`, `Ngan.offlineOutbox?`) · `apps/web/src/lib/sync/ap-tren-may.ts` hay
  `dong-bo.ts` (gắn dấu lúc ghi khi `lastAttempt === "mang"`) · `apps/web/src/lib/sync/gui.ts` (gửi `madeOffline`; lượt
  dừng vì mất mạng thì gắn dấu thao tác chưa gửi được) · `apps/web/src/lib/sync/dong-bo.ts` (mở / khép lượt, hộp gửi) ·
  `apps/web/src/lib/sync/thiet-bi.test.ts`, `apps/web/src/lib/sync/mat-mang.test.ts` (mới) ·
  `apps/web/src/lib/sync/may-chu-gia.test-helpers.ts` (máy chủ giả nhận đường lượt mất mạng, ghi lệnh nhận được).
- Verify: `npm test -w @quy-hang/web` — mọi bài cũ của dong-bo, tu-lanh vẫn ok.
- Phục vụ: E5, E6, E7.

## Task 5 — Bài xuyên lớp (independent: false — sau Task 3, Task 4)

- Files: `apps/web/src/lib/sync/test-db/thiet-bi-mat-mang.db-test.mts` (mới), dùng `ha-tang.mts`.
- Verify: `npm run test:db -w @quy-hang/web`.
- Phục vụ: E10.

## Cuối S3

- Tham chiếu §11 / §12: một dòng sổ quyết định 03/11 (thiết bị theo cạnh ngắn màn hình, lượt mất mạng) — `docs/product/tham-chieu.md`.
- Mỗi phép đo mới kèm lượt phá-thử chiều đỏ (khuôn đo-đời), ghi vào `_acceptance/ghi-thiet-bi-va-mat-mang/pha-thu.md`.
- `npm run typecheck && npm run lint && npm run test:hooks`.

## Thứ tự

Task 1, Task 2, Task 4 song song được (không chung tệp); Task 3 sau Task 1 + Task 2; Task 5 cuối. Làm tuần tự trong vòng
chính nếu cửa song song không lợi (tệp ít, ghép nhanh).
