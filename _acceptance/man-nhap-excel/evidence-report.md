---
schema_version: 2
feature_slug: man-nhap-excel
verdict: REJECT
failed_evals: ["E8","E10b"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 1f1a36900ce62387ca8b16e127f543cbc72472b4
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
| E8 | AC-8 | test | FAIL |
| E8b | AC-8 | test | PASS |
| E8c | AC-8 | test | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-10 | script | PASS |
| E10b | AC-10 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-man-nhap-excel-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm test -w @quy-hang/web xanh, thời gian chạy 2608 ms.

- eval: E2
  run_id: minted-man-nhap-excel-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm test -w @quy-hang/web xanh (chung lệnh với E1).

- eval: E3
  run_id: minted-man-nhap-excel-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm test -w @quy-hang/web xanh (chung lệnh với E1).

- eval: E4
  run_id: minted-man-nhap-excel-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm test -w @quy-hang/web xanh (chung lệnh với E1).

- eval: E5
  run_id: minted-man-nhap-excel-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm run test:db -w @quy-hang/web xanh, thời gian chạy 12636 ms.

- eval: E6
  run_id: minted-man-nhap-excel-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm test -w @quy-hang/web xanh (chung lệnh với E1).

- eval: E7
  run_id: minted-man-nhap-excel-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm run test:db -w @quy-hang/web xanh (chung lệnh với E5).

- eval: E8
  run_id: minted-man-nhap-excel-E8-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T04:35:34Z
  output: |
    Lệnh npm run db:migrate && npm run db:test: 306 ca, 305 qua, 1 hỏng.
    Ca hỏng: test-db/va-thong-bao-lead.test.ts, «AC-5 đối chứng đỏ: bỏ hạn chót thì nhịp thử đủ sáu dòng và quá ba giây».
    Thông báo: bỏ hạn chót: 6 dòng, 2948 ms (ngưỡng đòi quá ba giây, thực tế 2948 ms).
    Các ca cách ly Chỉ tôi / sàn khác trong cùng lượt đều qua.

- eval: E8b
  run_id: minted-man-nhap-excel-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm test -w @quy-hang/web xanh (chung lệnh với E1).

- eval: E8c
  run_id: minted-man-nhap-excel-E8c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm run test:db -w @quy-hang/web xanh (chung lệnh với E5).

- eval: E9
  run_id: minted-man-nhap-excel-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T04:35:34Z
  screenshot: evidence/E9-1-tai-1440.png
  observed: |
    1440: E9-1 bước Tải tệp, ô chọn mau-b.xlsx, nút Tiếp. E9-2 Ghép cột: bảng Cột trong tệp / Mẫu / Trường của căn, đã ghép sẵn, dưới mỗi tên cột là chú thích lớp nguồn (Chưa rõ, Hàng chia sẻ được, Danh mục) tức hình dạng không lộ dữ liệu nguồn. E9-3 Xem trước: chú giải Giữ nguyên 640, Máy sửa 0, Cần người 0, Chặn 0, công tắc chỉ dòng cần người/chặn, lưới có cột Bỏ. E9-4 Trùng: bảng Dòng / Thành / Lý do (Bỏ "file ghi đã bán — không nhập", Tin bổ sung "căn đã có hàng của người khác trong sàn") kèm nút Bỏ theo dòng. E9-5 Tóm tắt: "Ghi 0 căn mới, cập nhật 0, tin bổ sung 30, bỏ 10", nút Lùi và Ghi vào Quỹ hàng. E9-6 Xong: "Đã ghi vào Quỹ hàng" và nút Mở Bảng hàng. E9-khong-quyen (Đầu khách): "Chỉ Đầu chủ và Trưởng nhóm nhập được", không có ô chọn tệp. E9-xls: "Không đọc được tệp này ... Mở tệp bằng Excel, chọn Lưu thành → .xlsx rồi chọn lại", Tiếp khoá. E9-rong: "Tệp chưa có dòng nào", Tiếp khoá. E9-bo-het: "Không dòng nào sẽ được ghi — Mọi dòng đều bị bỏ", Bỏ·40. E9-loi-mang: banner mất mạng, "Gói 1 chưa ghi được", nút "Thử lại gói 1". E9-truong-nhom: ô "Đầu chủ giữ căn — Chọn đầu chủ", Tiếp khoá khi chưa chọn. 375: các ảnh xem trước, bỏ hết, lỗi mạng, xong đều bố cục dọc, không vỡ, nội dung giống 1440 (lưới/bảng cuộn ngang). Khoảng trống nhỏ: mau-b không sinh dấu Máy sửa/Cần người/Chặn nên chưa thấy ô có dấu và lý do khi rê.
  network_observed: n-a (driver)

- eval: E10
  run_id: minted-man-nhap-excel-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T04:35:34Z
  output: |
    npm run lint: «chuẩn giao diện: đạt».

- eval: E10b
  run_id: minted-man-nhap-excel-E10b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T04:35:34Z
  output: |
    bản đồ nhóm nhap-excel đổi sau khi ghim — chấm theo bản ghim
    bản đồ nhóm trang-tam đổi sau khi ghim — chấm theo bản ghim
    lệch: apps/web/src/app/(app)/imports/new/page.tsx · khuôn Placeholder · nhóm trang-tam
    lệch: apps/web/src/app/(app)/proto/man-nhap-excel/page.tsx · thuộc hai nhóm màn: nhap-excel, trang-tam
    6 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-04T04:35:34Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T04:35:34Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T04:35:34Z

- cmd: npm run test:hooks
  run_id: minted-man-nhap-excel-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T04:35:34Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-man-nhap-excel-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-04T04:35:34Z
  note: ca trong tests/rang-giu-khuon.test.mjs (dòng 164) hỏng; không gắn eval nào. Đầu ra lint cùng lượt báo «khuôn: 13 nhóm · 0 lỗi đọc · 0 lệch» và «chuẩn giao diện: đạt».

- cmd: npm run typecheck
  run_id: minted-man-nhap-excel-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T04:35:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên code hiện tại lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- npm test -w @quy-hang/web: E1, E2, E3, E4, E6, E8b
- npm run test:db -w @quy-hang/web: E5, E7, E8c
- npm run lint: E10

Lệnh hỏng không gắn eval: npm run db:migrate && npm run db:test (E8), lệnh chấm khuôn design-floor-khuon (E10b), npm test -w @quy-hang/ui-lint (không eval).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8 và E10b hỏng. E8 hỏng ở một ca thời gian của gói va-thong-bao-lead (bỏ hạn chót chạy 2948 ms, ngưỡng đòi quá ba giây; ngoài các ca đường nhập). E10b hỏng vì bản đồ nhóm nhap-excel và trang-tam đổi sau khi ghim, trang /imports/new bị chấm khuôn Placeholder thuộc nhóm trang-tam, trang proto thuộc hai nhóm. Ca ui-lint rang-giu-khuon cũng hỏng. Quay lại thi công.
