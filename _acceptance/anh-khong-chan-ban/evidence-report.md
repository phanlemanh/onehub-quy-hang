---
schema_version: 2
feature_slug: anh-khong-chan-ban
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6d2ec74effa4d535caca4cc61660ba2ebbb92080
human_signoff:
---

# Evidence Report: anh-khong-chan-ban

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | script | PASS |
| E9c | AC-9 | test | PASS |
| E10 | AC-5 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-anh-khong-chan-ban-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 17923.026084

- eval: E5b
  run_id: minted-anh-khong-chan-ban-E5b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 17923.026084

- eval: E6
  run_id: minted-anh-khong-chan-ban-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 17923.026084

- eval: E2
  run_id: minted-anh-khong-chan-ban-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    ℹ duration_ms 129215.383459

- eval: E4
  run_id: minted-anh-khong-chan-ban-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    ℹ duration_ms 129215.383459

- eval: E8
  run_id: minted-anh-khong-chan-ban-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    ℹ duration_ms 129215.383459

- eval: E9c
  run_id: minted-anh-khong-chan-ban-E9c-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.nhap_tac_tu
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm run db:migrate && npm run db:test (Postgres dãy G, cổng 5573)
    ℹ duration_ms 129215.383459

- eval: E3
  run_id: minted-anh-khong-chan-ban-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 16969.101667

- eval: E6c
  run_id: minted-anh-khong-chan-ban-E6c-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 16969.101667

- eval: E5
  run_id: minted-anh-khong-chan-ban-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6363.137125

- eval: E6b
  run_id: minted-anh-khong-chan-ban-E6b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6363.137125

- eval: E7
  run_id: minted-anh-khong-chan-ban-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6363.137125

- eval: E9
  run_id: minted-anh-khong-chan-ban-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6363.137125

- eval: E9b
  run_id: minted-anh-khong-chan-ban-E9b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T02:24:54Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 1615.311458

- eval: E10
  run_id: minted-anh-khong-chan-ban-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T02:24:54Z
  output: |
    node design-floor-khuon.mjs --kiem --root .
    16 tệp giao diện ngoài bản đồ

- eval: E8b
  run_id: minted-anh-khong-chan-ban-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T02:24:54Z
  screenshot: evidence/E8b-cai-dat-1440.png
  observed: |
    Đã mở và đọc cả mười hai ảnh (E8b-*.png, sáu khung ở 1440 và sáu khung ở 375).
    1440: cai-dat — Cài đặt sàn › Trạng thái, khối "Lên Đang bán", ô «Số ảnh thật tối thiểu để căn vào Đang bán» hiện 0 với câu nghĩa "0 — căn lên Đang bán khi chưa có ảnh; ảnh hiện là việc cần bổ sung. Đặt 1–20 thì căn phải đủ số ảnh thật mới lên."
    1440: cai-dat-21 — ô hiện 21, khung lỗi đỏ "Cần số nguyên 0–20". cai-dat-dau-chu — Đầu chủ bị đưa sang /settings/personal, mục "Cá nhân", khối "Mục này chỉ quản trị sàn mở được", thanh bên không có "Trạng thái", không có ô số ảnh.
    1440: hom-nay — nhóm "Bổ sung ảnh" có 1 căn T-… (Toà thử ảnh), giá 3,20 tỷ, nút "Đổi giá, trạng thái · Mở hồ sơ". ho-so — trạng thái "Đang bán", "Mức đủ thông tin · thiếu Ảnh thật 5/6", mục Ảnh "Gửi được (0)" và "Chưa có ảnh gửi được". bang-hang — cột "Mức đủ" hiện "5/6 · thiếu ảnh thật", Đầu chủ "[Mẫu] Đầu chủ 1".
    375: cai-dat ô hiện 0 cùng câu nghĩa, xếp dọc không tràn ngang; cai-dat-21 ô 21 kèm lỗi "Cần số nguyên 0–20"; cai-dat-dau-chu màn Tôi › Cá nhân không có mục Trạng thái; hom-nay nhóm "Bổ sung ảnh" 1 căn T-96285… có nút "Đổi giá, trạng thái · Mở hồ sơ"; ho-so "thiếu Ảnh thật 5/6", mục Ảnh "Gửi được (0)"; bang-hang thẻ căn T-96285.01, ô ảnh trống bằng icon ảnh, giá 3,2 tỷ. Thẻ điện thoại không có cột/nhãn Mức đủ nên "Mức đủ 5/6 ở Bảng hàng" chỉ thấy ở 1440.
    Đối chiếu Expected: khớp ở cả hai khổ.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-anh-khong-chan-ban-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T02:24:54Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-anh-khong-chan-ban-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T02:24:54Z

- cmd: npm run test:hooks
  run_id: minted-anh-khong-chan-ban-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T02:24:54Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-anh-khong-chan-ban-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T02:24:54Z

- cmd: npm run typecheck
  run_id: minted-anh-khong-chan-ban-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T02:24:54Z

- cmd: npm run lint
  run_id: minted-anh-khong-chan-ban-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T02:24:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: E8b (ui-check, không chạy được trên code cũ) và sáu lệnh suite (hồi quy, không gắn eval).

Eval không phân biệt (xanh ở cả HEAD lẫn baseline, chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E1, E5b, E6
- npm run test:ro-ri: E9b
- design-floor-khuon --kiem: E10

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không có chi tiết trong dữ liệu truyền xuống cho vòng này; lịch sử vòng cũ do vòng trước giữ.
Round 2: toàn bộ 16 eval và 6 lệnh suite xanh; verdict PASS, không còn eval hỏng.
