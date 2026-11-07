---
schema_version: 2
feature_slug: ghim-lai-ban-that-qua-ci
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 45b317b13cb1fe07e16ff466d064cd90108e48fd
human_signoff:
---

# Evidence Report: ghim-lai-ban-that-qua-ci

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-ghim-lai-ban-that-qua-ci-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T14:09:22Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --tinh
    KẾT: ĐẠT

- eval: E2
  run_id: minted-ghim-lai-ban-that-qua-ci-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T14:09:22Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --pha
    KẾT: ĐẠT

- eval: E3
  run_id: minted-ghim-lai-ban-that-qua-ci-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T14:09:22Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --chan
    KẾT: ĐẠT

- eval: E4
  run_id: minted-ghim-lai-ban-that-qua-ci-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T14:09:22Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --trong
    KẾT: ĐẠT

- eval: E5
  run_id: minted-ghim-lai-ban-that-qua-ci-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T14:09:22Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --quet
    KẾT: ĐẠT

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-07T14:09:22Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T14:09:22Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T14:09:22Z

- cmd: npm run test:hooks
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T14:09:22Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T14:09:22Z

- cmd: npm run typecheck
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T14:09:22Z

- cmd: npm run lint
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T14:09:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — không eval nào green trên baseline; cả năm eval feature đều là eval mới nên baseline không đo được (n-a), xem mục dưới.

Baseline khong do
- node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --tinh: bo qua baseline: tep _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs co o cay dang kiem nhung chua co o merge-base ad26850dee5de9f33abe73fa53d536c4af56341b — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --pha: bo qua baseline: tep _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs co o cay dang kiem nhung chua co o merge-base ad26850dee5de9f33abe73fa53d536c4af56341b — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --chan: bo qua baseline: tep _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs co o cay dang kiem nhung chua co o merge-base ad26850dee5de9f33abe73fa53d536c4af56341b — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --trong: bo qua baseline: tep _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs co o cay dang kiem nhung chua co o merge-base ad26850dee5de9f33abe73fa53d536c4af56341b — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --quet: bo qua baseline: tep _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs co o cay dang kiem nhung chua co o merge-base ad26850dee5de9f33abe73fa53d536c4af56341b — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E5 đều đạt, các lệnh suite xanh; không phải sửa lại.
