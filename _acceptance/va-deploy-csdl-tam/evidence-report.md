---
schema_version: 2
feature_slug: va-deploy-csdl-tam
verdict: REJECT
failed_evals: ["E4","E5","E6"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f10f19a415a0d708f09bf5865274fc40ab2c5e6a
human_signoff:
---

# Evidence Report: va-deploy-csdl-tam

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | test | REJECT |
| E5 | AC-5 | test | REJECT |
| E6 | AC-6 | test | REJECT |
| E7 | AC-7 | script | PASS |

Lệnh thất bại không gắn riêng eval nào: không có. Lệnh `npm run db:migrate && npm run db:test` gắn với E4, E5, E6 và là lệnh duy nhất thất bại. Cả bộ chạy 489 ca: 487 đạt, 1 hỏng, 1 bỏ qua. Ca hỏng là «đường lõi mật khẩu đóng» trong `test-db/dong-duong-gui-ma/dong-duong-gui-ma.test.ts` (kiểm «đường đăng ký tạo người», nhận 9 so với mong đợi 8). Ca này không nằm trong tệp `kiem-nhanh.test.mjs` mà E4 đến E6 nhắm tới. Vì ba eval dùng chung một lệnh nên cả ba bị tính hỏng theo lệnh đó.

## Evidence

- eval: E1
  run_id: minted-va-deploy-csdl-tam-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:43:39Z
  output: |
    KẾT: ĐẠT

- eval: E2
  run_id: minted-va-deploy-csdl-tam-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:43:39Z
  output: |
    KẾT: ĐẠT

- eval: E3
  run_id: minted-va-deploy-csdl-tam-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:43:39Z
  output: |
    KẾT: ĐẠT

- eval: E7
  run_id: minted-va-deploy-csdl-tam-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs
  verified_at: 2026-11-06T13:43:39Z
  output: |
    KẾT: ĐẠT

- eval: E4
  run_id: minted-va-deploy-csdl-tam-E4-r1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T13:43:39Z
  output: |
    tests 489, pass 487, fail 1, skipped 1
    ca hỏng: «đường lõi mật khẩu đóng» (dong-duong-gui-ma.test.ts) — đường đăng ký tạo người: 9 !== 8
    lệnh test:db của @quy-hang/api kết thúc lỗi

- eval: E5
  run_id: minted-va-deploy-csdl-tam-E5-r1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T13:43:39Z
  output: |
    tests 489, pass 487, fail 1, skipped 1
    ca hỏng: «đường lõi mật khẩu đóng» (dong-duong-gui-ma.test.ts) — đường đăng ký tạo người: 9 !== 8
    lệnh test:db của @quy-hang/api kết thúc lỗi

- eval: E6
  run_id: minted-va-deploy-csdl-tam-E6-r1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T13:43:39Z
  output: |
    tests 489, pass 487, fail 1, skipped 1
    ca hỏng: «đường lõi mật khẩu đóng» (dong-duong-gui-ma.test.ts) — đường đăng ký tạo người: 9 !== 8
    lệnh test:db của @quy-hang/api kết thúc lỗi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T13:43:39Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T13:43:39Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T13:43:39Z

- cmd: npm run test:hooks
  run_id: minted-va-deploy-csdl-tam-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T13:43:39Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-deploy-csdl-tam-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T13:43:39Z

- cmd: npm run typecheck
  run_id: minted-va-deploy-csdl-tam-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T13:43:39Z

- cmd: npm run lint
  run_id: minted-va-deploy-csdl-tam-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T13:43:39Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do
- node _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs: bo qua baseline: tep _acceptance/va-deploy-csdl-tam/thu/kiem-ci.mjs co o cay dang kiem nhung chua co o merge-base 93d28d6d3905c263d28f1628d1e5df9d41b8ea4a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E4, E5, E6 failed — lệnh `npm run db:migrate && npm run db:test` có một ca hỏng («đường lõi mật khẩu đóng», đường đăng ký tạo người nhận 9 so với mong đợi 8). Returned to implementation.
