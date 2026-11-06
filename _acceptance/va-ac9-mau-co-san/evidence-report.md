---
schema_version: 2
feature_slug: va-ac9-mau-co-san
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b7b2bc9199988f81073f6366e469eba88b62dd44
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
  run_id: minted-va-ac9-mau-co-san-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:56:16Z
  output: |
    {"ca":"deploy-san-khac","ok":true,"loi":[],"ma_tep":0}

- eval: E2
  run_id: minted-va-ac9-mau-co-san-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:56:16Z
  output: |
    {"ca":"san-khac","ok":true,"loi":[],"ma_tep":0}

- eval: E3
  run_id: minted-va-ac9-mau-co-san-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:56:16Z
  output: |
    {"ca":"pha-hai-san","ok":true,"loi":[],"ma_tep":1}

- eval: E4
  run_id: minted-va-ac9-mau-co-san-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:56:16Z
  output: |
    {"ca":"cach-ly","ok":true,"loi":[],"ma_tep":0}

- eval: E5
  run_id: minted-va-ac9-mau-co-san-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-ac9-mau-co-san/thu/kiem-ac9.mjs
  verified_at: 2026-11-06T08:56:16Z
  output: |
    {"ban":"cu","ca":"sach","ok":true,"loi":[],"ma_tep":0}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-06T08:56:16Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-06T08:56:16Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-06T08:56:16Z

- cmd: npm run test:hooks
  run_id: minted-va-ac9-mau-co-san-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-06T08:56:16Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ac9-mau-co-san-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-06T08:56:16Z

- cmd: npm run typecheck
  run_id: minted-va-ac9-mau-co-san-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-06T08:56:16Z

- cmd: npm run lint
  run_id: minted-va-ac9-mau-co-san-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-06T08:56:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet: none. Baseline cua cac eval ghi n-a vi round nay khong do lai.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E3 failed — phép đo chưa phân biệt được ở ca phá. Returned to implementation.
Round 2: tất cả eval đạt; còn một phát hiện trong hợp đồng ở AC-1 (ca deploy thiếu đối chứng dương). Returned to implementation.
Round 3: E1-E5 và bảy lệnh suite đạt trên b7b2bc91 — PASS.
