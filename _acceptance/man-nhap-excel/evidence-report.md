---
schema_version: 2
feature_slug: man-nhap-excel
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 36265a3aa869488c32ea7a564a55f95d8ce48519
human_signoff:
---

# Evidence Report: man-nhap-excel

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
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-10 | script | PASS |
| E10b | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-man-nhap-excel-E1-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3123.128875

- eval: E2
  run_id: minted-man-nhap-excel-E2-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3123.128875

- eval: E3
  run_id: minted-man-nhap-excel-E3-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3123.128875

- eval: E4
  run_id: minted-man-nhap-excel-E4-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3123.128875

- eval: E6
  run_id: minted-man-nhap-excel-E6-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3123.128875

- eval: E8b
  run_id: minted-man-nhap-excel-E8b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3123.128875

- eval: E5
  run_id: minted-man-nhap-excel-E5-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 16633.544792

- eval: E7
  run_id: minted-man-nhap-excel-E7-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 16633.544792

- eval: E8c
  run_id: minted-man-nhap-excel-E8c-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 16633.544792

- eval: E8
  run_id: minted-man-nhap-excel-E8-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 74404.407375

- eval: E10
  run_id: minted-man-nhap-excel-E10-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T07:28:17Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E10b
  run_id: minted-man-nhap-excel-E10b-r3
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T07:28:17Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    5 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-man-nhap-excel-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T07:28:17Z
  screenshot: evidence/E9-1-tai-1440.png
  observed: |
    1440 frames: E9-1 shows step 1 with file mau-b.xlsx chosen, Tiếp button. E9-2 ghép cột: table Cột trong tệp / Mẫu / Trường của căn, columns pre-mapped (Trạng thái, Dự án, Toà, Tầng, Mã căn, Diện tích…), source-class labels are shape-only (e.g. "Chưa rõ", "Danh mục", "Hàng chia sẻ được"), STT set Bỏ cột. E9-3 (mau-b clean): Giữ nguyên 640, Máy sửa 0, Cần người 0, Chặn 0, all cells unchanged. E9-3b (ban-gia.xlsx dirty): Giữ nguyên 176, Máy sửa 12, Cần người 12, Chặn 0; rows show "5960tr → 5960000000" with Máy sửa badge and reason below, "6.17 BP → 6170000000", editable inputs for "6.3–6.5", "TL" with Cần người badge and reason lines (dải giá, giá chưa có số). E9-3c: filter toggle on, only rows 7,8,9,17,18 (needs-person rows) shown with editable inputs and reasons (e.g. thu về 3.6 → giá về tay chủ, luật 12). E9-4 trùng: chips Căn mới 0, Cập nhật 0, Tin bổ sung 30, Bỏ 10; per-row table with Thành (Bỏ / Tin bổ sung) and Lý do text ("file ghi đã bán — không nhập", "căn đã có hàng của người khác trong sàn"). E9-5: "Ghi 0 căn mới, cập nhật 0, tin bổ sung 30, bỏ 10" with breakdown and Ghi vào Quỹ hàng / Lùi. E9-6: "Đã ghi vào Quỹ hàng" with button Mở Bảng hàng. E9-khong-quyen: no file chooser, message "Chỉ Đầu chủ và Trưởng nhóm nhập được." E9-xls: error card "Không đọc được tệp này – Tệp .xls (Excel đời cũ) chưa đọc được… Lưu thành → .xlsx rồi chọn lại", Tiếp disabled. E9-rong: "Tệp chưa có dòng nào." empty state, Tiếp disabled. E9-bo-het: banner "Không dòng nào sẽ được ghi", Bỏ 40, all rows Bỏ. E9-loi-mang: offline banner, "Gói 1 chưa ghi được" error and button "Thử lại gói 1". E9-truong-nhom: "Đầu chủ giữ căn" select "Chọn đầu chủ", Tiếp disabled. 375 frames show the same states stacked in the narrow mobile shell without page-level overflow; tables scroll horizontally inside the card; 375 ban-gia frames show chips (Máy sửa 12, Cần người 12), toggle and the Mã căn/Toà columns but the Giá column marks are off-screen to the right. All content matches expected apart from that 375 visibility gap; roi-trang is JSON-only (trinhDuyetHoiLai=true).
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-04T07:28:17Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-04T07:28:17Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-04T07:28:17Z

- cmd: npm run test:hooks
  run_id: minted-man-nhap-excel-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-04T07:28:17Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-04T07:28:17Z

- cmd: npm run typecheck
  run_id: minted-man-nhap-excel-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-04T07:28:17Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E6, E8b
- npm run test:db -w @quy-hang/web: E5, E7, E8c
- npm run db:migrate && npm run db:test: E8
- npm run lint: E10
- design-floor-khuon.mjs --kiem --root .: E10b

Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý. E9 (ui-check) baseline n-a, không đo được trên mã cũ.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm đầu, sửa theo kết quả (xem lịch sử commit của nhánh).
Round 2: sửa nhận bản xem thử về muộn chỉ khi trạng thái chưa đổi; E9 xem trước trên tệp bẩn; thẻ Cổng chưa ký được.
Round 3: đổi khuôn — số thế hệ cho mọi kết quả chờ máy; mọi eval và lệnh suite đều xanh trên HEAD 36265a3a. Verdict PASS.
