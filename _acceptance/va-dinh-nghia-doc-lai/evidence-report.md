---
schema_version: 2
feature_slug: va-dinh-nghia-doc-lai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 88b11dbe9661aa82d0b583a02dc1e60c799402f6
human_signoff:
---

# Evidence Report: va-dinh-nghia-doc-lai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-2 | test | PASS |
| E4 | AC-2 | ui-check | PASS |
| E5 | AC-3 | test | PASS |
| E5b | AC-3 | test | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-5 | test | PASS |
| E7b | AC-5 | test | PASS |
| E8 | AC-6 | test | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | test | PASS |
| E12 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-dinh-nghia-doc-lai-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4292.239833

- eval: E2
  run_id: minted-va-dinh-nghia-doc-lai-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4292.239833

- eval: E3
  run_id: minted-va-dinh-nghia-doc-lai-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs
  verified_at: 2026-11-09T04:34:26Z
  output: |
    node _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs
    duration_ms 2318.28375

- eval: E4
  run_id: minted-va-dinh-nghia-doc-lai-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T04:34:26Z
  screenshot: evidence/E4-truoc.png
  observed: |
    E4-truoc.png: ban lam viec can A-49.01, gia 3,1 ty, badge Bao phi, dong duoi gia "Tính theo định nghĩa ngày 09/11/2026: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 1% — về tay 2,9915 tỷ"; trang thai "Đã đồng bộ · 11:36". Khop expected truoc. E4-cho-gui.png: dau trang "Mất mạng · 1 thay đổi chờ gửi"; gia o panel va luoi la 3,2 ty (luoi hien cot Giá 3,2 tỷ), dong dinh nghia BIEN MAT (khong co dong "Tính theo định nghĩa"), toast "Đã đổi giá A-49.01". Khop cho-gui (dong null, gia moi). E4-da-len.png: trang thai "Đã đồng bộ · 11:36", gia 3,2 ty, dong "Tính theo định nghĩa ngày 09/11/2026: Thuế TNCN 2% · Trước bạ 0,5% · Môi giới 2% — về tay 3,056 tỷ", khong tai lai trang (luoi giu nguyen). Khop da-len.
  network_observed: n-a (driver)
  output: |
    Anh khop dong JSON (xem observed) -> PASS
    Frame da luu: E4-truoc.png, E4-cho-gui.png, E4-da-len.png (thu muc evidence).
    Network: driver la script Chrome rieng, khong co duong doc network qua tool nen n-a (driver).
    Ghi chu: o E4-cho-gui/da-len co badge "1 Issue" cua Next dev overlay, khong anh huong assertion.

- eval: E5
  run_id: minted-va-dinh-nghia-doc-lai-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4292.239833

- eval: E5b
  run_id: minted-va-dinh-nghia-doc-lai-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs
  verified_at: 2026-11-09T04:34:26Z
  output: |
    node _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs
    duration_ms 2318.28375

- eval: E6
  run_id: minted-va-dinh-nghia-doc-lai-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4292.239833

- eval: E7
  run_id: minted-va-dinh-nghia-doc-lai-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4292.239833

- eval: E7b
  run_id: minted-va-dinh-nghia-doc-lai-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs
  verified_at: 2026-11-09T04:34:26Z
  output: |
    node _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs
    duration_ms 2318.28375

- eval: E8
  run_id: minted-va-dinh-nghia-doc-lai-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4292.239833

- eval: E9
  run_id: minted-va-dinh-nghia-doc-lai-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T04:34:26Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    8 tệp giao diện ngoài bản đồ

- eval: E10
  run_id: minted-va-dinh-nghia-doc-lai-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T04:34:26Z
  output: |
    design-floor-s4.mjs --root .
    không có mã màu thô trên tệp giao diện vòng chạm

- eval: E11
  run_id: minted-va-dinh-nghia-doc-lai-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 4292.239833

- eval: E12
  run_id: minted-va-dinh-nghia-doc-lai-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-09T04:34:26Z
  output: |
    npm run typecheck
    kiểm kiểu mọi gói xanh

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-dinh-nghia-doc-lai-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T04:34:26Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-dinh-nghia-doc-lai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T04:34:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-dinh-nghia-doc-lai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T04:34:26Z

- cmd: npm run test:hooks
  run_id: minted-va-dinh-nghia-doc-lai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T04:34:26Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-dinh-nghia-doc-lai-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T04:34:26Z

- cmd: npm run lint
  run_id: minted-va-dinh-nghia-doc-lai-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T04:34:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline):
- E1, E2, E5, E6, E7, E8, E11 (npm test -w @quy-hang/web): xanh cả hai phía; cần xác nhận là regression-guard có chủ ý hoặc viết lại để assert hành vi mới.
- E9 (design-floor-khuon --kiem): xanh cả hai phía, regression-guard.
- E10 (design-floor-s4): xanh cả hai phía, regression-guard.
- E12 (npm run typecheck): xanh cả hai phía, regression-guard.

Baseline khong do
- node _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs: bo qua baseline: tep _acceptance/va-dinh-nghia-doc-lai/thu/chay-db.mjs co o cay dang kiem nhung chua co o merge-base 98d0d6463e8ed2623c7275044aa01a739c811ca8 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh, không có eval hỏng; không có judgment item.
