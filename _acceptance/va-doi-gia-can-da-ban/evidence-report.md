---
schema_version: 2
feature_slug: va-doi-gia-can-da-ban
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 41e449c0db2f98e707a3731872611f8ff9b0642e
human_signoff:
---

# Evidence Report: va-doi-gia-can-da-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-doi-gia-can-da-ban-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:05:33Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 461.781833

- eval: E2
  run_id: minted-va-doi-gia-can-da-ban-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T14:05:33Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 39711.782042

- eval: E3
  run_id: minted-va-doi-gia-can-da-ban-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-03T14:05:33Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1810.413125

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-doi-gia-can-da-ban-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-03T14:05:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-doi-gia-can-da-ban-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-03T14:05:33Z

- cmd: npm run test:hooks
  run_id: minted-va-doi-gia-can-da-ban-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-03T14:05:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-doi-gia-can-da-ban-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-03T14:05:33Z

- cmd: npm run typecheck
  run_id: minted-va-doi-gia-can-da-ban-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-03T14:05:33Z

- cmd: npm run lint
  run_id: minted-va-doi-gia-can-da-ban-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-03T14:05:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Mọi eval ghi baseline n-a vì round này không đo.

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, ở round 1; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E1 (npm test -w @quy-hang/core)
- E3 (npm run test:db -w @quy-hang/web)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2 failed — lệnh db:migrate + db:test dừng lỗi ở ca «số đo: ngày lead → Sẵn sàng bán trên bộ mẫu» (leads-mine.test.ts), thừa một hàng có khoảng ngày 0.0. Returned to implementation.
Round 2: E1, E2, E3 và toàn bộ lệnh suite xanh trên commit 7bff7dd; verdict PASS.

### Re-pin lần 1 — 2026-11-03, do gộp nhánh chính (PR #98, #100) sau lượt chấm
run_id: repin-20261103T141337Z-52750
sha: 1fc1ee2ece5afdf9ed3e9664b893d269487e8be4 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-11-03, do gộp nhánh chính (PR #99): cộng dồn mã lỗi
run_id: repin-20261103T143057Z-51920
sha: 285f4040f9d66d53524bf147abb856b523955f9d · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-11-03, do gộp nhánh chính (PR #102, #103)
run_id: repin-20261103T144402Z-82467
sha: 1f878e509c51ae4c641bd18a5f851fd60d3848a3 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 4 — 2026-11-03, do gộp nhánh chính (PR #102)
run_id: repin-20261103T154902Z-61046
sha: 74f25473284fed87a98342c3e43c035271d99097 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 5 — 2026-11-03, do gộp nhánh chính (PR #104)
run_id: repin-20261103T160807Z-29490
sha: 4ece2173fdfbf5ba6b18ba9860c9fc70a90d82c5 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 6 — 2026-11-04, do gộp nhánh chính (PR #106)
run_id: repin-20261104T023518Z-85154
sha: 41e449c0db2f98e707a3731872611f8ff9b0642e · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng
