---
schema_version: 2
feature_slug: rang-giu-khuon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2fc1a9bd3dd9b2a2bdc0d3d86a7169a77eca3236
human_signoff:
---

# Evidence Report: rang-giu-khuon

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-rang-giu-khuon-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 5838.155625

- eval: E2
  run_id: minted-rang-giu-khuon-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 5838.155625

- eval: E3
  run_id: minted-rang-giu-khuon-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 5838.155625

- eval: E4
  run_id: minted-rang-giu-khuon-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 5838.155625

- eval: E5
  run_id: minted-rang-giu-khuon-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 5838.155625

- eval: E6
  run_id: minted-rang-giu-khuon-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 5838.155625

- eval: E7b
  run_id: minted-rang-giu-khuon-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 5838.155625

- eval: E7
  run_id: minted-rang-giu-khuon-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-10-31T11:47:33Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-rang-giu-khuon-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T11:47:33Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-rang-giu-khuon-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T11:47:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-rang-giu-khuon-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T11:47:33Z

- cmd: npm run test:hooks
  run_id: minted-rang-giu-khuon-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T11:47:33Z

- cmd: npm run typecheck
  run_id: minted-rang-giu-khuon-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T11:47:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/ui-lint: E1, E2, E3, E4, E5, E6, E7b
- npm run lint: E7

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval xanh; verdict PASS, không có mục chờ người quyết trong hợp đồng.
