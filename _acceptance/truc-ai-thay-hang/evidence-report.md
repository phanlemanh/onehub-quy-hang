---
schema_version: 2
feature_slug: truc-ai-thay-hang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cd7621e73e733272a0a71af07407c580cbd629cf
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: truc-ai-thay-hang

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
  run_id: minted-truc-ai-thay-hang-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 73.053292

- eval: E2
  run_id: minted-truc-ai-thay-hang-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 73.053292

- eval: E3
  run_id: minted-truc-ai-thay-hang-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

- eval: E4
  run_id: minted-truc-ai-thay-hang-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

- eval: E5
  run_id: minted-truc-ai-thay-hang-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

- eval: E6
  run_id: minted-truc-ai-thay-hang-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

- eval: E7
  run_id: minted-truc-ai-thay-hang-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

- eval: E8
  run_id: minted-truc-ai-thay-hang-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

- eval: E9
  run_id: minted-truc-ai-thay-hang-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

- eval: E10
  run_id: minted-truc-ai-thay-hang-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:05:23Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1898.653542

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-truc-ai-thay-hang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T06:05:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-truc-ai-thay-hang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T06:05:23Z

- cmd: npm run test:hooks
  run_id: minted-truc-ai-thay-hang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T06:05:23Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-truc-ai-thay-hang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T06:05:23Z

- cmd: npm run typecheck
  run_id: minted-truc-ai-thay-hang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T06:05:23Z

- cmd: npm run lint
  run_id: minted-truc-ai-thay-hang-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T06:05:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả bản đầu lẫn bản nền diffBase) — cần viết lại để khẳng định hành vi mới, hoặc xác nhận là rào hồi quy có chủ ý:

- npm test -w @quy-hang/core — E1, E2
- npm run db:migrate && npm run db:test — E3, E4, E5, E6, E7, E8, E9, E10

Lệnh suite xanh cả hai phía là rào hồi quy bình thường, không liệt kê.

Không có mục chấm theo hội đồng (judgment) nào ở vòng này; mọi eval đều là máy.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định)

## Iterations

Round 1: mọi eval và lệnh suite đều xanh. Verdict PASS.
