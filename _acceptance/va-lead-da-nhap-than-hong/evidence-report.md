---
schema_version: 2
feature_slug: va-lead-da-nhap-than-hong
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 96a9df414fcba9dc8d79643fe2688ca12b0b4a4a
human_signoff:
---

# Evidence Report: va-lead-da-nhap-than-hong

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | ui-check | PASS |
| E3b | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-lead-da-nhap-than-hong-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T14:12:40Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 11064.890583

- eval: E2
  run_id: minted-va-lead-da-nhap-than-hong-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T14:12:40Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 11064.890583

- eval: E4
  run_id: minted-va-lead-da-nhap-than-hong-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-09T14:12:40Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 11064.890583

- eval: E5
  run_id: minted-va-lead-da-nhap-than-hong-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-09T14:12:40Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    2 tệp giao diện ngoài bản đồ

- eval: E6
  run_id: minted-va-lead-da-nhap-than-hong-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.floor
  verified_at: 2026-11-09T14:12:40Z
  output: |
    design-floor-s4.mjs --root .
    (không có dòng lệch nào)

- eval: E1b
  run_id: minted-va-lead-da-nhap-than-hong-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:12:40Z
  screenshot: evidence/E1b-step2.png
  observed: |
    E1b-step2.png (1440, GET treo): tiêu đề «Lead đã nhập», khung bảng chứa các thanh xám chờ tải (skeleton) mãi, không có bảng dữ liệu, không có báo lỗi, không có nút. Khớp đối chứng dương: có khung chờ. E1b-step3.png (1440, thân hỏng): không còn skeleton; trong khung «Lead đã nhập» có đúng một khối nền hồng nhạt chữ «Không tải được lead đã nhập» kèm «Mạng hay máy chủ không trả lời. Lead đã gửi vẫn còn nguyên.» và đúng một nút «Thử lại» bên phải. Khớp Expected. E1b-step4.png (375): cùng khối lỗi một cột, chữ «Không tải được lead đã nhập», một nút «Thử lại» nằm dưới mô tả, trong khung nhìn, không tràn ngang, thanh điều hướng dưới (Hôm nay, Lead, Tôi) bình thường. Khớp Expected.
  network_observed: clean

- eval: E2b
  run_id: minted-va-lead-da-nhap-than-hong-E2b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:12:40Z
  screenshot: evidence/E2b-step2.png
  observed: |
    E2b-step2.png (ca {"a":1}, khổ 1440, sau 6 giây): trang Lead đã nhập, trong khung một khối báo lỗi nền hồng, chữ «Không tải được lead đã nhập» và «Mạng hay máy chủ không trả lời. Lead đã gửi vẫn còn nguyên.», đúng một nút «Thử lại» bên phải. Không khung chờ, không trang lỗi toàn màn, vỏ ứng dụng còn nguyên. E2b-step3.png (ca [null]): giống hệt, một khối báo lỗi, một «Thử lại», không trang lỗi toàn màn. Khớp Expected ở cả hai ca.
  network_observed: clean

- eval: E3b
  run_id: minted-va-lead-da-nhap-than-hong-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:12:40Z
  screenshot: evidence/E3b-step1.png
  observed: |
    Read all 6 frames. E3b-step1.png: page "Lead đã nhập" with one red-tinted block "Không tải được lead đã nhập" and a single "Thử lại" button, no table rows, no skeleton. E3b-step2.png: after unblock and click, the table is populated (header Lead / Nắc / Giờ · đầu chủ, rows "Toà Z · chỉ biết toà" with "Chờ chia", "Toà A · A-13.04" with "Trả lại"), no error block. E3b-step3.png: identical to step2 (recovered via online event with no click). E3b-step4.png, E3b-step5.png and E3b-step5b.png: each shows exactly one error block "Không tải được lead đã nhập" with exactly one "Thử lại", no rows, no skeleton. All match Expected.
  network_observed: clean

- eval: E4b
  run_id: minted-va-lead-da-nhap-than-hong-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-09T14:12:40Z
  screenshot: evidence/E4b-step1.png
  observed: |
    E4b-step1.png (copy of step 2): the "Lead đã nhập" page at 1440px with a full table, columns Lead, Nấc, Giờ · đầu chủ. The rows are Toà Z / Toà A leads with status chips (Chờ chia, Trả lại), no error block and no loading frame. E4b-step3.png: the card is empty with an inbox icon, heading "Chưa có lead nào", no red error block and no "Thử lại". E4b-step4.png and E4b-step5.png: exactly one pink error block titled "Không tải được lead đã nhập" with exactly one "Thử lại" button on the right, no skeleton or loading frame. All match Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-09T14:12:40Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T14:12:40Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-09T14:12:40Z

- cmd: npm run test:hooks
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T14:12:40Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T14:12:40Z

- cmd: npm run typecheck
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-09T14:12:40Z

- cmd: npm run lint
  run_id: minted-va-lead-da-nhap-than-hong-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T14:12:40Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: evals.yaml không đổi từ lần đo baseline cuối (round 1), nên mọi block eval ghi baseline n-a.

Eval không-phân-biệt (pass trên cả HEAD lẫn baseline, theo lần đo round 1; chứng minh harness chứ không phải tính năng, cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- E1, E2, E4 (lệnh `npm test -w @quy-hang/web`)
- E5 (lệnh khuôn `design-floor-khuon.mjs --kiem`)
- E6 (lệnh `design-floor-s4.mjs`)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lịch sử vòng đầu nằm ở run-log và báo cáo vòng trước; baseline cuối đo ở vòng này.
Round 2: cả chín eval (E1, E1b, E2, E2b, E3b, E4, E4b, E5, E6) và bảy lệnh suite đều đạt trên commit 96a9df41; verdict PASS.
