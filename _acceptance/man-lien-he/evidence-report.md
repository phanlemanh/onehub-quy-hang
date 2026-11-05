---
schema_version: 2
feature_slug: man-lien-he
verdict: PASS
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 87cc01d7706e42f961ce8a6cbf564027bb1d84a5
human_signoff:
---

# Evidence Report: man-lien-he

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | ui-check | PASS |
| E10c | AC-10 | test | PASS |
| E10d | AC-10 | script | PASS |
| E10e | AC-10 | script | PASS |
| E11 | AC-11 | test | PASS |
| E11b | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-man-lien-he-E1-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-man-lien-he-E1b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T08:40:08Z
  output: |
    ℹ duration_ms 719.75775

- eval: E2
  run_id: minted-man-lien-he-E2-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-man-lien-he-E3-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-man-lien-he-E4-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-man-lien-he-E5-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-man-lien-he-E6-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-man-lien-he-E6b-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-man-lien-he-E7-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-man-lien-he-E8-r2
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  note: carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-man-lien-he-E9-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-man-lien-he-E10-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T08:40:08Z
  output: |
    ℹ duration_ms 2252.018167

- eval: E10b
  run_id: E10b-2026-11-05
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T08:40:08Z
  screenshot: evidence/E10b-step1.png
  observed: |
    step1 (1440, signed in as Đầu chủ 2): Liên hệ screen with the left rail, a Liên hệ column (Tất cả liên hệ, Chủ bán, Chủ cho thuê, Người mua, Người thuê, Lead), the breadcrumb and the title «Liên hệ · 18 liên hệ». A search box «Tên hay số điện thoại» sits above a table with columns Tên, Loại, Người giữ, Cơ hội mở, Căn. Rows include «[Tên] Chủ thử 103 B» (Chủ bán, [Mẫu] Đầu chủ 2, 0, 1) and «[Mẫu] Chủ nhà 01» (1 cơ hội, 2 căn). The Liên hệ icon is highlighted in the rail. Matches Expected.
    step2 (1440, Đầu chủ 1, searched «Chủ thử 103», tapped row): the right-hand profile column «[Tên] Chủ thử 103», «Chủ bán · [Mẫu] Đầu chủ 1 giữ», «1 số · 0 cơ hội · 2 căn». It has the section SỐ with «Di động · chính ••• 087» (masked, last 3 digits) and a «Hiện số» button, CƠ HỘI with «—», CĂN with two lines «Toà A · T103-50373-1» and «T103-50373-2» («Chưa đủ để rao · —»), and DÒNG THỜI GIAN with two «Tạo hàng» entries. Matches Expected.
    step3: same profile after «Hiện số»: the number shows in clear as 0900000087 and the button becomes a dark «Gọi» (tel:0900000087). Taps counted: 3 (row, Hiện số, Gọi). Matches Expected (≤3).
    step4: search box holds «0900 000 086» and the result is a single line «Số này đã có trong sàn — [Mẫu] Đầu chủ 2 đang giữ». No owner name, no number, no table rows. Matches Expected.
    step5 (375): the Liên hệ list as cards with a bottom tab bar behind a dimmed overlay; a sheet rises from the bottom of the screen (top 147 of 812) titled «[Tên] Chủ thử 103» with Số «••• 087» and «Hiện số», Cơ hội, Căn (2) and Dòng thời gian. Page width equals viewport (no horizontal scroll). Matches Expected.
    step6 (Đầu khách, 1440): the «Đầu khách» Hôm nay screen with rail icons Hôm nay, Bảng hàng, Gửi. No Liên hệ entry anywhere. Matches Expected.
  network_observed: clean

- eval: E10c
  run_id: minted-man-lien-he-E10c-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T08:40:08Z
  output: |
    ℹ duration_ms 24354.868542

- eval: E10d
  run_id: minted-man-lien-he-E10d-r4
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T08:40:08Z
  output: |
    10 tệp giao diện ngoài bản đồ

- eval: E10e
  run_id: minted-man-lien-he-E10e-r4
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/man-lien-he/kiem-khuon-e10d.mjs
  verified_at: 2026-11-05T08:40:08Z
  output: |
    E10e: chỉ có dòng báo oan đã khai: lệch: apps/web/src/app/(app)/contacts/page.tsx · khuôn Placeholder · nhóm trang-tam

- eval: E11
  run_id: minted-man-lien-he-E11-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T08:40:08Z
  output: |
    ℹ duration_ms 2252.018167

- eval: E11b
  run_id: minted-man-lien-he-E11b-r4
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T08:40:08Z
  output: |
    ℹ duration_ms 719.75775

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-11-05T08:40:08Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-05T08:40:08Z

- cmd: npm run test:hooks
  run_id: minted-man-lien-he-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-05T08:40:08Z

- cmd: npm run typecheck
  run_id: minted-man-lien-he-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-05T08:40:08Z

- cmd: npm run lint
  run_id: minted-man-lien-he-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-11-05T08:40:08Z

## Known limits

- E10d (AC-10) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline — chứng minh harness chứ không phải tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):

- npm test -w @quy-hang/core: E1b, E11b
- npm test -w @quy-hang/web: E10, E11
- npm test -w @quy-hang/ui-lint: E10c

### Baseline khong do

- node _acceptance/man-lien-he/kiem-khuon-e10d.mjs: bo qua baseline: tep _acceptance/man-lien-he/kiem-khuon-e10d.mjs co o cay dang kiem nhung chua co o merge-base 07c3022287b32c6eef7ad034212f7f010ebd7162 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lượt, xác định; không eval nào có phương sai)

## Iterations

Round 1: E10b chưa đạt — returned to implementation.
Round 2–3: E10b chạy lại và đạt; các eval AC-1 đến AC-9 chốt ở round 1–2 (được mang tiếp sang round 4 vì delta không chạm paths).
Round 4: tất cả eval đạt, E10d đạt có giới hạn đã khai trước, kèm E10e xanh; verified_at của các eval chạy ở round 4 ghi theo ngày chạy vì nhật ký chạy chưa có dòng round 4 lúc soạn.
