---
schema_version: 2
feature_slug: dang-nhap-theo-san
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 711c1b5d851e0f3faae75ba5180e713f7e30e723
human_signoff: Manh Phan 2026-10-30
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
  run_id: minted-dang-nhap-theo-san-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E2
  run_id: minted-dang-nhap-theo-san-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E3
  run_id: minted-dang-nhap-theo-san-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E4
  run_id: minted-dang-nhap-theo-san-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E5
  run_id: minted-dang-nhap-theo-san-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E6
  run_id: minted-dang-nhap-theo-san-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E7
  run_id: minted-dang-nhap-theo-san-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E8
  run_id: minted-dang-nhap-theo-san-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm test -w @quy-hang/api
    ℹ duration_ms 60495.6455

- eval: E8b
  run_id: minted-dang-nhap-theo-san-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E9
  run_id: minted-dang-nhap-theo-san-E9-r1
  carried_from_round: 1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T06:00:48Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-dang-nhap-theo-san-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:dev_server.start
  verified_at: 2026-10-30T07:36:35Z
  screenshot: evidence/E10-step1.png
  observed: |
    Đã mở và đọc từng frame trong 11 tệp. Mọi frame là card ReUI căn giữa, chữ tiếng Việt, và đều khớp Expected.
    step1: card «Đăng nhập Quỹ hàng», ô Email trống, nút «Gửi mã». Khớp ST-dang-nhap-email.
    step2: dòng «Đã gửi mã tới e10-mot-san@example.test», ô «Mã 6 số», nút «Vào» và «Đổi email». Khớp ST-dang-nhap-ma.
    step3: ô nhập 000000 viền đỏ, dòng đỏ «Mã không đúng. Thử lại.». Khớp ST-dang-nhap-ma-sai.
    step4: card «Quỹ hàng», dòng «Bạn đang làm ở sàn [Sàn mẫu E10-A]», nút «Đăng xuất». Chụp sau khi tải lại trang. Khớp ST-trang-dau-co-san.
    step5: giống step4, cùng tên sàn A, nằm ở trang /. Khớp ST-trang-dau-co-san.
    step6: quay về form «Đăng nhập Quỹ hàng» với ô Email trống. Khớp ST-dang-nhap-email.
    step7: card «Chọn sàn làm việc» liệt hai nút [Sàn mẫu E10-A] và [Sàn mẫu E10-B] cùng «Đăng xuất». Khớp ST-chon-san-danh-sach.
    step8: «Bạn đang làm ở sàn [Sàn mẫu E10-B]». Khớp ST-trang-dau-co-san (tên B).
    step9: tiêu đề «Chưa thuộc sàn nào», nội dung «Tài khoản e10-chua-gan@example.test chưa thuộc sàn nào. Nhờ quản trị sàn mời bạn.», nút «Đăng xuất». Khớp ST-chua-gan-san-trong.
    step10: ô nhập 379510 viền đỏ, dòng đỏ «Mã đã hết hạn hoặc sai quá số lần. Gửi lại mã.», nút «Gửi lại mã» và «Đổi email». Khớp ST-dang-nhap-ma-het.
    step11: «Bạn đang làm ở sàn [Sàn mẫu E10-A]» với mã mới. Khớp ST-trang-dau-co-san.
    Tên sàn trong các frame là tên máy chủ trả (dữ liệu E10 dựng riêng, không có trong mã nguồn web).
  network_observed: clean

- eval: E11
  run_id: minted-dang-nhap-theo-san-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 463.177709

- eval: E12
  run_id: minted-dang-nhap-theo-san-E12-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-10-30T07:36:35Z
  output: |
    cmd: npm test -w @quy-hang/api
    ℹ duration_ms 60495.6455

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dang-nhap-theo-san-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-30T07:36:35Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dang-nhap-theo-san-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-30T07:36:35Z

- cmd: npm run test:hooks
  run_id: minted-dang-nhap-theo-san-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-30T07:36:35Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dang-nhap-theo-san-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-30T07:36:35Z

- cmd: npm run typecheck
  run_id: minted-dang-nhap-theo-san-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-30T07:36:35Z

- cmd: npm run lint
  run_id: minted-dang-nhap-theo-san-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-30T07:36:35Z

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
Round 2: sau khi merge main vào nhánh (màn đăng nhập dựng lại bằng thành phần chuẩn), chạy lại E1-E8, E8b, E10, E11, E12 và sáu lệnh suite, tất cả đạt; E9 mang sang từ round 1 vì delta không chạm paths của eval. Không cần quay lại triển khai.
