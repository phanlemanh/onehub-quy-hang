---
schema_version: 2
feature_slug: moi-nguoi-vai-khu
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 584346ea1e1af21b272b305ec8d23e11750f9e53
human_signoff:
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
  run_id: minted-moi-nguoi-vai-khu-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E2
  run_id: minted-moi-nguoi-vai-khu-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E3
  run_id: minted-moi-nguoi-vai-khu-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E4
  run_id: minted-moi-nguoi-vai-khu-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E5
  run_id: minted-moi-nguoi-vai-khu-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E6
  run_id: minted-moi-nguoi-vai-khu-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E7
  run_id: minted-moi-nguoi-vai-khu-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E8
  run_id: minted-moi-nguoi-vai-khu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E9
  run_id: minted-moi-nguoi-vai-khu-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

- eval: E10
  run_id: minted-moi-nguoi-vai-khu-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-10-30T11:13:03Z
  screenshot: evidence/E10-step1.png
  observed: |
    step1: tieu de «Người dùng / Người của sàn [Sàn mẫu E10-ND]», muc Thanh vien co e10-quan-tri@example.test (chip Quản trị sàn, nut Sửa/Rời sàn) va e10-thuong (Đầu khách, Sửa/Bỏ); muc Khu rong. step2: chip khu [Toà mẫu A] duoi tieu de Khu. step3a: form Mời mo, email e10-moi@example.test, tick Đầu chủ + Đầu khách, tick khu [Toà mẫu A], nut Mời/Huỷ. step3: danh sach co e10-moi voi chip Đầu chủ, Đầu khách, [Toà mẫu A] (sau tai lai). step4: o email do, chu do «Email này đã là thành viên của sàn.», danh sach khong doi. step5a: khung «Sửa e10-moi@example.test» voi Vai/Khu phu trach da tick va nut Lưu, Huỷ. step5: e10-moi chi con chip Trưởng nhóm + [Toà mẫu A]. step6a: hop thoai mo mo nen «Bỏ e10-moi@example.test khỏi sàn?» voi Huỷ / Bỏ khỏi sàn. step6: danh sach chi con quan tri va thuong, khu van con. step7: hop «Bỏ e10-quan-tri@example.test khỏi sàn?» kem dong do «Sàn cần ít nhất một quản trị.». step8: chi tieu de va dong «Chỉ quản trị sàn xem được trang này.» khong co danh sach. Tat ca tieng Viet, khop Expected.
  network_observed: clean

- eval: E11
  run_id: minted-moi-nguoi-vai-khu-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-30T11:13:03Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 951.434709

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-30T11:13:03Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-30T11:13:03Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-30T11:13:03Z

- cmd: npm run test:hooks
  run_id: minted-moi-nguoi-vai-khu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-30T11:13:03Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-moi-nguoi-vai-khu-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-30T11:13:03Z

- cmd: npm run typecheck
  run_id: minted-moi-nguoi-vai-khu-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-30T11:13:03Z

- cmd: npm run lint
  run_id: minted-moi-nguoi-vai-khu-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-30T11:13:03Z

## Known limits

## Ngoài hợp đồng

## Analyst

baseline: BLOCKED ha tang — lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

none — khong do duoc o round nay do baseline bi chan ha tang; khong eval nao duoc xac dinh la khong-phan-biet.

Baseline khong do:
- npm run db:migrate && npm run db:test: BLOCKED ha tang baseline: lenh baseline khong chay dong nao (cong cu tu choi loi goi, hoac khong ghi duoc tep kich ban) — cong cu tra: «<\tool_use_error>Error: No such tool available: Write. Write is not among the tools available here. Continue with the tools you have.<\/tool_use_error>»

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1-E11 all passed; no failed evals. Returned for Gate 2 review.
