---
schema_version: 2
feature_slug: va-bang-hang-cuon-so-lon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a515b7ae1305653f114bf5e6063d1aecb889d0fe
human_signoff:
---

# Evidence Report: va-bang-hang-cuon-so-lon

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-bang-hang-cuon-so-lon-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T15:07:13Z
  output: |
    node _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs --kho 1366x768 --kho 1920x1080 --kho 375x812 --kho 375x812-ho-so --kho "1366x768>375x812" --kem-e11
    {"kho":"e11","ok":true,"loi":[],"hieu_nang":"trung vị: {\"p95\":33.4,\"ty_le_cham\":0.0117,\"dong_cuoi_thay\":5000} → trượt: khung > 50 ms 0.0117 > 0.01","tai_may":"3.8 6.1 5.6"}
    Lệnh chạy một lần cho cả E1, E2, E4, E6.

- eval: E2
  run_id: minted-va-bang-hang-cuon-so-lon-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T15:07:13Z
  output: |
    {"kho":"e11","ok":true,"loi":[],"hieu_nang":"trung vị: {\"p95\":33.4,\"ty_le_cham\":0.0117,\"dong_cuoi_thay\":5000} → trượt: khung > 50 ms 0.0117 > 0.01","tai_may":"3.8 6.1 5.6"}
    hieu_nang và tai_may là thông tin, không quyết; dong_cuoi_thay 5000.

- eval: E3
  run_id: minted-va-bang-hang-cuon-so-lon-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T15:07:13Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3329.93975

- eval: E4
  run_id: minted-va-bang-hang-cuon-so-lon-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T15:07:13Z
  output: |
    Cùng lệnh với E1; các dòng khổ 375x812 và 1366x768>375x812 đạt trong lượt chạy này.
    {"kho":"e11","ok":true,"loi":[]}

- eval: E5
  run_id: minted-va-bang-hang-cuon-so-lon-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T15:07:13Z
  output: |
    node "$R/scripts/design-floor-khuon.mjs" --kiem --root .
    3 tệp giao diện ngoài bản đồ

- eval: E6
  run_id: minted-va-bang-hang-cuon-so-lon-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T15:07:13Z
  output: |
    Cùng lệnh với E1; dòng khổ 375x812-ho-so đạt trong lượt chạy này.
    {"kho":"e11","ok":true,"loi":[]}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-06T15:07:13Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T15:07:13Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T15:07:13Z

- cmd: npm run test:hooks
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T15:07:13Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T15:07:13Z

- cmd: npm run typecheck
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-06T15:07:13Z

- cmd: npm run lint
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-06T15:07:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline):
- E3 — `npm test -w @quy-hang/web`: bộ kiểm của gói web xanh cả trên baseline; là bài giữ hồi quy có chủ ý ở mức gói, ba ca của do-the.test.ts là phần mới.
- E5 — `design-floor-khuon.mjs --kiem`: bài giữ hồi quy có chủ ý cho vế «bảng thẻ vẫn dùng TrangThai», không chứng minh hành vi mới.

Baseline khong do:
- node _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs --kho 1366x768 --kho 1920x1080 --kho 375x812 --kho 375x812-ho-so --kho "1366x768>375x812" --kem-e11: bo qua baseline: tep _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs co o cay dang kiem nhung chua co o merge-base 17870217aed8e0877385ac4a6884137e1b0dd249 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E6 đều đạt, các lệnh suite xanh. Chuyển Cổng 2.
Round 2: chạy lại trên commit a515b7ae sau khi gộp nhánh chính; E1–E6 đều đạt, bảy lệnh suite xanh.
