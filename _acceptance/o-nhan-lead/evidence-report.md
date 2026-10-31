---
schema_version: 2
feature_slug: o-nhan-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 69ae270fe5ec56e7ff0526c3aad91873832eb7e3
human_signoff: Manh Phan 2026-10-31
---

# Evidence Report: o-nhan-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-o-nhan-lead-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-o-nhan-lead-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-o-nhan-lead-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-o-nhan-lead-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-o-nhan-lead-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-o-nhan-lead-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-o-nhan-lead-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-o-nhan-lead-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-o-nhan-lead-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-o-nhan-lead-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: E10-verify-20261031-2240
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T15:32:24Z
  screenshot: evidence/E10-step2.png
  observed: |
    Tất cả frame đã mở bằng Read, khổ 1440x900. Frame 1, E10-trong.png (và E10-step2.png): địa chỉ /leads/new, thẻ «Ô nhận lead». Năm nhãn đúng thứ tự: Số chủ nhà, Căn hoặc toà (kèm ô chọn Toà), Nhu cầu, Giá (chip Bao phí / Không bao phí nằm cạnh ô giá), Thời gian muốn ra hàng. Nút gửi ghi «Gửi lead». Không có Alert kết quả.
    Frame 2, E10-thieu.png: gửi khi trống thì mỗi ô bắt buộc có chữ đỏ ngay dưới: «Cần số điện thoại Việt Nam 10 chữ số», «Cần căn hoặc toà», «Chọn nhu cầu», «Cần giá (đồng)», «Chọn thời gian muốn ra hàng». Không có Alert kết quả.
    Frame 3, E10-step4a.png: giá 3.200.000.000 và Bao phí được chọn thì dòng dưới giá ghi «Hiểu là: 3,2 tỷ, đã bao phí».
    Frame 4, E10-step4b.png: đổi sang Không bao phí thì dòng ghi «Hiểu là: 3,2 tỷ, chưa bao phí».
    Frame 5, E10-step5a.png: mã Z-99.99 rồi rời ô thì dưới ô báo «Mã căn chưa có trong danh mục — chọn toà».
    Frame 6, E10-step5b.png: chọn «Toà A» thì ô Toà hiện «Toà A», lỗi «Cần căn hoặc toà» biến mất.
    Frame 7, E10-dang-gui.png (và E10-step6.png): Slow 3G, nút đổi thành «Đang kiểm trùng…», nền đen, các ô mờ (khoá). DOM đo được: disabled=true. Làm chậm đã tắt (health 9ms).
    Frame 8, E10-khong-trung.png: Alert «Không trùng — lead chờ chia theo luật của sàn», không có nút «Bỏ lead này». Năm ô rỗng (số chủ, căn, giá rỗng; Toà về placeholder; không chip nào bật), không còn dòng «Hiểu là». document.activeElement là input#so-chu (ô Số chủ nhà), thấy vòng tiêu điểm quanh ô số chủ.
    Frame 9, E10-co-dau-chu.png: Alert «Chủ nhà đã có đầu chủ [Mẫu] Đầu chủ 2 — lead đã về [Mẫu] Đầu chủ 2», không có nút «Bỏ lead này»; khớp bộ mẫu (CN-01 thuộc dau-chu-2). Số chủ rỗng, tiêu điểm ở so-chu.
    Frame 10, E10-can-trung.png: Alert «Căn A-02.06 đã có hàng mở của [Mẫu] Đầu chủ 1 — lead thành tin bổ sung cho [Mẫu] Đầu chủ 1», có nút «Bỏ lead này» (đúng 1); khớp bộ mẫu (H-04 căn A-02.06 thuộc dau-chu-1).
    Frame 11, E10-step9b-hoi-lai.png: hộp hỏi lại (alertdialog) «Bỏ lead này? Lead không còn là tin bổ sung cho đầu chủ. Lần bỏ được ghi lại.» với hai nút «Giữ lại» và «Bỏ lead».
    Frame 12, E10-da-bo.png: sau xác nhận, Alert «Đã bỏ lead này — có ghi lại», nút «Bỏ lead này» biến mất, hộp thoại đóng.
    Frame 13, E10-loi.png (và E10-step10.png): POST /api/v1/leads bị chặn thì Alert đỏ «Chưa gửi được — kiểm mạng rồi gửi lại / Chữ đã gõ vẫn còn trong các ô.». Năm ô còn nguyên giá trị: 0900 000 084, B-07.05 + Toà B, Bán, 3.200.000.000 + Bao phí (dòng «Hiểu là: 3,2 tỷ, đã bao phí»), Ngay. Nút trở lại «Gửi lead». Đối chiếu với Frame 8: sau thành công năm ô rỗng, sau lỗi mạng năm ô giữ nguyên. Không Alert nào ở mười frame hiện số chủ nhà.
    Mọi mục Expected khớp, không mâu thuẫn.
  network_observed: unscoped-partial

- eval: E11
  run_id: minted-o-nhan-lead-E11-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-31T15:32:24Z
  output: |
    chuẩn tầng thiết kế S4 chạy trên cây hiện tại, không mã màu thô trên tệp giao diện vòng chạm

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-10-31T15:32:24Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-10-31T15:32:24Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-10-31T15:32:24Z

- cmd: npm run test:hooks
  run_id: minted-o-nhan-lead-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-10-31T15:32:24Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-10-31T15:32:24Z

- cmd: npm run typecheck
  run_id: minted-o-nhan-lead-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-10-31T15:32:24Z

- cmd: npm run lint
  run_id: minted-o-nhan-lead-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-10-31T15:32:24Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval khong-phan-biet (pass tren ca HEAD lan baseline — chung minh harness, can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):

- npm test -w @quy-hang/core: E1, E2, E7
- npm run db:migrate && npm run db:test: E3, E4, E5, E6, E7b, E8, E9
- node design-floor-s4.mjs --root . (tim kit qua packages/ui-lint/tim-kit.mjs): E11

Lenh suite xanh-ca-hai-phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bộ eval E1-E11 chạy lần đầu; theo commit 719e81c, vòng 1 sửa tiêu điểm sau gửi, bản đồ khuôn chụp cây có nhóm mới và gửi chờ tra mã.
Round 2: theo commit 69ae270, vòng 2 sửa khoá gửi từ lúc bấm, kể cả khi đang tra mã căn.
Round 3: E10 (ui-check), E11 và bảy lệnh suite chạy lại trên commit 69ae270; E1-E9 mang từ round 1 vì delta không chạm paths của eval; verified_at của round 3 suy từ mã chạy E10 (22:40 giờ địa phương, UTC+7), vì kết quả máy không kèm mốc giờ. Tất cả xanh, verdict PASS.

