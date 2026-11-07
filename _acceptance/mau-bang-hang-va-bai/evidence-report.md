---
schema_version: 2
feature_slug: mau-bang-hang-va-bai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5cf35f21f81126d582dc03fcca8d0412d3e6748f
human_signoff:
---

# Evidence Report: mau-bang-hang-va-bai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E5c | AC-5 | test | PASS |
| E5d | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E9b | AC-9 | test | PASS |
| E10c | AC-1 | test | PASS |
| E10b | AC-1 | script | PASS |

## Evidence

Vòng 4 chạy lại bốn eval (E4b, E10c, E8, E10b); mười tám eval còn lại mang từ vòng 2 vì delta không chạm paths của chúng.

- eval: E4b
  run_id: minted-mau-bang-hang-va-bai-E4b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T11:17:41Z
  output: |
    ℹ duration_ms 6925.113917

- eval: E10c
  run_id: minted-mau-bang-hang-va-bai-E10c-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T11:17:41Z
  output: |
    ℹ duration_ms 6925.113917

- eval: E8
  run_id: minted-mau-bang-hang-va-bai-E8-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T11:17:41Z
  output: |
    ℹ duration_ms 145809.809167

- eval: E10b
  run_id: minted-mau-bang-hang-va-bai-E10b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T11:17:41Z
  output: |
    16 tệp giao diện ngoài bản đồ

- eval: E1
  run_id: minted-mau-bang-hang-va-bai-E1-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-mau-bang-hang-va-bai-E1b-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-mau-bang-hang-va-bai-E2-r2
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-mau-bang-hang-va-bai-E2b-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-mau-bang-hang-va-bai-E3-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-mau-bang-hang-va-bai-E3b-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-mau-bang-hang-va-bai-E4-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-mau-bang-hang-va-bai-E5-r2
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-mau-bang-hang-va-bai-E5b-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5c
  run_id: minted-mau-bang-hang-va-bai-E5c-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5d
  run_id: minted-mau-bang-hang-va-bai-E5d-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-mau-bang-hang-va-bai-E6-r2
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-mau-bang-hang-va-bai-E7-r2
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-mau-bang-hang-va-bai-E7b-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7c
  run_id: minted-mau-bang-hang-va-bai-E7c-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-mau-bang-hang-va-bai-E8b-r2
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-mau-bang-hang-va-bai-E9-r2
  exit_code: 0
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-mau-bang-hang-va-bai-E9b-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T09:36:06Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_core-r4
  exit_code: 0
  verified_at: 2026-11-07T11:17:41Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-11-07T11:17:41Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-07T11:17:41Z

- cmd: npm run test:hooks
  run_id: minted-mau-bang-hang-va-bai-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-07T11:17:41Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mau-bang-hang-va-bai-SUITE-npm_test_w_quy_hang_ui_lint-r4
  exit_code: 0
  verified_at: 2026-11-07T11:17:41Z

- cmd: npm run typecheck
  run_id: minted-mau-bang-hang-va-bai-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-07T11:17:41Z

- cmd: npm run lint
  run_id: minted-mau-bang-hang-va-bai-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-11-07T11:17:41Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline): E4b, E10c (cùng lệnh npm test -w @quy-hang/web), E8 (npm run db:migrate && npm run db:test), E10b (lưới khuôn giao diện). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: chạy lần đầu, nhật ký ở run-log.jsonl.
Round 2: chạy toàn bộ eval; mười tám eval trong bảng mang từ vòng này.
Round 3: mang các eval không bị delta chạm từ round 2.
Round 4: chạy lại E4b, E10c, E8, E10b cùng bảy lệnh suite — tất cả đạt; mười tám eval còn lại mang từ round 2.
