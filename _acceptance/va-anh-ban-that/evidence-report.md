---
schema_version: 2
feature_slug: va-anh-ban-that
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 077b6cefbf44e8f545ea32620a87a6d9a7b199bc
human_signoff:
---

# Evidence Report: va-anh-ban-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-va-anh-ban-that-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:22:22Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4946.697917

- eval: E2
  run_id: minted-va-anh-ban-that-E2-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:22:22Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4946.697917

- eval: E3
  run_id: minted-va-anh-ban-that-E3-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:22:22Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4946.697917

- eval: E4
  run_id: minted-va-anh-ban-that-E4-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T13:22:22Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4946.697917

- eval: E1b
  run_id: minted-va-anh-ban-that-E1b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-01T13:22:22Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60462.078667

- eval: E1c
  run_id: minted-va-anh-ban-that-E1c-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T13:22:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 279.126667

- eval: E5
  run_id: minted-va-anh-ban-that-E5-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T13:22:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 279.126667

- eval: E6
  run_id: minted-va-anh-ban-that-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T13:22:22Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png (đã mở bằng Read, 1440x900): Bảng hàng với hồ sơ căn A-06.01 (Toà A, Đang bán) mở bên phải. Mục ẢNH, tab «Gửi được (1)» đang chọn, có một ô ảnh nhiễu màu gắn nhãn «Bìa», tiêu đề «Ảnh thật · 01/11/20…», nút «...». Tức ảnh PNG 5.401.883 byte (khoảng 5,4 MB, lớn hơn 4,5 MB) đã vào ngăn Gửi được. Khớp Expected bước 1. E6-step2.png (đã mở bằng Read): cùng hồ sơ, ngăn vẫn «Gửi được (1)» và ảnh «Bìa» vẫn còn. Góc dưới phải có thông báo có biểu tượng lỗi «Không xoá ảnh được — thử lại». Khớp Expected bước 2.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-01T13:22:22Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-01T13:22:22Z

- cmd: npm run test:hooks
  run_id: minted-va-anh-ban-that-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-01T13:22:22Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-anh-ban-that-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-01T13:22:22Z

- cmd: npm run typecheck
  run_id: minted-va-anh-ban-that-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-01T13:22:22Z

- cmd: npm run lint
  run_id: minted-va-anh-ban-that-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-01T13:22:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

Non-discriminating (xanh ở cả code hiện tại lẫn baseline), cần viết lại để khẳng định hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- `npm run db:migrate && npm run db:test` — E1, E2, E3, E4
- `npm test -w @quy-hang/api` — E1b
- `npm test -w @quy-hang/web` — E1c, E5

E6 (ui-check): baseline n-a, không chạy được trên code cũ.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm đầu của hàng va-anh-ban-that; chi tiết xem run-log.jsonl và hồ sơ lượt 1 (xác nhận mã ảnh từ chối 400/409 thay vì 500; E2 đo ca sàn khác).
Round 2: lượt 2 — thông báo lỗi sửa/xoá không hiện ở hồ sơ căn (E6); mục Ảnh tự gắn khung thông báo rồi chấm lại.
Round 3: mọi eval xanh (E1, E1b, E1c, E2, E3, E4, E5, E6) trên commit 077b6cef — verdict PASS.

