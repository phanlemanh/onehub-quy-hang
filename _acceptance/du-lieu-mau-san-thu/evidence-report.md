---
schema_version: 2
feature_slug: du-lieu-mau-san-thu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a5ec300de115004a7aca0ed73f39400753f37b93
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
  run_id: minted-du-lieu-mau-san-thu-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

- eval: E2
  run_id: minted-du-lieu-mau-san-thu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

- eval: E3
  run_id: minted-du-lieu-mau-san-thu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

- eval: E4
  run_id: minted-du-lieu-mau-san-thu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

- eval: E5
  run_id: minted-du-lieu-mau-san-thu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

- eval: E6
  run_id: minted-du-lieu-mau-san-thu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

- eval: E7
  run_id: minted-du-lieu-mau-san-thu-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

- eval: E8
  run_id: minted-du-lieu-mau-san-thu-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.du_lieu_mau
  verified_at: 2026-10-30T23:12:30Z
  output: |
    cmd: node --test "packages/db/seed/*.test.mjs"
    ℹ duration_ms 1220.7195

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-30T23:12:30Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-30T23:12:30Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-30T23:12:30Z

- cmd: npm run test:hooks
  run_id: minted-du-lieu-mau-san-thu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-30T23:12:30Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-du-lieu-mau-san-thu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-30T23:12:30Z

- cmd: npm run typecheck
  run_id: minted-du-lieu-mau-san-thu-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-30T23:12:30Z

- cmd: npm run lint
  run_id: minted-du-lieu-mau-san-thu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-30T23:12:30Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sách eval không-phân-biệt (xanh cả trên HEAD lẫn baseline) KHÔNG đo được ở round này vì baseline bị chặn hạ tầng; mọi field baseline ghi n-a.

### Baseline khong do

- node --test "packages/db/seed/*.test.mjs": BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm đầu trả về triển khai; bản sửa a5ec300 làm bộ quét dữ liệu mẫu bắt số dính liền và dạng +84, thêm phá thử lượt 1.
Round 2: E1-E8 và bảy lệnh suite đều xanh trên cây a5ec300; verdict PASS.
