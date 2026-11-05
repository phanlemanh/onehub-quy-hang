---
schema_version: 2
feature_slug: nhap-hoan-tac
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 442e728a6fde78084445c7e2fc2db90329b05e10
human_signoff: Manh Phan 2026-11-05
---

# Evidence Report: nhap-hoan-tac

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | test | PASS |
| E7d | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-11 | test | PASS |
| E12 | AC-8 | script | PASS |
| E12b | AC-8 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-hoan-tac-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E2
  run_id: minted-nhap-hoan-tac-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E3
  run_id: minted-nhap-hoan-tac-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 746.426792

- eval: E3b
  run_id: minted-nhap-hoan-tac-E3b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E4
  run_id: minted-nhap-hoan-tac-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 746.426792

- eval: E4b
  run_id: minted-nhap-hoan-tac-E4b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E5
  run_id: minted-nhap-hoan-tac-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E6
  run_id: minted-nhap-hoan-tac-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E7
  run_id: minted-nhap-hoan-tac-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 746.426792

- eval: E7b
  run_id: minted-nhap-hoan-tac-E7b-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E7c
  run_id: minted-nhap-hoan-tac-E7c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2047.290333

- eval: E7d
  run_id: minted-nhap-hoan-tac-E7d-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 68903.166041

- eval: E8
  run_id: minted-nhap-hoan-tac-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2047.290333

- eval: E8b
  run_id: minted-nhap-hoan-tac-E8b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T02:04:06Z
  screenshot: evidence/E8b-1-trong-1440.png
  observed: |
    1440 va 375 deu khop. Khung1 trong: buoc 1 Nhap Excel, muc 'Lan nhap gan day' co 'Chua co lan nhap nao' + 'Lan nhap da ghi se hien o day de hoan tac khi can'. Khung2 sau-ghi: buoc 5 (mo mo sau lop phu) co nut 'Hoan tac lan nhap nay', hop 'Hoan tac lan nhap nay?' voi 'Go 30 can khoi Quy hang · Tra gia cu cho 0 can · 0 can khong hoan tac duoc', nut Hoan tac/Giu lai. Khung3 xac-nhan: hop 'Da hoan tac lan nhap' cung dong tom tat, nut Dong; (Bang hang con 30 -> 0 theo JSON). Khung4 da-hoan-tac: danh sach 'Lan nhap gan day' co mau-b.xlsx · 2026-11-05 · 30 dong ghi voi nhan 'Da hoan tac', khong nut. Khung5 da-sua-sau: hop 'Go 19 can ... 1 can khong hoan tac duoc', liet ke 'Toa A · A-02.06 — Da co nguoi sua sau lan nhap'. Khung6 loi-giua-chung: hop co khung do 'Hoan tac chua xong — bam lai de lam tiep', nut 'Hoan tac tiep'; sau go chan bam lai thi xong (JSON). Khong co bo cuc vo o 375.
  network_observed: n-a (driver)
  output: |
    Dung-g chay (3493). 6 ca x 2 kho, tat ca JSON dung expected. Frame luu: E8b-1..6 o 1440 va 375 (.png), E8b-network.txt. Assertion: trong chuaCo=true; sau-ghi soDongTao=30; xac-nhan bang hang 30 -> 0; da-hoan-tac coNhan=true, soNutHoanTac=0; da-sua-sau coLyDo=true; loi-giua-chung baoChuaXong=true, xongSauKhiBamLai=true. Da tat server.

- eval: E9
  run_id: minted-nhap-hoan-tac-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2047.290333

- eval: E10
  run_id: minted-nhap-hoan-tac-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 746.426792

- eval: E11
  run_id: minted-nhap-hoan-tac-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 2047.290333

- eval: E12
  run_id: minted-nhap-hoan-tac-E12-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-05T02:04:06Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E12b
  run_id: minted-nhap-hoan-tac-E12b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T02:04:06Z
  output: |
    design-floor-khuon --kiem
    3 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-hoan-tac-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T02:04:06Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-hoan-tac-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T02:04:06Z

- cmd: npm run test:hooks
  run_id: minted-nhap-hoan-tac-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T02:04:06Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-hoan-tac-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T02:04:06Z

- cmd: npm run typecheck
  run_id: minted-nhap-hoan-tac-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T02:04:06Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/core: E3, E4, E7, E10
- npm test -w @quy-hang/web: E7c, E8, E9, E11
- npm run lint: E12
- design-floor-khuon --kiem: E12b

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm 1 trả về — xem trước lỗi không được mở nút ghi, ghim lại khuôn, bảng khuôn ui-lint. Returned to implementation.
Round 2: toàn bộ 19 eval và 5 lệnh suite xanh; PASS.

