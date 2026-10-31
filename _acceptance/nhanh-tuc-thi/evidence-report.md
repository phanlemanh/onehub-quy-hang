---
schema_version: 2
feature_slug: nhanh-tuc-thi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 352acec508138d26ed1ec36088a6c402ffe20cc7
human_signoff:
---

# Evidence Report: nhanh-tuc-thi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-nhanh-tuc-thi-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm run test:db -w @quy-hang/web
    ℹ duration_ms 1432.90925

- eval: E4
  run_id: minted-nhanh-tuc-thi-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm run test:db -w @quy-hang/web
    ℹ duration_ms 1432.90925

- eval: E5
  run_id: minted-nhanh-tuc-thi-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm run test:db -w @quy-hang/web
    ℹ duration_ms 1432.90925

- eval: E6
  run_id: minted-nhanh-tuc-thi-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm run test:db -w @quy-hang/web
    ℹ duration_ms 1432.90925

- eval: E7
  run_id: minted-nhanh-tuc-thi-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm run test:db -w @quy-hang/web
    ℹ duration_ms 1432.90925

- eval: E2
  run_id: minted-nhanh-tuc-thi-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm test -w @quy-hang/web
    ℹ duration_ms 89.612166

- eval: E3
  run_id: minted-nhanh-tuc-thi-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm test -w @quy-hang/web
    ℹ duration_ms 89.612166

- eval: E8
  run_id: minted-nhanh-tuc-thi-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm test -w @quy-hang/web
    ℹ duration_ms 89.612166

- eval: E9
  run_id: minted-nhanh-tuc-thi-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm test -w @quy-hang/web
    ℹ duration_ms 89.612166

- eval: E10
  run_id: minted-nhanh-tuc-thi-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:51:55Z
  output: |
    cmd: npm test -w @quy-hang/web
    ℹ duration_ms 89.612166

- eval: E4b
  cmd: ui-check:E4b
  run_id: E4b-r3-20261031-1900
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T11:51:55Z
  screenshot: evidence/E4b-truoc.png
  observed: |
    Frames opened with Read. Before: top bar «Đã đồng bộ · 18:59», five rows A-104..A-102, history counts 8/4/5/5/5 (total 27). Offline: «Mất mạng · 20 thay đổi chờ gửi», list still shown after reload, prices old + 4 million. After, with no click and no reload: «Đã đồng bộ · 19:00» within 11 s, same prices; histories open show +4 events per căn (total 47, difference 20). Frames E4b-step2a and E4b-step2b were saved but not opened with Read; their indicator text came from DOM readout.
  network_observed: clean

- eval: E8b
  cmd: ui-check:E8b
  run_id: E8b-r3-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T11:51:55Z
  screenshot: evidence/E8b-may-tinh.png
  observed: |
    Desktop 1440x900: top bar with search, «+ Lead», text pill «Da dong bo · 18:57», bell, avatar; dark mode keeps the pill readable. Phone 375x812: icon-only pill whose aria-label carries the full text. Conflict: red pill «1 can can xem», sheet shows the other person's value (role, time) and mine with «Giu cua toi» / «Lay ban moi»; rejected case shows the core reason with «Bo thay doi»; deposited case shows the deposited-căn row. Sign-out dialog says 2 changes unsent, «O lai» / «Van dang xuat»; after sign-in again prices are server prices and pill is «Da dong bo · 19:09»; sign-out with 0 pending goes straight to /login.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-10-31T11:51:55Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-10-31T11:51:55Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-10-31T11:51:55Z

- cmd: npm run test:hooks
  run_id: minted-nhanh-tuc-thi-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-10-31T11:51:55Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-10-31T11:51:55Z

- cmd: npm run typecheck
  run_id: minted-nhanh-tuc-thi-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-10-31T11:51:55Z

- cmd: npm run lint
  run_id: minted-nhanh-tuc-thi-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-10-31T11:51:55Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Moi block eval ghi baseline n-a.

Eval khong-phan-biet: none.

## Variance

none — moi eval chay mot lan, khong co eval ngau nhien, khong co phuong sai.

## Iterations

Round 1-2: xem run-log.jsonl cua feature.
Round 3: moi eval (E1-E10, E4b, E8b) va moi lenh suite xanh; khong judgment item, khong eval fail.
