---
schema_version: 2
feature_slug: trang-khach-rieng
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6aff427b2a0a740a3e1da3ef04bc801cd939646d
human_signoff: Manh Phan 2026-11-04
---

# Evidence Report: trang-khach-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-3 | ui-check | PASS |
| E12 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-khach-rieng-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 49462.570834

- eval: E3b
  run_id: minted-trang-khach-rieng-E3b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 49462.570834

- eval: E4b
  run_id: minted-trang-khach-rieng-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 49462.570834

- eval: E5b
  run_id: minted-trang-khach-rieng-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 49462.570834

- eval: E6
  run_id: minted-trang-khach-rieng-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 49462.570834

- eval: E7
  run_id: minted-trang-khach-rieng-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 49462.570834

- eval: E9
  run_id: minted-trang-khach-rieng-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 49462.570834

- eval: E1b
  run_id: minted-trang-khach-rieng-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3198.774375

- eval: E2
  run_id: minted-trang-khach-rieng-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3198.774375

- eval: E3
  run_id: minted-trang-khach-rieng-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3198.774375

- eval: E3c
  run_id: minted-trang-khach-rieng-E3c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3198.774375

- eval: E4
  run_id: minted-trang-khach-rieng-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3198.774375

- eval: E5
  run_id: minted-trang-khach-rieng-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3198.774375

- eval: E6b
  run_id: minted-trang-khach-rieng-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3198.774375

- eval: E8
  run_id: minted-trang-khach-rieng-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 500.292125

- eval: E10
  run_id: minted-trang-khach-rieng-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T08:38:26Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 21974.703875

- eval: E12
  run_id: minted-trang-khach-rieng-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T08:38:26Z
  output: |
    design-floor-khuon --kiem
    11 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-trang-khach-rieng-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T08:38:26Z
  screenshot: evidence/E11-step1.png
  observed: |
    Đã mở bằng Read từng khung, khổ 375, không đăng nhập. step1: đầu trang «[Mẫu] Sàn thử» và «[Mẫu] Đầu khách gửi bạn 4 căn»; lưới 4 thẻ có ảnh; mỗi thẻ chỉ có «Toà A/B», không mã căn; có giá (4,95 tỷ; 3,56 tỷ; 4,36 tỷ; 8,06 tỷ) và «Giá xác nhận hôm nay» (căn thứ tư «Giá xác nhận 15 ngày trước»); ba thẻ có nút Quan tâm. step2: thẻ Toà B 3,56 tỷ mờ, nhãn «Đã có người đặt cọc», không nút (article data-trang-thai=under_contract, 0 button). step3: thẻ đầu đổi nút thành «Đã báo quan tâm» (mờ, tim đặc), hai căn còn lại vẫn «Quan tâm». step4: chi tiết Toà B 4,36 tỷ: ảnh lớn, Pháp lý Sổ hồng, Hiện trạng Chủ ở, giá, «Giá xác nhận hôm nay», nút Quan tâm. step5: /s/AAAAAAAAAAAA chỉ hiện «Link không còn mở được — hỏi lại người gửi», không tên sàn.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-trang-khach-rieng-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-04T08:38:26Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-khach-rieng-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T08:38:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-khach-rieng-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T08:38:26Z

- cmd: npm run test:hooks
  run_id: minted-trang-khach-rieng-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T08:38:26Z

- cmd: npm run typecheck
  run_id: minted-trang-khach-rieng-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T08:38:26Z

- cmd: npm run lint
  run_id: minted-trang-khach-rieng-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T08:38:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả mã hiện tại lẫn baseline, chứng minh bộ kiểm chứ chưa chứng minh tính năng; cần viết lại để khẳng định hành vi mới, hoặc xác nhận là lưới hồi quy có chủ ý):
- npm run db:migrate && npm run db:test: E1, E3b, E4b, E5b, E6, E7, E9
- npm test -w @quy-hang/web: E1b, E2, E3, E3c, E4, E5, E6b
- npm run test:ro-ri: E8
- npm test -w @quy-hang/ui-lint: E10
- design-floor-khuon --kiem: E12

Baseline không đo: E11 (eval giao diện, không chạy được trên baseline); sáu lệnh suite hồi quy (n-a, không gắn eval).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: 18 eval đều xanh, không có eval hỏng; không có mục nào chờ người chốt. Các phát hiện ngoài hợp đồng nằm ở review-findings.md.

### Re-pin lần 1 — 2026-11-04, do hoá cũ do gộp nhánh chính sau chữ ký
run_id: repin-20261104T085754Z-60386
sha: 6aff427b2a0a740a3e1da3ef04bc801cd939646d · suites: 7 lệnh exit 0 · evals: 17/17 eval máy đạt kỳ vọng · ngoài làn máy: E11
