---
schema_version: 2
feature_slug: bao-ro-ngay-ban-sai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 781a15c4ad4638b7c2d79918b43f8c598e0754f2
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: bao-ro-ngay-ban-sai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bao-ro-ngay-ban-sai-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T09:03:58Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ca «ngày không có thật: một lỗi ở closeDate» và ca «sai dạng ngày: lỗi dạng ở closeDate» đều ok
    ℹ duration_ms 81.494375

- eval: E2
  run_id: minted-bao-ro-ngay-ban-sai-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T09:03:58Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ca «ngày có thật: không lỗi» ok
    ℹ duration_ms 81.494375

- eval: E3
  run_id: minted-bao-ro-ngay-ban-sai-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T09:03:58Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ca «Postgres và lõi nhận cùng một tập ngày» ok
    ℹ duration_ms 1967.547708

- eval: E4
  run_id: minted-bao-ro-ngay-ban-sai-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T09:03:58Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ca «chốt bán với ngày không có thật: 400 nêu closeDate, không ghi» ok
    ℹ duration_ms 1967.547708

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-bao-ro-ngay-ban-sai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T09:03:58Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bao-ro-ngay-ban-sai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T09:03:58Z

- cmd: npm run test:hooks
  run_id: minted-bao-ro-ngay-ban-sai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T09:03:58Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bao-ro-ngay-ban-sai-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T09:03:58Z

- cmd: npm run typecheck
  run_id: minted-bao-ro-ngay-ban-sai-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T09:03:58Z

- cmd: npm run lint
  run_id: minted-bao-ro-ngay-ban-sai-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T09:03:58Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả bản hiện tại lẫn bản nền diffBase — chứng minh harness chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/core — E1, E2
- npm run db:migrate && npm run db:test — E3, E4

Baseline không đo: không có.

Lệnh suite xanh-cả-hai-phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, deterministic).

## Iterations

Round 1: E1, E2, E3, E4 và sáu lệnh suite đều xanh. Không có mục judgment, không có eval ngẫu nhiên, không có UI check.
