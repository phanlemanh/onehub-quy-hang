---
schema_version: 2
feature_slug: phien-dang-nhap-30-ngay
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6ea33401307f4829762c0d6d5a0ec1f3b7be82df
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: phien-dang-nhap-30-ngay

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-phien-dang-nhap-30-ngay-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:57:37Z
  output: |
    npm run db:migrate && npm run db:test
    ca "phiên: đăng nhập đặt cookie và hạn 30 ngày" ok
    duration_ms 1780.50525

- eval: E2
  run_id: minted-phien-dang-nhap-30-ngay-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:57:37Z
  output: |
    npm run db:migrate && npm run db:test
    ca "phiên: dùng lại sau hơn một ngày thì trượt cả hai nơi" ok
    duration_ms 1780.50525

- eval: E3
  run_id: minted-phien-dang-nhap-30-ngay-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:57:37Z
  output: |
    npm run db:migrate && npm run db:test
    ca "phiên: dùng lại trong ngày không ghi gì" ok
    duration_ms 1780.50525

- eval: E4
  run_id: minted-phien-dang-nhap-30-ngay-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:57:37Z
  output: |
    npm run db:migrate && npm run db:test
    ca "phiên: quá hạn thì như chưa đăng nhập" ok
    duration_ms 1780.50525

- eval: E5
  run_id: minted-phien-dang-nhap-30-ngay-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:57:37Z
  output: |
    npm run db:migrate && npm run db:test
    ca "mở trang: bước chặn đầu đặt lại cookie khi phiên đã hơn một ngày" ok
    ca "mở trang: bản https đặt lại cookie __Secure-" ok
    duration_ms 1780.50525

- eval: E6
  run_id: minted-phien-dang-nhap-30-ngay-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T08:57:37Z
  output: |
    npm test -w @quy-hang/api
    ca "phiên: createAuth khai 30 ngày, làm mới mỗi ngày" ok
    duration_ms 60373.21275

- eval: E7
  run_id: minted-phien-dang-nhap-30-ngay-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T08:57:37Z
  output: |
    npm test -w @quy-hang/api
    ca "phiên: ADR-0005 và Tham chiếu ghi đúng số của mã" ok
    duration_ms 60373.21275

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-phien-dang-nhap-30-ngay-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T08:57:37Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-phien-dang-nhap-30-ngay-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T08:57:37Z

- cmd: npm run test:hooks
  run_id: minted-phien-dang-nhap-30-ngay-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T08:57:37Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-phien-dang-nhap-30-ngay-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T08:57:37Z

- cmd: npm run typecheck
  run_id: minted-phien-dang-nhap-30-ngay-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T08:57:37Z

- cmd: npm run lint
  run_id: minted-phien-dang-nhap-30-ngay-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T08:57:37Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm run db:migrate && npm run db:test — E1, E2, E3, E4, E5
- npm test -w @quy-hang/api — E6, E7

## Variance

none — mọi eval chạy một lần, xác định, đồng nhất.

## Iterations

Round 1: E1-E7 đều đạt, không eval nào hỏng; verdict PASS.
