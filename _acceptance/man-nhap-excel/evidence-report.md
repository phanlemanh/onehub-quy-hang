---
schema_version: 2
feature_slug: man-nhap-excel
verdict: REJECT
failed_evals: ["E9"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 151ddec7bde1577aef2dfc09ea04b75bc3182646
human_signoff:
---

# Evidence Report: man-nhap-excel

Round 2. Một eval không đạt: E9 (kiểm giao diện, AC-9). Mọi eval máy còn lại và mọi lệnh suite đều xanh.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E8c | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | FAIL |
| E10 | AC-10 | script | PASS |
| E10b | AC-10 | script | PASS |

Lệnh fail không gắn eval: không có. Lệnh duy nhất đỏ là bước kiểm giao diện `ui-check:E9`, thuộc eval E9.

## Evidence

- eval: E1
  run_id: minted-man-nhap-excel-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1853.359291

- eval: E2
  run_id: minted-man-nhap-excel-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1853.359291

- eval: E3
  run_id: minted-man-nhap-excel-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1853.359291

- eval: E4
  run_id: minted-man-nhap-excel-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1853.359291

- eval: E5
  run_id: minted-man-nhap-excel-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 8960.478916

- eval: E6
  run_id: minted-man-nhap-excel-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1853.359291

- eval: E7
  run_id: minted-man-nhap-excel-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 8960.478916

- eval: E8
  run_id: minted-man-nhap-excel-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 55957.768083

- eval: E8b
  run_id: minted-man-nhap-excel-E8b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1853.359291

- eval: E8c
  run_id: minted-man-nhap-excel-E8c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 8960.478916

- eval: E9
  run_id: minted-man-nhap-excel-E9-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:31:02Z
  screenshot: evidence/E9-1-tai-1440.png
  network_observed: n-a (driver)
  observed: |
    Đã mở các khung đã lưu. Bước 1 có ô chọn tệp mau-b.xlsx; bước 2 hiện bảng ghép cột, cột nguồn chỉ hiện hình dạng (vd «chữ số · 1–2 ký tự»); bước 4 hiện bảng Dòng/Hành động/Lý do (Bỏ «file ghi đã bán — không nhập», Tin bổ sung «căn đã có hàng của người khác trong sàn»); bước 5 có câu «Ghi 0 căn mới, cập nhật 0, tin bổ sung 30, bỏ 10»; bước 6 có nút Mở Bảng hàng.
    Các trạng thái .xls, tệp rỗng, không quyền, bỏ hết, lỗi mạng («Thử lại gói 1»), Trưởng nhóm (Tiếp khoá khi chưa chọn) đều hiện đúng ở 1440. Riêng khung xem trước (E9-3) chỉ hiện «Giữ nguyên 640», máy sửa 0, cần người 0, chặn 0: không có ô mang dấu máy sửa, cần người hay chặn và không có lý do khi rê, trái với mục (2) của expected. Các khung 375 của xls, rỗng, không quyền, bỏ hết, lỗi mạng, Trưởng nhóm, tải, tóm tắt chưa mở riêng, chỉ dựa trên kết quả script.
  output: |
    Các bước đã chạy: dựng server thử, chụp các luồng chính, xls, rỗng, không quyền, bỏ hết, lỗi mạng, trưởng nhóm, rời trang, ở 1440 và 375. Server thử đã tắt.
    Đạt: ghép cột chỉ hình dạng; tóm tắt đúng khuôn câu; kết quả có nút Mở Bảng hàng; .xls có hướng dẫn lưu .xlsx; tệp rỗng; không quyền; bỏ hết khoá ghi; lỗi mạng có Thử lại gói 1; Trưởng nhóm Tiếp khoá khi chưa chọn; rời trang hỏi xác nhận.
    Không chứng minh được: lưới xem trước có dấu giữ nguyên / máy sửa / cần người / chặn kèm lý do khi rê. Với mau-b.xlsx chỉ có Giữ nguyên 640, các dấu còn lại bằng 0.
    Ghi chú: luồng chính cho Căn mới 0, cập nhật 0, tin bổ sung 30 (dữ liệu thử), nên hàng «căn mới» và «cập nhật» chưa được minh hoạ. Không đọc mạng (chạy bằng script).

- eval: E10
  run_id: minted-man-nhap-excel-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T06:31:02Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E10b
  run_id: minted-man-nhap-excel-E10b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T06:31:02Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    5 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-04T06:31:02Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T06:31:02Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T06:31:02Z

- cmd: npm run test:hooks
  run_id: minted-man-nhap-excel-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T06:31:02Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T06:31:02Z

- cmd: npm run typecheck
  run_id: minted-man-nhap-excel-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T06:31:02Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả code hiện tại lẫn baseline, chứng minh harness chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lớp chắn hồi quy có chủ ý):

- `npm test -w @quy-hang/web`: E1, E2, E3, E4, E6, E8b
- `npm run test:db -w @quy-hang/web`: E5, E7, E8c
- `npm run db:migrate && npm run db:test`: E8
- `npm run lint`: E10
- `design-floor-khuon.mjs --kiem --root .`: E10b

E9 có baseline n-a (eval giao diện, không đo trên baseline).

## Variance

none — mọi eval đều chạy một lần, không có eval nhiều lượt.

## Iterations

Round 1: không có dữ liệu lịch sử trong đầu vào của vòng này.
Round 2: E9 không đạt. Khung xem trước với mau-b.xlsx không hiện các dấu máy sửa / cần người / chặn và lý do khi rê; chỉ có «Giữ nguyên 640». Các mục (1) và (3) đến (12) của expected đạt. Cần dựng tệp thử có đủ các dấu hoặc sửa màn rồi chạy lại.
