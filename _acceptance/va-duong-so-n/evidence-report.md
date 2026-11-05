---
schema_version: 2
feature_slug: va-duong-so-n
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f7c70b06f23bb68bf8c3608728d87d9be17a49bc
human_signoff:
---

# Evidence Report: va-duong-so-n

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-duong-so-n-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:41:07Z
  output: |
    npm test -w @quy-hang/core xanh; ca «AC-1 tách số nhà trước đường số» đạt
    (ma trận 7 tiền tố x 7 dạng số nhà = 49 dòng, phá thử bằng tachSoNhaVoi bị bắt)

- eval: E2
  run_id: minted-va-duong-so-n-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:41:07Z
  output: |
    npm test -w @quy-hang/core xanh; ca «AC-2 đường số không kèm số nhà» đạt
    (streetNumber null, trạng thái thiếu, đối chứng dương ra khoá chuẩn)

- eval: E3
  run_id: minted-va-duong-so-n-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:41:07Z
  output: |
    npm test -w @quy-hang/core xanh; ca «AC-3 khác đường khác khoá» đạt
    (93 địa chỉ ra 93 khoá khác nhau)

- eval: E4
  run_id: minted-va-duong-so-n-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:41:07Z
  output: |
    npm test -w @quy-hang/core xanh; ca «AC-4 cùng đường cùng khoá» đạt
    (9 cách viết cùng một khoá)

- eval: E5
  run_id: minted-va-duong-so-n-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T22:41:07Z
  output: |
    npm test -w @quy-hang/core xanh; ca «AC-5 khoá cũ không đổi» đạt
    (86 dòng so với ảnh trước vá, các ca hàng 75 vẫn xanh)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-duong-so-n-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T22:41:07Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-duong-so-n-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T22:41:07Z

- cmd: npm run test:hooks
  run_id: minted-va-duong-so-n-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T22:41:07Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-duong-so-n-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T22:41:07Z

- cmd: npm run typecheck
  run_id: minted-va-duong-so-n-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T22:41:07Z

- cmd: npm run lint
  run_id: minted-va-duong-so-n-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T22:41:07Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- npm test -w @quy-hang/core — E1, E2, E3, E4, E5

Không có judge panel: không eval nào thuộc loại judgment.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E5 và sáu lệnh suite đều xanh; không eval nào thất bại. Verdict PASS.

### Re-pin lần 1 — 2026-11-05, do gộp main vào nhánh
run_id: repin-20261105T225131Z-20447
sha: f7c70b06f23bb68bf8c3608728d87d9be17a49bc · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng
