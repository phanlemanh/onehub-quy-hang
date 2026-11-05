---
schema_version: 2
feature_slug: va-gui-can-da-go
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e672ecbff8563948a1dce72e68f083102726754b
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
  run_id: minted-va-gui-can-da-go-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:14:54Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 60291.043334

- eval: E2
  run_id: minted-va-gui-can-da-go-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:14:54Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 60291.043334

- eval: E3
  run_id: minted-va-gui-can-da-go-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:14:54Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 60291.043334

- eval: E4
  run_id: minted-va-gui-can-da-go-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:14:54Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 60291.043334

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T05:14:54Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T05:14:54Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T05:14:54Z

- cmd: npm run test:hooks
  run_id: minted-va-gui-can-da-go-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T05:14:54Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T05:14:54Z

- cmd: npm run typecheck
  run_id: minted-va-gui-can-da-go-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T05:14:54Z

- cmd: npm run lint
  run_id: minted-va-gui-can-da-go-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T05:14:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline diffBase): lệnh `npm run db:migrate && npm run db:test` phủ E1, E2, E3, E4. Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, tất định).

## Iterations

Round 1: E1, E2, E3, E4 đều qua; bảy lệnh suite xanh. Không có hội đồng chấm (không có mục judgment). Phát hiện trong hợp đồng (AC-4) ghi ở review-findings.md.
