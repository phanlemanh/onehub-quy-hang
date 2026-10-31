---
schema_version: 2
feature_slug: ma-hoa-so-chu
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 274b6a13bca93939e2dde1086d0c3473db64eb7a
human_signoff:
---

# Evidence Report: ma-hoa-so-chu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | judgment | PENDING-JUDGMENT (hội đồng đề xuất PASS, chờ người chốt) |

## Evidence

- eval: E1
  run_id: minted-ma-hoa-so-chu-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60652.95875

- eval: E2
  run_id: minted-ma-hoa-so-chu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60652.95875

- eval: E3
  run_id: minted-ma-hoa-so-chu-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60652.95875

- eval: E4
  run_id: minted-ma-hoa-so-chu-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 60652.95875

- eval: E5
  run_id: minted-ma-hoa-so-chu-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2620.16725

- eval: E6
  run_id: minted-ma-hoa-so-chu-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2620.16725

- eval: E7
  run_id: minted-ma-hoa-so-chu-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2620.16725

- eval: E8
  run_id: minted-ma-hoa-so-chu-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2620.16725

- eval: E9
  run_id: minted-ma-hoa-so-chu-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:03:29Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 2620.16725

### Judgment

- eval: E10
  judged_by: judge-subagent (fresh context)
  proposal: PASS
  panel_votes:
    - domain-correctness: PASS — ADR-0013 đủ năm ý: lệnh `openssl rand -base64 32` không kèm giá trị khoá; khoá đặt ở Vercel Production (Preview không nhận, theo Hỏi-1) và cất một bản ở trình quản lý mật khẩu; mất khoá là mất mọi số chủ; đếm dòng rồi chạy `ma-hoa-lai.ts` rồi đếm lại; xoá cột `owner_phone` là migration của hàng sau. `.env.example` có dòng `OWNER_PHONE_KEY=` rỗng ở dòng 17, và §12 của tham-chieu.md có dòng 31/10 về số chủ đã mã hoá, trỏ ADR-0013.
    - operational-feasibility: PASS — ADR-0013 có đủ năm ý. (1) Lệnh `openssl rand -base64 32`, không có giá trị khoá. (2) Đặt khoá ở Vercel Production, Preview không nhận (Hỏi-1), cất một bản trong trình quản lý mật khẩu ngoài máy. (3) «Mất khoá thì mất mọi số chủ». (4) Đếm dòng `owner_phone is not null`, chạy `ma-hoa-lai.ts`, đếm lại phải bằng 0. (5) Xoá cột `owner_phone` là migration của hàng sau. `.env.example` dòng 17 là `OWNER_PHONE_KEY=` rỗng, và tham-chieu.md dòng 329 là dòng sổ 31/10 về mã hoá số chủ, nêu `OWNER_PHONE_KEY` và trỏ ADR-0013.
    - spec-alignment: PASS — ADR-0013 nêu đủ năm ý. (1) Lệnh `openssl rand -base64 32` và không có giá trị khoá nào trong tệp. (2) Đặt khoá ở Vercel Production, loại Sensitive. Preview không nhận khoá theo Hỏi-1, và bản cất nằm trong trình quản lý mật khẩu. (3) Mục «Mất khoá thì mất mọi số chủ». (4) Đếm bằng `select count(*) ... owner_phone is not null`, rồi chạy `ma-hoa-lai.ts`, rồi đếm lại. (5) Xoá cột `owner_phone` là migration của hàng sau. `.env.example` dòng 17 là `OWNER_PHONE_KEY=` rỗng. Dòng 329 của §12 trong tham-chieu.md ghi ngày 31/10 về mã hoá số chủ và trỏ ADR-0013.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ma-hoa-so-chu-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T15:03:29Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ma-hoa-so-chu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T15:03:29Z

- cmd: npm run test:hooks
  run_id: minted-ma-hoa-so-chu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T15:03:29Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ma-hoa-so-chu-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T15:03:29Z

- cmd: npm run typecheck
  run_id: minted-ma-hoa-so-chu-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T15:03:29Z

- cmd: npm run lint
  run_id: minted-ma-hoa-so-chu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T15:03:29Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code mới lẫn baseline):
- npm test -w @quy-hang/api — E1, E2, E3, E4: xanh cả hai phía, chỉ chứng minh harness; cân nhắc viết lại để khẳng định hành vi mới hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh (E1-E9); E10 là mục judgment chờ người chốt ở Cổng 2. Verdict PENDING-JUDGMENT.

### Re-pin lần 1 — 2026-10-31, do gộp main (hàng 63, mọi loại hình) sau lượt chấm 1
run_id: repin-20261031T154748Z-13473
sha: 274b6a13bca93939e2dde1086d0c3473db64eb7a · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E10 · diff chạm vật đo ngoài làn máy: E10 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-10
