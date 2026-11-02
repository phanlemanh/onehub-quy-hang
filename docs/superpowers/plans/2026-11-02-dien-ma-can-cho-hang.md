# Kế hoạch thi công — dien-ma-can-cho-hang

02/11/2026 · dãy G · hạng T3 · hợp đồng `_acceptance/dien-ma-can-cho-hang/contract.md` (duyệt 02/11, Manh Phan) · thiết
kế `docs/superpowers/specs/2026-11-02-dien-ma-can-cho-hang-design.md` · bản bấm được
`apps/web/src/app/(app)/inventory/ban-mau-dien-ma-can/` (gỡ ở T7).

Thứ tự: T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8. Chạy tuần tự trong phiên chính: các việc nối nhau qua loại sự kiện mới
(lõi → cơ sở dữ liệu → máy chủ → hàng đợi trên máy → màn), không đủ hai việc độc lập để tách song song.

## T1 — Lõi: sự kiện «gắn mã căn»

- Tệp: `packages/core/src/listing/events.ts` (thêm `unit_number_assigned` vào `EVENT_TYPES`, khuôn `{ unitNumber: [true,
  chu] }`, `confirmsWithOwner` trả `false`), `fold.ts` (`stepListing` đặt `unitNumber`), tệp mới
  `packages/core/src/listing/gan-ma-can.ts` (`kiemGanMaCan(state)` → `null` hoặc mã `unit-number-already-set`), dòng thêm
  vào `index.ts` (chỉ thêm, không đụng dòng của D), test mới `gan-ma-can.test.ts`.
- Ca viết trước: ma trận sáu ca khuôn của E1 (đếm và assert số); gấp hàng chưa mã → `A-12.05`; hàng đã có mã → mã lỗi;
  đối chứng cùng fixture. E4: `missingFor('Active')` trước/sau gắn mã (lõi đã làm khi `unitNumber` có giá trị — test ghim).
- Kiểm: `npm test -w @quy-hang/core` · cặp phá-thử: bỏ dòng gấp `unitNumber` trong bản sao → ca gấp đỏ, ghim tên ca.
- Phục vụ E1, E4 · `independent: false`.

## T2 — Cơ sở dữ liệu: migration 020

- Tệp: `packages/db/migrations/020_su_kien_gan_ma_can.sql` qua skill `/new-migration` — bỏ ràng buộc loại sự kiện của
  `listing_events` (004) rồi đặt lại với thêm `unit_number_assigned`, cùng tên ràng buộc. Không bảng mới, không cột mới;
  luật cách ly không đổi.
- Test: `packages/api/test-db/dien-ma-can.test.ts` ca «loại sự kiện gắn mã căn» — chèn loại mới qua; `lam-bay` bị từ chối,
  ghim tên ràng buộc.
- Kiểm: `npm run db:migrate && npm run db:test` trên Postgres dãy G (5564) · bộ kiểm cách ly xanh.
- Phục vụ E2 · `independent: false` (T3 cần).

## T3 — Máy chủ: kiểm khi gắn mã

- Tệp: `packages/api/src/errors.ts` (+ `unitNumberAlreadySet`, `unitAlreadyListed`, mã 422) và `errors.test.ts`;
  `packages/api/src/listings/store.ts` — trong `applyCommand`, loại `unit_number_assigned`: lõi từ chối hàng đã có mã;
  rồi tìm hàng khác của sàn cùng toà, `app.unit_key(unit_number) = app.unit_key($mã)`, trạng thái thuộc `OPEN_STATUSES`
  của lõi, `id <> $hàng` → từ chối kèm `reason` và mã hàng kia (`conflictListingId`). Luật cách ly giữ phép tìm trong sàn.
  `routes.ts`: khai 422 trong OpenAPI, trả thêm `conflictListingId` khi có.
- Test: `dien-ma-can.test.ts` ca «API gắn mã căn» — ma trận dựng từ chính `OPEN_STATUSES` và `STANDARD_STATUSES` của lõi:
  hàng chưa mã nhận; đã mã → 422; cùng căn ở mỗi trạng thái mở → 422 kèm id (mã khác hoa thường, dấu gạch); mỗi trạng
  thái đóng → nhận; sàn khác → nhận; người không thuộc sàn → 403; assert tổng số ca.
- Kiểm: `npm run db:test` · `npm test -w @quy-hang/api`.
- Phục vụ E3 · `independent: false`.

## T4 — Hàng đợi trên máy: lệnh gắn mã và đường từ chối

- Tệp: `apps/web/src/lib/sync/ap-tren-may.ts` (áp lệnh mới bằng `stepListing` + `kiemGanMaCan` của lõi; không chép luật),
  `gui.ts` chỉ khi cần (422 đã rơi vào «Cần xem» kèm `reason`), test DB mới
  `apps/web/src/lib/sync/test-db/gan-ma-can.db-test.mts`.
- Ca viết trước (E6b, API thật): nhận → hàng trên máy mang mã, hàng đợi rỗng; 422 trùng căn gửi sau khi có mạng lại →
  hàng trên máy về chưa mã, lệnh vào «Cần xem» với lý do máy chủ; 422 đã có mã → cùng đường.
- Kiểm: `npm test -w @quy-hang/web` + lệnh `test.web_db` của cấu hình.
- Phục vụ E6, E6b · `independent: false`.

## T5 — Hồ sơ của hàng chưa có mã

- Tệp: `apps/web/src/app/(app)/units/ho-so/ho-so.ts` (`docCot` đọc `?hang=<id>`; tìm hàng theo id trên kho trên máy;
  dựng lệnh từ ô: cắt khoảng trắng, rỗng → «Gõ mã căn», hàng đã có mã → không dựng), tệp mới `o-ma-can.tsx` (Field +
  Input + Button như bản bấm được: dấu «Chưa có», gợi ý mã của toà từ danh mục đã giữ, Enter lưu, Esc xoá, lỗi tại ô đọc
  từ mục «Cần xem» của hàng), `cot-ho-so.tsx` (nhánh hàng chưa mã: đầu cột «Chưa có mã căn», mục Ảnh báo cần mã, mục
  Thuộc tính căn chứa ô), `bang-co-ho-so.tsx` + `ho-so-toan-man.tsx` (máy chủ nhận → địa chỉ sang `?unit=&toa=&lan=`).
  Test `ho-so.test.ts` thêm ca E5, E6.
- Kiểm: `npm test -w @quy-hang/web` · `npm run lint` (mức nợ 0/0, kiểm chuẩn đạt) · sàn thiết kế.
- Phục vụ E5, E6, E6u, E8u, E10, E11 · `independent: false`.

## T6 — Ba lối vào

- Tệp: `bang-co-ho-so.tsx` (`moCan`: hàng chưa mã → `?hang=<id>`, hàng có mã như cũ), `ho-so.ts` (`moCot` theo hàng),
  `apps/web/src/app/(app)/today/hom-nay-dau-chu.tsx` (dòng «Chưa có mã căn · <toà>» trỏ `/inventory?hang=<id>`, nút không
  còn tắt), `apps/web/src/app/(app)/units/ready/nut-san-sang.tsx` + `san-sang.ts` («Mã căn» trong «Còn thiếu» đưa con trỏ
  tới ô). Test hai chiều cho từng lối (E7).
- Kiểm: `npm test -w @quy-hang/web`.
- Phục vụ E7, E7u · `independent: false` (đụng chung tệp với T5).

## T7 — Tài liệu và dọn bản bấm được

- Tệp: `docs/adr/0026-gan-ma-can.md` (loại sự kiện mới; vì sao không mở `details_changed`; chặn trùng hàng đang mở),
  `docs/product/tham-chieu.md` (cách gắn mã một lần ở hồ sơ căn; luật chặn trùng), gỡ
  `apps/web/src/app/(app)/inventory/ban-mau-dien-ma-can/`; vẽ lại bản đồ sản phẩm và lộ trình.
- Kiểm: `npm run lint` · `product-map.mjs --check`.
- Phục vụ E9 · `independent: false`.

## T8 — Kiểm cả kho rồi vào S4

- `npm run typecheck && npm run lint && npm test && npm run test:hooks && npm run build`; `npm run db:migrate && npm run
  db:test` trên Postgres dãy G; xin lượt `s4` rồi chấm.
