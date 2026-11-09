---
schema_version: 2
feature_slug: va-khuon-v2-moc-tuong-lai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6839a6b2ee42dfedb5d361376063acae15261ef5
human_signoff:
---

# Evidence Report: va-khuon-v2-moc-tuong-lai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-khuon-v2-moc-tuong-lai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:44:48Z
  output: |
    cmd: npm test -w @quy-hang/connect
    ℹ duration_ms 237.789666

- eval: E3
  run_id: minted-va-khuon-v2-moc-tuong-lai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:44:48Z
  output: |
    cmd: npm test -w @quy-hang/connect
    ℹ duration_ms 237.789666

- eval: E4
  run_id: minted-va-khuon-v2-moc-tuong-lai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:44:48Z
  output: |
    cmd: npm test -w @quy-hang/connect
    ℹ duration_ms 237.789666

- eval: E5
  run_id: minted-va-khuon-v2-moc-tuong-lai-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:44:48Z
  output: |
    cmd: npm test -w @quy-hang/connect
    ℹ duration_ms 237.789666

- eval: E7
  run_id: minted-va-khuon-v2-moc-tuong-lai-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:44:48Z
  output: |
    cmd: npm test -w @quy-hang/connect
    ℹ duration_ms 237.789666

- eval: E2
  run_id: minted-va-khuon-v2-moc-tuong-lai-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T22:44:48Z
  output: |
    cmd: db:migrate rồi test-db/khuon-v2/*.test.ts và test-db/catalog/nhan-goi.test.ts (concurrency 1)
    ℹ duration_ms 6510.560083

- eval: E6
  run_id: minted-va-khuon-v2-moc-tuong-lai-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T22:44:48Z
  output: |
    cmd: db:migrate rồi test-db/khuon-v2/*.test.ts và test-db/catalog/nhan-goi.test.ts (concurrency 1)
    ℹ duration_ms 6510.560083

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T22:44:48Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T22:44:48Z

- cmd: npm run test:hooks
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T22:44:48Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T22:44:48Z

- cmd: npm run typecheck
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-09T22:44:48Z

- cmd: npm run lint
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T22:44:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1), nen moi eval may ghi baseline n-a.

Eval khong-phan-biet (green ca HEAD lan baseline, theo danh sach carried):
- npm test -w @quy-hang/connect — E1, E3, E4, E5, E7
- db:migrate rồi test-db/khuon-v2/*.test.ts và test-db/catalog/nhan-goi.test.ts — E2, E6

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: đo vòng lượt chấm 1, phản biện nêu các điểm ghi ở review-findings.md.
Round 2: mọi eval và mọi lệnh suite xanh, verdict PASS; phát hiện còn lại nằm ở review-findings.md để người quyết.

