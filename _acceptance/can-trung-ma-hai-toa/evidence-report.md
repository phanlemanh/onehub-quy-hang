---
schema_version: 2
feature_slug: can-trung-ma-hai-toa
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3954d3e5a4eb1bad70ad82e887f5d92c8dbdbbd5
human_signoff:
---

# Evidence Report: can-trung-ma-hai-toa

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-can-trung-ma-hai-toa-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 101.142167

- eval: E2
  run_id: minted-can-trung-ma-hai-toa-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 101.142167

- eval: E3
  run_id: minted-can-trung-ma-hai-toa-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 101.142167

- eval: E4
  run_id: minted-can-trung-ma-hai-toa-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 101.142167

- eval: E7
  run_id: minted-can-trung-ma-hai-toa-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 101.142167

- eval: E5
  run_id: minted-can-trung-ma-hai-toa-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 2610.790209

- eval: E8
  run_id: minted-can-trung-ma-hai-toa-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 2610.790209

- eval: E9
  run_id: minted-can-trung-ma-hai-toa-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 2610.790209

- eval: E6
  run_id: minted-can-trung-ma-hai-toa-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T14:33:59Z
  output: |
    lệnh: npm test -w @quy-hang/api
    ℹ duration_ms 60431.89375

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-can-trung-ma-hai-toa-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T14:33:59Z

- cmd: npm run test:hooks
  run_id: minted-can-trung-ma-hai-toa-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T14:33:59Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-can-trung-ma-hai-toa-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T14:33:59Z

- cmd: npm run typecheck
  run_id: minted-can-trung-ma-hai-toa-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T14:33:59Z

- cmd: npm run lint
  run_id: minted-can-trung-ma-hai-toa-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T14:33:59Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: không có.

Eval không phân biệt (xanh trên cả HEAD lẫn baseline; chứng minh harness chứ chưa chứng minh tính năng — nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E1, E2, E3, E4, E7
- npm run db:migrate && npm run db:test: E5, E8, E9
- npm test -w @quy-hang/api: E6

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh, không eval nào hỏng; các eval ghi baseline green cần người soát ở Cổng 2 (xem Analyst).

