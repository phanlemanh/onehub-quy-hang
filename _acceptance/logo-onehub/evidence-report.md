---
schema_version: 2
feature_slug: logo-onehub
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 417a496f1f8f7910056669c7bb8edf29ea3c6c88
human_signoff:
---

# Evidence Report: logo-onehub

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-3 | test | PASS |
| E2 | AC-5 | test | PASS |
| E3 | AC-6 | test | PASS |
| E4 | AC-6 | script | PASS |
| E5 | AC-1 | ui-check | PASS |
| E6 | AC-2 | ui-check | PASS |
| E7 | AC-4 | ui-check | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-3 | ui-check | PASS |
| E10 | AC-7 | ui-check | PASS |
| E11 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-logo-onehub-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T03:23:05Z
  output: |
    ℹ duration_ms 5934.416166
    __EXIT=0

- eval: E2
  run_id: minted-logo-onehub-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T03:23:05Z
  output: |
    ℹ duration_ms 5934.416166
    __EXIT=0

- eval: E3
  run_id: minted-logo-onehub-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T03:23:05Z
  output: |
    ℹ duration_ms 5934.416166
    __EXIT=0

- eval: E4
  run_id: minted-logo-onehub-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-09T03:23:05Z
  output: |
    ℹ duration_ms 3977.203708
    __EXIT=0

- eval: E8
  run_id: minted-logo-onehub-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T03:23:05Z
  output: |
    (đầu ra của design-floor-s4.mjs rỗng; tail -n 40 của tệp đầu ra không in dòng nào)
    __EXIT=0

- eval: E11
  run_id: minted-logo-onehub-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T03:23:05Z
  output: |
    5 tệp giao diện ngoài bản đồ
    __EXIT=0

- eval: E5
  run_id: minted-logo-onehub-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T03:23:05Z
  screenshot: evidence/E5-step1.png
  observed: |
    E5-sang.png (light, 1440x900): the top of the rail shows a six-hexagon blue mark, with no box in the primary colour behind it. The image is sharp, not broken or distorted. It reads clearly against the light rail background. The rest of the page (header, side panel, table) renders normally. E5-toi.png (dark): the same blue six-hexagon mark at the top of the rail, with no box. It reads clearly against the near-black rail. The page background is dark and differs from the light case. This matches Expected.
  network_observed: clean

- eval: E6
  run_id: minted-logo-onehub-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T03:23:05Z
  screenshot: evidence/E6-1440-sang.png
  observed: |
    I opened all 4 PNG files with Read.
    - E6-1440-sang.png: white background. At the top centre a blue hexagon-cluster logo sits right next to the text "Quỹ hàng". It is sharp, not stretched, and reads clearly. Below are the heading "Đăng nhập Quỹ hàng", the Email field, the "Gửi mã" and "Dùng mật khẩu" buttons, and a footer line. No horizontal overflow.
    - E6-1440-toi.png: near-black background. The same blue logo with white "Quỹ hàng" text, clear and legible. The form is in dark theme and the heading and footer are white. The only difference from the light frame is the theme.
    - E6-375-sang.png: the logo with "Quỹ hàng" at the top centre, sharp and not stretched. The form fits the width and the footer wraps onto 2 lines. No overflow.
    - E6-375-toi.png: the same on a dark background, the logo and the text readable, no overflow.
    All 4 frames match Expected: a blue logo next to "Quỹ hàng", a 32x32 image with empty alt, dark mode with a different background, no "OneHub" or "CRM", scrollWidth 375 at the narrow size.
  network_observed: no-app-traffic

- eval: E7
  run_id: minted-logo-onehub-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T03:23:05Z
  screenshot: evidence/E7-step1.png
  observed: |
    E7-dau-trang.png (=E7-step1): trang /login, logo sau luc giac xanh canh chu Quy hang o dau trang, tieu de Dang nhap Quy hang, o email, nut Gui ma. E7-favicon.png (=E7-step2): hai o, trai nen trang, phai nen den, moi o mot icon sau luc giac xanh duong gradient, thay ro tren ca hai nen. Khop Expected.
  network_observed: no-app-traffic

- eval: E10
  run_id: minted-logo-onehub-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T03:23:05Z
  screenshot: evidence/E10-trang-khach.png
  observed: |
    E10-trang-khach.png (đã mở bằng Read): trang /s/ma-khong-co khổ điện thoại, một thẻ viền mảnh ở đầu trang với dòng chữ "Link không còn mở được — hỏi lại người gửi", phần còn lại trắng, chỉ có nút dev của Next ở góc dưới trái. Đầu trang không có hình sáu lục giác hay logo nào. Khớp Expected: href icon ở /s giống /login (cùng /favicon.ico), không có hình sáu lục giác.
  network_observed: no-app-traffic

- eval: E9
  run_id: minted-logo-onehub-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T03:23:05Z
  observed: |
    Không có frame ảnh. Tệp evidence/E9-so-bam.txt chứa 10 dòng băm, từng cặp nguồn CRM và tệp kho có cùng giá trị sha256. Cả 5 băm khớp bảng BAM_CRM trong apps/web/src/components/dau-hieu-onehub.test.ts.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-logo-onehub-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T03:23:05Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-logo-onehub-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T03:23:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-logo-onehub-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T03:23:05Z

- cmd: npm run test:hooks
  run_id: minted-logo-onehub-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T03:23:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-logo-onehub-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T03:23:05Z

- cmd: npm run typecheck
  run_id: minted-logo-onehub-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T03:23:05Z

- cmd: npm run lint
  run_id: minted-logo-onehub-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T03:23:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/logo-onehub, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated session's git »

Eval khong-phan-biet (xanh ca hai phia): khong do duoc o round nay vi baseline bi chan; moi field baseline ghi n-a.

Baseline khong do
- npm test -w @quy-hang/web: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/logo-onehub, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated session's git »
- npm run test:ro-ri: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/logo-onehub, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated session's git »
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/logo-onehub, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated session's git »
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «This session is isolated in the worktree /Users/manhphan/dev/onehub-quy-hang/.claude/worktrees/logo-onehub, but this command is too complex to verify that it stays inside the worktree. Refusing to run it — a worktree-isolated session's git »

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đạt, không eval nào hỏng; chờ người ký ở Cổng 2.
