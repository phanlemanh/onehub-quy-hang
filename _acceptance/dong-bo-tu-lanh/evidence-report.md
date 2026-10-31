---
schema_version: 2
feature_slug: dong-bo-tu-lanh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 30bb72c307bfa40fd88e111982b80b9504a4920a
human_signoff:
---

# Evidence Report: dong-bo-tu-lanh

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
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-dong-bo-tu-lanh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E2
  run_id: minted-dong-bo-tu-lanh-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E3
  run_id: minted-dong-bo-tu-lanh-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E4
  run_id: minted-dong-bo-tu-lanh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E5
  run_id: minted-dong-bo-tu-lanh-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E6
  run_id: minted-dong-bo-tu-lanh-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E7
  run_id: minted-dong-bo-tu-lanh-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E8
  run_id: minted-dong-bo-tu-lanh-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 127.179459

- eval: E7b
  run_id: minted-dong-bo-tu-lanh-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1575.401041

- eval: E9
  run_id: minted-dong-bo-tu-lanh-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T14:23:15Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1575.401041

- eval: E9b
  run_id: E9b-20261031
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T14:23:15Z
  screenshot: evidence/E9b-may-chu.png
  observed: |
    Đã mở bằng Read: E9b-may-chu.png (1440x900) thanh trên có chỉ báo «Máy chủ trục trặc · 1 thay đổi chờ gửi lại», giá A-102 3.503.000.000, không có bảng Cần xem. E9b-het-phien.png: chỉ báo «Hết phiên · đăng nhập lại để gửi 1 thay đổi» kèm biểu tượng đăng nhập, giá 3.504.000.000. E9b-dang-nhap-lai.png: «Đã đồng bộ · 21:27», giá A-102 3.504.000.000, nút +Lead hiện lại. E9b-kho.png: chỉ báo đỏ «Lỗi kho trên máy · thay đổi chưa lưu được», dòng A-101 báo {"kind":"kho"}, giá chưa đổi. E9b-375-het-phien.png (375): chỉ báo chỉ là biểu tượng đăng nhập kèm «1» cạnh chuông, giá 3.510.000.000. E9b-sua-them.png (375): bảng «Căn cần xem» có A-103, «Bản mới: giá 3.520 triệu · trạng thái Active — Trưởng nhóm sửa lúc 21:30», «Của tôi: giá 3.530 triệu», «Sửa thêm sau đó: giá 3.540 triệu — gửi sau khi bạn chọn», hai nút «Giữ của tôi», «Lấy bản mới». Các frame 375 khác (mất mạng, máy chủ, bị từ chối, lỗi kho) đã lưu và đối chiếu bằng aria-label/lớp svg trích từ DOM, chưa mở từng ảnh. Tất cả khớp Expected.
  network_observed: clean
  # Đối chứng: chỉ báo trước và sau mỗi bước đều khác nhau (đã đồng bộ → trạng thái lỗi → đã đồng bộ). Các lỗi mạng trong E9b-network.txt đều do chính các bước eval tạo ra; nhật ký máy chủ dev không có lỗi máy chủ thật; chỉ ghi chú favicon tĩnh. Frame đã lưu trong _acceptance/dong-bo-tu-lanh/evidence/: E9b-may-chu.png, E9b-step1.png, E9b-het-phien.png, E9b-dang-nhap-lai.png, E9b-kho.png, E9b-375-mat-mang.png, E9b-375-may-chu.png, E9b-375-bi-tu-choi.png, E9b-375-loi-kho.png, E9b-375-het-phien.png, E9b-sua-them.png, E9b-step5-sau.png, E9b-step2..5.png (bản sao), E9b-network.txt.

- eval: E10
  run_id: minted-dong-bo-tu-lanh-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-31T14:23:15Z
  output: |
    design-floor-s4: sàn M1 đạt trên apps/web/src/components/sync/*.tsx

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-dong-bo-tu-lanh-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T14:23:15Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-dong-bo-tu-lanh-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T14:23:15Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-dong-bo-tu-lanh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T14:23:15Z

- cmd: npm run test:hooks
  run_id: minted-dong-bo-tu-lanh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T14:23:15Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-dong-bo-tu-lanh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T14:23:15Z

- cmd: npm run typecheck
  run_id: minted-dong-bo-tu-lanh-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T14:23:15Z

- cmd: npm run lint
  run_id: minted-dong-bo-tu-lanh-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T14:23:15Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: E9b (n-a, eval giao diện không chạy trên mã cũ).

Eval không phân biệt (xanh trên cả mã hiện tại lẫn mã cũ; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E5, E6, E7, E8
- npm run test:db -w @quy-hang/web: E7b, E9
- design-floor-s4 (sàn M1): E10

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval PASS; không có eval hỏng. Không có hội đồng chấm (judge) nào cho hợp đồng này.
