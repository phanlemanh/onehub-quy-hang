---
schema_version: 2
feature_slug: va-lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8f1ef23af45888c2d83fcf641217a0f65f22029c
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: va-lien-he

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-lien-he-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:53:20Z
  output: |
    npm run db:migrate && npm run db:test
    ba ca mới của bảng nối lead với hàng đều ok trong packages/db/tests/isolation.test.mjs
    ℹ duration_ms 6554.050041

- eval: E2
  run_id: minted-va-lien-he-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:53:20Z
  output: |
    npm run db:migrate && npm run db:test
    ca «chủ nhà của hàng tạo từ lead» trong packages/api/test-db/va-lien-he.test.ts ok
    ℹ duration_ms 6554.050041

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-lien-he-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T13:53:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-lien-he-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T13:53:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-lien-he-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T13:53:20Z

- cmd: npm run test:hooks
  run_id: minted-va-lien-he-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T13:53:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-lien-he-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T13:53:20Z

- cmd: npm run typecheck
  run_id: minted-va-lien-he-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T13:53:20Z

- cmd: npm run lint
  run_id: minted-va-lien-he-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T13:53:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): E1 và E2 (lệnh `npm run db:migrate && npm run db:test`). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2 đạt, các lệnh suite xanh. Verdict PASS.
