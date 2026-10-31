---
schema_version: 2
feature_slug: danh-muc-go-ma-can
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: abe2b20a25e860b088513c679938282eec9b2cd5
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: danh-muc-go-ma-can

Round 2. Năm eval chạy lại vì delta chạm đường của chúng (E7b, E8, E9, E8b, E10); bảy eval E1 đến E7 giữ từ round 1 vì delta không chạm đường của chúng.

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
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-danh-muc-go-ma-can-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-danh-muc-go-ma-can-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-danh-muc-go-ma-can-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-danh-muc-go-ma-can-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-danh-muc-go-ma-can-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-danh-muc-go-ma-can-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T06:23:30Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-danh-muc-go-ma-can-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:33:49Z
  output: |
    lenh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1644.711709

- eval: E8
  run_id: minted-danh-muc-go-ma-can-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:33:49Z
  output: |
    lenh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1644.711709

- eval: E9
  run_id: minted-danh-muc-go-ma-can-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T06:33:49Z
  output: |
    lenh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1644.711709

- eval: E8b
  run_id: minted-danh-muc-go-ma-can-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T06:33:49Z
  output: |
    lenh: npm test -w @quy-hang/api
    ℹ duration_ms 60344.099666

- eval: E10
  run_id: minted-danh-muc-go-ma-can-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T06:33:49Z
  output: |
    lenh: npm test -w @quy-hang/api
    ℹ duration_ms 60344.099666

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-danh-muc-go-ma-can-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T06:33:49Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-danh-muc-go-ma-can-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T06:33:49Z

- cmd: npm run test:hooks
  run_id: minted-danh-muc-go-ma-can-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T06:33:49Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-danh-muc-go-ma-can-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T06:33:49Z

- cmd: npm run typecheck
  run_id: minted-danh-muc-go-ma-can-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T06:33:49Z

- cmd: npm run lint
  run_id: minted-danh-muc-go-ma-can-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T06:33:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Moi block eval ghi baseline n-a vi round nay khong do.

Eval không phân biệt (pass trên cả HEAD lẫn baseline ở lần đo round 1, chứng minh harness chứ chưa chứng minh feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/core: E1, E2, E3, E4, E5, E6, E7
- npm run db:migrate && npm run db:test: E7b, E8, E9
- npm test -w @quy-hang/api: E8b, E10

Lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval máy nào đỏ, nhưng phản biện tìm ra lỗi mức cao trong hợp đồng AC-10 (đối chứng (b) của E10 chỉ kiểm tỉ lệ thấp hơn 100%, vẫn xanh khi bỏ phép so UPI). Trả về bước hiện thực để siết đối chứng.
Round 2: E7b, E8, E9, E8b, E10 chạy lại và xanh; E1 đến E7 giữ từ round 1 (delta không chạm đường của chúng); sáu lệnh suite xanh. Phản biện còn hai mục thấp ngoài hợp đồng, ghi ở review-findings.md.
