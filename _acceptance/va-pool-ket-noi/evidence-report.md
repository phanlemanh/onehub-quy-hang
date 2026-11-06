---
schema_version: 2
feature_slug: va-pool-ket-noi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ccf129c90ed8fe50229acc93de91e1f6decbbcd1
human_signoff:
---

# Evidence Report: va-pool-ket-noi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-pool-ket-noi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T02:43:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4934.459833

- eval: E2
  run_id: minted-va-pool-ket-noi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T02:43:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4934.459833

- eval: E3
  run_id: minted-va-pool-ket-noi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: scripts/verify-ui-check.sh
  verified_at: 2026-11-06T02:43:28Z
  screenshot: evidence/E3-login.png
  observed: |
    E3-login.png: man dang nhap, tieu de "Dang nhap Quy hang", o Email, nut Gui ma, nut Dung mat khau; khong phai trang loi. E3-today.png, E3-inventory.png, E3-goc.png, E3-chon-san.png: moi anh la thanh thong bao loi nho goc tren trai "Khong mo duoc trang nay / Lan tai vua roi loi. Thu lai sau it phut." kem nut "Thu lai", nen den, khong co o dang nhap (doc anh login va goc truc tiep; 3 anh con lai giong het va da doi chieu qua anh chup luc chay va pathname tung duong). E3-hoi-phuc.png: man Hom nay cua "[Mau] San thu" voi vung "Hom nay", "0 viec", "Hom nay khong con viec", thanh ben HOM NAY; khong con chu loi. Khop Expected.
  network_observed: clean

- eval: E4
  run_id: minted-va-pool-ket-noi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_ket_noi
  verified_at: 2026-11-06T02:43:28Z
  output: |
    node --test "_acceptance/va-pool-ket-noi/thu/*.test.mjs"
    ℹ duration_ms 86.598791

- eval: E5
  run_id: minted-va-pool-ket-noi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-06T02:43:28Z
  output: |
    npm run typecheck (moi goi xanh)

- eval: E6
  run_id: minted-va-pool-ket-noi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-06T02:43:28Z
  output: |
    chuẩn giao diện: đạt

- eval: E7
  run_id: minted-va-pool-ket-noi-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.build
  verified_at: 2026-11-06T02:43:28Z
  output: |
    npm run build (next build hoan tat)

- eval: E8
  run_id: minted-va-pool-ket-noi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-06T02:43:28Z
  output: |
    design-floor-s4: dat

- eval: E9
  run_id: minted-va-pool-ket-noi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T02:43:28Z
  output: |
    2 tệp giao diện ngoài bản đồ

- eval: E10
  run_id: minted-va-pool-ket-noi-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_ket_noi
  verified_at: 2026-11-06T02:43:28Z
  output: |
    node --test "_acceptance/va-pool-ket-noi/thu/*.test.mjs"
    ℹ duration_ms 86.598791

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T02:43:28Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T02:43:28Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T02:43:28Z

- cmd: npm run test:hooks
  run_id: minted-va-pool-ket-noi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T02:43:28Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T02:43:28Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline khong do: E3 (ui-check, khong chay duoc tren code cu).

Eval KHONG-PHAN-BIET (xanh tren ca HEAD lan baseline; chung minh harness hon la feature, hoac regression-guard co chu y):
- E1, E2 (lenh npm test -w @quy-hang/web)
- E4, E10 (lenh node --test cho thu/*.test.mjs)
- E5 (typecheck)
- E6 (lint)
- E8 (design-floor-s4)
- E9 (design-floor-khuon --kiem)

Chi E7 (build) do tren baseline; E3 khong do. Cac eval con lai nen duoc xem la regression-guard hoac can viet lai de assert hanh vi moi neu muon phan biet.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval xanh, khong eval nao fail. Ba mục judgment/ngoai hop dong nam o review-findings.md.
