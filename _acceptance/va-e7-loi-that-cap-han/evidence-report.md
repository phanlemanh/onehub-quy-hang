---
schema_version: 2
feature_slug: va-e7-loi-that-cap-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 17a9b7fd750d59a7bb36527cd089c55e8a41d740
human_signoff:
---

# Evidence Report: va-e7-loi-that-cap-han

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E3b | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: r2-l1-1-20261108065723
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs
  verified_at: 2026-11-08T06:57:23Z
  output: |
    khung 3 ĐẠT: lỗi thật của máy chủ → «chưa áp», không «Đã lưu»

- eval: E2
  run_id: r2-l2-1-20261108065723
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs
  verified_at: 2026-11-08T06:57:23Z
  output: |
    chiều đỏ ĐẠT: thước đỏ đúng như mong đợi

- eval: E3
  run_id: minted-va-e7-loi-that-cap-han-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs
  verified_at: 2026-11-08T06:57:23Z
  output: |
    nguồn ĐẠT: khung 3 lấy thân từ GET thật, không còn câu lỗi gõ tay

- eval: E3b
  run_id: minted-va-e7-loi-that-cap-han-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs
  verified_at: 2026-11-08T06:57:23Z
  output: |
    chiều đỏ ĐẠT: thước đỏ đúng như mong đợi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T06:57:23Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T06:57:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T06:57:23Z

- cmd: npm run test:hooks
  run_id: minted-va-e7-loi-that-cap-han-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T06:57:23Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-08T06:57:23Z

- cmd: npm run typecheck
  run_id: minted-va-e7-loi-that-cap-han-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T06:57:23Z

- cmd: npm run lint
  run_id: minted-va-e7-loi-that-cap-han-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T06:57:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều không đo được baseline (n-a), không có eval nào được xác nhận là xanh ở cả hai phía.

Baseline khong do
- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base c2546960c85a9ecfeed5b28a214e419485e1d50b — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --doi-cau: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base c2546960c85a9ecfeed5b28a214e419485e1d50b — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --nguon: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base c2546960c85a9ecfeed5b28a214e419485e1d50b — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --nguon --tu 5b17fd36: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base c2546960c85a9ecfeed5b28a214e419485e1d50b — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval đều chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: có eval chưa đạt ở lượt đo đầu (E3b, xem run-log) và phản biện nêu thước chấm AC-1 chưa đủ. Returned to implementation.
Round 2: E1, E2, E3, E3b và toàn bộ lệnh suite đạt trên cây 17a9b7fd; verdict PASS.
