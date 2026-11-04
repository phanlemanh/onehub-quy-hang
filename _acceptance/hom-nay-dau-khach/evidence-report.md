---
schema_version: 2
feature_slug: hom-nay-dau-khach
verdict: REJECT
failed_evals: ["E6b"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 564b68ebd5c0b670e943c833e4449c58884861da
human_signoff:
---

# Evidence Report: hom-nay-dau-khach

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | FAIL |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | script | PASS |

Lệnh fail không gắn eval: ui-check:E6b (gắn với E6b). Round 1 chỉ có E6b đỏ: bước ui-check ghi nhận một yêu cầu 4xx cùng origin ngoài dự kiến (network_observed: app-fail). Mọi bước kiểm hành vi của E6b đều đạt theo ảnh chụp; ảnh hưởng chỉ ở luật mạng.

## Evidence

- eval: E1
  run_id: minted-hom-nay-dau-khach-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 61674.055334

- eval: E2
  run_id: minted-hom-nay-dau-khach-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 61674.055334

- eval: E3
  run_id: minted-hom-nay-dau-khach-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 61674.055334

- eval: E4b
  run_id: minted-hom-nay-dau-khach-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 61674.055334

- eval: E1b
  run_id: minted-hom-nay-dau-khach-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1749.269042

- eval: E5
  run_id: minted-hom-nay-dau-khach-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1749.269042

- eval: E6
  run_id: minted-hom-nay-dau-khach-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1749.269042

- eval: E7
  run_id: minted-hom-nay-dau-khach-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1749.269042

- eval: E4
  run_id: minted-hom-nay-dau-khach-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 698.69025

- eval: E8
  run_id: minted-hom-nay-dau-khach-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T16:22:56Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 24022.807125

- eval: E8b
  run_id: minted-hom-nay-dau-khach-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T16:22:56Z
  output: |
    design-floor-khuon --kiem --root .
    10 tệp giao diện ngoài bản đồ

- eval: E6b
  run_id: E6b-20261104-2330
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T16:22:56Z
  screenshot: evidence/E6b-step1.png
  observed: |
    Đã mở từng ảnh. step1 (full page, 375): "Đầu khách", "10 tin trong 1 ngày", nhóm «Hôm nay»; có đủ ba loại tin: Vừa đổi (Toà B · B-14.04 giá 4,61 → 4,5 tỷ), Căn mới (Toà B · B-14.05, 4,36 tỷ, khớp bộ gửi [Mẫu] Khách chấm), Khách phản ứng ([Mẫu] Khách chấm, 1 mở, quan tâm B-14.04). Có thêm tin cũ từ các lần chạy trước nên tổng 10 chứ không đúng 3. step2: chạm Khách phản ứng → /shares?lan=d5ccee86… (đúng Lần gửi vừa tạo); ngăn chi tiết hiện [Mẫu] Khách chấm, B-14.04 4,5 tỷ 1 quan tâm, «Vừa đổi giá: 4,61 tỷ → 4,5 tỷ», «Gợi ý căn thay B-14.05 · Gửi căn này», A-08.03, «Tắt link». step3: chạm Căn mới → /shares/new?can=42dc957d…; màn «Gửi căn» với 1 căn Toà B B-14.05, 4,36 tỷ đã chọn. step4: tài khoản Đầu khách trống: «Chưa có gì mới trong 7 ngày» kèm mô tả và nút «Gửi căn». step5: /shares?lan=0000…: ngăn chi tiết «Link đã gửi» hiện «Chưa tải được — thử lại» và nút «Thử lại» (DOM xác nhận; nút trong ảnh bị huy hiệu N của Next dev che một phần). Khổ 375: scrollWidth = clientWidth = 375 ở mọi bước, không cuộn ngang.
  network_observed: app-fail
  output: |
    Máy chủ 3491 chạy sẵn, setup bằng API với OTP băm biết trước trong DB dãy L 5571. Assertion: step1 đạt (ba loại tin trong «Hôm nay»); step2 đạt (URL lan= đúng Lần gửi); step3 đạt (can=… đúng căn, 1 căn chọn sẵn); step4 đạt (chữ trống + nút Gửi căn); step5 đạt (lỗi + Thử lại, không trống); không cuộn ngang đạt (375/375). Mạng: có một yêu cầu GET /api/v1/listings bị từ chối 4xx ngay sau lệnh đăng xuất bằng fetch giữa step3 và step4 (trang cũ còn mở gọi đồng bộ lúc đã đăng xuất); nhiều khả năng do cách chạy, nhưng theo luật 4xx cùng origin ngoài dự kiến nên đánh đỏ. Lỗi 404 của /api/v1/shares/0000… là đúng dự kiến. Khuyến nghị: chạy lại không đăng xuất bằng fetch (đóng ngữ cảnh trình duyệt giữa các tài khoản). Ảnh: E6b-step1..5.png, E6b-network.txt trong evidence/.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-dau-khach-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T16:22:56Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-dau-khach-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T16:22:56Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-dau-khach-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T16:22:56Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-dau-khach-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T16:22:56Z

- cmd: npm run lint
  run_id: minted-hom-nay-dau-khach-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T16:22:56Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (đạt trên cả HEAD lẫn baseline; chứng minh harness chứ chưa chứng minh feature; nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- `npm run db:migrate && npm run db:test`: E1, E2, E3, E4b
- `npm test -w @quy-hang/web`: E1b, E5, E6, E7
- `npm test -w @quy-hang/core`: E4
- `npm test -w @quy-hang/ui-lint`: E8
- `design-floor-khuon.mjs --kiem --root .`: E8b

E6b: baseline không đo (n-a).

## Variance

none — every multi-run eval is uniform

## Judge

Không có panel nào được đề xuất cho round này.

## Iterations

Round 1: E6b failed — ui-check ghi một yêu cầu 4xx cùng origin ngoài dự kiến (GET /api/v1/listings ngay sau lệnh đăng xuất bằng fetch giữa step3 và step4); mọi assertion hành vi đạt. Returned to implementation (hoặc chạy lại E6b không đăng xuất bằng fetch).
