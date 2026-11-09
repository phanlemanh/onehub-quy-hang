---
schema_version: 2
feature_slug: va-khuon-doan-sdt-ranh-gioi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 302fd55f9b9af3808475fbb5da94cc7178c72506
human_signoff: Manh Phan 2026-11-09
---

# Evidence Report: va-khuon-doan-sdt-ranh-gioi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:29:42Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 162.3845

- eval: E2
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-09T04:23:06Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:29:42Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 162.3845

- eval: E4
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:29:42Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 162.3845

- eval: E5
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:29:42Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 162.3845

- eval: E6
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:29:42Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 162.3845

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-09T04:29:42Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-09T04:29:42Z

- cmd: npm run test:hooks
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-09T04:29:42Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-09T04:29:42Z

- cmd: npm run typecheck
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-09T04:29:42Z

- cmd: npm run lint
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-09T04:29:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval khong-phan-biet (pass tren ca HEAD lan baseline — chung minh harness, can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- npm test -w @quy-hang/connect — E1, E3, E4, E5, E6
- npm test -w @quy-hang/core — E2

## Variance

none — every multi-run eval is uniform

## Iterations

Round 3: E1, E3, E4, E5, E6 chay lai va xanh; E2 carry-forward tu round 2 (delta khong cham paths cua eval); sáu lệnh suite hồi quy xanh.

### Re-pin lần 1 — 2026-11-09, do hoá cũ do gộp main sau chữ ký
run_id: repin-20261109T055125Z-31942
sha: 302fd55f9b9af3808475fbb5da94cc7178c72506 · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
