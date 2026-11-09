---
schema_version: 1
feature: "Job secrets của CI chỉ quét đúng lịch sử của commit đang xét, vẫn phủ toàn bộ lịch sử main và nhánh PR; giá trị trên một nhánh khác không còn làm đỏ main và PR khác."
slug: va-ci-secrets-quet-dung-lich-su
owner: phanlemanh@gmail.com
risk_tier: T3
surfaces: [ci]
status: implemented
design_doc: docs/superpowers/specs/2026-11-09-va-ci-secrets-quet-dung-lich-su-design.md
approved_by: Manh Phan
approved_at: 2026-11-09
---

# Acceptance Contract: va-ci-secrets-quet-dung-lich-su

## Context

Job `secrets` chạy `gitleaks git .` sau checkout `fetch-depth: 0`, nên `--all` của gitleaks quét mọi nhánh đã đẩy, trong
khi `.gitleaksignore` chỉ đọc từ cây đang xét. Hai lần ngày 08/11 một nhánh có giá trị mẫu làm đỏ main và mọi PR khác,
bước triển khai bị bỏ qua. T3: chạm rào của kho (AGENTS.md «Rào của kho»), dù `ci.yml` nằm trong `t1_skip_globs`.

Source input: hàng `va-ci-secrets-quet-dung-lich-su` (`docs/plan/lo-trinh.json`) · giao từ giám sát đợt dau-khach-nhap.

## Criteria

Ma trận M1–M11 viết trước (`thu/kiem-secrets.mjs`): mỗi ca dựng kho nguồn tạm, kho máy chạy theo đúng refspec của
`actions/checkout@v4` với `fetch-depth: 0`, rồi chạy dòng `gitleaks git` rút nguyên văn từ job `secrets` của `ci.yml` và
lệnh trước bản vá làm đối chứng, so mã thoát và tập commit phát hiện.

- **AC-1** — Khoá thật trên chính nhánh PR vẫn đỏ.
  Given sự kiện `pull_request` (`HEAD` là `refs/pull/7/merge`) và một khoá mẫu chưa có dấu vân tay nằm ở một commit của
  nhánh PR, đã gỡ ở commit sau của nhánh ấy (M2), hoặc còn ở đỉnh nhánh cùng tệp bỏ qua không chứa nó (M10),
  When chạy lệnh của `ci.yml`,
  Then thoát 1 và tập commit phát hiện đúng bằng commit mang khoá.

- **AC-2** — Khoá thật trong lịch sử main vẫn đỏ, ở cả hai sự kiện.
  Given khoá mẫu ở một commit của main MỚI HƠN điểm rẽ của nhánh PR, đã gỡ ở commit sau, với `pull_request` (M3) và `push`
  lên main (M6); khoá ở một commit của nhánh đã gộp vào main, tức cha thứ hai của commit gộp, với `push` (M7); và đối
  chứng M11: đúng kho M3 nhưng `HEAD` đặt sai về đỉnh nhánh PR thay vì commit gộp,
  When chạy lệnh của `ci.yml`,
  Then M3, M6, M7 thoát 1 và tập commit phát hiện đúng bằng commit mang khoá; M11 thoát 0 — cho thấy lời hứa này dựa vào
  việc `HEAD` là commit gộp, nên AC-7 cấm thêm `ref:` ở bước checkout.

- **AC-3** — Giá trị ngoài lịch sử của commit đang xét không làm đỏ.
  Given giá trị mẫu chỉ nằm trên một nhánh khác đã đẩy (cùng tệp bỏ qua của riêng nhánh ấy, đúng hình sự cố) với
  `pull_request` (M4) và `push` (M8), hoặc chỉ ở một tag không thuộc lịch sử `HEAD` (M5),
  When chạy lệnh của `ci.yml`, rồi chạy lệnh trước bản vá trên CÙNG kho,
  Then lệnh của `ci.yml` thoát 0, không phát hiện nào; lệnh trước bản vá thoát 1 — phép đo phân biệt được hai lệnh.

- **AC-4** — Lệnh chỉ đổi phạm vi ref, không đổi cách quét.
  Given kho của ca M1 (không giá trị nào, thoát 0 ở cả hai lệnh),
  When đọc đối số `git log` thật của hai lệnh qua `GIT_TRACE`,
  Then lệnh của `ci.yml` là `log -p -U0 --full-history --diff-filter=tuxdb HEAD`, lệnh trước bản vá là
  `log -p -U0 --full-history --all --diff-filter=tuxdb`; hai danh sách chỉ khác `--all` và `HEAD`.

- **AC-5** — Tệp bỏ qua vẫn có hiệu lực, hàng này không đổi nó.
  Given nhánh PR mang giá trị mẫu kèm dấu vân tay dạng `<tệp>:<luật>:<dòng>` trong `.gitleaksignore` của chính nhánh (M9),
  chín dấu vân tay của `.gitleaksignore` tại commit `fb62d52e`, và các commit của hàng,
  When chạy lệnh của `ci.yml`, đọc `.gitleaksignore` của cây kho và liệt tệp các commit của hàng đổi,
  Then M9 thoát 0 (cùng giá trị ở M10, không dấu vân tay, thoát 1); cả chín dòng còn nguyên trong tệp; không commit nào của
  hàng chạm `.gitleaksignore`.

- **AC-6** — Hai lần đỏ thật ngày 08/11 hết đỏ, và cây kho sạch.
  Given kho tạm mượn đối tượng của kho này, mỗi mốc chỉ có đúng một ref đã khai: ref trỏ `66b6521d` khi đứng tại `fc0dab7b`
  (sau #204), ref trỏ `f848f717` khi đứng tại `001ae667` (sau #213), và kho không ref thừa đứng tại `HEAD` của cây đang chấm,
  When chạy lệnh trước bản vá và lệnh của `ci.yml`,
  Then lệnh trước bản vá thoát 1 với số phát hiện theo commit đúng bằng {`66b6521d`: 6} ở mốc một và {`f848f717`: 3} ở mốc
  hai; lệnh của `ci.yml` thoát 0 ở cả ba chỗ.

- **AC-7** — Không nới rào ở chỗ nào khác.
  Given `ci.yml`, `.githooks/pre-commit`, bảy vế của rào — V1 checkout job `secrets` giữ `fetch-depth: 0` · V2 bước checkout
  không có `ref:` · V3 lệnh có `--redact` · V4 `--log-opts` đúng `--full-history --diff-filter=tuxdb HEAD`, không `--all` ·
  V5 không cờ nuốt lỗi (`--exit-code 0`, `|| true`) và job không `continue-on-error` · V6 `needs` của `ci-ok` có `secrets` ·
  V7 `needs` của `deploy` có `secrets` — và mười một bản phá trên bản sao văn bản (bỏ `fetch-depth` → V1 · `fetch-depth: 1`
  → V1 · thêm `ref:` → V2 · bỏ `--redact` → V3 · đặt lại `--all` → V4 · bỏ `HEAD` → V4 · `--exit-code 0` → V5 · `|| true` →
  V5 · `continue-on-error` → V5 · gỡ khỏi `ci-ok` → V6 · gỡ khỏi `deploy` → V7),
  When chấm đủ bảy vế và so từng commit của hàng với cha của nó,
  Then bản thật đạt 7/7; mỗi bản phá hỏng đúng tập vế đã viết trước; commit của hàng trong `ci.yml` chỉ đổi khối job
  `secrets` và khối chú thích liền trên nó (đối chứng: đổi job `gate` → hỏng «ngoài job secrets»); hook `pre-commit` vẫn
  gọi gitleaks trên phần đã stage; không có tệp cấu hình gitleaks ở gốc kho. «Commit của hàng»: trước khi gộp là mọi commit
  không phải commit gộp trên nhánh chạm hai tệp ấy, sau khi gộp là các commit mang slug trong tiêu đề.

## Coverage

Trục (morphological-scan, preset test-matrix):

- Vị trí giá trị: sạch | lịch sử nhánh PR | lịch sử main | nhánh đã gộp | nhánh khác đã đẩy | tag ngoài `HEAD`
  [thước CE: tập ref mà `getRefSpecForAllHistory` của `actions/checkout@v4` nạp — `refs/heads/*`, tag, ref PR]
- Sự kiện CI: `pull_request` | `push` lên main [thước CE: khối `on:` của `ci.yml`]
- Dấu vân tay ở cây `HEAD`: không | có [thước CE: `.gitleaksignore`, cách gitleaks so vân tay]
- Lệnh: của `ci.yml` | trước bản vá [đối chứng hai chiều]

Tích 24 ô, gạch ô vô nghĩa: «nhánh PR» với `push` (khi đã gộp là «nhánh đã gộp»); «nhánh đã gộp» với `pull_request` (là
lịch sử main). Core là mười một ca M1–M11, mỗi ca chạy cả hai lệnh, chọn theo hai lời hứa của câu giao và hình sự cố thật; ô
còn lại là tổ hợp mà `git log HEAD` đã quyết định như nhau.

[NGÀNH: gitleaks-action] đối chiếu cách quét theo khoảng commit — bị loại vì không phủ lịch sử main, ghi ở design.

## Out of scope

- Kiểm băm tệp tải gitleaks ở job `check` và `secrets`.
- Thêm luồng lịch quét mọi nhánh; tag ngoài lịch sử `HEAD` và nhánh không bao giờ mở PR thì CI không bao giờ quét (Hỏi-1).
- Xoá hay sửa dòng nào trong `.gitleaksignore`, viết lại lịch sử.
- `.githooks/**`, các job khác của `ci.yml`, `KIT_TAG`.
- Đẩy nhánh mang khoá mẫu lên chính kho này để đo; dựng kho GitHub tạm để đo (Hỏi-3).

## Notes

- `HEAD` trên máy chủ GitHub được dựng lại trên máy chấm bằng đúng refspec của `actions/checkout@v4` và gitleaks cùng bản;
  phần chạy thật trên GitHub chỉ thấy chiều xanh ở job `secrets` của chính PR này (Hỏi-3).
- Lệnh chép đối số mặc định của gitleaks 8.30.1; nâng `GITLEAKS_VERSION` thì lệnh không tự theo mặc định mới. E4 đọc đối số
  thật của cả hai lệnh, nên bản mới đổi mặc định sẽ đỏ khi đo lại (Hỏi-2).
