---
schema_version: 2
feature_slug: va-gui-can-da-go
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3732ed3bad23ef65bd8ca147524405320a1931b8
human_signoff: Manh Phan 2026-11-05
---

# Evidence Report: va-gui-can-da-go

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-gui-can-da-go-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:26:52Z
  output: |
    npm run db:migrate && npm run db:test
    ca «gửi căn đã gỡ: Lần gửi mới bị từ chối» ok
    ℹ duration_ms 59591.841917
    __EXIT=0

- eval: E2
  run_id: minted-va-gui-can-da-go-E2-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:26:52Z
  output: |
    npm run db:migrate && npm run db:test
    ca «gửi căn đã gỡ: khách không quan tâm được» ok
    ℹ duration_ms 59591.841917
    __EXIT=0

- eval: E3
  run_id: minted-va-gui-can-da-go-E3-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:26:52Z
  output: |
    npm run db:migrate && npm run db:test
    ca «gửi căn đã gỡ (037): hàm chặn ở tầng dữ liệu» ok
    ℹ duration_ms 59591.841917
    __EXIT=0

- eval: E4
  run_id: minted-va-gui-can-da-go-E4-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:26:52Z
  output: |
    npm run db:migrate && npm run db:test
    ca «gửi căn đã gỡ (037): hàm giữ chữ ký và quyền» ok
    ca «gửi căn đã gỡ (037): chạy migrate lần hai không áp lại» ok
    ℹ duration_ms 59591.841917
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-05T05:26:52Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T05:26:52Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T05:26:52Z

- cmd: npm run test:hooks
  run_id: minted-va-gui-can-da-go-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T05:26:52Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-gui-can-da-go-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-05T05:26:52Z

- cmd: npm run typecheck
  run_id: minted-va-gui-can-da-go-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-05T05:26:52Z

- cmd: npm run lint
  run_id: minted-va-gui-can-da-go-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T05:26:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline): lệnh `npm run db:migrate && npm run db:test` gồm E1, E2, E3, E4. Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — mọi eval chạy một lần, deterministic, không có pass_rate hỗn hợp.

## Iterations

Round 1: bốn phát hiện trong hợp đồng ở AC-4 (E4 chưa chạy migrate lần hai, search_path chỉ kiểm có khoá) — trả về implementation.
Round 2: sửa xong bốn phát hiện; một phát hiện ngoài hợp đồng do sửa vòng 1 (bộ kiểm cách ly chạy migrate) — trả về implementation.
Round 3: ca migrate hai lần chuyển sang cơ sở dữ liệu tạm, bộ kiểm cách ly chỉ đọc; E1-E4 và toàn bộ lệnh suite xanh, không còn phát hiện.
