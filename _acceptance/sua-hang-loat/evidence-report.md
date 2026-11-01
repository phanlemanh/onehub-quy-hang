---
schema_version: 2
feature_slug: sua-hang-loat
verdict: REJECT
failed_evals: ["E7b","E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bca1b2eaf43d786a9fb83d0af4f73d4ae6393f32
human_signoff:
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
| E7b | AC-2 | ui-check | FAIL |
| E8 | AC-4 | ui-check | PASS |
| E8b | AC-4 | ui-check | PASS |
| E9 | AC-5 | ui-check | FAIL |
| E9b | AC-6 | test | PASS |
| E10 | AC-7 | ui-check | PASS |
| E11 | AC-8 | ui-check | PASS |
| E12 | AC-9 | script | PASS |
| E13 | AC-9 | script | PASS |
| E14 | AC-9 | script | PASS |
| E15 | AC-9 | script | PASS |

Lệnh fail không gắn eval: không có ngoài hai lệnh ui-check của chính E7b và E9 (đã tính vào hai eval đó).

## Evidence

- eval: E1
  run_id: minted-sua-hang-loat-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  output: |
    ℹ duration_ms 273.361291

- eval: E2
  run_id: minted-sua-hang-loat-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  output: |
    ℹ duration_ms 273.361291

- eval: E3
  run_id: minted-sua-hang-loat-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  output: |
    ℹ duration_ms 273.361291

- eval: E4
  run_id: minted-sua-hang-loat-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  output: |
    ℹ duration_ms 273.361291

- eval: E5
  run_id: minted-sua-hang-loat-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  output: |
    ℹ duration_ms 273.361291

- eval: E6
  run_id: E6-sua-hang-loat-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  screenshot: evidence/E6-chua-tich.png
  observed: |
    E6-chua-tich.png (1440x900, Nhóm: Không nhóm, 36/36 căn): cột đầu có ô tích «Chọn hết» ở tiêu đề và ô tích mỗi dòng, tất cả trống; thanh công cụ chỉ có «Góc nhìn» và «36 / 36 căn», không có thanh hành động. Khớp Expected.
    E6-hai-can.png: lọc Toà B (18 / 36 căn), hai dòng B-01.04 và B-01.05 được tích, thanh «2 căn đã chọn» với «Đổi trạng thái», «Đánh dấu đã gọi», «Bỏ chọn». E6-step3.png: sau «Chọn hết» thanh ghi «18 căn đã chọn» khớp «18 / 36 căn». E6-step4.png: sau «Bỏ chọn» không ô nào tích, thanh biến mất. Khớp Expected.
  network_observed: n-a (driver)

- eval: E7
  run_id: E7-20261101-run2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  screenshot: evidence/E7-loc-an.png
  observed: |
    E7-loc-an.png (bản sao của step2): lọc Mã căn «B-13», 1 dòng B-13.02 Toà B Tạm ngừng được tích; thanh «1 / 39 căn · 3 căn đã chọn · 2 đang bị lọc ẩn» với Đổi trạng thái, Đánh dấu đã gọi, Bỏ chọn. Khớp Expected.
    E7-hoi-lai.png (bản sao của step4): hộp «Đánh dấu đã gọi 3 căn — Còn / giữ giá — tính là vừa xác nhận với chủ nhà · không hoàn tác được», nút Thôi và Đổi. E7-step5b.png: toast «Đã đánh dấu đã gọi 3 căn», tích được bỏ, sau đó đồng bộ xong và cả 3 căn có thêm 1 sự kiện owner_confirmed.
  network_observed: clean

- eval: E7b
  run_id: minted-sua-hang-loat-E7b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1.png (sau «Đổi», 1440x900, dau-chu-1): chế độ Không nhóm, lọc Toà B + Mã căn B-97.01, còn 1 dòng B-97.01 (Chưa đủ để rao), đếm «1 / 45 căn», thanh hành động đã biến mất, không còn hộp thoại, đầu trang «Đã đồng bộ · 13:43». Khung này không tự chứng minh sự kiện; bằng chứng sự kiện nằm ở JSON đọc lại từng căn.
    E7b-hoi-lai.png: hộp «Đánh dấu đã gọi 3 căn» với Thôi và Đổi, nền mờ còn lọc B-97.01. E7b-loc-an.png: thanh «3 căn đã chọn · 2 đang bị lọc ẩn». Nội dung sự kiện khớp Expected (mỗi căn đúng 1 owner_confirmed mới, actor là dau-chu-1), nhưng lượt chạy có một request ghi sự kiện của app bị máy chủ từ chối do xung đột phiên bản nên eval bị chấm trượt theo luật network.
  network_observed: app-fail

- eval: E8
  run_id: E8-sua-hang-loat-20261101T0638Z
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
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
  screenshot: evidence/E8b-step1.png
  observed: |
    E8b-step1.png: lưới Bảng hàng 1440x900, «Nhóm: Không nhóm», thanh «2 căn đã chọn · Đổi trạng thái · Đánh dấu đã gọi · Bỏ chọn», dòng B-08.02 được tích. E8b-chua-ly-do.png: hộp «Đổi 0 căn sang Ngừng hẳn», ô «Lý do ngừng» rỗng, «2 căn không đổi được: B-03.04 — chọn lý do ngừng / B-08.02 — chọn lý do ngừng», nút Đổi tắt. Khớp Expected.
    E8b-step-sau-doi.png: toast «Đã đổi trạng thái 2 căn» + «Hoàn tác», B-08.02 «Ngừng hẳn». E8b-khong-doi-duoc.png: menu «Đổi trạng thái» chỉ có dòng mờ «Không căn nào đổi được». Khớp Expected.
  network_observed: clean

- eval: E9
  run_id: minted-sua-hang-loat-E9-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
  screenshot: evidence/E9-hoi-lai.png
  observed: |
    E9-hoi-lai.png: nền bảng mờ, hộp giữa màn hình «Đánh dấu đã gọi 2 căn», «Còn / giữ giá — tính là vừa xác nhận với chủ nhà · không hoàn tác được.», mục «1 căn không đổi được» với «B-08.06 — căn đã đóng», nút Thôi / Đổi. Khớp Expected về nội dung (chênh nhỏ: không có dấu hai chấm sau «không đổi được»).
    E9-da-goi.png: 0,7 giây sau Đổi, «Đang gửi 1 thay đổi», toast «Đã đánh dấu đã gọi 2 căn», không có nút Hoàn tác, chỉ B-08.06 còn tích. Mục «mỗi căn đúng 1 sự kiện sau Đổi» không giữ được ở lần đọc sau Đổi 3 giây: B-10.01 chưa có owner_confirmed, Độ tươi vẫn «1 ngày trước», dù thông báo đã báo 2 căn; sau đó sự kiện mới xuất hiện trễ khoảng 15 giây, và dữ liệu bị lẫn với grader chạy song song nên không xác nhận sạch được. Cần chạy lại E9 một mình trên lô căn mới.
  network_observed: clean

- eval: E9b
  run_id: minted-sua-hang-loat-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T06:33:16Z
  output: |
    ℹ duration_ms 273.361291

- eval: E10
  run_id: E10-20261101-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T06:33:16Z
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
  screenshot: evidence/E11-step1.png
  observed: |
    E11-step1.png: bảng hàng 1440x900, menu nhóm «Toà → Loại căn / Toà / Không nhóm» đang mở, «33 / 33 căn»; chỉ là ảnh dựng, không mâu thuẫn Expected. E11-step2.png: Không nhóm, 39/39 căn, B-91.01 ở ô Giá «4,05 tỷ», toast «Đã đổi giá B-91.01 · Tính là vừa xác nhận với chủ nhà» kèm «Hoàn tác».
    E11-o-loc.png: ô lọc cột Mã căn chứa «B» (lùi theo phím hoàn tác của ô gõ), «21 / 39 căn», B-91.01 giữ «4,05 tỷ», không có thông báo «Đã hoàn tác». Khớp Expected.
  network_observed: clean

- eval: E12
  run_id: minted-sua-hang-loat-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-01T06:33:16Z

- eval: E13
  run_id: minted-sua-hang-loat-E13-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T06:33:16Z
  output: |
    chuẩn giao diện: đạt

- eval: E14
  run_id: minted-sua-hang-loat-E14-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T06:33:16Z

- eval: E15
  run_id: minted-sua-hang-loat-E15-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/sua-hang-loat/thu/ranh-gioi.mjs
  verified_at: 2026-11-01T06:33:16Z
  output: |
    0 tệp ngoài ranh giới

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T06:33:16Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T06:33:16Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T06:33:16Z

- cmd: npm run test:hooks
  run_id: minted-sua-hang-loat-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T06:33:16Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-sua-hang-loat-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T06:33:16Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh cả trên nhánh lẫn baseline, chứng minh bộ chạy chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E1, E2, E3, E4, E5, E9b (lệnh npm test -w @quy-hang/web)
- E12 (lệnh npm run typecheck)
- E13 (lệnh npm run lint)
- E14 (lệnh design-floor-s4)

Baseline không đo:
- node _acceptance/sua-hang-loat/thu/ranh-gioi.mjs: bỏ qua baseline: tệp _acceptance/sua-hang-loat/thu/ranh-gioi.mjs có ở cây đang kiểm nhưng chưa có ở merge-base edf6366a5823b6c51b9a5d701d021430d50778f9 — eval mới, chạy trên code cũ không phân biệt gì

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E7b, E9 failed — E7b: một request ghi sự kiện của app bị từ chối do xung đột phiên bản dù nội dung sự kiện đúng (cần điều tra gửi trùng lệnh và độ trễ khoảng 15 giây trong lô); E9: một căn chưa có sự kiện ở lần đọc 3 giây sau Đổi và lượt chạy bị lẫn với grader song song, cần chạy lại một mình. Returned to implementation.
