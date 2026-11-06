---
schema_version: 2
feature_slug: va-pool-ket-noi
verdict: BLOCKED
failed_evals: []
reason: "ui-check:E3 — Pane trình duyệt không đặt được cookie qh.session_token (document.cookie và cookieStore.set đều để document.cookie rỗng) nên không dựng được tiền điều kiện «có cookie» của bước 3-5. Ngoài ra bước 2 lệch Expected trong trình duyệt."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bb3dc7c01ea8ea3295d8b98a471232a4b4718111
human_signoff:
---

# Evidence Report: va-pool-ket-noi

Vòng 2. Báo cáo này thay toàn bộ báo cáo vòng cũ; lịch sử vòng nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | ui-check | BLOCKED |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-5 | script | PASS |
| E7 | AC-5 | script | PASS |
| E8 | AC-5 | script | PASS |
| E9 | AC-5 | script | PASS |
| E10 | AC-6 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-pool-ket-noi-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T02:55:34Z
  cmd: npm test -w @quy-hang/web
  output: |
    ℹ duration_ms 3413.559167

- eval: E2
  run_id: minted-va-pool-ket-noi-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T02:55:34Z
  cmd: npm test -w @quy-hang/web
  output: |
    ℹ duration_ms 3413.559167

- eval: E3
  run_id: minted-va-pool-ket-noi-E3-r2
  baseline: n-a
  verifier: ui-check:E3
  verified_at: 2026-11-06T02:55:34Z
  screenshot: evidence/E3-step2.html
  observed: |
    Chỉ có một file evidence, E3-step2.html, là ghi chú văn bản do người kiểm tự viết, không phải ảnh chụp. Nội dung: /today không cookie ở lại /today với «Không mở được trang này» và nút «Thử lại» (lệch Expected là /login); cookie không đặt được; /login hiện «Đăng nhập Quỹ hàng», Email, «Gửi mã». Các frame của bước 4-5 chưa có.
  network_observed: n-a (tool-error: chỉ đọc được request static của trang lỗi, không có luồng đầy đủ)
  output: |
    Bước 1 OK: dung-su-co --dung chạy được, in cookie, công tắc TẮT; preview web-su-co-pool lên cổng 3499, khổ 1280x800.
    Bước 2: trình duyệt mở /127.0.0.1:3499/today khi chưa có cookie thì ở lại /today, trang ghi «Không mở được trang này», HTTP 500 (hai lần thử). Expected là về /login. curl cùng địa chỉ trả 307 sang /login, nên trình duyệt và curl lệch nhau.
    Bước 3: sau document.cookie = 'qh.session_token=...' và cookieStore.set, document.cookie vẫn rỗng, nên assertion «document.cookie có nó» không đạt. /login hiện «Đăng nhập Quỹ hàng», ô Email, nút «Gửi mã».
    Bước 4-5 không chạy: thiếu cookie nên kết quả sẽ không có nghĩa, và chưa bật công tắc.
    Bước 6 OK: preview_stop và dung-su-co --don đã chạy («đã dọn công tắc và container»).
    Evidence: không có công cụ chụp lưu file nên dùng bản dự phòng .html. Không có E3-login/today/inventory/goc/chon-san/hoi-phuc.png, và không có E3-network.txt.

- eval: E4
  run_id: minted-va-pool-ket-noi-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_ket_noi
  verified_at: 2026-11-06T02:55:34Z
  cmd: node --test "_acceptance/va-pool-ket-noi/thu/*.test.mjs"
  output: |
    ℹ duration_ms 96.72125

- eval: E5
  run_id: minted-va-pool-ket-noi-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-06T02:55:34Z
  cmd: npm run typecheck
  output: |
    (không có dòng lỗi)

- eval: E6
  run_id: minted-va-pool-ket-noi-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-06T02:55:34Z
  cmd: npm run lint
  output: |
    chuẩn giao diện: đạt

- eval: E7
  run_id: minted-va-pool-ket-noi-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.script.build
  verified_at: 2026-11-06T02:55:34Z
  cmd: npm run build
  output: |
    (build hoàn tất, không có dòng lỗi)

- eval: E8
  run_id: minted-va-pool-ket-noi-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-06T02:55:34Z
  cmd: design-floor-s4.mjs --root .
  output: |
    (không có dòng lỗi)

- eval: E9
  run_id: minted-va-pool-ket-noi-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T02:55:34Z
  cmd: design-floor-khuon.mjs --kiem --root .
  output: |
    2 tệp giao diện ngoài bản đồ

- eval: E10
  run_id: minted-va-pool-ket-noi-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.va_pool_ket_noi
  verified_at: 2026-11-06T02:55:34Z
  cmd: node --test "_acceptance/va-pool-ket-noi/thu/*.test.mjs"
  output: |
    ℹ duration_ms 96.72125

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-06T02:55:34Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-06T02:55:34Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T02:55:34Z

- cmd: npm run test:hooks
  run_id: minted-va-pool-ket-noi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T02:55:34Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-pool-ket-noi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-06T02:55:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên mã mới lẫn mã cũ ở điểm rẽ; chứng minh bộ đo chứ chưa chứng minh tính năng, cần viết lại để assert hành vi mới hoặc xác nhận là rào hồi quy có chủ ý):
- npm test -w @quy-hang/web: E1, E2
- node --test "_acceptance/va-pool-ket-noi/thu/*.test.mjs": E4, E10
- npm run typecheck: E5
- npm run lint: E6
- design-floor-s4.mjs --root .: E8
- design-floor-khuon.mjs --kiem --root .: E9

Chỉ E7 (build) đỏ trên mã cũ, có phân biệt. E3 không đo được trên mã cũ (baseline n-a).

Judge panel: không có panel nào được đề xuất ở vòng này.

## Variance

none — mọi eval chạy một lần, xác định, không có phương sai.

## Iterations

Round 1: lịch sử vòng 1 không nằm trong dữ liệu vòng này; xem các bản ghi trong run-log.jsonl.
Round 2: BLOCKED — E3 không chạy được: pane trình duyệt không đặt được cookie phiên nên không dựng được tiền điều kiện của bước 3-5, và bước 2 trong trình duyệt lệch Expected (ở lại /today thay vì về /login, trong khi curl cho kết quả đúng). Chín eval máy còn lại xanh. Cần chạy lại E3 trong môi trường trình duyệt đặt được cookie.
