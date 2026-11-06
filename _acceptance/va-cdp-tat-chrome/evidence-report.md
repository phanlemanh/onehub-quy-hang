---
schema_version: 2
feature_slug: va-cdp-tat-chrome
verdict: REJECT
failed_evals: [E3]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 15e09389f134542f0805ae5630e85bf635c75228
human_signoff:
---

# Evidence Report: va-cdp-tat-chrome

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | REJECT |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-1 | script | PASS |

Round 2: E3 đỏ ở ca SIGINT («hồ sơ tạm còn trên đĩa (SIGINT)»). Ba ca còn lại của E3 (SIGTERM, SIGHUP, bat-rieng) đạt. Lệnh đỏ duy nhất là lệnh của E3; không có lệnh đỏ nào nằm ngoài eval.

## Evidence

- eval: E1
  run_id: minted-va-cdp-tat-chrome-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:17:18Z
  output: |
    {"ca":"dong","ok":true,"loi":[]}

- eval: E2
  run_id: minted-va-cdp-tat-chrome-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:17:18Z
  output: |
    {"ca":"dong-exit-3","ok":true,"loi":[]}

- eval: E3
  run_id: minted-va-cdp-tat-chrome-E3-r2
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:17:18Z
  output: |
    {"ca":"SIGTERM","ok":true,"loi":[]}
    {"ca":"SIGINT","ok":false,"loi":["hồ sơ tạm còn trên đĩa (SIGINT)"]}
    {"ca":"SIGHUP","ok":true,"loi":[]}
    {"ca":"bat-rieng","ok":true,"loi":[]}

- eval: E4
  run_id: minted-va-cdp-tat-chrome-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:17:18Z
  output: |
    (không có dòng in ra; lệnh thoát sạch)

- eval: E5
  run_id: minted-va-cdp-tat-chrome-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:17:18Z
  output: |
    {"ca":"mo-coi","ok":true,"loi":[]}

- eval: E6
  run_id: minted-va-cdp-tat-chrome-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:17:18Z
  output: |
    {"ca":"api","ok":true,"loi":[]}

- eval: E7
  run_id: minted-va-cdp-tat-chrome-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:17:18Z
  output: |
    {"ban":"cu","ca":"api","ky_vong":"xanh","dung":true,"loi":[]}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-06T06:17:18Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T06:17:18Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T06:17:18Z

- cmd: npm run test:hooks
  run_id: minted-va-cdp-tat-chrome-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T06:17:18Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T06:17:18Z

- cmd: npm run typecheck
  run_id: minted-va-cdp-tat-chrome-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-06T06:17:18Z

- cmd: npm run lint
  run_id: minted-va-cdp-tat-chrome-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-06T06:17:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều không đo được trên baseline (xem «Baseline khong do»), nên không có eval nào bị xác định là không-phân-biệt.

### Baseline khong do

- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca dong: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca thoat --ca loi --ca dong-exit-0 --ca dong-exit-3: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGTERM --ca SIGINT --ca SIGHUP --ca bat-rieng: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGKILL: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca mo-coi: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca api: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --doi-chung-do 382a010c4a0e6a60ec5c43d3c8a6c2de1d90beee: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval đều chạy một lần, xác định; không có eval nhiều lần.

## Iterations

Round 1: lượt chấm 1 trả về — phép đo stderr và rào thư mục tạm chưa đo thật. Returned to implementation.
Round 2: E3 failed — ca SIGINT để lại hồ sơ tạm trên đĩa. Returned to implementation.
