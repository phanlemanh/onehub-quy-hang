---
schema_version: 2
feature_slug: va-dang-nhap-mat-khau
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 63d2d10a08617062ecb2d1bd29230aa4dc092d87
human_signoff:
---

# Evidence Report: va-dang-nhap-mat-khau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-1 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | script | PASS |
| E12 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-dang-nhap-mat-khau-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 83302.578166

- eval: E2
  run_id: minted-va-dang-nhap-mat-khau-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 83302.578166

- eval: E3
  run_id: minted-va-dang-nhap-mat-khau-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 83302.578166

- eval: E4
  run_id: minted-va-dang-nhap-mat-khau-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 83302.578166

- eval: E5
  run_id: minted-va-dang-nhap-mat-khau-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 83302.578166

- eval: E6
  run_id: minted-va-dang-nhap-mat-khau-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 83302.578166

- eval: E7
  run_id: minted-va-dang-nhap-mat-khau-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2669.536834

- eval: E8
  run_id: minted-va-dang-nhap-mat-khau-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_dang_nhap_mat_khau
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: node --test "_acceptance/va-dang-nhap-mat-khau/thu/*.test.mjs"
    các ca migration và tài liệu đạt

- eval: E9
  run_id: minted-va-dang-nhap-mat-khau-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run typecheck
    không dòng lỗi kiểu

- eval: E10
  run_id: minted-va-dang-nhap-mat-khau-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run lint
    chuẩn giao diện: đạt

- eval: E11
  run_id: minted-va-dang-nhap-mat-khau-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.build
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: npm run build
    build xong không lỗi

- eval: E12
  run_id: minted-va-dang-nhap-mat-khau-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T07:54:41Z
  output: |
    lệnh: design-floor-khuon.mjs --kiem --root .
    3 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T07:54:41Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T07:54:41Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T07:54:41Z

- cmd: npm run test:hooks
  run_id: minted-va-dang-nhap-mat-khau-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T07:54:41Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T07:54:41Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline; chứng minh harness chứ chưa chứng minh tính năng, hoặc là regression-guard có chủ ý):
- E7 (npm test -w @quy-hang/web)
- E8 (node --test _acceptance/va-dang-nhap-mat-khau/thu/*.test.mjs)
- E10 (npm run lint)
- E12 (design-floor-khuon --kiem)

Lệnh fail không gắn eval: không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval E1-E12 đạt; không eval nào đỏ.
