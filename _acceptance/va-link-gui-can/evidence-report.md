---
schema_version: 2
feature_slug: va-link-gui-can
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6d47feb80b4d206ff5b804d9734ef63223837fe3
human_signoff:
---

# Evidence Report: va-link-gui-can

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-1 | ui-check | PASS |
| E5 | AC-2 | ui-check | PASS |
| E6 | AC-4 | script | PASS |
| E7 | AC-4 | script | PASS |
| E8 | AC-4 | script | PASS |
| E9 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-link-gui-can-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T13:53:05Z
  output: |
    Lệnh: npm test -w @quy-hang/web
    ca «đã gửi: trạng thái màn» và ca «link nội bộ: hai nút «Gửi căn» mở Bảng hàng» có mặt và ok.
    ℹ duration_ms 5273.73925

- eval: E2
  run_id: minted-va-link-gui-can-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T13:53:05Z
  output: |
    Lệnh: npm test -w @quy-hang/web
    ca «hôm nay đầu khách: trạng thái vùng» và ca «link nội bộ» (phần dong-tin.tsx) có mặt và ok.
    ℹ duration_ms 5273.73925

- eval: E3
  run_id: minted-va-link-gui-can-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T13:53:05Z
  output: |
    Lệnh: npm test -w @quy-hang/web
    Sáu ca «link nội bộ: …» có mặt và ok.
    ℹ duration_ms 5273.73925

- eval: E4
  run_id: minted-va-link-gui-can-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T13:53:05Z
  screenshot: evidence/E4-da-gui-trong.png
  observed: |
    E4-da-gui-trong.png (375x812): thanh «Gửi», «‹ Đã gửi», tiêu đề «Link đã gửi», trạng thái trống «Chưa gửi link nào» với nút «Gửi căn», tab bar Hôm nay/Bảng hàng/Gửi/Tôi (Gửi đang chọn). Khớp Expected bước 1.
    E4-bang-hang.png (375): thanh trên «Bảng hàng», «Chưa có căn nào trên bảng hàng chung», nút «Về Hôm nay»; không có «Không thấy trang này», không có «Sàn chưa có hàng nào»; địa chỉ /inventory.
    E4-bang-hang-may-tinh.png (1280x800): giao diện máy tính có thanh bên, tiêu đề «Bảng hàng», «Sàn chưa có hàng nào», nút «Nhập Excel»; không có «Chưa có căn nào trên bảng hàng chung». Khớp Expected.
  network_observed: clean

- eval: E5
  run_id: minted-va-link-gui-can-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T13:53:05Z
  screenshot: evidence/E5-hom-nay-trong.png
  observed: |
    E5-hom-nay-trong.png: màn Hôm nay (khổ 375), tiêu đề «Hôm nay», vùng «Đầu khách» với «Chưa có gì mới trong 7 ngày», nút «Gửi căn», thanh dưới 4 tab (Hôm nay đang chọn).
    E5-bang-hang.png: thanh trên «Bảng hàng»; nội dung «Chưa có căn nào trên bảng hàng chung», nút «Về Hôm nay»; tab Bảng hàng được chọn; không có «Không thấy trang này», không có «Sàn chưa có hàng nào». Khớp Expected.
  network_observed: clean

- eval: E6
  run_id: minted-va-link-gui-can-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-05T13:53:05Z
  output: |
    Lệnh: npm run lint
    chuẩn giao diện: đạt

- eval: E7
  run_id: minted-va-link-gui-can-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-05T13:53:05Z
  output: |
    Lệnh: npm run typecheck
    (không lỗi kiểu ở mọi gói)

- eval: E8
  run_id: minted-va-link-gui-can-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T13:53:05Z
  output: |
    Lệnh: design-floor-s4 --root .
    (không mã màu thô trên tệp giao diện vòng chạm)

- eval: E9
  run_id: minted-va-link-gui-can-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T13:53:05Z
  output: |
    Lệnh: design-floor-khuon --kiem --root .
    5 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-link-gui-can-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-05T13:53:05Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-link-gui-can-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T13:53:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-link-gui-can-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T13:53:05Z

- cmd: npm run test:hooks
  run_id: minted-va-link-gui-can-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T13:53:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-link-gui-can-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T13:53:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code hiện tại lẫn baseline — chứng minh harness, chưa chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web — E1, E2, E3
- npm run lint — E6
- npm run typecheck — E7
- design-floor-s4 — E8
- design-floor-khuon --kiem — E9

Baseline không đo: E4, E5 (ui-check, baseline n-a — không chạy được trên code cũ).

Judge panels: không có judgment item nào trong vòng này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh (E1–E9), không eval nào hỏng; verdict PASS.
