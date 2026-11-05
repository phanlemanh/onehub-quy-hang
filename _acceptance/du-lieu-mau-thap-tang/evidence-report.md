---
schema_version: 2
feature_slug: du-lieu-mau-thap-tang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 680c32b22d9d5b94b2242d9f3152da9161431247
human_signoff: Manh Phan 2026-11-05
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
  run_id: minted-du-lieu-mau-thap-tang-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E2
  run_id: minted-du-lieu-mau-thap-tang-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E3
  run_id: minted-du-lieu-mau-thap-tang-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E4
  run_id: minted-du-lieu-mau-thap-tang-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E5
  run_id: minted-du-lieu-mau-thap-tang-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E6
  run_id: minted-du-lieu-mau-thap-tang-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E7
  run_id: minted-du-lieu-mau-thap-tang-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E8
  run_id: minted-du-lieu-mau-thap-tang-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

- eval: E9
  run_id: minted-du-lieu-mau-thap-tang-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T08:33:46Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (một lượt chung cho E1–E9, thoát 0)
    ℹ duration_ms 74231.895667

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T08:33:46Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T08:33:46Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T08:33:46Z

- cmd: npm run test:hooks
  run_id: minted-du-lieu-mau-thap-tang-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T08:33:46Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-du-lieu-mau-thap-tang-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T08:33:46Z

- cmd: npm run typecheck
  run_id: minted-du-lieu-mau-thap-tang-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T08:33:46Z

- cmd: npm run lint
  run_id: minted-du-lieu-mau-thap-tang-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T08:33:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi, round 1). Field baseline cua tung eval ghi n-a.

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline): none. Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval chạy một lần, tất định; không eval nào có pass_rate lẫn.

## Iterations

Round 1: E1–E9 và bảy lệnh suite đều xanh; có một phát hiện trong hợp đồng (AC-9: bài kiểm so ảnh chụp toàn bảng dưới READ COMMITTED, đỏ ngẫu nhiên) và sáu mục ngoài hợp đồng. Returned to implementation để sửa phát hiện trong hợp đồng.
Round 2: sau nhát sửa S4 r1 (bài kiểm chụp bảng trong repeatable read), E1–E9 và bảy lệnh suite đều xanh; không phát hiện mới trong hợp đồng; verdict PASS.
