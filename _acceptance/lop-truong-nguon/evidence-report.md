---
schema_version: 2
feature_slug: lop-truong-nguon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 79997fd7970c443f6931c414bfda8b9a5f333c81
human_signoff:
---

# Evidence Report: lop-truong-nguon

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-lop-truong-nguon-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:18:30Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-lop-truong-nguon-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:18:30Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-lop-truong-nguon-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:18:30Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-lop-truong-nguon-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 77.365417

- eval: E4b
  run_id: minted-lop-truong-nguon-E4b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1918.298834

- eval: E5
  run_id: minted-lop-truong-nguon-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1918.298834

- eval: E6
  run_id: minted-lop-truong-nguon-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1918.298834

- eval: E7
  run_id: minted-lop-truong-nguon-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1918.298834

- eval: E8
  run_id: minted-lop-truong-nguon-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:10:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-lop-truong-nguon-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1918.298834

- eval: E9b
  run_id: minted-lop-truong-nguon-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1918.298834

- eval: E10
  run_id: minted-lop-truong-nguon-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T08:39:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1918.298834

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-lop-truong-nguon-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-10-31T08:39:59Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-lop-truong-nguon-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-10-31T08:39:59Z

- cmd: npm run test:hooks
  run_id: minted-lop-truong-nguon-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-10-31T08:39:59Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-lop-truong-nguon-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-10-31T08:39:59Z

- cmd: npm run typecheck
  run_id: minted-lop-truong-nguon-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-10-31T08:39:59Z

- cmd: npm run lint
  run_id: minted-lop-truong-nguon-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-10-31T08:39:59Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval không phân biệt (xanh trên cả mã cũ lẫn mã mới, chứng minh bộ chạy chứ không chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý; số liệu từ round 1, round này không đo lại):

- Lệnh `npm test -w @quy-hang/core` phủ E1, E2, E3, E4.
- Lệnh `npm run db:migrate && npm run db:test` phủ E4b, E5, E6, E7, E8, E9, E9b, E10.

Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, xác định; không eval nào có pass_rate lẫn).

## Iterations

Round 1: mọi eval và mọi lệnh suite đều xanh; không eval nào hỏng. Verdict PASS, kèm một phát hiện trong hợp đồng ở AC-3 (phép đo bản trả không mang số không thể đỏ).
Round 2: sửa phép đo AC-3 ở commit 1d4d798 (ca bản trả không mang số dù bản ghi có số); chạy lại E1-E4, E4b, E5, E6, E10 và sáu lệnh suite, tất cả xanh; E7, E8, E9, E9b mang sang từ round 1 vì delta không chạm paths của chúng. Verdict PASS.
Round 3: commit 79997fd thu hẹp lời gọi chủ nhà theo trục ai thấy hàng (Chỉ tôi của người khác trả 404); chạy lại E4, E4b, E5, E6, E7, E9, E9b, E10 và sáu lệnh suite, tất cả xanh; E1, E2, E3 mang sang từ round 2 và E8 từ round 1 vì delta không chạm paths của chúng. Verdict PASS, kèm một phát hiện ngoài hợp đồng về chữ trên thẻ người ký (xem review-findings.md).

