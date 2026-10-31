---
schema_version: 2
feature_slug: loi-hang-va-su-kien
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ca23d6a738158be5caf25e6dbe1182b2f7c05e1e
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: loi-hang-va-su-kien

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-loi-hang-va-su-kien-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1635.549041

- eval: E2
  run_id: minted-loi-hang-va-su-kien-E2-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-loi-hang-va-su-kien-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60343.178084

- eval: E3b
  run_id: minted-loi-hang-va-su-kien-E3b-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:09:04Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-loi-hang-va-su-kien-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 64.392375

- eval: E5
  run_id: minted-loi-hang-va-su-kien-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1635.549041

- eval: E5b
  run_id: minted-loi-hang-va-su-kien-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 64.392375

- eval: E6
  run_id: minted-loi-hang-va-su-kien-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 64.392375

- eval: E7
  run_id: minted-loi-hang-va-su-kien-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 64.392375

- eval: E8
  run_id: minted-loi-hang-va-su-kien-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1635.549041

- eval: E9
  run_id: minted-loi-hang-va-su-kien-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1635.549041

- eval: E10
  run_id: minted-loi-hang-va-su-kien-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T00:16:36Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1635.549041

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-loi-hang-va-su-kien-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T00:16:36Z

- cmd: npm run test:hooks
  run_id: minted-loi-hang-va-su-kien-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T00:16:36Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-loi-hang-va-su-kien-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T00:16:36Z

- cmd: npm run typecheck
  run_id: minted-loi-hang-va-su-kien-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T00:16:36Z

- cmd: npm run lint
  run_id: minted-loi-hang-va-su-kien-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T00:16:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»

none — moi eval feature deu red tren baseline (co phan biet). Luu y: baseline BLOCKED o round nay nen danh sach eval khong-phan-biet KHONG do duoc.

### Baseline khong do

- npm run db:migrate && npm run db:test: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- npm test -w @quy-hang/api: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»
- npm test -w @quy-hang/core: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.»

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt gốc, E2 và E3b xanh; lượt chấm nêu việc siết phép đo E9, E10 (commit ca23d6a). Returned to implementation.
Round 2: E1, E3, E4, E5, E5b, E6, E7, E8, E9, E10 chạy lại và xanh; E2, E3b mang từ round 1 (delta không chạm paths của eval). Verdict PASS.
