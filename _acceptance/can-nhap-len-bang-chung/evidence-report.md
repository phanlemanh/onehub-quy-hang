---
schema_version: 2
feature_slug: can-nhap-len-bang-chung
verdict: REJECT
failed_evals: ["E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2884fc4c27b59d2dfd9d8b12e602848b2bc9a6cd
human_signoff:
---

# Evidence Report: can-nhap-len-bang-chung

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
| E9 | AC-9 | ui-check | REJECT |
| E10 | AC-10 | test | PASS |
| E11 | AC-9 | script | PASS |

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline — chứng minh harness chứ chưa chứng minh feature; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- `npm test -w @quy-hang/core` — E1
- `DATABASE_URL=... sh -c 'npm run db:migrate && npm run db:test'` — E2, E3, E4, E5, E6, E8, E10
- `DATABASE_URL=... npm run test:db -w @quy-hang/web` — E7
- `node "$R/scripts/design-floor-khuon.mjs" --kiem --root .` — E11

Lệnh không gắn eval: `ui-check:E9` thất bại (E9, đã nêu ở Evidence).

## Evidence

- eval: E1
  run_id: minted-can-nhap-len-bang-chung-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 13460.81825
    __EXIT=0

- eval: E2
  run_id: minted-can-nhap-len-bang-chung-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 138284.760292
    __EXIT=0

- eval: E3
  run_id: minted-can-nhap-len-bang-chung-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 138284.760292
    __EXIT=0

- eval: E4
  run_id: minted-can-nhap-len-bang-chung-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 138284.760292
    __EXIT=0

- eval: E5
  run_id: minted-can-nhap-len-bang-chung-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 138284.760292
    __EXIT=0

- eval: E6
  run_id: minted-can-nhap-len-bang-chung-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 138284.760292
    __EXIT=0

- eval: E7
  run_id: minted-can-nhap-len-bang-chung-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 14321.229625
    __EXIT=0

- eval: E8
  run_id: minted-can-nhap-len-bang-chung-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 138284.760292
    __EXIT=0

- eval: E9
  run_id: minted-can-nhap-len-bang-chung-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T03:07:35Z
  screenshot: evidence/E9-ket-qua-nhap-1440.png
  observed: |
    Import-result frame shows the Excel summary "Đã ghi vào Quỹ hàng", both rows "lên Đang bán — còn thiếu pháp lý, tình trạng sử dụng", no raw code, no error tone; Hôm nay shows 2 rows in "Thiếu thông tin".
    The hồ sơ căn frames at 1440 and 375 are only a grey loading skeleton: no mức đủ, no pháp lý/tình trạng sử dụng, no "Đang bán", contradicting Expected (reproduced on two runs).
    The hom-nay-b frame at 375 was never taken (team-lead login failed with a server error, dev log "Manifest file is empty"); the file in the folder is stale. Bang-hang at 375 has no card for the căn.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-can-nhap-len-bang-chung-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-08T03:07:35Z
  output: |
    ℹ duration_ms 138284.760292
    __EXIT=0

- eval: E11
  run_id: minted-can-nhap-len-bang-chung-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T03:07:35Z
  output: |
    1 tệp giao diện ngoài bản đồ
    __EXIT=0

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T03:07:35Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T03:07:35Z

- cmd: npm run test:hooks
  run_id: minted-can-nhap-len-bang-chung-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T03:07:35Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-can-nhap-len-bang-chung-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-08T03:07:35Z

- cmd: npm run typecheck
  run_id: minted-can-nhap-len-bang-chung-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-08T03:07:35Z

- cmd: npm run lint
  run_id: minted-can-nhap-len-bang-chung-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-08T03:07:35Z

## Known limits

## Ngoài hợp đồng

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed — hồ sơ căn chỉ hiện khung chờ ở cả 1440 và 375 (không thấy mức đủ, pháp lý, tình trạng sử dụng, Đang bán); khung hom-nay-b ở 375 không chụp được vì đăng nhập trưởng nhóm lỗi máy chủ; Bảng hàng ở 375 không có thẻ căn. Returned to implementation.
