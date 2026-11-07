---
schema_version: 2
feature_slug: chuan-hoa-moi-cua
verdict: BLOCKED
failed_evals: ["E11","E2u","E9u"]
reason: "Lệnh `npm run db:migrate && npm run db:test` (E8) thoát ở bước `npm run db:migrate` (scripts/migrate.mjs), chưa tới `db:test`. Lỗi: database \"sach45\" does not exist (SQLSTATE 3D000): DATABASE_URL trong env trỏ tới DB không tồn tại trên Postgres local. Đây là thiếu cấu hình môi trường, không phải lỗi migration hay test; cần DATABASE_URL trỏ tới DB đã tạo (theo AGENTS.md: postgres://postgres:quyhang@localhost:5544/postgres) rồi chạy lại."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 2934a3d9d4b4d2a1bbb8890ab011a68c5b7ec898
human_signoff:
---

# Evidence Report: chuan-hoa-moi-cua

Round 1. Verdict BLOCKED: eval E8 không chạy được vì môi trường (DATABASE_URL trỏ DB không tồn tại). Ba eval E11, E2u, E9u chạy xong nhưng không đạt.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2u | AC-2 | ui-check | FAIL |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | BLOCKED |
| E9 | AC-9 | test | PASS |
| E9u | AC-9 | ui-check | FAIL |
| E10 | AC-10 | test | PASS |
| E11 | AC-9 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-chuan-hoa-moi-cua-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-07T08:10:23Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 13310.795625

- eval: E2
  run_id: minted-chuan-hoa-moi-cua-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:10:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3274.447458

- eval: E4
  run_id: minted-chuan-hoa-moi-cua-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:10:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3274.447458

- eval: E5b
  run_id: minted-chuan-hoa-moi-cua-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:10:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3274.447458

- eval: E9
  run_id: minted-chuan-hoa-moi-cua-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-07T08:10:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3274.447458

- eval: E3
  run_id: minted-chuan-hoa-moi-cua-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:10:23Z
  output: |
    test-db/chuan-hoa-moi-cua/*.test.ts (Postgres, cổng 5572)
    ℹ duration_ms 1904.595083

- eval: E5
  run_id: minted-chuan-hoa-moi-cua-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:10:23Z
  output: |
    test-db/chuan-hoa-moi-cua/*.test.ts (Postgres, cổng 5572)
    ℹ duration_ms 1904.595083

- eval: E6
  run_id: minted-chuan-hoa-moi-cua-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:10:23Z
  output: |
    test-db/chuan-hoa-moi-cua/*.test.ts (Postgres, cổng 5572)
    ℹ duration_ms 1904.595083

- eval: E7
  run_id: minted-chuan-hoa-moi-cua-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:10:23Z
  output: |
    test-db/chuan-hoa-moi-cua/*.test.ts (Postgres, cổng 5572)
    ℹ duration_ms 1904.595083

- eval: E10
  run_id: minted-chuan-hoa-moi-cua-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.chuan_hoa_moi_cua
  verified_at: 2026-11-07T08:10:23Z
  output: |
    test-db/chuan-hoa-moi-cua/*.test.ts (Postgres, cổng 5572)
    ℹ duration_ms 1904.595083

- eval: E8
  run_id: minted-chuan-hoa-moi-cua-E8-r1
  exit_code: 1
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-07T08:10:23Z
  output: |
    BLOCKED, không chạy được: `npm run db:migrate` dừng ở scripts/migrate.mjs, chưa tới `db:test`.
    error: database "sach45" does not exist (SQLSTATE 3D000)
    npm error Lifecycle script `migrate` failed
    Thiếu cấu hình môi trường: DATABASE_URL cần trỏ DB đã tạo, chạy lại sau khi sửa.

- eval: E11
  run_id: minted-chuan-hoa-moi-cua-E11-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T08:10:23Z
  output: |
    bản đồ nhóm trang-tam đổi sau khi ghim — chấm theo bản ghim
    lệch: apps/web/src/app/(app)/settings/dictionary/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam
    7 tệp giao diện ngoài bản đồ

- eval: E2u
  run_id: minted-chuan-hoa-moi-cua-E2u-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T08:10:23Z
  screenshot: evidence/E2u-step1.png
  observed: |
    step1 frame: bước Xem trước, tu-dien.csv 2 dòng; Giữ nguyên 8, Cần người 4. Dòng 2 ô Hướng là ô nhập «dong nm», dưới có «Ý bạn là:» và nút «Đông Nam», nhãn Cần người + ««dong nm» không phải hướng đã biết». Khớp Expected. step2 frame: ô Hướng dòng 2 là chữ «Đông Nam», không còn ô nhập, không nhãn Cần người; đếm Giữ nguyên 9, Cần người 3 (ô Phí, Tình trạng dòng 2 và Hướng dòng 3 còn cờ). Khớp Expected. step3 frame (sau duyệt và tải lại): ô Hướng dòng 2 hiện «dong nm» (chữ thô, không phải Đông Nam), không nhãn Cần người, không dòng «Ý bạn là:» ở ô hướng; đếm Giữ nguyên 9, Máy sửa 0, Cần người 3. MÂU THUẪN Expected ở chỗ giá trị hiển thị: kỳ vọng Đông Nam nhưng hiện dong nm.
  network_observed: clean
  output: |
    Frames: E2u-step1.png, E2u-step2.png, E2u-step3.png, network E2u-network.txt (trong _acceptance/chuan-hoa-moi-cua/evidence/). Driver: playwright (cổng 3462, DB 5572, server đã tắt).
    Đạt step1, step2, step4 (GET value-aliases: đúng 1 dòng directionFaces «dong nm» → «Đông Nam», proposed, pickCount 1) và bước duyệt (quan-tri PUT decision approve → approved).
    Không đạt step3: sau đăng nhập lại dau-chu-1 và tải lại tu-dien.csv, ô Hướng dòng 2 hiện chữ «dong nm» thô, không phải «Đông Nam». Cách gõ đã duyệt chỉ làm hết cờ Cần người, không đổi giá trị hiển thị: trang xem trước chưa chuẩn hoá thật.
    Ghi chú: lần PUT đầu dùng body sai khoá nên verifier đọc mã nguồn để dùng {decision:"approve"}. Network: chỉ có 404 POST /api/auth/sign-out (thăm dò của verifier, route không tồn tại) và 404 favicon (static).

- eval: E9u
  run_id: minted-chuan-hoa-moi-cua-E9u-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-07T08:10:23Z
  screenshot: evidence/E9u-step0.png
  observed: |
    Đã mở cả 4 ảnh.
    - step0 (1440, sàn chưa có dòng nào): bảng «Sức khoẻ dữ liệu» có 4 hàng (Trạng thái, Điều kiện phí, Hướng, Cả sàn). Mọi số, gồm Đã gặp, Đã neo, Chờ duyệt, Đã bỏ, Lần chọn, đều bằng 0. Câu «Chưa có cách gõ lạ nào — chọn gợi ý ở bước xem trước khi nhập file sẽ hiện ở đây» hiện bên dưới. Khớp expected.
    - step1 (1440, sau 3 đề xuất): hàng «Cả sàn» đã gặp 3, đã neo 0, chờ 3, đã bỏ 0, lần chọn 3. Mỗi trường có đúng 1 chờ duyệt. Ba nhóm: Trạng thái, Điều kiện phí, Hướng. Mỗi dòng có chữ gốc, giá trị chuẩn, lần chọn 1, huy hiệu «Chờ duyệt», nút «Duyệt» và «Bỏ». Giá trị: dang gd roi → Đang giao dịch, bao phi het → Bao phí, dong nm → Đông Nam. Khớp expected.
    - step2 (sau bấm «Duyệt» dòng dong nm): dòng dong nm có huy hiệu xanh «Đã duyệt», chỉ còn nút «Bỏ». Hàng Hướng có đã neo 1, chờ 0. Hàng Cả sàn có đã neo 1, chờ 2, đã gặp 3. Khớp expected (neo tăng, chờ giảm).
    - step3 (375): trang không tràn ngang (scrollWidth = clientWidth = 375). Nhưng bảng bị cắt mép phải. Bảng sức khoẻ chỉ thấy tới «Chờ duyệt», hai cột Đã bỏ và Lần chọn nằm ngoài khung. Ở các bảng dòng, «Lần chọn» bị cắt, «Trạng thái» chỉ thấy «Trạn…» hoặc «Đã d…», và nút «Duyệt» «Bỏ» không thấy. Đây không phải một cột đọc được. Trái expected «khổ 375 đọc được».
  network_observed: n-a (driver)
  output: |
    Dev server 3460 không có sẵn nên verifier tự start (next dev, Postgres riêng cổng 5590, 45 migration đến 051, nạp mẫu bằng nap.mjs --nap); lái Chrome headless bằng CDP qua script ngoài cây kho. Đăng nhập OTP lấy từ nhật ký máy chủ.
    Đạt: bước 0 (mọi số 0, có câu trống), 3 lần POST proposals đều 201 (dong nm → Đông Nam, bao phi het → included, dang gd roi → Pending), step1 (gặp 3, chờ 3, neo 0), step2 (neo 1, «Đã duyệt»).
    Không đạt step3 ở khổ 375: bảng bị cắt, mất cột Đã bỏ, Lần chọn, nút Duyệt, Bỏ và cột Trạng thái của các bảng dòng; không có bố cục một cột.
    Ghi chú: giá trị feeInclusion «included» hiện là «Bao phí», chưa đối chiếu nhãn trong CONTEXT.md. Server và container đã tắt.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-chuan-hoa-moi-cua-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T08:10:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chuan-hoa-moi-cua-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T08:10:23Z

- cmd: npm run test:hooks
  run_id: minted-chuan-hoa-moi-cua-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T08:10:23Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chuan-hoa-moi-cua-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T08:10:23Z

- cmd: npm run typecheck
  run_id: minted-chuan-hoa-moi-cua-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T08:10:23Z

- cmd: npm run lint
  run_id: minted-chuan-hoa-moi-cua-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T08:10:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

Lệnh không gắn eval nhưng không đạt: `R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .` (E11), `ui-check:E2u` (E2u), `ui-check:E9u` (E9u). Cả ba đã nêu ở khối Evidence tương ứng.

Eval không phân biệt (xanh trên cả HEAD lẫn baseline, chứng minh harness chứ không phải feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `npm test -w @quy-hang/core`: E1
- `npm test -w @quy-hang/web`: E2, E4, E5b, E9
- `cd packages/api && DATABASE_URL=${DATABASE_URL:-postgres://postgres:quyhang@localhost:5572/postgres} node --env-file-if-exists=../../.env.local --import tsx --test --test-concurrency=1 "test-db/chuan-hoa-moi-cua/*.test.ts"`: E3, E5, E6, E7, E10

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E11, E2u, E9u không đạt; E8 BLOCKED. E11: màn dictionary/page.tsx thuộc hai nhóm màn (cai-dat-san và trang-tam) nên bước chấm khuôn báo lệch. E2u: sau khi duyệt và tải lại, ô Hướng vẫn hiện chữ thô «dong nm» thay vì «Đông Nam». E9u: ở khổ 375 bảng Từ điển bị cắt mép phải, không đọc được. E8: DATABASE_URL trỏ DB không tồn tại, cần sửa môi trường rồi chạy lại.
