---
schema_version: 2
feature_slug: va-loi-doc-can-ngoai-khu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3adff8a52df021de6955ee98b4f9c05729fc0b5a
human_signoff:
---

# Evidence Report: va-loi-doc-can-ngoai-khu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-1 | script | PASS |
| E8 | AC-1 | script | PASS |
| E9 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-loi-doc-can-ngoai-khu-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:08:44Z
  output: |
    npm test -w @quy-hang/web (lệnh: một lần chạy, chung cho E1 đến E5)
    ℹ duration_ms 4660.860125

- eval: E2
  run_id: minted-va-loi-doc-can-ngoai-khu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:08:44Z
  output: |
    npm test -w @quy-hang/web (lệnh: một lần chạy, chung cho E1 đến E5)
    ℹ duration_ms 4660.860125

- eval: E3
  run_id: minted-va-loi-doc-can-ngoai-khu-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:08:44Z
  output: |
    npm test -w @quy-hang/web (lệnh: một lần chạy, chung cho E1 đến E5)
    ℹ duration_ms 4660.860125

- eval: E4
  run_id: minted-va-loi-doc-can-ngoai-khu-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:08:44Z
  output: |
    npm test -w @quy-hang/web (lệnh: một lần chạy, chung cho E1 đến E5)
    ℹ duration_ms 4660.860125

- eval: E5
  run_id: minted-va-loi-doc-can-ngoai-khu-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T10:08:44Z
  output: |
    npm test -w @quy-hang/web (lệnh: một lần chạy, chung cho E1 đến E5)
    ℹ duration_ms 4660.860125

- eval: E6
  run_id: minted-va-loi-doc-can-ngoai-khu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T10:08:44Z
  screenshot: evidence/E6-bao.png
  observed: |
    E6-bao.png: Bang hang, khoi bao do tren bang voi dung cau «Chưa đọc được danh sách căn ngoài khu — loại hình và địa chỉ của các căn này có thể thiếu» kem nut «Thử lại»; cac hang van hien (12/12 can), 5 can ngoai khu ten «Căn ngoài khu», ma «—», loai «Chưa rõ». Khop ca1. E6-sau.png: sau Thu lai khong con khoi bao; nhom theo dia chi (31 Đường Mẫu 3..., 33..., 35..., 37..., 39...), cot Loai hinh hien Nha pho, Nha pho, Biet thu, Dat, Dat — dung loai va dia chi da go; co them cot Loai hinh/Vi tri (ban giu). Khop. E6-ca-hai.png: mot khoi bao duy nhat, mot nut Thu lai, chu «Chưa đọc được danh bạ thành viên và danh sách căn ngoài khu — cột Đầu chủ và các căn ngoài khu có thể thiếu thông tin», dung cau AC-5; hang van hien. Khop.
  network_observed: n-a (driver)
  output: |
    - ca500: bao dung cau AC-1, nutThuLai 1: PASS
    - ca2: soBao 1, nutThuLai 1, chu dung cau AC-5; sau bo ngat: soBao 0, nutThuLai 0, tang ngoaiKhu 1 va danBa 1: PASS
    Frame luu: E6-bao.png, E6-sau.png, E6-ca-hai.png, E6-network.txt (trong evidence/).

- eval: E7
  run_id: minted-va-loi-doc-can-ngoai-khu-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-09T10:08:44Z
  output: |
    npm run typecheck — kiểm kiểu mọi gói xanh

- eval: E8
  run_id: minted-va-loi-doc-can-ngoai-khu-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T10:08:44Z
  output: |
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-va-loi-doc-can-ngoai-khu-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T10:08:44Z
  output: |
    (không in dòng nào; không mã màu thô trên tệp giao diện vòng chạm)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T10:08:44Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T10:08:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T10:08:44Z

- cmd: npm run test:hooks
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T10:08:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T10:08:44Z

- cmd: npm run lint
  run_id: minted-va-loi-doc-can-ngoai-khu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T10:08:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E5
- npm run typecheck: E7
- design-floor-khuon (--kiem): E8
- design-floor-s4: E9

Baseline không đo: E6 — eval ui-check, baseline n-a (không chạy được trên mã cũ diffBase).

## Variance

none — mọi eval chạy một lần và xác định (runs: 1), không có pass_rate hỗn hợp.

## Iterations

Round 1: mọi eval (E1 đến E9) đạt, không có mục judgment đang chờ người. Verdict PASS.

