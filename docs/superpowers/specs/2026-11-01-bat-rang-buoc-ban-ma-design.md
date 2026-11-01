# Bật hẳn ràng buộc bản mã khi deploy — thiết kế

Hàng `bat-rang-buoc-ban-ma` (dãy G, đợt dau-chu-dong-vao). Nối tiếp hàng 62 (`ma-hoa-so-chu`, ADR-0013).

## 1. Vấn đề

Migration 008 và 009 thêm hai ràng buộc `listing_owners_phone_chi_ban_ma` và `leads_phone_chi_ban_ma`
(`check (owner_phone is null)`) ở trạng thái `NOT VALID`. Ràng buộc ở trạng thái này đã chặn mọi lần chèn hay sửa dòng,
nhưng Postgres chưa xác nhận dòng cũ. Chỉ lệnh mã hoá lại (`packages/api/van-hanh/ma-hoa-lai.ts`) mới `validate`.

Trên bản thật (01/11) hai bảng có 0 số rõ nên không cần chạy lệnh mã hoá lại, và ràng buộc vẫn `NOT VALID`. Chỉ vai sở
hữu bảng (`quy_hang_owner`, ADR-0009 §2) mới `validate` được. Vai `postgres` của Supabase và công cụ MCP không chuyển
sang vai ấy được, và giám sát quyết không đổi phân quyền. Vai chủ chỉ chạy qua job deploy (`npm run db:migrate` với
`PROD_DATABASE_URL`).

Chủ kho chốt (01/11): «Thêm migration nhỏ để CI tự bật khi deploy tôi đồng ý». Giám sát cấp số 013.

## 2. Cách làm

`packages/db/migrations/013_bat_rang_buoc_ban_ma.sql` — một khối `do $$ … $$`, xét TỪNG bảng độc lập:

- bảng không còn dòng `owner_phone is not null` và ràng buộc chưa `convalidated` → `alter table … validate constraint …`;
- bảng còn số rõ → `raise notice` nêu tên bảng, số dòng còn số rõ, tên ràng buộc và lệnh
  `packages/api/van-hanh/ma-hoa-lai.ts`; không đổi dòng nào, không lỗi;
- ràng buộc đã `convalidated` → không làm gì (chạy lại vô hại).

Vì sao có điều kiện: `validate` thẳng sẽ làm migration hỏng — kéo theo cả deploy — trên cơ sở dữ liệu nào còn số rõ mà
chưa chạy lệnh mã hoá lại (Postgres của các dãy, bản thật tương lai nếu nhập dữ liệu cũ trước khi mã hoá). Lệnh mã hoá
lại vẫn tự `validate` như cũ, nên bảng bị bỏ qua sẽ được bật khi chạy lệnh ấy.

Thông điệp chỉ nêu số dòng, không nêu số điện thoại (bất biến 2, luật dữ liệu cá nhân). Bảng sạch hay ràng buộc đã bật
thì không có notice nào.

Phép đếm trong khối chạy bằng vai migrate: local là superuser, bản thật là `quy_hang_owner` mang `bypassrls`
(`packages/db/supabase/nen-du-an.sql` dòng 14), nên luật theo dòng không lọc phép đếm.

`packages/db/scripts/migrate.mjs` hiện không lắng nghe notice của Postgres — notice của tệp 013 sẽ mất. Thêm một dòng
`client.on("notice", …)` in `<tên tệp>: <thông điệp>` ra stdout, để notice hiện ở log job deploy.

## 3. Chốt trên bản thật

Job deploy đã chạy `npm run db:migrate` → `npm run test:isolation` → deploy hook (ADR-0009, `kiem-ci.mjs` giữ thứ tự).
Thêm `packages/db/tests/bat-rang-buoc.test.mjs` (khớp glob `tests/*.test.mjs` nên chạy ở cả job isolation lẫn job
deploy trên bản thật):

- ca trạng thái: với từng bảng, không còn số rõ ⇒ ràng buộc phải `convalidated = true`; còn số rõ ⇒ `false`. Trên bản
  thật (0 số rõ) ca này đỏ nếu migration 013 không bật được — deploy dừng trước hook;
- ca hai chiều chạy chính tệp 013: trong giao dịch hoàn lại, gỡ ràng buộc, cấy một dòng số rõ, dựng lại `NOT VALID`,
  chạy tệp → bảng bẩn giữ `false` + notice đúng khuôn, bảng sạch `true`; xoá số rõ, chạy lại tệp → `true`.

Gỡ và dựng ràng buộc lấy khoá ACCESS EXCLUSIVE — chặn cả đọc — giữ tới khi giao dịch hoàn lại. Ở job deploy, bản cũ vẫn
đang phục vụ người dùng; một giao dịch đọc dài trên bảng làm lệnh gỡ xếp hàng, kéo mọi lần đọc sau xếp hàng theo. Vì vậy
ca hai chiều CHỈ chạy khi vai đang chạy là superuser (Postgres dãy, job isolation của CI) và tự bỏ qua kèm lý do khi
không (bản thật — `quy_hang_owner` không phải superuser). Ca trạng thái chỉ đọc, chạy mọi nơi (Hỏi-1).

`packages/api/test-db/bat-rang-buoc-migrate.test.ts` (chỉ chạy ở CI, không ở job deploy) đo notice ra tới log: tạo một
cơ sở dữ liệu tạm, chạy `migrate.mjs` thật, gỡ dòng 013 khỏi `schema_migrations`, cấy một dòng số rõ, dựng lại
`NOT VALID`, chạy `migrate.mjs` lần nữa, đọc stdout.

Ca trạng thái chấp nhận `NOT VALID` khi bảng còn số rõ — tức bản thật có dữ liệu cũ chưa mã hoá lại vẫn deploy được,
chỉ có lời nhắc ở log (Hỏi-2).

## 4. Tài liệu

ADR-0013 mục vận hành thêm một đoạn: bảng sạch thì migration 013 tự bật khi deploy; còn số rõ thì chạy lệnh mã hoá lại.
`docs/product/tham-chieu.md` §12 thêm dòng sổ ngày 01/11.

## 5. Ngoài phạm vi

Xoá cột `owner_phone` (hàng sau của ADR-0013) · đổi phân quyền vai `postgres` · migration 010–012 của hàng khác.

## Hỏi

- **Hỏi-1** — ca hai chiều (gỡ và dựng ràng buộc, khoá ACCESS EXCLUSIVE chặn cả đọc tới khi hoàn lại) có chạy trên
  bản thật lúc deploy không. Khuyến nghị: KHÔNG — chỉ chạy khi vai là superuser (Postgres dãy, CI); bản thật chỉ chạy ca
  trạng thái (chỉ đọc). Lối khác: chạy cả trên bản thật kèm `lock_timeout` — giá: lúc deploy người dùng có thể bị treo
  đọc tới hết `lock_timeout`, và deploy đỏ ngẫu nhiên khi bảng bận.
- **Hỏi-2** — bản thật còn số rõ chưa mã hoá lại thì deploy có được đi tiếp không. Khuyến nghị: được — ca trạng thái
  chấp nhận `NOT VALID` khi còn số rõ; ràng buộc vẫn chặn mọi số rõ mới, lời nhắc nằm ở log deploy. Lối khác: ca đỏ mọi
  khi còn `NOT VALID` trên bản thật — giá: deploy dừng tới khi chủ kho chạy lệnh mã hoá lại bằng khoá thật.
