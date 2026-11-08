---
schema_version: 2
feature_slug: chu-san-du-vai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 16dffc30346f998a7e4369a6490c776c69142d2b
human_signoff: Manh Phan 2026-11-09
---

# Evidence Report: chu-san-du-vai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | PASS |
| E3b | AC-3 | test | PASS |
| E3c | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E5c | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chu-san-du-vai-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.chu_san_goi_vai
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node --import tsx --test packages/core/src/access/goi-vai.test.ts
    ℹ duration_ms 56.421167

- eval: E2
  run_id: minted-chu-san-du-vai-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/chu-san-du-vai/thu/chay-db.mjs
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node _acceptance/chu-san-du-vai/thu/chay-db.mjs mo-san
    ℹ duration_ms 364.466667

- eval: E3
  run_id: minted-chu-san-du-vai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T17:22:20Z
  screenshot: evidence/E3-chua-tich-1440.png
  observed: |
    E3-chua-tich-1440: hộp Mời người, năm ô Vai (Telesales, Đầu chủ, Đầu khách, Trưởng nhóm, Quản trị sàn) đều chưa tích; dòng mô tả đúng chữ «Tích Quản trị sàn hay Trưởng nhóm là tích sẵn các vai đi kèm; bỏ tích vai nào không cần.»; hộp không vỡ. E3-tich-san-1440: cả năm ô đã tích, mô tả giữ nguyên, bố cục nguyên vẹn. E3-go-bot-1440: Telesales bỏ tích, bốn ô còn lại đã tích, không vỡ. E3-danh-sach-1440: trang Người dùng, 15 thành viên; ba dòng chi-ts có nhãn Telesales, Trưởng nhóm, Đầu chủ, Đầu khách, khớp ca sua-them; các dòng khác hiển thị bình thường. E3-tich-san-375: khổ điện thoại, hộp vừa khung, năm ô đã tích xếp hai hàng, mô tả xuống dòng gọn, hai nút Mời và Huỷ xếp dọc, không tràn ngang. Tất cả khớp Expected.
  network_observed: n-a (driver)
  output: |
    Lệnh chay-ui.mjs --e3 thoát 0. Các assertion đều đạt: chua-tich năm ô false; tich-san năm ô true; go-bot Telesales false, bốn ô kia true; moi-luu db đúng [buyer_agent, company_admin, listing_agent, team_lead]; sua-them db đúng [buyer_agent, listing_agent, team_lead, telesales]; sua-go-bot db đúng [company_admin]; kho-375 năm ô true, trongKhung true. Đã tắt máy dev bằng dung-q.mjs --tat.

- eval: E3b
  run_id: minted-chu-san-du-vai-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.chu_san_vai_trong_hop
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node --import tsx --test "apps/web/src/app/(app)/settings/users/vai-trong-hop.test.ts"
    ℹ duration_ms 75.090125

- eval: E3c
  run_id: minted-chu-san-du-vai-E3c-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/chu-san-du-vai/thu/chay-db.mjs
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node _acceptance/chu-san-du-vai/thu/chay-db.mjs api
    ℹ duration_ms 735.018334

- eval: E4
  run_id: minted-chu-san-du-vai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/chu-san-du-vai/thu/chay-db.mjs
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node _acceptance/chu-san-du-vai/thu/chay-db.mjs api
    ℹ duration_ms 735.018334

- eval: E5
  run_id: minted-chu-san-du-vai-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.chu_san_nguoi_du_vai
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node --import tsx --test packages/core/src/access/nguoi-du-vai.test.ts
    ℹ duration_ms 54.124542

- eval: E5b
  run_id: minted-chu-san-du-vai-E5b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T17:22:20Z
  screenshot: evidence/E5b-dau-tien-1440.png
  observed: |
    E5b-dau-tien-1440: màn Hôm nay (/today) sàn "[Thử] đủ vai", rail trái có 5 biểu tượng nhà cộng bánh răng cài đặt, đầu trang có nút "+ Lead" kèm mũi tên menu; đã hiện nội dung đầy đủ (thẻ Lead quá hạn/Ngoại lệ/Hàng cũ, bảng Theo đầu chủ), không còn khung chờ. E5b-menu-tao-1440: menu thả từ nút mũi tên mở, đúng hai mục "Nhập Excel" và "Xuất bảng hàng". E5b-bang-hang-1440: tiêu đề "Bảng hàng — Có hàng gì, ở đâu?", trạng thái trống "Sàn chưa có hàng nào" với nút Nhập Excel, không phải trang lỗi, không khung chờ. E5b-chi-cau-hinh-1440: người chỉ Quản trị sàn, màn Cài đặt > Người dùng, rail chỉ có bánh răng cài đặt, đầu trang không có nhóm «Tạo»/nút Lead; tên sàn hiển thị "[Mẫu] Sàn thử", danh sách 15 thành viên, đã hết khung chờ.
  network_observed: n-a (driver)
  output: |
    Ảnh khớp các dòng, không còn khung chờ. PASS. Ảnh đã lưu: E5b-dau-tien-1440.png, E5b-menu-tao-1440.png, E5b-bang-hang-1440.png, E5b-chi-cau-hinh-1440.png.

- eval: E5c
  run_id: minted-chu-san-du-vai-E5c-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/chu-san-du-vai/thu/chay-db.mjs
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node _acceptance/chu-san-du-vai/thu/chay-db.mjs api
    ℹ duration_ms 735.018334

- eval: E6
  run_id: minted-chu-san-du-vai-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/chu-san-du-vai/thu/chay-db.mjs
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node _acceptance/chu-san-du-vai/thu/chay-db.mjs api
    ℹ duration_ms 735.018334

- eval: E7
  run_id: minted-chu-san-du-vai-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/chu-san-du-vai/thu/kiem-tai-lieu.mjs
  verified_at: 2026-11-08T17:22:20Z
  output: |
    node _acceptance/chu-san-du-vai/thu/kiem-tai-lieu.mjs
    KẾT: ĐẠT

- eval: E8
  run_id: minted-chu-san-du-vai-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T17:22:20Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-chu-san-du-vai-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.floor
  verified_at: 2026-11-08T17:22:20Z
  output: |
    design-floor-s4.mjs --root .
    không có mã màu thô trên tệp giao diện vòng chạm

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-chu-san-du-vai-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T17:22:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-chu-san-du-vai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T17:22:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chu-san-du-vai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T17:22:20Z

- cmd: npm run test:hooks
  run_id: minted-chu-san-du-vai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T17:22:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chu-san-du-vai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-08T17:22:20Z

- cmd: npm run typecheck
  run_id: minted-chu-san-du-vai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T17:22:20Z

- cmd: npm run lint
  run_id: minted-chu-san-du-vai-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T17:22:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên nhánh lẫn baseline):
- E8: bước chấm khuôn xanh cả hai phía, giữ như lưới hồi quy có chủ ý.
- E9: bước chấm màu thô xanh cả hai phía, giữ như lưới hồi quy có chủ ý.

Baseline khong do:
- node --import tsx --test packages/core/src/access/goi-vai.test.ts: bo qua baseline: tep packages/core/src/access/goi-vai.test.ts co o cay dang kiem nhung chua co o merge-base 0f1302e3581428763ad44f3926bf59888d3da7f9 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-san-du-vai/thu/chay-db.mjs mo-san: bo qua baseline: tep _acceptance/chu-san-du-vai/thu/chay-db.mjs co o cay dang kiem nhung chua co o merge-base 0f1302e3581428763ad44f3926bf59888d3da7f9 — eval moi, chay tren code cu khong phan biet gi
- node --import tsx --test "apps/web/src/app/(app)/settings/users/vai-trong-hop.test.ts": bo qua baseline: tep apps/web/src/app/(app)/settings/users/vai-trong-hop.test.ts co o cay dang kiem nhung chua co o merge-base 0f1302e3581428763ad44f3926bf59888d3da7f9 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-san-du-vai/thu/chay-db.mjs api: bo qua baseline: tep _acceptance/chu-san-du-vai/thu/chay-db.mjs co o cay dang kiem nhung chua co o merge-base 0f1302e3581428763ad44f3926bf59888d3da7f9 — eval moi, chay tren code cu khong phan biet gi
- node --import tsx --test packages/core/src/access/nguoi-du-vai.test.ts: bo qua baseline: tep packages/core/src/access/nguoi-du-vai.test.ts co o cay dang kiem nhung chua co o merge-base 0f1302e3581428763ad44f3926bf59888d3da7f9 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/chu-san-du-vai/thu/kiem-tai-lieu.mjs: bo qua baseline: tep _acceptance/chu-san-du-vai/thu/kiem-tai-lieu.mjs co o cay dang kiem nhung chua co o merge-base 0f1302e3581428763ad44f3926bf59888d3da7f9 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm đầu; phép đo E5b, ma trận E1 và chỗ thử được sửa (commit 16dffc30).
Round 2: mọi eval và lệnh suite đạt, verdict PASS.
