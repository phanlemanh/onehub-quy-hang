---
schema_version: 2
feature_slug: lien-he-khach
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e9e76698aea78bfca65ba485e52466ea41571de1
human_signoff: Manh Phan 2026-11-03
---

# Evidence Report: lien-he-khach

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
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-lien-he-khach-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-lien-he-khach-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:32:27Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 41299.852625

- eval: E3
  run_id: minted-lien-he-khach-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-lien-he-khach-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-lien-he-khach-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-lien-he-khach-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-lien-he-khach-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-lien-he-khach-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-lien-he-khach-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-lien-he-khach-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:26:07Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-lien-he-khach-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-03T12:32:27Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-lien-he-khach-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-03T12:32:27Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lien-he-khach-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-03T12:32:27Z

- cmd: npm run test:hooks
  run_id: minted-lien-he-khach-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-03T12:32:27Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lien-he-khach-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-03T12:32:27Z

- cmd: npm run typecheck
  run_id: minted-lien-he-khach-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-03T12:32:27Z

- cmd: npm run lint
  run_id: minted-lien-he-khach-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-03T12:32:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Non-discriminating evals (xanh ca tren HEAD lan baseline):
- npm test -w @quy-hang/core: E1, E9, E10
- npm run db:migrate && npm run db:test: E2, E3, E4, E5, E6, E7, E8

Round nay khong do lai baseline; field baseline cua moi eval ghi n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: eval ban dau chay xanh; ca E1, E3 den E10 duoc carry-forward sang round 2.
Round 2: E2 chay lai sau khi bo sung ma tran vai API (S4 vong 1) — xanh; cac lenh suite xanh.
