---
schema_version: 2
feature_slug: so-diem-bien-thien
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9c5c341aad908d69f06852508a1efb38c856c61a
human_signoff:
---

# Evidence Report: so-diem-bien-thien

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
| E9b | AC-9 | test | PASS |
| E9c | AC-9 | test | PASS |
| E9d | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-so-diem-bien-thien-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E2
  run_id: minted-so-diem-bien-thien-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E3
  run_id: minted-so-diem-bien-thien-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E4
  run_id: minted-so-diem-bien-thien-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E5
  run_id: minted-so-diem-bien-thien-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E6
  run_id: minted-so-diem-bien-thien-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E7
  run_id: minted-so-diem-bien-thien-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E8
  run_id: minted-so-diem-bien-thien-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E9
  run_id: minted-so-diem-bien-thien-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 455.143958

- eval: E9b
  run_id: minted-so-diem-bien-thien-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60639.17

- eval: E9c
  run_id: minted-so-diem-bien-thien-E9c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 77.455459

- eval: E9d
  run_id: minted-so-diem-bien-thien-E9d-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-04T02:22:33Z
  output: |
    npm run typecheck
    (không có lỗi kiểu)

### Lệnh suite (hồi quy)

- cmd: npm run test:hooks
  run_id: minted-so-diem-bien-thien-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T02:22:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-so-diem-bien-thien-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T02:22:33Z

- cmd: npm run lint
  run_id: minted-so-diem-bien-thien-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-04T02:22:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1), nen round nay khong do lai; field baseline cua moi eval ghi n-a.

Eval khong-phan-biet (xanh tren ca HEAD lan baseline, carried tu round 1): E1, E2, E3, E4, E5, E6, E7, E8, E9 (npm test -w @quy-hang/core), E9b (npm test -w @quy-hang/api), E9c (npm test -w @quy-hang/connect), E9d (npm run typecheck). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: baseline đã đo (carried sang round 2); chi tiết round cũ xem lịch sử hồ sơ.
Round 2: toàn bộ eval E1-E9, E9b, E9c, E9d và ba lệnh suite xanh; verdict PASS.
