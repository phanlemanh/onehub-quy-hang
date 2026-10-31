---
schema_version: 2
feature_slug: loi-hang-va-su-kien
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 36f6ef141bc5b3966f7c4dffcc172bc73ec9caf3
human_signoff:
---

# Evidence Report: loi-hang-va-su-kien

Mọi lệnh máy đều chạy xong và xanh. Verdict REJECT đến từ phép đo: ba finding trong hợp đồng (AC-9, AC-10) cho thấy ca kiểm quá lỏng, chưa chứng minh được lời hứa của E9 và E10. Chi tiết ở review-findings.md.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS (lệnh xanh; phép đo bị chê, xem findings) |
| E10 | AC-10 | test | PASS (lệnh xanh; phép đo bị chê, xem findings) |

## Evidence

- eval: E1
  run_id: minted-loi-hang-va-su-kien-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1408.941459

- eval: E2
  run_id: minted-loi-hang-va-su-kien-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1408.941459

- eval: E3
  run_id: minted-loi-hang-va-su-kien-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm test -w @quy-hang/api
    ℹ duration_ms 60527.147625

- eval: E3b
  run_id: minted-loi-hang-va-su-kien-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1408.941459

- eval: E4
  run_id: minted-loi-hang-va-su-kien-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 65.950709

- eval: E5
  run_id: minted-loi-hang-va-su-kien-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1408.941459

- eval: E5b
  run_id: minted-loi-hang-va-su-kien-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 65.950709

- eval: E6
  run_id: minted-loi-hang-va-su-kien-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 65.950709

- eval: E7
  run_id: minted-loi-hang-va-su-kien-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 65.950709

- eval: E8
  run_id: minted-loi-hang-va-su-kien-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1408.941459

- eval: E9
  run_id: minted-loi-hang-va-su-kien-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1408.941459

- eval: E10
  run_id: minted-loi-hang-va-su-kien-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 1408.941459

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-loi-hang-va-su-kien-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T00:09:04Z

- cmd: npm run test:hooks
  run_id: minted-loi-hang-va-su-kien-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T00:09:04Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-loi-hang-va-su-kien-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T00:09:04Z

- cmd: npm run typecheck
  run_id: minted-loi-hang-va-su-kien-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T00:09:04Z

- cmd: npm run lint
  run_id: minted-loi-hang-va-su-kien-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T00:09:04Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sách eval không-phân-biệt không đo được ở round này vì mọi baseline là n-a. Không có eval nào được xác nhận là phân biệt hay không phân biệt.

### Baseline khong do

- npm run db:migrate && npm run db:test: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- npm test -w @quy-hang/api: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- npm test -w @quy-hang/core: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: mọi lệnh máy xanh nhưng verdict REJECT do ba finding trong hợp đồng — E9 (AC-9) ca đồng thời chỉ kiểm trạng thái cuối nằm trong một tập; E10 (AC-10) ca khuôn chặt chỉ thử vài điểm, ma trận khoá source lấy từ chính mã đang kiểm, ca khoá lồng không ghim lý do. Trả về thi công để siết phép đo.
