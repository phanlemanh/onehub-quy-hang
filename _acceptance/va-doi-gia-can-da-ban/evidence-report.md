---
schema_version: 2
feature_slug: va-doi-gia-can-da-ban
verdict: REJECT
failed_evals: ["E2"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a2c71a7667e9b82556aa40533525ba591ee3064e
human_signoff:
---

# Evidence Report: va-doi-gia-can-da-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | REJECT |
| E3 | AC-3 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-doi-gia-can-da-ban-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-03T13:59:59Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 319.169167

- eval: E2
  run_id: minted-va-doi-gia-can-da-ban-E2-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-03T13:59:59Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ✖ failing tests:
    test at test-db/leads-mine.test.ts
    ✖ số đo: ngày lead → Sẵn sàng bán trên bộ mẫu
      AssertionError: Expected values to be strictly deep-equal
      thừa một hàng thực tế có khoảng ngày 0.0 ở đầu danh sách so với kỳ vọng (hàng đầu kỳ vọng là 3.0)
      at packages/api/test-db/leads-mine.test.ts:486:10
    Lệnh dừng lỗi ở bước test:db của @quy-hang/api.
    Lệnh này gộp cả bộ db:test nên một ca đỏ ngoài tệp doi-gia-da-ban làm cả lệnh đỏ; báo cáo này không tự quy lỗi cho ca AC-2.

- eval: E3
  run_id: minted-va-doi-gia-can-da-ban-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-03T13:59:59Z
  output: |
    lệnh: npm run test:db -w @quy-hang/web
    ℹ duration_ms 1619.27075

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-doi-gia-can-da-ban-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-03T13:59:59Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-doi-gia-can-da-ban-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-03T13:59:59Z

- cmd: npm run test:hooks
  run_id: minted-va-doi-gia-can-da-ban-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-03T13:59:59Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-doi-gia-can-da-ban-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-03T13:59:59Z

- cmd: npm run typecheck
  run_id: minted-va-doi-gia-can-da-ban-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-03T13:59:59Z

- cmd: npm run lint
  run_id: minted-va-doi-gia-can-da-ban-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-03T13:59:59Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên code mới lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core (E1)
- npm run test:db -w @quy-hang/web (E3)

Lệnh fail không gắn eval: không có. Lệnh fail duy nhất, npm run db:migrate && npm run db:test, gắn với E2; ca đỏ nằm ở tệp leads-mine.test.ts (phép đo ngày lead sang Sẵn sàng bán), không phải tệp doi-gia-da-ban. Cần người đọc kết quả E2 để biết lỗi này có thuộc phạm vi AC-2 hay là ca nhạy thời gian ở bộ mẫu có sẵn.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, xác định)

## Iterations

Round 1: E2 failed — lệnh db:migrate + db:test dừng lỗi ở ca «số đo: ngày lead → Sẵn sàng bán trên bộ mẫu» (leads-mine.test.ts), thừa một hàng có khoảng ngày 0.0. Returned to implementation.
