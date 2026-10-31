---
schema_version: 2
feature_slug: o-nhan-lead
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 77cbb7c362fd0c2b896dc0eec6ee7eb70cac7bea
human_signoff:
---

# Evidence Report: o-nhan-lead

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-o-nhan-lead-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-o-nhan-lead-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-o-nhan-lead-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-o-nhan-lead-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-o-nhan-lead-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-o-nhan-lead-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-o-nhan-lead-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-o-nhan-lead-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-o-nhan-lead-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-o-nhan-lead-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-10-31T15:10:18Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-o-nhan-lead-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-10-31T15:23:09Z
  output: |
    design-floor-s4 chay xong, khong bao ma mau tho tren tep giao dien vong cham.

- eval: E10
  run_id: minted-o-nhan-lead-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T15:23:09Z
  screenshot: evidence/E10-step2.png
  observed: |
    Da mo bang Read cac frame: E10-trong.png: man «O nhan lead» 1440x900, 5 nhan So chu nha / Can hoac toa (+ chon Toa) / Nhu cau (Ban, Cho thue, Ca hai) / Gia (+ Bao phi, Khong bao phi ben duoi o Gia) / Thoi gian muon ra hang (Ngay, Trong 1 thang, 1-3 thang, Chua dinh), nut den «Gui lead», chua co Alert. E10-thieu.png: 5 dong loi do duoi tung o (so chu, can/toa, nhu cau, gia, thoi gian), khong Alert ket qua. E10-step4b.png: o Gia 3.200.000.000, dong «Hieu la: 3,2 ty, chua bao phi» khi chon Khong bao phi (step4a: «da bao phi»). E10-step5b.png: ma Z-99.99, dong «Ma can chua co trong danh muc — chon toa», o Toa hien «Toa A». E10-dang-gui.png: toan form mo xam, nut xam «Dang kiem trung…» (disabled). E10-khong-trung.png: 5 o rong, o So chu nha co vien tieu diem, Alert «Khong trung — lead cho chia theo luat cua san», khong co nut Bo lead. E10-co-dau-chu.png: Alert «Chu nha da co dau chu [Mau] Dau chu 2 — lead da ve [Mau] Dau chu 2», khong nut. E10-can-trung.png: Alert «Can A-02.06 da co hang mo cua [Mau] Dau chu 1 — lead thanh tin bo sung cho [Mau] Dau chu 1» kem nut «Bo lead nay». E10-step9b-hoi-lai.png: hop thoai «Bo lead nay?» nut Giu lai / Bo lead. E10-da-bo.png: Alert «Da bo lead nay — co ghi lai», khong nut Bo lead nay. E10-loi.png: Alert do «Chua gui duoc — kiem mang roi gui lai / Chu da go van con trong cac o.», nam o con nguyen (0900 000 087, B-07.05, Toa B, 3.200.000.000, Ban, Bao phi, Trong 1 thang ghi nhan). Khong frame nao lo so chu nha. Tat ca khop Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T15:23:09Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-31T15:23:09Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T15:23:09Z

- cmd: npm run test:hooks
  run_id: minted-o-nhan-lead-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T15:23:09Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-o-nhan-lead-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T15:23:09Z

- cmd: npm run typecheck
  run_id: minted-o-nhan-lead-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T15:23:09Z

- cmd: npm run lint
  run_id: minted-o-nhan-lead-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T15:23:09Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh trên cả bản nhánh lẫn bản gốc diffBase — chứng minh bộ dựng chứ chưa chứng minh tính năng; cần viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- `npm test -w @quy-hang/core` — E1, E2, E7
- `npm run db:migrate && npm run db:test` — E3, E4, E5, E6, E7b, E8, E9
- `design-floor-s4` (config:executors.script.design_floor) — E11

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 failed — sau khi gửi lead thành công, tiêu điểm không về ô số chủ (activeElement là thân trang) ở cả gửi chậm, gửi nhanh và ca chủ trùng; suite ui-lint cũng có một ca đỏ chưa gắn eval. Returned to implementation.
Round 2: mọi eval xanh — E10 chạy lại, tiêu điểm về ô Số chủ nhà sau gửi thành công, mạng sạch; E11 và các lệnh suite chạy lại xanh (cả ui-lint); E1–E9 và E7b mang từ round 1 vì delta không chạm paths của eval.

