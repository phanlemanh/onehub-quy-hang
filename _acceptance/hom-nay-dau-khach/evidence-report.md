---
schema_version: 2
feature_slug: hom-nay-dau-khach
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8a2066bc9b16a2a9d0d35f590e2ed3bcb720eda0
human_signoff:
---

# Evidence Report: hom-nay-dau-khach

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-hom-nay-dau-khach-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:34:09Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51226.79375

- eval: E2
  run_id: minted-hom-nay-dau-khach-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:34:09Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51226.79375

- eval: E3
  run_id: minted-hom-nay-dau-khach-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:34:09Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51226.79375

- eval: E4b
  run_id: minted-hom-nay-dau-khach-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:34:09Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 51226.79375

- eval: E6b
  run_id: E6b-20261104-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T16:34:09Z
  screenshot: evidence/E6b-step1.png
  observed: |
    Đã mở từng ảnh bằng Read (khổ 375). step1: tiêu đề «Đầu khách», «13 tin trong 1 ngày», nhóm «HÔM NAY»; ba tin mới nhất đúng ba loại ở đầu danh sách: Căn mới (Toà A · A-08.05, 23:39 · 7 tỷ, «Khớp bộ gửi [Mẫu] Khách chấm»), Vừa đổi (Toà A · A-10.05, «Giá 6,97 tỷ → 6,8 tỷ»), Khách phản ứng ([Mẫu] Khách chấm, «1 mở · quan tâm: Toà A · A-10.05»); bên dưới còn tin cũ từ các lần chạy trước (tổng 13, không đúng 3).
    step2: chạm tin Khách phản ứng → URL /shares?lan=19cd4756-… (đúng Lần gửi vừa tạo); ngăn chi tiết «[Mẫu] Khách chấm»: A-04.06 8,06 tỷ 0 quan tâm; A-10.05 6,8 tỷ 1 quan tâm, huy hiệu «Vừa đổi giá: 6,97 tỷ → 6,8 tỷ»; «Gợi ý căn thay A-08.05 7 tỷ · Gửi căn này»; «Tắt link».
    step3: chạm tin Căn mới → /shares/new?can=644c2a57-…; màn «Gửi căn» với đúng 1 căn Toà A · A-08.05, 7 tỷ, 96,8 m² · 3 PN đã chọn sẵn. step4: tài khoản Đầu khách trống: «Chưa có gì mới trong 7 ngày», mô tả và nút «Gửi căn».
    step5: /shares?lan=00000000-…: ngăn «Link đã gửi» hiện «Chưa tải được — thử lại» và nút «Thử lại» (DOM xác nhận; nút trong ảnh bị huy hiệu N của Next dev che một phần, không trống). scrollWidth = clientWidth = 375 ở step1-5, không cuộn ngang. Khớp Expected.
  network_observed: clean

### Eval mang từ round trước (carry-forward)

- eval: E1b
  run_id: minted-hom-nay-dau-khach-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-hom-nay-dau-khach-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T16:22:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-hom-nay-dau-khach-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-hom-nay-dau-khach-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-hom-nay-dau-khach-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-hom-nay-dau-khach-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T16:22:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-hom-nay-dau-khach-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T16:22:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-dau-khach-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-04T16:34:09Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-dau-khach-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T16:34:09Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-dau-khach-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T16:34:09Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-dau-khach-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T16:34:09Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-dau-khach-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T16:34:09Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-dau-khach-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T16:34:09Z

- cmd: npm run lint
  run_id: minted-hom-nay-dau-khach-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-04T16:34:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: moi eval của hợp đồng mang baseline n-a ở round này (evals.yaml không đổi từ lần đo baseline cuối, round 1), nên không có eval nào được kết luận là không-phân-biệt ở round này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6b failed — một mục trong hợp đồng chưa đạt ở lượt chấm đầu. Returned to implementation.
Round 2: toàn bộ eval đạt (E6b chạy lại, các eval còn lại mang từ round 1 hoặc chạy lại), verdict PASS.
