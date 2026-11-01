---
schema_version: 2
feature_slug: va-sua-tren-o
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b436159ab19f056dd8d2f8e6de398eaffe590752
human_signoff:
---

# Evidence Report: va-sua-tren-o

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-5 | test | PASS |
| E5 | AC-4 | ui-check | PASS |
| E5b | AC-5 | ui-check | PASS |
| E5c | AC-6 | ui-check | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-7 | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-sua-tren-o-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T05:28:51Z
  output: |
    ℹ duration_ms 124.118208

- eval: E2
  run_id: minted-va-sua-tren-o-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T05:28:51Z
  output: |
    ℹ duration_ms 176.692917

- eval: E3
  run_id: e3-va-sua-tren-o-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:28:51Z
  screenshot: evidence/E3-hieu-la.png
  observed: |
    E3-hieu-la.png: ô Giá mở ở hàng A-04.06 (Toà A, 3PN, Đang bán), ô gõ ghi «4,655 tỷ», hai nút Bao phí / Không bao phí, dòng «Hiểu là: 4,655 tỷ, bao phí» (phí hiện tại Không bao phí, nên bấm Bao phí). Khớp expected. E3-hoi-lai.png: hộp hỏi lại hiện «4,655 tỷ, Không bao phí → 4,655 tỷ, Bao phí», nhãn «Đổi điều kiện phí», dòng «Hiểu là: 4,655 tỷ, bao phí», nút Thôi / Đổi. Giá mới viết «4,655 tỷ», không có «4,66 tỷ». Khớp expected. E3-dien-san.png: nhấp đúp ô Giá lần hai, ô gõ điền sẵn «4,655 tỷ» (ô lưới hiển thị rút gọn «4,66 tỷ», phí Bao phí); thông báo cũ «Đã đổi giá A-04.06 / Tính là vừa xác nhận với chủ nhà / Hoàn tác» còn hiện. Khớp expected. E3-step1.png, E3-step2.png, E3-step4.png đã lưu. Frame step4 ghi «1,5 triệu» đã đọc từ DOM: «Hiểu là: 1,5 triệu, bao phí». Lưu ý: lưới đang để nhóm «Toà → Loại căn» (tuỳ chọn nhóm dùng chung, phiên chấm khác đổi) chứ không phải Không nhóm như bước 1; lọc Mã căn = A-04.06 đã đặt. Đồng thời có phiên chấm khác sửa cùng hàng này (sự kiện 6-11 không phải của lượt này).
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-va-sua-tren-o-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T05:28:51Z
  output: |
    ℹ duration_ms 176.692917

- eval: E5
  run_id: E5-va-sua-tren-o
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:28:51Z
  screenshot: evidence/E5-hai-thong-bao.png
  observed: |
    E5-hai-thong-bao.png: Bang hang, Nhom Khong nhom, loc Toa A 18/33; o A-11.02 hien 3 ty, A-06.04 hien 4,9 ty, phi van «Bao phi»; mot thong bao «Da doi gia A-11.02 / Tinh la vua xac nhan... / Hoan tac» hien phia truoc, thong bao A-06.04 khuat sau chong (khong thay trong anh, nhung DOM co du hai). E5-hoan-tac-a.png: A-06.04 ve 5 ty, Bao phi, A-11.02 van 3 ty; thong bao «Da hoan tac gia A-06.04» o duoi, thong bao A-11.02 con nut Hoan tac o tren. E5-co-lan-sau.png: A-06.04 hien 4,8 ty, A-11.02 3,1 ty; thong bao loi «Khong hoan tac duoc: can da co...» (bi cat boi nut Issues cua Next dev, DOM doc du chu), con mot thong bao «Da doi gia A-06.04 ... Hoan tac». Phu hop Expected (khuyet diem: thong bao thu hai trong anh dau khong hien).
  network_observed: n-a (driver)

- eval: E5b
  run_id: E5b-20261101-0536
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:28:51Z
  screenshot: evidence/E5b-nguoi-khac.png
  observed: |
    E5b-nguoi-khac.png (phiên 1, dau-chu-1): bảng 1/33 căn, lọc Mã căn B-14.05, Nhóm Không nhóm, ô Giá hiện «4,9 tỷ» (giá của phiên 2, không phải 4,88 tỷ phiên 1 vừa đặt), chỉ báo «Đã đồng bộ · 12:36». Góc dưới phải có thông báo lỗi «Không hoàn tác được: căn đã có lần sửa sau», bị nút lớp phủ dev của Next che một phần. Chữ đầy đủ lấy từ DOM. E5b-step2.png (phiên 1 sau Enter) và E5b-step3.png (phiên 2, truong-nhom, 1/26 căn, ô Giá «4,9 tỷ», thông báo «Đã đổi giá B-14.05 … Hoàn tác») khớp các bước. Không lưu khung bước 1 (dựng) riêng.
  network_observed: n-a (driver)

- eval: E5c
  run_id: minted-va-sua-tren-o-E5c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:28:51Z
  screenshot: evidence/E5c-da-hoan-tac.png
  observed: |
    E5c-step1.png: bang hang khong nhom, loc Ma can A-04.06 (1/33 can), hang Toa A, Dang ban, gia 8,87 ty, Bao phi; o Gia dang mo trinh sua (hop «8,87 ty», «Hieu la: 8,87 ty, bao phi», «Tinh la vua xac nhan voi chu nha») — anh chup cung luc mo o sua, khong phai truoc khi sua; khong mau thuan Expected. E5c-step2.png: sau hoan tac, hang A-04.06 gia 8,87 ty, o Ma can co tieu diem luoi, khong co toast hien. E5c-da-hoan-tac.png: gia 8,87 ty (da hoan tac), tieu diem o Ma can; toast «Da hoan tac roi» da het hien khi chup (chup sau khi toast tu tat) nen khung KHONG chua chu thong bao — chu nay ghi tu DOM sonner («Da hoan tac roi») ngay sau khi bam. Ket qua khop Expected qua API events (5 -> 7 -> 9).
  network_observed: clean

- eval: E6
  run_id: minted-va-sua-tren-o-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T05:28:51Z
  output: |
    ℹ duration_ms 176.692917

- eval: E7
  run_id: minted-va-sua-tren-o-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-01T05:28:51Z

- eval: E8
  run_id: minted-va-sua-tren-o-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T05:28:51Z
  output: |
    chuẩn giao diện: đạt

- eval: E9
  run_id: minted-va-sua-tren-o-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T05:28:51Z

- eval: E10
  run_id: minted-va-sua-tren-o-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-sua-tren-o/thu/ranh-gioi.mjs
  verified_at: 2026-11-01T05:28:51Z
  output: |
    0 tệp ngoài ranh giới

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-sua-tren-o-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T05:28:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-sua-tren-o-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T05:28:51Z

- cmd: npm run test:hooks
  run_id: minted-va-sua-tren-o-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T05:28:51Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-sua-tren-o-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T05:28:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline):
- npm test -w @quy-hang/core: E1
- npm test -w @quy-hang/web: E2, E4, E6
- npm run typecheck: E7
- npm run lint: E8
- design-floor-s4 (npm run lint chuẩn giao diện, script design_floor): E9

Baseline khong do
- node _acceptance/va-sua-tren-o/thu/ranh-gioi.mjs: bo qua baseline: tep _acceptance/va-sua-tren-o/thu/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base edf6366a5823b6c51b9a5d701d021430d50778f9 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả eval đạt; không có eval thất bại.
