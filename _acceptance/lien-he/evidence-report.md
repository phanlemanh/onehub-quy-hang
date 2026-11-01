---
schema_version: 2
feature_slug: lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6f26c850dd915565527c1b9bd27b01cdef4b3b77
human_signoff:
---

# Evidence Report: lien-he

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

## Evidence

- eval: E1
  run_id: minted-lien-he-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm test -w @quy-hang/core
    ℹ duration_ms 157.342583

- eval: E2
  run_id: minted-lien-he-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E3
  run_id: minted-lien-he-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E4
  run_id: minted-lien-he-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E5
  run_id: minted-lien-he-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E6
  run_id: minted-lien-he-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E7
  run_id: minted-lien-he-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E8
  run_id: minted-lien-he-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E9
  run_id: minted-lien-he-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 5638.882083

- eval: E10
  run_id: minted-lien-he-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T13:08:31Z
  output: |
    cmd: npm test -w @quy-hang/core
    ℹ duration_ms 157.342583

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-lien-he-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T13:08:31Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lien-he-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T13:08:31Z

- cmd: npm run test:hooks
  run_id: minted-lien-he-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T13:08:31Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lien-he-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T13:08:31Z

- cmd: npm run typecheck
  run_id: minted-lien-he-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T13:08:31Z

- cmd: npm run lint
  run_id: minted-lien-he-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T13:08:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- `npm test -w @quy-hang/core` — E1, E10

## Variance

none — mọi eval chạy một lần, xác định, không eval nào có phương sai.

## Iterations

Round 1: mọi eval E1 đến E10 đạt, sáu lệnh suite hồi quy đạt; không có mục chờ người phán xét, không có phương sai.
