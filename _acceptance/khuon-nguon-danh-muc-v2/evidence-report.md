---
schema_version: 2
feature_slug: khuon-nguon-danh-muc-v2
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 798b05da501a398640095469f8cc227a5c37f781
human_signoff: Manh Phan 2026-11-09
---

# Evidence Report: khuon-nguon-danh-muc-v2

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-7 | test | PASS |
| E10 | AC-8 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |
| E13 | AC-11 | test | PASS |
| E14 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-khuon-nguon-danh-muc-v2-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 3798.584208

- eval: E2
  run_id: minted-khuon-nguon-danh-muc-v2-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 3798.584208

- eval: E6
  run_id: minted-khuon-nguon-danh-muc-v2-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 3798.584208

- eval: E9
  run_id: minted-khuon-nguon-danh-muc-v2-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 3798.584208

- eval: E10
  run_id: minted-khuon-nguon-danh-muc-v2-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 3798.584208

- eval: E13
  run_id: minted-khuon-nguon-danh-muc-v2-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 3798.584208

- eval: E3
  run_id: minted-khuon-nguon-danh-muc-v2-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 168.852084

- eval: E4
  run_id: minted-khuon-nguon-danh-muc-v2-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 168.852084

- eval: E5
  run_id: minted-khuon-nguon-danh-muc-v2-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 168.852084

- eval: E7
  run_id: minted-khuon-nguon-danh-muc-v2-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 168.852084

- eval: E8
  run_id: minted-khuon-nguon-danh-muc-v2-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 168.852084

- eval: E12
  run_id: minted-khuon-nguon-danh-muc-v2-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 168.852084

- eval: E14
  run_id: minted-khuon-nguon-danh-muc-v2-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 168.852084

- eval: E11
  run_id: minted-khuon-nguon-danh-muc-v2-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_cach_ly
  verified_at: 2026-11-09T14:32:18Z
  output: |
    ℹ duration_ms 3230.443084

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T14:32:18Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T14:32:18Z

- cmd: npm run test:hooks
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T14:32:18Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T14:32:18Z

- cmd: npm run typecheck
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-09T14:32:18Z

- cmd: npm run lint
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T14:32:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1), nen moi block eval ghi baseline n-a. Khong co eval nao duoc liet ke la khong-phan-biet trong round nay.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm 1 có bảy phát hiện, đã sửa ở commit 798b05da. Returned to implementation.
Round 2: toàn bộ eval máy và lệnh suite xanh. Verdict PASS.
