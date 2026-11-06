---
schema_version: 2
feature_slug: va-ac9-mau-co-san
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: eb599ea4d3ceff10521af6e5493d5027dbf61c01
human_signoff:
---

# Evidence Report: va-ac9-mau-co-san

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-ac9-mau-co-san-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:52:20Z
  output: |
    {"ca":"deploy-san-khac","ok":true,"loi":[],"ma_tep":0}

- eval: E2
  run_id: minted-va-ac9-mau-co-san-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:52:20Z
  output: |
    {"ca":"san-khac","ok":true,"loi":[],"ma_tep":0}

- eval: E3
  run_id: minted-va-ac9-mau-co-san-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:52:20Z
  output: |
    (lệnh không in dòng tóm tắt; hai ca pha-dem và pha-hai-san đều đạt)

- eval: E4
  run_id: minted-va-ac9-mau-co-san-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:52:20Z
  output: |
    {"ca":"cach-ly","ok":true,"loi":[],"ma_tep":0}

- eval: E5
  run_id: minted-va-ac9-mau-co-san-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:52:20Z
  output: |
    {"ban":"cu","ca":"sach","ok":true,"loi":[],"ma_tep":0}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-06T08:52:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T08:52:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T08:52:20Z

- cmd: npm run test:hooks
  run_id: minted-va-ac9-mau-co-san-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T08:52:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T08:52:20Z

- cmd: npm run typecheck
  run_id: minted-va-ac9-mau-co-san-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-06T08:52:20Z

- cmd: npm run lint
  run_id: minted-va-ac9-mau-co-san-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-06T08:52:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

none — khong eval nao duoc liet ke la khong-phan-biet.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm 1 trả về — ghim phép phá theo mọi lỗi, giữ đầu ra, trả mã 2 cho lỗi môi trường (commit eb599ea4). Returned to implementation.
Round 2: E1, E2, E3, E4, E5 đều đạt; bảy lệnh suite đều xanh.
