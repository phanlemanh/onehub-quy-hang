---
schema_version: 2
feature_slug: cau-hinh-theo-san
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4021a628b7d73d4eb486bea9654d8f0486e72a3e
human_signoff:
---

# Evidence Report: cau-hinh-theo-san

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5a | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E5c | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-cau-hinh-theo-san-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E2
  run_id: minted-cau-hinh-theo-san-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E3
  run_id: minted-cau-hinh-theo-san-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E4
  run_id: minted-cau-hinh-theo-san-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E5a
  run_id: minted-cau-hinh-theo-san-E5a-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E5b
  run_id: minted-cau-hinh-theo-san-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 687.074584

- eval: E5c
  run_id: minted-cau-hinh-theo-san-E5c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E6
  run_id: minted-cau-hinh-theo-san-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E7
  run_id: minted-cau-hinh-theo-san-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E8
  run_id: minted-cau-hinh-theo-san-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

- eval: E9
  run_id: minted-cau-hinh-theo-san-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:52:31Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55371.678417

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-cau-hinh-theo-san-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T08:52:31Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cau-hinh-theo-san-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T08:52:31Z

- cmd: npm run test:hooks
  run_id: minted-cau-hinh-theo-san-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T08:52:31Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-cau-hinh-theo-san-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-04T08:52:31Z

- cmd: npm run typecheck
  run_id: minted-cau-hinh-theo-san-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T08:52:31Z

- cmd: npm run lint
  run_id: minted-cau-hinh-theo-san-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T08:52:31Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên code hiện tại lẫn baseline diffBase) — cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý:

- `npm run db:migrate && npm run db:test` — E1, E2, E3, E4, E5a, E5c, E6, E7, E8, E9
- `npm test -w @quy-hang/core` — E5b

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic).

## Iterations

Round 1: mọi eval và lệnh suite đều xanh; không có eval hỏng. Verdict PASS.
