---
schema_version: 2
feature_slug: nhan-danh-muc-invest
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 44a6cbd0fb24b0d6b7c50513a459fa14d0605e71
human_signoff:
---

# Evidence Report: nhan-danh-muc-invest

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
| E10 | AC-9 | test | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |

## Evidence

- eval: E8
  run_id: minted-nhan-danh-muc-invest-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:52:58Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5859.86625

- eval: E11
  run_id: minted-nhan-danh-muc-invest-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:52:58Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5859.86625

- eval: E12
  run_id: minted-nhan-danh-muc-invest-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:52:58Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 5859.86625

- eval: E1
  run_id: minted-nhan-danh-muc-invest-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-nhan-danh-muc-invest-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-nhan-danh-muc-invest-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-nhan-danh-muc-invest-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-nhan-danh-muc-invest-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-nhan-danh-muc-invest-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-nhan-danh-muc-invest-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-nhan-danh-muc-invest-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-nhan-danh-muc-invest-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-01T00:52:58Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-01T00:52:58Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-01T00:52:58Z

- cmd: npm run test:hooks
  run_id: minted-nhan-danh-muc-invest-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-01T00:52:58Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-01T00:52:58Z

- cmd: npm run typecheck
  run_id: minted-nhan-danh-muc-invest-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-01T00:52:58Z

- cmd: npm run lint
  run_id: minted-nhan-danh-muc-invest-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-01T00:52:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay.

Baseline khong do: moi eval (field baseline ghi n-a, round nay khong do lai).

Eval khong-phan-biet (pass tren ca HEAD lan baseline): lenh `npm run db:migrate && npm run db:test` phu cac eval E4, E5, E6, E7, E8, E9, E11, E12 — can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E10 chay lan dau; cac eval con lai quay lai sau khi sua.
Round 2: E4, E5, E6, E7, E9 chay lai sau khi sua; carry E1, E2, E3, E10 tu round 1.
Round 3: E8, E11, E12 chay lai (sua danh muc dung chung chi cho san doc dong tin cua minh, an ma thoa thuan; migration 014) cung toan bo lenh suite; E1-E7, E9, E10 carry-forward.
