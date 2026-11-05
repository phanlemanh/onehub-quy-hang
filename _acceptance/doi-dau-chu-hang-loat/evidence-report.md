---
schema_version: 2
feature_slug: doi-dau-chu-hang-loat
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8bcbc1d7601f6709708a8856aa5e8537a01df7c0
human_signoff:
---

# Evidence Report: doi-dau-chu-hang-loat

Vòng 2. Mọi eval máy và eval giao diện đều chạy xong và đạt. Verdict tổng là REJECT vì phép đo của vài eval còn yếu (xem `review-findings.md`, mục «Trong hợp đồng»). Các lỗi đo ấy trả về cho khâu viết lại bài kiểm, không phải eval hỏng.

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
| E9 | AC-9 | ui-check | PASS |
| E9b | AC-4 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-doi-dau-chu-hang-loat-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 1456.438167

- eval: E1b
  run_id: minted-doi-dau-chu-hang-loat-E1b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 3438.435417

- eval: E4b
  run_id: minted-doi-dau-chu-hang-loat-E4b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 3438.435417

- eval: E1c
  run_id: minted-doi-dau-chu-hang-loat-E1c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 65983.878708

- eval: E2
  run_id: minted-doi-dau-chu-hang-loat-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 65983.878708

- eval: E3
  run_id: minted-doi-dau-chu-hang-loat-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 65983.878708

- eval: E4
  run_id: minted-doi-dau-chu-hang-loat-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 65983.878708

- eval: E5
  run_id: minted-doi-dau-chu-hang-loat-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 65983.878708

- eval: E6
  run_id: minted-doi-dau-chu-hang-loat-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 65983.878708

- eval: E7
  run_id: minted-doi-dau-chu-hang-loat-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 65983.878708

- eval: E4c
  run_id: minted-doi-dau-chu-hang-loat-E4c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 9470.874792

- eval: E8
  run_id: minted-doi-dau-chu-hang-loat-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.doi_dau_chu_tai_lieu
  verified_at: 2026-11-05T04:33:03Z
  output: |
    ℹ duration_ms 118.926667

- eval: E8b
  run_id: minted-doi-dau-chu-hang-loat-E8b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T04:33:03Z
  output: |
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-doi-dau-chu-hang-loat-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T04:33:03Z
  screenshot: evidence/E9-hop-hoi.png
  observed: |
    E9-hop-hoi.png: nền bảng bị làm mờ, hộp «Đổi đầu chủ 5 căn», mô tả «Mọi căn cùng chủ nhà đi theo · 2 liên hệ chủ nhà đổi người giữ.», ô chọn «[Mẫu] Đầu chủ 2», 5 dòng căn (A-04.06, A-10.05, A-06.03, A-08.03, A-11.02), mỗi dòng «đang giữ: [Mẫu] Đầu chủ 1», 3 dòng cuối có «cùng chủ nhà»; nút Thôi và Đổi đầu chủ; không thấy tên hay số chủ nhà. E9-sau-doi.png: bảng hàng hiện lại, không có cột Đầu chủ, thông báo «Đã đổi đầu chủ 5 căn, 2 liên hệ» kèm nút «Hoàn tác» ở góc dưới. E9-hoan-tac.png: thông báo «Đã trả lại người giữ cũ: 7 mục (căn và liên hệ)», bảng 26 căn. E9-dau-chu.png: đăng nhập là DA (đầu chủ), tích 1 căn, thanh lệnh chỉ có «Đổi trạng thái», «Đánh dấu đã gọi», «Bỏ chọn», không có «Đổi đầu chủ». Khớp Expected.
  network_observed: n-a (driver)

- eval: E9b
  run_id: minted-doi-dau-chu-hang-loat-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T04:33:03Z
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-step1.png (copy of E9-sau-doi.png): the inventory table is on screen, 26 rows, with no reload. A toast at the bottom right reads "Đã đổi đầu chủ 5 căn, 2 liên hệ" and has a "Hoàn tác" button. E9b-step2.png (copy of E9-hoan-tac.png): same table, and the toast area at the bottom shows a faded "Đã trả lại người giữ cũ: 7 mục (căn và liên hệ)". The table has no Đầu chủ column, as the eval's steps say it should not yet. The frames only show the toasts. The Postgres values come from the --doc JSON in the chay-ui.mjs output.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T04:33:03Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T04:33:03Z

- cmd: npm run test:hooks
  run_id: minted-doi-dau-chu-hang-loat-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T04:33:03Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T04:33:03Z

- cmd: npm run typecheck
  run_id: minted-doi-dau-chu-hang-loat-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T04:33:03Z

- cmd: npm run lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T04:33:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên mã cũ lẫn mã mới; chứng minh bộ đo chứ chưa chứng minh tính năng, cần viết lại để khẳng định hành vi mới hoặc xác nhận là rào hồi quy có chủ ý):
- `npm test -w @quy-hang/core`: E1
- `npm test -w @quy-hang/web`: E1b, E4b
- `npm run db:migrate && npm run db:test`: E1c, E2, E3, E4, E5, E6, E7
- `npm run test:db -w @quy-hang/web`: E4c
- `node --test "_acceptance/doi-dau-chu-hang-loat/thu/*.test.mjs"`: E8
- lệnh chấm khuôn thiết kế (`design-floor-khuon.mjs --kiem`): E8b

Baseline không đo: E9, E9b (eval giao diện, không chạy được trên mã cũ).

## Variance

none — mọi eval nhiều lần chạy đều đồng đều (mọi eval chạy một lần, tất định).

## Iterations

Round 1: lượt chấm đầu REJECT, số đo chưa đủ (commit a0e83ad4); AC-4 thu theo chủ kho, cột Đầu chủ hàng sau.
Round 2: mọi eval máy và giao diện đạt; verdict REJECT do các lỗi phép đo trong hợp đồng (bài quét rò rỉ chủ nhà ở E9 quét sai giá trị và thiếu đối chứng dương, ca ba hàm chỉ kiểm hai, hai bài đo bằng regex mã nguồn, bài nút tắt thiếu đối chứng). Trả về khâu viết lại bài kiểm.
