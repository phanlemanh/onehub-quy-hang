---
schema_version: 2
feature_slug: du-lieu-mau-thap-tang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f71aadc04935755e022bab686e9ab9f8ab43f0bb
human_signoff:
---

# Evidence Report: du-lieu-mau-thap-tang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-du-lieu-mau-thap-tang-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E2
  run_id: minted-du-lieu-mau-thap-tang-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E3
  run_id: minted-du-lieu-mau-thap-tang-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E4
  run_id: minted-du-lieu-mau-thap-tang-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E5
  run_id: minted-du-lieu-mau-thap-tang-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E6
  run_id: minted-du-lieu-mau-thap-tang-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E7
  run_id: minted-du-lieu-mau-thap-tang-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E8
  run_id: minted-du-lieu-mau-thap-tang-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

- eval: E9
  run_id: minted-du-lieu-mau-thap-tang-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:15:27Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 78966.255375

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T08:15:27Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T08:15:27Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T08:15:27Z

- cmd: npm run test:hooks
  run_id: minted-du-lieu-mau-thap-tang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T08:15:27Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T08:15:27Z

- cmd: npm run typecheck
  run_id: minted-du-lieu-mau-thap-tang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T08:15:27Z

- cmd: npm run lint
  run_id: minted-du-lieu-mau-thap-tang-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T08:15:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline không đo: các lệnh suite (hồi quy) không gắn eval nào nên không đo baseline; xanh-cả-hai-phía ở đó là lưới hồi quy bình thường.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, tất định)

## Iterations

Round 1: E1–E9 và bảy lệnh suite đều xanh; verdict PASS.
