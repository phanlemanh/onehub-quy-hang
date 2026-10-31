---
schema_version: 2
feature_slug: lop-truong-nguon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8046f7d4eb8075b34faba9d1edca46397a69374e
human_signoff:
---

# Evidence Report: lop-truong-nguon

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-lop-truong-nguon-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 79.485416

- eval: E2
  run_id: minted-lop-truong-nguon-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 79.485416

- eval: E3
  run_id: minted-lop-truong-nguon-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 79.485416

- eval: E4
  run_id: minted-lop-truong-nguon-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 79.485416

- eval: E4b
  run_id: minted-lop-truong-nguon-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

- eval: E5
  run_id: minted-lop-truong-nguon-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

- eval: E6
  run_id: minted-lop-truong-nguon-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

- eval: E7
  run_id: minted-lop-truong-nguon-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

- eval: E8
  run_id: minted-lop-truong-nguon-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

- eval: E9
  run_id: minted-lop-truong-nguon-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

- eval: E9b
  run_id: minted-lop-truong-nguon-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

- eval: E10
  run_id: minted-lop-truong-nguon-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.691792

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-lop-truong-nguon-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T06:10:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lop-truong-nguon-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T06:10:56Z

- cmd: npm run test:hooks
  run_id: minted-lop-truong-nguon-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T06:10:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lop-truong-nguon-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T06:10:56Z

- cmd: npm run typecheck
  run_id: minted-lop-truong-nguon-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T06:10:56Z

- cmd: npm run lint
  run_id: minted-lop-truong-nguon-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T06:10:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả mã cũ lẫn mã mới, chứng minh bộ chạy chứ không chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- Lệnh `npm test -w @quy-hang/core` phủ E1, E2, E3, E4 — baseline: green.
- Lệnh `npm run db:migrate && npm run db:test` phủ E4b, E5, E6, E7, E8, E9, E9b, E10 — baseline: green.

Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định; không eval nào có pass_rate lẫn).

## Iterations

Round 1: mọi eval và mọi lệnh suite đều xanh; không eval nào hỏng. Verdict PASS.
