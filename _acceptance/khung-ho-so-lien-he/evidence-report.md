---
schema_version: 2
feature_slug: khung-ho-so-lien-he
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fed3fec163e6eaa733c3ade9fb4cb6b46231d614
human_signoff:
---

# Evidence Report: khung-ho-so-lien-he

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | script | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-khung-ho-so-lien-he-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:27:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6471.072167

- eval: E2
  run_id: minted-khung-ho-so-lien-he-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:27:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6471.072167

- eval: E3
  run_id: minted-khung-ho-so-lien-he-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:27:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6471.072167

- eval: E4
  run_id: minted-khung-ho-so-lien-he-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:27:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6471.072167

- eval: E5
  run_id: minted-khung-ho-so-lien-he-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:09:23Z
  carried_from_round: 1
  note: carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-khung-ho-so-lien-he-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T01:27:36Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 30836.878916

- eval: E6b
  run_id: minted-khung-ho-so-lien-he-E6b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T01:27:36Z
  output: |
    design-floor-khuon --kiem --root .
    7 tệp giao diện ngoài bản đồ

- eval: E7
  run_id: minted-khung-ho-so-lien-he-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:27:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6471.072167

- eval: E7b
  run_id: minted-khung-ho-so-lien-he-E7b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-08T01:27:36Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6471.072167

- eval: E8
  run_id: verify-khung-ho-so-lien-he-E8-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T01:27:36Z
  screenshot: evidence/E8r3-step1.png
  observed: |
    E8r3-step1.png (1440, light): table has 4 columns Tên · Người giữ · Cơ hội mở · Căn with no horizontal scrollbar. The row [Tên] chủ nhà is shaded grey. To its right is a bordered profile panel as tall as the column, with an X close button at the top right, holding the Số, Cơ hội, Căn and Dòng thời gian sections. Matches the expected result.
    E8r3-step2.png (560px high): the rows (cloned in the DOM) have scrolled, the scrollbar sits mid-track, while the title 'Liên hệ', the search box and the header row stay in place. The profile panel scrolls separately. Matches.
    E8r3-step3a-esc.png, E8r3-step3b-btn.png: measured by the DOM count of the Đóng button (1 to 0 each time). E8r3-step3c-search-esc.png: search shows 'chu' with focus, profile still open. Matches.
    E8r3-step4.png (/inventory): C-05.10 profile panel with Mở toàn màn and X buttons, price 4,1 tỷ, Ảnh tab, unchanged framing. Matches.
    E8r3-step6-all.png and E8r3-step6-buyer.png: the pages loaded with 1 row (all) and 0 rows (Buyer); no contacts API call.
    E8r3-step7b-after-esc.png: the account menu is closed and the profile panel is still open. E8r3-step7c-closed.png: profile closed, the table spans the whole work area to x=1410. Matches.
    E8r3-step8.png (375): bottom sheet titled '[Tên] chủ nhà' with the profile, X at the top right, content within width, nothing cut off. E8r3-step8-list.png: list as cards, no horizontal overflow. Matches.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-08T01:27:36Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-08T01:27:36Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-khung-ho-so-lien-he-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-08T01:27:36Z

- cmd: npm run test:hooks
  run_id: minted-khung-ho-so-lien-he-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-08T01:27:36Z

- cmd: npm run typecheck
  run_id: minted-khung-ho-so-lien-he-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-08T01:27:36Z

- cmd: npm run lint
  run_id: minted-khung-ho-so-lien-he-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-08T01:27:36Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay.

Eval khong-phan-biet (xanh tren ca nhanh lan baseline; chung minh harness chu khong phai feature — can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E7, E7b
- npm test -w @quy-hang/ui-lint: E6
- design-floor-khuon --kiem --root .: E6b

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: sua nut Dong o trang thai tai va loi, khong doc lai danh sach khi bang da dung bo loc; bang chung luot 1. Returned to implementation.
Round 2: sua bang khong ket khi quay ve bo loc cu; bang chung luot 2. Returned to implementation.
Round 3: moi eval chay lai tren fed3fec1 deu xanh; E5 carry-forward tu round 1. Verdict PASS.
