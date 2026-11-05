---
schema_version: 2
feature_slug: dang-nhap-mat-khau
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c166d71ad89370454fce3a655d589846d805fa93
human_signoff: Manh Phan 2026-11-05
---

# Evidence Report: dang-nhap-mat-khau

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-8 | test | PASS |
| E11 | AC-2 | test | PASS |
| E12 | AC-4 | test | PASS |
| E13 | AC-10 | test | PASS |
| E15 | AC-11 | script | PASS |
| E16 | AC-11 | script | PASS |
| E17 | AC-11 | script | PASS |
| E18 | AC-11 | script | PASS |
| E19 | AC-11 | script | PASS |
| E20 | AC-11 | test | PASS |
| E21 | AC-1 | test | PASS |
| E23 | AC-9 | script | PASS |

## Evidence

- eval: E13
  run_id: minted-dang-nhap-mat-khau-E13-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T03:55:53Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2496.712625

- eval: E23
  run_id: minted-dang-nhap-mat-khau-E23-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T03:55:53Z
  output: |
    design-floor-khuon --kiem --root .
    15 tệp giao diện ngoài bản đồ

- eval: E1
  run_id: minted-dang-nhap-mat-khau-E1-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E2
  run_id: minted-dang-nhap-mat-khau-E2-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E3
  run_id: minted-dang-nhap-mat-khau-E3-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E4
  run_id: minted-dang-nhap-mat-khau-E4-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E5
  run_id: minted-dang-nhap-mat-khau-E5-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E6
  run_id: minted-dang-nhap-mat-khau-E6-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E7
  run_id: minted-dang-nhap-mat-khau-E7-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E8
  run_id: minted-dang-nhap-mat-khau-E8-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1

- eval: E9
  run_id: minted-dang-nhap-mat-khau-E9-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1

- eval: E11
  run_id: minted-dang-nhap-mat-khau-E11-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1

- eval: E12
  run_id: minted-dang-nhap-mat-khau-E12-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1

- eval: E15
  run_id: minted-dang-nhap-mat-khau-E15-r1
  exit_code: 0
  verifier: config:executors.script.dang_nhap_mat_khau
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1

- eval: E16
  run_id: minted-dang-nhap-mat-khau-E16-r2
  exit_code: 0
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E17
  run_id: minted-dang-nhap-mat-khau-E17-r2
  exit_code: 0
  verifier: config:executors.script.lint
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E18
  run_id: minted-dang-nhap-mat-khau-E18-r2
  exit_code: 0
  verifier: config:executors.script.build
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E19
  run_id: minted-dang-nhap-mat-khau-E19-r1
  exit_code: 0
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T00:26:31Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1

- eval: E20
  run_id: minted-dang-nhap-mat-khau-E20-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

- eval: E21
  run_id: minted-dang-nhap-mat-khau-E21-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:11:41Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 2

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_core-r4
  exit_code: 0
  verified_at: 2026-11-05T03:55:53Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-11-05T03:55:53Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-05T03:55:53Z

- cmd: npm run test:hooks
  run_id: minted-dang-nhap-mat-khau-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-05T03:55:53Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dang-nhap-mat-khau-SUITE-npm_test_w_quy_hang_ui_lint-r4
  exit_code: 0
  verified_at: 2026-11-05T03:55:53Z

- cmd: npm run typecheck
  run_id: minted-dang-nhap-mat-khau-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-05T03:55:53Z

- cmd: npm run lint
  run_id: minted-dang-nhap-mat-khau-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-11-05T03:55:53Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên mã cũ lẫn HEAD, chứng minh harness chứ không phải tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E13 (npm test -w @quy-hang/web) — baseline green
- E23 (design-floor-khuon --kiem) — baseline green

Không có judgment item nào trong vòng này; không có panel nào cần chấm.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các eval máy xanh, ba eval ui-check (E10, E14, E22) rớt ở lượt chấm đầu. Returned to implementation.
Round 2: chạy lại bộ eval test/script xanh; ba eval ui-check còn rớt. Returned to implementation.
Round 3: carry-forward E13, E23 từ round 2; ba ui-check rớt, phạm vi được thu lại (AC-9 viết lại, AC-10 viết lại, ui-check ra Known limits).
Round 4: sau thu phạm vi và ký lại Cổng Phạm vi, E13 và E23 chạy lại xanh, các eval còn lại carry-forward; toàn bộ PASS.
