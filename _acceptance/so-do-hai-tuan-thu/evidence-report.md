---
schema_version: 2
feature_slug: so-do-hai-tuan-thu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e63f5a58427fdf41e84376d7418191331d49e6f9
human_signoff: Manh Phan 2026-11-03
---

# Evidence Report: so-do-hai-tuan-thu

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
  run_id: minted-so-do-hai-tuan-thu-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E2
  run_id: minted-so-do-hai-tuan-thu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E3
  run_id: minted-so-do-hai-tuan-thu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E4
  run_id: minted-so-do-hai-tuan-thu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E5
  run_id: minted-so-do-hai-tuan-thu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E6
  run_id: minted-so-do-hai-tuan-thu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E7
  run_id: minted-so-do-hai-tuan-thu-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E8
  run_id: minted-so-do-hai-tuan-thu-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E9
  run_id: minted-so-do-hai-tuan-thu-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

- eval: E10
  run_id: minted-so-do-hai-tuan-thu-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:19:34Z
  output: |
    ℹ duration_ms 214.306041

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-so-do-hai-tuan-thu-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-03T12:19:34Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-so-do-hai-tuan-thu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-03T12:19:34Z

- cmd: npm run test:hooks
  run_id: minted-so-do-hai-tuan-thu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-03T12:19:34Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-so-do-hai-tuan-thu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-03T12:19:34Z

- cmd: npm run typecheck
  run_id: minted-so-do-hai-tuan-thu-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-03T12:19:34Z

- cmd: npm run lint
  run_id: minted-so-do-hai-tuan-thu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-03T12:19:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (carried, chua do lai round nay): lenh `npm test -w @quy-hang/core` phu E1, E2, E3, E4, E5, E6, E7, E8, E9, E10 — cac eval nay chay chung mot lenh, ghi nhan la dau hieu harness; nguoi duyet xac nhan day la regression-guard co chu y hay can viet lai de assert hanh vi moi. Baseline khong do: ca muoi eval (round nay khong do, baseline: n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lenh suite npm run lint do. Returned to implementation.
Round 2: moi eval va moi lenh suite xanh; verdict PASS.

### Re-pin lần 1 — 2026-11-03, do hoá cũ do gộp nhánh chính sau chữ ký
run_id: repin-20261103T135636Z-20944
sha: 8fec97c01e499983e1c1dfa07b37d5ab342e6499 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-11-04, do E8 thay bởi ghi-thiet-bi-va-mat-mang#AC-9 sau chữ ký hàng ấy
run_id: repin-20261104T002948Z-85574
sha: e63f5a58427fdf41e84376d7418191331d49e6f9 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E8 · thay bởi hồ sơ đã ký: E8→ghi-thiet-bi-va-mat-mang#AC-9 · AC không có chốt máy: AC-8
