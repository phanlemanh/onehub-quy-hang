---
schema_version: 2
feature_slug: ma-hoa-so-chu
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6733c5e2492813356c8d96a6ee1e08bb72bfc32a
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
| E10 | AC-10 | judgment | đề xuất PASS, chờ người chốt ở Cổng 2 |
| E11 | AC-11 | test | PASS |
| E12 | AC-12 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-ma-hoa-so-chu-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 61414.50075

- eval: E2
  run_id: minted-ma-hoa-so-chu-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 61414.50075

- eval: E3
  run_id: minted-ma-hoa-so-chu-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 61414.50075

- eval: E4
  run_id: minted-ma-hoa-so-chu-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 61414.50075

- eval: E5
  run_id: minted-ma-hoa-so-chu-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4994.874333

- eval: E6
  run_id: minted-ma-hoa-so-chu-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4994.874333

- eval: E7
  run_id: minted-ma-hoa-so-chu-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4994.874333

- eval: E8
  run_id: minted-ma-hoa-so-chu-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4994.874333

- eval: E9
  run_id: minted-ma-hoa-so-chu-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4994.874333

- eval: E11
  run_id: minted-ma-hoa-so-chu-E11-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4994.874333

- eval: E12
  run_id: minted-ma-hoa-so-chu-E12-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T22:42:21Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 4994.874333

### Judgment

- eval: E10
  judged_by: judge-subagent panel (fresh context, 3 lens)
  verdict: PASS
  rationale: Đề xuất PASS. ADR-0013 đủ năm ý, khoá không có giá trị trong tệp, dòng sổ Tham chiếu trỏ ADR-0013. Chờ người chốt ở Cổng 2.
  votes:
    - domain-correctness: PASS — ADR-0013 đủ cả năm ý: lệnh `openssl rand -base64 32` (không có giá trị khoá nào trong tệp), đặt ở Vercel Production Sensitive (Preview không nhận, theo Hỏi-1) và cất bản ở trình quản lý mật khẩu ngoài máy, mất khoá thì mất mọi số chủ, đếm cả listing_owners lẫn leads rồi chạy ma-hoa-lai.ts ngay sau migration 008/009, xoá cột owner_phone là migration hàng sau. `.env.example` dòng 17 là `OWNER_PHONE_KEY=` rỗng, và tham-chieu.md dòng 329 là dòng sổ 31/10 về mã hoá số chủ trỏ ADR-0013.
    - operational-feasibility: PASS — ADR-0013 nêu đủ năm ý. Đó là lệnh `openssl rand -base64 32` không kèm giá trị khoá, Vercel Production, Preview không nhận khoá, bản cất ở trình quản lý mật khẩu, và mất khoá thì mất mọi số chủ. Nó cũng nêu việc đếm ở cả `listing_owners` và `leads` rồi chạy lệnh mã hoá lại ngay sau migration 008/009, và việc xoá `owner_phone` là hàng sau. `.env.example` có dòng `OWNER_PHONE_KEY=` rỗng. Sổ quyết định tham-chieu.md có dòng 31/10 về mã hoá số chủ, trỏ ADR-0013.
    - spec-alignment: PASS — ADR-0013 nêu đủ cả năm ý: lệnh `openssl rand -base64 32`, đặt khoá ở Vercel Production (Preview không nhận, theo Hỏi-1) và cất một bản ngoài máy, mất khoá là mất mọi số chủ, đếm dòng số rõ ở cả `listing_owners` và `leads` rồi chạy lệnh mã hoá lại ngay sau migration 008/009, và xoá cột `owner_phone` là hàng sau. `.env.example` dòng 17 là `OWNER_PHONE_KEY=` rỗng, không có giá trị khoá nào. Sổ quyết định §12 của tham-chieu.md có dòng 31/10 (dòng 329) nói số chủ đã mã hoá và trỏ ADR-0013.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ma-hoa-so-chu-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T22:42:21Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ma-hoa-so-chu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T22:42:21Z

- cmd: npm run test:hooks
  run_id: minted-ma-hoa-so-chu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T22:42:21Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ma-hoa-so-chu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T22:42:21Z

- cmd: npm run typecheck
  run_id: minted-ma-hoa-so-chu-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T22:42:21Z

- cmd: npm run lint
  run_id: minted-ma-hoa-so-chu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T22:42:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code hiện tại lẫn baseline), chứng minh khung chạy chứ chưa chứng minh tính năng. Nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý:

- Lệnh `npm test -w @quy-hang/api` cho E1, E2, E3, E4.

Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: có hồ sơ cũ, lịch sử không được truyền xuống round này.
Round 2: mọi eval máy xanh; E10 là mục judgment, đề xuất PASS, chờ người chốt nên verdict là PENDING-JUDGMENT.
