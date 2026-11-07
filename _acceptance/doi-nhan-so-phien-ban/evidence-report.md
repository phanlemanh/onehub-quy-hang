---
schema_version: 2
feature_slug: doi-nhan-so-phien-ban
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 4d331845369acfb0c4ea83de9dd37e58b488b546
human_signoff:
---

# Evidence Report: doi-nhan-so-phien-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-doi-nhan-so-phien-ban-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm test -w @quy-hang/core (ca «AC-1 ma trận thắng ngay» ok)
    ℹ duration_ms 13506.161167

- eval: E2
  run_id: minted-doi-nhan-so-phien-ban-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm test -w @quy-hang/core (ca «AC-2 bản gốc và sự kiện thắng ngay trên dãy thật» ok)
    ℹ duration_ms 13506.161167

- eval: E3
  run_id: minted-doi-nhan-so-phien-ban-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (Postgres dãy 5576)
    ℹ duration_ms 135788.71875

- eval: E4
  run_id: minted-doi-nhan-so-phien-ban-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (Postgres dãy 5576)
    ℹ duration_ms 135788.71875

- eval: E5
  run_id: minted-doi-nhan-so-phien-ban-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (Postgres dãy 5576)
    ℹ duration_ms 135788.71875

- eval: E7
  run_id: minted-doi-nhan-so-phien-ban-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm run db:migrate && npm run db:test (Postgres dãy 5576)
    ℹ duration_ms 135788.71875

- eval: E6
  run_id: minted-doi-nhan-so-phien-ban-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_web_db
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm run test:db -w @quy-hang/web (Postgres dãy 5576)
    ℹ duration_ms 14658.2715

- eval: E7b
  run_id: minted-doi-nhan-so-phien-ban-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_web_db
  verified_at: 2026-11-07T11:10:05Z
  output: |
    lệnh: npm run test:db -w @quy-hang/web (Postgres dãy 5576)
    ℹ duration_ms 14658.2715

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-doi-nhan-so-phien-ban-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T11:10:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-nhan-so-phien-ban-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T11:10:05Z

- cmd: npm run test:hooks
  run_id: minted-doi-nhan-so-phien-ban-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T11:10:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doi-nhan-so-phien-ban-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T11:10:05Z

- cmd: npm run typecheck
  run_id: minted-doi-nhan-so-phien-ban-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T11:10:05Z

- cmd: npm run lint
  run_id: minted-doi-nhan-so-phien-ban-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T11:10:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả bản đầu lẫn bản nền diffBase, chứng minh bộ chạy chứ chưa chứng minh tính năng; nên viết lại để khẳng định hành vi mới, hoặc xác nhận là rào hồi quy có chủ ý):

- Lệnh `npm test -w @quy-hang/core` — eval E1, E2: baseline green.
- Lệnh `npm run db:migrate && npm run db:test` (Postgres dãy 5576) — eval E3, E4, E5, E7: baseline green.
- Lệnh `npm run test:db -w @quy-hang/web` (Postgres dãy 5576) — eval E6, E7b: baseline green.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5, E6, E7, E7b đều đạt; không eval nào thất bại. Verdict PASS.

