---
schema_version: 2
feature_slug: va-khuon-v2-moc-tuong-lai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 641ae5e881fab610f0433936e6641ed58b88624a
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
  run_id: minted-va-khuon-v2-moc-tuong-lai-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:52:49Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 185.049625

- eval: E3
  run_id: minted-va-khuon-v2-moc-tuong-lai-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:52:49Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 185.049625

- eval: E4
  run_id: minted-va-khuon-v2-moc-tuong-lai-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:52:49Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 185.049625

- eval: E5
  run_id: minted-va-khuon-v2-moc-tuong-lai-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:52:49Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 185.049625

- eval: E7
  run_id: minted-va-khuon-v2-moc-tuong-lai-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:52:49Z
  output: |
    npm test -w @quy-hang/connect
    ℹ duration_ms 185.049625

- eval: E2
  run_id: minted-va-khuon-v2-moc-tuong-lai-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T22:52:49Z
  output: |
    db:migrate rồi test-db/khuon-v2/*.test.ts và test-db/catalog/nhan-goi.test.ts
    ℹ duration_ms 4711.247291

- eval: E6
  run_id: minted-va-khuon-v2-moc-tuong-lai-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T22:52:49Z
  output: |
    db:migrate rồi test-db/khuon-v2/*.test.ts và test-db/catalog/nhan-goi.test.ts
    ℹ duration_ms 4711.247291

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-09T22:52:49Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-09T22:52:49Z

- cmd: npm run test:hooks
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-09T22:52:49Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-09T22:52:49Z

- cmd: npm run typecheck
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-09T22:52:49Z

- cmd: npm run lint
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-09T22:52:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh cả trên HEAD lẫn baseline; chứng minh harness chứ không phải tính năng — nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/connect — E1, E3, E4, E5, E7
- db:migrate + test-db/khuon-v2 + test-db/catalog/nhan-goi — E2, E6

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 3: tất cả bảy eval xanh, sáu lệnh suite xanh; baseline không đo lại (giữ từ round 1). Lịch sử round 1 và 2 xem run-log.jsonl.

