---
schema_version: 2
feature_slug: moi-nguoi-vai-khu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 68f621bf2af3eed9559dc8b2ad92a2e4f8c3ead3
human_signoff: Manh Phan 2026-10-30
---

# Evidence Report: moi-nguoi-vai-khu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-moi-nguoi-vai-khu-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

- eval: E2
  run_id: minted-moi-nguoi-vai-khu-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

- eval: E3
  run_id: minted-moi-nguoi-vai-khu-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

- eval: E4
  run_id: minted-moi-nguoi-vai-khu-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

- eval: E5
  run_id: minted-moi-nguoi-vai-khu-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

- eval: E6
  run_id: minted-moi-nguoi-vai-khu-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

- eval: E7
  run_id: minted-moi-nguoi-vai-khu-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

- eval: E8
  run_id: minted-moi-nguoi-vai-khu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-moi-nguoi-vai-khu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-moi-nguoi-vai-khu-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-30T15:10:05Z
  screenshot: evidence/E10-step1.png
  observed: |
    All 11 frames opened with Read and match the expected wording.
    step1: «Người dùng / Người của sàn [Sàn mẫu E10-ND]»; two members, e10-quan-tri with «Quản trị sàn» and e10-thuong with «Đầu khách»; buttons Sửa and Rời sàn / Bỏ; the Khu section is empty with a «Tên khu» field.
    step2: the Khu list now shows the chip [Toà mẫu A] above «Tên khu».
    step3a: the open form has Email e10-moi@example.test; Vai with Đầu chủ and Đầu khách ticked; Khu phụ trách with [Toà mẫu A] ticked; buttons «Mời» and «Huỷ».
    step3: after a reload the list has e10-moi first with chips «Đầu chủ», «Đầu khách» and «[Toà mẫu A]», above e10-quan-tri and e10-thuong.
    step4: the Email field is red with «Email này đã là thành viên của sàn.»; the form is open with Đầu chủ ticked; the list still shows e10-moi.
    step5a: the panel «Sửa e10-moi@example.test» has Vai (Đầu chủ and Đầu khách ticked), Khu phụ trách ([Toà mẫu A] ticked) and the buttons «Lưu» and «Huỷ».
    step5: after saving and reloading, e10-moi shows «Trưởng nhóm» and «[Toà mẫu A]».
    step6a: the modal «Bỏ e10-moi@example.test khỏi sàn?» with the text «Người này không vào được sàn nữa; khu phụ trách của họ ở sàn mất theo.» and the buttons «Huỷ» and «Bỏ khỏi sàn».
    step6: after confirming and reloading, only e10-quan-tri and e10-thuong remain; the Khu list still has [Toà mẫu A].
    step7: the modal «Bỏ e10-quan-tri@example.test khỏi sàn?» with the red text «Sàn cần ít nhất một quản trị.»
    step8: the header and the single line «Chỉ quản trị sàn xem được trang này.»; no member list.
    No contradictions with Expected.
  network_observed: clean

- eval: E11
  run_id: minted-moi-nguoi-vai-khu-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T15:10:05Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 1015.901416

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-30T15:10:05Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-30T15:10:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-30T15:10:05Z

- cmd: npm run test:hooks
  run_id: minted-moi-nguoi-vai-khu-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-30T15:10:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-30T15:10:05Z

- cmd: npm run typecheck
  run_id: minted-moi-nguoi-vai-khu-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-30T15:10:05Z

- cmd: npm run lint
  run_id: minted-moi-nguoi-vai-khu-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-30T15:10:05Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Baseline khong do:
- npm run db:migrate && npm run db:test: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

Danh sach eval khong-phan-biet: khong do duoc o round nay (baseline khong chay). Judge panels: khong co eval judgment nao, nen khong co hoi dong.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: moi eval xanh; mot finding trong hop dong (AC-4) ve quan tri tu go vai khong luu dung khu.
Round 2: sua o commit 68f621b (quan tri tu go vai van luu dung khu phu trach); E1-E7, E10, E11 chay lai xanh; E8 va E9 mang tu round 1.
