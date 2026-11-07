---
schema_version: 2
feature_slug: mau-api-ten-truong-tieng-anh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 218917cbc1eb5293397158a26f3ddff4f5e5f2e3
human_signoff:
---

# Evidence Report: mau-api-ten-truong-tieng-anh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | script | PASS |
| E8c | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-mau-api-ten-truong-tieng-anh-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126653.140417

- eval: E2
  run_id: minted-mau-api-ten-truong-tieng-anh-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126653.140417

- eval: E3
  run_id: minted-mau-api-ten-truong-tieng-anh-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126653.140417

- eval: E4b
  run_id: minted-mau-api-ten-truong-tieng-anh-E4b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126653.140417

- eval: E5b
  run_id: minted-mau-api-ten-truong-tieng-anh-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126653.140417

- eval: E7
  run_id: minted-mau-api-ten-truong-tieng-anh-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126653.140417

- eval: E8
  run_id: minted-mau-api-ten-truong-tieng-anh-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126653.140417

- eval: E1b
  run_id: minted-mau-api-ten-truong-tieng-anh-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 2827.179667

- eval: E4
  run_id: minted-mau-api-ten-truong-tieng-anh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11541.881334

- eval: E5
  run_id: minted-mau-api-ten-truong-tieng-anh-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11541.881334

- eval: E6b
  run_id: minted-mau-api-ten-truong-tieng-anh-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11541.881334

- eval: E6
  run_id: minted-mau-api-ten-truong-tieng-anh-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4411.235417

- eval: E6c
  run_id: minted-mau-api-ten-truong-tieng-anh-E6c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4411.235417

- eval: E7b
  run_id: minted-mau-api-ten-truong-tieng-anh-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4411.235417

- eval: E7c
  run_id: minted-mau-api-ten-truong-tieng-anh-E7c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4411.235417

- eval: E8b
  run_id: minted-mau-api-ten-truong-tieng-anh-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T14:19:08Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 1278.308209

- eval: E8c
  run_id: minted-mau-api-ten-truong-tieng-anh-E8c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T14:19:08Z
  output: |
    design-floor-khuon --kiem --root .
    9 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T14:19:08Z

- cmd: npm run test:hooks
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T14:19:08Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T14:19:08Z

- cmd: npm run typecheck
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T14:19:08Z

- cmd: npm run lint
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T14:19:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả mã mới lẫn baseline, cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý)

- E1b (npm test -w @quy-hang/api)
- E4, E5, E6b (npm test -w @quy-hang/core)
- E8b (npm run test:ro-ri) — regression-guard rò rỉ, chủ ý
- E8c (design-floor-khuon --kiem) — regression-guard khuôn giao diện, chủ ý

Các eval còn lại (E1, E2, E3, E4b, E5b, E7, E8, E6, E6c, E7b, E7c) đỏ trên baseline, có phân biệt.

Không có eval judgment, không có panel chấm.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh, không eval nào hỏng. Verdict PASS.
