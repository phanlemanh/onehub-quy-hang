---
schema_version: 2
feature_slug: pooler-che-do-giao-dich
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: aefcc2bab1f62e4b885a6830c728eafbaab7828e
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
| E6 | AC-8 | script | PASS (carry-forward từ round 1) |
| E8 | AC-7 | judgment | PASS (judge đề xuất, chờ người chốt ở Cổng 2) |
| E13 | AC-7 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | script | PASS |
| E12 | AC-9 | test | PASS (carry-forward từ round 1) |

không chạy theo hồ sơ: E7

## Evidence

- eval: E1
  run_id: minted-pooler-che-do-giao-dich-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:09:11Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3861.149334

- eval: E2
  run_id: minted-pooler-che-do-giao-dich-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T09:09:11Z
  output: |
    node --import tsx --test --test-concurrency=1 "_acceptance/pooler-che-do-giao-dich/thu/*.test.mjs"
    ℹ duration_ms 113938.895792

- eval: E3
  run_id: minted-pooler-che-do-giao-dich-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T09:09:11Z
  output: |
    cùng lệnh với E2 (một lần chạy phủ E2, E3, E4, E5, E13)
    ℹ duration_ms 113938.895792

- eval: E4
  run_id: minted-pooler-che-do-giao-dich-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T09:09:11Z
  output: |
    cùng lệnh với E2 (một lần chạy phủ E2, E3, E4, E5, E13)
    ℹ duration_ms 113938.895792

- eval: E5
  run_id: minted-pooler-che-do-giao-dich-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T09:09:11Z
  output: |
    cùng lệnh với E2 (một lần chạy phủ E2, E3, E4, E5, E13)
    ℹ duration_ms 113938.895792

- eval: E13
  run_id: minted-pooler-che-do-giao-dich-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T09:09:11Z
  output: |
    cùng lệnh với E2 (một lần chạy phủ E2, E3, E4, E5, E13)
    ℹ duration_ms 113938.895792

- eval: E9
  run_id: minted-pooler-che-do-giao-dich-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-06T09:09:11Z
  output: |
    npm run typecheck (mọi gói)

- eval: E10
  run_id: minted-pooler-che-do-giao-dich-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-06T09:09:11Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E11
  run_id: minted-pooler-che-do-giao-dich-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.build
  verified_at: 2026-11-06T09:09:11Z
  output: |
    npm run build (next build hoàn tất)

- eval: E6
  run_id: minted-pooler-che-do-giao-dich-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.pooler_giao_dich
  verified_at: 2026-11-06T08:59:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-pooler-che-do-giao-dich-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-11-06T08:59:56Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

- eval: E8
  judged_by: judge panel (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  rationale: Đề xuất PASS. ADR-0009 có mục «Sửa đổi 06/11 — chế độ giao dịch của pooler» (dòng 70–97) nêu đủ bốn ý; kiến trúc dòng 153 và Tham chiếu dòng 415 nhắc lại. Bước đổi dùng công tắc DATABASE_POOLER_PORT thay vì sửa trực tiếp DATABASE_URL, nhưng vẫn là đổi sang 6543 và lùi về 5432.
  human_override:  # chi nguoi ghi
  - domain-correctness: PASS — mục «Sửa đổi 06/11» nêu chế độ giao dịch cổng 6543 và lý do là trần 15 kết nối chế độ phiên; lược đồ danh tính đặt ở adapter (schemaName identity), truy vấn tay ghi identity.<bảng>; job migrate giữ PROD_DATABASE_URL riêng; có bước đổi bằng DATABASE_POOLER_PORT và cách lùi về 5432.
  - operational-feasibility: PASS — đủ bốn ý (chế độ đích, lược đồ ở adapter, job migrate riêng, bước đổi và đường lùi). Lệch nhỏ: bước đổi dùng công tắc cổng chứ không sửa DATABASE_URL, ADR nói rõ.
  - spec-alignment: PASS — mục có trần 15 kết nối, lược đồ identity ở adapter, PROD_DATABASE_URL riêng, các bước đổi bản thật (đặt DATABASE_POOLER_PORT=6543, triển khai lại, theo dõi nhật ký) và cách lùi về 5432.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-pooler-che-do-giao-dich-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-06T09:09:11Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-pooler-che-do-giao-dich-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T09:09:11Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-pooler-che-do-giao-dich-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T09:09:11Z

- cmd: npm run test:hooks
  run_id: minted-pooler-che-do-giao-dich-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T09:09:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-pooler-che-do-giao-dich-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T09:09:11Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: mọi eval round này ghi baseline n-a (evals.yaml không đổi từ lần đo cuối ở round 1).

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline lần đo trước, chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý): E1, E2, E3, E4, E5, E6, E13, E9, E10, E12.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E6 và E12 xanh ở round 1 (nay carry-forward); phần còn lại trả về triển khai để sửa.
Round 2: S4 lượt 1 — tài liệu nói đổi chế độ bằng công tắc cổng; tập lệnh lùi không báo lùi giả. E1–E5, E9–E11, E13 chạy lại và xanh; E6, E12 carry-forward; E8 chờ người chốt ở Cổng 2; E7 không chạy theo hồ sơ.
