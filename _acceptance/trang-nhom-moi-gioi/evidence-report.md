---
schema_version: 2
feature_slug: trang-nhom-moi-gioi
verdict: REJECT
failed_evals: ["E10b","E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: fc3af7d1065c34065a8452be22e0955ddd359332
human_signoff:
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
| E10 | AC-10 | ui-check | FAIL |
| E10b | AC-10 | script | FAIL |
| E10c | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-trang-nhom-moi-gioi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 114680.598375

- eval: E2b
  run_id: minted-trang-nhom-moi-gioi-E2b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 114680.598375

- eval: E3
  run_id: minted-trang-nhom-moi-gioi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 114680.598375

- eval: E4b
  run_id: minted-trang-nhom-moi-gioi-E4b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 114680.598375

- eval: E8
  run_id: minted-trang-nhom-moi-gioi-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 114680.598375

- eval: E9
  run_id: minted-trang-nhom-moi-gioi-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 114680.598375

- eval: E1b
  run_id: minted-trang-nhom-moi-gioi-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2839.030958

- eval: E3b
  run_id: minted-trang-nhom-moi-gioi-E3b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2839.030958

- eval: E5
  run_id: minted-trang-nhom-moi-gioi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2839.030958

- eval: E6
  run_id: minted-trang-nhom-moi-gioi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2839.030958

- eval: E8b
  run_id: minted-trang-nhom-moi-gioi-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2839.030958

- eval: E10c
  run_id: minted-trang-nhom-moi-gioi-E10c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2839.030958

- eval: E2
  run_id: minted-trang-nhom-moi-gioi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1423.243583

- eval: E4
  run_id: minted-trang-nhom-moi-gioi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 1423.243583

- eval: E7
  run_id: minted-trang-nhom-moi-gioi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T03:22:39Z
  output: |
    npm run test:ro-ri
    ℹ duration_ms 1212.503459

- eval: E10b
  run_id: minted-trang-nhom-moi-gioi-E10b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T03:22:39Z
  output: |
    bản đồ nhóm trang-tam đổi sau khi ghim — chấm theo bản ghim
    lệch: apps/web/src/app/(app)/settings/broker-page/page.tsx · thuộc hai nhóm màn: cai-dat-san, trang-tam
    17 tệp giao diện ngoài bản đồ

- eval: E10
  run_id: minted-trang-nhom-moi-gioi-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T03:22:39Z
  screenshot: evidence/E10-step1.png
  observed: |
    step1: đầu trang "[Mau] San thu", "[Mau] Dau khach gui ban 3 can", dong Bao phi, "Muc chia: 40%", hai nut Tai Excel/Tai anh, bang 14 cot 3 dong A-04.06 (8,06 ty), A-06.03 (5,55 ty), A-01.03 (Khong con ban, gia —). step3: cung trang, khong co dong Muc chia. step4: trang the 2 can, khong bang. step5: 375px, bang bi cat o cot Huong, co chu "Keo ngang de xem du cot". step8a/8b: "Link khong con mo duoc - hoi lai nguoi gui". step10: "Chua tai duoc tep - thu lai" canh nut. step11: o 120 vien do, loi duoi o, nut Luu xam. step12: trang Ca nhan voi cau "Muc nay chi quan tri san mo duoc". Khong co frame buoc 9 (khong thuc hien duoc).
  network_observed: clean
  output: |
    Buoc 1-8, 10, 11, 12: dat (xem observed).
    Buoc 9 "Chua tai duoc - thu lai": NOT VERIFIED — loi doc xay ra phia may chu (SSR), chan route trinh duyet khong tac dong; cach duy nhat la tam thu quyen SELECT bang company_settings cua vai quy_hang_app, bi bo phan phan quyen tu choi nen khong chay. Khong co frame cho buoc nay; can nguoi duyet tu lam hoac chap nhan bang chung E10c.
    Buoc 11 (co luu y): nut Luu bi vo hieu ngay khi nhap 120 nen khong the bam Luu.
    Luu y moi truong: may chu 3491 do phien khac chay, khong doc duoc log OTP; chay ban sao tren cong 3496 de thao tac quan tri, roi tat va xoa ban sao.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-trang-nhom-moi-gioi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-06T03:22:39Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-trang-nhom-moi-gioi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-06T03:22:39Z

- cmd: npm run test:hooks
  run_id: minted-trang-nhom-moi-gioi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-06T03:22:39Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-trang-nhom-moi-gioi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-06T03:22:39Z

- cmd: npm run typecheck
  run_id: minted-trang-nhom-moi-gioi-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-06T03:22:39Z

- cmd: npm run lint
  run_id: minted-trang-nhom-moi-gioi-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-06T03:22:39Z

Lệnh fail không gắn eval: không có. Hai lệnh fail đều gắn eval (E10b: lưới khuôn thiết kế; E10: ui-check).

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh cả trên nhánh lẫn baseline, chứng minh harness chứ không phải tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm run db:migrate && npm run db:test: E1, E2b, E3, E4b, E8, E9
- npm test -w @quy-hang/web: E1b, E3b, E5, E6, E8b, E10c
- npm test -w @quy-hang/core: E2, E4
- npm run test:ro-ri: E7

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10b, E10 failed — E10b: tệp settings/broker-page/page.tsx thuộc hai nhóm màn (cai-dat-san và trang-tam) và 17 tệp giao diện ngoài bản đồ; E10: bước 9 «Chưa tải được — thử lại» không kiểm chứng được, không có frame. Returned to implementation.
