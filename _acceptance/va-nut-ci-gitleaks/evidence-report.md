---
schema_version: 2
feature_slug: va-nut-ci-gitleaks
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2bfd418304426133247cdcb538473dad9afc1784
human_signoff: Manh Phan 2026-11-08
---

# Evidence Report: va-nut-ci-gitleaks

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-nut-ci-gitleaks-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs
  verified_at: 2026-11-08T07:59:25Z
  output: |
    node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --tinh
    KẾT: ĐẠT

- eval: E2
  run_id: minted-va-nut-ci-gitleaks-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs
  verified_at: 2026-11-08T07:59:25Z
  output: |
    node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --chay
    KẾT: ĐẠT

- eval: E3
  run_id: minted-va-nut-ci-gitleaks-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs
  verified_at: 2026-11-08T07:59:25Z
  output: |
    node _acceptance/va-nut-ci-gitleaks/thu/kiem-gitleaks.mjs --hooks
    KẾT: ĐẠT

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T07:59:25Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T07:59:25Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T07:59:25Z

- cmd: npm run test:hooks
  run_id: minted-va-nut-ci-gitleaks-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T07:59:25Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-nut-ci-gitleaks-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-08T07:59:25Z

- cmd: npm run typecheck
  run_id: minted-va-nut-ci-gitleaks-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T07:59:25Z

- cmd: npm run lint
  run_id: minted-va-nut-ci-gitleaks-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T07:59:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (green tren ca HEAD lan baseline): khong co. Baseline round nay khong do (evals.yaml khong doi tu lan baseline cuoi), nen field baseline cua ba eval ghi n-a. Cac lenh suite xanh la regression-guard binh thuong.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: da do baseline va chay ba eval; co sua tra ve trien khai (S4-r1: E3 chay bai tu kiem tren ban sao cay, khong giam suite).
Round 2: E1, E2, E3 deu dat, bay lenh suite xanh; verdict PASS.

### Re-pin lần 1 — 2026-11-08, do gộp nhánh chính trước khi gộp #209
run_id: repin-20261108T160952Z-91293
sha: 2bfd418304426133247cdcb538473dad9afc1784 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
