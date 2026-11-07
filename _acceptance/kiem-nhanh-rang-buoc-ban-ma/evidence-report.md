---
schema_version: 2
feature_slug: kiem-nhanh-rang-buoc-ban-ma
verdict: REJECT
failed_evals: ["E1","E2","E3","E4","E5","E6"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bc270b23a2a643bbac2f8de493feabe82aacd3e0
human_signoff:
---

# Evidence Report: kiem-nhanh-rang-buoc-ban-ma

Round 1. Lệnh gộp `npm run db:migrate && npm run db:test` đỏ, kéo cả sáu eval đỏ theo. Nguyên nhân thấy trong đuôi log: bài `AC-8 không dữ liệu thật` ở `packages/db/tests/du-lieu-mau-thap-tang.test.mjs` bắt các chuỗi 10 chữ số nằm trong UUID công ty (dạng `...b0873966009b`) là «số không đúng dạng mẫu». Đây là bài của bộ dữ liệu mẫu, không phải bài kiểm nhanh; nhưng vì cùng chạy trong một lệnh nên các eval AC-1 đến AC-6 không có kết quả xanh để ghi nhận.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | FAIL |
| E2 | AC-2 | test | FAIL |
| E3 | AC-3 | test | FAIL |
| E4 | AC-4 | test | FAIL |
| E5 | AC-5 | test | FAIL |
| E6 | AC-6 | test | FAIL |

## Evidence

- eval: E1
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E1-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:31:48Z
  output: |
    ✖ AC-8 không dữ liệu thật: số, email, tên người, tên đường, nhãn trên bốn nguồn
    AssertionError: Expected values to be strictly deep-equal (14 chuỗi «số không đúng dạng mẫu» trong cột id / company_id)
    at packages/db/tests/du-lieu-mau-thap-tang.test.mjs:768:10
    npm error Lifecycle script `test:isolation` failed

- eval: E2
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E2-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:31:48Z
  output: |
    (cùng lệnh gộp với E1; cùng bài đỏ AC-8 ở du-lieu-mau-thap-tang.test.mjs:768)
    npm error Lifecycle script `test:isolation` failed

- eval: E3
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E3-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:31:48Z
  output: |
    (cùng lệnh gộp với E1; cùng bài đỏ AC-8 ở du-lieu-mau-thap-tang.test.mjs:768)
    npm error Lifecycle script `test:isolation` failed

- eval: E4
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E4-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:31:48Z
  output: |
    (cùng lệnh gộp với E1; cùng bài đỏ AC-8 ở du-lieu-mau-thap-tang.test.mjs:768)
    npm error Lifecycle script `test:isolation` failed

- eval: E5
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E5-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:31:48Z
  output: |
    (cùng lệnh gộp với E1; cùng bài đỏ AC-8 ở du-lieu-mau-thap-tang.test.mjs:768)
    npm error Lifecycle script `test:isolation` failed

- eval: E6
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E6-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:31:48Z
  output: |
    (cùng lệnh gộp với E1; cùng bài đỏ AC-8 ở du-lieu-mau-thap-tang.test.mjs:768)
    npm error Lifecycle script `test:isolation` failed

Lệnh `npm run db:migrate && npm run db:test` (đỏ, một lần chạy) phủ cả sáu eval E1 đến E6; không có lệnh đỏ nào nằm ngoài eval.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-07T01:31:48Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T01:31:48Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T01:31:48Z

- cmd: npm run test:hooks
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T01:31:48Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T01:31:48Z

- cmd: npm run typecheck
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T01:31:48Z

- cmd: npm run lint
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T01:31:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

## Variance

none — every multi-run eval is uniform

## Judge

Không eval nào là judgment; không có hội đồng chấm, không có mục chờ human_override.

## Iterations

Round 1: E1, E2, E3, E4, E5, E6 failed — lệnh gộp db:migrate + db:test đỏ vì bài AC-8 (du-lieu-mau-thap-tang.test.mjs:768) bắt chuỗi 10 chữ số nằm trong UUID công ty; các bài kiểm nhanh không có kết quả xanh riêng. Returned to implementation.
