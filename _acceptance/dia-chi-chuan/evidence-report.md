---
schema_version: 2
feature_slug: dia-chi-chuan
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 72c92fa45fd6e2364fefa21ef0e287eb3eea0b6f
human_signoff: Manh Phan 2026-11-05
---

# Evidence Report: dia-chi-chuan

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
  run_id: minted-dia-chi-chuan-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E2
  run_id: minted-dia-chi-chuan-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E3
  run_id: minted-dia-chi-chuan-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E4
  run_id: minted-dia-chi-chuan-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E5
  run_id: minted-dia-chi-chuan-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E6
  run_id: minted-dia-chi-chuan-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E7
  run_id: minted-dia-chi-chuan-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E8
  run_id: minted-dia-chi-chuan-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

- eval: E9
  run_id: minted-dia-chi-chuan-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T13:15:02Z
  output: |
    npm test -w @quy-hang/core (1 lần chạy, 1 đạt)
    ℹ duration_ms 1492.091375

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-dia-chi-chuan-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T13:15:02Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dia-chi-chuan-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T13:15:02Z

- cmd: npm run test:hooks
  run_id: minted-dia-chi-chuan-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T13:15:02Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dia-chi-chuan-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T13:15:02Z

- cmd: npm run typecheck
  run_id: minted-dia-chi-chuan-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T13:15:02Z

- cmd: npm run lint
  run_id: minted-dia-chi-chuan-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T13:15:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả bản đầu lẫn bản nền diffBase; chứng minh bộ chạy chứ chưa chứng minh tính năng — nên viết lại để assert hành vi mới hoặc xác nhận là lớp chặn hồi quy có chủ ý): E1, E2, E3, E4, E5, E6, E7, E8, E9 (cùng lệnh npm test -w @quy-hang/core, baseline green).

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: E1-E9 đạt, lệnh suite đạt; verdict PASS.

### Re-pin lần 1 — 2026-11-05, do gộp main vào nhánh để gỡ xung đột PR #138
run_id: repin-20261105T132554Z-82084
sha: 72c92fa45fd6e2364fefa21ef0e287eb3eea0b6f · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng
