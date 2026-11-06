---
schema_version: 2
feature_slug: danh-muc-xa-day-du
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e047747773b811a1d780245eef2cefcc0661684e
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: danh-muc-xa-day-du

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

## Evidence

- eval: E1
  run_id: minted-danh-muc-xa-day-du-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E2
  run_id: minted-danh-muc-xa-day-du-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E3
  run_id: minted-danh-muc-xa-day-du-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E4
  run_id: minted-danh-muc-xa-day-du-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E5
  run_id: minted-danh-muc-xa-day-du-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E6
  run_id: minted-danh-muc-xa-day-du-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E7
  run_id: minted-danh-muc-xa-day-du-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E8
  run_id: minted-danh-muc-xa-day-du-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

- eval: E9
  run_id: minted-danh-muc-xa-day-du-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T06:35:14Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1591.095708

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-danh-muc-xa-day-du-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T06:35:14Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-danh-muc-xa-day-du-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T06:35:14Z

- cmd: npm run test:hooks
  run_id: minted-danh-muc-xa-day-du-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T06:35:14Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-danh-muc-xa-day-du-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T06:35:14Z

- cmd: npm run typecheck
  run_id: minted-danh-muc-xa-day-du-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T06:35:14Z

- cmd: npm run lint
  run_id: minted-danh-muc-xa-day-du-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T06:35:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): E1, E2, E3, E4, E5, E6, E7, E8, E9 (lệnh `npm test -w @quy-hang/core`, baseline green). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E9 đều xanh, verdict PASS.

### Re-pin lần 1 — 2026-11-06, do gộp main sau chữ ký
run_id: repin-20261106T100208Z-96326
sha: e6954821549972436155211ca3b1a8ef5c44761e · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-11-06, do gộp main lần hai (#166–#170)
run_id: repin-20261106T123201Z-43095
sha: 871f7441274843adea1bf1bf12d9da5b4deb4cf0 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng

### Re-pin lần 3 — 2026-11-06, do gộp main lần ba (#162)
run_id: repin-20261106T135519Z-74284
sha: e047747773b811a1d780245eef2cefcc0661684e · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng
