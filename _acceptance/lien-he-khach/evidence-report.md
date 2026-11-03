---
schema_version: 2
feature_slug: lien-he-khach
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8eaa68e66c2fb23225ab0e328dee4cd51f1aee69
human_signoff:
---

# Evidence Report: lien-he-khach

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
  run_id: minted-lien-he-khach-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm test -w @quy-hang/core (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 191.430542

- eval: E2
  run_id: minted-lien-he-khach-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 42802.583709

- eval: E3
  run_id: minted-lien-he-khach-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 42802.583709

- eval: E4
  run_id: minted-lien-he-khach-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 42802.583709

- eval: E5
  run_id: minted-lien-he-khach-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 42802.583709

- eval: E6
  run_id: minted-lien-he-khach-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 42802.583709

- eval: E7
  run_id: minted-lien-he-khach-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 42802.583709

- eval: E8
  run_id: minted-lien-he-khach-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 42802.583709

- eval: E9
  run_id: minted-lien-he-khach-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm test -w @quy-hang/core (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 191.430542

- eval: E10
  run_id: minted-lien-he-khach-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:26:07Z
  output: |
    lệnh: npm test -w @quy-hang/core (1 lần chạy, 1 lần đạt)
    ℹ duration_ms 191.430542

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-lien-he-khach-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-03T12:26:07Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lien-he-khach-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-03T12:26:07Z

- cmd: npm run test:hooks
  run_id: minted-lien-he-khach-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-03T12:26:07Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lien-he-khach-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-03T12:26:07Z

- cmd: npm run typecheck
  run_id: minted-lien-he-khach-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-03T12:26:07Z

- cmd: npm run lint
  run_id: minted-lien-he-khach-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-03T12:26:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả code mới lẫn baseline diffBase; chứng minh harness chứ chưa chứng minh feature — nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- `npm test -w @quy-hang/core` — E1, E9, E10
- `npm run db:migrate && npm run db:test` — E2, E3, E4, E5, E6, E7, E8

Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E10 đều đạt, không eval nào đỏ; verdict PASS.
