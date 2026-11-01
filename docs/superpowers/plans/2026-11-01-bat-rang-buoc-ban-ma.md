# Bật hẳn ràng buộc bản mã khi deploy — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans. Steps use checkbox (`- [ ]`) syntax.

**Goal:** migration 013 tự bật hẳn `listing_owners_phone_chi_ban_ma` và `leads_phone_chi_ban_ma` khi bảng sạch, bỏ qua
kèm lời nhắc khi còn số rõ; lời nhắc ra tới log deploy; bản thật có ca trạng thái chặn deploy.

**Architecture:** một khối `do $$` xét từng bảng; `migrate.mjs` in notice; một tệp kiểm ở `packages/db/tests` (chạy cả ở
job deploy) và một tệp ở `packages/api/test-db` (chỉ CI) spawn `migrate.mjs` trên cơ sở dữ liệu tạm.

**Tech Stack:** PostgreSQL 16, node:test, pg.

**Spec:** `docs/superpowers/specs/2026-11-01-bat-rang-buoc-ban-ma-design.md` · hợp đồng `_acceptance/bat-rang-buoc-ban-ma/contract.md`.

## Global Constraints

- Không sửa migration đã commit; số 013 do giám sát cấp.
- Thông điệp và test không mang số thật: số mẫu `0900 000 06x`, tên `[Tên]`.
- Notice chỉ nêu số dòng, không nêu số điện thoại.
- Ca gỡ và dựng ràng buộc chỉ chạy khi `rolsuper` của `current_user` là true (Hỏi-1).

## Review Focus

- Tệp 013 chạy lần hai sau khi đã bật: không lỗi, không notice (E1).
- Một bảng bẩn, một bảng sạch: chỉ bảng sạch bật (E2).
- Notice có số đếm đúng khi nhiều dòng bẩn — đo «1 dòng» ở E2; khuôn câu dùng `%s dòng`.
- Bản thật vai không superuser: ca gỡ và dựng bỏ qua có lý do, ca trạng thái vẫn chạy (E3).
- `migrate.mjs` in notice kèm tên tệp đang áp (E6).

---

### Task 1: Migration 013 + ca cách ly (E1, E2, E3) — independent: false

**Files:** Create `packages/db/migrations/013_bat_rang_buoc_ban_ma.sql`, `packages/db/tests/bat-rang-buoc.test.mjs`.

**Interfaces — Produces:** tệp 013; trong tệp kiểm: `kiemTrangThai(client): Promise<string[]>` (danh sách lỗi theo bảng,
rỗng là đạt), `nenChay(rolsuper: boolean): true | string` (true hay lý do bỏ qua).

- [ ] Viết tệp kiểm với bốn ca: «bật ràng buộc: bảng sạch thì tệp 013 bật hẳn, chạy lại không đổi» · «bật ràng buộc:
  bảng còn số rõ thì bỏ qua, bảng kia vẫn bật» (hai lượt, assert số lượt 2) · «bật ràng buộc: bảng không còn số rõ thì
  ràng buộc phải đã bật» (chỉ đọc, gọi `kiemTrangThai`) · «bật ràng buộc: ca gỡ và dựng chỉ chạy với vai superuser»
  (`nenChay(false)` trả đúng lý do). Ca gỡ/dựng: một client, `begin`, `set local session_replication_role = replica`
  (bỏ khoá ngoài khi cấy dòng trần), gỡ ràng buộc, cấy dòng, `add constraint … check (owner_phone is null) not valid`,
  đọc tệp 013 từ đĩa và `client.query(sql)`, gom notice qua `client.on("notice")`, `rollback`. Trong ca E1/E2, sau khi
  dựng NOT VALID trên bảng sạch, gọi `kiemTrangThai` và assert nó báo đúng tên ràng buộc (hai chiều của E3).
- [ ] Chạy `npm run db:test -w @quy-hang/db` (DATABASE_URL dãy G) — đỏ vì thiếu tệp 013.
- [ ] Viết tệp 013: `do $$ declare n bigint; begin` cho từng cặp (bảng, ràng buộc): nếu `convalidated` đã true thì bỏ;
  đếm `owner_phone is not null`; 0 → `execute format('alter table %I validate constraint %I', …)`; >0 → `raise notice
  '% còn % dòng số rõ — ràng buộc % chưa bật; chạy packages/api/van-hanh/ma-hoa-lai.ts (lệnh tự bật)', …`.
- [ ] Chạy lại — xanh. Phá thử: đổi `validate` thành `select 1` → E1 đỏ nêu tên ràng buộc; bỏ điều kiện đếm → E2 ném
  «violated». Hoàn lại.
- [ ] Commit `feat(bat-rang-buoc-ban-ma): migration 013 bật hẳn ràng buộc bản mã khi bảng sạch`.

### Task 2: migrate.mjs in notice + ca spawn (E6) — independent: false (cần tệp 013)

**Files:** Modify `packages/db/scripts/migrate.mjs`; Create `packages/api/test-db/bat-rang-buoc-migrate.test.ts`.

- [ ] Viết ca «bật ràng buộc: lời nhắc của 013 hiện ở đầu ra npm run db:migrate»: bằng vai chủ tạo database
  `qh_brbm_<RUN>`, spawn `node packages/db/scripts/migrate.mjs` với `DATABASE_URL` trỏ nó (thay tên database trong URL);
  assert lần một stdout có `đã áp 013_bat_rang_buoc_ban_ma.sql`, không có `ma-hoa-lai`; rồi trên database tạm:
  `delete from schema_migrations where name = '013_bat_rang_buoc_ban_ma.sql'`, `set session_replication_role = replica`,
  gỡ ràng buộc chủ nhà, cấy một dòng `listing_owners` số rõ `0900000063`, dựng lại NOT VALID; spawn lần hai; assert mã 0,
  stdout chứa đủ năm chuỗi của E6, không chứa bốn dạng số mẫu (`timDangSo` của `src/owners/ma-hoa`). `after` xoá database.
- [ ] Chạy `npm run test:db -w @quy-hang/api` — đỏ (stdout lần hai thiếu `ma-hoa-lai`).
- [ ] Thêm vào `migrate.mjs` sau `client.connect()`: biến `dangAp` giữ tên tệp đang áp, `client.on("notice", (n) =>
  console.log(\`${dangAp}: ${n.message}\`))`.
- [ ] Chạy lại — xanh; phá thử bằng gỡ dòng `on("notice")` → đỏ nêu stdout thực. Hoàn lại.
- [ ] Commit `feat(bat-rang-buoc-ban-ma): migrate in lời nhắc của cơ sở dữ liệu ra log`.

### Task 3: Tài liệu (E5) — independent: true

**Files:** Modify `docs/adr/0013-ma-hoa-so-chu.md` (mục vận hành), `docs/product/tham-chieu.md` (§12).

- [ ] ADR-0013: một đoạn — bảng sạch thì migration 013 tự bật khi deploy; còn số rõ thì bỏ qua, lời nhắc in ở đầu ra
  `npm run db:migrate` (log job deploy), chạy lệnh mã hoá lại (lệnh tự bật); ca kiểm trạng thái chặn deploy khi bảng
  sạch mà ràng buộc chưa bật.
- [ ] Tham chiếu §12: dòng 01/11 trỏ `packages/db/migrations/013_bat_rang_buoc_ban_ma.sql` và Hỏi-1, Hỏi-2.
- [ ] Commit `docs(bat-rang-buoc-ban-ma): sổ tay bật ràng buộc qua migration 013`.

### Task 4: Kiểm trọn — independent: false

- [ ] `npm run typecheck && npm run lint && npm test && npm run test:hooks`; `npm run db:migrate && npm run db:test`;
  `node _acceptance/moi-truong-that/thu/kiem-ci.mjs` ra «KẾT: ĐẠT».
