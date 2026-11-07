---
schema_version: 2
feature_slug: ghim-lai-ban-that-qua-ci
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 104674c5ff1d7c133c7112f8da9f1f808f30a21b
human_signoff: Manh Phan 2026-11-08
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
  run_id: minted-ghim-lai-ban-that-qua-ci-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T21:56:57Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --tinh
    KẾT: ĐẠT

- eval: E2
  run_id: minted-ghim-lai-ban-that-qua-ci-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T21:56:57Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --pha
    KẾT: ĐẠT

- eval: E3
  run_id: minted-ghim-lai-ban-that-qua-ci-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T21:56:57Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --chan
    KẾT: ĐẠT

- eval: E4
  run_id: minted-ghim-lai-ban-that-qua-ci-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T21:56:57Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --trong
    KẾT: ĐẠT

- eval: E5
  run_id: minted-ghim-lai-ban-that-qua-ci-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs
  verified_at: 2026-11-07T21:56:57Z
  output: |
    node _acceptance/ghim-lai-ban-that-qua-ci/thu/kiem-nut.mjs --quet
    KẾT: ĐẠT

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-07T21:56:57Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-07T21:56:57Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-07T21:56:57Z

- cmd: npm run test:hooks
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-07T21:56:57Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-07T21:56:57Z

- cmd: npm run typecheck
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-07T21:56:57Z

- cmd: npm run lint
  run_id: minted-ghim-lai-ban-that-qua-ci-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-07T21:56:57Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval khong-phan-biet: none. Baseline round nay khong do lai (evals.yaml khong doi tu lan baseline cuoi, round 2), nen moi block eval ghi baseline n-a. Lenh suite xanh o ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, deterministic)

## Iterations

Round 1: lich su round nay nam trong run-log, khong lap lai o day.
Round 2: S4 lan 2 dat, dung va, trinh ba duong (commit b19ab9d2).
Round 3: E1-E5 va bay lenh suite deu dat tren commit 104674c5 (bo chan chay truoc cai goi, cai goi khong chay script, chan hai khoa chay lenh, tep nut vao t3_paths). Cac loi ngoai hop dong nam trong review-findings.md.
