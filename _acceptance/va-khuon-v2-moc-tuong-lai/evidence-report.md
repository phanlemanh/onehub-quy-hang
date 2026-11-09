---
schema_version: 2
feature_slug: va-khuon-v2-moc-tuong-lai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ff8be8d8f4412669f9770ab34072aa65673a8106
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
  run_id: minted-va-khuon-v2-moc-tuong-lai-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:38:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «mốc tương lai: ma trận» ok
    ℹ duration_ms 257.902542

- eval: E2
  run_id: minted-va-khuon-v2-moc-tuong-lai-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T22:38:11Z
  output: |
    db:migrate rồi chạy test-db/khuon-v2/*.test.ts và test-db/catalog/nhan-goi.test.ts
    ca «từ chối: khu không đổi» ok
    ℹ duration_ms 7120.356125

- eval: E3
  run_id: minted-va-khuon-v2-moc-tuong-lai-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:38:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «tên miền: đuôi bất kỳ» ok
    ℹ duration_ms 257.902542

- eval: E4
  run_id: minted-va-khuon-v2-moc-tuong-lai-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:38:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «tên miền: chuỗi sạch có dấu chấm» ok
    ℹ duration_ms 257.902542

- eval: E5
  run_id: minted-va-khuon-v2-moc-tuong-lai-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:38:11Z
  output: |
    npm test -w @quy-hang/connect
    ca «mốc đo cơ sở dữ liệu không nhận: phút và phần lẻ» ok
    ℹ duration_ms 257.902542

- eval: E6
  run_id: minted-va-khuon-v2-moc-tuong-lai-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.khuon_v2_db
  verified_at: 2026-11-09T22:38:11Z
  output: |
    db:migrate rồi chạy test-db/khuon-v2/*.test.ts và test-db/catalog/nhan-goi.test.ts
    ca «mốc đo lạ: 422 không phải 500» ok
    ℹ duration_ms 7120.356125

- eval: E7
  run_id: minted-va-khuon-v2-moc-tuong-lai-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.connect
  verified_at: 2026-11-09T22:38:11Z
  output: |
    npm test -w @quy-hang/connect
    catalog-feed.test.ts và catalog-feed-v2.test.ts xanh, gồm «gói mẫu: sinh từ khuôn, khớp tệp»
    ℹ duration_ms 257.902542

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T22:38:11Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T22:38:11Z

- cmd: npm run test:hooks
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T22:38:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T22:38:11Z

- cmd: npm run typecheck
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T22:38:11Z

- cmd: npm run lint
  run_id: minted-va-khuon-v2-moc-tuong-lai-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T22:38:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: không có.

Eval không phân biệt (xanh ở cả HEAD lẫn baseline diffBase; chứng minh harness chứ chưa chứng minh tính năng — nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- E1, E3, E4, E5, E7 (lệnh npm test -w @quy-hang/connect)
- E2, E6 (lệnh db:migrate rồi test-db/khuon-v2 và test-db/catalog/nhan-goi)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E7 đều xanh, không eval nào hỏng; không có mục judgment nào chờ người.

