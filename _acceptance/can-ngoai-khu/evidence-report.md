---
schema_version: 2
feature_slug: can-ngoai-khu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0020fb7b4a5a273f916be807760a42a65f6163f9
human_signoff: Manh Phan 2026-11-07
---

# Evidence Report: can-ngoai-khu

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
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E10c | AC-10 | test | PASS |
| E10d | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-can-ngoai-khu-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 12410.817792

- eval: E2
  run_id: minted-can-ngoai-khu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 12410.817792

- eval: E3
  run_id: minted-can-ngoai-khu-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E4
  run_id: minted-can-ngoai-khu-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E5
  run_id: minted-can-ngoai-khu-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E6
  run_id: minted-can-ngoai-khu-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E7
  run_id: minted-can-ngoai-khu-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E8
  run_id: minted-can-ngoai-khu-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E9
  run_id: minted-can-ngoai-khu-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E10
  run_id: minted-can-ngoai-khu-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 136608.289042

- eval: E10b
  run_id: minted-can-ngoai-khu-E10b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm run typecheck
    (không có lỗi kiểu)

- eval: E10c
  run_id: minted-can-ngoai-khu-E10c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T11:56:32Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 12410.817792

- eval: E10d
  run_id: minted-can-ngoai-khu-E10d-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T11:56:32Z
  output: |
    design-floor-khuon --kiem --root .
    9 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-can-ngoai-khu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T11:56:32Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-can-ngoai-khu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T11:56:32Z

- cmd: npm run test:hooks
  run_id: minted-can-ngoai-khu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T11:56:32Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-can-ngoai-khu-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T11:56:32Z

- cmd: npm run lint
  run_id: minted-can-ngoai-khu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T11:56:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): E1, E2, E10c (lệnh `npm test -w @quy-hang/core`), E10d (bước chấm khuôn giao diện). Đây là harness hoặc regression-guard có chủ ý; E1 và E2 nên được xem lại để chắc chúng assert hành vi mới.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đạt, verdict PASS.

