---
schema_version: 2
feature_slug: chuyen-khong-ket-khoa
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: aebbf39c7ff04e9331b8a7dbd66f5b7fe2a92e58
human_signoff:
---

# Evidence Report: chuyen-khong-ket-khoa

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-chuyen-khong-ket-khoa-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T02:40:28Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 22875.93125

- eval: E2
  run_id: minted-chuyen-khong-ket-khoa-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T02:40:28Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 22875.93125

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-02T02:40:28Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T02:40:28Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T02:40:28Z

- cmd: npm run test:hooks
  run_id: minted-chuyen-khong-ket-khoa-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T02:40:28Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-02T02:40:28Z

- cmd: npm run typecheck
  run_id: minted-chuyen-khong-ket-khoa-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T02:40:28Z

- cmd: npm run lint
  run_id: minted-chuyen-khong-ket-khoa-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-02T02:40:28Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline): E1 và E2, cùng lệnh `npm run db:migrate && npm run db:test`. Hai eval này chứng minh harness chạy được. Chúng chưa chứng minh riêng tính năng, nên cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý. Với E1, phần đo khoá chỉ chụp trong giao dịch của hàm khoá dùng chung, không chụp trong lần chạy bài chuyển thật (xem review-findings.md, mục Trong hợp đồng).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS ở mã 02bd061, hồ sơ bằng chứng đó về sau cũ vì ca kiểm E1 được viết lại.
Round 2: PASS ở mã aebbf39, E1 và E2 cùng bảy lệnh suite đều xanh.
