---
schema_version: 2
feature_slug: chan-trung-ten-gia-tri
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 27bd858375b1f28bcf5162bcaf611ff1a2fbc81f
human_signoff:
---

# Evidence Report: chan-trung-ten-gia-tri

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward round 1) |
| E1b | AC-2 | test | PASS (carry-forward round 1) |
| E1c | AC-3 | test | PASS (carry-forward round 1) |
| E1d | AC-4 | test | PASS (carry-forward round 1) |
| E1e | AC-5 | test | PASS (carry-forward round 1) |
| E2 | AC-1 | test | PASS |
| E2b | AC-4 | test | PASS |
| E3 | AC-6 | test | PASS (carry-forward round 1) |
| E4 | AC-6 | ui-check | PASS (carry-forward round 1) |
| E5 | AC-7 | test | PASS (carry-forward round 1) |
| E6 | AC-8 | test | PASS (carry-forward round 1) |
| E7 | AC-6 | script | PASS (carry-forward round 1) |

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline): E2 và E2b, chạy chung một lệnh `test-db/chan-trung-ten-gia-tri/*.test.ts` trên Postgres, baseline: green. Hai eval này cần viết lại để khẳng định hành vi mới, hoặc xác nhận đây là lớp bảo vệ hồi quy có chủ ý.

## Variance

none — every multi-run eval is uniform

## Evidence

- eval: E2
  run_id: minted-chan-trung-ten-gia-tri-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chan_trung_ten
  verified_at: 2026-11-07T01:53:19Z
  output: |
    chạy trên Postgres dãy B, test-db/chan-trung-ten-gia-tri/*.test.ts
    ℹ duration_ms 884.685

- eval: E2b
  run_id: minted-chan-trung-ten-gia-tri-E2b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chan_trung_ten
  verified_at: 2026-11-07T01:53:19Z
  output: |
    chạy chung lệnh với E2 trên Postgres dãy B
    ℹ duration_ms 884.685

- eval: E1
  run_id: minted-chan-trung-ten-gia-tri-E1-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-chan-trung-ten-gia-tri-E1b-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1c
  run_id: minted-chan-trung-ten-gia-tri-E1c-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1d
  run_id: minted-chan-trung-ten-gia-tri-E1d-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E1e
  run_id: minted-chan-trung-ten-gia-tri-E1e-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-chan-trung-ten-gia-tri-E3-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-chan-trung-ten-gia-tri-E4-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E4-step1.png
  observed: |
    E4-step1.png (đã mở bằng Read, 1440x900, trang /settings/labels): ô «Điều kiện phí · Không bao phí» chứa «bao phí», viền đỏ; ngay dưới có câu đỏ «Trùng tên của «Bao phí»»; nút «Lưu» ở góc dưới xám (khoá); ô «Điều kiện phí · Bao phí» ngay trên để trống (placeholder «Bao phí»), không có câu lỗi. E4-step2.png (đã mở bằng Read): ô đỏ đã đổi thành «Phí ngoài», viền thường, câu lỗi biến mất, nút «Lưu» đen (bấm được); ô anh em vẫn trống, không lỗi. Khớp Expected cả hai bước.
  network_observed: unscoped-partial

- eval: E5
  run_id: minted-chan-trung-ten-gia-tri-E5-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-chan-trung-ten-gia-tri-E6-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-chan-trung-ten-gia-tri-E7-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T01:40:46Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-chan-trung-ten-gia-tri-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-07T01:53:19Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-chan-trung-ten-gia-tri-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T01:53:19Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chan-trung-ten-gia-tri-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T01:53:19Z

- cmd: npm run test:hooks
  run_id: minted-chan-trung-ten-gia-tri-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T01:53:19Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chan-trung-ten-gia-tri-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T01:53:19Z

- cmd: npm run typecheck
  run_id: minted-chan-trung-ten-gia-tri-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T01:53:19Z

- cmd: npm run lint
  run_id: minted-chan-trung-ten-gia-tri-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T01:53:19Z

## Known limits

## Ngoài hợp đồng

## Iterations

Round 1: E2, E2b trượt — lệnh chạy trên Postgres dãy D (không phải dãy đã dựng cho hồ sơ), không phải lỗi mã. Trả về triển khai, đổi sang Postgres dãy B.
Round 2: E2, E2b xanh trên Postgres dãy B; các eval còn lại mang sang từ round 1 vì phần thay đổi không chạm paths của chúng.
