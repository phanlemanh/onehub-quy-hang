---
schema_version: 2
feature_slug: va-bang-hang-hydration
verdict: REJECT
failed_evals: ["E8"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6e923c533a94baf9a59ed028789e153fbb714f36
human_signoff:
---

# Evidence Report: va-bang-hang-hydration

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS (đạt có giới hạn) |
| E1b | AC-3 | script | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | script | PASS |
| E8 | AC-4 | script | FAIL |

Lệnh fail không gắn eval nào: không có. Lệnh thất bại duy nhất là lệnh của E8 (design-floor S4, chặn mã màu thô): in «design-floor S4: hex thô apps/web/src/app/(app)/inventory/cards/bang-the.tsx:119 #185».

## Evidence

- eval: E1
  run_id: minted-va-bang-hang-hydration-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs
  verified_at: 2026-11-07T22:18:30Z
  output: |
    hydration SẠCH: 0 lỗi hydration ở cả 6 ca; mất mạng vẫn hiện hàng trong 5 giây

- eval: E2
  run_id: minted-va-bang-hang-hydration-E2-r1
  exit_code: 1
  baseline: n-a
  verifier: _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs
  verified_at: 2026-11-07T22:18:30Z
  output: |
    hydration ĐỎ: 4 lỗi hydration trên Bảng hàng
    (chạy với --sha a5682245; mã thoát 1 là kết quả đã khai trước của eval này)

- eval: E1b
  run_id: minted-va-bang-hang-hydration-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs
  verified_at: 2026-11-07T22:18:30Z
  output: |
    hydration SẠCH: 0 lỗi hydration ở cả 6 ca; mất mạng vẫn hiện hàng trong 5 giây

- eval: E3
  run_id: minted-va-bang-hang-hydration-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T22:18:30Z
  screenshot: evidence/E3-may-tinh.png
  observed: |
    E3-may-tinh.png (1440x900, sau tải lại): lưới Bảng hàng có hàng thật, nhóm Toà A → 1PN/2PN/3PN, các cột Toà/Mã căn/Loại căn/Diện tích/Tầng/Hướng/Trạng thái/Giá; dòng đếm trên thanh công cụ và chân bảng ghi «33 / 33 căn», khớp 33 hàng dung-d in cho dau-chu-1. Không có khung đang tải/skeleton. LƯU Ý: góc trái dưới ảnh có huy hiệu Next dev «1 Issue», khớp với một ngoại lệ console «Hydration failed because the server rendered HTML didn't match the client» thu ở khổ 1440 (ghi trong E3-network.txt). Expected của E3 không đòi 0 lỗi console, nhưng đây là dấu hiệu hydration vẫn còn lệch ở bản dev khổ máy tính, nên đáng người xem lại. E3-dien-thoai.png (375x812, sau tải lại): tiêu đề Bảng hàng, «19 căn», nhóm «Toà B · 11 căn» với thẻ căn B-03.04, B-15.05, B-13.02, B-14.06, B-15.01… (đếm DOM [data-the-can] = 11), mỗi thẻ có giá, diện tích, phòng ngủ, hướng; ảnh là ô giữ chỗ biểu tượng ảnh (ảnh chưa có), không có khung/skeleton đang tải. Điện thoại không có dòng «x / y căn» kiểu máy tính.
  network_observed: clean
  output: |
    Máy tính sau tải lại: dòng đếm «33 / 33 căn» khớp 33 hàng; không skeleton, không chữ «Đang tải».
    Điện thoại sau tải lại: 11 thẻ căn, không skeleton, không «Đang tải».
    Máy chủ dev đã tắt sau khi đo.
    Frame: evidence/E3-may-tinh.png ; evidence/E3-dien-thoai.png ; mạng/console: evidence/E3-network.txt.

- eval: E4
  run_id: minted-va-bang-hang-hydration-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-07T22:18:30Z
  output: |
    npm run typecheck hoàn tất, không lỗi kiểu.

- eval: E5
  run_id: minted-va-bang-hang-hydration-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-07T22:18:30Z
  output: |
    chuẩn giao diện: đạt

- eval: E6
  run_id: minted-va-bang-hang-hydration-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T22:18:30Z
  output: |
    ℹ duration_ms 3818.482667

- eval: E7
  run_id: minted-va-bang-hang-hydration-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T22:18:30Z
  output: |
    2 tệp giao diện ngoài bản đồ

- eval: E8
  run_id: minted-va-bang-hang-hydration-E8-r1
  exit_code: 2
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-07T22:18:30Z
  output: |
    design-floor S4: hex thô apps/web/src/app/(app)/inventory/cards/bang-the.tsx:119 #185

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-07T22:18:30Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T22:18:30Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T22:18:30Z

- cmd: npm run test:hooks
  run_id: minted-va-bang-hang-hydration-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T22:18:30Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T22:18:30Z

## Known limits

- E2 (AC-2) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: node _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs --sha a5682245

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh cả trên bản cũ lẫn bản mới, chứng minh harness chứ không chứng minh tính năng; là regression-guard có chủ ý):
- E4: npm run typecheck
- E5: npm run lint
- E6: npm test -w @quy-hang/web
- E7: design-floor-khuon --kiem

Baseline không đo:
- node _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs: bo qua baseline: tep _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs co o cay dang kiem nhung chua co o merge-base a56822457e764c421f5c2bc58bf0949e35f56c8f — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs --sha a5682245: bo qua baseline: tep _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs co o cay dang kiem nhung chua co o merge-base a56822457e764c421f5c2bc58bf0949e35f56c8f — eval moi, chay tren code cu khong phan biet gi

Ghi chú cho người xem: E3 ghi nhận một ngoại lệ console hydration ở khổ máy tính trên bản dev, trong khi E1 đo 0 lỗi hydration ở cả 6 ca; nên đối chiếu hai kết quả này ở Cổng 2.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, deterministic)

## Iterations

Round 1: E8 failed — design-floor S4 phát hiện mã màu thô #185 ở apps/web/src/app/(app)/inventory/cards/bang-the.tsx dòng 119. Returned to implementation.
