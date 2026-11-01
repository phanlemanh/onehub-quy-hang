---
schema_version: 2
feature_slug: chuyen-khong-ket-khoa
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 02bd061999be7e5ec922782a666060f2b253fa37
human_signoff:
---

# Evidence Report: chuyen-khong-ket-khoa

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-chuyen-khong-ket-khoa-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:46:48Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ca «liên hệ: bài chuyển không kẹt khoá với bài gỡ ràng buộc chạy song song» có mặt và ok
    ℹ duration_ms 7063.463875

- eval: E2
  run_id: minted-chuyen-khong-ket-khoa-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:46:48Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    hai ca «liên hệ: chuyển dữ liệu cũ» và «liên hệ: chuyển trên sàn không có dữ liệu» có mặt và ok
    ℹ duration_ms 7063.463875

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T15:46:48Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T15:46:48Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T15:46:48Z

- cmd: npm run test:hooks
  run_id: minted-chuyen-khong-ket-khoa-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T15:46:48Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T15:46:48Z

- cmd: npm run typecheck
  run_id: minted-chuyen-khong-ket-khoa-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T15:46:48Z

- cmd: npm run lint
  run_id: minted-chuyen-khong-ket-khoa-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T15:46:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất

## Iterations

Round 1: E1, E2 đều đạt, baseline red (có phân biệt); các lệnh suite hồi quy xanh. Verdict PASS.
