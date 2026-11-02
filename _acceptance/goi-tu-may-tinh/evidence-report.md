---
schema_version: 2
feature_slug: goi-tu-may-tinh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a8cec05b68ce8ca09e9be028a9c56234eed81d01
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: goi-tu-may-tinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-5 | ui-check | PASS |
| E9 | AC-6 | ui-check | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-tu-may-tinh-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:45:42Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 38726.441958

- eval: E2
  run_id: minted-goi-tu-may-tinh-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:45:42Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 38726.441958

- eval: E4
  run_id: minted-goi-tu-may-tinh-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:45:42Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 38726.441958

- eval: E5
  run_id: minted-goi-tu-may-tinh-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:45:42Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 38726.441958

- eval: E10
  run_id: minted-goi-tu-may-tinh-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:45:42Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 38726.441958

- eval: E7
  run_id: minted-goi-tu-may-tinh-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T15:45:42Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 1258.437583

- eval: E8
  run_id: minted-goi-tu-may-tinh-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T15:45:42Z
  screenshot: evidence/E8-1-nut.png
  observed: |
    E8-1-nut.png: call mode, card for A-09.05 Toa A with 'Da goi G' and, in a card below, button 'Quay so tren dien thoai'; no message. Matches khung 1. E8-2-chua-co.png: same button with grey text beneath 'Chua co dien thoai nao bat thong bao lead — tren dien thoai mo Hom nay, bam Bat thong bao'. Matches khung 2. E8-3-da-gui.png: button now 'Gui lai' with grey text 'Da gui toi 1 thiet bi khac — cham thong bao tren dien thoai de goi'; stage label unchanged ('Da nhan' in DOM, never 'Da goi' as stage). Matches khung 3. E8-4-mat-mang.png: button 'Quay so tren dien thoai' enabled with red text 'Mat mang — chua gui duoc, thu lai khi co mang' below. Matches khung 4. E8-5-dang-gui.png: button visibly greyed/disabled (DOM disabled=true) during Slow 3G send, old red offline line still shown. Matches khung 5 (button locked while sending).
  network_observed: clean

- eval: E9
  run_id: minted-goi-tu-may-tinh-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T15:45:42Z
  screenshot: evidence/E9-1-trang.png
  observed: |
    E9-1-trang.png (375 rộng): header «Căn call», thẻ có «Toà A · Bán» và nút sáng «Gọi chủ nhà» rộng hết thẻ; thanh dưới Hôm nay/Bảng hàng/Tôi — đúng Expected. E9-2-da-mo.png: cùng thẻ, «Toà A · Bán», số lớn «0900 000 033» theo nhóm chữ số, nút rộng «Gọi» (href tel:0900000033); trang không tự nhảy sang tel mà cần chạm «Gọi» (đích tel ghi nhận: tel:0900000033). E9-3-tai-lai.png: lại «Toà A · Bán» + «Gọi chủ nhà», không số. E9-4-khong-thay.png: ô «Không thấy lead này trong việc của bạn» + nút «Về Hôm nay». E9-4b-nguoi-khac.png: giống khung 4, không có tên toà hay nút gọi. E9-4b-truong-nhom.png: trang «Không thấy trang này — Địa chỉ không còn, hoặc bạn không có quyền xem.» + «Về Hôm nay», thanh dưới có thêm «Gửi», không có «Gọi chủ nhà». E9-5-mat-mang.png: nút «Gọi chủ nhà» còn bấm được, dưới nút dòng chữ đỏ «Mất mạng — chưa mở được số, thử lại khi có mạng.» Kho trên máy: 0 lần số ở bốn dạng. Tất cả khớp Expected; điểm lệch nhỏ: trang chỉ hiện liên kết tel, không tự điều hướng.
  network_observed: clean

- eval: E3
  run_id: minted-goi-tu-may-tinh-E3-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-02T15:35:00Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-goi-tu-may-tinh-E6-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-02T15:35:00Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-goi-tu-may-tinh-E11-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-02T15:35:00Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-goi-tu-may-tinh-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-02T15:45:42Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-goi-tu-may-tinh-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T15:45:42Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-goi-tu-may-tinh-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T15:45:42Z

- cmd: npm run test:hooks
  run_id: minted-goi-tu-may-tinh-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T15:45:42Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-goi-tu-may-tinh-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-02T15:45:42Z

- cmd: npm run typecheck
  run_id: minted-goi-tu-may-tinh-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T15:45:42Z

- cmd: npm run lint
  run_id: minted-goi-tu-may-tinh-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-02T15:45:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval khong-phan-biet (pass tren ca HEAD lan baseline, theo ket qua round 1):
- npm run db:migrate && npm run db:test: E1, E2, E4, E5, E10
- npm test -w @quy-hang/core: E3
- npm test -w @quy-hang/web: E6, E7, E11

Moi muc tren nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8 failed — khung 2 không dựng được vì tài khoản mẫu đã có 4 thiết bị đăng ký từ trước (tiền đề «chưa có đăng ký» không đạt), và bài ui-lint ban-do-khuon lệch số so với bản đồ khuôn. Returned to implementation.
Round 2: mọi eval đạt — E1, E2, E4, E5, E10, E7, E8, E9 chạy lại; E3, E6, E11 mang từ round 1 vì delta không chạm paths của chúng.

### Re-pin lần 1 — 2026-11-02, do gộp nhánh chính trước PR
run_id: repin-20261102T155751Z-52496
sha: 73e082b35a52c405a2bdc8511f0eabcbf7464edf · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E8, E9

### Re-pin lần 2 — 2026-11-02, do gộp nhánh chính lần hai trước gộp PR
run_id: repin-20261102T161423Z-54351
sha: a8cec05b68ce8ca09e9be028a9c56234eed81d01 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E8, E9
