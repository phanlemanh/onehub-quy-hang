---
schema_version: 2
feature_slug: va-dien-ma-can-cho-hang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cecab3b1f148b0fe2e6953b6b2373673b15e8c8f
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: va-dien-ma-can-cho-hang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3u | AC-3 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-va-dien-ma-can-cho-hang-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T15:29:02Z
  output: |
    ℹ duration_ms 202.0225

- eval: E2
  run_id: minted-va-dien-ma-can-cho-hang-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:29:02Z
  output: |
    ℹ duration_ms 38285.689625

- eval: E3
  run_id: minted-va-dien-ma-can-cho-hang-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T15:29:02Z
  output: |
    ℹ duration_ms 1266.260083

- eval: E3u
  run_id: minted-va-dien-ma-can-cho-hang-E3u-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T15:29:02Z
  screenshot: evidence/E3u-1-ma-toan-dau.png
  observed: |
    Frame E3u-1-ma-toan-dau.png (1440x900): hồ sơ căn bên phải, tiêu đề «Chưa có mã căn» (chip «Chưa đủ để rao»); mục Thuộc tính căn có nhãn «Mã căn» đỏ + chip «Chưa có», ô nhập viền đỏ chứa «---», nút «Lưu mã căn», dưới ô dòng đỏ «Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)», dòng Toà = Toà A. Khớp Expected. Frame E3u-2-375.png (375x812): cùng màn dạng điện thoại, ô viền đỏ chứa «---», nút «Lưu mã căn» full-width, câu báo đỏ dưới ô xuống 2 dòng, đọc trọn «Mã căn cần ít nhất một chữ (A–Z) hoặc số (0–9)» (ngắt ở «(0–» / «9)» nhưng không bị cắt); không có thanh cuộn ngang. Khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T15:29:02Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T15:29:02Z

- cmd: npm run test:hooks
  run_id: minted-va-dien-ma-can-cho-hang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T15:29:02Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-dien-ma-can-cho-hang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T15:29:02Z

- cmd: npm run typecheck
  run_id: minted-va-dien-ma-can-cho-hang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T15:29:02Z

- cmd: npm run lint
  run_id: minted-va-dien-ma-can-cho-hang-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-02T15:29:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên code mới lẫn baseline): E1 (npm test -w @quy-hang/core), E2 (npm run db:migrate && npm run db:test), E3 (npm test -w @quy-hang/web). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đạt (E1, E2, E3, E3u); không có eval hỏng.

### Re-pin lần 1 — 2026-11-02, do gộp main lần một sau chữ ký
run_id: repin-20261102T154259Z-31636
sha: cecab3b1f148b0fe2e6953b6b2373673b15e8c8f · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · ngoài làn máy: E3u
