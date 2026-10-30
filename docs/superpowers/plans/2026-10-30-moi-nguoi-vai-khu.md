# Mời người, đặt vai và khu phụ trách — kế hoạch làm

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Quản trị sàn tự mời người, đặt nhiều vai, giao khu, sửa và bỏ người; quyền quản người chặn ở cả API lẫn cơ sở dữ liệu.

**Architecture:** Migration 003 thêm `roles` cho `company_members`, hai bảng `company_zones`, `member_zones` (khoá ngoại đôi giữ khu cùng sàn), hàm `app.current_user_is_admin()` (security definer) cho luật ghi, và trigger giữ ≥ 1 quản trị có khoá theo sàn. API thêm đường `/san/thanh-vien`, `/san/khu` qua `withCompany`; tạo tài khoản lúc mời qua phần danh tính (`auth/accounts.ts`). Màn `/settings/users` ghép từ thành phần đã cài.

**Spec:** `docs/superpowers/specs/2026-10-30-moi-nguoi-vai-khu-design.md` · hợp đồng `_acceptance/moi-nguoi-vai-khu/contract.md` · bộ đo `evals.yaml`

## Global Constraints

- Năm vai, đúng chuỗi: `telesales`, `listing_agent`, `buyer_agent`, `team_lead`, `company_admin`. Nhãn UI: Telesales · Đầu chủ · Đầu khách · Trưởng nhóm · Quản trị sàn.
- Mã lỗi API: 403 `can-quan-tri` · 409 `da-la-thanh-vien` · 409 `can-mot-quan-tri` · 409 `khu-trung-ten` · 400 `vai-khong-hop-le` · 400 `khu-khong-thuoc-san` · 400 `can-it-nhat-mot-vai`.
- Mời trả `201 { userId }` như nhau dù email đã có tài khoản hay chưa.
- Migration mới `packages/db/migrations/003_moi_nguoi_vai_khu.sql` (Q-10 đã duyệt); số tính lại trên `origin/main` trước khi gộp.
- Vai đọc lại từ cơ sở dữ liệu mỗi lời gọi, không lưu trong phiên.
- Chữ UI đúng bảng trạng thái của bản thiết kế. Dữ liệu mẫu `*@example.test`, `[Sàn …]`.

## Review Focus

1. **Xoá sàn hay xoá tài khoản trong dọn dẹp** kéo xoá thành viên theo dây chuyền — trigger «còn một quản trị» không được chặn những ca đó (sàn hay tài khoản đã mất trong cùng giao dịch thì bỏ qua). Test ở Task 1.
2. **Email viết hoa / có khoảng trắng khi mời** gắn vào cùng tài khoản. Test ở Task 3.
3. **Mời với danh sách vai rỗng** → 400 `can-it-nhat-mot-vai`, không tạo tài khoản. Test ở Task 3.
4. **Quản trị tự gỡ vai quản trị của mình khi còn người khác là quản trị** → được; lời gọi kế 403. Test ở Task 3.
5. **Test hàng 6 «bỏ khỏi B»** đụng trigger mới vì người ấy là quản trị duy nhất của B — sửa ca dựng thêm một quản trị cho B. Task 3.

---

### Task 1: Migration 003 + bộ kiểm cách ly (AC-3 lớp DB, AC-4, AC-6 lớp DB, AC-7 lớp DB, AC-8) — independent: false

**Files:** Create `packages/db/migrations/003_moi_nguoi_vai_khu.sql` · Modify `packages/db/tests/isolation.test.mjs`

**Interfaces — Produces:** cột `company_members.roles text[]` + check `company_members_roles_valid`; `company_zones (id, company_id, name, created_at)` unique `(company_id, name)` và `(company_id, id)`; `member_zones (company_id, user_id, zone_id)` pk ba cột, FK `(company_id, user_id)` → `company_members` on delete cascade, FK `(company_id, zone_id)` → `company_zones (company_id, id)` on delete cascade; `app.current_user_is_admin() returns boolean` security definer; luật ghi `company_members` (insert/update/delete), `company_zones` (insert), `member_zones` (insert/delete) đòi `company_id = app.current_company_id() and app.current_user_is_admin()`; grant tương ứng cho `quy_hang_app`; trigger `giu_mot_quan_tri` after update or delete on `company_members` — bỏ qua khi sàn hay tài khoản đã mất; `pg_advisory_xact_lock(hashtext('qh-quan-tri:' || company_id))` rồi đếm; thiếu thì `raise exception 'sàn cần ít nhất một quản trị' using errcode = 'P0001', constraint = 'can_mot_quan_tri'`.

- [ ] Step 1 — ca (đỏ): «khu: khu và khu phụ trách ép luật theo dòng» (ca «mọi bảng» phủ) · «khu: quản trị A không đọc khu, khu phụ trách của B» · «quản trị A không ghi thành viên, khu của B» · «vai: cơ sở dữ liệu từ chối giá trị lạ» · «không phải quản trị: cơ sở dữ liệu từ chối ghi thành viên, khu, khu phụ trách» · «khu: giao khu của sàn B bị khoá ngoại từ chối» · «quản trị cuối: cơ sở dữ liệu từ chối trực tiếp» · «hai quản trị gỡ nhau cùng lúc: đúng một giao dịch thành công» (hai `pg.Client`, mỗi bên `begin` → gỡ → bên đầu commit; bên sau bị lỗi `can_mot_quan_tri`) · «dọn sàn: xoá sàn kéo theo thành viên không bị trigger chặn».
- [ ] Step 2 — viết migration; `npm run db:migrate && npm run db:test` xanh.
- [ ] Step 3 — lượt phá trên DB nháp: bỏ `force row level security` của `member_zones` → ca «mọi bảng» đỏ nêu bảng; bỏ khoá advisory → ca đồng thời đỏ (chạy vài lần).
- [ ] Step 4 — commit `feat(db): vai, khu và khu phụ trách của thành viên sàn`.

### Task 2: Công cụ mở sàn gắn vai quản trị (AC-9) — independent: true (sau Task 1)

**Files:** Modify `packages/db/scripts/mo-san.mjs`, `packages/db/tests/mo-san.test.mjs`
- Insert thành viên với `roles = '{company_admin}'`; `on conflict (company_id, user_id) do update` thêm `company_admin` nếu thiếu.
- [ ] ca «mở sàn: người đầu tiên mang vai quản trị sàn»; lượt phá: bỏ vai → đỏ; commit `feat(db): mở sàn gắn vai quản trị`.

### Task 3: API quản người (AC-1..AC-7 lớp API, nửa máy AC-10) — independent: false

**Files:** Create `packages/api/src/auth/accounts.ts` (`ensureAccount(identityPool, email) → Promise<string>`), `packages/api/src/thanh-vien.ts` (`registerMemberRoutes(api, deps)`), `packages/api/test-db/members.test.ts` · Modify `packages/api/src/app.ts` (gọi `registerMemberRoutes`; `deps` thêm `identityPool`), `packages/api/src/auth/company.ts` (`CompanyRef` thêm `roles: string[]`), `packages/api/src/one-door.test.ts` (thêm `auth/accounts.ts` vào phần danh tính), `packages/api/test-db/api.test.ts` (ca «bỏ khỏi B» dựng thêm quản trị cho B), `packages/api/test-db/helpers.ts`, `apps/web/src/lib/api.ts` (truyền `identityPool`).

**Interfaces — Produces (HTTP):** `GET /api/v1/san/thanh-vien` → `[{ userId, email, roles, zones: [{id,name}] }]` · `POST /api/v1/san/thanh-vien {email, roles, zoneIds}` → `201 {userId}` · `PATCH /api/v1/san/thanh-vien/:userId {roles?, zoneIds?}` → 200 · `DELETE /api/v1/san/thanh-vien/:userId` → 204 · `GET /api/v1/san/khu` → `[{id,name}]` · `POST /api/v1/san/khu {name}` → `201 {id,name}`; `GET /me` → `activeCompany.roles`. Lỗi Postgres ánh xạ: `23514` → 400 `vai-khong-hop-le`, `23503` (khu) → 400 `khu-khong-thuoc-san`, `23505` (khu) → 409 `khu-trung-ten`, `P0001`/`can_mot_quan_tri` → 409 `can-mot-quan-tri`, `42501` → 403 `can-quan-tri`.

- [ ] Step 1 — ca (đỏ) đúng tên ở `expected` của E1–E7, E11 (mời vào thẳng hai vai · người sàn B vào thêm A một tài khoản · mời trùng 409 · email mới và email đã có trả cùng câu · năm vai + vai lạ 400 · đổi vai có hiệu lực · tạo/giao khu, tên trùng, khu sàn B · bỏ khỏi sàn: phiên cũ không vào A, khu mất · gỡ vai quản trị: phiên cũ 403 · năm đường 403 + đối chứng quản trị · quản trị cuối 409 cả bỏ lẫn gỡ vai · hai quản trị gỡ một được · luồng quản người qua HTTP) + bốn ca Review Focus.
- [ ] Step 2 — viết; `npm run db:test`, `npm test -w @quy-hang/api`, typecheck, lint xanh.
- [ ] Step 3 — lượt phá: bỏ kiểm quản trị ở API (còn luật DB) → các ca 403 vẫn đỏ ở lớp DB nhưng mã trả lệch; đổi ánh xạ `can_mot_quan_tri` → ca 409 đỏ. Commit `feat(api): mời người, vai và khu của sàn`.

### Task 4: Màn Người dùng (AC-10) — independent: false

**Files:** Create `apps/web/src/app/settings/users/page.tsx` (server: `readMe`, đọc `GET /san/thanh-vien`; 403 → ST-nguoi-dung-khong-quyen), `apps/web/src/app/settings/users/quan-nguoi.tsx` (client: danh sách `Item` + `Badge`, form mời / sửa bằng `Field`, `Input`, `Checkbox`, `Button`, `AlertDialog` bỏ người, khu), `apps/web/src/lib/vai.ts` (nhãn năm vai). Không cài thành phần mới.
- [ ] typecheck, lint (chuẩn giao diện «đạt»), build không DB; đi tám trạng thái trên trình duyệt (`web-q`); commit `feat(web): màn Người dùng của Cài đặt sàn`.

### Task 5: Tài liệu — independent: true

**Files:** Create `docs/adr/0006-vai-khu-va-loi-moi.md` (số tính lại trên main trước khi gộp) · Modify `docs/product/tham-chieu.md` (thêm một dòng sổ §12), `CONTEXT.md` (thêm: Vai `role`, Quản trị sàn `company_admin`, Khu `zone`, Khu phụ trách `member_zone`), `docs/design/vo-va-ia.md` (dòng «Chỗ hở»: màn Người dùng ghép, khối Pro `solution-users-8` sau).
- [ ] `npm run test:hooks` đạt; commit `docs: ADR-0006 vai, khu và lời mời`.

## Thứ tự

Task 1 → Task 2 → Task 3 → Task 4 → Task 5, tuần tự trong phiên.
