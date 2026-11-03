---
schema_version: 2
feature_slug: nhap-loi-tat-dinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: ee2003959fb5eac197a26a40be53d57315eeda11
human_signoff: Manh Phan 2026-11-03
---

# Evidence Report: nhap-loi-tat-dinh

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
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-loi-tat-dinh-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E2
  run_id: minted-nhap-loi-tat-dinh-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E3
  run_id: minted-nhap-loi-tat-dinh-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E4
  run_id: minted-nhap-loi-tat-dinh-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E5
  run_id: minted-nhap-loi-tat-dinh-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E6
  run_id: minted-nhap-loi-tat-dinh-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E7
  run_id: minted-nhap-loi-tat-dinh-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E8
  run_id: minted-nhap-loi-tat-dinh-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E9
  run_id: minted-nhap-loi-tat-dinh-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

- eval: E10
  run_id: minted-nhap-loi-tat-dinh-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-03T12:12:55Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 287.834125

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-loi-tat-dinh-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-03T12:12:55Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-loi-tat-dinh-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-03T12:12:55Z

- cmd: npm run test:hooks
  run_id: minted-nhap-loi-tat-dinh-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-03T12:12:55Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-loi-tat-dinh-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-03T12:12:55Z

- cmd: npm run typecheck
  run_id: minted-nhap-loi-tat-dinh-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-03T12:12:55Z

- cmd: npm run lint
  run_id: minted-nhap-loi-tat-dinh-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-03T12:12:55Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tự round 1 — baseline không đo lại round này.

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, theo kết quả máy giao): E1, E2, E3, E4, E5, E6, E7, E8, E9, E10 (cùng lệnh npm test -w @quy-hang/core). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm 1 ra REJECT — hồ sơ bằng chứng round 1 đã commit; trả về triển khai.
Round 2: toàn bộ E1-E10 và các lệnh suite xanh trên commit ee20039 (sửa kiểm khuôn kế hoạch không sập với khoá trùng tên thuộc tính hệ thống).
