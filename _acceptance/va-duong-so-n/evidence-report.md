---
schema_version: 2
feature_slug: va-duong-so-n
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 120d84505a7e076bcbfa6d0e0f246ca7e6dd8c1c
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: va-duong-so-n

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-duong-so-n-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:47:13Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 835.866584
    ca «AC-1 tách số nhà trước đường số» xanh

- eval: E2
  run_id: minted-va-duong-so-n-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:47:13Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 835.866584
    ca «AC-2 đường số không kèm số nhà» xanh

- eval: E3
  run_id: minted-va-duong-so-n-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:47:13Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 835.866584
    ca «AC-3 khác đường khác khoá» xanh

- eval: E4
  run_id: minted-va-duong-so-n-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:47:13Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 835.866584
    ca «AC-4 cùng đường cùng khoá» xanh

- eval: E5
  run_id: minted-va-duong-so-n-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:47:13Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 835.866584
    ca «AC-5 khoá cũ không đổi» xanh

- eval: E6
  run_id: minted-va-duong-so-n-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T23:47:13Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 835.866584
    ca «AC-6 chữ cái D đứng một mình không phải tiền tố đường» xanh

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-duong-so-n-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T23:47:13Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-duong-so-n-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T23:47:13Z

- cmd: npm run test:hooks
  run_id: minted-va-duong-so-n-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T23:47:13Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-duong-so-n-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T23:47:13Z

- cmd: npm run typecheck
  run_id: minted-va-duong-so-n-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T23:47:13Z

- cmd: npm run lint
  run_id: minted-va-duong-so-n-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T23:47:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): lệnh `npm test -w @quy-hang/core` phủ E1, E2, E3, E4, E5, E6. Các eval này chứng minh bộ thử xanh; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: E1-E5 xanh, verdict PASS; bốn mục ngoài hợp đồng được ghi vào review-findings.
Round 2: chủ kho duyệt lại phạm vi, thêm AC-6 (chữ cái «D» đứng một mình không phải tiền tố đường) và eval E6; E1-E6 và toàn bộ lệnh suite xanh, verdict PASS.
