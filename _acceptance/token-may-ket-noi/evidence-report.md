---
schema_version: 2
feature_slug: token-may-ket-noi
verdict: REJECT
failed_evals: ["E5","E8","E11"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dc68297b7bff8d9abd87cfd410c5125a26ae8ead
human_signoff:
---

# Evidence Report: token-may-ket-noi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | REJECT |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | REJECT |
| E9 | AC-8 | test | PASS |
| E10 | AC-2 | test | PASS |
| E11 | AC-5 | test | REJECT |

## Evidence

- eval: E1
  run_id: minted-token-may-ket-noi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Lệnh test-db/token-may/*.test.ts và test-db/catalog/nhan-goi.test.ts chạy xong, toàn bộ ca xanh.
    ℹ duration_ms 4810.862042

- eval: E2
  run_id: minted-token-may-ket-noi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh với E1, toàn bộ ca xanh.
    ℹ duration_ms 4810.862042

- eval: E3
  run_id: minted-token-may-ket-noi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh với E1, kể cả bộ nhan-goi.test.ts, toàn bộ ca xanh.
    ℹ duration_ms 4810.862042

- eval: E4
  run_id: minted-token-may-ket-noi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh với E1, toàn bộ ca xanh.
    ℹ duration_ms 4810.862042

- eval: E5
  run_id: minted-token-may-ket-noi-E5-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.token_may_cach_ly
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Lệnh npm run db:migrate rồi npm run db:test (toàn bộ test-db) thất bại.
    Ca lỗi nhìn thấy trong đuôi: «lần nhập: xem thử bằng ghi» ở test-db/imports/lan-nhap.test.ts.
    Lệnh dùng chung cho E5, E8, E11 nên cả ba cùng không đạt; đuôi không cho thấy ca isolation hay token-may riêng.

- eval: E6
  run_id: minted-token-may-ket-noi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh với E1, toàn bộ ca xanh.
    ℹ duration_ms 4810.862042

- eval: E7
  run_id: minted-token-may-ket-noi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh với E1, toàn bộ ca xanh.
    ℹ duration_ms 4810.862042

- eval: E8
  run_id: minted-token-may-ket-noi-E8-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.token_may_cach_ly
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh thất bại với E5 (npm run db:test).
    Ca lỗi nhìn thấy trong đuôi: «lần nhập: xem thử bằng ghi» ở test-db/imports/lan-nhap.test.ts.

- eval: E9
  run_id: minted-token-may-ket-noi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh với E1, toàn bộ ca xanh.
    ℹ duration_ms 4810.862042

- eval: E11
  run_id: minted-token-may-ket-noi-E11-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.token_may_cach_ly
  verified_at: 2026-11-09T11:29:33Z
  output: |
    Cùng lệnh thất bại với E5 (npm run db:test).
    Ca lỗi nhìn thấy trong đuôi: «lần nhập: xem thử bằng ghi» ở test-db/imports/lan-nhap.test.ts.

- eval: E10
  run_id: minted-token-may-ket-noi-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-09T11:29:33Z
  output: |
    npm test -w @quy-hang/core xanh.
    ℹ duration_ms 12449.214708

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-token-may-ket-noi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T11:29:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-token-may-ket-noi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T11:29:33Z

- cmd: npm run test:hooks
  run_id: minted-token-may-ket-noi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T11:29:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-token-may-ket-noi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T11:29:33Z

- cmd: npm run typecheck
  run_id: minted-token-may-ket-noi-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T11:29:33Z

- cmd: npm run lint
  run_id: minted-token-may-ket-noi-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T11:29:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline), chứng tỏ harness chứ chưa chứng tỏ tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý:
- Lệnh token-may + nhan-goi (E1, E2, E3, E4, E6, E7, E9)
- Lệnh npm test -w @quy-hang/core (E10)

Lệnh thất bại không gắn eval: không có. Lệnh db:migrate + db:test (E5, E8, E11) thất bại; đuôi cho thấy ca «lần nhập: xem thử bằng ghi» trong test-db/imports/lan-nhap.test.ts lệch lý do bỏ qua dòng (nhận «còn ô cần bạn xem ở toà, mã căn hay giá chào» thay vì «trùng dòng 2 trong file»), nằm ngoài các tệp isolation và token-may được khai cho E5/E8/E11. Vì lệnh chạy cả bộ test-db nên ba eval cùng đỏ.

Baseline không đo: không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E5, E8, E11 failed — lệnh chung db:migrate + db:test đỏ ở ca «lần nhập: xem thử bằng ghi» (test-db/imports/lan-nhap.test.ts); cần xác định lỗi thuộc tính năng hay do trạng thái cơ sở dữ liệu thử, rồi chạy lại riêng isolation.test.mjs, token-may.test.mjs, token-may-thu-tu.test.mjs. Returned to implementation.
