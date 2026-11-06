---
schema_version: 2
feature_slug: trang-thai-rieng
verdict: REJECT
failed_evals: [E12]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 0c8f2ed922bccf85bc5705db2b39b9878a63b830
human_signoff:
---

# Evidence Report: trang-thai-rieng

Round 4. Một eval truot: E12 (ui-check). Lệnh fail không gắn eval nào khác: `ui-check:E12` (eval E12). Các eval còn lại qua.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E2c | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | PASS |
| E12 | AC-3 | ui-check | FAIL |
| E13 | AC-8 | ui-check | PASS |
| E14 | AC-1 | script | PASS (đạt có giới hạn) |
| E14b | AC-1 | script | PASS |
| E3d | AC-3 | test | PASS |
| E6c | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E15 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-thai-rieng-E1-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test — bộ kiểm cách ly và API test-db xanh.

- eval: E2
  run_id: minted-trang-thai-rieng-E2-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/core xanh.

- eval: E2b
  run_id: minted-trang-thai-rieng-E2b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E2c
  run_id: minted-trang-thai-rieng-E2c-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E3
  run_id: minted-trang-thai-rieng-E3-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E3b
  run_id: minted-trang-thai-rieng-E3b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/core xanh.

- eval: E3c
  run_id: minted-trang-thai-rieng-E3c-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E4
  run_id: minted-trang-thai-rieng-E4-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E4b
  run_id: minted-trang-thai-rieng-E4b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E5
  run_id: minted-trang-thai-rieng-E5-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E5b
  run_id: minted-trang-thai-rieng-E5b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run test:ro-ri xanh.

- eval: E6
  run_id: minted-trang-thai-rieng-E6-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E6b
  run_id: minted-trang-thai-rieng-E6b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/core xanh.

- eval: E7
  run_id: minted-trang-thai-rieng-E7-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E7b
  run_id: minted-trang-thai-rieng-E7b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E8
  run_id: minted-trang-thai-rieng-E8-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E8b
  run_id: minted-trang-thai-rieng-E8b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E9
  run_id: minted-trang-thai-rieng-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E9b
  run_id: minted-trang-thai-rieng-E9b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E10
  run_id: minted-trang-thai-rieng-E10-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/web xanh.

- eval: E10b
  run_id: minted-trang-thai-rieng-E10b-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm test -w @quy-hang/core xanh.

- eval: E11
  run_id: minted-trang-thai-rieng-E11-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:52:11Z
  screenshot: evidence/E11-step1.png
  observed: |
    step1 (1440): Khung đầy đủ: cột nhà bên trái, cột thứ hai "Cài đặt" với nhóm Cá nhân và Sàn [MẪU] SÀN THỬ, mục "Trạng thái" nền sáng; breadcrumb "Cài đặt › Sàn [Mẫu] Sàn thử › Trạng thái"; sáu nhóm, mỗi nhóm huy hiệu màu kèm nút "Thêm nhãn" và nút Lưu. Khớp Expected.
    step2: Nhóm Đang giao dịch có dòng "Nhãn riêng · 0 căn đang mang" với ô "Giữ chỗ" và nút thùng rác; cuối trang thẻ "Đã lưu trạng thái". Khớp Expected (tải lại vẫn còn nhãn, kiểm bằng DOM).
    step3: Nhóm Tạm ngừng có dòng "Nhãn mới · Chưa lưu" ô "Đang bán" viền đỏ, dòng lỗi đỏ "Trùng tên trạng thái «Đang bán»"; Lưu khoá (kiểm bằng DOM). Khớp Expected.
    step4 (375): Bố cục điện thoại: tiêu đề "Cài đặt", thẻ nhãn trạng thái xếp dọc, huy hiệu màu, nhãn "Giữ chỗ" trong ô nhập, thanh dưới "Cài đặt sàn / Tôi"; không cuộn ngang. Khớp Expected.
  network_observed: clean

- eval: E12
  run_id: E12-2026-11-06
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:52:11Z
  screenshot: evidence/E12-step1.png
  observed: |
    step1: khổ 1440, bảng hàng, ô trạng thái căn A-06.03 (Đang bán) mở ra khay chip 'Đang giao dịch | Giữ chỗ | Đã bán / Tạm ngừng | Ngừng hẳn' kèm dòng 'Tính là vừa xác nhận với chủ nhà'; Giữ chỗ liền sau Đang giao dịch (cạnh phải, không bên dưới). step2: dòng 9 A-06.03 cột Trạng thái hiện huy hiệu tím nhạt «Giữ chỗ» cùng kiểu với huy hiệu «Đang giao dịch»; toast 'Đã đổi trạng thái A-06.03' + Hoàn tác. step3: lọc Trạng thái = Đang giao dịch, 11/36 căn, A-06.03 vẫn trong kết quả với huy hiệu «Giữ chỗ». step4: khổ 375, thẻ A-06.03 5,55 tỷ có huy hiệu «Giữ chỗ».
    step5: tài khoản quan-tri ở ngữ cảnh mới chỉ thấy trang /today 'Màn này đang dựng', KHÔNG có bảng hàng nên không thấy «Giữ chỗ» — mâu thuẫn Expected. Ảnh bổ sung dau-chu-2: bảng hàng 33/33 căn, A-06.03 «Giữ chỗ» hiện, trạng thái 'Đã đồng bộ 10:58'.
  network_observed: clean
  output: |
    Bước 1-4 đạt. Bước 5 truot: đăng nhập quản trị rồi mở /inventory bị chuyển về /today vì quản trị sàn không có Bảng hàng (inventory/page.tsx chuyển hướng khi !lamViecVoiHang). Đối chứng bổ sung (không thay thế bước): người đầu chủ thứ hai ở ngữ cảnh mới thấy A-06.03 «Giữ chỗ». Cần sửa đề (dùng tài khoản có Bảng hàng) hoặc người xác nhận.

- eval: E13
  run_id: minted-trang-thai-rieng-E13-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:52:11Z
  screenshot: evidence/E13-step1.png
  observed: |
    step1 (1440): trang Cài đặt > Trạng thái làm mờ nền, hộp thoại «Gỡ nhãn «Giữ chỗ»?» với câu «1 căn đang là «Giữ chỗ». Chuyển chúng sang:», một lựa chọn «Đang giao dịch», nút «Giữ nhãn» và «Gỡ và chuyển»; dòng nhãn trên màn «1 căn đang mang» khớp inUse của API.
    step2: sau chọn «Đang giao dịch», «Gỡ và chuyển», Lưu: thẻ «Đã lưu trạng thái»; nhóm Đang giao dịch không còn dòng «Giữ chỗ». step3: /inventory (đăng nhập dau-chu-1, vì quản trị bị chuyển hướng khỏi /inventory) 36/36 căn, A-06.03 hiện huy hiệu «Đang giao dịch», không có chữ «Giữ chỗ» ở hàng nào. Lệch nhỏ so với steps: bước 5 dùng tài khoản đầu chủ thay vì quản trị.
  network_observed: clean

- eval: E14
  run_id: minted-trang-thai-rieng-E14-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T03:52:11Z
  output: |
    16 tệp giao diện ngoài bản đồ. Mã thoát 1 là kết quả đã khai trước (đạt có giới hạn), chỉ chấp nhận cùng E14b.

- eval: E14b
  run_id: minted-trang-thai-rieng-E14b-r4
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/trang-thai-rieng/kiem-khuon-e14.mjs
  verified_at: 2026-11-06T03:52:11Z
  output: |
    E14b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/statuses/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E3d
  run_id: minted-trang-thai-rieng-E3d-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E6c
  run_id: minted-trang-thai-rieng-E6c-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E7c
  run_id: minted-trang-thai-rieng-E7c-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:52:11Z
  output: |
    npm run db:migrate && npm run db:test xanh.

- eval: E15
  run_id: minted-trang-thai-rieng-E15-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:52:11Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (1440): màn Hôm nay của dau-chu-1 ([Mẫu] Sàn thử, chip "Đã đồng bộ 11:15"). Cuối danh sách có nhóm «Mới đổi» (số 1) với dòng A-11.02 · Toà A, 2PN · 68,5 m², lý do «Đang bán → Giữ chỗ — Trưởng nhóm, hôm nay», giá 3,08 tỷ · Bao phí, nút «Còn · giữ giá». Phía trên là nhóm «Thiếu thông tin». Khớp Expected.
  network_observed: clean
  output: |
    Độ lệch so với steps: sàn thử lúc chạy không còn nhãn «Giữ chỗ» và không còn căn Đang bán đủ 5/5 của dau-chu-1, nên máy chuẩn bị lại nhãn và căn trước khi đổi; dev chạy cờ --webpack vì Turbopack tự reload.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-11-06T03:52:11Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-06T03:52:11Z

- cmd: npm run test:hooks
  run_id: minted-trang-thai-rieng-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-06T03:52:11Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-trang-thai-rieng-SUITE-npm_test_w_quy_hang_ui_lint-r4
  exit_code: 0
  verified_at: 2026-11-06T03:52:11Z

- cmd: npm run typecheck
  run_id: minted-trang-thai-rieng-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-06T03:52:11Z

- cmd: npm run lint
  run_id: minted-trang-thai-rieng-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-11-06T03:52:11Z

## Known limits

- E14 (AC-1) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

carried tu round 3 — baseline khong do lai round nay.

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline; chứng minh harness chứ không chứng minh tính năng): E8b (npm test -w @quy-hang/web). Nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 4: E12 failed — bước 6 của đề đòi tài khoản quản trị thấy «Giữ chỗ» ở Bảng hàng, nhưng quản trị sàn không có Bảng hàng (bị chuyển về /today theo bảng quyền theo vai); các bước 1-5 đạt và đối chứng bằng đầu chủ thứ hai đạt. Cần sửa đề E12 hoặc người xác nhận. Lịch sử round 1-3 xem run-log.jsonl.
