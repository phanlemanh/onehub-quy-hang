---
schema_version: 1
feature: Khi deploy, cơ sở dữ liệu tự bật hẳn hai ràng buộc chặn số chủ để rõ nếu bảng không còn số rõ; còn số rõ thì bỏ qua và nhắc chạy lệnh mã hoá lại
slug: bat-rang-buoc-ban-ma
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [db]
status: verified
approved_by: Manh Phan
approved_at: 2026-11-01
design_doc: docs/superpowers/specs/2026-11-01-bat-rang-buoc-ban-ma-design.md
---

# Acceptance Contract: bat-rang-buoc-ban-ma

## Context

Nối tiếp hàng 62 (`ma-hoa-so-chu`, ADR-0013). Hai ràng buộc `listing_owners_phone_chi_ban_ma` và
`leads_phone_chi_ban_ma` đang `NOT VALID` trên bản thật; chỉ vai chủ `quy_hang_owner` validate được, và vai ấy chỉ chạy
qua job deploy (ADR-0009 §2). Chủ kho chốt 01/11: «Thêm migration nhỏ để CI tự bật khi deploy tôi đồng ý». Giám sát cấp
số migration 013. Bất biến chạm: 2 (chỉ chặn thêm, trần lớp `source` không đổi).

Từ ngữ: «số rõ» = dòng có `owner_phone is not null`; «bật hẳn» = `pg_constraint.convalidated = true`; «tệp 013» =
`packages/db/migrations/013_bat_rang_buoc_ban_ma.sql`; «lệnh mã hoá lại» = `packages/api/van-hanh/ma-hoa-lai.ts`.

## Criteria

**AC-1 — Bảng sạch thì bật hẳn.**
Given hai bảng `listing_owners`, `leads` không còn số rõ, hai ràng buộc ở trạng thái `NOT VALID`
When áp tệp 013
Then cả hai ràng buộc bật hẳn; áp tệp 013 lần nữa không lỗi và không đổi gì.

**AC-2 — Bảng còn số rõ thì bỏ qua, không hỏng, và mỗi bảng xét riêng.**
Given `listing_owners` có một dòng số rõ còn `leads` sạch (và ca ngược lại)
When áp tệp 013
Then không lỗi; ràng buộc của bảng còn số rõ giữ `NOT VALID`, của bảng sạch bật hẳn; dòng số rõ không đổi; có đúng
một notice, cho bảng còn số rõ, nêu tên bảng, số dòng còn số rõ, tên ràng buộc và lệnh mã hoá lại, không chứa số điện
thoại ở dạng nào — bảng sạch hay ràng buộc đã bật thì không có notice. Notice ấy hiện ở đầu ra của `npm run db:migrate`
(log job deploy). Xoá số rõ rồi áp lại tệp 013 thì ràng buộc ấy bật hẳn.

**AC-3 — Bản thật có chốt trước khi lên người dùng.**
Given job deploy chạy `npm run db:migrate` bằng `PROD_DATABASE_URL` (vai chủ) rồi bộ kiểm cách ly trước deploy hook
When bộ kiểm cách ly chạy trên một cơ sở dữ liệu bất kỳ
Then có ca chỉ đọc: bảng không còn số rõ thì ràng buộc của nó phải bật hẳn, còn số rõ thì phải `NOT VALID` — trên bản
thật (0 số rõ) ca đỏ nếu tệp 013 không bật được, deploy dừng trước hook; ca gỡ và dựng ràng buộc chỉ chạy khi vai là
superuser, trên bản thật nó tự bỏ qua kèm lý do; thứ tự migrate → bộ cách ly → hook của job deploy giữ nguyên.

**AC-4 — Người vận hành biết đường bật. (judgment)**
Given ADR-0013 và sổ quyết định của Tham chiếu
When người vận hành chỉ đọc hai tệp ấy
Then biết: bảng sạch thì tệp 013 tự bật khi deploy; còn số rõ thì chạy lệnh mã hoá lại (lệnh ấy tự bật); đọc notice
của migration ở log deploy; §12 Tham chiếu có dòng ngày 01/11 trỏ tệp 013.

## Coverage

Không gian nhỏ, liệt kê đủ (Zwicky, preset test-matrix). Chân sản phẩm: `[SUY-TỪ-REPO: docs/adr/0009-moi-truong-that.md]`
§2 vai chủ, `[SUY-TỪ-REPO: .github/workflows/ci.yml]` job deploy. Chân ngành: `[NGÀNH: PostgreSQL ALTER TABLE …
VALIDATE CONSTRAINT]` (chỉ chủ bảng, quét dòng cũ, khoá SHARE UPDATE EXCLUSIVE). Thước CE: ma trận ba trục dưới — đủ.

- Trục A — bảng: `listing_owners` | `leads` (xét độc lập — AC-2).
- Trục B — trạng thái: sạch + NOT VALID (AC-1) | còn số rõ (AC-2) | đã bật (AC-1 chạy lại).
- Trục C — nơi chạy: Postgres dãy (vai superuser) | CI isolation (Postgres trống) | bản thật qua job deploy (vai chủ —
  AC-3).
- Never: đổi phân quyền vai `postgres` để validate tay — giám sát quyết không đổi.

## Out of scope

- Xoá cột `owner_phone` — hàng sau của ADR-0013.
- Đổi phân quyền vai `postgres` hay cấp quyền chuyển vai trên Supabase.
- Chạy lệnh mã hoá lại trên bản thật — bản thật 0 số rõ (giám sát đếm 01/11).

## Notes

- Số migration 013 do giám sát cấp (010 hàng 10, 011 hàng 25, 012 hàng 18). `migrate.mjs` áp theo tên chưa có trong
  `schema_migrations`, nên 013 áp trước 010–012 không sao.
- Vai migrate trên bản thật là `quy_hang_owner` mang `bypassrls` (`packages/db/supabase/nen-du-an.sql` dòng 14) nên
  phép đếm số rõ trong tệp 013 không bị luật theo dòng lọc.
- Tệp ngoài `migrations/` mà hàng chạm: `packages/db/scripts/migrate.mjs` (in notice), `packages/db/tests/bat-rang-buoc.test.mjs`,
  `packages/api/test-db/bat-rang-buoc-migrate.test.ts`, ADR-0013, Tham chiếu §12.
- Hỏi-1 (ca gỡ và dựng ràng buộc có chạy trên bản thật) và Hỏi-2 (bản thật còn số rõ có được deploy) ở thiết kế §Hỏi.
