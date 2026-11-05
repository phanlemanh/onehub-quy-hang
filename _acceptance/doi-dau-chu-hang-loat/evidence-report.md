---
schema_version: 2
feature_slug: doi-dau-chu-hang-loat
verdict: REJECT
failed_evals: ["E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b5b2d1b19d6c67fe05cf69a9a82977f870a41ae0
human_signoff:
---

# Evidence Report: doi-dau-chu-hang-loat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E4c | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-1 | script | PASS |
| E9 | AC-9 | ui-check | FAIL |
| E9b | AC-4 | ui-check | PASS |

Lệnh fail không gắn eval: ui-check:E9 (cùng eval E9, đã tính ở trên).

## Evidence

- eval: E1
  run_id: minted-doi-dau-chu-hang-loat-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 726.971125

- eval: E1b
  run_id: minted-doi-dau-chu-hang-loat-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2958.022959

- eval: E4b
  run_id: minted-doi-dau-chu-hang-loat-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2958.022959

- eval: E1c
  run_id: minted-doi-dau-chu-hang-loat-E1c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 59114.63075

- eval: E2
  run_id: minted-doi-dau-chu-hang-loat-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 59114.63075

- eval: E3
  run_id: minted-doi-dau-chu-hang-loat-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 59114.63075

- eval: E4
  run_id: minted-doi-dau-chu-hang-loat-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 59114.63075

- eval: E5
  run_id: minted-doi-dau-chu-hang-loat-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 59114.63075

- eval: E6
  run_id: minted-doi-dau-chu-hang-loat-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 59114.63075

- eval: E7
  run_id: minted-doi-dau-chu-hang-loat-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 59114.63075

- eval: E4c
  run_id: minted-doi-dau-chu-hang-loat-E4c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-05T01:33:29Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 10458.812792

- eval: E8
  run_id: minted-doi-dau-chu-hang-loat-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.doi_dau_chu_tai_lieu
  verified_at: 2026-11-05T01:33:29Z
  output: |
    node --test "_acceptance/doi-dau-chu-hang-loat/thu/*.test.mjs"
    ℹ duration_ms 71.286708

- eval: E8b
  run_id: minted-doi-dau-chu-hang-loat-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T01:33:29Z
  output: |
    design-floor-khuon --kiem
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-doi-dau-chu-hang-loat-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T01:33:29Z
  screenshot: evidence/E9-hop-hoi.png
  observed: |
    E9-hop-hoi.png: modal "Đổi đầu chủ 5 căn", sub "Mọi căn cùng chủ nhà đi theo · 2 liên hệ chủ nhà đổi người giữ.", selector [Mẫu] Đầu chủ 2, năm dòng Toà A A-04.06, A-10.05, A-06.03, A-08.03, A-11.02 mỗi dòng "đang giữ: [Mẫu] Đầu chủ 1", ba dòng cuối gắn "cùng chủ nhà"; nút Thôi / Đổi đầu chủ; không có tên hay số chủ nhà. Khớp Expected.
    E9-sau-doi.png: bảng 26/26 căn, thông báo "Đã đổi đầu chủ 5 căn, 2 liên hệ" kèm Hoàn tác; cột đầu chủ nằm ngoài màn hình bên phải nên KHÔNG thấy bảng hiện D2 trong ảnh.
    E9-hoan-tac.png: thông báo "Đã trả lại người giữ cũ cho 7 căn và liên hệ" (số 7 khác cách nói 5 căn + 2 liên hệ của Expected; dữ liệu DB cho D1 đủ 5 căn và 2 liên hệ).
    E9-dau-chu.png: đăng nhập đầu chủ, 1 căn đã chọn, thanh có Đổi trạng thái / Đánh dấu đã gọi / Bỏ chọn, không có «Đổi đầu chủ».
    Vế Expected «bảng hiện D2 ở cả 5 căn» không có bằng chứng trong ảnh hay đầu ra kịch bản (kịch bản chỉ đo thời gian đến khi thông báo hiện, không đọc cột đầu chủ của bảng) nên eval không đạt.
  network_observed: n-a (driver)
  output: |
    Frames: E9-hop-hoi.png, E9-sau-doi.png, E9-hoan-tac.png, E9-dau-chu.png.
    PASS e9-hop-hoi, e9-sau-doi toast (không tải lại trang), e9-sau-doi-db (D2 x5, liên hệ D2 x2), e9-hoan-tac data (D1 x5, D1 x2), e9-dau-chu (không có nút Đổi đầu chủ).
    Thiếu bằng chứng: bước 4 và Expected «bảng hiện D2 ở cả 5 căn»; E9-sau-doi.png cắt trước cột đầu chủ, 5 căn đổi không hiện trong khung.

- eval: E9b
  run_id: minted-doi-dau-chu-hang-loat-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T01:33:29Z
  screenshot: evidence/E9b-step1.png
  observed: |
    Frame E9b-step1.png (sau đổi): bảng hàng, hộp xác nhận đang mờ dần, toast góc dưới "Đã đổi đầu chủ 5 căn, 2 liên hệ" kèm nút Hoàn tác, không tải lại trang. Frame E9b-step2.png (sau Hoàn tác): bảng hàng, toast "Đã trả lại người giữ cũ cho 7 căn và liên hệ". Khớp Expected. Dòng --doc sau đổi: dauChu D2 x5, nguoiGiu D2 x2. Sau Hoàn tác: dauChu D1 x5, nguoiGiu D1 x2.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T01:33:29Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T01:33:29Z

- cmd: npm run test:hooks
  run_id: minted-doi-dau-chu-hang-loat-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T01:33:29Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T01:33:29Z

- cmd: npm run typecheck
  run_id: minted-doi-dau-chu-hang-loat-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T01:33:29Z

- cmd: npm run lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T01:33:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

Không có eval dạng judgment trong hợp đồng này nên không có bảng giám khảo.

Eval không phân biệt (xanh trên cả bản nhánh lẫn baseline; chứng minh khung đo chứ chưa chứng minh tính năng, nên viết lại để khẳng định hành vi mới hoặc xác nhận là rào hồi quy có chủ ý):
- E1 (npm test -w @quy-hang/core)
- E1b, E4b (npm test -w @quy-hang/web)
- E1c, E2, E3, E4, E5, E6, E7 (npm run db:migrate && npm run db:test)
- E4c (npm run test:db -w @quy-hang/web)
- E8 (node --test thư mục thu)
- E8b (design-floor-khuon --kiem)

Baseline không đo: E9, E9b (baseline n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed — vế «bảng hiện D2 ở cả 5 căn» không có bằng chứng: kịch bản không đọc cột đầu chủ của bảng và ảnh sau đổi cắt trước cột đó. Returned to implementation.
