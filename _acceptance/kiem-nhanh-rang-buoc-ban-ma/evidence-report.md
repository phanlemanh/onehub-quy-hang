---
schema_version: 2
feature_slug: kiem-nhanh-rang-buoc-ban-ma
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b4557a55fe10c6a50684ec6b52c9ff5f3beda68e
human_signoff: Manh Phan 2026-11-07
---

# Evidence Report: kiem-nhanh-rang-buoc-ban-ma

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |

## Evidence

Cả sáu eval cùng chạy bằng một lệnh `npm run db:migrate && npm run db:test` (một lần chạy, một lần đạt, không phương sai).

- eval: E1
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:36:03Z
  output: |
    ℹ duration_ms 130467.793958

- eval: E2
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:36:03Z
  output: |
    ℹ duration_ms 130467.793958

- eval: E3
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:36:03Z
  output: |
    ℹ duration_ms 130467.793958

- eval: E4
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:36:03Z
  output: |
    ℹ duration_ms 130467.793958

- eval: E5
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:36:03Z
  output: |
    ℹ duration_ms 130467.793958

- eval: E6
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T01:36:03Z
  output: |
    ℹ duration_ms 130467.793958

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-07T01:36:03Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T01:36:03Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T01:36:03Z

- cmd: npm run test:hooks
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T01:36:03Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T01:36:03Z

- cmd: npm run typecheck
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T01:36:03Z

- cmd: npm run lint
  run_id: minted-kiem-nhanh-rang-buoc-ban-ma-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T01:36:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (pass tren ca HEAD lan baseline): none. Round nay baseline khong do lai nen moi eval ghi baseline n-a; lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke.

Khong co judgment item: moi eval deu la executor test, khong co panel judge nao can cham.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, deterministic).

## Iterations

Round 1: baseline do o round nay (xem ho so round 1).
Round 2: E1-E6 va bay lenh suite deu xanh; khong eval nao fail; evals.yaml khong doi tu round 1.

### Re-pin lần 1 — 2026-11-07, do gộp main (PR #180) sau chữ ký
run_id: repin-20261107T020333Z-93999
sha: b4557a55fe10c6a50684ec6b52c9ff5f3beda68e · suites: 7 lệnh exit 0 · evals: 6/6 eval máy đạt kỳ vọng
