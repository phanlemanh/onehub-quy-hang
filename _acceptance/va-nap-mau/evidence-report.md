---
schema_version: 2
feature_slug: va-nap-mau
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 925e322cb9628fd540192a65d1784f5f791114de
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: va-nap-mau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-nap-mau-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau_yml
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --test packages/db/seed/nap-mau-yml.test.mjs
    ℹ duration_ms 327.870166

- eval: E2
  run_id: minted-va-nap-mau-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau_yml
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --test packages/db/seed/nap-mau-yml.test.mjs
    ℹ duration_ms 327.870166

- eval: E3
  run_id: minted-va-nap-mau-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau_yml
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --test packages/db/seed/nap-mau-yml.test.mjs
    ℹ duration_ms 327.870166

- eval: E5
  run_id: minted-va-nap-mau-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau_yml
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --test packages/db/seed/nap-mau-yml.test.mjs
    ℹ duration_ms 327.870166

- eval: E4
  run_id: minted-va-nap-mau-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 6848.924208

- eval: E8
  run_id: minted-va-nap-mau-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.nap_mau
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts"
    ℹ duration_ms 6848.924208

- eval: E6
  run_id: minted-va-nap-mau-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.typecheck_db
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --test packages/db/seed/typecheck-db.test.mjs
    ℹ duration_ms 12231.344833

- eval: E7
  run_id: minted-va-nap-mau-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-11-01T09:03:15Z
  output: |
    node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 12367.965708

- eval: E9
  run_id: minted-va-nap-mau-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T09:03:15Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 6162.109

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-nap-mau-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T09:03:15Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-nap-mau-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T09:03:15Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-nap-mau-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T09:03:15Z

- cmd: npm run test:hooks
  run_id: minted-va-nap-mau-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T09:03:15Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-nap-mau-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T09:03:15Z

- cmd: npm run typecheck
  run_id: minted-va-nap-mau-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T09:03:15Z

- cmd: npm run lint
  run_id: minted-va-nap-mau-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T09:03:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline):
- node --test packages/db/seed/nap-mau-yml.test.mjs: E1, E2, E3, E5
- node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.ts": E4, E8
- node --env-file-if-exists=.env.local --import tsx --test "packages/db/seed/*.test.mjs": E7
- npm run db:migrate && npm run db:test: E9

Baseline khong do
- node --test packages/db/seed/typecheck-db.test.mjs: bo qua baseline: tep packages/db/seed/typecheck-db.test.mjs co o cay dang kiem nhung chua co o merge-base a47be8baff7dc99eef3b7405a0076a69e0f5ae2f — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval E1-E9 và các lệnh suite đều xanh; verdict PASS.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp nhánh chính sau chữ ký
run_id: repin-20261101T090935Z-92128
sha: 925e322cb9628fd540192a65d1784f5f791114de · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng
