---
schema_version: 2
feature_slug: trang-nhom-moi-gioi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3aead26f84e7e0c9058270083ee2535a8323e215
human_signoff: Manh Phan 2026-11-06
---

# Evidence Report: trang-nhom-moi-gioi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E10b | AC-10 | script | PASS (đạt có giới hạn) |
| E10c | AC-10 | test | PASS |
| E10e | AC-10 | script | PASS |

## Evidence

- eval: E9
  run_id: minted-trang-nhom-moi-gioi-E9-r4
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:56:04Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 114138.097208

- eval: E10b
  run_id: minted-trang-nhom-moi-gioi-E10b-r4
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T09:56:04Z
  output: |
    17 tệp giao diện ngoài bản đồ
    (mã thoát đã khai trước cho eval này, đi cùng E10e xanh)

- eval: E1
  run_id: minted-trang-nhom-moi-gioi-E1-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E1b
  run_id: minted-trang-nhom-moi-gioi-E1b-r2
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:35:12Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-trang-nhom-moi-gioi-E2-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E2b
  run_id: minted-trang-nhom-moi-gioi-E2b-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-trang-nhom-moi-gioi-E3-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-trang-nhom-moi-gioi-E3b-r2
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:35:12Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-trang-nhom-moi-gioi-E4-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.test.core
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E4b
  run_id: minted-trang-nhom-moi-gioi-E4b-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-trang-nhom-moi-gioi-E5-r2
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:35:12Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-trang-nhom-moi-gioi-E6-r2
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:35:12Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-trang-nhom-moi-gioi-E7-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-trang-nhom-moi-gioi-E8-r3
  exit_code: 0
  baseline: n-a
  carried_from_round: 3
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T09:50:00Z
  output: |
    carry-forward tu round 3 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-trang-nhom-moi-gioi-E8b-r2
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:35:12Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: E10-ui-verify-20261106
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T09:35:12Z
  screenshot: evidence/E10-step1.png
  observed: |
    I opened every saved frame with Read.
    step1: light-theme desktop page. Header "[Mẫu] Sàn thử" with sender line "[Mẫu] Đầu khách gửi bạn 3 căn". Below it "Bao phí: giá đã gồm thuế thu nhập cá nhân, lệ phí trước bạ, phí môi giới", then bold "Mức chia: 40%" and the Tải Excel and Tải ảnh buttons. A 14-column table has 3 rows: A-04.06 at 8,06 tỷ, A-06.03 at 5,55 tỷ, and A-01.03 dimmed as "Không còn bán" with "—" prices. This matches Expected.
    step2: same page. The saved downloads are the xlsx and png files. The headless frame cannot show a download bar, so the download evidence is the files.
    step3: same header and Bao phí line, no "Mức chia" line, buttons and the 3-row table unchanged. This matches.
    step3-admin: /settings/broker-page with the Ẩn mức chia switch on, Mức chia mặc định 50, and the banner "Đã lưu cài đặt trang môi giới".
    step4: client page with header and 2 cards (8,06 tỷ "Bao phí", 5,55 tỷ "Không bao phí") and Quan tâm buttons. No table and no Mức chia, as before.
    step5: 375px view. Header, Mức chia 40%, buttons, the hint "Kéo ngang để xem đủ cột" and a table cut at the Hướng column, which means it scrolls sideways. The frame is not broken.
    step8a and step8b: an alert box reading "Link không còn mở được — hỏi lại người gửi", identical for the disabled link and the bad code.
    step9: alert "Chưa mở được — thử lại sau" in a red-tinted box, with a dev overlay badge "1 Issue" bottom left.
    step10: the full page, with a red alert "Chưa tải được tệp — thử lại" between the buttons and the table, and the 3 rows intact.
    step11: Mức chia field shows 120 with a red border and red text "Mức chia từ 0 đến 100, tối đa hai chữ số lẻ"; the Lưu button is greyed out.
    step12: /settings/personal page with the notice "Mục này chỉ quản trị sàn mở được".
    downloaded PNG: shows "[Mẫu] Sàn thử", the Bao phí line, "Mức chia: 40%", all 14 headers (Toà to Xác nhận) and the 3 rows including dimmed A-01.03.
    All frames match the descriptions.
    Caveats: step 11 cannot press Lưu because it is disabled. Step 9 ran on a separate copy on 3498 without stopping web-L, which is a deviation from the written step. In steps 8 and 9 the alert sits at the top edge of the page with no sàn header, which is accepted because the link has no sàn context.
  network_observed: clean
  # carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10c
  run_id: minted-trang-nhom-moi-gioi-E10c-r2
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-06T09:35:12Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10e
  run_id: minted-trang-nhom-moi-gioi-E10e-r2
  exit_code: 0
  baseline: n-a
  carried_from_round: 2
  verifier: _acceptance/trang-nhom-moi-gioi/kiem-khuon-e10.mjs
  verified_at: 2026-11-06T09:35:12Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-trang-nhom-moi-gioi-SUITE-npm_test_w_quy_hang_core-r4
  exit_code: 0
  verified_at: 2026-11-06T09:56:04Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-nhom-moi-gioi-SUITE-npm_test_w_quy_hang_api-r4
  exit_code: 0
  verified_at: 2026-11-06T09:56:04Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-nhom-moi-gioi-SUITE-npm_test_w_quy_hang_connect-r4
  exit_code: 0
  verified_at: 2026-11-06T09:56:04Z

- cmd: npm run test:hooks
  run_id: minted-trang-nhom-moi-gioi-SUITE-test_hooks-r4
  exit_code: 0
  verified_at: 2026-11-06T09:56:04Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-trang-nhom-moi-gioi-SUITE-npm_test_w_quy_hang_ui_lint-r4
  exit_code: 0
  verified_at: 2026-11-06T09:56:04Z

- cmd: npm run typecheck
  run_id: minted-trang-nhom-moi-gioi-SUITE-typecheck-r4
  exit_code: 0
  verified_at: 2026-11-06T09:56:04Z

- cmd: npm run lint
  run_id: minted-trang-nhom-moi-gioi-SUITE-lint-r4
  exit_code: 0
  verified_at: 2026-11-06T09:56:04Z

## Known limits

- E10b (AC-10) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval không-phân-biệt (xanh cả trên mã mới lẫn mã cũ, đo ở baseline round 2): E1, E2b, E3, E4b, E8, E9 (lệnh db:migrate + db:test); E1b, E3b, E5, E6, E8b, E10c (lệnh test của web); E2, E4 (lệnh test của core); E7 (lệnh test:ro-ri). Cần viết lại để khẳng định hành vi mới hoặc xác nhận là hàng rào hồi quy có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: baseline đầu; E10b mang mã thoát đã khai trước (đạt có giới hạn), E10e giữ cùng.
Round 2: siết bốn phép đo, ghi bằng chứng lượt 2 (commit 20541c50).
Round 3: ca 048 không áp hộ migration còn chờ (commit 3aead26f); round 4 chạy lại E9, E10b và các lệnh suite, các eval còn lại carry-forward.
