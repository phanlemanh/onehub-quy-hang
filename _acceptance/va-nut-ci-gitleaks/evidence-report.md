---
schema_version: 2
feature_slug: va-nut-ci-gitleaks
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c28b8f7223f43700e58ab953f1c2d96f61d8233f
human_signoff:
---

# Evidence Report: va-nut-ci-gitleaks

Round 1 bị REJECT dù cả ba eval của hợp đồng đều xanh: có một lệnh suite không gắn eval nào (`npm run test:hooks`) trả kết quả ĐỎ. Chi tiết ở mục «Lệnh suite (hồi quy)» và Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-nut-ci-gitleaks-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs
  verified_at: 2026-11-08T07:33:50Z
  output: |
    KẾT: ĐẠT

- eval: E2
  run_id: minted-va-nut-ci-gitleaks-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs
  verified_at: 2026-11-08T07:33:50Z
  output: |
    KẾT: ĐẠT

- eval: E3
  run_id: minted-va-nut-ci-gitleaks-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs
  verified_at: 2026-11-08T07:33:50Z
  output: |
    KẾT: ĐẠT

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-08T07:33:50Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T07:33:50Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T07:33:50Z

- cmd: npm run test:hooks
  run_id: minted-va-nut-ci-gitleaks-SUITE-test_hooks-r1
  exit_code: 1
  verified_at: 2026-11-08T07:33:50Z
  ghi chú: lệnh này không gắn eval nào và chạy ĐỎ; dòng ĐỎ duy nhất của bài tự kiểm là «chặn theo cwd của phiên khi thư mục dự án trỏ chỗ khác (worktree)» (mong 2, được 0); phần còn lại ĐẠT; dòng cuối «TỔNG: ĐỎ».

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-08T07:33:50Z

- cmd: npm run typecheck
  run_id: minted-va-nut-ci-gitleaks-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-08T07:33:50Z

- cmd: npm run lint
  run_id: minted-va-nut-ci-gitleaks-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-08T07:33:50Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval feature nào được đo xanh ở cả hai phía; cả ba eval đều là eval mới nên baseline không đo (xem dưới).

Baseline khong do
- node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --tinh: bo qua baseline: tep _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs co o cay dang kiem nhung chua co o merge-base 5db74a3430e0844cded591287c4a3aeb604ed030 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --chay: bo qua baseline: tep _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs co o cay dang kiem nhung chua co o merge-base 5db74a3430e0844cded591287c4a3aeb604ed030 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --hooks: bo qua baseline: tep _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs co o cay dang kiem nhung chua co o merge-base 5db74a3430e0844cded591287c4a3aeb604ed030 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (cả ba eval chỉ chạy một lần, xác định).

## Iterations

Round 1: không eval hợp đồng nào đỏ, nhưng lệnh suite `npm run test:hooks` (không gắn eval) ra TỔNG: ĐỎ ở ca «chặn theo cwd của phiên khi thư mục dự án trỏ chỗ khác (worktree)». Verdict REJECT; trả về thi công để xử lý ca hook này (hoặc người quyết nếu ca đỏ có sẵn từ trước).
