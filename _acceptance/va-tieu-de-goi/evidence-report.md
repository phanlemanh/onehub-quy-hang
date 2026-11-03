---
schema_version: 2
feature_slug: va-tieu-de-goi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b55c285c261ad2a63f9829cef71cb93e24acf6ac
human_signoff:
---

# Evidence Report: va-tieu-de-goi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-1 | ui-check | PASS |
| E4 | AC-2 | ui-check | PASS |
| E5 | AC-3 | script | PASS |
| E6 | AC-3 | script | PASS |
| E7 | AC-3 | script | PASS |
| E8 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-tieu-de-goi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T14:47:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1493.225666

- eval: E2
  run_id: minted-va-tieu-de-goi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-03T14:47:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1493.225666

- eval: E3
  run_id: minted-va-tieu-de-goi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T14:47:52Z
  screenshot: evidence/E3-cuoc-goi.png
  observed: |
    Đã mở từng frame bằng Read (375x812). Màn khai thác ?lead=, ép giá ?hang= (căn B-08.04) và quay số: thanh trên đều ghi «Ghi cuộc gọi», không frame nào có chữ «Căn call».
    Ở màn lead và quay số, thân trang còn khung xương đang tải lúc chụp nên phần «không có Căn call» chỉ kiểm được trên văn bản và HTML đang có; khớp Expected ở thanh trên.
  network_observed: clean

- eval: E4
  run_id: minted-va-tieu-de-goi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-03T14:47:52Z
  screenshot: evidence/E4-ho-so.png
  observed: |
    /inventory (375x812, cảm ứng): thanh trên «Bảng hàng», 24 căn, thẻ đầu B-08.04 Đang giao dịch 4,53 tỷ.
    Mở /units/B-08.04: thanh trên của vỏ điện thoại ghi «Căn B-08.04», đúng mã căn vừa mở; thân trang có khối Ảnh và Thuộc tính căn. Khớp Expected.
  network_observed: clean

- eval: E5
  run_id: minted-va-tieu-de-goi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-03T14:47:52Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E6
  run_id: minted-va-tieu-de-goi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-03T14:47:52Z
  output: |
    npm run typecheck (mọi gói)

- eval: E7
  run_id: minted-va-tieu-de-goi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-03T14:47:52Z
  output: |
    design-floor-s4.mjs --root .

- eval: E8
  run_id: minted-va-tieu-de-goi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-03T14:47:52Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    3 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-tieu-de-goi-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-03T14:47:52Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-tieu-de-goi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-03T14:47:52Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-tieu-de-goi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-03T14:47:52Z

- cmd: npm run test:hooks
  run_id: minted-va-tieu-de-goi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-03T14:47:52Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-tieu-de-goi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-03T14:47:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline; chứng minh harness chứ chưa chứng minh feature — viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E1, E2 (`npm test -w @quy-hang/web`)
- E5 (`npm run lint`)
- E6 (`npm run typecheck`)
- E7 (design-floor-s4.mjs)
- E8 (design-floor-khuon.mjs --kiem)

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: tất cả eval pass — không có eval nào hỏng. Verdict PASS.
