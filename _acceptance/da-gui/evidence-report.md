---
schema_version: 2
feature_slug: da-gui
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6ce33622b681bd01602556dbef61286b1e47da33
human_signoff:
---

# Evidence Report: da-gui

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-da-gui-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74062.297375

- eval: E2
  run_id: minted-da-gui-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74062.297375

- eval: E3
  run_id: minted-da-gui-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74062.297375

- eval: E3b
  run_id: minted-da-gui-E3b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1971.096209

- eval: E4
  run_id: minted-da-gui-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 640.420958

- eval: E4b
  run_id: minted-da-gui-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74062.297375

- eval: E5
  run_id: minted-da-gui-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74062.297375

- eval: E5b
  run_id: minted-da-gui-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1971.096209

- eval: E6
  run_id: minted-da-gui-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1971.096209

- eval: E6b
  run_id: minted-da-gui-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:01:25Z
  screenshot: evidence/E6b-step1.png
  observed: |
    step1 (375x812, /shares): lưới thẻ link, mỗi thẻ có bìa ghép ảnh căn, người nhận «[Mẫu] Khách chấm» với «3 căn · 19:05 04-11», «1 mở», «1 quan tâm», «Mở gần nhất 19:05 04-11»; thẻ khác «Chưa mở» khi 0 mở. Khớp Expected. step2 (bottom sheet «[Mẫu] Khách chấm»): A-04.06 8,06 tỷ 0 quan tâm; A-08.03 4,8 tỷ 0 quan tâm, chip «Vừa đổi giá: 4,95 tỷ → 4,8 tỷ», nhóm «Gợi ý căn thay» với B-14.04 4,61 tỷ và B-14.05 4,36 tỷ kèm «Gửi căn này»; A-06.03 5,55 tỷ 1 quan tâm; nút «Tắt link» ở đáy. Khớp. step2b: màn «Gửi căn» /shares/new?can=<id> với đúng một căn B-14.04 đã chọn (4,61 tỷ); goBack về chi tiết vẫn có «Tắt link». Khớp. step3: sau xác nhận «Tắt link này?» → thẻ đầu có nhãn «Đã tắt» (huy hiệu trên bìa, mờ sau sheet) và dòng «Đã tắt — khách mở link sẽ thấy «Link không còn mở được»». Khớp. step4 (cửa sổ ẩn danh): chỉ có dòng «Link không còn mở được — hỏi lại người gửi». Khớp.
  network_observed: clean
  output: |
    Dãy Postgres L cổng 5571; dev server cổng 3462 đã tắt sau chạy. Gửi link ba căn qua /shares/new, trang khách mở link và quan tâm một căn. Các bước 1-4 đạt; trang khách báo «Link không còn mở được — hỏi lại người gửi».
    Lưu ý chuẩn bị (không sửa code): thêm một sự kiện đổi giá 4,95 → 4,8 tỷ sau lúc gửi bằng vai chủ, và chèn fixture catalog_units 2PN vì dãy L có danh mục rỗng nên «Gợi ý căn thay» không có ứng viên. Người ký cần biết hai điều kiện này.
    Frames: E6b-step1.png, E6b-step2.png, E6b-step2b.png, E6b-step3.png, E6b-step4.png; mạng: E6b-network.txt trong _acceptance/da-gui/evidence/.

- eval: E7
  run_id: minted-da-gui-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74062.297375

- eval: E8
  run_id: minted-da-gui-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1971.096209

- eval: E9
  run_id: minted-da-gui-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1971.096209

- eval: E9b
  run_id: minted-da-gui-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74062.297375

- eval: E10
  run_id: minted-da-gui-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 739.439625

- eval: E10b
  run_id: minted-da-gui-E10b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T12:01:25Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 23417.137667

- eval: E11
  run_id: minted-da-gui-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T12:01:25Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    12 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-da-gui-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T12:01:25Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-da-gui-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T12:01:25Z

- cmd: npm run test:hooks
  run_id: minted-da-gui-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T12:01:25Z

- cmd: npm run typecheck
  run_id: minted-da-gui-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T12:01:25Z

- cmd: npm run lint
  run_id: minted-da-gui-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T12:01:25Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline diffBase; chứng minh harness chứ chưa chứng minh feature, nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm run db:migrate && npm run db:test`: E1, E2, E3, E4b, E5, E7, E9b
- `npm test -w @quy-hang/web`: E3b, E5b, E6, E8, E9
- `npm test -w @quy-hang/core`: E4
- `npm run test:ro-ri`: E10
- `npm test -w @quy-hang/ui-lint`: E10b
- bước chấm khuôn design-floor-khuon: E11

Baseline không đo: E6b (ui-check, không chạy được trên baseline) và năm lệnh suite không gắn eval.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval đạt (17/17), không có eval hỏng; không có mục phán đoán chờ người. Hai điều kiện chuẩn bị của E6b (sự kiện đổi giá và fixture danh mục) ghi ở khối E6b.
