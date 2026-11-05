---
schema_version: 2
feature_slug: cach-goi-rieng
verdict: REJECT
failed_evals: ["E15"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a85d7d95b1278967b0e970cb9c7f22729b940d9b
human_signoff:
---

# Evidence Report: cach-goi-rieng

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-1 | ui-check | PASS |
| E12 | AC-4 | ui-check | PASS |
| E13 | AC-7 | ui-check | PASS |
| E14 | AC-6 | ui-check | PASS |
| E15 | AC-1 | script | FAIL |

Eval thất bại: E15. Lệnh thất bại: chỉ một lệnh là bộ chấm khuôn của E15 (`design-floor-khuon.mjs --kiem --root .`); không có lệnh thất bại nào không gắn eval.

## Evidence

- eval: E1
  run_id: minted-cach-goi-rieng-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 91263.418

- eval: E2
  run_id: minted-cach-goi-rieng-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 91263.418

- eval: E2b
  run_id: minted-cach-goi-rieng-E2b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 91263.418

- eval: E3b
  run_id: minted-cach-goi-rieng-E3b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 91263.418

- eval: E6b
  run_id: minted-cach-goi-rieng-E6b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 91263.418

- eval: E8
  run_id: minted-cach-goi-rieng-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 91263.418

- eval: E9
  run_id: minted-cach-goi-rieng-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 91263.418

- eval: E3
  run_id: minted-cach-goi-rieng-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 990.772125

- eval: E6
  run_id: minted-cach-goi-rieng-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 990.772125

- eval: E7
  run_id: minted-cach-goi-rieng-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 990.772125

- eval: E10b
  run_id: minted-cach-goi-rieng-E10b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 990.772125

- eval: E3c
  run_id: minted-cach-goi-rieng-E3c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3308.307375

- eval: E4
  run_id: minted-cach-goi-rieng-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3308.307375

- eval: E5
  run_id: minted-cach-goi-rieng-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3308.307375

- eval: E6c
  run_id: minted-cach-goi-rieng-E6c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3308.307375

- eval: E7b
  run_id: minted-cach-goi-rieng-E7b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3308.307375

- eval: E9b
  run_id: minted-cach-goi-rieng-E9b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3308.307375

- eval: E10
  run_id: minted-cach-goi-rieng-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3308.307375

- eval: E7c
  run_id: minted-cach-goi-rieng-E7c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-05T15:03:51Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 1173.201708

- eval: E15
  run_id: minted-cach-goi-rieng-E15-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T15:03:51Z
  output: |
    lệch: apps/web/src/app/(app)/settings/labels/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam
    nợ cũ: apps/web/src/app/(app)/inventory/page.tsx · thuộc hai nhóm màn: bang-hang, trang-tam
    19 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-cach-goi-rieng-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T15:03:51Z
  screenshot: evidence/E11-step1.png
  observed: |
    step1 (1440): vỏ đủ cột nhà, cột Cài đặt với "Cách gọi" sáng, breadcrumb Cài đặt > Sàn [Mẫu] Sàn thử > Cách gọi, câu "Chỉ áp cho sàn [Mẫu] Sàn thử", khối "Tên của sàn" với nhóm "Tên trường", các dòng "Đang dùng tên mặc định". step2: nhóm "Giá trị riêng", ô "Điều kiện phí · Bao phí" = BP kèm nút "Trả về mặc định", cuối trang khối "Đã lưu cách gọi". step3: dòng Điều kiện phí = "Phí CN"; dòng Pháp lý có ô viền đỏ chứa "Gọi 0900 000 001". step4: khung xương đang tải, không dùng làm bằng chứng (ô trống xác nhận bằng DOM). step5 (375): một cột, thanh dưới "Cài đặt sàn/Tôi", không cuộn ngang.
  network_observed: clean

- eval: E12
  run_id: minted-cach-goi-rieng-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T15:03:51Z
  screenshot: evidence/E12-step1.png
  observed: |
    step1 (1440, /inventory): bảng 44/44 căn; căn bao phí hiện «BP», căn không bao phí hiện «Không bao phí»; cột «Phí CN» có trong cây truy cập, bị cắt ở mép phải khung nhìn. step2: ô lọc cột «Phí CN» có ba lựa chọn «Mọi điều kiện», «BP», «Không bao phí». step2b: chọn «BP» thì đầu bảng «22 / 44 căn», khớp 22 căn included từ API. step3 (375): thẻ căn hiện «BP» dưới giá, căn không bao phí hiện «Không bao phí».
  network_observed: clean

- eval: E13
  run_id: minted-cach-goi-rieng-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T15:03:51Z
  screenshot: evidence/E13-step1.png
  observed: |
    step1 (390 rộng): đầu trang «[Mẫu] Sàn thử / [Mẫu] Đầu khách gửi bạn 1 căn»; một thẻ căn «Toà A», giá «7,95 tỷ» có «BP» chữ xám nhỏ cạnh giá, nút «Quan tâm». step2: chi tiết căn có hai dòng nhãn «Pháp lý» và «Hiện trạng», không có chữ nào của nhãn lý do ngừng.
  network_observed: clean

- eval: E14
  run_id: minted-cach-goi-rieng-E14-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T15:03:51Z
  screenshot: evidence/E14-step1.png
  observed: |
    step1 (1440): hộp thoại «Xuất bảng hàng» bước 3 Xem trước, mẫu Bài Zalo, Nhóm môi giới, 2 căn; dạng dòng chữ, A-03.01 «Không bao phí», A-13.01 «BP»; mẫu này không có hàng tiêu đề. step2 (mẫu Excel): bảng xem trước có tiêu đề cột «Phí CN», A-13.01 = «BP», A-03.01 = «Không bao phí», không có cột lý do ngừng; banner «Cột không ra ngoài: Người giữ, Mức đủ, Ai thấy».
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-cach-goi-rieng-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T15:03:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cach-goi-rieng-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T15:03:51Z

- cmd: npm run test:hooks
  run_id: minted-cach-goi-rieng-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T15:03:51Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-cach-goi-rieng-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T15:03:51Z

- cmd: npm run typecheck
  run_id: minted-cach-goi-rieng-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-05T15:03:51Z

- cmd: npm run lint
  run_id: minted-cach-goi-rieng-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T15:03:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên bản cũ lẫn bản mới, chứng minh khung chạy chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):

- `npm test -w @quy-hang/core`: E3, E6, E7, E10b (baseline green)
- `npm test -w @quy-hang/web`: E3c, E4, E5, E6c, E7b, E9b, E10 (baseline green)
- `npm run test:ro-ri`: E7c (baseline green)

Ghi chú: E15 cũng xanh trên bản cũ (baseline green) và đỏ trên bản mới. Nguyên nhân đỏ là dòng «lệch:» của `settings/labels/page.tsx` thuộc hai nhóm màn cai-dat-san và trang-tam. Hợp đồng cho phép đúng dòng này (giới hạn kit#485), nhưng lệnh vẫn trả về thất bại nên không tính là đạt.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E15 failed — bộ chấm khuôn báo «lệch» ở settings/labels/page.tsx (thuộc hai nhóm màn cai-dat-san, trang-tam); các eval còn lại đạt. Returned to implementation.
