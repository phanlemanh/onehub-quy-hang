---
schema_version: 2
feature_slug: chuan-hoa-moi-cua
verdict: REJECT
failed_evals: ["E9u"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 22a29107ca74f3af2e3bf777876a78adb4cf9a68
human_signoff:
---

# Evidence Report: chuan-hoa-moi-cua

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2u | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9u | AC-9 | ui-check | FAIL |
| E10 | AC-10 | test | PASS |
| E11 | AC-9 | script | PASS (đạt có giới hạn) |
| E11b | AC-9 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-chuan-hoa-moi-cua-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 16433.714083

- eval: E2
  run_id: minted-chuan-hoa-moi-cua-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 5091.903958

- eval: E4
  run_id: minted-chuan-hoa-moi-cua-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 5091.903958

- eval: E5b
  run_id: minted-chuan-hoa-moi-cua-E5b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 5091.903958

- eval: E9
  run_id: minted-chuan-hoa-moi-cua-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 5091.903958

- eval: E3
  run_id: minted-chuan-hoa-moi-cua-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 3583.170958

- eval: E5
  run_id: minted-chuan-hoa-moi-cua-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 3583.170958

- eval: E6
  run_id: minted-chuan-hoa-moi-cua-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 3583.170958

- eval: E7
  run_id: minted-chuan-hoa-moi-cua-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 3583.170958

- eval: E10
  run_id: minted-chuan-hoa-moi-cua-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 3583.170958

- eval: E8
  run_id: minted-chuan-hoa-moi-cua-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua_cach_ly
  verified_at: 2026-11-07T08:29:39Z
  output: |
    ℹ duration_ms 142565.807333

- eval: E11
  run_id: minted-chuan-hoa-moi-cua-E11-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T08:29:39Z
  output: |
    7 tệp giao diện ngoài bản đồ

- eval: E11b
  run_id: minted-chuan-hoa-moi-cua-E11b-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/chuan-hoa-moi-cua/kiem-khuon-e11.mjs
  verified_at: 2026-11-07T08:29:39Z
  output: |
    E11b: chỉ có dòng báo oan đã khai (1): lệch: apps/web/src/app/(app)/settings/dictionary/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam

- eval: E2u
  run_id: minted-chuan-hoa-moi-cua-E2u-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T08:29:39Z
  screenshot: evidence/E2u-step1.png
  observed: |
    step1.png (đọc trực tiếp): bước 3 Xem trước, tệp tu-dien.csv 2 dòng. Hàng dòng 2, ô Hướng có ô nhập «dong nm», bên dưới «Ý bạn là:» và nút «Đông Nam», rồi nhãn «Cần người» và ««dong nm» không phải hướng đã biết». Ô Tình trạng cũng có «Ý bạn là: Đang giao dịch». Thanh đếm: Giữ nguyên 8, Máy sửa 0, Cần người 4, Chặn 0. Khớp Expected step1.
    step2.png: ô Hướng dòng 2 chỉ hiện chữ «Đông Nam», không còn ô nhập, nhãn «Cần người» hay «Ý bạn là:». Thanh đếm: Giữ nguyên 9, Máy sửa 0, Cần người 3, Chặn 0. Chưa bấm Tiếp hay Nhập. Khớp Expected step2.
    step3.png (sau khi quản trị duyệt, đăng nhập lại, tải lại tệp): ô Hướng dòng 2 hiện «dong nm → Đông Nam», nhãn tím «Máy sửa», chú thích «theo từ điển của sàn». Không có nhãn «Cần người» và không có dòng «Ý bạn là:» ở ô này. Thanh đếm: Giữ nguyên 8, Máy sửa 1, Cần người 3, Chặn 0. Khớp Expected step3.
    Dòng 3 (ô Hướng «Đông Nam» Cần người vì file và danh mục khác nhau) là ca khác, không thuộc eval này.
  network_observed: clean

- eval: E9u
  run_id: minted-chuan-hoa-moi-cua-E9u-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T08:29:39Z
  screenshot: evidence/E9u-step1.png
  observed: |
    Đã mở lại cả 4 ảnh. Lưu ý: ảnh là bản chụp Browser pane (jpg chuyển sang png, khổ 800x500 cho 1440 và 750x1624 cho 375).
    - step0 (1440, sàn mới nạp, chưa có dòng nào): bảng «Sức khoẻ dữ liệu» 4 hàng (Trạng thái, Điều kiện phí, Hướng, Cả sàn), cột Đã gặp, Đã neo, Chờ duyệt, Đã bỏ, Lần chọn, mọi số bằng 0. Bên dưới có câu «Chưa có cách gõ lạ nào — chọn gợi ý ở bước xem trước khi nhập file sẽ hiện ở đây». Khớp Expected.
    - step1 (1440, sau 3 đề xuất): hàng Cả sàn đã gặp 3, đã neo 0, chờ duyệt 3, đã bỏ 0, lần chọn 3; mỗi trường 1 chờ duyệt. Ba nhóm Trạng thái, Điều kiện phí, Hướng; mỗi dòng có chữ gốc → giá trị chuẩn (dang gd roi → Đang giao dịch, bao phi het → Bao phí, dong nm → Đông Nam), số lần 1, huy hiệu «Chờ duyệt», nút «Duyệt» và «Bỏ». Khớp Expected.
    - step2 (sau bấm «Duyệt» dòng dong nm): dòng dong nm có huy hiệu xanh «Đã duyệt», chỉ còn nút «Bỏ». Hàng Hướng đã neo 1, chờ 0. Hàng Cả sàn đã gặp 3, đã neo 1, chờ 2. Khớp Expected (neo tăng, chờ giảm).
    - step3 (375): trang không tràn ngang (scrollWidth = clientWidth = 375), bảng sức khoẻ chỉ hiện 3 cột (Sức khoẻ, Đã gặp, Đã neo, Chờ duyệt; Đã bỏ và Lần chọn bị ẩn) và đọc được. Nhưng ba bảng dòng vẫn là bảng ngang, không xếp một cột: cột Lần chọn và Trạng thái bị ẩn, bảng dòng rộng 355 và 373 trong khung 333 nên phải cuộn ngang; nút «Bỏ» của dòng dang gd roi bị cắt mép, dòng bao phi het chỉ thấy «Duyệt» còn «Bỏ» nằm ngoài khung. Một phần cải thiện so với lượt trước nhưng chưa đạt «một cột đọc được».
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-chuan-hoa-moi-cua-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T08:29:39Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chuan-hoa-moi-cua-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T08:29:39Z

- cmd: npm run test:hooks
  run_id: minted-chuan-hoa-moi-cua-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T08:29:39Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chuan-hoa-moi-cua-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T08:29:39Z

- cmd: npm run typecheck
  run_id: minted-chuan-hoa-moi-cua-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T08:29:39Z

- cmd: npm run lint
  run_id: minted-chuan-hoa-moi-cua-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T08:29:39Z

## Known limits

- E11 (AC-9) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline):
- npm test -w @quy-hang/core: E1
- npm test -w @quy-hang/web: E2, E4, E5b, E9
- cd packages/api && DATABASE_URL=postgres://postgres:quyhang@localhost:5572/postgres node --env-file-if-exists=../../.env.local --import tsx --test --test-concurrency=1 "test-db/chuan-hoa-moi-cua/*.test.ts": E3, E5, E6, E7, E10
- export DATABASE_URL=postgres://postgres:quyhang@localhost:5572/postgres && npm run db:migrate && npm run db:test: E8

Baseline khong do
- node _acceptance/chuan-hoa-moi-cua/kiem-khuon-e11.mjs: bo qua baseline: tep _acceptance/chuan-hoa-moi-cua/kiem-khuon-e11.mjs co o cay dang kiem nhung chua co o merge-base e85dd84c6eef25ab8677fecc8992d838981aa308 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2u, E9u, E11 failed — ô theo từ điển sàn chưa hiện «→ giá trị», bảng Từ điển khổ điện thoại chưa đọc được, bài khuôn E11 chưa khai báo oan; bộ kiểm cách ly bị chặn vì thiếu DATABASE_URL. Returned to implementation.
Round 2: E9u failed — ở khổ 375 ba bảng dòng của màn Từ điển vẫn là bảng ngang phải cuộn ngang, nút «Bỏ» bị cắt hoặc nằm ngoài khung. E2u đã đạt; E11 đạt có giới hạn (đã khai). Returned to implementation.
