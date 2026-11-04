# Kế hoạch thi công — cau-hinh-theo-san (hàng 82)

Hợp đồng `_acceptance/cau-hinh-theo-san/contract.md` (duyệt 04/11, Hỏi-1 = chia theo mặc định 15/30 và báo). Thiết kế
`docs/superpowers/specs/2026-11-04-cau-hinh-theo-san-design.md`. T3 — Gate 1.5 trước khi code.

Verify chung: `DATABASE_URL=postgres://postgres:quyhang@localhost:5575/postgres` (Postgres dãy D).

## Task 1 — Migration 026 và ca cách ly (phục vụ E6 a–b, E7, E9) · independent: true

- Files: `packages/db/migrations/026_cau_hinh_su_kien.sql`, `packages/db/tests/isolation.test.mjs`.
- `company_settings` thêm `data_class text not null default 'company_internal'` + check (mọi lớp trừ `source`, tên ràng
  buộc `company_settings_data_class_check`).
- `company_settings_events` (`id bigint identity`, `company_id`, `key`, `value jsonb`, `data_class` + check
  `company_settings_events_data_class_check`, `actor_user_id text`, `actor_roles text[] not null default '{}'`,
  `at timestamptz not null default now()`); bật + ép luật theo dòng; luật đọc theo `app.current_company_id()`; luật chèn
  theo sàn hiện hành; `grant select` cho `quy_hang_app`, không insert/update/delete.
- Trigger `company_settings_events_chi_them` (before update or delete) `raise exception 'nhật ký cấu hình chỉ thêm'`.
- Trigger `company_settings_ghi_nhat_ky` (after insert or update on `company_settings`), hàm `security definer`
  `set search_path = ''`, chép khoá, giá trị, lớp, `new.updated_by`, `coalesce(app.current_user_roles(), '{}')`.
- Chép bù: `insert into company_settings_events (…) select … from company_settings` với `at = updated_at`, vai rỗng.
- Ca cách ly: bảng bật/ép luật; vai API không sửa/xoá/chèn thẳng; chủ bảng không sửa/xoá (ghim chuỗi raise); lớp
  `source` bị chặn ở hai bảng; sàn khác không đọc, không ghi hộ; chiều đỏ theo khuôn `exports`.
- Verify: `npm run db:migrate && npm run db:test`.

## Task 2 — Cặp hạn hai chiều ở lõi (phục vụ E5b) · independent: true

- Files: `packages/core/src/config/khuon.ts`, `giai.ts`, `luat-nhan-cau-hinh.test.ts`, `packages/core/src/routing/index.ts`.
- `kiemGiaTri`: thêm chiều ngược — khoá được một khoá khác trỏ `khongNhoHon` thì không lớn hơn giá trị đang áp của khoá
  ấy; lỗi nêu cả hai khoá. Chiều xuôi đổi thông điệp để nêu cả hai khoá.
- `giaiCauHinh`: sau khi giải, xét mọi cặp `khongNhoHon` trên cấu hình cuối; trái luật → hai khoá về mặc định + một lỗi
  nêu hai khoá.
- `readLeadRoutingSettings`: cặp trái luật → hai hạn về mặc định (Hỏi-1 = a), không ném; giá trị hỏng một ô vẫn ném như cũ.
- Verify: `npm test -w @quy-hang/core`, `npm run typecheck`.

## Task 3 — Lối API chung và bộ kiểm trên Postgres (phục vụ E1–E4, E5a, E5c, E6 c–d, E7, E8) · independent: false (sau 1, 2)

- Files: `packages/api/src/settings/{routes.ts,store.ts}`, `packages/api/src/app.ts`, `packages/api/src/app.test.ts`,
  `packages/api/test-db/cau-hinh-theo-san.test.ts`.
- `GET /api/v1/company/settings` (mọi thành viên): điểm đơn đã mở của sổ, `{ key, value, source, updatedBy, updatedAt }`
  + `errors` của `giaiCauHinh`.
- `PATCH /api/v1/company/settings` (vai theo `aiDoi`): nguyên khối; `pg_advisory_xact_lock` cùng khoá `lead_routing:`;
  kiểm trên cấu hình đang áp ⊕ phần đổi; upsert kèm `data_class` theo sổ; lỗi 400 `invalidSettings` + `reason`, 403
  `adminRequired`.
- Ca test-db theo đúng tên ca ở `evals.yaml`; ca chép bù chạy trên cơ sở dữ liệu tạm theo khuôn
  `bat-rang-buoc-migrate.test.ts`.
- Verify: `npm run typecheck`, `npm test -w @quy-hang/api`, `npm run db:migrate && npm run db:test`.

## Task 4 — Tài liệu (không phục vụ eval) · independent: false (sau 3)

- Files: `docs/product/tham-chieu.md` (§4 cấu hình sàn có nhật ký và lối API; §12 sổ quyết định), `docs/architecture/
  so-diem-bien-thien.md` (lối đổi chung, cặp hai chiều), `CONTEXT.md` (Nhật ký cấu hình ↔ `company_settings_events`).
- Verify: `npm run lint`.
