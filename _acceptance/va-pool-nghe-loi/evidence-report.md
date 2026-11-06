---
schema_version: 2
feature_slug: va-pool-nghe-loi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1c3144102c2b4f42f1f7bb384758fc6535a02009
human_signoff:
---

# Evidence Report: va-pool-nghe-loi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-6 | script | PASS |
| E9 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-pool-nghe-loi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T05:41:24Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3404.149083

- eval: E2
  run_id: minted-va-pool-nghe-loi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T05:41:24Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3404.149083

- eval: E3
  run_id: minted-va-pool-nghe-loi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_nghe_loi
  verified_at: 2026-11-06T05:41:24Z
  output: |
    node --import tsx --test "_acceptance/va-pool-nghe-loi/thu/*.test.mjs"
    ℹ duration_ms 42870.33775

- eval: E4
  run_id: minted-va-pool-nghe-loi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_nghe_loi
  verified_at: 2026-11-06T05:41:24Z
  output: |
    node --import tsx --test "_acceptance/va-pool-nghe-loi/thu/*.test.mjs"
    ℹ duration_ms 42870.33775

- eval: E5
  run_id: minted-va-pool-nghe-loi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-06T05:41:24Z
  output: |
    npm run typecheck
    (không lỗi kiểu ở mọi gói)

- eval: E6
  run_id: minted-va-pool-nghe-loi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-06T05:41:24Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E7
  run_id: minted-va-pool-nghe-loi-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.build
  verified_at: 2026-11-06T05:41:24Z
  output: |
    npm run build
    (next build hoàn tất)

- eval: E8
  run_id: minted-va-pool-nghe-loi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_nghe_loi
  verified_at: 2026-11-06T05:41:24Z
  output: |
    node --import tsx --test "_acceptance/va-pool-nghe-loi/thu/*.test.mjs"
    ℹ duration_ms 42870.33775

- eval: E9
  run_id: minted-va-pool-nghe-loi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_nghe_loi
  verified_at: 2026-11-06T05:41:24Z
  output: |
    node --import tsx --test "_acceptance/va-pool-nghe-loi/thu/*.test.mjs"
    ℹ duration_ms 42870.33775

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-pool-nghe-loi-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T05:41:24Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-pool-nghe-loi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T05:41:24Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-pool-nghe-loi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T05:41:24Z

- cmd: npm run test:hooks
  run_id: minted-va-pool-nghe-loi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T05:41:24Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-pool-nghe-loi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T05:41:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code hiện tại lẫn baseline):
- E1, E2 (lệnh `npm test -w @quy-hang/web`)
- E3, E4, E8, E9 (lệnh `node --import tsx --test "_acceptance/va-pool-nghe-loi/thu/*.test.mjs"`)
- E5 (lệnh `npm run typecheck`)
- E6 (lệnh `npm run lint`)

Các lệnh trên xanh ở baseline vì chạy cả bộ kiểm, tệp kiểm mới của tính năng chưa có trên điểm rẽ nên baseline không chứng minh được gì về chúng. Cần người xác nhận đây là regression-guard có chủ ý hoặc viết lại để khẳng định hành vi mới. E7 đỏ trên baseline (có phân biệt).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh, không có mục chờ phán xét, không có phương sai.
