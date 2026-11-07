---
schema_version: 2
feature_slug: kiem-tan-dinh-bac-ninh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 98faf6065ef1750edfc51ec0c5194a50cb86813f
human_signoff:
---

# Evidence Report: kiem-tan-dinh-bac-ninh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-kiem-tan-dinh-bac-ninh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T08:03:37Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11542.736417

- eval: E2
  run_id: minted-kiem-tan-dinh-bac-ninh-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T08:03:37Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11542.736417

- eval: E3
  run_id: minted-kiem-tan-dinh-bac-ninh-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T08:03:37Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11542.736417

- eval: E4
  run_id: minted-kiem-tan-dinh-bac-ninh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T08:03:37Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11542.736417

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-kiem-tan-dinh-bac-ninh-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T08:03:37Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-kiem-tan-dinh-bac-ninh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T08:03:37Z

- cmd: npm run test:hooks
  run_id: minted-kiem-tan-dinh-bac-ninh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T08:03:37Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-kiem-tan-dinh-bac-ninh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T08:03:37Z

- cmd: npm run typecheck
  run_id: minted-kiem-tan-dinh-bac-ninh-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T08:03:37Z

- cmd: npm run lint
  run_id: minted-kiem-tan-dinh-bac-ninh-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T08:03:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline): lệnh `npm test -w @quy-hang/core` cho E1, E2, E3, E4. Chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4 đều xanh; verdict PASS.

