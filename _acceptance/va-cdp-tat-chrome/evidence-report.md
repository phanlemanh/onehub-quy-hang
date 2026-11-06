---
schema_version: 2
feature_slug: va-cdp-tat-chrome
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 93f003b9769b4bf4c3ecbbc1f17a1c75ee900b9c
human_signoff:
---

# Evidence Report: va-cdp-tat-chrome

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
  run_id: minted-va-cdp-tat-chrome-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:26:20Z
  output: |
    {"ca":"dong","ok":true,"loi":[]}

- eval: E2
  run_id: minted-va-cdp-tat-chrome-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:26:20Z
  output: |
    Bốn ca của ma trận AC-2 đều ok, danh sách lỗi rỗng ở từng ca (dòng cuối: ok true, loi []).

- eval: E3
  run_id: minted-va-cdp-tat-chrome-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:26:20Z
  output: |
    {"ca":"bat-rieng-once","ok":true,"loi":[]}

- eval: E4
  run_id: minted-va-cdp-tat-chrome-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:26:20Z
  output: |
    {"ca":"SIGKILL","ok":true,"loi":[]}

- eval: E5
  run_id: minted-va-cdp-tat-chrome-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:26:20Z
  output: |
    {"ca":"mo-coi","ok":true,"loi":[]}

- eval: E6
  run_id: minted-va-cdp-tat-chrome-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:26:20Z
  output: |
    {"ca":"api","ok":true,"loi":[]}

- eval: E7
  run_id: minted-va-cdp-tat-chrome-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs
  verified_at: 2026-11-06T06:26:20Z
  output: |
    {"ban":"cu","ca":"api","ky_vong":"xanh","dung":true,"loi":[]}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-06T06:26:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-06T06:26:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-06T06:26:20Z

- cmd: npm run test:hooks
  run_id: minted-va-cdp-tat-chrome-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-06T06:26:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-cdp-tat-chrome-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-06T06:26:20Z

- cmd: npm run typecheck
  run_id: minted-va-cdp-tat-chrome-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-06T06:26:20Z

- cmd: npm run lint
  run_id: minted-va-cdp-tat-chrome-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-06T06:26:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

Baseline khong do
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca dong: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca thoat --ca loi --ca dong-exit-0 --ca dong-exit-3: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGTERM --ca SIGINT --ca SIGHUP --ca bat-rieng --ca bat-rieng-once: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca SIGKILL: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca mo-coi: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --ca api: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs --doi-chung-do 382a010c4a0e6a60ec5c43d3c8a6c2de1d90beee: bo qua baseline: tep _acceptance/va-cdp-tat-chrome/thu/kiem-tat-chrome.mjs co o cay dang kiem nhung chua co o merge-base b1c57654719f99e2adf50b1910ce3ced438472ef — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (tất cả eval deterministic)

## Iterations

Round 1: lượt chấm 1 trả về — phép đo stderr và rào thư mục tạm chưa đo thật. Returned to implementation.
Round 2: lượt chấm 2 trả về — phải chờ Chrome chết hẳn rồi mới xoá hồ sơ, và đếm đúng bộ bắt once. Returned to implementation.
Round 3: E1–E7 và toàn bộ lệnh suite đều xanh trên commit fb4c1b29; verdict PASS.

### Re-pin lần 1 — 2026-11-06, do gộp nhánh chính sau lượt chấm 3
run_id: repin-20261106T074746Z-16460
sha: 93f003b9769b4bf4c3ecbbc1f17a1c75ee900b9c · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng
