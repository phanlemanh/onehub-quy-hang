---
schema_version: 2
feature_slug: man-mau-bao-mau-hong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 79d3b28926aebf2fa549f77c7f1524fa9aaa0102
human_signoff:
---

# Evidence Report: man-mau-bao-mau-hong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E5c | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | script | PASS |
| E7 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-man-mau-bao-mau-hong-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5100.730042

- eval: E2
  run_id: minted-man-mau-bao-mau-hong-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5100.730042

- eval: E3
  run_id: minted-man-mau-bao-mau-hong-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5100.730042

- eval: E4
  run_id: minted-man-mau-bao-mau-hong-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5100.730042

- eval: E5
  run_id: minted-man-mau-bao-mau-hong-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 137038.217916

- eval: E5b
  run_id: minted-man-mau-bao-mau-hong-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5100.730042

- eval: E5c
  run_id: minted-man-mau-bao-mau-hong-E5c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 137038.217916

- eval: E6
  run_id: minted-man-mau-bao-mau-hong-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 1941.16075

- eval: E6b
  run_id: minted-man-mau-bao-mau-hong-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T21:41:28Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 5100.730042

- eval: E6c
  run_id: minted-man-mau-bao-mau-hong-E6c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T21:41:28Z
  output: |
    design-floor-khuon --kiem --root .
    6 tệp giao diện ngoài bản đồ

- eval: E7
  run_id: minted-man-mau-bao-mau-hong-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T21:41:28Z
  screenshot: evidence/E7-step1.png
  observed: |
    Đã mở và đọc cả 5 frame. Step1 (tab Mẫu bảng hàng): khối báo «Mẫu đã lưu có 2 chỗ không đọc được» ở đầu tab, hai dòng (dòng 1 nêu tên «[tên] gửi đội» trùng; dòng 2 nêu «bỏ cột Người giữ»), câu «Lần lưu kế sẽ bỏ hẳn những chỗ này; các mẫu khác giữ nguyên.»; bảng có đúng 2 mẫu ([Tên] gửi đội 3 cột, [Tên] gửi khách 1 cột). Step2 (tab Mẫu bài): khối báo «1 chỗ», câu «Mẫu bài của một kênh không dùng được bị bỏ.» (câu chung kênh lạ); khối Zalo còn lời đã lưu «Chào nhóm [Tên sàn]» và «Gọi em 0900 000 001». Step3: sau Sửa mẫu đầu + Lưu, khối báo mất, chỉ còn thông báo «Đã lưu mẫu», bảng vẫn 2 mẫu cùng tên. Step4: sau sửa lời Zalo thành «Chào nhóm [Tên sàn] hôm nay» + Lưu, khung hiện «Đã lưu mẫu», khối báo của tab mất (DOM xác nhận); ảnh bị cuộn xuống phần xem trước nên không thấy đầu tab, bằng chứng khối báo mất nằm ở DOM; Facebook không bị đổi (vốn trống từ đầu, nên «còn nguyên» khớp mà không phải là kiểm giữ lời có sẵn). Step5 (375x812, nạp lại mẫu hỏng): khối báo nằm gọn trong khung (trái 21, phải 354 trên 375), chữ xuống dòng, không thanh cuộn ngang, scrollWidth=clientWidth=375. Khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-07T21:41:28Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T21:41:28Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T21:41:28Z

- cmd: npm run test:hooks
  run_id: minted-man-mau-bao-mau-hong-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T21:41:28Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-man-mau-bao-mau-hong-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T21:41:28Z

- cmd: npm run typecheck
  run_id: minted-man-mau-bao-mau-hong-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T21:41:28Z

- cmd: npm run lint
  run_id: minted-man-mau-bao-mau-hong-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T21:41:28Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline; chứng minh harness hơn là tính năng — cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/web: E1, E2, E3, E4, E5b, E6b
- npm run db:migrate && npm run db:test: E5, E5c
- npm run test:ro-ri: E6
- design-floor-khuon --kiem --root .: E6c

Judge panels: không có eval judgment nào trong vòng này, không có panel để đề xuất.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đều đạt; không có eval nào hỏng.
