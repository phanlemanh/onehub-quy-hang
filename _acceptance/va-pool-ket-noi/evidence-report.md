---
schema_version: 2
feature_slug: va-pool-ket-noi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3a93b8c2940a9e639062a06de979de69cdf6526b
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: va-pool-ket-noi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline — chứng minh harness chứ chưa chứng minh feature; cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- E1, E2 (npm test -w @quy-hang/web)
- E4, E10 (bộ kiểm thu/*.test.mjs của hồ sơ)
- E5 (typecheck)
- E6 (lint)
- E8 (design-floor-s4)
- E9 (design-floor-khuon)

Baseline không đo: E3 (ui-check, không chạy được trên cây baseline). E7 đỏ trên baseline (có phân biệt).

## Variance

none — every multi-run eval is uniform

## Evidence

- eval: E1
  run_id: minted-va-pool-ket-noi-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:04:38Z
  output: |
    ℹ duration_ms 3111.591041

- eval: E2
  run_id: minted-va-pool-ket-noi-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:04:38Z
  output: |
    ℹ duration_ms 3111.591041

- eval: E3
  run_id: minted-va-pool-ket-noi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:04:38Z
  screenshot: evidence/E3-login.png
  observed: |
    E3-login.png (đã Read): trang "Đăng nhập Quỹ hàng" tối màu, ô Email, nút "Gửi mã", "Dùng mật khẩu" - không phải trang lỗi, khớp Expected. E3-goc.png (đã Read): khung lỗi "Không mở được trang này / Lần tải vừa rồi lỗi. Thử lại sau ít phút." kèm nút "Thử lại", không có ô đăng nhập, khớp Expected (cùng nhìn với E3-today/inventory/chon-san, cùng kích thước tệp và text DOM đã xác nhận theo từng đường). E3-hoi-phuc.png (đã Read): màn Hôm nay đầy đủ, header "[Mẫu] Sàn thử", cột "HÔM NAY" (Lead mới, Nên gọi điều chỉnh giá...), vùng "Hôm nay 0 việc", không còn chữ lỗi, khớp Expected.
  network_observed: clean

- eval: E4
  run_id: minted-va-pool-ket-noi-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_ket_noi
  verified_at: 2026-11-06T03:04:38Z
  output: |
    ℹ duration_ms 86.205083

- eval: E5
  run_id: minted-va-pool-ket-noi-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-06T03:04:38Z
  output: |
    typecheck hoàn tất trên mọi gói

- eval: E6
  run_id: minted-va-pool-ket-noi-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-06T03:04:38Z
  output: |
    chuẩn giao diện: đạt

- eval: E7
  run_id: minted-va-pool-ket-noi-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.build
  verified_at: 2026-11-06T03:04:38Z
  output: |
    next build hoàn tất

- eval: E8
  run_id: minted-va-pool-ket-noi-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-06T03:04:38Z
  output: |
    design-floor-s4 hoàn tất

- eval: E9
  run_id: minted-va-pool-ket-noi-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T03:04:38Z
  output: |
    2 tệp giao diện ngoài bản đồ

- eval: E10
  run_id: minted-va-pool-ket-noi-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_ket_noi
  verified_at: 2026-11-06T03:04:38Z
  output: |
    ℹ duration_ms 86.205083

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-06T03:04:38Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T03:04:38Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T03:04:38Z

- cmd: npm run test:hooks
  run_id: minted-va-pool-ket-noi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T03:04:38Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T03:04:38Z

## Known limits

## Ngoài hợp đồng

## Iterations

Round 1: chi tiết không được truyền xuống vòng này; xem run-log.jsonl và lịch sử commit (S4-r1, S4-r2).
Round 2: E1 đến E10 đều đạt, không eval đỏ; chỗ thử sự cố E3 dùng phiên mã cố định nên không phụ thuộc cookie cũ.

### Re-pin lần 1 — 2026-11-06, do gộp main sau chữ ký (PR #156 vào main)
run_id: repin-20261106T043100Z-65912
sha: 3a93b8c2940a9e639062a06de979de69cdf6526b · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E3 · AC không có chốt máy: AC-3
