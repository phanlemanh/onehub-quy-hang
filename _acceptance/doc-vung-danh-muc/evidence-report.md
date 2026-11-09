---
schema_version: 2
feature_slug: doc-vung-danh-muc
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2da8d8d94b381bc03dff7999f6e86ea39459f24d
human_signoff:
---

# Evidence Report: doc-vung-danh-muc

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward từ round 2) |
| E2 | AC-2 | test | PASS (carry-forward từ round 2) |
| E3 | AC-3 | test | PASS (carry-forward từ round 2) |
| E4 | AC-4 | test | PASS (carry-forward từ round 2) |
| E5 | AC-5 | test | PASS (carry-forward từ round 1) |
| E5b | AC-5 | test | PASS (carry-forward từ round 2) |
| E6 | AC-6 | test | PASS (carry-forward từ round 2) |
| E7 | AC-7 | script | PASS |
| E7b | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS (carry-forward từ round 2) |
| E8b | AC-8 | test | PASS (carry-forward từ round 2) |
| E9 | AC-9 | test | PASS (carry-forward từ round 1) |
| E10 | AC-10 | ui-check | PASS (carry-forward từ round 1) |
| E10b | AC-10 | script | PASS |

## Evidence

- eval: E7
  run_id: minted-doc-vung-danh-muc-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs
  verified_at: 2026-11-08T22:42:56Z
  output: |
    gói mẫu chỉ ở: catalog/nguon.ts, catalog/sample.ts

- eval: E7b
  run_id: minted-doc-vung-danh-muc-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs
  verified_at: 2026-11-08T22:42:56Z
  output: |
    chiều đỏ ĐẠT

- eval: E10b
  run_id: minted-doc-vung-danh-muc-E10b-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/kiem-tang-sau.mjs
  verified_at: 2026-11-08T22:42:56Z
  output: |
    ℹ duration_ms 1383.193208

### Eval carry-forward

- eval: E1
  run_id: minted-doc-vung-danh-muc-E1-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E2
  run_id: minted-doc-vung-danh-muc-E2-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E3
  run_id: minted-doc-vung-danh-muc-E3-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E4
  run_id: minted-doc-vung-danh-muc-E4-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E5
  run_id: minted-doc-vung-danh-muc-E5-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward từ round 1 — delta không chạm paths của eval

- eval: E5b
  run_id: minted-doc-vung-danh-muc-E5b-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E6
  run_id: minted-doc-vung-danh-muc-E6-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E8
  run_id: minted-doc-vung-danh-muc-E8-r2
  exit_code: 0
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E8b
  run_id: minted-doc-vung-danh-muc-E8b-r2
  exit_code: 0
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-08T22:30:41Z
  carried_from_round: 2
  # carry-forward từ round 2 — delta không chạm paths của eval

- eval: E9
  run_id: minted-doc-vung-danh-muc-E9-r1
  exit_code: 0
  verifier: config:executors.test.api
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward từ round 1 — delta không chạm paths của eval

- eval: E10
  run_id: minted-doc-vung-danh-muc-E10-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T22:19:14Z
  carried_from_round: 1
  # carry-forward từ round 1 — delta không chạm paths của eval
  screenshot: evidence/go-ma.png
  observed: |
    go-ma.png: nen /inventory mo mo, hop thoai Go ma can voi chu "P-20.05" va mot ket qua "Ma can > Mo can P-20.05". bang-hang.png: Bang hang nhom Toa -> Loai can, 2/2 can; hang P-20.05 toa "[Mau] Toa P thu", loai can 2PN, dien tich 71,5 m2, tang 20, huong Tay Bac, trang thai Dang ban, gia 3,5 ty (khop Expected). ho-so.png: ho so "P-20.05 Dang ban", "[Mau] Khu cua goi thu · [Mau] Toa P thu · Can ho", THUOC TINH CAN: Loai can 2PN, Dien tich 71,5 m2, Tang 20, Huong Tay Bac (cuon xuong con Toa, Khu, Loai hinh); anh thumbnail bi vo (404) nhung khong thuoc Expected. Phong ngu hien dang Loai can 2PN, khong co dong rieng. E10-stepN.png trung noi dung cac frame tren.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-08T22:42:56Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-08T22:42:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-08T22:42:56Z

- cmd: npm run test:hooks
  run_id: minted-doc-vung-danh-muc-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-08T22:42:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-08T22:42:56Z

- cmd: npm run typecheck
  run_id: minted-doc-vung-danh-muc-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-08T22:42:56Z

- cmd: npm run lint
  run_id: minted-doc-vung-danh-muc-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-08T22:42:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

### Baseline khong do

- node _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs: bo qua baseline: tep _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs co o cay dang kiem nhung chua co o merge-base 001ae667aaf50aa7b273690bcbfdedbd6ae5a327 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs --chieu-do: bo qua baseline: tep _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs co o cay dang kiem nhung chua co o merge-base 001ae667aaf50aa7b273690bcbfdedbd6ae5a327 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doc-vung-danh-muc/thu/kiem-tang-sau.mjs: bo qua baseline: tep _acceptance/doc-vung-danh-muc/thu/kiem-tang-sau.mjs co o cay dang kiem nhung chua co o merge-base 001ae667aaf50aa7b273690bcbfdedbd6ae5a327 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5b, E6, E8 đỏ — đo nền chạy chồng trên cùng một Postgres. Returned to implementation.
Round 2: lượt chấm PASS, máy thông; sau đó thêm E10b đi cặp với bài nhìn màn.
Round 3: chạy lại E7, E7b, E10b và toàn bộ lệnh suite, PASS; các eval còn lại carry-forward vì delta không chạm paths của chúng.

### Re-pin lần 1 — 2026-11-08, do gộp main sau lượt chấm 3
run_id: repin-20261108T225231Z-13050
sha: b9995c09687f2c818fb1c49cd301c5360c60844e · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

### Re-pin lần 2 — 2026-11-08, do gộp main sau #211
run_id: repin-20261108T232223Z-73147
sha: 2da8d8d94b381bc03dff7999f6e86ea39459f24d · suites: 7 lệnh exit 0 · evals: 13/13 eval máy đạt kỳ vọng · ngoài làn máy: E10 · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
