---
schema_version: 2
feature_slug: danh-muc-go-ma-can
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ed4bd375fd437aba217159ee370ed4155e834f7b
human_signoff:
---

# Evidence Report: danh-muc-go-ma-can

Round 1. Mọi eval máy đều chạy xanh, nhưng phản biện tìm ra một lỗi trong hợp đồng ở mức cao (đối chứng (b) của E10 không bắt được lỗi mà eval hứa bắt), nên kết luận của vòng này là REJECT. Chi tiết ở `review-findings.md`.

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
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-danh-muc-go-ma-can-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 77.140791

- eval: E2
  run_id: minted-danh-muc-go-ma-can-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 77.140791

- eval: E3
  run_id: minted-danh-muc-go-ma-can-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 77.140791

- eval: E4
  run_id: minted-danh-muc-go-ma-can-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 77.140791

- eval: E5
  run_id: minted-danh-muc-go-ma-can-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 77.140791

- eval: E6
  run_id: minted-danh-muc-go-ma-can-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 77.140791

- eval: E7
  run_id: minted-danh-muc-go-ma-can-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 77.140791

- eval: E7b
  run_id: minted-danh-muc-go-ma-can-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.353583

- eval: E8
  run_id: minted-danh-muc-go-ma-can-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.353583

- eval: E8b
  run_id: minted-danh-muc-go-ma-can-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60337.260042

- eval: E9
  run_id: minted-danh-muc-go-ma-can-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1807.353583

- eval: E10
  run_id: minted-danh-muc-go-ma-can-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T06:23:30Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60337.260042

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-danh-muc-go-ma-can-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T06:23:30Z

- cmd: npm run test:hooks
  run_id: minted-danh-muc-go-ma-can-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T06:23:30Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-danh-muc-go-ma-can-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T06:23:30Z

- cmd: npm run typecheck
  run_id: minted-danh-muc-go-ma-can-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T06:23:30Z

- cmd: npm run lint
  run_id: minted-danh-muc-go-ma-can-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T06:23:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả bản đang kiểm lẫn bản nền, nên chỉ chứng minh bộ kiểm chứ chưa chứng minh tính năng; cần viết lại để khẳng định hành vi mới, hoặc xác nhận là rào hồi quy có chủ ý):

- `npm test -w @quy-hang/core`: E1, E2, E3, E4, E5, E6, E7
- `npm run db:migrate && npm run db:test`: E7b, E8, E9
- `npm test -w @quy-hang/api`: E8b, E10

Mọi eval có baseline là green. Đáng chú ý nhất là E10: đối chứng (b) của nó không bắt được lỗi «đếm found mà không so UPI» như hợp đồng hứa (xem `review-findings.md`).

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: không eval máy nào đỏ, nhưng phản biện tìm ra lỗi mức cao trong hợp đồng AC-10 (đối chứng (b) của E10 chỉ kiểm tỉ lệ thấp hơn 100%, vẫn xanh khi bỏ phép so UPI). Trả về bước hiện thực để siết đối chứng.
