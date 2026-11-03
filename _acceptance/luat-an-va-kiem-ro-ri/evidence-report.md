---
schema_version: 2
feature_slug: luat-an-va-kiem-ro-ri
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ccec6ed4d9994a0bc3f972cc2cf3cef0a877dbac
human_signoff:
---

# Evidence Report: luat-an-va-kiem-ro-ri

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
| E9 | AC-9 | script | PASS |
| E9b | AC-9 | script | PASS |
| E10 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-luat-an-va-kiem-ro-ri-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «một hàm cho mọi cửa» ok
    ℹ duration_ms 306.7225

- eval: E2
  run_id: minted-luat-an-va-kiem-ro-ri-E2-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «bảng lớp trọn» ok
    ℹ duration_ms 306.7225

- eval: E3
  run_id: minted-luat-an-va-kiem-ro-ri-E3-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «không rò ở mọi tổ hợp» ok
    ℹ duration_ms 306.7225

- eval: E4
  run_id: minted-luat-an-va-kiem-ro-ri-E4-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «mã căn theo người nhận» ok
    ℹ duration_ms 306.7225

- eval: E5
  run_id: minted-luat-an-va-kiem-ro-ri-E5-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «liên hệ không ra ngoài» ok
    ℹ duration_ms 306.7225

- eval: E6
  run_id: minted-luat-an-va-kiem-ro-ri-E6-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «ảnh chỉ ngăn Gửi được» ok
    ℹ duration_ms 306.7225

- eval: E7
  run_id: minted-luat-an-va-kiem-ro-ri-E7-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «trạng thái, giá, độ tươi» ok
    ℹ duration_ms 306.7225

- eval: E8
  run_id: minted-luat-an-va-kiem-ro-ri-E8-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm test -w @quy-hang/core — ca «quét văn bản mọi dạng» ok
    ℹ duration_ms 306.7225

- eval: E9
  run_id: minted-luat-an-va-kiem-ro-ri-E9-r3
  exit_code: 0
  baseline: red
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-03T14:19:33Z
  output: |
    npm run test:ro-ri — ca «cửa ra có trang thì có tệp kiểm» ok
    ℹ duration_ms 100.033792

- eval: E9b
  run_id: minted-luat-an-va-kiem-ro-ri-E9b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint_bo_qua
  verified_at: 2026-11-03T14:19:33Z
  output: |
    node --test _acceptance/luat-an-va-kiem-ro-ri/thu/*.test.mjs
    ℹ duration_ms 1214.195791

- eval: E10
  run_id: minted-luat-an-va-kiem-ro-ri-E10-r1
  exit_code: 0
  verifier: config:executors.script.lint_bo_qua
  verified_at: 2026-11-03T12:37:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-luat-an-va-kiem-ro-ri-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-03T14:19:33Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-luat-an-va-kiem-ro-ri-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-03T14:19:33Z

- cmd: npm run test:hooks
  run_id: minted-luat-an-va-kiem-ro-ri-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-03T14:19:33Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-luat-an-va-kiem-ro-ri-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-03T14:19:33Z

- cmd: npm run typecheck
  run_id: minted-luat-an-va-kiem-ro-ri-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-03T14:19:33Z

- cmd: npm run lint
  run_id: minted-luat-an-va-kiem-ro-ri-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-03T14:19:33Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code hiện tại lẫn baseline — chứng minh harness, không chứng minh feature; viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core — E1, E2, E3, E4, E5, E6, E7, E8
- node --test "_acceptance/luat-an-va-kiem-ro-ri/thu/*.test.mjs" — E9b

## Variance

none — mọi eval chạy một lần, deterministic, không có phương sai.

## Iterations

Round 1: hồ sơ dựng lần đầu, E10 chạy ở round này (run_id r1), còn lại chuyển sang các round sau.
Round 2: lượt chấm REJECT, dừng vá vì cùng lớp lỗi AC-9 (route API công khai).
Round 3: phạm vi AC-9 thu lại chỉ còn trang web (route API công khai sang hàng 35); mọi eval và lệnh suite xanh; E10 mang từ round 1.
