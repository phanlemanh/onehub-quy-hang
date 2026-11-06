# Vá deploy: CSDL tạm cho bộ cách ly, kiểm nhanh chỉ đọc trên bản thật — kế hoạch

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Job `deploy` thôi chạy bộ kiểm cách ly trên bản thật; bản thật chỉ `db:migrate` rồi kiểm nhanh chỉ đọc.

**Architecture:** Bộ cách ly đã chạy trên Postgres tạm của job `isolation` ở cùng commit — deploy giữ `needs: isolation`.
Kiểm nhanh là một script Node một kết nối, một giao dịch `read only`, ba câu đọc danh mục; phần xét thuần tách riêng.

**Tech Stack:** Node 24, `pg`, `node:test`, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-06-va-deploy-csdl-tam-design.md` · hợp đồng `_acceptance/va-deploy-csdl-tam/contract.md`

## Global Constraints

- Không chạy gì lên cơ sở dữ liệu bản thật từ máy; không đổi `KIT_TAG`; chỉ chạm vùng của hàng.
- Bài kiểm chạy trên Postgres dãy Q: `DATABASE_URL=postgres://postgres:quyhang@localhost:5577/postgres` trên dòng lệnh.
- Tên bảng thử trong bài: `__kn_*`, mọi ca trong giao dịch rollback.

## Review Focus

1. Bảng của `public` là bảng phân vùng (`relkind = 'p'`) — kiểm nhanh vẫn soi (bài: ma trận `xet` nhận cả hai loại).
2. `statement_timeout` của pooler đè — đặt bằng `set local` trong giao dịch, bài đọc lại giá trị trên đúng kết nối.
3. Kết nối hỏng giữa chừng — `chay` luôn `end()` trong `finally`; bài đếm kết nối = 0 sau khi trả về.
4. Vai `quy_hang_app` chưa tồn tại (cơ sở dữ liệu mới) — báo lỗi «thiếu vai», thoát 1, không nổ.
5. `DATABASE_URL` trống chuỗi — coi như thiếu.

---

### Task 1: Kiểm nhanh (E4, E5, E6) — independent: false

**Files:** Create `packages/db/scripts/kiem-nhanh.mjs`, `packages/db/tests/kiem-nhanh.test.mjs`; Modify `packages/db/package.json`

**Interfaces — Produces:**
- `xet({ bang: {ten, bat, ep, chu}[], vai: {ton_tai, bypassrls, superuser} }) → { loi: {vế, ten?}[], soBang }` — vế ∈
  «chưa bật», «chưa ép», «chủ bảng», «bypassrls», «superuser», «thiếu vai».
- `soi(client) → Promise<{loi, soBang}>` — chạy câu đọc trên client đã cho (không mở giao dịch).
- `moGiaoDich(client)` — `begin read only` + `set local statement_timeout = '15s'`.
- `chay(url, { moc } = {}) → Promise<{loi, soBang}>` — một client (`application_name: kiem-nhanh`), `moGiaoDich`, `soi`,
  gọi `moc(client)` nếu có, `rollback`, `end()` trong `finally`.
- CLI: thiếu/trống `DATABASE_URL` → stderr «Thiếu DATABASE_URL…», thoát 2, không kết nối; có lỗi → in từng dòng, thoát 1;
  lành → «kiểm nhanh: <n> bảng · luật theo dòng bật và ép · quy_hang_app không là chủ, không bypassrls», thoát 0.
- `package.json`: `"kiem-nhanh": "node --env-file-if-exists=../../.env.local scripts/kiem-nhanh.mjs"`.

- [ ] Viết bài: ma trận 24 dòng cho `xet` (viết trước, đếm 24 assert) + ca thiếu vai; ca CSDL lành; ca `__kn_thieu` không bật
  / chỉ bật; ca `__kn_chu` owner quy_hang_app; ca bypassrls; ca superuser; ca `chay` + móc (read only on, timeout ≠ 0, create
  table → 25006); ca đếm kết nối mới = 1 trong móc, = 0 sau.
- [ ] Chạy: `DATABASE_URL=… node --test packages/db/tests/kiem-nhanh.test.mjs` → đỏ (chưa có script).
- [ ] Viết `kiem-nhanh.mjs` và dòng script.
- [ ] Chạy lại → xanh; phá thử: bỏ `read only` → ca 25006 đỏ; bỏ vế superuser → dòng ma trận đỏ; hoàn lại.
- [ ] `DATABASE_URL=… npm run db:migrate && npm run db:test` xanh; commit.

### Task 2: Job deploy (E1, E2, E3) — independent: false (sau Task 1)

**Files:** Modify `.github/workflows/ci.yml` (job `deploy` và chú thích trên nó)

- [ ] Bỏ `env.DATABASE_URL` mức job; bỏ bước `test:isolation`; bước `npm run db:migrate` và bước
  `npm run kiem-nhanh -w @quy-hang/db` mỗi bước tự đặt `env: DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}`; thứ tự
  migrate → kiểm nhanh → deploy hook; chú thích nói bộ cách ly chạy ở job `isolation` cùng commit.

### Task 3: Thước CI (E1, E2, E3, E7) — independent: false (sau Task 2)

**Files:** Create `_acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs`

- [ ] Tách job bằng `js-yaml`; hàm `xet(ci, pkg)` trả danh sách vế hỏng theo tên. Đối chứng đỏ chạy TRƯỚC trên bản sao
  sửa trong bộ nhớ (năm ca E1, hai ca E2, bảy ca E3, một ca E7), mỗi ca phải đỏ ĐÚNG tên vế; rồi xét tệp thật.
- [ ] E7: chép `kiem-nhanh.mjs` vào thư mục tạm, chạy với env chỉ PATH + `PGHOST=10.255.255.1`, mong mã ≠ 0, stderr chứa
  «DATABASE_URL», < 2 giây.
- [ ] Chạy `node _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs` → «KẾT: ĐẠT»; phá thử ci.yml thật (chèn lại
  `test:isolation`) → đỏ, hoàn lại; commit.
