---
schema_version: 2
feature_slug: mau-api-ten-truong-tieng-anh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 184332c8717c3a5c739b739556489270c3f77257
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
  run_id: minted-mau-api-ten-truong-tieng-anh-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126304.605333

- eval: E2
  run_id: minted-mau-api-ten-truong-tieng-anh-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126304.605333

- eval: E3
  run_id: minted-mau-api-ten-truong-tieng-anh-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126304.605333

- eval: E4b
  run_id: minted-mau-api-ten-truong-tieng-anh-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126304.605333

- eval: E5b
  run_id: minted-mau-api-ten-truong-tieng-anh-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126304.605333

- eval: E7
  run_id: minted-mau-api-ten-truong-tieng-anh-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126304.605333

- eval: E8
  run_id: minted-mau-api-ten-truong-tieng-anh-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 126304.605333

- eval: E1b
  run_id: minted-mau-api-ten-truong-tieng-anh-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 3817.841625

- eval: E4
  run_id: minted-mau-api-ten-truong-tieng-anh-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11570.134667

- eval: E5
  run_id: minted-mau-api-ten-truong-tieng-anh-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11570.134667

- eval: E6b
  run_id: minted-mau-api-ten-truong-tieng-anh-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 11570.134667

- eval: E6
  run_id: minted-mau-api-ten-truong-tieng-anh-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4785.011292

- eval: E6c
  run_id: minted-mau-api-ten-truong-tieng-anh-E6c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4785.011292

- eval: E7c
  run_id: minted-mau-api-ten-truong-tieng-anh-E7c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4785.011292

- eval: E8b
  run_id: minted-mau-api-ten-truong-tieng-anh-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T14:25:07Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 2503.699417

- eval: E8c
  run_id: minted-mau-api-ten-truong-tieng-anh-E8c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T14:25:07Z
  output: |
    design-floor-khuon --kiem
    9 tệp giao diện ngoài bản đồ

- eval: E7b
  run_id: minted-mau-api-ten-truong-tieng-anh-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T14:19:08Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T14:25:07Z

- cmd: npm run test:hooks
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T14:25:07Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T14:25:07Z

- cmd: npm run typecheck
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T14:25:07Z

- cmd: npm run lint
  run_id: minted-mau-api-ten-truong-tieng-anh-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T14:25:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval không-phân-biệt (pass trên cả code mới lẫn baseline; regression-guard có chủ ý hoặc cần viết lại để assert hành vi mới):
- npm test -w @quy-hang/api — E1b
- npm test -w @quy-hang/core — E4, E5, E6b
- npm run test:ro-ri — E8b
- design-floor-khuon --kiem — E8c

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt; một phát hiện ngoài hợp đồng mức thấp (khoá trùng tên thuộc tính có sẵn) ghi lại làm hạn chế đã biết.
Round 2: sửa bảng tên cũ tra bằng Object.hasOwn trong mau-san.ts; chạy lại các eval chạm tệp đó, mọi eval đạt; E7b mang từ round 1 vì delta không chạm paths của nó.
