---
schema_version: 2
feature_slug: cach-goi-rieng
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7d8ec27d7f0445f26450530e90292392dc9a670e
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: cach-goi-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | PASS |
| E12 | AC-4 | ui-check | PASS |
| E13 | AC-7 | ui-check | PASS |
| E14 | AC-6 | ui-check | PASS |
| E15 | AC-1 | script | PASS (đạt có giới hạn) |
| E15b | AC-1 | script | PASS |

## Evidence

Lệnh `npm run db:migrate && npm run db:test` phủ E1, E2, E2b, E3b, E6b, E8, E9 (một lần chạy, một lần đạt, không phương sai).

- eval: E1
  run_id: minted-cach-goi-rieng-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly và nhan.test.ts xanh
    ℹ duration_ms 91501.005334

- eval: E2
  run_id: minted-cach-goi-rieng-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run db:migrate && npm run db:test — ca «trả về mặc định» ok
    ℹ duration_ms 91501.005334

- eval: E2b
  run_id: minted-cach-goi-rieng-E2b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run db:migrate && npm run db:test — ca «gỡ tên riêng đang được căn dùng» ok
    ℹ duration_ms 91501.005334

- eval: E3b
  run_id: minted-cach-goi-rieng-E3b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run db:migrate && npm run db:test — ca «giá trị riêng có neo» ok
    ℹ duration_ms 91501.005334

- eval: E6b
  run_id: minted-cach-goi-rieng-E6b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run db:migrate && npm run db:test — ca «nhóm môi giới thấy tên riêng» ok
    ℹ duration_ms 91501.005334

- eval: E8
  run_id: minted-cach-goi-rieng-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run db:migrate && npm run db:test — hai ca cách ly «labels.* theo sàn» và «sàn khác thấy mặc định» ok
    ℹ duration_ms 91501.005334

- eval: E9
  run_id: minted-cach-goi-rieng-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run db:migrate && npm run db:test — ca «chỉ quản trị ghi, chữ sạch» ok
    ℹ duration_ms 91501.005334

Lệnh `npm test -w @quy-hang/core` phủ E3, E6, E7, E10b.

- eval: E3
  run_id: minted-cach-goi-rieng-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/core xanh
    ℹ duration_ms 2508.640375

- eval: E6
  run_id: minted-cach-goi-rieng-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/core xanh
    ℹ duration_ms 2508.640375

- eval: E7
  run_id: minted-cach-goi-rieng-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/core xanh
    ℹ duration_ms 2508.640375

- eval: E10b
  run_id: minted-cach-goi-rieng-E10b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/core xanh
    ℹ duration_ms 2508.640375

Lệnh `npm test -w @quy-hang/web` phủ E3c, E4, E5, E6c, E7b, E9b, E10.

- eval: E3c
  run_id: minted-cach-goi-rieng-E3c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/web xanh
    ℹ duration_ms 5113.790125

- eval: E4
  run_id: minted-cach-goi-rieng-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/web xanh
    ℹ duration_ms 5113.790125

- eval: E5
  run_id: minted-cach-goi-rieng-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/web xanh
    ℹ duration_ms 5113.790125

- eval: E6c
  run_id: minted-cach-goi-rieng-E6c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/web xanh
    ℹ duration_ms 5113.790125

- eval: E7b
  run_id: minted-cach-goi-rieng-E7b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/web xanh
    ℹ duration_ms 5113.790125

- eval: E9b
  run_id: minted-cach-goi-rieng-E9b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/web xanh
    ℹ duration_ms 5113.790125

- eval: E10
  run_id: minted-cach-goi-rieng-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm test -w @quy-hang/web xanh
    ℹ duration_ms 5113.790125

- eval: E7c
  run_id: minted-cach-goi-rieng-E7c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T17:34:58Z
  output: |
    npm run test:ro-ri xanh, gồm ca «rò rỉ: từ vựng ra ngoài không mang nhãn nội bộ»
    ℹ duration_ms 1179.618708

- eval: E15
  run_id: minted-cach-goi-rieng-E15-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T17:34:58Z
  output: |
    Bộ chấm khuôn của kit 2.37.0 báo oan một dòng cho trang Cách gọi (đã khai ngoại lệ, kit#485); E15b bảo đảm mọi dòng lệch đều là dòng báo oan ấy.
    20 tệp giao diện ngoài bản đồ

- eval: E15b
  run_id: minted-cach-goi-rieng-E15b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/cach-goi-rieng/kiem-khuon-e15.mjs
  verified_at: 2026-11-05T17:34:58Z
  output: |
    E15b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/labels/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E11
  run_id: minted-cach-goi-rieng-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:34:58Z
  screenshot: evidence/E11-step1.png
  observed: |
    step1 (1440): khung nhà, mục «Cách gọi» sáng ở cột Cài đặt, breadcrumb «Cài đặt › Sàn [Mẫu] Sàn thử › Cách gọi», câu «Chỉ áp cho sàn [Mẫu] Sàn thử», nhóm «Tên trường»; step2: nhóm «Giá trị riêng» dòng «Điều kiện phí · Bao phí» ô «BP» và khối «Đã lưu cách gọi».
    step3: ô «Gọi 0900 000 001» viền đỏ, câu «Chứa số điện thoại», Lưu bị khoá. step4: sau Trả về mặc định + Lưu + tải lại, ô Điều kiện phí trống, mô tả «Đang dùng tên mặc định». step5 (375): các dòng xếp dọc, không cuộn ngang. Khớp Expected.
  network_observed: clean

- eval: E12
  run_id: minted-cach-goi-rieng-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:34:58Z
  screenshot: evidence/E12-step1.png
  observed: |
    1440: lưới Bảng hàng có cột «Phí CN»; căn bao phí hiện «BP», căn còn lại «Không bao phí»; ô lọc cột phí có «Mọi điều kiện», «BP», «Không bao phí»; chọn BP còn 22 / 44 căn, mọi dòng hiện «BP».
    375: thẻ căn hiện «BP» dưới giá. Khớp Expected (tiêu đề cột bị cắt mép phải ở step1 nhưng đầy đủ ở step2).
  network_observed: clean

- eval: E13
  run_id: minted-cach-goi-rieng-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:34:58Z
  screenshot: evidence/E13-step1.png
  observed: |
    Khổ 390: trang «[Mẫu] Sàn thử» có một thẻ căn Toà A, giá «7,95 tỷ» kèm «BP» chữ nhỏ cạnh giá. Chi tiết (step2) có dòng «Pháp lý» (tên mặc định vì sàn chưa đặt) và «Hiện trạng», không có chữ nào của nhãn lý do ngừng. Khớp Expected.
  network_observed: clean

- eval: E14
  run_id: minted-cach-goi-rieng-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T17:34:58Z
  screenshot: evidence/E14-step1.png
  observed: |
    1440: hộp thoại «Xuất bảng hàng», bước «Xem trước», chân «2 căn · Excel · Nhóm môi giới». Bảng có cột «Phí CN»; A-03.01 hiện «Không bao phí», A-13.01 hiện «BP». Không có cột lý do ngừng. Khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-cach-goi-rieng-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T17:34:58Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cach-goi-rieng-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T17:34:58Z

- cmd: npm run test:hooks
  run_id: minted-cach-goi-rieng-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T17:34:58Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-cach-goi-rieng-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T17:34:58Z

- cmd: npm run typecheck
  run_id: minted-cach-goi-rieng-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T17:34:58Z

- cmd: npm run lint
  run_id: minted-cach-goi-rieng-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T17:34:58Z

## Known limits

- E15 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code hiện tại lẫn baseline; chứng minh bộ chạy chứ chưa chứng minh tính năng, nên viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):

- npm run db:migrate && npm run db:test: E1, E2, E2b, E3b, E6b, E8, E9
- npm test -w @quy-hang/core: E3, E6, E7, E10b
- npm test -w @quy-hang/web: E3c, E4, E5, E6c, E7b, E9b, E10
- npm run test:ro-ri: E7c

Baseline khong do

- node _acceptance/cach-goi-rieng/kiem-khuon-e15.mjs: bo qua baseline: tep _acceptance/cach-goi-rieng/kiem-khuon-e15.mjs co o cay dang kiem nhung chua co o merge-base d98ea15cfa64047d0454aa5aca8e9da7196a118e — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15 bị REJECT ở S4 lượt 1 (ba phát hiện trong hợp đồng: cách xem đã lưu, thứ tự khoá doiNhan, E15). Returned to implementation.
Round 2: toàn bộ eval đạt; E15 đạt có giới hạn (kit#485) cùng E15b xanh; không còn phát hiện trong hợp đồng.
