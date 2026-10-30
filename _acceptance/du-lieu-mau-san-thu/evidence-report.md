---
schema_version: 2
feature_slug: du-lieu-mau-san-thu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cf54fb1b8498cd4bb38bb12f07e704baeffea861
human_signoff:
---

# Evidence Report: du-lieu-mau-san-thu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-du-lieu-mau-san-thu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

- eval: E2
  run_id: minted-du-lieu-mau-san-thu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

- eval: E3
  run_id: minted-du-lieu-mau-san-thu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

- eval: E4
  run_id: minted-du-lieu-mau-san-thu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

- eval: E5
  run_id: minted-du-lieu-mau-san-thu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

- eval: E6
  run_id: minted-du-lieu-mau-san-thu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

- eval: E7
  run_id: minted-du-lieu-mau-san-thu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

- eval: E8
  run_id: minted-du-lieu-mau-san-thu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:06:04Z
  output: |
    node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1204.820375

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-30T23:06:04Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-30T23:06:04Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-30T23:06:04Z

- cmd: npm run test:hooks
  run_id: minted-du-lieu-mau-san-thu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-30T23:06:04Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-30T23:06:04Z

- cmd: npm run typecheck
  run_id: minted-du-lieu-mau-san-thu-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-30T23:06:04Z

- cmd: npm run lint
  run_id: minted-du-lieu-mau-san-thu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-30T23:06:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- node --test "packages/db/seed/*.test.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sách eval không-phân-biệt: không đo được ở round này vì baseline bị chặn hạ tầng; không eval nào được xác định là xanh cả hai phía.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E8 đều đạt, bảy lệnh suite xanh; baseline không đo được (BLOCKED hạ tầng).
