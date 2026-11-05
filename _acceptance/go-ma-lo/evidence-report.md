---
schema_version: 2
feature_slug: go-ma-lo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c8da5f24ba8e1e3a661f47b9a6c2dfe97f3861b9
human_signoff:
---

# Evidence Report: go-ma-lo

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

## Evidence

- eval: E1
  run_id: minted-go-ma-lo-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E2
  run_id: minted-go-ma-lo-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E3
  run_id: minted-go-ma-lo-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E4
  run_id: minted-go-ma-lo-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E5
  run_id: minted-go-ma-lo-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E6
  run_id: minted-go-ma-lo-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E7
  run_id: minted-go-ma-lo-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E8
  run_id: minted-go-ma-lo-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/core, một lần chạy, đạt 1/1, không phương sai
    duration_ms 1069.925625

- eval: E9
  run_id: minted-go-ma-lo-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-05T14:56:02Z
  output: |
    npm test -w @quy-hang/api, một lần chạy, đạt 1/1, không phương sai
    duration_ms 60849.904292

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-go-ma-lo-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T14:56:02Z

- cmd: npm run test:hooks
  run_id: minted-go-ma-lo-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T14:56:02Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-go-ma-lo-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T14:56:02Z

- cmd: npm run typecheck
  run_id: minted-go-ma-lo-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T14:56:02Z

- cmd: npm run lint
  run_id: minted-go-ma-lo-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T14:56:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E1, E2, E3, E4, E5, E6, E7, E8
- npm test -w @quy-hang/api: E9

## Variance

none — mọi eval nhiều lần chạy đều đồng đều (mọi eval chạy một lần, xác định)

## Iterations

Round 1: mọi eval E1-E9 và các lệnh suite đều đạt. Không có mục cần người phán xét.
