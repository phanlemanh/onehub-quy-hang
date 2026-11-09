---
schema_version: 2
feature_slug: va-khuon-doan-sdt-ranh-gioi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c4e134107ad7a46fbebc983614fb6c062c460997
human_signoff:
---

# Evidence Report: va-khuon-doan-sdt-ranh-gioi

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
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:15:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «khoá máy cấp: ma trận số điện thoại bị khuôn chặn» ok
    ℹ duration_ms 166.70125

- eval: E2
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-09T04:15:11Z
  output: |
    npm test -w @quy-hang/core
    ca «khoá máy cấp: ma trận số điện thoại bị hàm dựng chặn» ok
    ℹ duration_ms 11391.570584

- eval: E3
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:15:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «khoá dạng thật qua cả hai tầng» ok
    ℹ duration_ms 166.70125

- eval: E4
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:15:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «khoá máy cấp: đoạn đứng riêng 9 đến 11 chữ số» ok
    ℹ duration_ms 166.70125

- eval: E5
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:15:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «khoá máy cấp: số liền dính chữ giữ nguyên» ok
    ℹ duration_ms 166.70125

- eval: E6
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:15:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «khoá máy cấp: có dấu tách dính chữ bị chặn» ok
    ℹ duration_ms 166.70125

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T04:15:11Z

- cmd: npm run test:hooks
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T04:15:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T04:15:11Z

- cmd: npm run typecheck
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T04:15:11Z

- cmd: npm run lint
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T04:15:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): E1, E3, E4, E5, E6 (lệnh npm test -w @quy-hang/connect) và E2 (lệnh npm test -w @quy-hang/core). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E6 đều xanh, các lệnh suite đều xanh; không eval nào đỏ. Verdict PASS.
