# Job secrets quét đúng lịch sử của commit đang xét — kế hoạch

> **For agentic workers:** Thực thi tuần tự trong vòng chính theo superpowers:executing-plans; quy ước verify của kho thắng mặc định của skill. Steps dùng checkbox (`- [ ]`).

**Goal:** Đổi job `secrets` để chỉ quét lịch sử của `HEAD`, kèm bộ đo hai chiều chạy đúng dòng lệnh của `ci.yml`.

**Architecture:** Một tệp đo `kiem-secrets.mjs` ba chế độ, không phụ thuộc gì ngoài `node`, `git`, `gitleaks`. Viết bộ đo trước, thấy đỏ đúng chỗ trên cây cũ, rồi mới đổi một dòng lệnh.

**Tech Stack:** Node (ESM, chỉ thư viện chuẩn), git, gitleaks 8.30.1.

**Spec:** `docs/superpowers/specs/2026-11-09-va-ci-secrets-quet-dung-lich-su-design.md` · hợp đồng `_acceptance/va-ci-secrets-quet-dung-lich-su/contract.md`

## Global Constraints

- Lệnh đích: `"$HOME/bin/gitleaks" git --redact --no-banner --log-level warn --log-opts="--full-history --diff-filter=tuxdb HEAD" .`
- Lệnh trước bản vá (đối chứng, hằng trong tệp đo): `"$HOME/bin/gitleaks" git --redact --no-banner --log-level warn .`
- Không đổi `.gitleaksignore`, `.githooks/**`, job khác của `ci.yml`, `GITLEAKS_VERSION`.
- Mọi commit chạm `ci.yml` phải có slug `va-ci-secrets-quet-dung-lich-su` trong tiêu đề.
- Không có khoá mẫu nào trong kho: tệp đo ghép khoá lúc chạy bằng `crypto.randomBytes`, tiền tố `ghp_` viết tách đoạn.
- Mọi kho tạm ở `os.tmpdir()`, dọn ở `finally`; không ghi gì vào cây kho.

## Review Focus

- Máy chấm thiếu gitleaks hoặc lệch `GITLEAKS_VERSION` → HỎNG có tên, không được xanh.
- `ci.yml` không có, hoặc có hơn một, dòng `gitleaks git` trong job `secrets` → HỎNG «không rút được dòng lệnh».
- Cấu hình git của máy (hook toàn cục, `init.defaultBranch`, chữ ký) làm lệch kho thử → chạy git với `GIT_CONFIG_GLOBAL=/dev/null`, `GIT_CONFIG_NOSYSTEM=1`, danh tính cố định.
- Chạy trong worktree: `--git-common-dir` chứ không phải `.git` khi mượn đối tượng.
- Hồ sơ được ghim lại trên nhánh sau đã đổi `ci.yml` hợp lệ → vế phạm vi không đỏ oan (sau gộp chỉ xét commit mang slug).

---

### Task 1: Bộ đo `kiem-secrets.mjs` (đỏ đúng chỗ trên cây cũ)

Phục vụ E1–E7 · `independent: false`

**Files:** Create `_acceptance/va-ci-secrets-quet-dung-lich-su/thu/kiem-secrets.mjs`

**Interfaces — Produces:** ba cờ `--ma-tran`, `--tinh`, `--that`; in dòng `ĐẠT …`/`HỎNG …`, cuối `KẾT: ĐẠT` hoặc `KẾT: HỎNG <n>`, thoát 0/1.

- [ ] **Step 1: Viết phần chung.** `lenhCi(text)`: rút khối job `secrets` theo `layJob(text, "secrets")`, trả đúng một dòng khớp `gitleaks" git`, sai số lượng thì `dat(false, "không rút được dòng lệnh …")`. `chayLenh(cwd, lenh, {trace})`: chạy `bash --noprofile --norc -eo pipefail -c "<lenh> --report-format json --report-path <f>"` với `HOME` tạm có `bin/gitleaks` là liên kết tới gitleaks của máy; trả `{ma, commits:Map<sha, số>, gitLog}`; `gitLog` lấy từ dòng `trace: built-in: git log …` của `GIT_TRACE=1`.

- [ ] **Step 2: `--ma-tran`.** Mỗi ca dựng kho nguồn bare, commit qua kho làm việc tạm, rồi kho máy chạy bằng `git init` + `git fetch origin +refs/heads/*:refs/remotes/origin/* +refs/tags/*:refs/tags/*` (PR thêm `+refs/pull/7/merge:refs/remotes/pull/7/merge`), `git checkout --detach` đúng ref. M3 đặt khoá ở commit main mới hơn điểm rẽ.

| Ca | Sự kiện · HEAD | Giá trị nằm ở | Lệnh `ci.yml` | Lệnh cũ |
|---|---|---|---|---|
| M1 | PR · gộp | không đâu | 0 | 0 |
| M2 | PR · gộp | commit nhánh PR, gỡ ở commit sau | 1, commit khoá | 1 |
| M3 | PR · gộp | commit main sau điểm rẽ, gỡ ở commit sau | 1, commit khoá | 1 |
| M4 | PR · gộp | nhánh khác, kèm `.gitleaksignore` của nó | 0 | 1 |
| M5 | PR · gộp | tag trỏ commit ngoài lịch sử | 0 | 1 |
| M6 | push · đỉnh main | commit main, gỡ ở commit sau | 1, commit khoá | 1 |
| M7 | push · đỉnh main | commit nhánh đã gộp (cha thứ hai) | 1, commit khoá | 1 |
| M8 | push · đỉnh main | nhánh khác | 0 | 1 |
| M9 | PR · gộp | nhánh PR, có vân tay trong `.gitleaksignore` của nhánh | 0 | 0 |
| M10 | PR · gộp | nhánh PR, đỉnh nhánh, `.gitleaksignore` không chứa nó | 1, commit khoá | 1 |
| M11 | PR · đỉnh nhánh PR (HEAD sai) | như M3 | 0 | 1 |

Thêm: dòng đối số `git log` của M1 theo E4; so `.gitleaksignore` với `git show fb62d52e:.gitleaksignore` (dòng không phải chú thích) theo E5; `commitsCuaHang()` rồi không commit nào chạm `.gitleaksignore`.

- [ ] **Step 3: `--tinh`.** `chamVe(text) → string[]` trả tập vế hỏng trong V1–V7 (AC-7); `layJob` gán khối chú thích liền trên cho job theo sau. Mười một bản phá trong AC-7 sinh bằng thay chuỗi trên bản thật, so tập vế bằng nhau. `commitsCuaHang()`: nếu `git log origin/main --grep=<slug> -- .github/workflows/ci.yml` có kết quả thì lấy commit mang slug, không thì `git log --no-merges $(git merge-base origin/main HEAD)..HEAD -- .github/workflows/ci.yml .gitleaksignore`. Với mỗi commit chạm `ci.yml`, `ngoaiJobSecrets(cha, con)` so từng job và phần đầu tệp. Đối chứng: đổi job `gate`; đổi khối chú thích trên `secrets`. Thêm vế hook `pre-commit` và vế không có `.gitleaks.toml` ở gốc.

- [ ] **Step 4: `--that`.** Kho tạm `git init`, `objects/info/alternates` trỏ `<git-common-dir>/objects`; mỗi mốc đúng một ref. Hai mốc và phát hiện theo commit viết trong AC-6; mốc ba đứng tại `git rev-parse HEAD`, không ref thừa.

- [ ] **Step 5: Chạy trên cây cũ, thấy đỏ đúng chỗ.**
`node _acceptance/va-ci-secrets-quet-dung-lich-su/thu/kiem-secrets.mjs --ma-tran` → HỎNG M4, M5, M8, M11 và «đối số git log», `KẾT: HỎNG`; M2, M3, M6, M7, M9, M10 ĐẠT.
`… --tinh` → «HỎNG ci.yml thật: hỏng V4»; ca phá `đặt lại --all`, `bỏ HEAD` báo lệch vì bản thật chưa có chuỗi.
`… --that` → `HỎNG mốc fc0dab7b …: lệnh ci.yml thoát 1`.

- [ ] **Step 6: Commit.** `test(acceptance): bộ đo job secrets — va-ci-secrets-quet-dung-lich-su`.

### Task 2: Đổi job `secrets`

Phục vụ E1–E7 · `independent: false`

**Files:** Modify `.github/workflows/ci.yml:77,89`

- [ ] **Step 1:** Dòng 89 thành lệnh đích ở Global Constraints. Dòng 77 thành chú thích nói quét toàn bộ lịch sử của commit đang xét (commit gộp với PR, đỉnh main khi push), không quét nhánh khác vì `.gitleaksignore` chỉ đọc từ cây đang xét.
- [ ] **Step 2:** Chạy `--ma-tran`, `--tinh`, `--that` → `KẾT: ĐẠT`, dòng đúng như `expected` của E1–E7.
- [ ] **Step 3:** Phá thử lượt cuối trên bản sao: bỏ `HEAD` trong `--log-opts` ở một bản sao `ci.yml`, xác nhận `--ma-tran` đỏ ở M2 hoặc M3 (git báo lỗi đối số), rồi hoàn lại.
- [ ] **Step 4: Commit.** `/verify` trước khi commit. `fix(ci): job secrets chỉ quét lịch sử của commit đang xét — va-ci-secrets-quet-dung-lich-su`.
- [ ] **Step 5:** Đặt hợp đồng `status: implemented` rồi vào S4.
