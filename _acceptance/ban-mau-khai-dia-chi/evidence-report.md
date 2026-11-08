---
schema_version: 2
feature_slug: ban-mau-khai-dia-chi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7808552d29eaede23f7facd9a2918bed7c8ea229
human_signoff:
---

# Evidence Report: ban-mau-khai-dia-chi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | ui-check | PASS (carry-forward tu round 1) |
| E2 | AC-2 | ui-check | PASS (carry-forward tu round 1) |
| E3 | AC-3 | test | PASS (carry-forward tu round 1) |
| E4 | AC-4 | test | PASS (carry-forward tu round 1) |
| E5 | AC-5 | test | PASS (carry-forward tu round 1) |
| E5b | AC-5 | script | PASS |
| E5c | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS (carry-forward tu round 1) |
| E7 | AC-7 | test | PASS (carry-forward tu round 1) |
| E8 | AC-8 | test | PASS (carry-forward tu round 1) |
| E9 | AC-9 | test | PASS (carry-forward tu round 1) |
| E9b | AC-9 | script | PASS |
| E10 | AC-6 | script | PASS (carry-forward tu round 1) |

## Evidence

- eval: E5b
  run_id: minted-ban-mau-khai-dia-chi-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs
  verified_at: 2026-11-08T17:05:56Z
  output: |
    không còn nhaMau (đối chứng dương: có diaChiMau)

- eval: E5c
  run_id: minted-ban-mau-khai-dia-chi-E5c-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs
  verified_at: 2026-11-08T17:05:56Z
  output: |
    chiều đỏ ĐẠT: còn nhaMau thì mã 1, nêu tệp

- eval: E9b
  run_id: minted-ban-mau-khai-dia-chi-E9b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/ban-mau-khai-dia-chi/thu/kiem-cau-hinh-khong-doi.mjs
  verified_at: 2026-11-08T17:05:56Z
  output: |
    cấu hình nghiệm thu không đổi so với ee7b811e

### Eval mang tu round 1 (carry-forward)

- eval: E1
  run_id: minted-ban-mau-khai-dia-chi-E1-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/ban-mau-may-tinh-that.png
  observed: |
    E1-step2/ban-mau-may-tinh-that.png (/inventory, 1440x900 sang): thanh tren [Mau] San thu + o tim + +Lead + chuong + DA; cot bieu tuong 3 icon, icon Bang hang (o giua) dang sang; cot hai co "Goc nhin cua doi: Chua co goc nhin", "Goc nhin cua toi: Chua co goc nhin", "Luu goc nhin", "Do tuoi: Chua co so"; bang hang 1 can A-01.01. E1-step3/ban-mau-may-tinh-mau.png (/proto/nhanh-tuc-thi): cung thanh tren, cung icon Bang hang sang, cot hai y het; noi dung chinh la "Trang thu dong bo" (Toa A A-01.01, gia, trang thai). Khop Expected. E1-step4.png (/today?nhom=new_lead) la man that /today, cot hai co 6 muc, "Lead moi" sang. E1-step5.png (/mau/he-bo-cuc): trang mau song co khung xem nhung ben trong co thanh tren, icon Bang hang sang, cot hai "Goc nhin cua doi/toi" - khop Expected (nha sang va co cot hai). Chu y: o 2 anh dau 1 huy hieu loi dev "1 Issue" (Next dev overlay) khong anh huong.
  network_observed: clean

- eval: E2
  run_id: minted-ban-mau-khai-dia-chi-E2-r1
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/ban-mau-dien-thoai-that.png
  observed: |
    Đã mở bằng Read cả hai ảnh ban-mau-dien-thoai-that.png và ban-mau-dien-thoai-mau.png; E2-step1.png và E2-step2.png được chụp ngay sau từng ảnh đó, cùng nội dung, không mở lại.
    - ban-mau-dien-thoai-that.png: đầu màn ghi "Bảng hàng" kèm các biểu tượng tìm, cộng, đồng bộ, chuông. Nội dung có "1 căn", nút Lọc và Chọn, nhóm "TOÀ A" và căn A-01.01 giá 3,5 tỷ. Tab dưới có ba mục Hôm nay, Bảng hàng, Tôi; "Bảng hàng" đậm và sáng, đúng một tab sáng. Không có chữ "Quỹ hàng".
    - ban-mau-dien-thoai-mau.png: đầu màn ghi "Bảng hàng" giống hệt, cùng các biểu tượng. Nội dung là "Trang thử đồng bộ" với căn Toà A · A-01.01, giá 3.500.000.000. Tab dưới "Bảng hàng" sáng, cùng vị trí và cùng cách hiện như ảnh thật. Không có chữ "Quỹ hàng".
    Kết luận: khớp Expected, hai đường cùng tiêu đề «Bảng hàng», cùng một tab sáng, không đường nào hiện «Quỹ hàng».
    Ghi chú ngoài phạm vi: huy hiệu "N" tròn đen ở góc dưới trái là nút dev overlay của Next, đè lên tab "Hôm nay".
  network_observed: unscoped-partial

- eval: E3
  run_id: minted-ban-mau-khai-dia-chi-E3-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-ban-mau-khai-dia-chi-E4-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-ban-mau-khai-dia-chi-E5-r1
  exit_code: 0
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-ban-mau-khai-dia-chi-E6-r1
  exit_code: 0
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-ban-mau-khai-dia-chi-E7-r1
  exit_code: 0
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-ban-mau-khai-dia-chi-E8-r1
  exit_code: 0
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-ban-mau-khai-dia-chi-E9-r1
  exit_code: 0
  verifier: config:executors.script.lint
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-ban-mau-khai-dia-chi-E10-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T16:43:04Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ban-mau-khai-dia-chi-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T17:05:56Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-ban-mau-khai-dia-chi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T17:05:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ban-mau-khai-dia-chi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T17:05:56Z

- cmd: npm run test:hooks
  run_id: minted-ban-mau-khai-dia-chi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T17:05:56Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ban-mau-khai-dia-chi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-08T17:05:56Z

- cmd: npm run typecheck
  run_id: minted-ban-mau-khai-dia-chi-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T17:05:56Z

- cmd: npm run lint
  run_id: minted-ban-mau-khai-dia-chi-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T17:05:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- node _acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs: bo qua baseline: tep _acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs co o cay dang kiem nhung chua co o merge-base ee7b811e4c33b0c5c72a43a4fff5f37dd756a712 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs --chieu-do: bo qua baseline: tep _acceptance/ban-mau-khai-dia-chi/thu/kiem-khong-con-nhamau.mjs co o cay dang kiem nhung chua co o merge-base ee7b811e4c33b0c5c72a43a4fff5f37dd756a712 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/ban-mau-khai-dia-chi/thu/kiem-cau-hinh-khong-doi.mjs: bo qua baseline: tep _acceptance/ban-mau-khai-dia-chi/thu/kiem-cau-hinh-khong-doi.mjs co o cay dang kiem nhung chua co o merge-base ee7b811e4c33b0c5c72a43a4fff5f37dd756a712 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm đầu PASS, máy thông (T2 xanh-sạch); E1-E10 chạy và có run_id r1 trong run-log.
Round 2: thêm E5b, E5c, E9b (thước tự kiểm nhaMau có chiều đỏ, cấu hình nghiệm thu không đổi) và chạy lại các lệnh suite; E1-E10 mang từ round 1 vì delta không chạm paths của chúng. Toàn bộ PASS.
