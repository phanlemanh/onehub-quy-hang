---
schema_version: 2
feature_slug: va-bai-o-la-do-ngau-nhien
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5bc6b8b3a36415f0c4b7214f867380dcf2a00522
human_signoff:
---

# Evidence Report: va-bai-o-la-do-ngau-nhien

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-va-bai-o-la-do-ngau-nhien-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.o_la_db
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: db:migrate rồi node --test o-la.test.ts (một lần chạy chung cho E1-E5, E10)
    ℹ duration_ms 1576.937209
    Ca «phép kiểm sổ: đỏ khi số lọt vào, không bắt nhầm mã máy» đạt.

- eval: E2
  run_id: minted-va-bai-o-la-do-ngau-nhien-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.o_la_db
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: db:migrate rồi node --test o-la.test.ts (một lần chạy chung cho E1-E5, E10)
    ℹ duration_ms 1576.937209
    Sáu dạng số đầy đủ trả đúng {truong: model, dang: day-du}.

- eval: E3
  run_id: minted-va-bai-o-la-do-ngau-nhien-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.o_la_db
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: db:migrate rồi node --test o-la.test.ts (một lần chạy chung cho E1-E5, E10)
    ℹ duration_ms 1576.937209
    Các ca đầu số, đuôi, đuôi viết rời trả đúng {truong: model, dang: mot-phan}.

- eval: E4
  run_id: minted-va-bai-o-la-do-ngau-nhien-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.o_la_db
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: db:migrate rồi node --test o-la.test.ts (một lần chạy chung cho E1-E5, E10)
    ℹ duration_ms 1576.937209
    Mã người mang số, mã người mang đuôi, trường số mang đủ số đều báo đỏ gọi đúng tên trường.

- eval: E5
  run_id: minted-va-bai-o-la-do-ngau-nhien-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.o_la_db
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: db:migrate rồi node --test o-la.test.ts (một lần chạy chung cho E1-E5, E10)
    ℹ duration_ms 1576.937209
    Ca «phép kiểm sổ không đỏ trên mã máy ngẫu nhiên» đạt (20000 dòng sinh).

- eval: E6
  run_id: minted-va-bai-o-la-do-ngau-nhien-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.o_la_pha_thu
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: node _acceptance/va-bai-o-la-do-ngau-nhien/thu/pha-thu.mjs (chung cho E6, E7)
    KẾT: ĐẠT

- eval: E7
  run_id: minted-va-bai-o-la-do-ngau-nhien-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.o_la_pha_thu
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: node _acceptance/va-bai-o-la-do-ngau-nhien/thu/pha-thu.mjs (chung cho E6, E7)
    KẾT: ĐẠT

- eval: E8
  run_id: minted-va-bai-o-la-do-ngau-nhien-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.o_la_lap
  verified_at: 2026-11-09T04:43:13Z
  output: |
    KẾT: 300 lần, đỏ 0

- eval: E9
  run_id: minted-va-bai-o-la-do-ngau-nhien-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.o_la_pham_vi
  verified_at: 2026-11-09T04:43:13Z
  output: |
    ĐẠT phạm vi: 14 tệp đổi, đều trong danh sách viết trước

- eval: E10
  run_id: minted-va-bai-o-la-do-ngau-nhien-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.o_la_db
  verified_at: 2026-11-09T04:43:13Z
  output: |
    Lệnh: db:migrate rồi node --test o-la.test.ts (một lần chạy chung cho E1-E5, E10)
    ℹ duration_ms 1576.937209
    Ca «phép kiểm sổ: mọi cột của dòng thật» đạt.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bai-o-la-do-ngau-nhien-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-09T04:43:13Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bai-o-la-do-ngau-nhien-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-09T04:43:13Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bai-o-la-do-ngau-nhien-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-09T04:43:13Z

- cmd: npm run test:hooks
  run_id: minted-va-bai-o-la-do-ngau-nhien-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-09T04:43:13Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bai-o-la-do-ngau-nhien-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-09T04:43:13Z

- cmd: npm run typecheck
  run_id: minted-va-bai-o-la-do-ngau-nhien-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-09T04:43:13Z

- cmd: npm run lint
  run_id: minted-va-bai-o-la-do-ngau-nhien-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-09T04:43:13Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả ở HEAD lẫn baseline): E1, E2, E3, E4, E5, E10 (cùng một lệnh `o-la.test.ts` với cơ sở dữ liệu thử). Baseline xanh vì tệp kiểm này chạy được trên code cũ; cần viết lại để khẳng định hành vi mới, hoặc xác nhận là rào hồi quy có chủ ý. Chiều đỏ của chúng được đo bởi E7 (các bản phá), không bởi baseline.

Baseline không đo:
- node _acceptance/va-bai-o-la-do-ngau-nhien/thu/pha-thu.mjs: bo qua baseline: tep _acceptance/va-bai-o-la-do-ngau-nhien/thu/pha-thu.mjs co o cay dang kiem nhung chua co o merge-base 98d0d6463e8ed2623c7275044aa01a739c811ca8 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-bai-o-la-do-ngau-nhien/thu/lap.mjs --lan 300: bo qua baseline: tep _acceptance/va-bai-o-la-do-ngau-nhien/thu/lap.mjs co o cay dang kiem nhung chua co o merge-base 98d0d6463e8ed2623c7275044aa01a739c811ca8 — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-bai-o-la-do-ngau-nhien/thu/pham-vi.mjs: bo qua baseline: tep _acceptance/va-bai-o-la-do-ngau-nhien/thu/pham-vi.mjs co o cay dang kiem nhung chua co o merge-base 98d0d6463e8ed2623c7275044aa01a739c811ca8 — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: tất cả E1-E10 đạt, các lệnh suite xanh; không có eval đỏ.

### Re-pin lần 1 — 2026-11-09, do gộp main sau lượt chấm, không đổi tệp của hồ sơ
run_id: repin-20261109T054832Z-93654
sha: 3d105544c3c1ce741ecd869920486e6011bf4165 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

### Re-pin lần 2 — 2026-11-09, do gộp main lần hai, không đổi tệp của hồ sơ
run_id: repin-20261109T060231Z-99492
sha: e0f8e032c3055f660777f30f016ade540d99e028 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)

### Re-pin lần 3 — 2026-11-09, do gộp main lần ba, không đổi tệp của hồ sơ
run_id: repin-20261109T061800Z-49649
sha: 5bc6b8b3a36415f0c4b7214f867380dcf2a00522 · suites: 7 lệnh exit 0 · evals: 10/10 eval máy đạt kỳ vọng · suite chạy ở môi trường giống CI (biến rỗng: DATABASE_URL, SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, APP_URL)
