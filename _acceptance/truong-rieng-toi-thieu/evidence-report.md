---
schema_version: 2
feature_slug: truong-rieng-toi-thieu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 37d5c382409105e1872d37d82dd6f362abdcfb5d
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: truong-rieng-toi-thieu

Round 2. Nội dung thay toàn bộ round cũ; lịch sử round nằm ở mục Iterations. Round này chạy lại E6, E6b, E6c, E13, E14 cùng các lệnh suite; các eval còn lại carry-forward từ round 1.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry r1) |
| E2 | AC-2 | test | PASS (carry r1) |
| E2b | AC-2 | test | PASS (carry r1) |
| E3 | AC-3 | test | PASS (carry r1) |
| E3b | AC-3 | test | PASS (carry r1) |
| E3c | AC-3 | test | PASS (carry r1) |
| E4 | AC-4 | test | PASS (carry r1) |
| E4b | AC-4 | test | PASS (carry r1) |
| E4c | AC-4 | test | PASS (carry r1) |
| E4d | AC-4 | test | PASS (carry r1) |
| E4e | AC-4 | test | PASS (carry r1) |
| E5 | AC-5 | script | PASS (carry r1) |
| E5b | AC-5 | test | PASS (carry r1) |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS (carry r1) |
| E6d | AC-7 | test | PASS (carry r1) |
| E7b | AC-7 | test | PASS (carry r1) |
| E7c | AC-7 | test | PASS (carry r1) |
| E8 | AC-8 | test | PASS (carry r1) |
| E9 | AC-9 | test | PASS (carry r1) |
| E9b | AC-9 | test | PASS (carry r1) |
| E10 | AC-10 | test | PASS (carry r1) |
| E10b | AC-10 | test | PASS (carry r1) |
| E11 | AC-1 | ui-check | PASS (carry r1) |
| E12 | AC-4 | ui-check | PASS (carry r1) |
| E13 | AC-6 | ui-check | PASS |
| E14 | AC-10 | script | PASS (đạt có giới hạn) |
| E14b | AC-10 | script | PASS (carry r1) |

## Evidence

### Eval chạy lại ở round 2

- eval: E6
  run_id: minted-truong-rieng-toi-thieu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T12:13:27Z
  output: |
    cmd: npm run db:migrate && npm run db:test
    ℹ duration_ms 111922.973917

- eval: E6b
  run_id: minted-truong-rieng-toi-thieu-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T12:13:27Z
  output: |
    cmd: npm test -w @quy-hang/core
    ℹ duration_ms 1177.170834

- eval: E6c
  run_id: minted-truong-rieng-toi-thieu-E6c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T12:13:27Z
  output: |
    cmd: npm test -w @quy-hang/web
    ℹ duration_ms 3581.088833

- eval: E14
  run_id: minted-truong-rieng-toi-thieu-E14-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T12:13:27Z
  output: |
    cmd: node "$R/scripts/design-floor-khuon.mjs" --kiem --root .
    21 tệp giao diện ngoài bản đồ
    Mã thoát này là kết quả đã khai trước (đạt có giới hạn), xem Known limits; E14b bảo đảm mọi dòng lệch là dòng báo oan đã khai.

- eval: E13
  run_id: minted-truong-rieng-toi-thieu-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T12:13:27Z
  screenshot: evidence/E13-step1.png
  observed: |
    E13-step1.png: bàn Liên hệ, cột phải hồ sơ «[Mẫu] Chủ nhà 21» (Chủ bán, Đầu chủ 1 giữ). Mục «TRƯỜNG RIÊNG» chỉ có một dòng «Giờ gọi được» với hộp chọn hiện «Chưa ghi»; không có «Nguồn khách». Khớp Expected.
    E13-step2.png: cùng hồ sơ, sau khi chọn: hộp chọn hiện chữ «Sáng» (chữ lựa chọn, không mã thô). Khớp.
    E13-step2b-reload.png: sau tải lại trang và mở lại hồ sơ Chủ nhà 21: hộp «Giờ gọi được» vẫn «Sáng» — giá trị còn sau tải lại. Khớp.
    Step3 (Người mua): không có Người mua nào do đầu chủ giữ (0 liên hệ), nên bỏ khung theo đề, không có ảnh.
  network_observed: clean

### Eval carry-forward từ round 1

- eval: E1
  run_id: minted-truong-rieng-toi-thieu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-truong-rieng-toi-thieu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-truong-rieng-toi-thieu-E2b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-truong-rieng-toi-thieu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-truong-rieng-toi-thieu-E3b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3c
  run_id: minted-truong-rieng-toi-thieu-E3c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-truong-rieng-toi-thieu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4b
  run_id: minted-truong-rieng-toi-thieu-E4b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4c
  run_id: minted-truong-rieng-toi-thieu-E4c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4d
  run_id: minted-truong-rieng-toi-thieu-E4d-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4e
  run_id: minted-truong-rieng-toi-thieu-E4e-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-truong-rieng-toi-thieu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-truong-rieng-toi-thieu-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-truong-rieng-toi-thieu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6d
  run_id: minted-truong-rieng-toi-thieu-E6d-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-truong-rieng-toi-thieu-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7c
  run_id: minted-truong-rieng-toi-thieu-E7c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-truong-rieng-toi-thieu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-truong-rieng-toi-thieu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-truong-rieng-toi-thieu-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-truong-rieng-toi-thieu-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-truong-rieng-toi-thieu-E10b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-truong-rieng-toi-thieu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  screenshot: evidence/E11-step1.png
  observed: |
    step1.png (1440): trang «Trường riêng», khối «Trường riêng của sàn» với câu hướng dẫn; hai nhóm «Trường của hàng» và «Trường của liên hệ» đều ghi «Chưa có trường nào.», mỗi nhóm có nút «Thêm trường», nút «Lưu» đen ở dưới. Khớp expected.
    step2.png: ô tên «Hướng» viền đỏ; khối «Trùng nghĩa một trường chuẩn: Đã có trường «Hướng» — đổi tên ở Cách gọi…» cùng nút «Mở Cách gọi»; nút «Lưu» xám (khoá). Khớp expected.
    step3.png (sau tải lại): nhóm «Trường của hàng» có «Căn góc — Có / Không» và «Nội thất bàn giao — Chọn một · 3 lựa chọn» với Cơ bản, Đầy đủ, Thô; nhóm liên hệ còn trống. Dữ liệu còn sau tải lại, khớp expected.
    step4.png (toàn trang): «Giờ gọi được» có huy hiệu vàng «Thông tin chủ nhà», loại Chủ bán, Chủ cho thuê, lựa chọn Sáng, Trưa, Tối; «Nguồn khách» không có huy hiệu, loại Người mua, Người thuê, lựa chọn Zalo, Facebook, Giới thiệu; thông báo «Đã lưu trường riêng» ở đáy. Khớp expected.
    step5.png (375): bố cục một cột, tiêu đề «Trường riêng», «Căn góc», «Nội thất bàn giao» và các lựa chọn đọc được, không tràn ngang. Khớp expected.
    step6.png (dau-chu-1, 1440): địa chỉ về Cá nhân, trang «Cá nhân», dải «Mục này chỉ quản trị sàn mở được», không có form trường riêng; thanh bên chỉ còn mục Cá nhân. Khớp expected.
  network_observed: clean
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-truong-rieng-toi-thieu-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  screenshot: evidence/E12-step1.png
  observed: |
    step1.png: Bang hang 1440, tieu de cot cuoi hien «Ai thấy», «Căn góc» (co nut sap xep), «Nội thất bàn giao», sau cac cot chuan; moi o cua hai cot la «—»; 36 / 36 can. step2.png: dong 1 A-13.01 (Toà A, 1PN) o «Căn góc» hien «Có» (o dang chon), toast «Đã đổi căn góc A-13.01» + nut «Hoàn tác»; cac dong khac van «—». Ma can: A-13.01. step3.png: hang loc mo, o loc «Căn góc» = «Có», bo dem «1 / 36 căn», nut «Lọc 1», chi con Toà A > 1PN > A-13.01 voi «Có». step4.png: phien moi cua dau-chu-2, bo dem 33 / 33 can, dong A-13.01 hien «Có» o cot «Căn góc», cac dong khac «—»; cot «Nội thất bàn giao» van «—». Khop Expected.
  network_observed: clean
  output: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E14b
  run_id: minted-truong-rieng-toi-thieu-E14b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/truong-rieng-toi-thieu/kiem-khuon-e14.mjs
  verified_at: 2026-11-06T09:19:20Z
  carried_from_round: 1
  output: carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-truong-rieng-toi-thieu-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T12:13:27Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-truong-rieng-toi-thieu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T12:13:27Z

- cmd: npm run test:hooks
  run_id: minted-truong-rieng-toi-thieu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T12:13:27Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-truong-rieng-toi-thieu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T12:13:27Z

- cmd: npm run typecheck
  run_id: minted-truong-rieng-toi-thieu-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-06T12:13:27Z

- cmd: npm run lint
  run_id: minted-truong-rieng-toi-thieu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-06T12:13:27Z

## Known limits

- E14 (AC-10) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay. Baseline của mọi eval ghi n-a (round này không đo).

Eval không phân biệt (xanh cả trên code mới lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/core: E2, E3, E4b, E6b, E7b
- npm test -w @quy-hang/web: E3c, E4c, E6c, E4e, E10
- npm run test:ro-ri: E5

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E13 failed — ô trường riêng ở hồ sơ liên hệ hiện mã thô thay vì chữ lựa chọn. Returned to implementation (commit b1c20a3a).
Round 2: E6, E6b, E6c, E13, E14 chạy lại trên b1c20a3a và đạt; E13 nay hiện chữ lựa chọn «Sáng»; các eval còn lại carry-forward từ round 1.

### Re-pin lần 1 — 2026-11-06, do gộp main (Thuế phí hàng 49) sau chữ ký
run_id: repin-20261106T151548Z-82111
sha: 20e82b06691493011c18782670d99e37a43685e4 · suites: 7 lệnh exit 0 · evals: 27/27 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E14=1 · ngoài làn máy: E11, E12, E13

### Re-pin lần 2 — 2026-11-06, do gộp main (danh mục xã, PR #174)
run_id: repin-20261106T165150Z-83197
sha: 5dd9f32201294f58e2e896813be301e04d5f6965 · suites: 7 lệnh exit 0 · evals: 27/27 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E14=1 · ngoài làn máy: E11, E12, E13

### Re-pin lần 3 — 2026-11-06, do gộp main (trang nhóm môi giới, PR #173)
run_id: repin-20261106T165936Z-73854
sha: 37d5c382409105e1872d37d82dd6f362abdcfb5d · suites: 7 lệnh exit 0 · evals: 27/27 eval máy đạt kỳ vọng · đạt-có-giới-hạn: E14=1 · ngoài làn máy: E11, E12, E13 · diff chạm vật đo ngoài làn máy: E11 — chưa chứng lại, đi vòng S4 delta
