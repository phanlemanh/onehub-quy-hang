---
schema_version: 2
feature_slug: va-duong-loi-hoan-tac
verdict: REJECT
failed_evals: ["E6","E7"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 581058c12491fb6b31f050995934a73d4151bac7
human_signoff:
---

# Evidence Report: va-duong-loi-hoan-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-3 | ui-check | REJECT |
| E7 | AC-6 | ui-check | REJECT |
| E8 | AC-7 | script | PASS |
| E9 | AC-7 | script | PASS |
| E10 | AC-7 | script | PASS |
| E11 | AC-7 | script | PASS |

Lệnh fail không gắn eval: ui-check:E6 (gắn E6) và ui-check:E7 (gắn E7), cả hai đã được tính vào failed_evals.

## Evidence

- eval: E1
  run_id: minted-va-duong-loi-hoan-tac-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1745.152875

- eval: E2
  run_id: minted-va-duong-loi-hoan-tac-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1745.152875

- eval: E3
  run_id: minted-va-duong-loi-hoan-tac-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1745.152875

- eval: E4
  run_id: minted-va-duong-loi-hoan-tac-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1745.152875

- eval: E5
  run_id: minted-va-duong-loi-hoan-tac-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:49:48Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1745.152875

- eval: E6
  run_id: E6-2026-11-04
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T02:49:48Z
  screenshot: evidence/E6-da-doi.png
  observed: |
    Frames đã đọc từ đĩa. E6-da-doi.png: A-13.01 giá 3,1 tỷ, Đang bán, toast «Đã đổi giá A-13.01» có nút Hoàn tác. E6-hong.png: toast «Không hoàn tác được: Máy chưa lưu được lần sửa — thử lại — giá A-13.01», vẫn có nút Hoàn tác, đầu trang báo lỗi kho trên máy. E6-lai-nut.png: toast «Đã hoàn tác giá A-13.01», panel về 3,09 tỷ. E6-lai-phim.png: sau Ctrl+Z toast «Đã hoàn tác giá A-02.01», lưới về 2,4 tỷ.
    Các frame chỉ phủ lần Ctrl+Z đầu. Ở cả hai lượt, Ctrl+Z thêm một lần không ra toast nào; chữ «Đã hoàn tác rồi» không bao giờ xuất hiện, trái Expected. Mã nguồn tren-o.tsx lặng lẽ thoát khi dungPhim trả null.
  network_observed: clean
  output: |
    Lượt a và lượt b: bước hỏng, bấm lại bằng nút, bấm lại bằng phím, giá về giá cũ đều đạt.
    Hai mệnh đề «Đã hoàn tác rồi» của Expected không đạt: Ctrl+Z thừa không ra thông báo nào.
    Mọi fetch/XHR của ứng dụng đều trả 200; chi tiết thô ở evidence/E6-network.txt.

- eval: E7
  run_id: E7-va-duong-loi-hoan-tac-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T02:49:48Z
  screenshot: evidence/E7-lo.png
  observed: |
    E7-lo.png (1440x900): sau đổi hàng loạt 5 căn chỉ A-03.01, A-13.01, A-05.01 «Tạm ngưng»; A-02.01 và A-11.02 vẫn «Đang bán»; đầu trang «Đang gửi 2 thay đổi». Bước dựng không ra 5 căn «Tạm ngưng» như Expected.
    E7-mot-phan.png: toast «Đã hoàn tác 2 căn · 2 căn chưa hoàn tác được · 1 căn đã có lần sửa sau — bỏ qua», mô tả kể A-13.01 và A-02.01 kèm lý do, có nút Hoàn tác; hai căn ấy vẫn «Tạm ngưng» và đang tích. Tiêu đề không phải «Đã hoàn tác 3 căn · 2 căn chưa hoàn tác được».
    E7-lai.png: toast «Đã hoàn tác 2 căn», không còn nút, cả 5 căn «Đang bán».
  network_observed: app-fail
  output: |
    Đổi hàng loạt báo «5 căn» nhưng lưới và máy chủ chỉ đổi 3 đến 4 căn; căn rơi khác nhau theo lần chạy (A-05.01, A-11.02, A-02.01). Không có POST cho căn bị rơi và hàng đợi cục bộ rỗng, tức là mất lần ghi. Lặp 4 lần, lần nào cũng rơi 1 đến 2 căn.
    Mã căn kể ở lần một khớp căn thứ hai và thứ tư, mô tả kèm lý do đạt; tiêu đề và số đếm sai vì trạng thái dựng sai.
    Có một yêu cầu bị từ chối do xung đột trên ghi sự kiện của một căn; chi tiết thô ở evidence/E7-network.txt.

- eval: E8
  run_id: minted-va-duong-loi-hoan-tac-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T02:49:48Z
  output: |
    chuẩn giao diện: đạt

- eval: E9
  run_id: minted-va-duong-loi-hoan-tac-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-04T02:49:48Z
  output: |
    typecheck sạch trên mọi gói

- eval: E10
  run_id: minted-va-duong-loi-hoan-tac-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T02:49:48Z
  output: |
    8 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-va-duong-loi-hoan-tac-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-04T02:49:48Z
  output: |
    design-floor-s4: không có mã màu thô

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-04T02:49:48Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T02:49:48Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T02:49:48Z

- cmd: npm run test:hooks
  run_id: minted-va-duong-loi-hoan-tac-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T02:49:48Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-duong-loi-hoan-tac-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-04T02:49:48Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline, chứng minh khung chạy chứ chưa chứng minh tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/web (E1, E2, E3, E4, E5)
- npm run lint (E8)
- npm run typecheck (E9)
- design-floor-khuon.mjs --kiem (E10)
- design-floor-s4.mjs (E11)

E6 và E7: baseline n-a (không đo được trên mã cũ).

## Variance

none — mọi eval chạy nhiều lần đều đồng nhất (mọi eval chạy một lần).

## Iterations

Round 1: E6, E7 failed — E6: Ctrl+Z thừa sau khi đã hoàn tác không ra «Đã hoàn tác rồi» (tren-o.tsx thoát lặng lẽ khi phím trả null); E7: đổi hàng loạt 5 căn chỉ ghi được 3 đến 4 căn nên bước dựng sai và tiêu đề «Đã hoàn tác 3 căn · 2 căn chưa hoàn tác được» không ra. Returned to implementation.
