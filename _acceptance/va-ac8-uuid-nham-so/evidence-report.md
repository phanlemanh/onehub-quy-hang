---
schema_version: 2
feature_slug: va-ac8-uuid-nham-so
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3e4a02a1448d333968c3192fa3c1c5a3854d2045
human_signoff: Manh Phan 2026-11-07
---

# Evidence Report: va-ac8-uuid-nham-so

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-ac8-uuid-nham-so-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs
  verified_at: 2026-11-07T01:25:21Z
  output: |
    {"ca":"lap","lan":25,"do":0,"ok":true,"loi":[]}

- eval: E2
  run_id: minted-va-ac8-uuid-nham-so-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs
  verified_at: 2026-11-07T01:25:21Z
  output: |
    {"ca":"tron","ok":true,"loi":[]}

- eval: E3
  run_id: minted-va-ac8-uuid-nham-so-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs
  verified_at: 2026-11-07T01:25:21Z
  output: |
    {"ca":"tron","ok":true,"loi":[]}

- eval: E4
  run_id: minted-va-ac8-uuid-nham-so-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs
  verified_at: 2026-11-07T01:25:21Z
  output: |
    {"ca":"doi-chung-do","sha":"a4122e9e81ca99eacb6de8d60f0c7daab4d01cce","ok":true,"loi":[]}

- eval: E5
  run_id: minted-va-ac8-uuid-nham-so-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs
  verified_at: 2026-11-07T01:25:21Z
  output: |
    {"ca":"bat-bien","sha":"a4122e9e81ca99eacb6de8d60f0c7daab4d01cce","ok":true,"loi":[]}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ac8-uuid-nham-so-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-07T01:25:21Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ac8-uuid-nham-so-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T01:25:21Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ac8-uuid-nham-so-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T01:25:21Z

- cmd: npm run test:hooks
  run_id: minted-va-ac8-uuid-nham-so-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T01:25:21Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ac8-uuid-nham-so-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T01:25:21Z

- cmd: npm run typecheck
  run_id: minted-va-ac8-uuid-nham-so-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T01:25:21Z

- cmd: npm run lint
  run_id: minted-va-ac8-uuid-nham-so-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T01:25:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do
- node _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs --lap 25: bo qua baseline: tep _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs co o cay dang kiem nhung chua co o merge-base a4122e9e81ca99eacb6de8d60f0c7daab4d01cce — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs --tron: bo qua baseline: tep _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs co o cay dang kiem nhung chua co o merge-base a4122e9e81ca99eacb6de8d60f0c7daab4d01cce — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs --doi-chung-do a4122e9e81ca99eacb6de8d60f0c7daab4d01cce: bo qua baseline: tep _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs co o cay dang kiem nhung chua co o merge-base a4122e9e81ca99eacb6de8d60f0c7daab4d01cce — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs --bat-bien a4122e9e81ca99eacb6de8d60f0c7daab4d01cce: bo qua baseline: tep _acceptance/va-ac8-uuid-nham-so/thu/kiem-ac8.mjs co o cay dang kiem nhung chua co o merge-base a4122e9e81ca99eacb6de8d60f0c7daab4d01cce — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không có dữ liệu round 1 trong tác vụ này (lịch sử round cũ không được truyền xuống).
Round 2: E1-E5 và bảy lệnh suite đều xanh; không có judgment item, không có phương sai. Verdict PASS.
