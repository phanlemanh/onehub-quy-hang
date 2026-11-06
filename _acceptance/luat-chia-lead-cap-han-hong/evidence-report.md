---
schema_version: 2
feature_slug: luat-chia-lead-cap-han-hong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b6b201016a046ec3a963f51cc4f84afb215d4934
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: luat-chia-lead-cap-han-hong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E3b | AC-6 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | script | PASS |
| E8 | AC-5 | script | PASS |
| E7 | AC-5 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-luat-chia-lead-cap-han-hong-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T03:12:36Z
  output: |
    npm run test:db -w @quy-hang/api (cung lenh voi E2, E3, E4, E3b)
    ca "cap han hong: sua han goi khi han nhan hong" co mat va ok
    ℹ duration_ms 108922.538583

- eval: E2
  run_id: minted-luat-chia-lead-cap-han-hong-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T03:12:36Z
  output: |
    npm run test:db -w @quy-hang/api (cung lenh voi E1, E3, E4, E3b)
    ca "cap han hong: sua han nhan khi han goi hong" co mat va ok
    ℹ duration_ms 108922.538583

- eval: E3
  run_id: minted-luat-chia-lead-cap-han-hong-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T03:12:36Z
  output: |
    npm run test:db -w @quy-hang/api (cung lenh voi E1, E2, E4, E3b)
    ca "cap han hong: ra cap trai luat thi 400, khong ghi" co mat va ok
    ℹ duration_ms 108922.538583

- eval: E4
  run_id: minted-luat-chia-lead-cap-han-hong-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T03:12:36Z
  output: |
    npm run test:db -w @quy-hang/api (cung lenh voi E1, E2, E3, E3b)
    ca "cap khong hong: luu mot han chi ghi han ay" co mat va ok
    ℹ duration_ms 108922.538583

- eval: E3b
  run_id: minted-luat-chia-lead-cap-han-hong-E3b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.api_db
  verified_at: 2026-11-06T03:12:36Z
  output: |
    npm run test:db -w @quy-hang/api (cung lenh voi E1, E2, E3, E4)
    ca "cap han hong: han goi hong, han nhan ra cap trai luat" co mat va ok
    ℹ duration_ms 108922.538583

- eval: E5
  run_id: minted-luat-chia-lead-cap-han-hong-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:12:36Z
  output: |
    npm test -w @quy-hang/web
    ca "luat chia lead: ket qua luu" trong luat.test.ts co mat va ok
    ℹ duration_ms 2915.178709

- eval: E6
  run_id: minted-luat-chia-lead-cap-han-hong-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-06T03:12:36Z
  output: |
    design-floor-s4.mjs --root .
    khong ma mau tho tren tep giao dien vong cham

- eval: E8
  run_id: minted-luat-chia-lead-cap-han-hong-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T03:12:36Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    3 tệp giao diện ngoài bản đồ
    khong co dong "lech:" nao cho tep nhom trang-thai

- eval: E7
  run_id: minted-luat-chia-lead-cap-han-hong-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:12:36Z
  screenshot: evidence/E7-cap-ok.png
  observed: |
    E7-cap-ok.png: trang Luat chia lead, o Han nhan lead 15, Han goi lan dau 40 (dong 'Da doi · [Mau] Quan tri san · 06/11'), khong co banner 'dang chay theo mac dinh', toast 'Da luu · ap cho lead moi tu bay gio' o day, nut Luu xam. E7-cap-400.png: banner dau khung 'Han nhan lead, Han goi lan dau dang chay theo mac dinh — gia tri da luu cua san khong hop le...', o Han goi hien 40, duoi o co loi do 'Khong nho hon han nhan lead (15 phut)', khong co toast Da luu, nut Luu/Hoan lai con bat. E7-cap-con-loi.png: hai banner dau khung, banner do 'Da gui nhung chua ap: Han goi lan dau van chay theo mac dinh — gia tri da luu cua san khong hop le.', Han goi lan dau hien 30 (mac dinh), khong co toast Da luu. Khop Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-luat-chia-lead-cap-han-hong-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-06T03:12:36Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-luat-chia-lead-cap-han-hong-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T03:12:36Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-luat-chia-lead-cap-han-hong-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T03:12:36Z

- cmd: npm run test:hooks
  run_id: minted-luat-chia-lead-cap-han-hong-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T03:12:36Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-luat-chia-lead-cap-han-hong-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T03:12:36Z

- cmd: npm run typecheck
  run_id: minted-luat-chia-lead-cap-han-hong-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T03:12:36Z

- cmd: npm run lint
  run_id: minted-luat-chia-lead-cap-han-hong-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T03:12:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline — chứng minh harness, không chứng minh feature; xác nhận là regression-guard có chủ ý hoặc viết lại để assert hành vi mới):
- E5 (npm test -w @quy-hang/web)
- E6 (design-floor-s4)
- E8 (design-floor-khuon --kiem)

Baseline không đo: không có.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đạt (E1-E4, E3b đỏ trên baseline nên có phân biệt; E5, E6, E8 là regression-guard; E7 có ảnh). Chuyển sang Cổng 2.
