---
schema_version: 2
feature_slug: va-cai-dat-mat-viec
verdict: REJECT
failed_evals: ["E1","E2","E3","E4","E5b","E6","E7","E8","E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e7b5746e65d07abf17186000d7b279c8529c47bd
human_signoff:
---

# Evidence Report: va-cai-dat-mat-viec

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | FAIL |
| E2 | AC-2 | script | FAIL |
| E3 | AC-3 | script | FAIL |
| E4 | AC-4 | script | FAIL |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | FAIL |
| E6 | AC-6 | script | FAIL |
| E7 | AC-7 | script | FAIL |
| E8 | AC-8 | script | FAIL |
| E9 | AC-9 | script | FAIL |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | script | PASS |
| E12 | AC-10 | script | PASS |

Lệnh fail không gắn eval riêng: `node _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs` (một lệnh chung cho E1-E9, kết thúc không sạch). Các ca `giu-nhan` và `huy-nhieu-lan` in dat true, nhưng lệnh dừng đỏ ở sáu ca `chuyen-hai`, `xoa-hong`, `sua-hong`, `kho-375`, `kho-rong`, `nhan-ti-le`; vì lệnh là một khối nên cả chín eval gắn với nó bị tính trượt. Ca `chuyen-hai` báo "fetch failed"; năm ca còn lại hết giờ chờ bảng `tbody tr` hoặc ô `number-field-input` (máy dev chung có thể đã bị tắt giữa chừng, xem review-findings.md).

## Evidence

- eval: E1
  run_id: minted-va-cai-dat-mat-viec-E1-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"giu-nhan","nhanSauCon":true,"nhanDauVanGo":true,"luuBamDuoc":true,"canDauSangThay":true,"nhanDauMat":true,"canSauGiu":true,"nhanSauCon_csdl":true,"dat":true}
    đỏ: chuyen-hai, xoa-hong, sua-hong, kho-375, kho-rong, nhan-ti-le

- eval: E2
  run_id: minted-va-cai-dat-mat-viec-E2-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"huy-nhieu-lan","sauEsc":true,"sauGiu":true,"nhanMotVanGo":true,"hoiMoi":true,"nutKhoa":true,"luuBamDuoc":true,"dat":true}
    đỏ: chuyen-hai, xoa-hong, sua-hong, kho-375, kho-rong, nhan-ti-le

- eval: E3
  run_id: minted-va-cai-dat-mat-viec-E3-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"chuyen-hai","dat":false,"loi":"fetch failed"}

- eval: E4
  run_id: minted-va-cai-dat-mat-viec-E4-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"xoa-hong","dat":false,"loi":"hết giờ chờ: document.readyState === \"complete\" && !!document.querySelector(\"tbody tr\")"}

- eval: E5
  run_id: minted-va-cai-dat-mat-viec-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-09T05:27:54Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6368.750458

- eval: E5b
  run_id: minted-va-cai-dat-mat-viec-E5b-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"xoa-hong","dat":false,"loi":"hết giờ chờ: document.readyState === \"complete\" && !!document.querySelector(\"tbody tr\")"}

- eval: E6
  run_id: minted-va-cai-dat-mat-viec-E6-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"sua-hong","dat":false,"loi":"hết giờ chờ: document.readyState === \"complete\" && !!document.querySelector(\"tbody tr\")"}

- eval: E7
  run_id: minted-va-cai-dat-mat-viec-E7-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"kho-375","dat":false,"loi":"hết giờ chờ: document.readyState === \"complete\" && !!document.querySelector(\"tbody tr\")"}

- eval: E8
  run_id: minted-va-cai-dat-mat-viec-E8-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"kho-rong","dat":false,"loi":"hết giờ chờ: document.readyState === \"complete\" && !!document.querySelector(\"tbody tr\")"}

- eval: E9
  run_id: minted-va-cai-dat-mat-viec-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  output: |
    {"ca":"nhan-ti-le","dat":false,"loi":"hết giờ chờ: document.readyState === \"complete\" && !!document.querySelector(\"[data-slot=number-field-input]\")"}

- eval: E10
  run_id: minted-va-cai-dat-mat-viec-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs
  verified_at: 2026-11-09T05:27:54Z
  screenshot: evidence/E10-step2.png
  observed: |
    giu-nhan.png (1440x900): đủ vỏ (thanh trên, sidebar Cài đặt, breadcrumb, tiêu đề Trạng thái); khối Đang bán còn nhãn «Nhãn riêng» với ô nhập «Nhãn hai» và nút xoá; nút Lưu ở mép dưới chỉ thấy một phần, sáng màu (không có dấu hiệu bị khoá). xoa-loi.png: hộp «Xoá «Cột sẽ xoá»?» vẫn mở giữa màn, câu đỏ «Chưa xoá được — dòng vẫn giữ nguyên, thử lại» đọc rõ, nằm trên dải nút Huỷ/Xoá, không đè nút.
    mau-375.png (375x812): bảng Mẫu nhập không cuộn ngang, Sửa/Xoá nằm trong màn, chữ phụ đóng ngắt dòng. mau-375-hop.png: hộp xoá nằm trọn trong màn, tiêu đề và mô tả chữ X dài ngắt dòng không tràn, nút Xoá/Huỷ xếp dọc đầy đủ. mau-1440.png: bảng năm cột (Tiêu đề, Ghép vào, Quy đổi, Nguồn, cột nút Sửa/Xoá) đủ vỏ. Không có chữ đè nhau, không thành phần tràn màn.
  network_observed: n-a (driver)

- eval: E11
  run_id: minted-va-cai-dat-mat-viec-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-09T05:27:54Z
  output: |
    design-floor-s4.mjs --root .  (không mã màu thô trên tệp giao diện vòng chạm)

- eval: E12
  run_id: minted-va-cai-dat-mat-viec-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T05:27:54Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    5 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T05:27:54Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T05:27:54Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T05:27:54Z

- cmd: npm run test:hooks
  run_id: minted-va-cai-dat-mat-viec-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T05:27:54Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-cai-dat-mat-viec-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T05:27:54Z

- cmd: npm run typecheck
  run_id: minted-va-cai-dat-mat-viec-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T05:27:54Z

- cmd: npm run lint
  run_id: minted-va-cai-dat-mat-viec-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T05:27:54Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh bộ đo chứ không phải tính năng; xác nhận là regression-guard có chủ ý hoặc viết lại để assert hành vi mới):
- E5: npm test -w @quy-hang/web
- E11: design-floor-s4.mjs
- E12: design-floor-khuon.mjs --kiem

Baseline không đo:
- node _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs: bo qua baseline: tep _acceptance/va-cai-dat-mat-viec/thu/kiem-man.mjs co o cay dang kiem nhung chua co o merge-base 09724fe69e5811243ec24845b8a1cd5e48c21668 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3, E4, E5b, E6, E7, E8, E9 failed — lệnh đo chung kiem-man.mjs dừng đỏ ở sáu ca (chuyen-hai báo fetch failed; xoa-hong, sua-hong, kho-375, kho-rong, nhan-ti-le hết giờ chờ bảng/ô); hai ca giu-nhan và huy-nhieu-lan tự đạt nhưng lệnh gộp bị tính trượt. Returned to implementation.
