---
schema_version: 2
feature_slug: pooler-che-do-giao-dich
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 05adf21c59e19ea31e22c61538e4e14d9d9b0472
human_signoff:
---

# Evidence Report: pooler-che-do-giao-dich

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-8 | script | PASS |
| E8 | AC-7 | judgment | PASS (đề xuất của hội đồng, chờ người chốt ở Cổng 2) |
| E13 | AC-7 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-9 | test | PASS |

không chạy theo hồ sơ: E7

## Evidence

- eval: E1
  run_id: minted-pooler-che-do-giao-dich-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T08:59:56Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6228.90025

- eval: E2
  run_id: minted-pooler-che-do-giao-dich-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T08:59:56Z
  output: |
    node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"
    ℹ duration_ms 147798.671458

- eval: E3
  run_id: minted-pooler-che-do-giao-dich-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T08:59:56Z
  output: |
    node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"
    ℹ duration_ms 147798.671458

- eval: E4
  run_id: minted-pooler-che-do-giao-dich-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T08:59:56Z
  output: |
    node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"
    ℹ duration_ms 147798.671458

- eval: E5
  run_id: minted-pooler-che-do-giao-dich-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T08:59:56Z
  output: |
    node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"
    ℹ duration_ms 147798.671458

- eval: E6
  run_id: minted-pooler-che-do-giao-dich-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T08:59:56Z
  output: |
    node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"
    ℹ duration_ms 147798.671458

- eval: E13
  run_id: minted-pooler-che-do-giao-dich-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T08:59:56Z
  output: |
    node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"
    ℹ duration_ms 147798.671458

- eval: E9
  run_id: minted-pooler-che-do-giao-dich-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-06T08:59:56Z
  output: |
    npm run typecheck — hoàn tất trên mọi gói, không lỗi kiểu.

- eval: E10
  run_id: minted-pooler-che-do-giao-dich-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-06T08:59:56Z
  output: |
    chuẩn giao diện: đạt

- eval: E11
  run_id: minted-pooler-che-do-giao-dich-E11-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.script.build
  verified_at: 2026-11-06T08:59:56Z
  output: |
    npm run build — next build hoàn tất.

- eval: E12
  run_id: minted-pooler-che-do-giao-dich-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-06T08:59:56Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 1644.244375

- eval: E8
  judged_by: hội đồng ba góc nhìn (context sạch) — domain-correctness, operational-feasibility, spec-alignment
  run_id: không áp dụng — mục phán đoán, không có lệnh máy
  verifier: config:executors.judgment
  verified_at: 2026-11-06T08:59:56Z
  verdict: PASS
  rationale: |
    Đề xuất PASS. Ba phiếu:
    - domain-correctness: PASS — ADR-0009 có mục «Sửa đổi 06/11 — chế độ giao dịch của pooler» (dòng 70–97) đủ bốn ý: chế độ giao dịch 6543 và trần 15 của chế độ phiên, lược đồ danh tính đặt ở adapter với truy vấn tay ghi `identity.`, job migrate giữ chuỗi riêng, các bước đổi sang 6543 kèm cách lùi về 5432. Tệp kiến trúc (dòng 153) và Tham chiếu (dòng 413–415) nhắc lại.
    - operational-feasibility: PASS — mục có đủ bốn ý (chế độ 6543 và trần 15; lược đồ `identity` ở adapter; chuỗi `PROD_DATABASE_URL` của job migrate giữ riêng; bước đổi và cách lùi); kien-truc-repo-va-stack.md (dòng 153) và tham-chieu.md (dòng 413–415) trỏ về mục ấy.
    - spec-alignment: PASS — mục dòng 70–97 nêu đủ bốn ý, tệp kiến trúc và Tham chiếu nhắc lại các ý đầu cùng việc đổi chuỗi sau Cổng Bằng chứng và đường lùi về 5432.
  required_evidence:
    - (judge không nêu bằng-chứng-thiếu)
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-pooler-che-do-giao-dich-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T08:59:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-pooler-che-do-giao-dich-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T08:59:56Z

- cmd: npm run test:hooks
  run_id: minted-pooler-che-do-giao-dich-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T08:59:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-pooler-che-do-giao-dich-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T08:59:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không phân biệt (xanh cả trên mã mới lẫn mã cũ diffBase) — chứng minh bộ thử chứ chưa chứng minh riêng tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý:
- `npm test -w @quy-hang/web`: E1
- `node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"`: E2, E3, E4, E5, E6, E13
- `npm run typecheck`: E9
- `npm run lint`: E10
- `npm test -w @quy-hang/api`: E12

E11 đỏ trên mã cũ (có phân biệt). E8 là mục phán đoán, không đo baseline.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy xanh; E8 (phán đoán) chờ người chốt ở Cổng 2 nên verdict PENDING-JUDGMENT.
