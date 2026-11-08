---
schema_version: 2
feature_slug: va-ho-so-lan-rao-hang-lo-ngoai-khu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 78460c16e77bc84cebf04848dc1c96340dd383f0
human_signoff: Manh Phan 2026-11-09
---

# Evidence Report: va-ho-so-lan-rao-hang-lo-ngoai-khu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T16:52:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4031.822375

- eval: E2
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T16:52:26Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4031.822375

- eval: E3
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T16:52:26Z
  screenshot: evidence/E3-lo.png
  observed: |
    E3-lo.png: bảng hàng bên trái, panel hồ sơ bên phải vẫn mở; mục «Các lần rao» có «Lần 1 · Chưa đủ để rao», «Lần rao đang mở» hiện, không có lời báo không thấy căn. E3-ngoai-khu.png: panel hồ sơ vẫn mở, Loại hình Đất, «Các lần rao» có Lần 1; không có lời báo không thấy căn. Riêng mục Lịch sử hiện «Không tải được lịch sử» + nút «Thử lại» (lỗi khác, ngoài expected).
  network_observed: n-a (driver)
  output: |
    dung.mjs và chay-ui.mjs chạy xong, dòng e3 khớp expected cho cả hai dạng (lô, ngoài khu).
    Tiêu đề trước và sau khi bấm giống nhau; địa chỉ sau bấm là ?hang=<mã hàng>, không có unit=.
    Khung lưu: evidence/E3-lo.png, evidence/E3-ngoai-khu.png.

- eval: E4
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-08T16:52:26Z
  output: |
    npm run typecheck
    kiểm kiểu mọi gói xanh

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-08T16:52:26Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T16:52:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T16:52:26Z

- cmd: npm run test:hooks
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T16:52:26Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-08T16:52:26Z

- cmd: npm run lint
  run_id: minted-va-ho-so-lan-rao-hang-lo-ngoai-khu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-08T16:52:26Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline), chỉ chứng minh bộ đo, chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/web — E1, E2
- npm run typecheck — E4

Baseline không đo: E3 (ui-check chạy bằng script dựng máy dev riêng, không chạy được trên baseline) và các lệnh suite không gắn eval (baseline n-a).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4 đều đạt; verdict PASS.

### Re-pin lần 1 — 2026-11-08, do gộp main sau chữ ký
run_id: repin-20261108T222753Z-26742
sha: 1c0ded404e4901365f5d32dee31e902494b91b5b · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · ngoài làn máy: E3 (E3 không khai paths) · AC không có chốt máy: AC-3 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

### Re-pin lần 2 — 2026-11-08, do gộp main sau #214
run_id: repin-20261108T225835Z-59993
sha: 78460c16e77bc84cebf04848dc1c96340dd383f0 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng · ngoài làn máy: E3 (E3 không khai paths) · AC không có chốt máy: AC-3 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
