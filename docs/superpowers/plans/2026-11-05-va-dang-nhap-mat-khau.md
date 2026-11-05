# Vá hai kẽ an toàn của mật khẩu do sàn cấp — kế hoạch thi công

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Vào sàn khác thì thu mọi phiên khi mật khẩu gốc sàn cấp bị vô hiệu; đổi mật khẩu ở Cá nhân đếm sai chung bộ đếm với đăng nhập, khoá ở lần 20 thì thu mọi phiên ở bất kỳ đường nào.

**Architecture:** Migration 038 thay thân hàm trigger `app.vo_hieu_mat_khau_khi_vao_san()` để xoá `identity.session` khi nó vô hiệu mật khẩu. `ghiSai` ở `packages/api/src/auth/trang-thai-mat-khau.ts` thu mọi phiên khi chuỗi sai chạm 20 — dùng cho cả đăng nhập và đường đổi. `PUT /api/v1/me/password` kiểm cửa sổ sai trước, ghi sai khi `currentPassword` sai, xoá chuỗi khi đúng.

**Tech Stack:** Postgres 16, Hono, better-auth 1.7.14, Next.js, `node:test`.

**Spec:** `docs/superpowers/specs/2026-11-05-va-dang-nhap-mat-khau-design.md` · hợp đồng `_acceptance/va-dang-nhap-mat-khau/contract.md` · tiêu chí `_acceptance/va-dang-nhap-mat-khau/evals.yaml`.

## Global Constraints

- Migration mới duy nhất `packages/db/migrations/038_*.sql`; không sửa 034.
- Giới hạn: 5 sai / 15 phút theo email (chuẩn hoá `trim().toLowerCase()`), 20 sai liên tiếp — hằng sẵn có `SAI_TOI_DA`, `SAI_CUA_SO_PHUT`, `SAI_LIEN_TIEP_KHOA`.
- Mã lỗi gạch nối sẵn có: `password-rate-limited` 429, `invalid-current-password` 403.
- Không in thân yêu cầu hay mật khẩu ở mọi nhánh mới.
- Hỏi-1: thu MỌI phiên. Hỏi-2: không chụp màn.

## Review Focus

1. Khoá ở lần 20 qua đăng nhập — phiên của người cũng phải bị thu (Task 2 ca «khoá qua đăng nhập cũng thu mọi phiên»).
2. Email phiên khác hoa thường với email lúc đăng nhập — đường đổi đọc email từ `identity.user` và chuẩn hoá như đăng nhập (Task 2 ca «chiều ngược»).
3. `currentPassword` đúng nhưng cửa sổ đã đầy — 429 trước khi so, mật khẩu không đổi (Task 2).
4. Người chưa có mật khẩu (`khong`) gọi đổi — không đọc cửa sổ, không ghi sai (đặt không cần mật khẩu cũ như hàng 104).
5. Mời lại vào đúng sàn đã cấp — hàm không xoá phiên (Task 1 hình ba).

---

### Task 1: Migration 038 thu phiên khi vào sàn khác (E1, E2, E3)

**Files:**
- Create: `packages/db/migrations/038_vao_san_khac_thu_phien.sql`
- Modify: `packages/db/tests/isolation.test.mjs` (ca «vào sàn khác: thu phiên khi vô hiệu mật khẩu gốc sàn cấp», «vào sàn khác: phiên của người khác không bị đụng»)
- Test: `packages/api/test-db/va-dang-nhap-mat-khau/vao-san-khac.test.ts`

- [ ] **Step 1: Viết ca cách ly và hai ca API đỏ** — bảng hai hình (E1), ca phiên cũ qua API (E2), bảng ba hình giữ (E3) đúng chữ `expected`.
- [ ] **Step 2: Chạy, đỏ** — `npm run db:test` với `DATABASE_URL` dãy B.
- [ ] **Step 3: Viết 038** — `create or replace function app.vo_hieu_mat_khau_khi_vao_san()` cùng chữ ký, thân y 034 cộng `delete from identity.session where "userId" = new.user_id` trong nhánh `if found`.
- [ ] **Step 4: `npm run db:migrate && npm run db:test` xanh; phá-thử E1** (bỏ câu xoá phiên) → `evidence/E1-pha-thu.log`.
- [ ] **Step 5: Commit** — `fix(db): 038 vào sàn khác thu mọi phiên khi khoá mật khẩu gốc sàn cấp`.

### Task 2: Đường đổi đếm sai, khoá ở 20 thu mọi phiên (E4, E5, E6)

**Files:**
- Modify: `packages/api/src/auth/trang-thai-mat-khau.ts` (`ghiSai`: khi chuỗi chạm `SAI_LIEN_TIEP_KHOA` thì `thuPhien(pool, userId)` sau khi ghi sự kiện `khoa-20`)
- Modify: `packages/api/src/me/routes.ts` (`PUT /api/v1/me/password`: khi `coMatKhauDung` — `demSai(email) >= SAI_TOI_DA` → 429; sai → `ghiSai(email, userId)` → 403; đúng → `xoaChuoiSai`)
- Test: `packages/api/test-db/va-dang-nhap-mat-khau/doi-dem-sai.test.ts`

**Interfaces:** Consumes `demSai`, `ghiSai`, `xoaChuoiSai`, `thuPhien` của `trang-thai-mat-khau.ts`; bộ bắt nhật ký `batNhatKy` của `packages/api/test-db/dang-nhap-mat-khau/chung.ts`.

- [ ] **Step 1: Viết các ca E4, E5, E6 đúng chữ `expected`**, gồm «chiều ngược» kèm đối chứng 4 lần và «khoá qua đăng nhập cũng thu mọi phiên».
- [ ] **Step 2: Chạy, đỏ.**
- [ ] **Step 3: Sửa `ghiSai` và route** — email lấy từ `phien.user.email`.
- [ ] **Step 4: Xanh; phá-thử E4** (bỏ kiểm cửa sổ ở route) và **E5** (bỏ `thuPhien` khi khoá) → `evidence/E4-pha-thu.log`, `evidence/E5-pha-thu.log`. Bộ test-db của hàng 104 vẫn xanh.
- [ ] **Step 5: Commit** — `fix(api): đổi mật khẩu đếm sai chung với đăng nhập, khoá thì thu mọi phiên`.

### Task 3: Câu «Thử lại sau ít phút» ở hộp đổi (E7, E12)

**Files:**
- Modify: `apps/web/src/app/(app)/me/hop-mat-khau.tsx` (tách hàm thuần `loiHopMatKhau(code): { o: "hien-tai" | "moi"; cau: string }` ra `apps/web/src/app/(app)/me/toi.ts`; thêm `password-rate-limited` → ô hiện tại, «Thử lại sau ít phút»)
- Test: `apps/web/src/app/(app)/me/toi.test.ts` (ca «hộp mật khẩu: mã lỗi → câu», bảng ba dòng)

- [ ] **Step 1: Viết ca đỏ** → **Step 2: sửa** → **Step 3:** `npm test -w @quy-hang/web`, `npm run lint` (chuẩn giao diện đạt, khuôn 0 lệch).
- [ ] **Step 4: Commit** — `fix(web): hộp đổi mật khẩu báo phải chờ`.

### Task 4: Tài liệu, kiểm hồ sơ, kiểm trọn (E8–E11)

**Files:**
- Modify: `docs/adr/0005-dang-nhap-theo-san.md` (một gạch dưới «Bổ sung 04/11» nêu `va-dang-nhap-mat-khau`), `docs/product/tham-chieu.md` §12 (một dòng)
- Create: `_acceptance/va-dang-nhap-mat-khau/thu/migration-tai-lieu.test.mjs` (ca E8 đúng chữ, đối chứng `M …034_mat_khau.sql`)

- [ ] **Step 1: Viết ca E8 đỏ → sửa tài liệu → xanh; phá-thử** (bỏ dòng Tham chiếu) → `evidence/E8-pha-thu.log`.
- [ ] **Step 2: `/verify` đủ** — typecheck, lint, test, build, db:migrate + db:test.
- [ ] **Step 3:** hợp đồng `status: implemented`; commit.
