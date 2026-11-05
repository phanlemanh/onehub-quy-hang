---
schema_version: 2
feature_slug: doi-dau-chu-hang-loat
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 572998119e5355950a2e4004ee6c8dae0a1bb5a8
human_signoff:
---

# Evidence Report: doi-dau-chu-hang-loat

Vòng 3. Mọi eval của hồ sơ đều đạt, nhưng verdict là REJECT vì hai lý do: lệnh suite `npm run typecheck` không gắn eval nào đã dừng với mã lỗi khác 0 (ba lỗi kiểu ở `apps/web/src/app/(app)/inventory/bulk/doi-dau-chu.test.ts`, dòng 186 và 191), và phản biện còn một phát hiện trong hợp đồng chưa đóng (phép đo «khongTaiLai» của E9 không thể ra sai). Chi tiết ở `review-findings.md`.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E1c | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E4c | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-1 | script | PASS |
| E9 | AC-9 | ui-check | PASS |
| E9b | AC-4 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-doi-dau-chu-hang-loat-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 732.076541

- eval: E1b
  run_id: minted-doi-dau-chu-hang-loat-E1b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 2870.0315

- eval: E4b
  run_id: minted-doi-dau-chu-hang-loat-E4b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 2870.0315

- eval: E1c
  run_id: minted-doi-dau-chu-hang-loat-E1c-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 86415.78925

- eval: E2
  run_id: minted-doi-dau-chu-hang-loat-E2-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 86415.78925

- eval: E3
  run_id: minted-doi-dau-chu-hang-loat-E3-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 86415.78925

- eval: E4
  run_id: minted-doi-dau-chu-hang-loat-E4-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 86415.78925

- eval: E5
  run_id: minted-doi-dau-chu-hang-loat-E5-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 86415.78925

- eval: E6
  run_id: minted-doi-dau-chu-hang-loat-E6-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 86415.78925

- eval: E7
  run_id: minted-doi-dau-chu-hang-loat-E7-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 86415.78925

- eval: E4c
  run_id: minted-doi-dau-chu-hang-loat-E4c-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 14176.666834

- eval: E8
  run_id: minted-doi-dau-chu-hang-loat-E8-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.doi_dau_chu_tai_lieu
  verified_at: 2026-11-05T04:52:43Z
  output: |
    ℹ duration_ms 138.34475

- eval: E8b
  run_id: minted-doi-dau-chu-hang-loat-E8b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T04:52:43Z
  output: |
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-doi-dau-chu-hang-loat-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T04:52:43Z
  screenshot: evidence/E9-hop-hoi.png
  observed: |
    E9-hop-hoi.png: hộp «Đổi đầu chủ 5 căn», mô tả «Mọi căn cùng chủ nhà đi theo · 2 liên hệ chủ nhà đổi người giữ.», ô chọn [Mẫu] Đầu chủ 2, liệt kê đủ 5 căn (A-04.06, A-10.05, A-06.03, A-08.03, A-11.02) đều «đang giữ: [Mẫu] Đầu chủ 1», 3 căn (A-06.03, A-08.03, A-11.02) có «· cùng chủ nhà»; không có tên hay số chủ nhà. Nút Thôi / Đổi đầu chủ. E9-sau-doi.png: bảng hàng 26 căn, hộp đang mờ dần, toast «Đã đổi đầu chủ 5 căn, 2 liên hệ» kèm nút «Hoàn tác» (đang hiện dần); trang không tải lại. E9-hoan-tac.png: toast «Đã trả lại người giữ cũ: 7 mục (căn và liên hệ)», bảng bình thường, không còn căn tích. E9-dau-chu.png: đầu chủ DA đăng nhập, tích 1 căn, thanh công cụ chỉ có Đổi trạng thái, Đánh dấu đã gọi, Bỏ chọn — không có «Đổi đầu chủ». Lưu ý nhỏ: chữ toast không hiện số giây chờ trong ảnh (JSON ghi giay:1), ảnh chụp lúc toast đang hiện dần.
  network_observed: n-a (driver)

- eval: E9b
  run_id: minted-doi-dau-chu-hang-loat-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T04:52:43Z
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-step1.png (cảnh sau-doi): bảng hàng 26 căn, thông báo cuối trang "Đã đổi đầu chủ 5 căn, 2 liên hệ" kèm nút Hoàn tác. E9b-step2.png (cảnh hoàn tác): thông báo mờ dần "Đã trả lại người giữ cũ: 7 mục (căn và liên hệ)", nút Hoàn tác đã biến mất. Cả hai khớp kết quả JSON từ Postgres.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T04:52:43Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T04:52:43Z

- cmd: npm run test:hooks
  run_id: minted-doi-dau-chu-hang-loat-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T04:52:43Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-05T04:52:43Z

- cmd: npm run typecheck
  run_id: minted-doi-dau-chu-hang-loat-SUITE-typecheck-r3
  exit_code: 1
  verified_at: 2026-11-05T04:52:43Z
  output: |
    @quy-hang/web typecheck: tsc --noEmit -p .
    src/app/(app)/inventory/bulk/doi-dau-chu.test.ts(186,22): error TS2532: Object is possibly 'undefined'.
    src/app/(app)/inventory/bulk/doi-dau-chu.test.ts(191,25): error TS2532: Object is possibly 'undefined'.
    src/app/(app)/inventory/bulk/doi-dau-chu.test.ts(191,45): error TS2322: Type '{ userId: string; displayName: string; } | undefined' is not assignable to type '{ userId: string; displayName: string; }'.
    Các gói api, connect, core, db: tsc sạch.

- cmd: npm run lint
  run_id: minted-doi-dau-chu-hang-loat-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T04:52:43Z

Lệnh fail không gắn eval: `npm run typecheck` (không eval nào khai lệnh này; lỗi kiểu nằm trong tệp kiểm thử mới của chính tính năng).

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt được (xanh trên cả mã cũ lẫn mã mới, nên chỉ chứng minh bộ đo chứ chưa chứng minh tính năng; cần viết lại để khẳng định hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/core`: E1
- `npm test -w @quy-hang/web`: E1b, E4b
- `npm run db:migrate && npm run db:test`: E1c, E2, E3, E4, E5, E6, E7
- `npm run test:db -w @quy-hang/web`: E4c
- `node --test "_acceptance/doi-dau-chu-hang-loat/thu/*.test.mjs"`: E8
- bước chấm khuôn `design-floor-khuon.mjs --kiem`: E8b

Baseline không đo: E9, E9b (n-a, bài ui-check không chạy trên mã cũ).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E9 failed — ảnh và số đo giao diện chưa đạt; phản biện nêu thêm các bài đo yếu (E3 quét số điện thoại chưa từng ghi vào cơ sở dữ liệu, E6 hoàn tác chéo sàn không đối chứng). Returned to implementation.
Round 2: mọi eval đạt nhưng 4 bài đo còn yếu (hình 4 âm tính không đối chứng) → REJECT. Returned to implementation (commit sửa bài đo quét chủ nhà, ba hàm × bốn vai, ô chọn và thông báo).
Round 3: mọi eval đạt, nhưng typecheck của gói web đỏ (ba lỗi kiểu trong bài kiểm thử mới) và còn một phát hiện trong hợp đồng (ô «khongTaiLai» của E9 không thể ra sai) → REJECT. Returned to implementation.
