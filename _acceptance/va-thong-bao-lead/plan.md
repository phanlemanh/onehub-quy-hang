# Vá Thông báo lead — kế hoạch

Bốn việc nối nhau (lõi → máy chủ → web → bài trên Postgres); không việc nào độc lập để chạy song song.

## Việc 1 — lõi: danh sách dịch vụ đẩy, thời hạn (phục vụ E1) · independent: false
- Tệp: `packages/core/src/push/index.ts`, `push.test.ts`. Ma trận AC-1 viết trước (đỏ vì chưa có hàm) → `laDichVuDay`,
  `PUSH_SERVICE_HOSTS`, `PUSH_CLAIM_HOLD_MS`, `PUSH_SEND`. Kiểm: `npm test -w @quy-hang/core`; phá thử hàm chỉ xét «https».

## Việc 2 — máy chủ: khuôn địa chỉ, gửi có hạn (phục vụ E2, E3) · independent: false
- Tệp: `packages/api/src/push/{gui,routes}.ts`, `packages/api/src/jobs/lead-tick.ts`, `gui.test.ts` (đồng hồ giả).
  `guiCacDong` + hạn chót trong `guiHopThu`, `guiSauKhiGhi` (8 giây), `runLeadTick` (40 giây, tham số tuỳ chọn), `timeout`
  cho `web-push`. Kiểm: `npm test -w @quy-hang/api`; phá thử bỏ hạn chót, bỏ xét địa chỉ, bỏ chạy đua (ca treo có hạn 2 s).

## Việc 3 — web: trạng thái lưu hỏng (phục vụ E7, E8) · independent: false
- Tệp: `apps/web/src/lib/push/dang-ky.ts`, `dang-ky.test.ts`, `apps/web/src/app/(app)/today/dai-bat.tsx`. Kiểm:
  `npm test -w @quy-hang/web`; phá thử phân loại bỏ `daLuu`; bản dev dãy B ba ô.

## Việc 4 — Postgres dãy B (phục vụ E4, E5, E6, E9, E14, E15)
- Tệp: `packages/api/test-db/va-thong-bao-lead.test.ts`; bộ hàng 26 đổi địa chỉ thử sang fcm. Kiểm: `npm run db:migrate`
  rồi hai tệp test-db; phá thử bỏ hạn lối giao (ca AC-6 đỏ ở 15 s).
