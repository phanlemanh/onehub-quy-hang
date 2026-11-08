---
schema_version: 2
feature_slug: doc-vung-danh-muc
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 80b31b6ebab50bc69ee5e605aa00bd8ae7420b18
human_signoff:
---

# Evidence Report: doc-vung-danh-muc

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS (carry-forward từ round 1) |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS (carry-forward từ round 1) |
| E7b | AC-7 | script | PASS (carry-forward từ round 1) |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS (carry-forward từ round 1) |
| E10 | AC-10 | ui-check | PASS (carry-forward từ round 1) |

## Evidence

- eval: E1
  run_id: minted-doc-vung-danh-muc-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E2
  run_id: minted-doc-vung-danh-muc-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E3
  run_id: minted-doc-vung-danh-muc-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E4
  run_id: minted-doc-vung-danh-muc-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E5b
  run_id: minted-doc-vung-danh-muc-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E6
  run_id: minted-doc-vung-danh-muc-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E8
  run_id: minted-doc-vung-danh-muc-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E8b
  run_id: minted-doc-vung-danh-muc-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-08T22:30:41Z

- eval: E5
  run_id: minted-doc-vung-danh-muc-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-doc-vung-danh-muc-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-doc-vung-danh-muc-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-doc-vung-danh-muc-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.api
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-doc-vung-danh-muc-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/nap-goi-thu.mjs
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/go-ma.png
  observed: |
    go-ma.png: nen /inventory mo mo, hop thoai Go ma can voi chu "P-20.05" va mot ket qua "Ma can > Mo can P-20.05". bang-hang.png: Bang hang nhom Toa -> Loai can, 2/2 can; hang P-20.05 toa "[Mau] Toa P thu", loai can 2PN, dien tich 71,5 m2, tang 20, huong Tay Bac, trang thai Dang ban, gia 3,5 ty (khop Expected). ho-so.png: ho so "P-20.05 Dang ban", "[Mau] Khu cua goi thu · [Mau] Toa P thu · Can ho", THUOC TINH CAN: Loai can 2PN, Dien tich 71,5 m2, Tang 20, Huong Tay Bac (cuon xuong con Toa, Khu, Loai hinh); anh thumbnail bi vo (404) nhung khong thuoc Expected. Phong ngu hien dang Loai can 2PN, khong co dong rieng. E10-stepN.png trung noi dung cac frame tren.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T22:30:41Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T22:30:41Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T22:30:41Z

- cmd: npm run test:hooks
  run_id: minted-doc-vung-danh-muc-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T22:30:41Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-08T22:30:41Z

- cmd: npm run typecheck
  run_id: minted-doc-vung-danh-muc-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T22:30:41Z

- cmd: npm run lint
  run_id: minted-doc-vung-danh-muc-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T22:30:41Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh ở cả code mới lẫn baseline, chứng minh harness hơn là tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/api: E5, E9
- export DATABASE_URL=postgres://postgres:quyhang@localhost:5576/postgres && npm run db:migrate && npm run db:test: E8b

Judge panels: không có eval judgment nào trong hợp đồng này, nên không có panel và không có mục cần human_override.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5b, E6, E8 failed — bộ đo nền chạy chồng trên cùng một Postgres với bộ kiểm chạy song song (sửa bằng cách ghim Postgres riêng cho E8b). Returned to implementation.
Round 2: tất cả eval chạy lại đều xanh; E5, E7, E7b, E9, E10 carry-forward từ round 1 vì delta không chạm paths của chúng. Verdict PASS.
