---
schema_version: 2
feature_slug: va-bang-hang-cuon-so-lon
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 61b846e3d749cb1fdeb427521dec5f570b862a38
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
  run_id: minted-va-bang-hang-cuon-so-lon-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T14:57:27Z
  output: |
    node _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs --kho 1366x768 --kho 1920x1080 --kho 375x812 --kho 375x812-ho-so --kho "1366x768>375x812" --kem-e11
    {"kho":"e11","ok":true,"loi":[],"hieu_nang":"trung vị: {\"p95\":33.4,\"ty_le_cham\":0.0123,\"dong_cuoi_thay\":5000} → trượt: khung > 50 ms 0.0123 > 0.01","tai_may":"5.1 5.8 4.9"}
    Lệnh chạy một lần cho cả E1, E2, E4, E6; các dòng khổ 1366x768 và 1920x1080 đạt.

- eval: E2
  run_id: minted-va-bang-hang-cuon-so-lon-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T14:57:27Z
  output: |
    {"kho":"e11","ok":true,"loi":[],"hieu_nang":"trung vị: {\"p95\":33.4,\"ty_le_cham\":0.0123,\"dong_cuoi_thay\":5000} → trượt: khung > 50 ms 0.0123 > 0.01","tai_may":"5.1 5.8 4.9"}
    hieu_nang và tai_may là thông tin, không quyết; dòng e11 đạt với dong_cuoi_thay 5000.

- eval: E3
  run_id: minted-va-bang-hang-cuon-so-lon-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: apps/web/src/app/(app)/inventory/cards/do-the.test.ts
  verified_at: 2026-11-06T14:57:27Z
  output: |
    cd apps/web && TSX_TSCONFIG_PATH=tsconfig.test.json node --import tsx --test "src/app/(app)/inventory/cards/do-the.test.ts"
    ℹ duration_ms 88.7765

- eval: E4
  run_id: minted-va-bang-hang-cuon-so-lon-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T14:57:27Z
  output: |
    Cùng lệnh với E1; các dòng khổ 375x812 và 1366x768>375x812 đạt trong lượt chạy này.
    {"kho":"e11","ok":true,"loi":[]}

- eval: E5
  run_id: minted-va-bang-hang-cuon-so-lon-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T14:57:27Z
  output: |
    node "$R/scripts/design-floor-khuon.mjs" --kiem --root .
    3 tệp giao diện ngoài bản đồ

- eval: E6
  run_id: minted-va-bang-hang-cuon-so-lon-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs
  verified_at: 2026-11-06T14:57:27Z
  output: |
    Cùng lệnh với E1; dòng khổ 375x812-ho-so đạt trong lượt chạy này.
    {"kho":"e11","ok":true,"loi":[]}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T14:57:27Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T14:57:27Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T14:57:27Z

- cmd: npm run test:hooks
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T14:57:27Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T14:57:27Z

- cmd: npm run typecheck
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T14:57:27Z

- cmd: npm run lint
  run_id: minted-va-bang-hang-cuon-so-lon-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T14:57:27Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline): E5 — lệnh chấm khuôn thiết kế `design-floor-khuon.mjs --kiem`. Đây là bài giữ hồi quy có chủ ý cho vế «bảng thẻ vẫn dùng TrangThai», không chứng minh hành vi mới.

Baseline khong do:
- node _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs --kho 1366x768 --kho 1920x1080 --kho 375x812 --kho 375x812-ho-so --kho "1366x768>375x812" --kem-e11: bo qua baseline: tep _acceptance/va-bang-hang-cuon-so-lon/thu/kiem-cuon.mjs co o cay dang kiem nhung chua co o merge-base 29b914de783df1888afb81d48962a080b666c1d1 — eval moi, chay tren code cu khong phan biet gi
- cd apps/web && TSX_TSCONFIG_PATH=tsconfig.test.json node --import tsx --test "src/app/(app)/inventory/cards/do-the.test.ts": bo qua baseline: tep apps/web/src/app/(app)/inventory/cards/do-the.test.ts co o cay dang kiem nhung chua co o merge-base 29b914de783df1888afb81d48962a080b666c1d1 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1–E6 đều đạt, các lệnh suite xanh. Chuyển Cổng 2.
