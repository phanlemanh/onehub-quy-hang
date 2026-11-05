---
schema_version: 2
feature_slug: nhap-hoan-tac
verdict: REJECT
failed_evals: [E12b]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 76349a4789b4007fc818b3fbe42e80cd6eb07671
human_signoff:
---

# Evidence Report: nhap-hoan-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E7d | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-8 | script | PASS |
| E12b | AC-8 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-nhap-hoan-tac-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E2
  run_id: minted-nhap-hoan-tac-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E3
  run_id: minted-nhap-hoan-tac-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 745.735167

- eval: E3b
  run_id: minted-nhap-hoan-tac-E3b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E4
  run_id: minted-nhap-hoan-tac-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 745.735167

- eval: E4b
  run_id: minted-nhap-hoan-tac-E4b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E5
  run_id: minted-nhap-hoan-tac-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E6
  run_id: minted-nhap-hoan-tac-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E7
  run_id: minted-nhap-hoan-tac-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 745.735167

- eval: E7b
  run_id: minted-nhap-hoan-tac-E7b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E7c
  run_id: minted-nhap-hoan-tac-E7c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2086.020833

- eval: E7d
  run_id: minted-nhap-hoan-tac-E7d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 67748.562083

- eval: E8
  run_id: minted-nhap-hoan-tac-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2086.020833

- eval: E8b
  run_id: minted-nhap-hoan-tac-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T01:49:05Z
  screenshot: evidence/E8b-1-trong-1440.png
  observed: |
    1-trong 1440/375: Nhập Excel bước 1, mục «Lần nhập gần đây» hiện «Chưa có lần nhập nào» kèm «Lần nhập đã ghi sẽ hiện ở đây để hoàn tác khi cần.». 2-sau-ghi: hộp «Hoàn tác lần nhập này?» nêu «Gỡ 30 căn khỏi Quỹ hàng · Trả giá cũ cho 0 căn · 0 căn không hoàn tác được», nút Hoàn tác / Giữ lại, nền mờ ở bước 5 (tệp mau-b.xlsx, 40 dòng); 375 xếp dọc, không tràn. 3-xac-nhan: hộp «Đã hoàn tác lần nhập» cùng dòng tóm tắt 30/0/0, nút Đóng; nền thấy mau-b.xlsx 30 dòng ghi nhãn «Đã hoàn tác». 4-da-hoan-tac: Lần nhập gần đây có mau-b.xlsx · 2026-11-05 · 30 dòng ghi với nhãn «Đã hoàn tác», không có nút hoàn tác, ở cả hai khổ. 5-da-sua-sau: hộp «Gỡ 19 căn khỏi Quỹ hàng · Trả giá cũ cho 0 căn · 1 căn không hoàn tác được», liệt kê «Toà A · A-02.06 — Đã có người sửa sau lần nhập»; nút Hoàn tác/Giữ lại. 6-loi-giua-chung: cùng hộp thêm khung đỏ «Hoàn tác chưa xong — bấm lại để làm tiếp», nút đổi thành «Hoàn tác tiếp» (JSON xác nhận xong sau khi bấm lại). Không có chỗ nào mâu thuẫn Expected; bố cục 375 sạch, không cắt chữ.
  network_observed: n-a (driver)
  output: |
    Ảnh đã lưu (12) tại _acceptance/nhap-hoan-tac/evidence/: E8b-1-trong, E8b-2-sau-ghi, E8b-3-xac-nhan, E8b-4-da-hoan-tac, E8b-5-da-sua-sau, E8b-6-loi-giua-chung (mỗi cái 1440 và 375).
    Kịch bản chụp-hoan-tac 6 ca x 2 khổ chạy sạch; máy dev G đã tắt.

- eval: E9
  run_id: minted-nhap-hoan-tac-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2086.020833

- eval: E10
  run_id: minted-nhap-hoan-tac-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 745.735167

- eval: E11
  run_id: minted-nhap-hoan-tac-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2086.020833

- eval: E12
  run_id: minted-nhap-hoan-tac-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-05T01:49:05Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E12b
  run_id: minted-nhap-hoan-tac-E12b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T01:49:05Z
  output: |
    sai: design/patterns/trang-tam.md: ngoai_le trỏ tệp không có: apps/web/src/app/(app)/proto/o-nhan-lead/page.tsx
    bản đồ nhóm lead-cua-toi đổi sau khi ghim — chấm theo bản ghim
    bản đồ nhóm o-nhan-lead đổi sau khi ghim — chấm theo bản ghim
    bản đồ nhóm trang-tam đổi sau khi ghim — chấm theo bản ghim
    3 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-hoan-tac-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T01:49:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-hoan-tac-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T01:49:05Z

- cmd: npm run test:hooks
  run_id: minted-nhap-hoan-tac-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T01:49:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-hoan-tac-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-05T01:49:05Z
  output: |
    Không eval nào gắn lệnh này. Ca ban-do-khuon.test.mjs lệch một dòng: nhóm trang-thai thực tế «109 chỗ theo khuôn», bài kiểm kỳ vọng «105 chỗ theo khuôn».

- cmd: npm run typecheck
  run_id: minted-nhap-hoan-tac-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T01:49:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không chứng minh feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E3, E4, E7, E10
- npm test -w @quy-hang/web: E7c, E8, E9, E11
- npm run lint: E12

Lệnh fail không gắn eval: npm test -w @quy-hang/ui-lint (không thuộc eval nào; ca bản đồ khuôn lệch số «chỗ theo khuôn» của nhóm trang-thai), và lệnh E12b (đã gắn E12b).

Baseline không đo: E8b (n-a, eval giao diện mới).

## Variance

none — mọi eval chạy một lần, kết quả đồng nhất

## Iterations

Round 1: E12b failed — bước chấm khuôn báo tệp ngoại lệ trỏ tới trang không còn (proto/o-nhan-lead), bản đồ nhóm đổi sau khi ghim và 3 tệp giao diện ngoài bản đồ. Returned to implementation.

