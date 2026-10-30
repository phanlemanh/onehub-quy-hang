---
schema_version: 2
feature_slug: dang-nhap-theo-san
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: acb0ce2e9f17a30d38a236c5d49c8a2f54af4232
human_signoff:
---

# Evidence Report: dang-nhap-theo-san

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
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | test | PASS |
| E12 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-dang-nhap-theo-san-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E2
  run_id: minted-dang-nhap-theo-san-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E3
  run_id: minted-dang-nhap-theo-san-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E4
  run_id: minted-dang-nhap-theo-san-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E5
  run_id: minted-dang-nhap-theo-san-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E6
  run_id: minted-dang-nhap-theo-san-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E7
  run_id: minted-dang-nhap-theo-san-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E8
  run_id: minted-dang-nhap-theo-san-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm test -w @quy-hang/api
    ℹ duration_ms 60446.995667

- eval: E8b
  run_id: minted-dang-nhap-theo-san-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E9
  run_id: minted-dang-nhap-theo-san-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E10
  run_id: minted-dang-nhap-theo-san-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:dev_server.start
  verified_at: 2026-10-30T06:00:48Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở từng khung bằng Read, đủ mười một khung khớp thứ tự Expected: step1 /dang-nhap có «Đăng nhập Quỹ hàng», ô Email, nút «Gửi mã»; step2 «Đã gửi mã tới e10-mot-san@example.test», ô «Mã 6 số»; step3 dòng «Mã không đúng. Thử lại.» dưới ô; step4 và step5 «Bạn đang làm ở sàn [Sàn mẫu E10-A]» (đã đăng nhập vào /dang-nhap thì bị đưa về /); step6 lại form Email sau Đăng xuất.
    step7 «Chọn sàn làm việc» với hai nút [Sàn mẫu E10-A], [Sàn mẫu E10-B]; step8 «Bạn đang làm ở sàn [Sàn mẫu E10-B]»; step9 «Chưa thuộc sàn nào» kèm lời nhờ quản trị sàn mời; step10 «Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.» với nút «Gửi lại mã» và «Đổi email»; step11 «Bạn đang làm ở sàn [Sàn mẫu E10-A]».
    Chữ tiếng Việt; tên sàn do máy chủ trả (không có trong mã nguồn web); giao diện thô mặc định, không mâu thuẫn Expected.
  network_observed: clean

- eval: E11
  run_id: minted-dang-nhap-theo-san-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 423.503042

- eval: E12
  run_id: minted-dang-nhap-theo-san-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-30T06:00:48Z
  output: |
    cmd: npm test -w @quy-hang/api
    ℹ duration_ms 60446.995667

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dang-nhap-theo-san-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-30T06:00:48Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dang-nhap-theo-san-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-30T06:00:48Z

- cmd: npm run test:hooks
  run_id: minted-dang-nhap-theo-san-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-30T06:00:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- npm run db:migrate && npm run db:test: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»
- npm test -w @quy-hang/api: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Eval không-phân-biệt (xanh cả HEAD lẫn baseline): none đo được. Baseline không đo ở round này nên danh sách rỗng này KHÔNG chứng minh các eval feature có phân biệt; mọi field baseline là n-a.

## Variance

none — mọi eval đều chạy một lần, xác định, đạt trọn; không eval nào có pass_rate lẫn.

## Iterations

Round 1: mọi eval (E1-E12, kể cả E8b) đạt, không eval nào đỏ. Không cần quay lại triển khai.
