---
schema_version: 2
feature_slug: va-sua-tren-o
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 6eb8072c5ce351de557235b3767ba61f231feb89
human_signoff: Manh Phan 2026-11-01
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
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-01T05:28:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-va-sua-tren-o-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T05:39:40Z
  output: |
    ℹ duration_ms 192.000166

- eval: E3
  run_id: minted-va-sua-tren-o-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:39:40Z
  screenshot: evidence/E3-hieu-la.png
  observed: |
    E3-step1.png: Bang hang loc Ma can=A-04.06, Nhom Khong nhom, 1/33 can; hang Toa A, A-04.06, Dang ban, Gia «4,66 tỷ», Phi «Không bao phí». E3-hieu-la.png: popover o Gia, o go «4,655 tỷ», nut Bao phi/Khong bao phi, dong «Hiểu là: 4,655 tỷ, bao phí», dong «Tính là vừa xác nhận với chủ nhà». E3-hoi-lai.png: hop hoi lai «4,655 tỷ, Không bao phí → 4,655 tỷ, Bao phí», «Đổi điều kiện phí», «Hiểu là: 4,655 tỷ, bao phí», nut Thôi/Đổi; khong «4,66 tỷ» trong hop. E3-step2.png: sau «Đổi»: o Gia 4,66 tỷ (luoi lam tron), Phi «Bao phí», thong bao «Đã đổi giá A-04.06 / Tính là vừa xác nhận với chủ nhà» + nut Hoàn tác. E3-dien-san.png: mo lai o Gia, o go dien san «4,655 tỷ», dong «Hiểu là: 4,655 tỷ, bao phí». E3-step4.png: o go «1,5 triệu», dong «Hiểu là: 1,5 triệu, bao phí», thong bao cu con o goc duoi. Tat ca khop Expected.
  network_observed: n-a (driver)

- eval: E4
  run_id: minted-va-sua-tren-o-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T05:39:40Z
  output: |
    ℹ duration_ms 192.000166

- eval: E5
  run_id: E5-va-sua-tren-o-verifier-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:39:40Z
  screenshot: evidence/E5-hai-thong-bao.png
  observed: |
    Da mo tung file bang Read. E5-step1.png: Bang hang, Nhom Khong nhom, loc Toa A 18/33 can; o Gia A-06.04 = 4,9 ty (Bao phi), A-08.03 = 5 ty (Khong bao phi); khong thong bao. E5-hai-thong-bao.png (trung E5-step2.png): hai thong bao chong cung hien, "Da doi gia A-06.04 / Tinh la vua xac nhan voi chu nha / Hoan tac" va "Da doi gia A-08.03 ... Hoan tac"; o A-08.03 hien 4,95 ty; gia A-06.04 bi thong bao che (doc tu DOM = 4,8 ty). Khop Expected. E5-hoan-tac-a.png: thong bao "Da hoan tac gia A-06.04" o duoi, thong bao A-08.03 con nut Hoan tac o tren; A-08.03 4,95 ty khong doi; o A-06.04 bi thong bao che trong anh (DOM = 4,9 ty, events A = nA0+2). E5-ctrlz-1.png: tieu diem luoi o Ma can A-06.04; thong bao "Da hoan tac gia A-08.03"; A-08.03 ve 5 ty, A-06.04 4,9 ty Bao phi. E5-ctrlz-2.png: sau Cmd+Z lan 2 chi con thong bao cu cua A-08.03 (khong thong bao moi), A-08.03 5 ty, A-06.04 4,9 ty khong doi. E5-co-lan-sau.png: thong bao loi "Khong hoan tac duoc: can da co..." (bi nut Next dev che cuoi chu; chu day du tu DOM: "Khong hoan tac duoc: can da co lan sua sau"), thong bao lan 2 cua A-06.04 con nut Hoan tac, o A-08.03 5 ty; gia A-06.04 bi che trong anh (DOM = 4,95 ty = gia lan 2). Tat ca khop Expected; gioi han: mot so o gia bi thong bao che nen gia A lay tu DOM, va dung hang Tam ngung thay vi Dang ban do DB troi.
  network_observed: clean

- eval: E5b
  run_id: E5b-20261101-verifier-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:39:40Z
  screenshot: evidence/E5b-nguoi-khac.png
  observed: |
    E5b-step1.png (phiên 1, dau-chu-1, avatar DA): bảng 1/33 căn, lọc Mã căn B-03.04, Nhóm Không nhóm, hàng Toà B Đang bán, ô Giá «6,5 tỷ», chỉ báo «Đã đồng bộ · 12:50»; chưa có thông báo. Khớp bước dựng.
    E5b-step2.png (phiên 1 sau Enter): ô Giá «6,51 tỷ» (ô có tiêu điểm), góc dưới phải thông báo «Đã đổi giá B-03.04 / Tính là vừa xác nhận với chủ nhà» và nút «Hoàn tác» (bị nút lớp phủ dev Next che một phần). Khớp.
    E5b-step3.png (phiên 2, truong-nhom, avatar TR): bảng 1/26 căn, lọc B-03.04, ô Giá «6,52 tỷ», thông báo «Đã đổi giá B-03.04 … Hoàn tác». Khớp.
    E5b-nguoi-khac.png (phiên 1 sau bấm Hoàn tác): ô Giá của B-03.04 hiện «6,52 tỷ» (giá phiên 2, không phải 6,51 của phiên 1), chỉ báo «Đã đồng bộ · 12:50»; thông báo lỗi dưới phải hiện chữ «Không hoàn tác được: căn đã có lỗ…» bị nút Next che đuôi — chữ đầy đủ lấy từ DOM sonner: «Không hoàn tác được: căn đã có lần sửa sau». Không mâu thuẫn Expected.
  network_observed: n-a (driver)

- eval: E5c
  run_id: minted-va-sua-tren-o-E5c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T05:39:40Z
  screenshot: evidence/E5c-step1.png
  observed: |
    E5c-step1.png (da doc): bang khong nhom, loc Ma can = B-15.01, dem 1/33 can, mot hang Toa B B-15.01, 1PN, tang 15, Dang ban, gia 3,71 ty, Bao phi; o loc «Loc 1». Khop buoc 1 (hang D). E5c-step2.png (da doc): ngay sau khi sua, o Gia hien 3,72 ty co vien tieu diem, goc duoi phai co thong bao «Da doi gia B-15.01 / Tinh la vua xac nhan voi chu nha / Hoan tac» (nut bi nut Next.js Issue che mot phan). Khop buoc 2. E5c-da-hoan-tac.png (da doc): gia 3,71 ty, tieu diem o o Gia, thong bao goc duoi phai «Da hoan tac roi» (bieu tuong x) — dung chu Expected. So lieu events 6 -> 8 -> 10 khop n1 = n0+2, n2 = n1+2.
  network_observed: clean

- eval: E6
  run_id: minted-va-sua-tren-o-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T05:39:40Z
  output: |
    ℹ duration_ms 192.000166

- eval: E7
  run_id: minted-va-sua-tren-o-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-01T05:39:40Z

- eval: E8
  run_id: minted-va-sua-tren-o-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T05:39:40Z
  output: |
    chuẩn giao diện: đạt

- eval: E9
  run_id: minted-va-sua-tren-o-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T05:39:40Z

- eval: E10
  run_id: minted-va-sua-tren-o-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-sua-tren-o/thu/ranh-gioi.mjs
  verified_at: 2026-11-01T05:28:51Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-sua-tren-o-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T05:39:40Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-sua-tren-o-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-01T05:39:40Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-sua-tren-o-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T05:39:40Z

- cmd: npm run test:hooks
  run_id: minted-va-sua-tren-o-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T05:39:40Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-sua-tren-o-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-01T05:39:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: moi eval ghi n-a vi evals.yaml khong doi tu lan baseline cuoi (round 1). Cac eval sau la ung vien khong-phan-biet theo danh sach may truyen xuong, can xac nhan la regression-guard co chu y: E1 (npm test -w @quy-hang/core), E2/E4/E6 (npm test -w @quy-hang/web), E7 (typecheck), E8 (lint), E9 (design floor). Lenh suite xanh ca hai phia la regression-guard binh thuong, khong liet ke.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: PASS, 5 phat hien (1 trong hop dong) — lenh bu cua Hoan tac chua mang phien ban vua xet; sua o commit 6eb8072.
Round 2: E2, E3, E4, E5, E5b, E5c, E6, E7, E8, E9 chay lai deu dat; E1 va E10 carry-forward tu round 1.
