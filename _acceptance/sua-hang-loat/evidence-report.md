---
schema_version: 2
feature_slug: sua-hang-loat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f449c1b470ece80951a33cdb6d721baee12225e5
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: sua-hang-loat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-3 | test | PASS |
| E2 | AC-5 | test | PASS |
| E3 | AC-7 | test | PASS |
| E4 | AC-2 | test | PASS |
| E5 | AC-8 | test | PASS |
| E6 | AC-1 | ui-check | PASS |
| E7 | AC-2 | ui-check | PASS |
| E7b | AC-2 | ui-check | PASS |
| E8 | AC-4 | ui-check | PASS |
| E8b | AC-4 | ui-check | PASS |
| E9 | AC-5 | ui-check | PASS |
| E9b | AC-6 | test | PASS |
| E10 | AC-7 | ui-check | PASS |
| E11 | AC-8 | ui-check | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-9 | script | PASS |
| E15 | AC-9 | script | PASS |

## Evidence

- eval: E2
  run_id: minted-sua-hang-loat-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T07:05:23Z
  output: |
    ℹ duration_ms 209.995833

- eval: E12
  run_id: minted-sua-hang-loat-E12-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-01T07:05:23Z
  output: |
    typecheck xong, không lỗi

- eval: E13
  run_id: minted-sua-hang-loat-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T07:05:23Z
  output: |
    chuẩn giao diện: đạt

- eval: E9
  run_id: sua-hang-loat-E9-r3-verifier
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T07:05:23Z
  screenshot: evidence/E9-hoi-lai.png
  observed: |
    Đã mở từng khung. E9-step1.png: lưới 1440x900, «Nhóm: Không nhóm», thanh «3 căn đã chọn · Đổi trạng thái · Đánh dấu đã gọi · Bỏ chọn», chỉ báo «Đã đồng bộ · 14:08»; 3 căn tích. E9-hoi-lai.png: hộp hỏi «Đánh dấu đã gọi 2 căn / Còn / giữ giá — tính là vừa xác nhận với chủ nhà · không hoàn tác được. / 1 căn không đổi được: B-06.02 — căn đã đóng», nút Thôi và Đổi; khớp Expected. E9-da-goi.png: thông báo góc dưới phải «Đã đánh dấu đã gọi 2 căn / Còn / giữ giá · không hoàn tác được», không có nút Hoàn tác; chỉ báo đầu trang «Đang gửi 1 thay đổi»; thanh còn «1 căn đã chọn» (B-06.02 đóng vẫn tích). E9-step2.png (sau đồng bộ): chỉ báo «Đã đồng bộ · 14:08», 1 căn còn tích (B-06.02), thông báo đã đóng. Khớp Expected. Lưu ý: Độ tươi (cột «Xác nhận») của hai căn mở đã là «Hôm nay» TRƯỚC khi đổi (mọi căn mở ở Toà B đã được các bài trước chạm trong ngày), nên mục «về hôm nay» đúng nhưng không phân biệt được trước/sau; bằng chứng thật là sự kiện owner_confirmed và lastConfirmedAt máy chủ đổi (B-90.01 06:36:13 → 07:08:44, B-90.02 06:36:13 → 07:08:59). B-06.02 vẫn «1 ngày trước».
  network_observed: clean

### Eval mang từ vòng trước (carry-forward)

- eval: E1
  run_id: minted-sua-hang-loat-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-sua-hang-loat-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-sua-hang-loat-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:58:39Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-sua-hang-loat-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: E6-sua-hang-loat-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E6-chua-tich.png
  observed: |
    E6-chua-tich.png (1440x900, Nhóm: Không nhóm, 36/36 căn): cột đầu có ô tích «Chọn hết» ở tiêu đề và ô tích mỗi dòng, tất cả trống; thanh công cụ chỉ có «Góc nhìn» và «36 / 36 căn», không có thanh hành động. Khớp Expected.
    E6-hai-can.png: lọc Toà B (18 / 36 căn), hai dòng B-01.04 và B-01.05 được tích, thanh «2 căn đã chọn» với «Đổi trạng thái», «Đánh dấu đã gọi», «Bỏ chọn». E6-step3.png: sau «Chọn hết» thanh ghi «18 căn đã chọn» khớp «18 / 36 căn». E6-step4.png: sau «Bỏ chọn» không ô nào tích, thanh biến mất. Khớp Expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: E7-run3-2026-11-01T07:02Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:58:39Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E7-step1.png
  observed: |
    Tôi đã mở từng frame bằng Read. Tất cả khổ 1440x900, người dùng dau-chu-1, dark mode, đầu trang «Đã đồng bộ · 14:02».
    - E7-step1.png: Bảng hàng, Nhóm: Không nhóm, cột Toà đang lọc «Toà B» (đếm 30 / 48 căn), bộ lọc Mã căn rỗng. Ba dòng B-14.02, B-14.05 và B-13.02 được tích (hai dòng đầu thấy trong khung). Thanh «3 căn đã chọn» có Đổi trạng thái, Đánh dấu đã gọi, Bỏ chọn, chưa có phần «lọc ẩn».
    - E7-step2.png (đã sao thành E7-loc-an.png, cùng 61258 byte): lọc Mã căn «B-13.02», còn 1 dòng B-13.02 Toà B 2PN Tạm ngừng, đếm «1 / 48 căn». Thanh ghi «3 căn đã chọn · 2 đang bị lọc ẩn». Khớp Expected.
    - E7-step3a.png: Nhóm «Toà → Loại căn», dòng nhóm «Toà B 1 căn» và «2PN 1 căn», dòng B-13.02 vẫn được tích. Thanh vẫn «3 căn đã chọn · 2 đang bị lọc ẩn».
    - E7-step3b.png: về Không nhóm, lọc B-13.02 còn nguyên. Thanh vẫn «3 căn đã chọn · 2 đang bị lọc ẩn». Đổi nhóm không làm mất tích.
    - E7-step4.png (đã sao thành E7-hoi-lai.png, cùng 93420 byte): nền bảng mờ, hộp «Đánh dấu đã gọi 3 căn — Còn / giữ giá — tính là vừa xác nhận với chủ nhà · không hoàn tác được.» có nút Thôi và Đổi. Hộp nêu 3 căn, khớp Expected.
    - E7-step5a.png: hộp «Đánh dấu đã gọi 3 căn» giống step4, nền còn lọc B-13.02 (lần bấm thứ hai, vẫn giữ bộ lọc).
    - E7-step5b.png: sau «Đổi», hộp đã đóng, thanh hành động biến mất, ô tích rỗng, bảng còn lọc B-13.02 (1 / 48 căn), đầu trang «Đã đồng bộ · 14:02». Khung này không tự chứng minh sự kiện; số sự kiện đọc từ JSON API bên dưới.
  network_observed: clean

- eval: E7b
  run_id: E7b-s4r2-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:58:39Z
  carried_from_round: 2
  # carry-forward tu round 2 — delta khong cham paths cua eval
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1.png (da doc): trang Bang hang, nhom «Khong nhom», bo loc Ma can = A-04.06, «1 / 48 can», chi mot dong Toa A / A-04.06 / 3PN / Dang ban hien; chi bao dau trang ghi «Da dong bo · 14:00»; hop checkbox dong khong tich (lua chon da xoa sau Doi). Khop Expected ve chi bao dong bo; 2 can bi loc an (A-02.06, A-06.04) khong hien tren frame, dung tinh huong de bai. E7b-s4r2-hoi-lai.png (da doc): hop thoai «Danh dau da goi 3 can — Con / giu gia — tinh la vua xac nhan voi chu nha · khong hoan tac duoc.» voi nut Thoi va Doi, nen bang mo. Hieu qua phia may chu (events API): moi can trong 3 can dung +1 owner_confirmed (n0+1), actor = dau-chu-1.
  network_observed: n-a (driver)

- eval: E8
  run_id: E8-sua-hang-loat-20261101T0638Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E8-hoi-lai.png
  observed: |
    E8-hoi-lai.png: nền bảng mờ, hộp giữa màn hình «Đổi 3 căn sang Tạm ngừng», dòng phụ «Mỗi căn một lần sửa, tính là vừa xác nhận với chủ nhà.», mục «1 căn không đổi được» với «B-08.06 — không chuyển được từ Đã bán», nút Thôi và Đổi. Khớp Expected.
    E8-da-doi.png: thanh «1 căn đã chọn», B-08.06 (Đã bán) vẫn tích, toast «Đã đổi trạng thái 3 căn» có nút «Hoàn tác». E8-step1/step2: thanh «4 căn đã chọn», menu ba nấc không có Đã bán.
  network_observed: n-a (driver)

- eval: E8b
  run_id: E8b-20261101-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E8b-step1.png
  observed: |
    E8b-step1.png: lưới Bảng hàng 1440x900, «Nhóm: Không nhóm», thanh «2 căn đã chọn · Đổi trạng thái · Đánh dấu đã gọi · Bỏ chọn», dòng B-08.02 được tích. E8b-chua-ly-do.png: hộp «Đổi 0 căn sang Ngừng hẳn», ô «Lý do ngừng» rỗng, «2 căn không đổi được: B-03.04 — chọn lý do ngừng / B-08.02 — chọn lý do ngừng», nút Đổi tắt. Khớp Expected.
    E8b-step-sau-doi.png: toast «Đã đổi trạng thái 2 căn» + «Hoàn tác», B-08.02 «Ngừng hẳn». E8b-khong-doi-duoc.png: menu «Đổi trạng thái» chỉ có dòng mờ «Không căn nào đổi được». Khớp Expected.
  network_observed: clean

- eval: E9b
  run_id: minted-sua-hang-loat-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: E10-20261101-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E10-hoan-tac-lo.png
  observed: |
    E10-step2.png (lượt thử trước): 1440x900, Nhóm = Không nhóm, thanh «3 căn đã chọn» với Đổi trạng thái, Đánh dấu đã gọi, Bỏ chọn; B-15.05 và B-14.05 được tích, cùng «Đang bán».
    E10-hoan-tac-lo.png chụp bằng công cụ sau khi hoàn tác, không có toast; B-15.01 (Y) «Đang bán», 3,71 tỷ. Nội dung toast và trạng thái từng căn lấy từ DOM và API, nên bằng chứng ảnh yếu hơn Expected.
  network_observed: clean

- eval: E11
  run_id: E11-sua-hang-loat-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png: bảng hàng 1440x900, menu nhóm «Toà → Loại căn / Toà / Không nhóm» đang mở, «33 / 33 căn»; chỉ là ảnh dựng, không mâu thuẫn Expected. E11-step2.png: Không nhóm, 39/39 căn, B-91.01 ở ô Giá «4,05 tỷ», toast «Đã đổi giá B-91.01 · Tính là vừa xác nhận với chủ nhà» kèm «Hoàn tác».
    E11-o-loc.png: ô lọc cột Mã căn chứa «B» (lùi theo phím hoàn tác của ô gõ), «21 / 39 căn», B-91.01 giữ «4,05 tỷ», không có thông báo «Đã hoàn tác». Khớp Expected.
  network_observed: clean

- eval: E14
  run_id: minted-sua-hang-loat-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E15
  run_id: minted-sua-hang-loat-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/sua-hang-loat/thu/ranh-gioi.mjs
  verified_at: 2026-11-01T06:33:16Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-01T07:05:23Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-01T07:05:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-01T07:05:23Z

- cmd: npm run test:hooks
  run_id: minted-sua-hang-loat-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-01T07:05:23Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-01T07:05:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay.

Eval không phân biệt (xanh cả trên mã hiện tại lẫn mã cũ; chứng minh khung chạy chứ không chứng minh tính năng — viết lại để kiểm hành vi mới hoặc xác nhận là lớp chặn hồi quy có chủ ý):
- npm test -w @quy-hang/web (E2, E4)
- npm run typecheck (E12)
- npm run lint (E13)

Baseline round này không đo lại; field baseline của từng eval ghi n-a.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E7b, E9 failed — đọc máy chủ trước khi đồng bộ xong. Returned to implementation.
Round 2: E9 failed — máy chủ dev khởi động lại giữa bài; nội dung đạt. Returned to implementation.
Round 3: mọi eval đạt; E2, E9, E12, E13 chạy lại, các eval còn lại mang từ vòng trước.

### Re-pin lần 1 — 2026-11-01, do gộp main sau chữ ký
run_id: repin-20261101T073604Z-78082
sha: f449c1b470ece80951a33cdb6d721baee12225e5 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · ngoài làn máy: E6, E7, E7b, E8, E8b, E9, E10, E11 · AC không có chốt máy: AC-1, AC-4
