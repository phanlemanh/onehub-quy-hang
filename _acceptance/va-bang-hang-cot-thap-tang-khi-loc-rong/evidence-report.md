---
schema_version: 2
feature_slug: va-bang-hang-cot-thap-tang-khi-loc-rong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dc47e83d410a795904c1f0108a7fb6c0eac1cd71
human_signoff:
---

# Evidence Report: va-bang-hang-cot-thap-tang-khi-loc-rong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-6 | test | PASS |
| E5 | AC-5 | ui-check | PASS |
| E6 | AC-1 | script | PASS |
| E7 | AC-1 | script | PASS |
| E8 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:43:06Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4797.049458

- eval: E2
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:43:06Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4797.049458

- eval: E3
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:43:06Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4797.049458

- eval: E4
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:43:06Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4797.049458

- eval: E4b
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T02:43:06Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4797.049458

- eval: E5
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T02:43:06Z
  screenshot: evidence/E5-rong.png
  observed: |
    E5-rong.png (ca1): bảng hàng 0/12 căn, ô Diện tích đất đang focus chứa ">99999999" có nút x; vùng bảng vẫn đủ cột (Vị trí, Mã căn, Hướng, Diện tích đất, Số tầng, Mặt tiền, Lộ giới, Trạng thái) và hàng lọc; giữa vùng trống có icon lọc + "Không căn nào khớp bộ lọc" + nút "Xoá lọc" nằm trong khung nhìn; Lọc có badge 1.
    E5-sau.png: sau khi xoá chữ, bảng trở lại 12/12 căn, dòng có nhóm, đủ cột Loại hình/Loại căn/Diện tích/Tầng/Hướng/Diện tích đất/Số tầng; ô Diện tích đất còn focus, hint ">80" là placeholder xám, không còn badge Lọc.
    E5-cot-chung.png (ca2): lọc Đất, ô Giá focus ">99999999", 0/12 căn, Lọc badge 2, cuộn ngang thấy các cột Trạng thái, Giá, Phí, Nội thất, Pháp lý, Tài chính vẫn còn (bộ cột loại Đất không bị thấp tầng), thông báo "Không căn nào khớp bộ lọc" ở giữa khung nhìn. Khớp Expected.
  network_observed: n-a (driver)
  output: |
    Ca1: truoc.cot chua "Diện tích đất" PASS; rong.soDong=0 PASS; rong.cot == truoc.cot (15 cot giong het) PASS; rong.oLoc=">99999999" (chu da go) PASS; rong.focus="Lọc Diện tích đất theo luật số" dung o dang go PASS; rong.baoRong co ("Không căn nào khớp bộ lọc", trongKhung=true) PASS; sau.soDong=8=truoc.soDong PASS; sau.cot == truoc.cot PASS.
    Ca2 (loc Đất): truoc.soDong=2; rong.soDong=0 PASS; rong.cot == truoc.cot (14 cot) PASS; rong.oLoc=">999999999", focus="Lọc Giá theo luật số" PASS.
    Frame luu: evidence/E5-rong.png, E5-sau.png, E5-cot-chung.png.

- eval: E6
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-09T02:43:06Z
  output: |
    npm run typecheck (kiểm kiểu mọi gói xanh)

- eval: E7
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T02:43:06Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    4 tệp giao diện ngoài bản đồ

- eval: E8
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T02:43:06Z
  output: |
    design-floor-s4.mjs --root . (không mã màu thô trên tệp giao diện vòng chạm)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T02:43:06Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T02:43:06Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T02:43:06Z

- cmd: npm run test:hooks
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T02:43:06Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T02:43:06Z

- cmd: npm run lint
  run_id: minted-va-bang-hang-cot-thap-tang-khi-loc-rong-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T02:43:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline; chứng minh harness chứ không chứng minh tính năng — cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/web` — E1, E2, E3, E4, E4b
- `npm run typecheck` — E6
- design-floor-khuon.mjs --kiem --root . — E7
- design-floor-s4.mjs --root . — E8

Judge panels: không có eval judgment nào trong hợp đồng này, nên không có panel và không có mục nào chờ human_override.

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: mọi eval xanh (E1-E8), verdict PASS. Đã ghi nhận phát hiện trong hợp đồng (AC-6, AC-1) và một phát hiện ngoài hợp đồng ở review-findings.md để người xem ở Cổng 2.
