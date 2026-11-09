---
schema_version: 2
feature_slug: va-khuon-doan-sdt-ranh-gioi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96e43ab0e3ecae5d414bb968904d23ba63793fa6
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
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:23:06Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 165.805042

- eval: E2
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-09T04:23:06Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 12323.940709

- eval: E3
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:23:06Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 165.805042

- eval: E4
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:23:06Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 165.805042

- eval: E5
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:23:06Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 165.805042

- eval: E6
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T04:23:06Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 165.805042

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T04:23:06Z

- cmd: npm run test:hooks
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T04:23:06Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T04:23:06Z

- cmd: npm run typecheck
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-09T04:23:06Z

- cmd: npm run lint
  run_id: minted-va-khuon-doan-sdt-ranh-gioi-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T04:23:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline), chứng minh harness chứ chưa chứng minh feature. Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý:

- `npm test -w @quy-hang/connect` — E1, E3, E4, E5, E6 (baseline green)
- `npm test -w @quy-hang/core` — E2 (baseline green)

Lệnh suite xanh cả hai phía (api, test:hooks, ui-lint, typecheck, lint) là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định)

## Iterations

Round 1: lịch sử round trước nằm ở run-log, không đưa vào đầu vào lượt này.
Round 2: E1, E2, E3, E4, E5, E6 đều đạt; toàn bộ lệnh suite xanh. Một phát hiện trong hợp đồng (AC-3, mức thấp, khoảng hở của phép đo) và hai phát hiện ngoài hợp đồng được ghi ở review-findings.md.
