---
schema_version: 2
feature_slug: che-vung-anh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 233064a19f46225e68f16609038f8749ae716fe3
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: che-vung-anh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-2 | test | PASS |
| E2 | AC-3 | test | PASS |
| E3 | AC-4 | test | PASS |
| E4 | AC-6 | test | PASS |
| E5 | AC-7 | test | PASS |
| E6 | AC-1 | ui-check | PASS |
| E7 | AC-2 | ui-check | PASS |
| E8 | AC-5 | ui-check | PASS |
| E9 | AC-7 | ui-check | PASS |
| E10 | AC-8 | script | PASS |
| E11 | AC-8 | script | PASS |
| E12 | AC-8 | script | PASS |
| E13 | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-che-vung-anh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:03:19Z
  output: |
    npm test -w @quy-hang/web: duration_ms 367.68

- eval: E2
  run_id: minted-che-vung-anh-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:03:19Z
  output: |
    npm test -w @quy-hang/web: duration_ms 367.68

- eval: E3
  run_id: minted-che-vung-anh-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:03:19Z
  output: |
    npm test -w @quy-hang/web: duration_ms 367.68

- eval: E4
  run_id: minted-che-vung-anh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:03:19Z
  output: |
    npm test -w @quy-hang/web: duration_ms 367.68

- eval: E5
  run_id: minted-che-vung-anh-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T16:03:19Z
  output: |
    npm test -w @quy-hang/web: duration_ms 367.68

- eval: E6
  run_id: E6-che-vung-anh
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/bang-hang-kieu-sheet/thu/cdp.mjs
  verified_at: 2026-11-01T16:03:19Z
  screenshot: evidence/E6-menu.png
  observed: |
    E6-step1.png / E6-menu.png: ho so A-06.03, Toa A, vai dau-chu-1; tab Gui duoc (1) dang chon, 1 anh co nhan Bia; menu ba cham mo ra 5 muc: Dat lam anh bia, Danh dau Anh mau, Chuyen sang Noi bo, Che vung..., Xoa khoi can (Xoa mau do). Dung expected: co Che vung....
    E6-step2.png: cung nguoi, tab Noi bo (1), anh lam toi; menu mo ra chi 2 muc: Chuyen sang Gui duoc, Xoa khoi can. Khong co Che vung.... Dung expected.
    E6-step3.png: dau-chu-2 cung ho so A-06.03; tab Gui duoc (1) hien anh voi nhan Bia, Noi bo hien o khoa va khong co so dem; duoi anh chi co nhan Anh that, khong co nut ba cham, khong co menu nao. Khong co Che vung.... Dung expected.
  network_observed: clean

- eval: E7
  run_id: minted-che-vung-anh-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/bang-hang-kieu-sheet/thu/cdp.mjs
  verified_at: 2026-11-01T16:03:19Z
  screenshot: evidence/E7-mo.png
  observed: |
    E7-mo.png: hộp thoại «Che vùng» trên nền mờ, ảnh mẫu lưới có ô đỏ và ô xanh hiện nguyên màu, chân hộp thoại ghi «0 vùng che», nút «Lưu bản che» màu xám nhạt (tắt), «Bỏ khung cuối» và «Bỏ hết» nhạt. Khớp expected «chưa khung, Lưu tắt».
    E7-hai-khung.png: hai khung tô đen đặc, một trong ô đỏ (góc trên trái), một trong ô xanh (góc dưới phải). Chân ghi «2 vùng che», nút «Lưu bản che» màu đen (bật). Khớp expected.
    E7-step3-bo-het.png: ảnh sạch, chân ghi «0 vùng che», nút Lưu lại xám nhạt (tắt). Khớp expected. Số khung sau «Bỏ khung cuối» (1 vùng che) đọc từ DOM, không có frame riêng. Ghi chú bố cục: panel trắng của hộp thoại hẹp hơn canvas, nên canvas và cụm nút tràn ra phải ngoài panel.
  network_observed: clean

- eval: E8
  run_id: E8-che-vung-anh-20261101
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/bang-hang-kieu-sheet/thu/cdp.mjs
  verified_at: 2026-11-01T16:03:19Z
  screenshot: evidence/E8-da-luu.png
  observed: |
    E8-step2b.png: trình «Che vùng» ở 1440x900, ảnh dọc 450x600 đã xoay đúng chiều: ô xanh dương góc trên phải, vàng dưới trái, xanh lá dưới phải; góc trên trái là khung đen phủ kín mốc đỏ; chân ghi «1 vùng che», nút «Lưu bản che» bật.
    E8-da-luu.png: sau khi lưu, trang hồ sơ B-08.02 hiện toast «Đã lưu bản che · bản gốc ở Nội bộ»; tab «Gửi được (1)» với một thẻ ảnh (Bìa, ngày 15/09/2026), tab «Nội bộ (1)».
    E8-ban-che.png: bản che webp 1200x1600, góc trên trái là khối đen thay mốc đỏ, ba mốc xanh dương/vàng/xanh lá còn nguyên vị trí. Khớp Expected. Các khung step1, step1b, step2a, step2c, step3 đã lưu nhưng không mở lại từng cái.
  network_observed: clean

- eval: E9
  run_id: E9-20261101
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/bang-hang-kieu-sheet/thu/cdp.mjs
  verified_at: 2026-11-01T16:03:19Z
  screenshot: evidence/E9-loi.png
  observed: |
    E9-step1.png: hồ sơ căn B-15.05 Toà B ở 1440x900, tab «Gửi được (1)», «Nội bộ (0)», một thẻ ảnh có nhãn Bìa. E9-loi.png và E9-step3.png (giống nhau): trình «Che vùng» mở, một khung đen phủ trên ảnh, dòng đỏ «Chưa lưu được bản che — thử lại», chân ghi «1 vùng che», có nút Bỏ khung cuối / Bỏ hết / Lưu bản che. Khớp Expected.
    Ghi chú ngoài Expected: ở 1440 trình che tràn phải, ảnh và nút «Lưu bản che» bị cắt ở mép phải khung nhìn. Bài dùng căn B-15.05 (Toà B) vì dau-chu-1 không giữ căn Toà C nào.
  network_observed: clean

- eval: E10
  run_id: minted-che-vung-anh-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-01T16:03:19Z
  output: |
    npm run typecheck: sạch

- eval: E11
  run_id: minted-che-vung-anh-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T16:03:19Z
  output: |
    chuẩn giao diện: đạt

- eval: E12
  run_id: minted-che-vung-anh-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-01T16:03:19Z
  output: |
    design-floor-s4: không có mã màu thô

- eval: E13
  run_id: minted-che-vung-anh-E13-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/che-vung-anh/thu/ranh-gioi.mjs
  verified_at: 2026-11-01T16:03:19Z
  output: |
    0 tệp ngoài ranh giới

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-che-vung-anh-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T16:03:19Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-che-vung-anh-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T16:03:19Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-che-vung-anh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T16:03:19Z

- cmd: npm run test:hooks
  run_id: minted-che-vung-anh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T16:03:19Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-che-vung-anh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T16:03:19Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/web: E1, E2, E3, E4, E5
- npm run typecheck: E10
- npm run lint: E11
- R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-s4.mjs" --root .: E12

Baseline khong do
- node _acceptance/che-vung-anh/thu/ranh-gioi.mjs: bo qua baseline: tep _acceptance/che-vung-anh/thu/ranh-gioi.mjs co o cay dang kiem nhung chua co o merge-base 304c3d94be6a8f8eff9b3ce7e623b9400f7feffb — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả 13 eval đạt, không eval nào hỏng; chuyển sang Gate 2.

### Re-pin lần 1 — 2026-11-01, do gộp main sau chữ ký
run_id: repin-20261101T221401Z-96493
sha: 233064a19f46225e68f16609038f8749ae716fe3 · suites: 7 lệnh exit 0 · evals: 9/9 eval máy đạt kỳ vọng · ngoài làn máy: E6, E7, E8, E9 · AC không có chốt máy: AC-1, AC-5
