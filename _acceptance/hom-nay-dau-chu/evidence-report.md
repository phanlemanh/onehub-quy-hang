---
schema_version: 2
feature_slug: hom-nay-dau-chu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 80178ad2610ca8188b26e1ff16c123035d0a5a68
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: hom-nay-dau-chu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward r1) |
| E2 | AC-2 | test | PASS (carry-forward r1) |
| E3 | AC-3 | test | PASS (carry-forward r1) |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS (carry-forward r1) |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS (carry-forward r1) |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | ui-check | PASS (carry-forward r1) |
| E9 | AC-9 | ui-check | PASS (carry-forward r1) |
| E10 | AC-10 | ui-check | PASS (carry-forward r1) |
| E11 | AC-11 | script | PASS (carry-forward r1) |
| E11b | AC-11 | test | PASS (carry-forward r1) |

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval KHONG-PHAN-BIET (pass ca tren HEAD lan baseline; chung minh harness, can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- `npm test -w @quy-hang/core` (E1, E2, E3, E4)
- `npm test -w @quy-hang/web` (E5b)
- `npm run lint` (E11)
- `npm test -w @quy-hang/ui-lint` (E11b)

Baseline round nay khong do: field baseline cua tung block eval ghi n-a.

## Evidence

- eval: E3b
  run_id: minted-hom-nay-dau-chu-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:37:09Z
  output: |
    npm run db:migrate && npm run db:test
    ca «settings/queue: đọc bộ của sàn» ok
    ℹ duration_ms 22889.7825

- eval: E4b
  run_id: minted-hom-nay-dau-chu-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:37:09Z
  output: |
    npm run db:migrate && npm run db:test
    ca «settings/queue: ghi bộ nhóm» ok
    ℹ duration_ms 22889.7825

- eval: E5
  run_id: minted-hom-nay-dau-chu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:37:09Z
  output: |
    npm run db:migrate && npm run db:test
    ca «listings: người giữ và mốc đổi» ok
    ℹ duration_ms 22889.7825

- eval: E6
  run_id: minted-hom-nay-dau-chu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:37:09Z
  output: |
    npm run db:migrate && npm run db:test
    ca «leads/assigned: chỉ lead giao cho tôi đang chờ gọi» ok
    ℹ duration_ms 22889.7825

- eval: E7
  run_id: minted-hom-nay-dau-chu-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:37:09Z
  screenshot: evidence/E7-1440.png
  observed: |
    E7-1440.png (dau-chu-1, 1440x900): khung «Hôm nay · 13 việc», nhóm theo thứ tự Lead mới (4) với bốn dòng B-02.01, B-02.03, Toà B chỉ biết toà (Đã gửi, nút Nhận/Đã gọi/Trả lại) và A-02.02 (Đã nhận), giá «3,1 tỷ, chưa bao phí»; Nên gọi điều chỉnh giá (2) A-01.01 «Giá giữ 12 ngày · 3,25 tỷ · Bao phí», B-01.01 «Giá giữ 11 ngày · 4,60 tỷ · Bao phí»; Cần gọi lại (3) B-01.02 «Chưa xác nhận 20 ngày», A-01.03 «Chưa từng xác nhận · Chưa có giá», A-01.02 «Chưa xác nhận 16 ngày»; tiêu đề nhóm Thiếu thông tin (2) lộ ở mép dưới, các dòng Thiếu/Mới đổi xác nhận qua innerText. E7-telesales.png: chỉ khung «Lead đã nhập» 5 dòng, cột Lead/Nấc/Giờ · đầu chủ. E7-truong-nhom.png: khung «Hôm nay» với trạng thái trống «Màn này đang dựng». E7-bo-san.png: «Hôm nay · 11 việc», Lead mới, Nên gọi điều chỉnh giá, Mới đổi (B-01.04 «3,10 → 2,95 tỷ — Trưởng nhóm, hôm qua», A-01.05 «Đang bán → Đang giao dịch — Trưởng nhóm, hôm nay»), rồi «Gọi xác nhận» (3, B-01.02…), không có Thiếu thông tin. E7-hai-vai.png: «Hôm nay · 2 việc» (Lead mới 1: B-02.04 Cho thuê; Nên gọi điều chỉnh giá 1: A-02.04 «Giá giữ 18 ngày · 2,90 tỷ · Bao phí») ở trên, vùng «Lead đã nhập» 1 dòng B-02.04 ở dưới. Tất cả khớp Expected.
  network_observed: clean

- eval: E1
  run_id: minted-hom-nay-dau-chu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-hom-nay-dau-chu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-hom-nay-dau-chu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-hom-nay-dau-chu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-hom-nay-dau-chu-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-hom-nay-dau-chu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png: màn Hôm nay của dau-chu-1, 13 việc, 5 nhóm (Lead mới 4, Nên gọi điều chỉnh giá 2, Cần gọi lại 3, Thiếu thông tin 2, Mới đổi 2); B-01.02 là dòng đầu nhóm Cần gọi lại. E8-sau-bam.png: sau bấm còn 12 việc, Cần gọi lại = 2, không còn dòng B-01.02, chỉ báo «Đã đồng bộ · 22:31»; khớp Expected (rời nhóm ngay, giảm 1). E8-step4-offline.png: chỉ báo «Mất mạng · 1 thay đổi chờ gửi», Nên gọi điều chỉnh giá = 1 (chỉ còn B-01.01), A-01.01 đã rời nhóm, 11 việc; khớp Expected. E8-ho-so.png: cột hồ sơ bên phải mở đúng căn A-01.04 (đầu cột «A-01.04 · Đang bán», 4,85 tỷ, Toà A, thiếu Nội thất 4/5) cạnh danh sách Hôm nay 11 việc; khớp C3. Số sự kiện owner_confirmed đọc từ API: C1 0 lên 1 với lastConfirmedAt mới, C2 0 lên 1 sau khi có mạng lại.
  network_observed: clean
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: E9-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  screenshot: evidence/E9-step1.jpg
  observed: |
    E9-step1.jpg: Lead mới 4 dòng, B-02.01 (L1) hiện nhãn «Đã nhận» chỉ còn nút Đã gọi / Trả lại, A-02.02 và dòng chỉ biết toà cũng Đã nhận, B-02.03 còn Đã gửi. E9-step2.jpg: Lead mới 3, đầu trang 12 việc; dòng A-02.02 không còn. E9-sau.jpg: Lead mới 2, 11 việc; chỉ còn B-02.01 (Đã nhận) và B-02.03 (Đã gửi), L3 đã rời. E9-409.jpg: dòng B-02.03 còn nguyên với Nhận/Đã gọi/Trả lại, chữ đỏ «Lead đã trả lại rồi.» bên dưới, số đếm giữ 2 / 11 việc. Khớp Expected.
  network_observed: clean
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: E10-hom-nay-dau-chu-2026-11-01
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  screenshot: evidence/E10-step1.png
  observed: |
    E10-trong.png: màn Hôm nay tối, «Hôm nay · 0 việc», icon hộp thư, «Hôm nay không còn việc», nút «Mở Bảng hàng»; khớp. E10-dang-tai.png: chỉ tiêu đề và 3 khối skeleton dạng nhóm, không có chữ dữ liệu; khớp. E10-loi.png: «9 việc», dải «Hàng đợi chia theo bộ nhóm lưu lúc 22:18 01/11 / Chưa tải được bộ nhóm mới của sàn.», khung đỏ «Chưa tải được lead giao cho bạn», nút «Thử lại», các nhóm căn vẫn hiện. E10-step4.png: sau «Thử lại» nhóm «Lead mới 4» hiện lại, 13 việc. E10-mat-mang.png: chip «Mất mạng · đang xem bản trên máy», 7 việc, dải «bộ nhóm lưu lúc 22:19 01/11», không có Thiếu thông tin. E10-375.png: một cột, 13 việc, thanh tab dưới, không tràn ngang.
  network_observed: n-a (driver)
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-hom-nay-dau-chu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11b
  run_id: minted-hom-nay-dau-chu-E11b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T15:13:20Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T15:37:09Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-01T15:37:09Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T15:37:09Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-dau-chu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T15:37:09Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-01T15:37:09Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-dau-chu-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-01T15:37:09Z

- cmd: npm run lint
  run_id: minted-hom-nay-dau-chu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-01T15:37:09Z

## Known limits

## Ngoài hợp đồng

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: toàn bộ eval E1–E11b chạy lần đầu (run_id hậu tố r1).
Round 2: chạy lại E3b, E4b, E5, E6, E7 và các lệnh suite sau commit 7cf053e (bộ test cơ sở dữ liệu chạy tuần tự từng tệp); các eval còn lại carry-forward từ round 1 vì delta không chạm paths của chúng. Không có eval nào cần người quyết; không có judgment item.

### Re-pin lần 1 — 2026-11-01, do gộp nhánh chính sau lượt chấm 2, trước chữ ký
run_id: repin-20261101T220753Z-18631
sha: e5e2512eedaf2179dfe7b5151ea8a088d10d7bbb · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E7, E8, E9, E10 · AC không có chốt máy: AC-7, AC-8, AC-9, AC-10

### Re-pin lần 2 — 2026-11-01, do gộp nhánh chính lần ba trước khi gộp PR #70
run_id: repin-20261101T221550Z-60449
sha: 3ab66286dec1f581aea57fc8d23b402e92091802 · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E7, E8, E9, E10 · AC không có chốt máy: AC-7, AC-8, AC-9, AC-10

### Re-pin lần 3 — 2026-11-02, do gộp nhánh chính lần bốn trước khi gộp PR #70
run_id: repin-20261102T015211Z-10291
sha: 80178ad2610ca8188b26e1ff16c123035d0a5a68 · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · ngoài làn máy: E7, E8, E9, E10 · AC không có chốt máy: AC-7, AC-8, AC-9, AC-10
