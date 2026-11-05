---
schema_version: 2
feature_slug: man-lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: abe133aae7680a2c58aa855d4f253b16de4a4d75
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
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-man-lien-he-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-man-lien-he-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-man-lien-he-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-man-lien-he-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-man-lien-he-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-man-lien-he-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-man-lien-he-E6b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-man-lien-he-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-man-lien-he-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T05:31:43Z
  carried_from_round: 2
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-man-lien-he-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T04:58:39Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-man-lien-he-E10-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T07:39:08Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 4340.103416

- eval: E10b
  run_id: E10b-20261105-1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T07:39:08Z
  screenshot: evidence/E10b-step1.png
  observed: |
    step1 (1440, Đầu chủ 1): header «Quỹ hàng > Liên hệ», card «Liên hệ» with filter chips Chủ bán / Chủ cho thuê / Người mua / Người thuê and search «Tên hay số điện thoại»; table columns Tên · Loại · Người giữ · Cơ hội mở · Căn; first row [Tên] Chủ thử 103, Chủ bán, [Mẫu] Đầu chủ 1, 0, 4; Lead rows show [Chưa có tên] + Lead badge. Left rail's third icon (Liên hệ) has the highlighted background.
    step2: after search + row tap, right-hand profile panel (inset sheet inside the danh-sách–chi-tiết layout, list stays visible and narrowed behind it): title [Tên] Chủ thử 103, «Chủ bán · [Mẫu] Đầu chủ 1 giữ», badge Liên hệ, «1 số · 0 cơ hội · 4 căn»; SỐ «Di động · chính ••• 093» with button «Hiện số»; CƠ HỘI «—»; CĂN four rows (Toà A · A-93.01, Toà A · A-93.02, Toà A, Toà A, each «Chưa đủ để rao · —»); DÒNG THỜI GIAN Tạo hàng/Mở số entries.
    step3: same panel, number now «0900000093» and a dark «Gọi» button with phone icon replacing «Hiện số». step4: list empty, only a bar «Số này đã có trong sàn — [Mẫu] Đầu chủ 2 đang giữ», search box holds «0900 000 097»; no owner name, no number, no rows.
    step5 (375): contact profile as a bottom sheet rising from below with the list dimmed above; shows name, SỐ ••• 093 + Hiện số, CƠ HỘI, CĂN, DÒNG THỜI GIAN; nothing cut off horizontally, scrollWidth 375. step6 (Đầu khách): Hôm nay screen «Đầu khách» with sub-nav Lead mới etc. and feed cards; left rail has three icons (Hôm nay, Bảng hàng, Gửi), no Liên hệ item. All six frames agree with Expected. Tap count desktop = 3.
  network_observed: clean

- eval: E10c
  run_id: minted-man-lien-he-E10c-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-05T07:39:08Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 26440.894542

- eval: E10d
  run_id: minted-man-lien-he-E10d-r3
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T07:39:08Z
  output: |
    8 tệp giao diện ngoài bản đồ

- eval: E10e
  run_id: minted-man-lien-he-E10e-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/man-lien-he/kiem-khuon-e10d.mjs
  verified_at: 2026-11-05T07:39:08Z
  output: |
    E10e: chỉ có dòng báo oan đã khai: lệch: apps/web/src/app/(app)/contacts/page.tsx · khuôn Placeholder · nhóm trang-tam

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-05T07:39:08Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-05T07:39:08Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-man-lien-he-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-05T07:39:08Z

- cmd: npm run test:hooks
  run_id: minted-man-lien-he-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-05T07:39:08Z

- cmd: npm run typecheck
  run_id: minted-man-lien-he-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-05T07:39:08Z

- cmd: npm run lint
  run_id: minted-man-lien-he-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-05T07:39:08Z

## Known limits

- E10d (AC-10) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval không-phân-biệt (xanh ở cả HEAD lẫn baseline — chứng minh harness chứ chưa chứng minh feature; cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý):

- npm run db:migrate && npm run db:test: E1, E2, E3, E4, E5, E6b, E7, E8
- npm test -w @quy-hang/web: E10
- npm test -w @quy-hang/ui-lint: E10c

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10b, E10d failed — E10b không đạt ở lượt chấm đầu (cơ hội trỏ hồ sơ căn lệch tham số), E10d báo oan của kit#485 chưa được khai; một mục trong hợp đồng. Returned to implementation.
Round 2: toàn bộ eval đạt (E1b, E6, E9 mang từ round 1); E10b chạy lại và đạt, E10d đạt có giới hạn kèm E10e xanh. Verdict PASS.
Round 3: chấm lại trên HEAD abe133aa sau khi hồ sơ người được dời sang cotPhu/chiTiet của bố cục danh sách – chi tiết; E10, E10b, E10c, E10d, E10e và sáu lệnh suite chạy lại và đạt (E10d đạt có giới hạn kèm E10e xanh); E1–E9 mang từ round 1 và 2. Verdict PASS.
