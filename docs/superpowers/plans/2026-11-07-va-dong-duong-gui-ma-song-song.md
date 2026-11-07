# va-dong-duong-gui-ma-song-song Implementation Plan

**Goal:** ca «đường lõi mật khẩu đóng» đếm người chỉ trên email của chính nó và gọi đường đăng ký với email chưa đăng ký.

**Spec:** `docs/superpowers/specs/2026-11-07-va-dong-duong-gui-ma-song-song-design.md` · hợp đồng
`_acceptance/va-dong-duong-gui-ma-song-song/contract.md`

## Global Constraints

- Chỉ sửa ca «đường lõi mật khẩu đóng»; ba ca khác của tệp giữ nguyên.
- Đường đăng ký lấy từ `BANG_LOI.signUpEmail[0]`; thông điệp «đường đăng ký tạo người» giữ nguyên.
- DATABASE_URL đặt trên dòng lệnh (dãy Q 5577), không ghi `.env*`.

## Review Focus

- Email thử có chữ hoa — ca khẳng định dạng chuẩn.
- Người của tiến trình khác giữa hai lần đếm — E1.

### Task 1: Sửa ca trong tệp kiểm (phục vụ E1, E2, E3 · independent: false)

**Files:** Modify `packages/api/test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts`

- [ ] Nhập `BANG_LOI` từ `../../src/auth/duong-mat-khau.ca`; thêm `emailMoi = mail("loi-tat-moi")`, khẳng định dạng chuẩn.
- [ ] `demNguoi()` = count trên `email = any([email, emailMoi])`, thay hai câu đếm toàn bảng.
- [ ] Sau vòng cũ: `BANG_LOI.signUpEmail[0]` × 10 với `emailMoi`, mỗi lần 404.
- [ ] Verify: `cd packages/api && DATABASE_URL=postgres://postgres:quyhang@localhost:5577/postgres node --import tsx --test test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts` → pass 4.

### Task 2: Bộ đo `thu/kiem-song-song.mjs` (phục vụ E1, E2, E3 · independent: false)

**Files:** Create `_acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs`

- [ ] Ba chế độ `--song-song`, `--dang-ky-tao`, `--that` đúng `expected` của evals.yaml; chép ra `.acceptance-runs/<slug>/`,
  viết lại đường nhập thành tuyệt đối, chèn trước dòng `const sauNguoi`.
- [ ] Cặp hai chiều: E1 đối chứng đỏ trên bản `987c78c6`; E2 đỏ khi chèn đúng email; phá thử thông điệp ghim.
- [ ] Verify: chạy ba chế độ, đều in `ok:true`, exit 0.
