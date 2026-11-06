---
schema_version: 2
feature_slug: va-deploy-csdl-tam
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 358da7e98a0966c56bb9c5956449b31a31b4b7a3
human_signoff:
---

# Evidence Report: va-deploy-csdl-tam

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-deploy-csdl-tam-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:50:35Z
  output: |
    lệnh: node _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
    KẾT: ĐẠT

- eval: E2
  run_id: minted-va-deploy-csdl-tam-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:50:35Z
  output: |
    lệnh: node _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
    KẾT: ĐẠT

- eval: E3
  run_id: minted-va-deploy-csdl-tam-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:50:35Z
  output: |
    lệnh: node _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
    KẾT: ĐẠT

- eval: E4
  run_id: minted-va-deploy-csdl-tam-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T13:50:35Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 116354.186917

- eval: E5
  run_id: minted-va-deploy-csdl-tam-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T13:50:35Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 116354.186917

- eval: E6
  run_id: minted-va-deploy-csdl-tam-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T13:50:35Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 116354.186917

- eval: E7
  run_id: minted-va-deploy-csdl-tam-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:50:35Z
  output: |
    lệnh: node _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
    KẾT: ĐẠT

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-06T13:50:35Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T13:50:35Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T13:50:35Z

- cmd: npm run test:hooks
  run_id: minted-va-deploy-csdl-tam-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T13:50:35Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T13:50:35Z

- cmd: npm run typecheck
  run_id: minted-va-deploy-csdl-tam-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-06T13:50:35Z

- cmd: npm run lint
  run_id: minted-va-deploy-csdl-tam-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-06T13:50:35Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code hiện tại lẫn baseline):
- npm run db:migrate && npm run db:test: E4, E5, E6

Baseline không đo
- node _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs: bo qua baseline: tep _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs co o cay dang kiem nhung chua co o merge-base 93d28d6d3905c263d28f1628d1e5df9d41b8ea4a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: số đo lượt 1 đã ghi; evals.yaml được sửa cho đọc lại được (S4-r1), rồi trở lại chấm.
Round 2: E1 đến E7 và mọi lệnh suite đều xanh; không còn eval hỏng.
