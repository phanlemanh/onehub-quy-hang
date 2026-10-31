---
schema_version: 2
feature_slug: dong-duong-gui-ma-thua
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9815744d3b7c057a8cd3b717488b8eee190c1be8
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: dong-duong-gui-ma-thua

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-dong-duong-gui-ma-thua-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:03:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2362.312333

- eval: E2
  run_id: minted-dong-duong-gui-ma-thua-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:03:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2362.312333

- eval: E3
  run_id: minted-dong-duong-gui-ma-thua-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:03:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2362.312333

- eval: E4
  run_id: minted-dong-duong-gui-ma-thua-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T13:03:44Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60581.874583

- eval: E5
  run_id: minted-dong-duong-gui-ma-thua-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:03:44Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2362.312333

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dong-duong-gui-ma-thua-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T13:03:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dong-duong-gui-ma-thua-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T13:03:44Z

- cmd: npm run test:hooks
  run_id: minted-dong-duong-gui-ma-thua-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T13:03:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dong-duong-gui-ma-thua-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T13:03:44Z

- cmd: npm run typecheck
  run_id: minted-dong-duong-gui-ma-thua-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T13:03:44Z

- cmd: npm run lint
  run_id: minted-dong-duong-gui-ma-thua-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T13:03:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline):
- Lệnh `npm run db:migrate && npm run db:test`: E1, E2, E3, E5
- Lệnh `npm test -w @quy-hang/api`: E4

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval E1-E5 đạt, các lệnh suite hồi quy xanh. Verdict PASS.
