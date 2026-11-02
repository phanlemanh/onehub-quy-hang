---
schema_version: 2
feature_slug: va-ma-can-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8be4e55fd1b5e8dac0032eafeb6eef4fffe84e76
human_signoff: Manh Phan 2026-11-03
---

# Evidence Report: va-ma-can-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-ma-can-lead-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T21:21:16Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 213.091125
    lệnh kết thúc thành công

- eval: E2
  run_id: minted-va-ma-can-lead-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T21:21:16Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 41711.588459
    lệnh kết thúc thành công

- eval: E3
  run_id: minted-va-ma-can-lead-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T21:21:16Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 41711.588459
    lệnh kết thúc thành công

- eval: E4
  run_id: minted-va-ma-can-lead-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T21:21:16Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 41711.588459
    lệnh kết thúc thành công

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ma-can-lead-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T21:21:16Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ma-can-lead-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T21:21:16Z

- cmd: npm run test:hooks
  run_id: minted-va-ma-can-lead-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T21:21:16Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ma-can-lead-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T21:21:16Z

- cmd: npm run typecheck
  run_id: minted-va-ma-can-lead-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T21:21:16Z

- cmd: npm run lint
  run_id: minted-va-ma-can-lead-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-02T21:21:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline — chứng minh khung chạy chứ chưa chứng minh tính năng; nên viết lại để khẳng định hành vi mới, hoặc xác nhận là rào hồi quy có chủ ý):
- npm test -w @quy-hang/core — E1
- npm run db:migrate && npm run db:test — E2, E3, E4

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4 đều đạt; không eval nào đỏ.

### Re-pin lần 1 — 2026-11-02, do gộp main lần một sau chữ ký (#92)
run_id: repin-20261102T213938Z-69196
sha: 8be4e55fd1b5e8dac0032eafeb6eef4fffe84e76 · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng
