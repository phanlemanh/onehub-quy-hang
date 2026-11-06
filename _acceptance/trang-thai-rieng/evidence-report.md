---
schema_version: 2
feature_slug: trang-thai-rieng
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 50f5cf426d29478ff176e1bef182ceb288fd4905
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: trang-thai-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E3d | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-7 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | PASS |
| E12 | AC-3 | ui-check | PASS |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-1 | script | PASS (đạt có giới hạn) |
| E14b | AC-1 | script | PASS |
| E15 | AC-7 | ui-check | PASS |

## Evidence

Round 5 chạy lại các eval dưới đây; các eval còn lại là carry-forward từ round 4.

- eval: E1
  run_id: minted-trang-thai-rieng-E1-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T04:19:38Z
  output: |
    ℹ duration_ms 124993.665542

- eval: E3
  run_id: minted-trang-thai-rieng-E3-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T04:19:38Z
  output: |
    ℹ duration_ms 124993.665542

- eval: E8
  run_id: minted-trang-thai-rieng-E8-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T04:19:38Z
  output: |
    ℹ duration_ms 124993.665542

- eval: E3d
  run_id: minted-trang-thai-rieng-E3d-r5
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T04:19:38Z
  output: |
    ℹ duration_ms 124993.665542

- eval: E3b
  run_id: minted-trang-thai-rieng-E3b-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T04:19:38Z
  output: |
    ℹ duration_ms 904.946166

- eval: E3c
  run_id: minted-trang-thai-rieng-E3c-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:19:38Z
  output: |
    ℹ duration_ms 2577.954583

- eval: E8b
  run_id: minted-trang-thai-rieng-E8b-r5
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:19:38Z
  output: |
    ℹ duration_ms 2577.954583

- eval: E14
  run_id: minted-trang-thai-rieng-E14-r5
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T04:19:38Z
  output: |
    16 tệp giao diện ngoài bản đồ

- eval: E14b
  run_id: minted-trang-thai-rieng-E14b-r5
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs
  verified_at: 2026-11-06T04:19:38Z
  output: |
    E14b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/statuses/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E11
  run_id: minted-trang-thai-rieng-E11-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:19:38Z
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png (1440): Frame with the settings column on the left, «Trạng thái» highlighted under «SÀN [MẪU] SÀN THỬ». Breadcrumb «Cài đặt › Sàn [Mẫu] Sàn thử › Trạng thái». Six groups each with a colored badge (Chưa đủ để rao yellow, Đang bán green, Đang giao dịch purple, Đã bán grey, Tạm ngừng yellow/orange, Ngừng hẳn red), each with the standard-state note and a «Thêm nhãn» button, and a «Lưu» button at the bottom. Matches Expected.
    E11-step2.png: «Giữ chỗ» entered under Đang giao dịch (row «Nhãn riêng», «0 căn đang mang»). A card «Đã lưu trạng thái» appears at the bottom edge of the viewport, partly cut off but readable. Reload confirmed the label persists. Matches Expected.
    E11-step3.png: under Tạm ngừng a new row «Nhãn mới / Chưa lưu» with «Đang bán» typed; the input has a red border and the red message «Trùng tên trạng thái «Đang bán»». Lưu is disabled (confirmed in DOM). Matches Expected.
    E11-step4.png (375): single column, breadcrumb «Sàn [Mẫu] Sàn thử», heading «Trạng thái», badges and «Thêm nhãn» buttons fit the width, «Giữ chỗ» input visible, bottom tab bar «Cài đặt sàn / Tôi». No horizontal scroll (scrollWidth 375). Matches Expected.
  network_observed: clean

- eval: E12
  run_id: minted-trang-thai-rieng-E12-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:19:38Z
  screenshot: evidence/E12-step1.png
  observed: |
    step1.png (1440): bảng hàng, hàng A-10.05 đang chọn ô Trạng thái «Đang bán» (xanh lục); popover bên dưới ô có các nút theo thứ tự «Đang giao dịch» (đang chọn viền), «Giữ chỗ», «Đã bán» ở hàng 1, «Tạm ngừng», «Ngừng hẳn» ở hàng 2, dòng chú «Tính là vừa xác nhận với chủ nhà». «Giữ chỗ» ngay sau «Đang giao dịch». Đầu hồ sơ bên phải: A-10.05 «Đang bán».
    step2.png (1440): ô A-10.05 hiện huy hiệu «Giữ chỗ» màu tím nhạt, cùng màu với «Đang giao dịch» của A-04.06 ngay trên và các hàng khác. Hồ sơ bên phải: «Đang giao dịch», Xác nhận hôm nay.
    step3.png (1440): hàng lọc Trạng thái = «Đang giao dịch», đếm 12/36 căn, nút Lọc có số 1. Trong kết quả có A-10.05 với huy hiệu «Giữ chỗ» (hàng 8, Toà A) lẫn A-13.01, A-08.03, A-11.02, A-13.03, A-06.03, A-15.04, A-04.06, B-10.01 (Đang giao dịch).
    step4.png (375): danh sách thẻ căn dạng điện thoại; thẻ A-10.05, giá 6,97 tỷ, có nhãn «Giữ chỗ» tím trên ảnh bìa, nằm giữa các thẻ «Đang giao dịch» (A-04.06, A-15.04).
    step5.png (1440, trình duyệt mới, dau-chu-2): bảng 33/33 căn, «Đã đồng bộ · 11:24»; hàng 14 Toà A A-10.05 3PN, cột Trạng thái hiện «Giữ chỗ» huy hiệu tím, cạnh A-04.06 «Đang giao dịch» cùng màu. Khớp Expected.
  network_observed: clean

- eval: E13
  run_id: minted-trang-thai-rieng-E13-r5
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:19:38Z
  screenshot: evidence/E13-step1.png
  observed: |
    Frame step1 (đã mở): màn Cài đặt > Trạng thái của sàn «[Mẫu] Sàn thử» bị làm mờ, hộp thoại giữa màn «Gỡ nhãn «Giữ chỗ»?» với dòng «1 căn đang là «Giữ chỗ». Chuyển chúng sang:», một lựa chọn duy nhất «Đang giao dịch» (chưa chọn), nút «Giữ nhãn» và «Gỡ và chuyển». Khớp Expected (n=1, chỉ nhãn cùng nhóm, chỉ còn trạng thái chuẩn). Trước khi bấm gỡ, dòng Giữ chỗ trên màn hiện «1 căn đang mang», và API inUse = 1. Frame step2 (đã mở): sáu trạng thái chuẩn, nhóm «Đang giao dịch» chỉ còn nút «Thêm nhãn», không còn «Giữ chỗ»; dưới đáy có thẻ «Đã lưu trạng thái — Bảng hàng và Hôm nay dùng nhãn mới từ lần mở kế». Khớp Expected. Frame step3 (đã mở, đăng nhập dau-chu-1, /inventory, 1440): Bảng hàng 36/36 căn, cột Trạng thái chỉ có Đang giao dịch, Ngừng hẳn, Đã bán, Tạm ngừng; không chữ «Giữ chỗ» nào. Căn A-10.05 nằm dưới vùng cuộn nên chưa thấy trong ảnh; văn bản DOM cho thấy hàng A-10.05 đi kèm «Đang giao dịch». DB xác nhận A-10.05 Pending, status_label rỗng, và 0 căn còn nhãn giu_cho. Ghi chú: ảnh step3 chưa chứa hàng A-10.05, bằng chứng cho căn này là DOM text và DB.
  network_observed: clean

Carry-forward từ round 4 (delta không chạm paths của các eval này, round 5 không chạy lại).

- eval: E2
  run_id: minted-trang-thai-rieng-E2-r4
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-trang-thai-rieng-E2b-r4
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E2c
  run_id: minted-trang-thai-rieng-E2c-r4
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-trang-thai-rieng-E4-r4
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E4b
  run_id: minted-trang-thai-rieng-E4b-r4
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-trang-thai-rieng-E5-r4
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-trang-thai-rieng-E5b-r4
  exit_code: 0
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-trang-thai-rieng-E6-r4
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-trang-thai-rieng-E6b-r4
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E6c
  run_id: minted-trang-thai-rieng-E6c-r4
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-trang-thai-rieng-E7-r4
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-trang-thai-rieng-E7b-r4
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E7c
  run_id: minted-trang-thai-rieng-E7c-r4
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-trang-thai-rieng-E9-r4
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-trang-thai-rieng-E9b-r4
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-trang-thai-rieng-E10-r4
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-trang-thai-rieng-E10b-r4
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  output: |
    carry-forward tu round 4 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-trang-thai-rieng-E15-r4
  exit_code: 0
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:52:11Z
  carried_from_round: 4
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (1440): màn Hôm nay của dau-chu-1 ([Mẫu] Sàn thử, chip "Đã đồng bộ 11:15"). Cuối danh sách có nhóm «Mới đổi» (số 1) với dòng A-11.02 · Toà A, 2PN · 68,5 m², lý do «Đang bán → Giữ chỗ — Trưởng nhóm, hôm nay», giá 3,08 tỷ · Bao phí, nút «Còn · giữ giá». Phía trên là nhóm «Thiếu thông tin». Khớp Expected.
  network_observed: clean
  ghi chú: carry-forward tu round 4 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_api-r5
  exit_code: 0
  verified_at: 2026-11-06T04:19:38Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_connect-r5
  exit_code: 0
  verified_at: 2026-11-06T04:19:38Z

- cmd: npm run test:hooks
  run_id: minted-trang-thai-rieng-SUITE-test_hooks-r5
  exit_code: 0
  verified_at: 2026-11-06T04:19:38Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_ui_lint-r5
  exit_code: 0
  verified_at: 2026-11-06T04:19:38Z

- cmd: npm run typecheck
  run_id: minted-trang-thai-rieng-SUITE-typecheck-r5
  exit_code: 0
  verified_at: 2026-11-06T04:19:38Z

- cmd: npm run lint
  run_id: minted-trang-thai-rieng-SUITE-lint-r5
  exit_code: 0
  verified_at: 2026-11-06T04:19:38Z

## Known limits

- E14 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline; regression-guard hoặc cần viết lại để assert hành vi mới):
- npm test -w @quy-hang/core: E3b
- npm test -w @quy-hang/web: E3c, E8b

Baseline khong do:
- node _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs: bo qua baseline: tep _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs co o cay dang kiem nhung chua co o merge-base 656b377e772033231365e33a3f49fd977d74e228 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: E12 failed — đề dùng tài khoản quản trị (luật 046) nên bước người thứ hai không ra căn «Giữ chỗ»; sửa tài khoản của E12 và E13. Returned to implementation.
Round 5: all evals passed — E1, E3, E8, E3d, E3b, E3c, E8b, E14, E14b, E11, E12, E13 chạy lại; các eval còn lại carry-forward từ round 4.
