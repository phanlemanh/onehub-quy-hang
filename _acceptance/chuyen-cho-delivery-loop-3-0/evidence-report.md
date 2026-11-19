---
schema_version: 2
feature_slug: chuyen-cho-delivery-loop-3-0
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1a4874fcd018357277bea60375f5a10efd6cef44
human_signoff:
---

# Evidence Report: chuyen-cho-delivery-loop-3-0

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1c | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E6b | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chuyen-cho-delivery-loop-3-0-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E1c
  run_id: minted-chuyen-cho-delivery-loop-3-0-E1c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cc30_duong
  verified_at: 2026-11-19T15:40:11Z
  output: |
    duong-kit: 14 tên lệnh mới của bảng có trên cây kit v3.0.0, 0 tên cũ còn

- eval: E2
  run_id: minted-chuyen-cho-delivery-loop-3-0-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E3
  run_id: minted-chuyen-cho-delivery-loop-3-0-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E4
  run_id: minted-chuyen-cho-delivery-loop-3-0-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E5
  run_id: minted-chuyen-cho-delivery-loop-3-0-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E6
  run_id: minted-chuyen-cho-delivery-loop-3-0-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cc30_doi_chung
  verified_at: 2026-11-19T15:40:11Z
  output: |
    doi-chung: HEAD 1a4874fc --recheck-all kit v3.0.0 — 172 hồ sơ OK (đủ 172 của nền), VIOLATION ngoài vòng 0, của vòng 1

- eval: E6b
  run_id: minted-chuyen-cho-delivery-loop-3-0-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E7
  run_id: minted-chuyen-cho-delivery-loop-3-0-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E8
  run_id: minted-chuyen-cho-delivery-loop-3-0-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.cc30_thu
  verified_at: 2026-11-19T15:40:11Z
  output: |
    node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs" xanh
    duration_ms 1149.914292

- eval: E8b
  run_id: minted-chuyen-cho-delivery-loop-3-0-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.product_map_kit
  verified_at: 2026-11-19T15:40:11Z
  output: |
    product-map.mjs --root . --check xanh (PRODUCT-MAP.md và LO-TRINH.html khớp)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-chuyen-cho-delivery-loop-3-0-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-19T15:40:11Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-chuyen-cho-delivery-loop-3-0-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-19T15:40:11Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chuyen-cho-delivery-loop-3-0-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-19T15:40:11Z

- cmd: npm run test:hooks
  run_id: minted-chuyen-cho-delivery-loop-3-0-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-19T15:40:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chuyen-cho-delivery-loop-3-0-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-19T15:40:11Z

- cmd: npm run typecheck
  run_id: minted-chuyen-cho-delivery-loop-3-0-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-19T15:40:11Z

- cmd: npm run lint
  run_id: minted-chuyen-cho-delivery-loop-3-0-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-19T15:40:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline; chứng minh harness, cần xác nhận là regression-guard có chủ ý hoặc viết lại để assert hành vi mới):
- E1, E2, E3, E4, E5, E6b, E7, E8 (lệnh `node --test "_acceptance/chuyen-cho-delivery-loop-3-0/thu/*.test.mjs"`)
- E8b (lệnh product-map.mjs --check)

Baseline không đo:
- node _acceptance/chuyen-cho-delivery-loop-3-0/rang/doi-chung.mjs --duong: bỏ qua baseline: tệp _acceptance/chuyen-cho-delivery-loop-3-0/rang/doi-chung.mjs có ở cây đang kiểm nhưng chưa có ở merge-base f1d123ee88029c343bd077e4b2678c7375848fbc — eval mới, chạy trên code cũ không phân biệt gì
- node _acceptance/chuyen-cho-delivery-loop-3-0/rang/doi-chung.mjs: bỏ qua baseline: tệp _acceptance/chuyen-cho-delivery-loop-3-0/rang/doi-chung.mjs có ở cây đang kiểm nhưng chưa có ở merge-base f1d123ee88029c343bd077e4b2678c7375848fbc — eval mới, chạy trên code cũ không phân biệt gì

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval và lệnh suite xanh; không có mục cần người chấm.
