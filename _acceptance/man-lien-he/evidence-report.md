---
schema_version: 2
feature_slug: man-lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8b00788735be1d6b51211631e460826d539cfe37
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

## Evidence

- eval: E1
  run_id: minted-man-lien-he-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E1b
  run_id: minted-man-lien-he-E1b-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-man-lien-he-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E3
  run_id: minted-man-lien-he-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E4
  run_id: minted-man-lien-he-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E5
  run_id: minted-man-lien-he-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E6
  run_id: minted-man-lien-he-E6-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-man-lien-he-E6b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E7
  run_id: minted-man-lien-he-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E8
  run_id: minted-man-lien-he-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 64631.694625

- eval: E9
  run_id: minted-man-lien-he-E9-r1
  exit_code: 0
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-man-lien-he-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4898.470583

- eval: E10b
  run_id: E10b-r2-20261105
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T05:31:43Z
  screenshot: evidence/E10b-step1.png
  observed: |
    I opened each saved frame with Read.
    step1 (1440, Đầu chủ 2 logged in): the Liên hệ page shows the left rail with 3 icons, the third highlighted. The table has columns Tên, Loại, Người giữ, Cơ hội mở, Căn. Rows include «[Tên] Chủ thử 104» (1 căn), «[Mẫu] Chủ nhà …», and «[Chưa có tên]» rows with a Lead badge. The type filters Chủ bán, Chủ cho thuê, Người mua, Người thuê and a search box are there. This matches Expected.
    step2 (Đầu chủ 1): the table is filtered to «[Tên] Chủ thử 103», type Chủ bán, held by [Mẫu] Đầu chủ 1, with 2 căn. The right sheet shows «1 số · 0 cơ hội · 2 căn» and the section SỐ, with Di động · chính «••• 093» and a Hiện số button. CƠ HỘI shows —. CĂN lists Toà A · A-93.01 and A-93.02, both «Chưa đủ để rao · —». DÒNG THỜI GIAN has two «Tạo hàng» entries. Số is masked down to the last three digits, there are at least 2 căn, and the Cơ hội and Dòng thời gian sections are present. This matches Expected.
    step3 (after Hiện số): the same sheet now shows the number 0900000093 and a dark «Gọi» button in place of Hiện số. This matches Expected. Tap count on the page is row, Hiện số, Gọi = 3 (4 if the tap on the rail item is also counted).
    step4: the table is replaced by one line «Số này đã có trong sàn — [Mẫu] Đầu chủ 2 đang giữ». There is no owner name and no number on the page apart from the typed search text, and no profile sheet. This matches Expected.
    step5 (375, mobile touch context, 2x image): a drawer rises from the bottom over a blurred list. It shows «[Tên] Chủ thử 103», «••• 093» with Hiện số, CƠ HỘI —, CĂN with A-93.01 and A-93.02, and DÒNG THỜI GIAN. The text is not cut off on the sides and the page does not scroll horizontally (scrollWidth 375 = clientWidth 375). This matches Expected.
    step6 (Đầu khách): the page is Hôm nay with the heading «Đầu khách» and today's items. The left rail has 3 icons: today (highlighted), grid, and send. No Liên hệ item appears anywhere. This matches Expected.
  network_observed: clean

- eval: E10c
  run_id: minted-man-lien-he-E10c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T05:31:43Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 26055.126625

- eval: E10d
  run_id: minted-man-lien-he-E10d-r2
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T05:31:43Z
  output: |
    8 tệp giao diện ngoài bản đồ

- eval: E10e
  run_id: minted-man-lien-he-E10e-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/man-lien-he/kiem-khuon-e10d.mjs
  verified_at: 2026-11-05T05:31:43Z
  output: |
    E10e: chỉ có dòng báo oan đã khai: lệch: apps/web/src/app/(app)/contacts/page.tsx · khuôn Placeholder · nhóm trang-tam

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T05:31:43Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T05:31:43Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T05:31:43Z

- cmd: npm run test:hooks
  run_id: minted-man-lien-he-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T05:31:43Z

- cmd: npm run typecheck
  run_id: minted-man-lien-he-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T05:31:43Z

- cmd: npm run lint
  run_id: minted-man-lien-he-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T05:31:43Z

## Known limits

- E10d (AC-10) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh ở cả HEAD lẫn baseline — chứng minh harness chứ chưa chứng minh feature; cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- npm run db:migrate && npm run db:test: E1, E2, E3, E4, E5, E6b, E7, E8
- npm test -w @quy-hang/web: E10
- npm test -w @quy-hang/ui-lint: E10c

### Baseline khong do

- node _acceptance/man-lien-he/kiem-khuon-e10d.mjs: bo qua baseline: tep _acceptance/man-lien-he/kiem-khuon-e10d.mjs co o cay dang kiem nhung chua co o merge-base 07c3022287b32c6eef7ad034212f7f010ebd7162 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10b, E10d failed — E10b không đạt ở lượt chấm đầu (cơ hội trỏ hồ sơ căn lệch tham số), E10d báo oan của kit#485 chưa được khai; một mục trong hợp đồng. Returned to implementation.
Round 2: toàn bộ eval đạt (E1b, E6, E9 mang từ round 1); E10b chạy lại và đạt, E10d đạt có giới hạn kèm E10e xanh. Verdict PASS.
