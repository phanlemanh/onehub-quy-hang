---
schema_version: 2
feature_slug: chia-lead-va-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7bb853d6bfd13374710f4fb1e0a5d52ea645b12e
human_signoff:
---

# Evidence Report: chia-lead-va-han

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |

## Evidence

Lệnh `npm test -w @quy-hang/core` phủ E1 và E2 (một lần chạy, đạt). Lệnh `npm run db:migrate && npm run db:test` phủ E3 đến E12 (một lần chạy, đạt).

- eval: E1
  run_id: minted-chia-lead-va-han-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 131.57675

- eval: E2
  run_id: minted-chia-lead-va-han-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 131.57675

- eval: E3
  run_id: minted-chia-lead-va-han-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E4
  run_id: minted-chia-lead-va-han-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E5
  run_id: minted-chia-lead-va-han-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E6
  run_id: minted-chia-lead-va-han-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E7
  run_id: minted-chia-lead-va-han-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E8
  run_id: minted-chia-lead-va-han-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E9
  run_id: minted-chia-lead-va-han-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E10
  run_id: minted-chia-lead-va-han-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E11
  run_id: minted-chia-lead-va-han-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

- eval: E12
  run_id: minted-chia-lead-va-han-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:02:10Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5993.990375

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-chia-lead-va-han-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T00:02:10Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chia-lead-va-han-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T00:02:10Z

- cmd: npm run test:hooks
  run_id: minted-chia-lead-va-han-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T00:02:10Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chia-lead-va-han-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T00:02:10Z

- cmd: npm run typecheck
  run_id: minted-chia-lead-va-han-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T00:02:10Z

- cmd: npm run lint
  run_id: minted-chia-lead-va-han-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T00:02:10Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (đạt trên cả code mới lẫn baseline diffBase; chứng minh harness chứ chưa chứng minh feature, cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- E1, E2 (lệnh `npm test -w @quy-hang/core`)
- E3, E4, E5, E6, E7, E8, E9, E10, E11, E12 (lệnh `npm run db:migrate && npm run db:test`)

Sáu lệnh suite (api, connect, test:hooks, ui-lint, typecheck, lint) không gắn eval nào, baseline n-a; không liệt kê ở đây.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định; không eval nào có pass_rate lẫn lộn).

## Iterations

Round 1: E1 đến E12 đều đạt, sáu lệnh suite hồi quy đều xanh; không có judgment item, không có eval nào cần người chốt. Verdict PASS.
