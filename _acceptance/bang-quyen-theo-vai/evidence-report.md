---
schema_version: 2
feature_slug: bang-quyen-theo-vai
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 27c7b24957dd60ddca542fe32d0fd9de30d1fbd8
human_signoff:
---

# Evidence Report: bang-quyen-theo-vai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward round 1) |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS (carry-forward round 1) |
| E7 | AC-7 | test | PASS (carry-forward round 1) |
| E8a | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS (carry-forward round 1) |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS (carry-forward round 1) |
| E11 | AC-6 | script | PASS (carry-forward round 1) |
| E6b | AC-6 | script | PASS (carry-forward round 1) |
| E9b | AC-9 | test | PASS (carry-forward round 1) |
| E9c | AC-9 | test | PASS |
| E2b | AC-2 | judgment | PASS đề xuất của hội đồng, chờ người chốt (human_override trống) |
| E12 | AC-6 | script | PASS (carry-forward round 1) |
| E12b | AC-2 | script | PASS (carry-forward round 1) |

## Evidence

- eval: E2
  run_id: minted-bang-quyen-theo-vai-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:54:51Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 85458.633

- eval: E3
  run_id: minted-bang-quyen-theo-vai-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:54:51Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 85458.633

- eval: E4
  run_id: minted-bang-quyen-theo-vai-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:54:51Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 85458.633

- eval: E5
  run_id: minted-bang-quyen-theo-vai-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:54:51Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 85458.633

- eval: E8a
  run_id: minted-bang-quyen-theo-vai-E8a-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:54:51Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 85458.633

- eval: E9
  run_id: minted-bang-quyen-theo-vai-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:54:51Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 85458.633

- eval: E9c
  run_id: minted-bang-quyen-theo-vai-E9c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:54:51Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 85458.633

### Eval mang từ round 1 (carry-forward)

- eval: E1
  run_id: minted-bang-quyen-theo-vai-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-bang-quyen-theo-vai-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-bang-quyen-theo-vai-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-bang-quyen-theo-vai-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-bang-quyen-theo-vai-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-bang-quyen-theo-vai-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6b
  run_id: minted-bang-quyen-theo-vai-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9b
  run_id: minted-bang-quyen-theo-vai-E9b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web_db
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-bang-quyen-theo-vai-E12-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E12b
  run_id: minted-bang-quyen-theo-vai-E12b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T16:45:50Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

### Judgment

- eval: E2b
  judge_panel (đề xuất): domain-correctness, operational-feasibility, spec-alignment — mỗi góc nhìn đọc tệp trang Bảng hàng và đối chiếu nhánh chuyển hướng với điều hợp đồng đòi.
  proposal: PASS
  votes:
    - domain-correctness: PASS — trang gọi lamViecVoiHang từ @quy-hang/core/access và chuyển về /today ngay khi hàm trả sai, trước câu dựng KhungBangHang và BangCoHoSo; trang không so tên vai tại chỗ. Việc lõi trả đúng với ba vai thuộc eval khác.
    - operational-feasibility: PASS — dòng 14 gọi lamViecVoiHang và chuyển hướng /today khi hàm trả falsy, chạy trước câu dựng bảng; không so tên vai trong tệp. Người qua được kiểm tra đi tiếp tới bảng như cũ. Tính đúng của lõi nằm ngoài đầu vào.
    - spec-alignment: PASS — trang không so tên vai tại chỗ; chuyển hướng /today ở dòng 14 trước câu trả về dựng bảng; truthy thì đi tiếp như cũ. Chưa kiểm hàm lõi với ba vai vì ngoài đầu vào.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bang-quyen-theo-vai-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T16:54:51Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-quyen-theo-vai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T16:54:51Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-quyen-theo-vai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T16:54:51Z

- cmd: npm run test:hooks
  run_id: minted-bang-quyen-theo-vai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T16:54:51Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-quyen-theo-vai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T16:54:51Z

- cmd: npm run typecheck
  run_id: minted-bang-quyen-theo-vai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T16:54:51Z

- cmd: npm run lint
  run_id: minted-bang-quyen-theo-vai-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T16:54:51Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline round này không đo lại (evals.yaml không đổi từ lần baseline cuối, round 1); mọi field baseline ghi n-a. Các lệnh dưới đây là danh sách eval không-phân-biệt từ round 1, giữ để người xem, chưa viết lại hay xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/core — E1, E10
- npm test -w @quy-hang/web — E6
- design-floor-s4.mjs --root . — E11
- npm run typecheck — E6b
- design-floor-khuon.mjs --kiem --root . — E12, E12b

## Variance

none — mọi eval chạy một lần, xác định, kết quả đồng nhất

## Iterations

Round 1: bộ chạy đầu bị chặn vì E11 thiếu biến kit; đổi E11 sang khoá có lối dự phòng, chấm lại ra PENDING-JUDGMENT, mọi eval đạt, có mục ngoài hợp đồng.
Round 2: chạy lại nhóm eval bị delta chạm (E2, E3, E4, E5, E8a, E9, E9c) và các lệnh suite, tất cả đạt; E1, E6, E7, E8b, E10, E11, E6b, E9b, E12, E12b mang từ round 1; còn E2b chờ người chốt ở Gate 2.
