# Chuẩn hoá mọi cửa — từ điển của sàn (hàng 70) — kế hoạch thi công

**Goal:** gợi ý giá trị chuẩn ở bước xem trước nhập file, lựa chọn thành đề xuất từ điển của sàn, quản trị duyệt ở màn Từ
điển, cách gõ đã duyệt chuẩn hoá thẳng ở mọi lần nhập sau.
**Spec:** docs/superpowers/specs/2026-11-07-chuan-hoa-moi-cua-design.md · hợp đồng `_acceptance/chuan-hoa-moi-cua/contract.md`.

## Global Constraints
- Ba trường: `standardStatus`, `feeInclusion`, `directionFaces`. So khớp bằng `fold` của `dictionaries.ts`.
- Gợi ý: Levenshtein trên chữ gập ≤ 2 và ≤ ⌊độ dài/3⌋, tối đa 3, xếp theo khoảng cách rồi thứ tự tập chuẩn.
- Chữ gốc ≤ 40 ký tự, qua `kiemChuNhan` (không số điện thoại, email, số giấy tờ).
- Migration số 051 (giám sát cấp). Bảng bật + ép RLS theo `app.current_company_id()`, grant `quy_hang_app`.
- Đề xuất: mọi vai nhập file được (Hỏi-3); duyệt/bỏ: `company_admin`.

## Task 1 — Lõi (independent: false) · E1, E4, E9, E10 (phần lõi)
Files: `packages/core/src/import/goi-y.ts`, `goi-y.test.ts`, `index.ts` (export).
- `goiYGiaTri(field: StandardField, raw: string, company?: readonly CompanyAlias[]): { khop: string | null; goiY: string[] }`.
- `kiemCachGo(field: unknown, raw: unknown, value: unknown): { ok: true; field; raw; rawFold; value } | { ok: false; loi: string }` — ba trường, chữ hợp lệ, giá trị thuộc tập chuẩn, không ghi đè cách gõ dựng sẵn / tên chuẩn trỏ giá trị khác (Hỏi-4).
- `cachGoDaDuyet(rows: { field; raw; value; status }[]): CompanyAlias[]` — chỉ `approved`.
- `sucKhoeTuDien(rows): Record<field, { gap; daNeo; cho; daBo; lanChon }>`.
Verify: `npm test -w @quy-hang/core` + lượt phá thử bỏ bước khoảng cách chữ.

## Task 2 — Cơ sở dữ liệu (independent: true) · E8
Files: `packages/db/migrations/051_tu_dien_cua_san.sql`, `packages/db/tests/isolation.test.mjs`.
- `company_value_aliases(company_id, id uuid, field check in 3, raw text check ≤40, raw_fold, value, status check proposed|approved|rejected, pick_count int ≥1, proposed_by, proposed_at, decided_by, decided_at, unique(company_id, field, raw_fold))`; RLS đọc mọi thành viên sàn, ghi qua hàm.
- `company_value_alias_events` chỉ thêm (trigger `app.cau_hinh_su_kien_chi_them` như 043).
- `app.de_xuat_cach_go(field, raw, raw_fold, value)` security definer: upsert proposed / tăng pick_count, giữ trạng thái đã quyết; `app.quyet_cach_go(id, status)` chỉ quản trị.
Verify: `npm run db:migrate && npm run db:test` (5572) + phá thử tắt RLS.

## Task 3 — API (independent: false, sau 1, 2) · E3, E5, E6, E7, E10
Files: `packages/api/src/value-aliases/{store.ts,routes.ts}`, `packages/api/src/app.ts`, `errors.ts`, `imports/store.ts` (nạp `companyAliases` vào `applyPlan`), `packages/api/test-db/chuan-hoa-moi-cua/tu-dien.test.ts`, `_acceptance/config.yaml` (khoá `executors.test.chuan_hoa_moi_cua`, đã báo giám sát).
- `GET /api/v1/company/value-aliases` → `{ rows, health }`; `POST /api/v1/company/value-aliases/proposals`; `PUT /api/v1/company/value-aliases/{id}` `{ decision: "approve"|"reject" }`.
Verify: bộ test-db của hàng trên 5572 + `npm test -w @quy-hang/api`.

## Task 4 — Bước xem trước (independent: false, sau 1, 3) · E2, E2u, E4
Files: `apps/web/src/app/(app)/imports/new/{man-nhap.tsx,bang.tsx}`, `apps/web/src/lib/nhap/goi-y.ts`, test.
- `man-nhap` nạp cách gõ đã duyệt (GET) vào `ctx.companyAliases`; ô `needs_person` của ba trường hiện «Ý bạn là:» + ≤3 nút; bấm → `onSua` + POST đề xuất (chữ gốc → giá trị).
Verify: `npm test -w @quy-hang/web`, typecheck, lint.

## Task 5 — Màn Từ điển (independent: false, sau 3) · E5b, E9, E9u, E11
Files: `apps/web/src/app/(app)/settings/dictionary/{page.tsx,tu-dien.tsx,tu-dien-thuan.ts,tu-dien.test.ts}`, `settings/cai-dat.ts`, `design/patterns/*` và `packages/ui-lint/tests/*` (danh sách tệp theo khuôn, số chỗ trạng thái).
Verify: web test, `npm test -w @quy-hang/ui-lint`, khuôn `--kiem`.

## Task 6 — Tài liệu
`docs/product/tham-chieu.md` §12 dòng 07/11; `docs/architecture/so-diem-bien-thien.md` #19 trạng thái; `docs/design/vo-va-ia.md` mục Từ điển.

## Review Focus
- Đề xuất trùng chữ gập đồng thời (hai người cùng lúc) — upsert trong hàm, không lỗi khoá.
- Cách gõ đã duyệt phải tới cả trình duyệt lẫn máy chủ; lệch nhau thì ô xem trước khác kết quả ghi.
- Sàn khác cùng chữ không bị ảnh hưởng.
