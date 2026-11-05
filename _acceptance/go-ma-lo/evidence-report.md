---
schema_version: 2
feature_slug: go-ma-lo
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a995f4149ff761e29a5923960e42e54baf0d3af3
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
  run_id: minted-go-ma-lo-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E2
  run_id: minted-go-ma-lo-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E3
  run_id: minted-go-ma-lo-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E4
  run_id: minted-go-ma-lo-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E5
  run_id: minted-go-ma-lo-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E6
  run_id: minted-go-ma-lo-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E7
  run_id: minted-go-ma-lo-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E8
  run_id: minted-go-ma-lo-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1022.426459

- eval: E9
  run_id: minted-go-ma-lo-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-11-05T16:02:11Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60967.409625

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-go-ma-lo-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T16:02:11Z

- cmd: npm run test:hooks
  run_id: minted-go-ma-lo-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T16:02:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-go-ma-lo-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T16:02:11Z

- cmd: npm run typecheck
  run_id: minted-go-ma-lo-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T16:02:11Z

- cmd: npm run lint
  run_id: minted-go-ma-lo-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T16:02:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: E1, E2, E3, E4, E5, E6, E7, E8, E9 (evals.yaml khong doi tu lan baseline cuoi, round 1; field baseline cua tung eval ghi n-a).

Eval KHONG-PHAN-BIET (pass tren ca HEAD lan baseline — carried tu round 1): lenh `npm test -w @quy-hang/core` (E1, E2, E3, E4, E5, E6, E7, E8) và lệnh `npm test -w @quy-hang/api` (E9). Cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: carried — lịch sử round 1 nằm ở evidence cũ; baseline đo ở round 1.
Round 2: E1–E9 đều xanh, năm lệnh suite xanh; không eval nào lỗi. Verdict PASS.
