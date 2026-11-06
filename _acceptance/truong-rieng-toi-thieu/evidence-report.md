---
schema_version: 2
feature_slug: truong-rieng-toi-thieu
verdict: REJECT
failed_evals: ["E13"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 033639a15e32ee122db211887c6a2b5be6d7c996
human_signoff:
---

# Evidence Report: truong-rieng-toi-thieu

Lệnh fail không gắn eval: ui-check:E13 (evals: E13) — E13 trượt ở bước hiển thị nhãn lựa chọn.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E4c | AC-4 | test | PASS |
| E4d | AC-4 | test | PASS |
| E4e | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E6d | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | PASS |
| E12 | AC-4 | ui-check | PASS |
| E13 | AC-6 | ui-check | FAIL |
| E14 | AC-10 | script | PASS (đạt có giới hạn) |
| E14b | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-truong-rieng-toi-thieu-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E2
  run_id: minted-truong-rieng-toi-thieu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1543.53425

- eval: E2b
  run_id: minted-truong-rieng-toi-thieu-E2b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E3
  run_id: minted-truong-rieng-toi-thieu-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1543.53425

- eval: E3b
  run_id: minted-truong-rieng-toi-thieu-E3b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E3c
  run_id: minted-truong-rieng-toi-thieu-E3c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3522.811667

- eval: E4
  run_id: minted-truong-rieng-toi-thieu-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E4b
  run_id: minted-truong-rieng-toi-thieu-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1543.53425

- eval: E4c
  run_id: minted-truong-rieng-toi-thieu-E4c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3522.811667

- eval: E4d
  run_id: minted-truong-rieng-toi-thieu-E4d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E4e
  run_id: minted-truong-rieng-toi-thieu-E4e-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3522.811667

- eval: E5
  run_id: minted-truong-rieng-toi-thieu-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 479.569833

- eval: E5b
  run_id: minted-truong-rieng-toi-thieu-E5b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E6
  run_id: minted-truong-rieng-toi-thieu-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E6b
  run_id: minted-truong-rieng-toi-thieu-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1543.53425

- eval: E6c
  run_id: minted-truong-rieng-toi-thieu-E6c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3522.811667

- eval: E7
  run_id: minted-truong-rieng-toi-thieu-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E6d
  run_id: minted-truong-rieng-toi-thieu-E6d-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E7c
  run_id: minted-truong-rieng-toi-thieu-E7c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E7b
  run_id: minted-truong-rieng-toi-thieu-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1543.53425

- eval: E8
  run_id: minted-truong-rieng-toi-thieu-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E9
  run_id: minted-truong-rieng-toi-thieu-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E9b
  run_id: minted-truong-rieng-toi-thieu-E9b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E10
  run_id: minted-truong-rieng-toi-thieu-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3522.811667

- eval: E10b
  run_id: minted-truong-rieng-toi-thieu-E10b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:19:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 134953.348583

- eval: E11
  run_id: minted-truong-rieng-toi-thieu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T09:19:20Z
  screenshot: evidence/E11-step1.png
  observed: |
    step1.png (1440): trang «Trường riêng», khối «Trường riêng của sàn» với câu hướng dẫn; hai nhóm «Trường của hàng» và «Trường của liên hệ» đều ghi «Chưa có trường nào.», mỗi nhóm có nút «Thêm trường», nút «Lưu» đen ở dưới. Khớp expected.
    step2.png: ô tên «Hướng» viền đỏ; khối «Trùng nghĩa một trường chuẩn: Đã có trường «Hướng» — đổi tên ở Cách gọi…» cùng nút «Mở Cách gọi»; nút «Lưu» xám (khoá). Khớp expected.
    step3.png (sau tải lại): nhóm «Trường của hàng» có «Căn góc — Có / Không» và «Nội thất bàn giao — Chọn một · 3 lựa chọn» với Cơ bản, Đầy đủ, Thô; nhóm liên hệ còn trống. Dữ liệu còn sau tải lại, khớp expected.
    step4.png (toàn trang): «Giờ gọi được» có huy hiệu vàng «Thông tin chủ nhà», loại Chủ bán, Chủ cho thuê, lựa chọn Sáng, Trưa, Tối; «Nguồn khách» không có huy hiệu, loại Người mua, Người thuê, lựa chọn Zalo, Facebook, Giới thiệu; thông báo «Đã lưu trường riêng» ở đáy. Khớp expected.
    step5.png (375): bố cục một cột, tiêu đề «Trường riêng», «Căn góc», «Nội thất bàn giao» và các lựa chọn đọc được, không tràn ngang. Khớp expected.
    step6.png (dau-chu-1, 1440): địa chỉ về Cá nhân, trang «Cá nhân», dải «Mục này chỉ quản trị sàn mở được», không có form trường riêng; thanh bên chỉ còn mục Cá nhân. Khớp expected.
  network_observed: clean

- eval: E12
  run_id: minted-truong-rieng-toi-thieu-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T09:19:20Z
  screenshot: evidence/E12-step1.png
  observed: |
    step1.png: Bang hang 1440, tieu de cot cuoi hien «Ai thấy», «Căn góc» (co nut sap xep), «Nội thất bàn giao», sau cac cot chuan; moi o cua hai cot la «—»; 36 / 36 can. step2.png: dong 1 A-13.01 (Toà A, 1PN) o «Căn góc» hien «Có» (o dang chon), toast «Đã đổi căn góc A-13.01» + nut «Hoàn tác»; cac dong khac van «—». Ma can: A-13.01. step3.png: hang loc mo, o loc «Căn góc» = «Có», bo dem «1 / 36 căn», nut «Lọc 1», chi con Toà A > 1PN > A-13.01 voi «Có». step4.png: phien moi cua dau-chu-2, bo dem 33 / 33 can, dong A-13.01 hien «Có» o cot «Căn góc», cac dong khac «—»; cot «Nội thất bàn giao» van «—». Khop Expected.
  network_observed: clean

- eval: E13
  run_id: minted-truong-rieng-toi-thieu-E13-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T09:19:20Z
  screenshot: evidence/E13-step1.png
  observed: |
    step1.png (đã mở bằng Read): trang Liên hệ > Chủ bán, panel phải [Mẫu] Chủ chủ nhà 02 «Chủ bán · [Mẫu] Đầu chủ 1 giữ»; mục TRƯỜNG RIÊNG chỉ có một hàng «Giờ gọi được» với ô chọn «Chưa ghi»; không có trường khác. Khớp Expected. step2.png: sau khi chọn Sáng, ô chọn hiện chữ «sang» (mã thô, không phải nhãn «Sáng») — lệch Expected. step2b-reload.png: sau tải lại và mở lại hồ sơ, ô vẫn hiện «sang» — giá trị còn nhưng hiển thị mã thô. step3 (Người mua): không có Người mua nào của đầu chủ (0 liên hệ), bỏ khung.
  network_observed: app-fail

- eval: E14
  run_id: minted-truong-rieng-toi-thieu-E14-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T09:19:20Z
  output: |
    21 tệp giao diện ngoài bản đồ
    (mã thoát 1 là kết quả đã khai trước của eval này, đi cùng E14b)

- eval: E14b
  run_id: minted-truong-rieng-toi-thieu-E14b-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/truong-rieng-toi-thieu/kiem-khuon-e14.mjs
  verified_at: 2026-11-06T09:19:20Z
  output: |
    E14b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/fields/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-truong-rieng-toi-thieu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T09:19:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-truong-rieng-toi-thieu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T09:19:20Z

- cmd: npm run test:hooks
  run_id: minted-truong-rieng-toi-thieu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T09:19:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-truong-rieng-toi-thieu-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T09:19:20Z

- cmd: npm run typecheck
  run_id: minted-truong-rieng-toi-thieu-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T09:19:20Z

- cmd: npm run lint
  run_id: minted-truong-rieng-toi-thieu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T09:19:20Z

## Known limits

- E14 (AC-10) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh ở cả HEAD lẫn baseline; chứng minh harness hơn là tính năng — nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/core: E2, E3, E4b, E6b, E7b
- npm test -w @quy-hang/web: E3c, E4c, E6c, E4e, E10
- npm run test:ro-ri: E5

Baseline khong do
- node _acceptance/truong-rieng-toi-thieu/kiem-khuon-e14.mjs: bo qua baseline: tep _acceptance/truong-rieng-toi-thieu/kiem-khuon-e14.mjs co o cay dang kiem nhung chua co o merge-base 3d1455cfd3fddd613d7b4de51776688c9139d0bb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E13 failed — hồ sơ liên hệ hiện mã thô «sang» thay vì nhãn «Sáng» ở ô chọn của mục Trường riêng, cả sau khi chọn lẫn sau khi tải lại (giá trị vẫn lưu đúng, PATCH trả thành công). Returned to implementation.
