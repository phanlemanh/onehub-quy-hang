---
schema_version: 2
feature_slug: doc-xa-thieu-mot-phan-dau
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9d45b311c779671631141cc89c94842febde26a9
human_signoff:
---

# Evidence Report: doc-xa-thieu-mot-phan-dau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-doc-xa-thieu-mot-phan-dau-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T16:42:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11716.64975

- eval: E2
  run_id: minted-doc-xa-thieu-mot-phan-dau-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T16:42:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11716.64975

- eval: E3
  run_id: minted-doc-xa-thieu-mot-phan-dau-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T16:42:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11716.64975

- eval: E4
  run_id: minted-doc-xa-thieu-mot-phan-dau-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T16:42:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11716.64975

- eval: E5
  run_id: minted-doc-xa-thieu-mot-phan-dau-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T16:42:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11716.64975

- eval: E6
  run_id: minted-doc-xa-thieu-mot-phan-dau-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T16:42:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11716.64975

- eval: E7
  run_id: minted-doc-xa-thieu-mot-phan-dau-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T16:42:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11716.64975

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-doc-xa-thieu-mot-phan-dau-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T16:42:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doc-xa-thieu-mot-phan-dau-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T16:42:20Z

- cmd: npm run test:hooks
  run_id: minted-doc-xa-thieu-mot-phan-dau-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T16:42:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doc-xa-thieu-mot-phan-dau-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T16:42:20Z

- cmd: npm run typecheck
  run_id: minted-doc-xa-thieu-mot-phan-dau-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T16:42:20Z

- cmd: npm run lint
  run_id: minted-doc-xa-thieu-mot-phan-dau-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T16:42:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline green trên cả hai phía (không phân biệt được trên code cũ): lệnh `npm test -w @quy-hang/core` gồm E1, E2, E3, E4, E5, E6, E7. Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E7 passed, no failures. Verdict PASS.


### Re-pin lần 1 — 2026-11-06, do gộp main sau lượt chấm
run_id: repin-20261106T165807Z-86053
sha: 1a45a93ab1cf3acc852d5e694187f8f7b0061f76 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-11-06, do gộp main sau #172
run_id: repin-20261106T173504Z-95069
sha: 9d45b311c779671631141cc89c94842febde26a9 · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng
