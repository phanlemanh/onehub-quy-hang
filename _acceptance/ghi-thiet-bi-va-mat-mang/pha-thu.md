# Phá-thử chiều đỏ — ghi-thiet-bi-va-mat-mang

Mỗi phép đo mới kèm một lượt phá: sửa tạm đúng chỗ phép đo canh, chạy lại, ca phải đỏ đúng thông điệp; rồi hoàn lại.

## Task 1 — migration 028 và bài kiểm (E1, E2)

Postgres của dãy (container `quy-hang-db-dkn-D`, cổng 5575). Mỗi lượt: gỡ 028 bằng vai chủ (`drop table
offline_sessions`, hai hàm trigger, hai cột của `listing_events`, dòng 028 trong `schema_migrations`), sửa tạm
`packages/db/migrations/028_thiet_bi_va_mat_mang.sql`, rồi `npm run db:migrate && npm run test:isolation -w @quy-hang/db`.
Bản gốc giữ ở scratchpad, chép đè lại sau mỗi lượt.

| Lượt | Chỗ phá | Ca đỏ | Thông điệp |
|---|---|---|---|
| E1 | `add column device text` (bỏ `check (device in ('desktop','mobile'))`) | «028: cột thiết bị và dấu mất mạng của sự kiện» — pass 93, fail 1 | `device 'tablet' được nhận — thiếu ràng buộc check của device` |
| E2-b | policy insert chỉ còn `company_id = app.current_company_id()` (bỏ vế `user_id`) | «offline_sessions: sàn khác không đọc, không ghi hộ» — pass 93, fail 1 | `ghi hộ «user_id người khác» được nhận — user_id người khác được ghi` |
| E2-c | policy insert `with check (true)` | cùng ca — pass 93, fail 1 | `ghi hộ «company_id của sàn B» được nhận — company_id của sàn B được ghi` |
| E2-a | bỏ hẳn policy insert | cùng ca — pass 93, fail 1 | đối chứng dương đỏ: `new row violates row-level security policy for table "offline_sessions"` (42501) khi ghi lượt của chính mình |

Ghi chú E2-a: bảng ép luật theo dòng mà không có policy insert thì mọi lần ghi bị chặn — ghi hộ vẫn bị từ chối, nên chỗ
đỏ là đối chứng dương, không phải dòng ghi hộ. Thông điệp «user_id người khác được ghi» mà E2 nêu ra ở lượt E2-b (policy
nới, không phải mất).

Hoàn lại: chép bản gốc, gỡ 028, migrate lại — `tests 94 · pass 94 · fail 0`.

## Task 2

Lõi số đo, `packages/core/src/metrics/thiet-bi.ts`; chạy `node --import tsx --test packages/core/src/metrics/thiet-bi-mat-mang.test.ts`
(03/11). Sửa tạm từng chỗ, chạy, chép lại bản gốc.

- (a) E8 — mẫu gồm cả sự kiện không rõ thiết bị (`mau++` trước nhánh `khong-ro`): ca «thiết bị theo vai: đếm từng ô,
  không rõ để riêng» đỏ, `actual: [ 3, 6 ]` · `expected: [ 3, 5 ]` — mẫu 6.
- (b) E9 — lọc kỳ lượt mất mạng thành `startedAt <= den`: ca «mất mạng điện thoại: lượt trong kỳ và thao tác lúc mất mạng»
  đỏ, `actual: 3` · `expected: 2` — so 3 (lượt bắt đầu đúng `den` lọt vào).

Hoàn lại: `cmp` khớp bản gốc; tệp thử `pass 3 · fail 0`; `npm test -w @quy-hang/core` `tests 365 · pass 365 · fail 0`.

## Task 3 (vòng chính)

Lệnh: `node --env-file-if-exists=../../.env.local --import tsx --test test-db/thiet-bi-mat-mang.test.ts` trong `packages/api`, Postgres dãy D.

| Phá | Kết quả |
|---|---|
| Bỏ đọc đầu `x-quy-hang-device` ở đường `POST /listings/:id/events` | ca «thiết bị: đầu yêu cầu ghi vào sự kiện» đỏ — «POST /listings/:id/events với đầu mobile: cột device null, mong mobile» |
| Bỏ `on conflict do nothing` của đường lượt mất mạng | ca «lượt mất mạng: ghi một lần, gửi lại không trùng» đỏ — «gửi lại trả 200» (lần gửi lại vỡ khoá duy nhất) |
| Hoàn lại cả hai | 4/4 ca xanh |

## Task 4 — bộ đồng bộ trên máy (E5, E6, E7)

Chạy 03/11/2026 trên worktree `angry-antonelli-286357`. Mỗi lần: sửa tạm một chỗ, chạy bài, chép lại tệp gốc. Sau khi
hoàn lại: `npm test -w @quy-hang/web` 380/380 ok.

| # | Sửa tạm | Bài chạy | Kết quả |
|---|---|---|---|
| 1 | `thiet-bi.ts`: mốc `<` thành `<=` 768 | `thiet-bi.test.ts` | đỏ — «thiết bị: cạnh ngắn màn hình, mốc 768»: `768×1024 phải ra desktop` |
| 2 | `thiet-bi.ts`: đo cạnh rộng (`rong < 768`) thay cạnh ngắn | `thiet-bi.test.ts` | đỏ — cùng ca: `844×390 phải ra mobile` |
| 3 | bỏ vế (b): `gui.ts` và `dong-bo.ts` không gắn dấu khi lượt gửi dừng vì mất mạng | `mat-mang.test.ts` | đỏ — «mất mạng: máy vừa rớt mạng»: lệnh của Z thiếu khoá madeOffline (thân `{"type":"details_changed",…,"expectedVersion":1}`); 4 ca khác ok |
| 4 | `dong-bo.ts`: mở lượt ở mọi lượt thử mất mạng (không xét `offlineSince`) | `mat-mang.test.ts` | đỏ — «lượt mất mạng: mở một lần…»: `lượt phải mở ở t1, không ở t2 (2026-10-31T03:00:30.000Z)`; ca «tải lại trang giữa lượt» cũng đỏ |
| 5 | `dong-bo.ts`: mở lượt với `ops` = độ dài hàng đợi (đếm cả thao tác có từ trước) | `mat-mang.test.ts` | đỏ — «lượt mất mạng: mở một lần…»: `queuedOps phải là 2 (không đếm thao tác có từ trước), nhận 3` |

## Task 5 (vòng chính)

| Phá | Kết quả |
|---|---|
| Bỏ đầu `x-quy-hang-device` khỏi hàm gọi thử của bài | ca «điện thoại mất mạng: sự kiện và lượt về cơ sở dữ liệu» đỏ — «sự kiện mới: …"device":null…» |
| Hoàn lại | 1/1 xanh |
