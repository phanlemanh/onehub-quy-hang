---
schema_version: 2
feature_slug: va-cdp-tat-chrome
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f5c8de6339ae24549e4915636fad01d1e818b193
human_signoff:
---

# Evidence Report: va-cdp-tat-chrome

Lý do REJECT: lệnh suite `npm run typecheck` đỏ và không gắn eval nào (xem mục Lệnh suite). Bảy eval của tính năng đều xanh, nên `failed_evals` để rỗng.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-cdp-tat-chrome-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:08:03Z
  output: |
    node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca dong
    (ca dong: đối chứng dương đạt, không còn Chrome, hồ sơ tạm, dòng sổ, người canh sau dong())
    __EXIT=0

- eval: E2
  run_id: minted-va-cdp-tat-chrome-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:08:03Z
  output: |
    node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca thoat --ca loi --ca dong-exit-0 --ca dong-exit-3
    {"ca":"dong-exit-3","ok":true,"loi":[]}
    __EXIT=0

- eval: E3
  run_id: minted-va-cdp-tat-chrome-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:08:03Z
  output: |
    node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGTERM --ca SIGINT --ca SIGHUP --ca bat-rieng
    {"ca":"bat-rieng","ok":true,"loi":[]}
    __EXIT=0

- eval: E4
  run_id: minted-va-cdp-tat-chrome-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:08:03Z
  output: |
    node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGKILL
    {"ca":"SIGKILL","ok":true,"loi":[]}
    __EXIT=0

- eval: E5
  run_id: minted-va-cdp-tat-chrome-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:08:03Z
  output: |
    node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca mo-coi
    {"ca":"mo-coi","ok":true,"loi":[]}
    __EXIT=0

- eval: E6
  run_id: minted-va-cdp-tat-chrome-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:08:03Z
  output: |
    node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca api
    {"ca":"api","ok":true,"loi":[]}
    __EXIT=0

- eval: E7
  run_id: minted-va-cdp-tat-chrome-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:08:03Z
  output: |
    node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --doi-chung-do 382a010c4a0e6a60ec5c43d3c8a6c2de1d90beee
    {"ban":"cu","ca":"api","ky_vong":"xanh","dung":true,"loi":[]}
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T06:08:03Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T06:08:03Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T06:08:03Z

- cmd: npm run test:hooks
  run_id: minted-va-cdp-tat-chrome-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T06:08:03Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T06:08:03Z

- cmd: npm run typecheck
  run_id: minted-va-cdp-tat-chrome-SUITE-typecheck-r1
  exit_code: 2
  verified_at: 2026-11-06T06:08:03Z
  output: |
    apps/web/src/lib/api.ts dòng 2: TS2307 không tìm thấy module '@vercel/functions' (lỗi lặp lại ở packages/api qua tệp web đó).
    Các gói connect, core, db typecheck sạch.

- cmd: npm run lint
  run_id: minted-va-cdp-tat-chrome-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T06:08:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào được đo xanh ở cả hai phía (baseline không đo được, xem mục dưới).

Baseline khong do
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca dong: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca thoat --ca loi --ca dong-exit-0 --ca dong-exit-3: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGTERM --ca SIGINT --ca SIGHUP --ca bat-rieng: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGKILL: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca mo-coi: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca api: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --doi-chung-do 382a010c4a0e6a60ec5c43d3c8a6c2de1d90beee: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval chạy một lần, tất định, không eval nào phương sai.

## Judge

Không có panel giám khảo nào (mọi eval là script, không eval judgment).

## Iterations

Round 1: bảy eval của tính năng xanh, nhưng lệnh suite `npm run typecheck` đỏ (không tìm thấy module '@vercel/functions' ở apps/web/src/lib/api.ts, không gắn eval nào) nên verdict REJECT. Trả về bước triển khai.
