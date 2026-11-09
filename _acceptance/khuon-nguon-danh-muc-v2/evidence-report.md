---
schema_version: 2
feature_slug: khuon-nguon-danh-muc-v2
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 82f64fa6fc79d1c3b5292ae86dae943b1a646a95
human_signoff:
---

# Evidence Report: khuon-nguon-danh-muc-v2

Round 1. Mọi lệnh máy đều xanh; REJECT đến từ các phát hiện TRONG hợp đồng (xem review-findings.md, mục «Trong hợp đồng»: AC-7 hai mục, AC-4, AC-5, AC-3, AC-9), không phải từ eval đỏ.

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
  run_id: minted-khuon-nguon-danh-muc-v2-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 5080.319083
    __EXIT=0

- eval: E2
  run_id: minted-khuon-nguon-danh-muc-v2-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 5080.319083
    __EXIT=0

- eval: E3
  run_id: minted-khuon-nguon-danh-muc-v2-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 188.493833
    __EXIT=0

- eval: E4
  run_id: minted-khuon-nguon-danh-muc-v2-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 188.493833
    __EXIT=0

- eval: E5
  run_id: minted-khuon-nguon-danh-muc-v2-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 188.493833
    __EXIT=0

- eval: E6
  run_id: minted-khuon-nguon-danh-muc-v2-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 5080.319083
    __EXIT=0

- eval: E7
  run_id: minted-khuon-nguon-danh-muc-v2-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 188.493833
    __EXIT=0

- eval: E8
  run_id: minted-khuon-nguon-danh-muc-v2-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 188.493833
    __EXIT=0

- eval: E9
  run_id: minted-khuon-nguon-danh-muc-v2-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 5080.319083
    __EXIT=0

- eval: E10
  run_id: minted-khuon-nguon-danh-muc-v2-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 5080.319083
    __EXIT=0

- eval: E11
  run_id: minted-khuon-nguon-danh-muc-v2-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.khuon_v2_cach_ly
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 3853.432833
    __EXIT=0

- eval: E12
  run_id: minted-khuon-nguon-danh-muc-v2-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 188.493833
    __EXIT=0

- eval: E13
  run_id: minted-khuon-nguon-danh-muc-v2-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 5080.319083
    __EXIT=0

- eval: E14
  run_id: minted-khuon-nguon-danh-muc-v2-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T14:21:25Z
  output: |
    ℹ duration_ms 188.493833
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T14:21:25Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T14:21:25Z

- cmd: npm run test:hooks
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T14:21:25Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T14:21:25Z

- cmd: npm run typecheck
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T14:21:25Z

- cmd: npm run lint
  run_id: minted-khuon-nguon-danh-muc-v2-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T14:21:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ chưa chứng minh feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- Lệnh khuon_v2_db (khuon-v2/*.test.ts và catalog/nhan-goi.test.ts): E1, E2, E6, E9, E10, E13.
- Lệnh connect (npm test -w @quy-hang/connect): E3, E4, E5, E7, E8, E12, E14.

E11 là eval duy nhất đỏ trên baseline (có phân biệt).

## Variance

none — mọi eval chạy một lần, đều xác định (runs: 1), không có eval phương sai.

## Iterations

Round 1: mọi eval máy xanh, nhưng có phát hiện trong hợp đồng chưa xử lý (AC-7 số điện thoại dính chữ và hai ca đo không ghim nguyên nhân, AC-4 mốc đo sai múi giờ thành 500, AC-5 khu thứ hai không có dữ liệu tin rao, AC-3 danh sách chín trường không viết trước, AC-9 ràng buộc field_confidence chưa duyệt đủ chín khoá). Trả về triển khai.
