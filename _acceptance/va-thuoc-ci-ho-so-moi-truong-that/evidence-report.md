---
schema_version: 2
feature_slug: va-thuoc-ci-ho-so-moi-truong-that
verdict: REJECT
failed_evals: ["E4"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a7786d607bb3ac60afcdd943638163bb0e95f29f
human_signoff:
---

# Evidence Report: va-thuoc-ci-ho-so-moi-truong-that

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | REJECT |

Lệnh không gắn eval và đỏ: `node _acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs --luoi` (thuộc E4) và `npm run lint` (suite hồi quy, đỏ vì một lỗi eslint `no-regex-spaces` ở `_acceptance/moi-truong-that/thu/kiem-ci.mjs` dòng 45).

## Evidence

- eval: E1
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kiem_ci
  verified_at: 2026-11-07T07:50:05Z
  output: |
    KẾT: ĐẠT

- eval: E2
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.kiem_ci
  verified_at: 2026-11-07T07:50:05Z
  output: |
    KẾT: ĐẠT

- eval: E3
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs
  verified_at: 2026-11-07T07:50:05Z
  output: |
    KẾT: ĐẠT

- eval: E4
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-E4-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs
  verified_at: 2026-11-07T07:50:05Z
  output: |
    HỎNG lưới trước gộp moi-truong-that: chạy thật, 0 VIOLATION — VIOLATION [moi-truong-that]: chưa qua phản biện context sạch (gap-probe) — không có gap-probe.md hợp lệ và ledger không có entry descope.
    HỎNG lưới trước gộp bat-rang-buoc-ban-ma: chạy thật, 0 VIOLATION — VIOLATION [bat-rang-buoc-ban-ma]: evidence is stale — code changed after verify (verified_commit 1c746689b504967738cbd009561b3f67797cc3ae); re-run verify
    ĐẠT lưới trước gộp va-deploy-csdl-tam: chạy thật, 0 VIOLATION
    ĐẠT lưới trước gộp kiem-nhanh-rang-buoc-ban-ma: chạy thật, 0 VIOLATION
    KẾT: HỎNG 2

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-07T07:50:05Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T07:50:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T07:50:05Z

- cmd: npm run test:hooks
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T07:50:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T07:50:05Z

- cmd: npm run typecheck
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T07:50:05Z

- cmd: npm run lint
  run_id: minted-va-thuoc-ci-ho-so-moi-truong-that-SUITE-lint-r1
  exit_code: 1
  verified_at: 2026-11-07T07:50:05Z
  output: |
    eslint báo 1 lỗi (no-regex-spaces tại _acceptance/moi-truong-that/thu/kiem-ci.mjs dòng 45) và 3 cảnh báo; lint đỏ.

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt) hoặc không đo được baseline (xem dưới)

Baseline khong do
- node _acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs: bo qua baseline: tep _acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs co o cay dang kiem nhung chua co o merge-base e85dd84c6eef25ab8677fecc8992d838981aa308 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs --luoi: bo qua baseline: tep _acceptance/va-thuoc-ci-ho-so-moi-truong-that/thu/kiem-thay.mjs co o cay dang kiem nhung chua co o merge-base e85dd84c6eef25ab8677fecc8992d838981aa308 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (không eval nào chạy nhiều lần)

## Iterations

Round 1: E4 failed — lưới trước gộp đỏ ở moi-truong-that (thiếu phản biện context sạch gap-probe) và bat-rang-buoc-ban-ma (bằng chứng cũ, mã đổi sau lần verify trước). Returned to implementation.
