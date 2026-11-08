---
schema_version: 2
feature_slug: doc-vung-danh-muc
verdict: REJECT
failed_evals: [E1, E2, E3, E4, E5b, E6, E8]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d34b5c60d38038649384577031230090a5774ffe
human_signoff:
---

# Evidence Report: doc-vung-danh-muc

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | FAIL |
| E2 | AC-2 | test | FAIL |
| E3 | AC-3 | test | FAIL |
| E4 | AC-4 | test | FAIL |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | FAIL |
| E6 | AC-6 | test | FAIL |
| E7 | AC-7 | script | PASS |
| E7b | AC-7 | script | PASS |
| E8 | AC-8 | test | FAIL |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |

Lệnh fail: `DATABASE_URL=${DATABASE_URL:-postgres://postgres:quyhang@localhost:5575/postgres} npm run test:db -w @quy-hang/api` (một lệnh chung cho E1, E2, E3, E4, E5b, E6, E8) kết thúc lỗi. Hai ca đỏ nhìn thấy ở đuôi đầu ra nằm trong `packages/api/test-db/imports/lan-nhap.test.ts` (dòng 272 và 300): kỳ vọng `create`, nhận `skip`. Cả lệnh được tính đỏ cho mọi eval gắn với nó. Mọi lệnh fail đều đã gắn eval, không có lệnh fail rời.

## Evidence

- eval: E1
  run_id: minted-doc-vung-danh-muc-E1-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    AssertionError [ERR_ASSERTION]: Expected values to be strictly equal: 'skip' !== 'create'
    at test-db/imports/lan-nhap.test.ts:272:10
    ✖ lần nhập: độ tươi theo ngày trong file
    npm error Lifecycle script `test:db` failed with error

- eval: E2
  run_id: minted-doc-vung-danh-muc-E2-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    (cùng lệnh test:db với E1) 'skip' !== 'create' tại test-db/imports/lan-nhap.test.ts:300:10

- eval: E3
  run_id: minted-doc-vung-danh-muc-E3-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    (cùng lệnh test:db với E1) npm error command failed

- eval: E4
  run_id: minted-doc-vung-danh-muc-E4-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    (cùng lệnh test:db với E1) npm error command failed

- eval: E5b
  run_id: minted-doc-vung-danh-muc-E5b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    (cùng lệnh test:db với E1) npm error command failed

- eval: E6
  run_id: minted-doc-vung-danh-muc-E6-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    (cùng lệnh test:db với E1) npm error command failed

- eval: E8
  run_id: minted-doc-vung-danh-muc-E8-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.api_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    (cùng lệnh test:db với E1) npm error command failed

- eval: E5
  run_id: minted-doc-vung-danh-muc-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-08T22:19:14Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 988.868708

- eval: E9
  run_id: minted-doc-vung-danh-muc-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-08T22:19:14Z
  output: |
    npm test -w @quy-hang/api
    ℹ duration_ms 988.868708

- eval: E7
  run_id: minted-doc-vung-danh-muc-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs
  verified_at: 2026-11-08T22:19:14Z
  output: |
    gói mẫu chỉ ở: catalog/nguon.ts, catalog/sample.ts

- eval: E7b
  run_id: minted-doc-vung-danh-muc-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs
  verified_at: 2026-11-08T22:19:14Z
  output: |
    chiều đỏ ĐẠT

- eval: E8b
  run_id: minted-doc-vung-danh-muc-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.doi_nhan_db
  verified_at: 2026-11-08T22:19:14Z
  output: |
    npm run db:migrate && npm run db:test (Postgres riêng, cổng 5576)
    ℹ duration_ms 155446.347917

- eval: E10
  run_id: minted-doc-vung-danh-muc-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/doc-vung-danh-muc/thu/nap-goi-thu.mjs
  verified_at: 2026-11-08T22:19:14Z
  screenshot: evidence/go-ma.png
  observed: |
    go-ma.png: nen /inventory mo mo, hop thoai Go ma can voi chu "P-20.05" va mot ket qua "Ma can > Mo can P-20.05". bang-hang.png: Bang hang nhom Toa -> Loai can, 2/2 can; hang P-20.05 toa "[Mau] Toa P thu", loai can 2PN, dien tich 71,5 m2, tang 20, huong Tay Bac, trang thai Dang ban, gia 3,5 ty (khop Expected). ho-so.png: ho so "P-20.05 Dang ban", "[Mau] Khu cua goi thu · [Mau] Toa P thu · Can ho", THUOC TINH CAN: Loai can 2PN, Dien tich 71,5 m2, Tang 20, Huong Tay Bac (cuon xuong con Toa, Khu, Loai hinh); anh thumbnail bi vo (404) nhung khong thuoc Expected. Phong ngu hien dang Loai can 2PN, khong co dong rieng. E10-stepN.png trung noi dung cac frame tren.
  network_observed: clean
  output: |
    PASS Step4: /units/P-20.05 hồ sơ căn đủ khu, toà, tầng 20, diện tích 71,5 m2, hướng Tây Bắc, loại căn 2PN, loại hình Căn hộ. Ghi chú: "phòng ngủ" không có dòng riêng, hiện qua Loại căn 2PN. Chỉ ảnh thumbnail căn mẫu lỗi tải (tài nguyên ảnh, không thuộc Expected).

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-08T22:19:14Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-08T22:19:14Z

- cmd: npm run test:hooks
  run_id: minted-doc-vung-danh-muc-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-08T22:19:14Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doc-vung-danh-muc-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-08T22:19:14Z

- cmd: npm run typecheck
  run_id: minted-doc-vung-danh-muc-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-08T22:19:14Z

- cmd: npm run lint
  run_id: minted-doc-vung-danh-muc-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-08T22:19:14Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh cả trên code hiện tại lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/api`: E5, E9
- `export DATABASE_URL=postgres://postgres:quyhang@localhost:5576/postgres && npm run db:migrate && npm run db:test`: E8b

Baseline khong do
- node _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs: bo qua baseline: tep _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs co o cay dang kiem nhung chua co o merge-base 7eaf136da7c0fdb81902b7962bd6d56ea873a9b3 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs --chieu-do: bo qua baseline: tep _acceptance/doc-vung-danh-muc/thu/kiem-mot-cho-goi-mau.mjs co o cay dang kiem nhung chua co o merge-base 7eaf136da7c0fdb81902b7962bd6d56ea873a9b3 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, tất định)

## Iterations

Round 1: E1, E2, E3, E4, E5b, E6, E8 failed — lệnh test:db của @quy-hang/api kết thúc lỗi; hai ca đỏ thấy ở đuôi đầu ra là lan-nhap.test.ts (kỳ vọng create, nhận skip). Trả về giai đoạn triển khai để xác định ca đỏ thuộc tính năng hay bộ test sẵn có.
