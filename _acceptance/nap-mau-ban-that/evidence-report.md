---
schema_version: 2
feature_slug: nap-mau-ban-that
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c641543d2e8bdf3872746107bcd8820355861427
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: nap-mau-ban-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-9 | test | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-nap-mau-ban-that-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E2
  run_id: minted-nap-mau-ban-that-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E3
  run_id: minted-nap-mau-ban-that-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E4
  run_id: minted-nap-mau-ban-that-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E5
  run_id: minted-nap-mau-ban-that-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E6
  run_id: minted-nap-mau-ban-that-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E7
  run_id: minted-nap-mau-ban-that-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E9
  run_id: minted-nap-mau-ban-that-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E12
  run_id: minted-nap-mau-ban-that-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 7068.030834

- eval: E8
  run_id: minted-nap-mau-ban-that-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.nap_mau_yml
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --test packages/db/seed/nap-mau-yml.test.mjs
    ℹ duration_ms 49.70975

- eval: E11
  run_id: minted-nap-mau-ban-that-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 6339.9755

- eval: E10
  run_id: minted-nap-mau-ban-that-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.du_lieu_mau_tsx
  verified_at: 2026-11-01T07:49:26Z
  output: |
    cmd: node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1418.823833

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nap-mau-ban-that-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T07:49:26Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nap-mau-ban-that-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T07:49:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nap-mau-ban-that-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T07:49:26Z

- cmd: npm run test:hooks
  run_id: minted-nap-mau-ban-that-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T07:49:26Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nap-mau-ban-that-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T07:49:26Z

- cmd: npm run typecheck
  run_id: minted-nap-mau-ban-that-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T07:49:26Z

- cmd: npm run lint
  run_id: minted-nap-mau-ban-that-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T07:49:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên code mới lẫn baseline, chứng minh bộ kiểm chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):

- node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts": E1, E2, E3, E4, E5, E6, E7, E9, E12
- npm run db:migrate && npm run db:test: E11
- node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.mjs": E10

Baseline khong do

- node --test packages/db/seed/nap-mau-yml.test.mjs: bo qua baseline: tep packages/db/seed/nap-mau-yml.test.mjs co o cay dang kiem nhung chua co o merge-base ac503a7d3b57185dc29ba881dbadb12fbc09fbde — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval và lệnh suite đều xanh, verdict PASS; không eval nào hỏng, không mục chờ người phán xét.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp nhánh chính sau chữ ký
run_id: repin-20261101T082148Z-95185
sha: c641543d2e8bdf3872746107bcd8820355861427 · suites: 7 lệnh exit 0 · evals: 12/12 eval máy đạt kỳ vọng
