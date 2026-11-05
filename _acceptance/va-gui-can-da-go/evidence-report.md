---
schema_version: 2
feature_slug: va-gui-can-da-go
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 29443942586eb06b59b6b2ff423531a665baee17
human_signoff:
---

# Evidence Report: va-gui-can-da-go

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-gui-can-da-go-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:20:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 78147.075791

- eval: E2
  run_id: minted-va-gui-can-da-go-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:20:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 78147.075791

- eval: E3
  run_id: minted-va-gui-can-da-go-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:20:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 78147.075791

- eval: E4
  run_id: minted-va-gui-can-da-go-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:20:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 78147.075791

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T05:20:56Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T05:20:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T05:20:56Z

- cmd: npm run test:hooks
  run_id: minted-va-gui-can-da-go-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T05:20:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T05:20:56Z

- cmd: npm run typecheck
  run_id: minted-va-gui-can-da-go-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T05:20:56Z

- cmd: npm run lint
  run_id: minted-va-gui-can-da-go-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T05:20:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval KHONG-PHAN-BIET (pass tren CA HEAD lan baseline): lenh `npm run db:migrate && npm run db:test` phu E1, E2, E3, E4. Can viet lai de assert hanh vi moi, hoac xac nhan day la regression-guard co chu y.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: AC-4 co 4 phat hien trong hop dong (ca E4 khong chay migrate lan hai, phep dem 037 luon bang 1, search_path chi kiem co khoa). Returned to implementation.
Round 2: E1-E4 va 7 lenh suite deu xanh o commit 29443942; E4 da chay migrate lan hai va kiem search_path rong.
