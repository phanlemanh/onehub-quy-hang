---
schema_version: 2
feature_slug: va-ac9-mau-co-san
verdict: REJECT
failed_evals: ["E3"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 13a5e6be0536f3f5654fc23aac2d4d52a812f017
human_signoff:
---

# Evidence Report: va-ac9-mau-co-san

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | REJECT |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-ac9-mau-co-san-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:43:42Z
  output: |
    {"ca":"deploy-san-khac","ok":true,"loi":[],"ma_tep":0}

- eval: E2
  run_id: minted-va-ac9-mau-co-san-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:43:42Z
  output: |
    {"ca":"san-khac","ok":true,"loi":[],"ma_tep":0}

- eval: E3
  run_id: minted-va-ac9-mau-co-san-E3-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:43:42Z
  output: |
    {"ca":"pha-dem","ok":false,"loi":["đỏ sai thông điệp (pha-dem): ✖ AC-8 không dữ liệu thật: số, email, tên người, tên đường, nhãn trên bốn nguồn (299.377834ms) | ✖ AC-9 nạp và xoá một lần: nạp l…
    {"ca":"pha-hai-san","ok":true,"loi":[],"ma_tep":1}
    Ca pha-dem đỏ nhưng sai thông điệp so với khai ở expected; ca pha-hai-san đạt.

- eval: E4
  run_id: minted-va-ac9-mau-co-san-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:43:42Z
  output: |
    {"ca":"cach-ly","ok":true,"loi":[],"ma_tep":0}

- eval: E5
  run_id: minted-va-ac9-mau-co-san-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:43:42Z
  output: |
    {"ban":"cu","ca":"sach","ok":true,"loi":[],"ma_tep":0}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T08:43:42Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T08:43:42Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T08:43:42Z

- cmd: npm run test:hooks
  run_id: minted-va-ac9-mau-co-san-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T08:43:42Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T08:43:42Z

- cmd: npm run typecheck
  run_id: minted-va-ac9-mau-co-san-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T08:43:42Z

- cmd: npm run lint
  run_id: minted-va-ac9-mau-co-san-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T08:43:42Z

Lệnh fail không gắn eval: không có. Lệnh duy nhất đỏ là `node _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs --ca pha-dem --ca pha-hai-san`, đã gắn E3 ở trên.

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt)

### Baseline không đo

- node _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs --ca san-khac --ca san-thu-trung --ca deploy-san-khac: bo qua baseline: tep _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs co o cay dang kiem nhung chua co o merge-base 1d682adec85de348aa746e156eb2b308131693cb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs --ca san-khac: bo qua baseline: tep _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs co o cay dang kiem nhung chua co o merge-base 1d682adec85de348aa746e156eb2b308131693cb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs --ca pha-dem --ca pha-hai-san: bo qua baseline: tep _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs co o cay dang kiem nhung chua co o merge-base 1d682adec85de348aa746e156eb2b308131693cb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs --ca sach --ca cach-ly: bo qua baseline: tep _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs co o cay dang kiem nhung chua co o merge-base 1d682adec85de348aa746e156eb2b308131693cb — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs --doi-chung-do 1d682adec85de348aa746e156eb2b308131693cb: bo qua baseline: tep _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs co o cay dang kiem nhung chua co o merge-base 1d682adec85de348aa746e156eb2b308131693cb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất

## Iterations

Round 1: E3 failed — ca pha-dem đỏ nhưng sai thông điệp so với khai ở expected (ca pha-hai-san đạt). Returned to implementation.
