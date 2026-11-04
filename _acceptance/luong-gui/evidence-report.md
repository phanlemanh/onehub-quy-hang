---
schema_version: 2
feature_slug: luong-gui
verdict: REJECT
failed_evals: [E2, E3b, E7b, E12]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 7cffd46094fb39b726891330250a27f83ed2c040
human_signoff:
---

# Evidence Report: luong-gui

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | FAIL |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | FAIL |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | FAIL |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-4 | ui-check | PASS |
| E12 | AC-10 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-luong-gui-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1798.151167

- eval: E2
  run_id: minted-luong-gui-E2-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm run db:migrate && npm run db:test — tests 281, pass 280, fail 1
    ✖ luồng gửi: danh sách khách của đầu khách (165.46525ms)
    AssertionError: thân trả có chín chữ số liền (packages/api/test-db/luong-gui.test.ts:64)

- eval: E3
  run_id: minted-luong-gui-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1798.151167

- eval: E3b
  run_id: minted-luong-gui-E3b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T01:52:46Z
  output: |
    Cùng lệnh db:migrate + db:test với E2: cả lệnh dừng đỏ vì một ca (luồng gửi: danh sách khách của đầu khách).
    Ca riêng của E3b không được tách kết quả ra ở phần đuôi log.

- eval: E4
  run_id: minted-luong-gui-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1798.151167

- eval: E5
  run_id: minted-luong-gui-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 351.381208

- eval: E6
  run_id: minted-luong-gui-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 364.578792

- eval: E7
  run_id: minted-luong-gui-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1798.151167

- eval: E7b
  run_id: minted-luong-gui-E7b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T01:52:46Z
  output: |
    Cùng lệnh db:migrate + db:test với E2: cả lệnh dừng đỏ vì một ca (luồng gửi: danh sách khách của đầu khách).
    Ca riêng của E7b không được tách kết quả ra ở phần đuôi log.

- eval: E8
  run_id: minted-luong-gui-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1798.151167

- eval: E9
  run_id: minted-luong-gui-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1798.151167

- eval: E10
  run_id: minted-luong-gui-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T01:52:46Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E11
  run_id: minted-luong-gui-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T01:52:46Z
  screenshot: evidence/E11-step1.png
  observed: |
    step1 (375): header "2 căn đã chọn", cards B-13.02 and B-14.05 ticked, bottom bar "2 căn  Xem trước  Gửi", bottom nav visible. Matches Expected.
    step2: drawer "Xem trước — khách riêng thấy", "Khách riêng không thấy mã căn.", "2 căn đang bán", two cards with Toà B and no unit code, "Giá xác nhận hôm nay", disabled "Chọn người nhận". Matches Expected.
    step3: identical to step2 (khách riêng, no unit code). Matches Expected.
    step4: drawer "Xem trước — nhóm môi giới thấy", "Nhóm môi giới thấy mã căn.", cards show "Toà B · B-13.02" and "Toà B · B-14.05", button "Gửi". Matches Expected.
    step5: Gửi căn screen with "Khách riêng" active, the radio-selected customer "[Mẫu] Khách chấm — Mua", both units listed, bottom bar "Khách riêng — [Mẫu] Khách chấm" with "Xem trước" and "Gửi". Matches Expected.
    step6: the "Tin soạn sẵn" textarea shows "Chào anh/chị [Mẫu] Khách chấm, Em SỬA gửi 2 căn đang bán: 1. Toà B — 68,5 m² · 2 PN · Đông Bắc — 3,56…", so the edit persisted. Matches Expected.
    step7: A-04.06 (8,06 tỷ) shows the "Gọi xác nhận trước" badge and "1 căn cần gọi xác nhận". The line "A-13.03 — Đang giao dịch — không gửi mới được, đã bỏ khỏi lần gửi" is shown, and "Chọn người nhận" is disabled. Matches Expected.
    step8 (1280): Gửi căn desktop page in Nhóm môi giới mode, group message with unit codes, footer button "Chép…" partly covered by the dev badge. The "Đã chép" message is not visible in the pixels, only in the DOM. Partial visual evidence, DOM assertion passed.
    step9 (1280): banner "Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại.", greyed footer button reading "Gửi cần mạ…" (clipped). Matches Expected.
  network_observed: clean

- eval: E12
  run_id: minted-luong-gui-E12-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T01:52:46Z
  output: |
    lệch: apps/web/src/app/(app)/shares/new/page.tsx · thuộc hai nhóm màn: gui, trang-tam
    10 tệp giao diện ngoài bản đồ
    Ghi chú: tệp bị báo là apps/web/src/app/(app)/shares/new/page.tsx, lệch vì thuộc hai nhóm (giới hạn «cắt trước» của kit 2.37.0 — báo oan theo expected). Máy vẫn tính eval đỏ; người quyết ở Cổng 2.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T01:52:46Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T01:52:46Z

- cmd: npm run test:hooks
  run_id: minted-luong-gui-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T01:52:46Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-04T01:52:46Z

- cmd: npm run typecheck
  run_id: minted-luong-gui-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T01:52:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả code mới lẫn baseline): E1, E3, E4, E7, E8, E9 (lệnh npm test -w @quy-hang/web); E5 (npm run test:ro-ri); E6 (npm test -w @quy-hang/core); E10 (npm run lint). Cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý.

Lệnh fail không gắn riêng eval: không có; hai lệnh đỏ đều gắn eval (db:migrate + db:test cho E2, E3b, E7b; bước chấm khuôn cho E12).

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E2, E3b, E7b failed — ca «luồng gửi: danh sách khách của đầu khách» đỏ ở luong-gui.test.ts:64 (máy dò chín chữ số liền bắt được trong thân trả), kéo cả lệnh db:test đỏ; E12 failed — page.tsx của shares/new báo thuộc hai nhóm gui, trang-tam (báo oan theo expected, vẫn đỏ ở máy). Returned to implementation.
