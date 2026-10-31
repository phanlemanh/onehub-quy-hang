---
schema_version: 2
feature_slug: o-nhan-lead
verdict: REJECT
failed_evals: ["E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 051079134b4f75c05b97638d5ed1b9a5cde65077
human_signoff:
---

# Evidence Report: o-nhan-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | FAIL |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-o-nhan-lead-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 97.782458

- eval: E2
  run_id: minted-o-nhan-lead-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 97.782458

- eval: E7
  run_id: minted-o-nhan-lead-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 97.782458

- eval: E3
  run_id: minted-o-nhan-lead-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 2797.083083

- eval: E4
  run_id: minted-o-nhan-lead-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 2797.083083

- eval: E5
  run_id: minted-o-nhan-lead-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 2797.083083

- eval: E6
  run_id: minted-o-nhan-lead-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 2797.083083

- eval: E7b
  run_id: minted-o-nhan-lead-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 2797.083083

- eval: E8
  run_id: minted-o-nhan-lead-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 2797.083083

- eval: E9
  run_id: minted-o-nhan-lead-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  output: |
    ℹ duration_ms 2797.083083

- eval: E11
  run_id: minted-o-nhan-lead-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-31T15:10:18Z
  output: |
    design-floor-s4 chạy xong, không báo mã màu thô trên tệp giao diện vòng chạm.

- eval: E10
  run_id: minted-o-nhan-lead-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T15:10:18Z
  screenshot: evidence/E10-trong.png   # khung đầu; các khung khác E10-step*.png, E10-khong-trung.png, E10-co-dau-chu.png, E10-can-trung.png, E10-da-bo.png, E10-loi.png
  observed: |
    Năm ô nhãn đúng, lỗi dưới từng ô khi gửi trống, «Hiểu là: 3,2 tỷ» đổi theo điều kiện phí, nút «Đang kiểm trùng…» khoá, ba Alert (không trùng, chủ trùng, căn trùng có nút «Bỏ lead này»), «Đã bỏ lead này — có ghi lại» và Alert lỗi mạng giữ nguyên năm ô — đều đúng Expected.
    Khung E10-khong-trung.png: sau gửi thành công năm ô rỗng nhưng KHÔNG có vòng tiêu điểm ở ô Số chủ nhà (phần tử đang giữ tiêu điểm là thân trang), trái với Expected «tiêu điểm ở ô số chủ»; lặp lại ở gửi chậm, gửi nhanh và ca chủ trùng.
  network_observed: app-fail

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T15:10:18Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T15:10:18Z

- cmd: npm run test:hooks
  run_id: minted-o-nhan-lead-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T15:10:18Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-10-31T15:10:18Z

- cmd: npm run typecheck
  run_id: minted-o-nhan-lead-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T15:10:18Z

- cmd: npm run lint
  run_id: minted-o-nhan-lead-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T15:10:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả bản nhánh lẫn bản gốc diffBase — chứng minh bộ dựng chứ chưa chứng minh tính năng; cần viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- `npm test -w @quy-hang/core` — E1, E2, E7
- `npm run db:migrate && npm run db:test` — E3, E4, E5, E6, E7b, E8, E9
- `design-floor-s4` (config:executors.script.design_floor) — E11

Lệnh fail không gắn eval nào: `npm test -w @quy-hang/ui-lint` (suite hồi quy, không thuộc AC). Ca đỏ: «cây lành in dòng tóm tắt, Người dùng trả <main> thì đỏ» ở packages/ui-lint/tests/rang-giu-khuon.test.mjs dòng 152 — assertion kỳ vọng true nhận false, dù nhật ký in ra đủ các dòng «chuẩn giao diện: đạt». Ngược lại `npm run lint` (cùng bộ chuẩn) xanh. Cần người xem ca này là hỏng do tính năng hay do bộ dựng của ui-lint.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 failed — sau khi gửi lead thành công, tiêu điểm không về ô số chủ (activeElement là thân trang) ở cả gửi chậm, gửi nhanh và ca chủ trùng; nghi ngờ do `soRef.current?.focus()` chạy lúc ô còn khoá. Suite `@quy-hang/ui-lint` cũng có một ca đỏ chưa gắn eval. Returned to implementation.

