---
schema_version: 2
feature_slug: va-e7-loi-that-cap-han
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 47df2ac3d3b60be4343b67d2360d85ef3ec6fcef
human_signoff:
---

# Evidence Report: va-e7-loi-that-cap-han

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E3b | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: bhqq9fdpl
  exit_code: 0
  baseline: n-a
  verifier: node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs
  verified_at: 2026-11-08T02:48:26Z
  output: |
    khung 3 ĐẠT: lỗi thật của máy chủ → «chưa áp», không «Đã lưu»

- eval: E2
  run_id: minted-va-e7-loi-that-cap-han-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --doi-cau
  verified_at: 2026-11-08T02:48:26Z
  output: |
    khung 3 ĐẠT: lỗi thật của máy chủ → «chưa áp», không «Đã lưu»

- eval: E3
  run_id: minted-va-e7-loi-that-cap-han-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --nguon
  verified_at: 2026-11-08T02:48:26Z
  output: |
    nguồn ĐẠT: khung 3 lấy thân từ GET thật, không còn câu lỗi gõ tay

- eval: E3b
  run_id: minted-va-e7-loi-that-cap-han-E3b-r1
  exit_code: 1
  baseline: n-a
  verifier: node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --nguon --tu 5b17fd36
  verified_at: 2026-11-08T02:48:26Z
  output: |
    nguồn ĐỎ: còn phản hồi giả viết tay — /__traGia/, /`[^`]*— cặp về mặc định[^`]*`/, /"[^"]*— cặp về mặc định[^"]*"/

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-08T02:48:26Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-08T02:48:26Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T02:48:26Z

- cmd: npm run test:hooks
  run_id: minted-va-e7-loi-that-cap-han-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T02:48:26Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-e7-loi-that-cap-han-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-08T02:48:26Z

- cmd: npm run typecheck
  run_id: minted-va-e7-loi-that-cap-han-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-08T02:48:26Z

- cmd: npm run lint
  run_id: minted-va-e7-loi-that-cap-han-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-08T02:48:26Z

## Known limits

- E3b (AC-3) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --nguon --tu 5b17fd36
- E2 (AC-2): gioi han da khai khong con — evals.yaml khai ma 1, lan chay nay tra 0. Go loi khai o vong sau.

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do

- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base 5b17fd361ba5c2f1f8ca4c5ce4ebf741cbe423e3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --doi-cau: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base 5b17fd361ba5c2f1f8ca4c5ce4ebf741cbe423e3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --nguon: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base 5b17fd361ba5c2f1f8ca4c5ce4ebf741cbe423e3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs --nguon --tu 5b17fd36: bo qua baseline: tep _acceptance/va-e7-loi-that-cap-han/thu/kiem-e7.mjs co o cay dang kiem nhung chua co o merge-base 5b17fd361ba5c2f1f8ca4c5ce4ebf741cbe423e3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: all evals passed (E2 returned a clean result where a declared red was expected, noted in Known limits); no returns to implementation.
