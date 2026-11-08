---
schema_version: 2
feature_slug: va-nut-ci-ag-root
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7b603459b4bc191341a2a45431f21a43a2d3e4d8
human_signoff: Manh Phan 2026-11-08
---

# Evidence Report: va-nut-ci-ag-root

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-nut-ci-ag-root-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs
  verified_at: 2026-11-08T01:03:11Z
  output: |
    KẾT: ĐẠT

- eval: E2
  run_id: minted-va-nut-ci-ag-root-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs
  verified_at: 2026-11-08T01:03:11Z
  output: |
    KẾT: ĐẠT

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-nut-ci-ag-root-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-08T01:03:11Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-nut-ci-ag-root-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T01:03:11Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-nut-ci-ag-root-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T01:03:11Z

- cmd: npm run test:hooks
  run_id: minted-va-nut-ci-ag-root-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T01:03:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-nut-ci-ag-root-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-08T01:03:11Z

- cmd: npm run typecheck
  run_id: minted-va-nut-ci-ag-root-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-08T01:03:11Z

- cmd: npm run lint
  run_id: minted-va-nut-ci-ag-root-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-08T01:03:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline khong do
- node _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs --chay: bo qua baseline: tep _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs co o cay dang kiem nhung chua co o merge-base 9562c0c9a2d4572550baa11c88470ff6da72c02d — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs --tinh: bo qua baseline: tep _acceptance/va-nut-ci-ag-root/thu/kiem-ag-root.mjs co o cay dang kiem nhung chua co o merge-base 9562c0c9a2d4572550baa11c88470ff6da72c02d — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2 đạt; các lệnh suite xanh. Verdict PASS.
