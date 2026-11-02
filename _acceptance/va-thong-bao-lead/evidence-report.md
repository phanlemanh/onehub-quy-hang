---
schema_version: 2
feature_slug: va-thong-bao-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 657c2dbd7257304fde9e7794bca0af43eccb23da
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: va-thong-bao-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-4 | test | PASS |
| E3 | AC-5 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-3 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-7 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-5 | test | PASS |
| E15 | AC-8 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-thong-bao-lead-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 258.340417

- eval: E2
  run_id: minted-va-thong-bao-lead-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60597.048375

- eval: E3
  run_id: minted-va-thong-bao-lead-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60597.048375

- eval: E4
  run_id: minted-va-thong-bao-lead-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 36975.434292

- eval: E5
  run_id: minted-va-thong-bao-lead-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 36975.434292

- eval: E6
  run_id: minted-va-thong-bao-lead-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 36975.434292

- eval: E7
  run_id: minted-va-thong-bao-lead-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2374.666708

- eval: E8
  run_id: mvz0m4nz
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T08:44:49Z
  screenshot: evidence/E8-luu-hong.png
  observed: |
    E8-luu-hong.png (1440x900, tối): dải đỏ đầu /today, tiêu đề "Chưa bật được thông báo — thử lại", dòng "Nhận thông báo khi lead về bạn…", nút "Bật thông báo" có icon chuông. Khớp Expected. E8-luu-duoc.png: không có dải; đầu trang là khối "Hôm nay · 4 việc" ngay trên cùng. Khớp Expected. E8-chua-bat.png: dải viền trung tính, tiêu đề "Bật thông báo lead", nút "Bật thông báo", khối "Hôm nay" bên dưới. Khớp Expected (hàng 26).
  network_observed: clean

- eval: E9
  run_id: minted-va-thong-bao-lead-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 36975.434292

- eval: E10
  run_id: minted-va-thong-bao-lead-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run typecheck hoàn tất, không lỗi kiểu

- eval: E11
  run_id: minted-va-thong-bao-lead-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E12
  run_id: minted-va-thong-bao-lead-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-02T08:44:49Z
  output: |
    design-floor-s4 hoàn tất, không mã màu thô trên tệp giao diện vòng chạm

- eval: E13
  run_id: minted-va-thong-bao-lead-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-thong-bao-lead/thu/ranh-gioi.mjs
  verified_at: 2026-11-02T08:44:49Z
  output: |
    0 tệp ngoài ranh giới

- eval: E14
  run_id: minted-va-thong-bao-lead-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 36975.434292

- eval: E15
  run_id: minted-va-thong-bao-lead-E15-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T08:44:49Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 36975.434292

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-thong-bao-lead-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T08:44:49Z

- cmd: npm run test:hooks
  run_id: minted-va-thong-bao-lead-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T08:44:49Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-thong-bao-lead-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T08:44:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả nhánh lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- npm test -w @quy-hang/core: E1
- npm test -w @quy-hang/api: E2, E3
- npm run db:migrate && npm run db:test: E4, E5, E6, E9, E14, E15
- npm test -w @quy-hang/web: E7
- npm run typecheck: E10
- npm run lint: E11
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .: E12

Baseline khong do

- node _acceptance/va-thong-bao-lead/thu/ranh-gioi.mjs: bo qua baseline: tep _acceptance/va-thong-bao-lead/thu/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base e1f939d59671c77d046ec8f0a1a77890397c4d54 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt, verdict PASS. Không có mục judgment; E8 (ui-check) đã mở từng khung ảnh để viết observed.
