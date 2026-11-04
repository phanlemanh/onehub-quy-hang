---
schema_version: 2
feature_slug: da-gui
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d718f24c87570b165d878efd4d56eefeb5a7dd73
human_signoff: Manh Phan 2026-11-04
---

# Evidence Report: da-gui

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E9b | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E10b | AC-10 | test | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-da-gui-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:47:34Z
  output: |
    ℹ duration_ms 52618.53325

- eval: E2
  run_id: minted-da-gui-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:47:34Z
  output: |
    ℹ duration_ms 52618.53325

- eval: E3
  run_id: minted-da-gui-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:47:34Z
  output: |
    ℹ duration_ms 52618.53325

- eval: E4b
  run_id: minted-da-gui-E4b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:47:34Z
  output: |
    ℹ duration_ms 52618.53325

- eval: E5
  run_id: minted-da-gui-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:47:34Z
  output: |
    ℹ duration_ms 52618.53325

- eval: E7
  run_id: minted-da-gui-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:47:34Z
  output: |
    ℹ duration_ms 52618.53325

- eval: E4
  run_id: minted-da-gui-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T12:47:34Z
  output: |
    ℹ duration_ms 641.849583

- eval: E6b
  run_id: minted-da-gui-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T12:47:34Z
  screenshot: evidence/E6b-step1.png
  observed: |
    E6b-step1.png (375x812, /shares): tiêu đề «Link đã gửi». Lưới thẻ hai cột; mỗi thẻ có bìa ảnh ghép lưới, tên người nhận, «N căn · giờ», «mở · quan tâm», «Mở gần nhất giờ». Thẻ đầu: «[Mẫu] Khách chấm», 3 căn · 19:53 04-11, 1 mở, 1 quan tâm, Mở gần nhất 19:53 04-11. Thẻ thứ hai mang nhãn «Đã tắt» (link cũ của lượt trước), điều này đúng với dữ liệu. Khớp Expected bước 1.
    E6b-step2.png: sheet chi tiết «[Mẫu] Khách chấm» với ba căn. Toà A · A-08.03: 4,5 tỷ · 1 quan tâm, chip «Vừa đổi giá: 4,8 tỷ → 4,5 tỷ»; dưới là «Gợi ý căn thay» với Toà B · B-14.04 (4,61 tỷ · Gửi căn này) và Toà B · B-14.05 (4,36 tỷ · Gửi căn này). Toà A · A-04.06: 8,06 tỷ · 0 quan tâm; Toà A · A-10.05: 6,97 tỷ · 0 quan tâm; nút «Tắt link» ở đáy. Khớp Expected bước 2.
    E6b-step2b.png: màn «Gửi căn» với lối «Bảng hàng», «Gửi cho ai» (Khách riêng, Nhóm môi giới), «Căn sẽ gửi: 1 căn đang bán» chỉ có Toà B B-14.04, 82,3 m² · 2 PN · Tây Nam, 4,61 tỷ, Bao phí. Căn gợi ý đã được chọn. Khớp Expected bước 2b.
    E6b-step3.png: sau xác nhận, sheet chi tiết vẫn mở nên thẻ ở nền mờ; hai thẻ đầu ở nền đều mang nhãn «Đã tắt» (thẻ đầu vừa tắt). Toast ở đáy: «Đã tắt — khách mở link sẽ thấy «Link không còn mở được»». DOM xác nhận article đầu bắt đầu bằng «Đã tắt». Khớp Expected bước 3.
    E6b-step4.png: cửa sổ không đăng nhập, trang trắng với một hộp thông báo ở đầu: «Link không còn mở được — hỏi lại người gửi». Khớp Expected bước 4.
  network_observed: clean

- eval: E3b
  run_id: minted-da-gui-E3b-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-da-gui-E5b-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-da-gui-E6-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-da-gui-E8-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-da-gui-E9-r1
  exit_code: 0
  verifier: config:executors.test.web
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-da-gui-E9b-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-da-gui-E10-r1
  exit_code: 0
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10b
  run_id: minted-da-gui-E10b-r1
  exit_code: 0
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-da-gui-E11-r1
  exit_code: 0
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T12:01:25Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-da-gui-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T12:47:34Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-da-gui-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T12:47:34Z

- cmd: npm run test:hooks
  run_id: minted-da-gui-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T12:47:34Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-da-gui-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T12:47:34Z

- cmd: npm run typecheck
  run_id: minted-da-gui-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T12:47:34Z

- cmd: npm run lint
  run_id: minted-da-gui-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-04T12:47:34Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: moi eval round nay ghi baseline n-a.

Eval khong-phan-biet (pass tren ca HEAD lan baseline round 1; nen viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- npm run db:migrate && npm run db:test: E1, E2, E3, E4b, E5, E7, E9b
- npm test -w @quy-hang/web: E3b, E5b, E6, E8, E9
- npm test -w @quy-hang/core: E4
- npm run test:ro-ri: E10
- npm test -w @quy-hang/ui-lint: E10b
- node design-floor-khuon.mjs --kiem: E11

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tat ca eval PASS; ghi nhan cac muc ngoai hop dong va hai loi trong hop dong (AC-7, AC-3) o review.
Round 2: S4 vong 1 — sua tat link tu choi phien khong nguoi (migration 033) va gia luc gui; E1, E2, E3, E4, E4b, E5, E6b, E7 chay lai, PASS; cac eval con lai carry-forward tu round 1.

### Re-pin lần 1 — 2026-11-04, do gộp nhánh chính (hàng 67) sau lượt chấm 2, trước commit chữ ký
run_id: repin-20261104T133219Z-57054
sha: d718f24c87570b165d878efd4d56eefeb5a7dd73 · suites: 7 lệnh exit 0 · evals: 16/16 eval máy đạt kỳ vọng · ngoài làn máy: E6b
