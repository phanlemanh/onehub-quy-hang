---
schema_version: 2
feature_slug: nhan-danh-muc-invest
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5434f6c0d5d2219672e5e842b68d72595dce1f9e
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

## Analyst

Eval xanh ở cả code mới lẫn baseline (không phân biệt, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý): E4, E5, E6, E7, E8, E9, E11, E12 (cùng lệnh `npm run db:migrate && npm run db:test`, baseline green).

## Evidence

- eval: E1
  run_id: minted-nhan-danh-muc-invest-E1-r1
  exit_code: 0
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-nhan-danh-muc-invest-E2-r1
  exit_code: 0
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-nhan-danh-muc-invest-E3-r1
  exit_code: 0
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-nhan-danh-muc-invest-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

- eval: E5
  run_id: minted-nhan-danh-muc-invest-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

- eval: E6
  run_id: minted-nhan-danh-muc-invest-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

- eval: E7
  run_id: minted-nhan-danh-muc-invest-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

- eval: E8
  run_id: minted-nhan-danh-muc-invest-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

- eval: E9
  run_id: minted-nhan-danh-muc-invest-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

- eval: E10
  run_id: minted-nhan-danh-muc-invest-E10-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-01T00:16:19Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-nhan-danh-muc-invest-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

- eval: E12
  run_id: minted-nhan-danh-muc-invest-E12-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:45:56Z
  output: |
    ℹ duration_ms 5890.190333

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T00:45:56Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-01T00:45:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T00:45:56Z

- cmd: npm run test:hooks
  run_id: minted-nhan-danh-muc-invest-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T00:45:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-01T00:45:56Z

- cmd: npm run typecheck
  run_id: minted-nhan-danh-muc-invest-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-01T00:45:56Z

- cmd: npm run lint
  run_id: minted-nhan-danh-muc-invest-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-01T00:45:56Z

## Known limits

## Ngoài hợp đồng

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E10 passed; các eval còn lại được sửa và chạy lại ở round 2.
Round 2: E4-E9, E11, E12 chạy lại sau migration 014, mọi eval và lệnh suite xanh; E1, E2, E3, E10 carry-forward từ round 1.
