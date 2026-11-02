---
schema_version: 2
feature_slug: chuyen-khong-ket-khoa
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f7ef63737e2eda978a2f8a9215590707b096474c
human_signoff: Manh Phan 2026-11-02
---

# Evidence Report: chuyen-khong-ket-khoa

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-chuyen-khong-ket-khoa-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T02:45:32Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ca «liên hệ: bài chuyển khoá bảng chủ nhà rồi bảng lead trước mọi câu ghi» có mặt và ok
    ℹ duration_ms 22622.272875

- eval: E2
  run_id: minted-chuyen-khong-ket-khoa-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T02:45:32Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    hai ca «liên hệ: chuyển dữ liệu cũ» và «liên hệ: chuyển trên sàn không có dữ liệu» có mặt và ok
    ℹ duration_ms 22622.272875

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-02T02:45:32Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-02T02:45:32Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-02T02:45:32Z

- cmd: npm run test:hooks
  run_id: minted-chuyen-khong-ket-khoa-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-02T02:45:32Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-chuyen-khong-ket-khoa-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-02T02:45:32Z

- cmd: npm run typecheck
  run_id: minted-chuyen-khong-ket-khoa-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-02T02:45:32Z

- cmd: npm run lint
  run_id: minted-chuyen-khong-ket-khoa-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-02T02:45:32Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay.

Eval khong-phan-biet (xanh ca tren code hien tai lan baseline): E1, E2 (lenh `npm run db:migrate && npm run db:test`). Hai eval nay chung minh harness; nen viet lai de assert hanh vi moi, hoac xac nhan la regression-guard co chu y.

## Variance

none — every multi-run eval is uniform (moi eval chay mot lan, deterministic).

## Iterations

Round 1-2: xem run-log.jsonl; round 2 cham o ma 02bd061 voi mot ca kiem sau do da doi.
Round 3: E1, E2 va bay lenh suite deu xanh o ma f7ef637 (sau luot sua S4 luot 2). Verdict PASS. Khong co judge panel nao duoc de xuat (eval deu la test may).
