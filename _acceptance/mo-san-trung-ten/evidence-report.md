---
schema_version: 2
feature_slug: mo-san-trung-ten
verdict: REJECT
failed_evals: ["E1","E2","E3","E4","E5"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0e18b20b8a6938854fed24e939bf0e0fcad71e27
human_signoff:
---

# Evidence Report: mo-san-trung-ten

Round 1. Lệnh `npm run db:migrate && npm run db:test` dùng chung cho E1 đến E5 không xanh, nên cả năm eval bị tính hỏng. Lệnh fail không gắn riêng eval nào: không có (lệnh duy nhất fail đã gắn đủ E1 đến E5).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | FAIL |
| E2 | AC-2 | test | FAIL |
| E3 | AC-3 | test | FAIL |
| E4 | AC-4 | test | FAIL |
| E5 | AC-5 | test | FAIL |

## Evidence

- eval: E1
  run_id: minted-mo-san-trung-ten-E1-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:41:33Z
  output: |
    Lệnh chung `npm run db:migrate && npm run db:test` dừng ở lỗi sau (không phải ở ca của E1 nêu tên):
    test at test-db/api.test.ts: bỏ khỏi B sau khi chọn: lời gọi kế không vào B
    error: sàn cần ít nhất một quản trị (P0001, hàm giu_mot_quan_tri, ràng buộc can_mot_quan_tri)
    npm error Lifecycle script `test:db` failed

- eval: E2
  run_id: minted-mo-san-trung-ten-E2-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:41:33Z
  output: |
    Cùng lệnh chung với E1; cùng lỗi: sàn cần ít nhất một quản trị (ca bỏ khỏi B sau khi chọn).

- eval: E3
  run_id: minted-mo-san-trung-ten-E3-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:41:33Z
  output: |
    Cùng lệnh chung với E1; cùng lỗi: sàn cần ít nhất một quản trị (ca bỏ khỏi B sau khi chọn).

- eval: E4
  run_id: minted-mo-san-trung-ten-E4-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:41:33Z
  output: |
    Cùng lệnh chung với E1; cùng lỗi: sàn cần ít nhất một quản trị (ca bỏ khỏi B sau khi chọn).

- eval: E5
  run_id: minted-mo-san-trung-ten-E5-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T13:41:33Z
  output: |
    Cùng lệnh chung với E1; cùng lỗi: sàn cần ít nhất một quản trị (ca bỏ khỏi B sau khi chọn).

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T13:41:33Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T13:41:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T13:41:33Z

- cmd: npm run test:hooks
  run_id: minted-mo-san-trung-ten-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T13:41:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mo-san-trung-ten-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T13:41:33Z

- cmd: npm run typecheck
  run_id: minted-mo-san-trung-ten-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T13:41:33Z

- cmd: npm run lint
  run_id: minted-mo-san-trung-ten-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T13:41:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — danh sách eval không-phân-biệt máy trả về rỗng. Ghi chú: trường baseline của lệnh chung E1 đến E5 là green, đã chép vào từng khối; vì lệnh không chạy hết bộ kiểm, baseline này chưa chứng minh được eval có phân biệt hay không.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định, không có phương sai).

## Iterations

Round 1: E1, E2, E3, E4, E5 failed — lệnh chung db:migrate rồi db:test dừng với lỗi «sàn cần ít nhất một quản trị» ở ca «bỏ khỏi B sau khi chọn» của packages/api/test-db/api.test.ts (ràng buộc can_mot_quan_tri), nên bộ kiểm cơ sở dữ liệu không xanh. Returned to implementation.
