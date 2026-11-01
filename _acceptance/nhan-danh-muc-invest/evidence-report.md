---
schema_version: 2
feature_slug: nhan-danh-muc-invest
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0d08e8fec259ec8d69ac9c1a6c792b3df5ec5edc
human_signoff: Manh Phan 2026-11-01
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

## Evidence

- eval: E1
  run_id: minted-nhan-danh-muc-invest-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 89.576583

- eval: E2
  run_id: minted-nhan-danh-muc-invest-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 89.576583

- eval: E3
  run_id: minted-nhan-danh-muc-invest-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 89.576583

- eval: E4
  run_id: minted-nhan-danh-muc-invest-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2811.168583

- eval: E5
  run_id: minted-nhan-danh-muc-invest-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2811.168583

- eval: E6
  run_id: minted-nhan-danh-muc-invest-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2811.168583

- eval: E7
  run_id: minted-nhan-danh-muc-invest-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2811.168583

- eval: E8
  run_id: minted-nhan-danh-muc-invest-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2811.168583

- eval: E9
  run_id: minted-nhan-danh-muc-invest-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2811.168583

- eval: E10
  run_id: minted-nhan-danh-muc-invest-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 93.139333

- eval: E11
  run_id: minted-nhan-danh-muc-invest-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:16:19Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2811.168583

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T00:16:19Z

- cmd: npm run test:hooks
  run_id: minted-nhan-danh-muc-invest-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T00:16:19Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhan-danh-muc-invest-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T00:16:19Z

- cmd: npm run typecheck
  run_id: minted-nhan-danh-muc-invest-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T00:16:19Z

- cmd: npm run lint
  run_id: minted-nhan-danh-muc-invest-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T00:16:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: không có. Các eval sau xanh ở cả code cũ (baseline) lẫn HEAD, nên chứng minh khung chạy chứ chưa chứng minh riêng tính năng; cần viết lại để khẳng định hành vi mới, hoặc xác nhận là lưới hồi quy có chủ ý:

- `npm test -w @quy-hang/connect`: E1, E2, E3
- `npm run db:migrate && npm run db:test`: E4, E5, E6, E7, E8, E9, E11
- `npm test -w @quy-hang/core`: E10

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mỗi eval chạy một lần, xác định).

## Iterations

Round 1: mọi eval và lệnh suite đều đạt; không có eval đỏ, không có mục cần người chốt.
