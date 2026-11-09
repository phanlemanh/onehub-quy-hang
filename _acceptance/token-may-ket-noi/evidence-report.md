---
schema_version: 2
feature_slug: token-may-ket-noi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 89441564b1e7266eb52941518abce82d1047b826
human_signoff: Manh Phan 2026-11-09
---

# Evidence Report: token-may-ket-noi

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
| E9 | AC-8 | test | PASS |
| E10 | AC-2 | test | PASS |
| E11 | AC-5 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-token-may-ket-noi-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Lệnh: db:migrate rồi chạy test-db/token-may/*.test.ts và test-db/catalog/nhan-goi.test.ts (concurrency 1).
    Toàn bộ ca đạt, gồm ca «cấp token: hiện một lần, lưu băm».

- eval: E2
  run_id: minted-token-may-ket-noi-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E1; các ca quyền quản lý, loại kết nối, thoả thuận không hiệu lực, trần token, song song, thu hồi đều đạt.

- eval: E3
  run_id: minted-token-may-ket-noi-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E1; ca đẩy gói bằng token, đẩy lại, gói sai khuôn và bộ nhan-goi đều đạt.

- eval: E4
  run_id: minted-token-may-ket-noi-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E1; ca token ngoài loại kết nối, đổi chiều, không mở route khác, cookie sàn khác đều đạt.

- eval: E5
  run_id: minted-token-may-ket-noi-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_cach_ly
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Lệnh: db:migrate rồi test:isolation của gói db.
    Ca machine_tokens, machine_token_calls, khoá ngoại ghép, tra theo băm đều đạt.

- eval: E6
  run_id: minted-token-may-ket-noi-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E1; ca từ chối lời gọi kế, Bearer hỏng kèm cookie, mở lại thoả thuận, tắt/thu hồi giữa lúc ghi đều đạt.

- eval: E7
  run_id: minted-token-may-ket-noi-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E1; ca nhật ký một lời gọi một dòng, token lạ không sinh dòng, ghi nhật ký lỗi thì gói không vào đều đạt.

- eval: E8
  run_id: minted-token-may-ket-noi-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_cach_ly
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E5; ca thu hồi một chiều, nhật ký chỉ thêm, trạng thái đích đều đạt.

- eval: E9
  run_id: minted-token-may-ket-noi-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_db
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E1; ca token không vào console và OpenAPI khai đường token đều đạt.

- eval: E11
  run_id: minted-token-may-ket-noi-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.token_may_cach_ly
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Cùng lệnh với E5; ca hai thứ tự áp migration đạt, hai danh sách bằng nhau.

- eval: E10
  run_id: minted-token-may-ket-noi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-09T11:40:52Z
  output: |
    Lệnh: npm test -w @quy-hang/core. Ca «cấp token theo loại kết nối» có mặt và đạt.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-token-may-ket-noi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-09T11:40:52Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-token-may-ket-noi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-09T11:40:52Z

- cmd: npm run test:hooks
  run_id: minted-token-may-ket-noi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-09T11:40:52Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-token-may-ket-noi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-09T11:40:52Z

- cmd: npm run typecheck
  run_id: minted-token-may-ket-noi-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-09T11:40:52Z

- cmd: npm run lint
  run_id: minted-token-may-ket-noi-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-09T11:40:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay (evals.yaml khong doi tu lan baseline cuoi). Baseline cua moi eval ghi n-a.

Eval khong-phan-biet can xem lai (carried, chua do lai): E1, E2, E3, E4, E6, E7, E9 (lenh token-may-db) va E10 (lenh core). Viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y.

## Variance

none — every multi-run eval is uniform (moi eval chay 1 lan, deterministic).

## Iterations

Round 1: lượt chấm 1 nêu ba điểm cần sửa; đã sửa và thu lệnh cách ly (commit b1bad799). Returned to implementation.
Round 2: toàn bộ 11 eval và các lệnh suite đạt trên b1bad799.

### Re-pin lần 1 — 2026-11-09, do gộp main sau chữ ký
run_id: repin-20261109T131259Z-49384
sha: 89441564b1e7266eb52941518abce82d1047b826 · suites: 7 lệnh exit 0 · evals: 11/11 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
