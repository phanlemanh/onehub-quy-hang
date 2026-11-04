---
schema_version: 2
feature_slug: ghi-thiet-bi-va-mat-mang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 61493620af3181549a4d4c3bd4acb1ee7608d379
human_signoff: Manh Phan 2026-11-04
---

# Evidence Report: ghi-thiet-bi-va-mat-mang

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
  run_id: minted-ghi-thiet-bi-va-mat-mang-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 44439.712167

- eval: E2
  run_id: minted-ghi-thiet-bi-va-mat-mang-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 44439.712167

- eval: E3
  run_id: minted-ghi-thiet-bi-va-mat-mang-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 44439.712167

- eval: E4
  run_id: minted-ghi-thiet-bi-va-mat-mang-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 44439.712167

- eval: E5
  run_id: minted-ghi-thiet-bi-va-mat-mang-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1776.499625

- eval: E6
  run_id: minted-ghi-thiet-bi-va-mat-mang-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1776.499625

- eval: E7
  run_id: minted-ghi-thiet-bi-va-mat-mang-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1776.499625

- eval: E8
  run_id: minted-ghi-thiet-bi-va-mat-mang-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 342.802959

- eval: E9
  run_id: minted-ghi-thiet-bi-va-mat-mang-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 342.802959

- eval: E10
  run_id: minted-ghi-thiet-bi-va-mat-mang-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-03T15:41:26Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 2243.232583

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-ghi-thiet-bi-va-mat-mang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-03T15:41:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ghi-thiet-bi-va-mat-mang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-03T15:41:26Z

- cmd: npm run test:hooks
  run_id: minted-ghi-thiet-bi-va-mat-mang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-03T15:41:26Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ghi-thiet-bi-va-mat-mang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-03T15:41:26Z

- cmd: npm run typecheck
  run_id: minted-ghi-thiet-bi-va-mat-mang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-03T15:41:26Z

- cmd: npm run lint
  run_id: minted-ghi-thiet-bi-va-mat-mang-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-03T15:41:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline diffBase; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm run db:migrate && npm run db:test — E1, E2, E3, E4
- npm test -w @quy-hang/web — E5, E6, E7
- npm test -w @quy-hang/core — E8, E9
- npm run test:db -w @quy-hang/web — E10

Không có hội đồng chấm judgment nào (không eval judgment); không có mục chờ người.

## Variance

none — every multi-run eval is uniform (mọi eval chạy 1 lần, xác định, không có phương sai)

## Iterations

Round 1: E1-E10 đều xanh, không eval nào hỏng; verdict PASS.
