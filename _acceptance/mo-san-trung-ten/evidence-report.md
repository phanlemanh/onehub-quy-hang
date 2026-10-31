---
schema_version: 2
feature_slug: mo-san-trung-ten
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 700818905444e70770c7a565136b26ffb0c18196
human_signoff:
---

# Evidence Report: mo-san-trung-ten

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-mo-san-trung-ten-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:46:14Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2004.196416

- eval: E2
  run_id: minted-mo-san-trung-ten-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:46:14Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2004.196416

- eval: E3
  run_id: minted-mo-san-trung-ten-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:46:14Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2004.196416

- eval: E4
  run_id: minted-mo-san-trung-ten-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:46:14Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2004.196416

- eval: E5
  run_id: minted-mo-san-trung-ten-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:46:14Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2004.196416

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T13:46:14Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-31T13:46:14Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T13:46:14Z

- cmd: npm run test:hooks
  run_id: minted-mo-san-trung-ten-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T13:46:14Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T13:46:14Z

- cmd: npm run typecheck
  run_id: minted-mo-san-trung-ten-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T13:46:14Z

- cmd: npm run lint
  run_id: minted-mo-san-trung-ten-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T13:46:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet: none (baseline khong do lai round nay; moi eval ghi baseline n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: baseline da do; ket qua nam o round 1, khong do lai.
Round 2: E1-E5 va cac lenh suite deu xanh; khong eval nao fail. Khong co judgment item va khong co judge panel nao duoc de xuat.
