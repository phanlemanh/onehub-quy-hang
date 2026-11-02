---
schema_version: 2
feature_slug: mo-so-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e02ac5bc08a793263a25b563fef6307456e36ec7
human_signoff:
---

# Evidence Report: mo-so-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-5 | ui-check | PASS |
| E7 | AC-6 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-mo-so-lead-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:41:23Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 34036.866

- eval: E2
  run_id: minted-mo-so-lead-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:41:23Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 34036.866

- eval: E3
  run_id: minted-mo-so-lead-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:41:23Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 34036.866

- eval: E4
  run_id: minted-mo-so-lead-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T07:41:23Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 34036.866

- eval: E5
  run_id: minted-mo-so-lead-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:41:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 446.059041

- eval: E6
  run_id: minted-mo-so-lead-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T07:41:23Z
  screenshot: evidence/E6-1-mo-so.png
  observed: |
    Đã mở từng frame bằng Read. Khung 1 (1440x900, E6-1-mo-so.png): nhóm «Lead mới» đếm 2, hai dòng lead. Dòng 1 «Toà A · A-09.05» nấc «Đã nhận» có nút Đã gọi, Trả lại · Số không liên lạc được và «Mở số». Dòng 2 «Toà A · chỉ biết toà» nấc «Đã gửi» có Nhận, Đã gọi, Trả lại và «Mở số». Chưa có số nào hiện. Khớp Expected. Khung 2 (E6-2-so-hien.png): sau khi bấm «Mở số» ở dòng 1, dòng hiện «0900 000 033» kèm nút «Gọi». a[href^="tel:"] có href tel:0900000033. Nhãn vẫn «Đã nhận», nút Đã gọi/Trả lại giữ nguyên, dòng vẫn ở «Lead mới». Dòng 2 vẫn là «Mở số». Khớp. Khung 3 (E6-3-dien-thoai.png, 375x812x3 mobile touch): sau khi tải lại và bấm «Mở số», bố cục xếp dọc. Số «0900 000 033» và nút «Gọi» nằm dưới tên lead, dưới cả các nút hành động. Đo toạ độ: tên y=329, số y=537, scrollWidth bằng viewport 375, không tràn ngang. Khớp. Khung 4 (E6-4-tai-lai.png, 1440x900): sau khi tải lại, cả hai dòng lại là «Mở số», không có số, 0 thẻ tel:. Khớp. Khung 5 (E6-5-sau-nhan.png): bấm «Nhận» ở dòng Đã gửi thì dòng đó thành «Đã nhận» và vẫn còn «Mở số». Bấm «Mở số» thì hiện «0900 000 039» kèm «Gọi», tel:0900000039. Khớp. Khung 6 (E6-6-mat-mang.png, Offline): bấm «Mở số» ở dòng 1 thì dưới nút hiện chữ đỏ «Mất mạng — chưa mở được số, thử lại khi có mạng.», nút «Mở số» vẫn enabled (disabled=false). Thanh trên hiện «Mất mạng · đang xem bản trên máy». Bỏ Offline, bấm lại thì số hiện (tel:0900000033 và tel:0900000039), dòng lỗi biến mất. Khớp. Khung 7 (E6-7-dang-mo.png, Slow 3G): chụp ngay sau khi bấm «Mở số» ở dòng 1. Đã gọi, Trả lại và Mở số của dòng đó đều mờ đi, DOM xác nhận button.disabled=true, chưa có số. Dòng 2 vẫn bình thường. Khớp (nút bị khoá lúc chờ). Dò lưu trữ: localStorage có 1 khoá «qh:danh-muc:v1:<mã sàn>». Không có sessionStorage hay Cache Storage. IndexedDB có 1 cơ sở «quy-hang-sync:<mã>» gồm store «ngan» với 1 bản ghi. Quét cả khoá lẫn giá trị bằng regex phủ 0900000xxx, 0900 000 xxx, +84900000xxx, 84900000xxx (đã tự kiểm regex bắt đúng bốn dạng mẫu) → 0 lần khớp. Không phát hiện mâu thuẫn nào với Expected.
  network_observed: clean
  # Frame đã lưu trong _acceptance/mo-so-lead/evidence/: E6-1-mo-so.png, E6-2-so-hien.png, E6-3-dien-thoai.png, E6-4-tai-lai.png, E6-5-sau-nhan.png, E6-6-mat-mang.png, E6-7-dang-mo.png, E6-network.txt (số liệu thô của mạng nằm trong tệp này).

- eval: E7
  run_id: minted-mo-so-lead-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T07:41:23Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 446.059041

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-02T07:41:23Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T07:41:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T07:41:23Z

- cmd: npm run test:hooks
  run_id: minted-mo-so-lead-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T07:41:23Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-mo-so-lead-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T07:41:23Z

- cmd: npm run typecheck
  run_id: minted-mo-so-lead-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T07:41:23Z

- cmd: npm run lint
  run_id: minted-mo-so-lead-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-02T07:41:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline — chứng minh harness chứ chưa chứng minh tính năng; nên viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- Lệnh `npm run db:migrate && npm run db:test` — E1, E2, E3, E4
- Lệnh `npm test -w @quy-hang/web` — E5, E7

Eval E6 (ui-check) không đo baseline: baseline n-a.

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, tất định; không eval nào có pass_rate lẫn).

## Iterations

Round 1: E1–E7 đều đạt, không eval nào hỏng; verdict PASS.

