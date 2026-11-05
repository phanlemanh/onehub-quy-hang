---
schema_version: 2
feature_slug: bang-quyen-theo-vai
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 100d2b084315fc02cce291eecbaf27da8d44990c
human_signoff:
---

# Evidence Report: bang-quyen-theo-vai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8a | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |
| E11 | AC-6 | script | PASS |
| E6b | AC-6 | script | PASS |
| E9b | AC-9 | test | PASS |
| E9c | AC-9 | test | PASS |
| E2b | AC-2 | judgment | PASS (đề xuất của hội đồng, chờ người chốt) |
| E12 | AC-6 | script | PASS |
| E12b | AC-2 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-bang-quyen-theo-vai-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 932.046125

- eval: E10
  run_id: minted-bang-quyen-theo-vai-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 932.046125

- eval: E2
  run_id: minted-bang-quyen-theo-vai-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E3
  run_id: minted-bang-quyen-theo-vai-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E4
  run_id: minted-bang-quyen-theo-vai-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E5
  run_id: minted-bang-quyen-theo-vai-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E7
  run_id: minted-bang-quyen-theo-vai-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E8a
  run_id: minted-bang-quyen-theo-vai-E8a-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E8b
  run_id: minted-bang-quyen-theo-vai-E8b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E9
  run_id: minted-bang-quyen-theo-vai-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E9c
  run_id: minted-bang-quyen-theo-vai-E9c-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ duration_ms 120364.668917

- eval: E6
  run_id: minted-bang-quyen-theo-vai-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 3496.58325

- eval: E11
  run_id: minted-bang-quyen-theo-vai-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.design_floor
  verified_at: 2026-11-05T16:45:50Z
  output: |
    design-floor-s4: không in vi phạm nào

- eval: E6b
  run_id: minted-bang-quyen-theo-vai-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run typecheck: kiểm kiểu xanh

- eval: E9b
  run_id: minted-bang-quyen-theo-vai-E9b-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-11-05T16:45:50Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 22370.305042

- eval: E12
  run_id: minted-bang-quyen-theo-vai-E12-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T16:45:50Z
  output: |
    7 tệp giao diện ngoài bản đồ

- eval: E12b
  run_id: minted-bang-quyen-theo-vai-E12b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T16:45:50Z
  output: |
    7 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-bang-quyen-theo-vai-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-05T16:45:50Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bang-quyen-theo-vai-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-05T16:45:50Z

- cmd: npm run test:hooks
  run_id: minted-bang-quyen-theo-vai-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-05T16:45:50Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bang-quyen-theo-vai-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-05T16:45:50Z

- cmd: npm run lint
  run_id: minted-bang-quyen-theo-vai-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-05T16:45:50Z

### Phán đoán (judgment)

Panel đề xuất cho E2b: ba lăng kính (domain-correctness, operational-feasibility, spec-alignment). Hội đồng chỉ đề xuất, người chốt ở Cổng 2.

- eval: E2b
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Ba lăng kính cùng thấy page.tsx gọi lamViecVoiHang từ @quy-hang/core/access và đưa về /today trước khi dựng KhungBangHang, phần còn lại của trang không đổi. Việc hàm trả đúng cho ba vai nằm ở lõi, ngoài phạm vi tệp.
  votes:
    - domain-correctness: PASS — quyết định lấy từ hàm lõi, tệp không so tên vai tại chỗ; khi hàm trả đúng, bảng đi tiếp với cùng props như trước.
    - operational-feasibility: PASS — nhánh đưa về /today chạy trước phần dựng bảng; khi hàm trả đúng, khung, BangCoHoSo và BangTheDienThoai dựng như cũ.
    - spec-alignment: PASS — dòng 14 của inventory/page.tsx gọi lamViecVoiHang và đưa về /today, chạy trước return dựng KhungBangHang.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline), chứng minh harness chứ chưa chứng minh feature; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:

- npm test -w @quy-hang/core: E1, E10
- npm test -w @quy-hang/web: E6
- design-floor-s4.mjs --root .: E11
- npm run typecheck: E6b
- design-floor-khuon.mjs --kiem --root .: E12, E12b

Baseline không đo: none.

## Variance

none — mọi eval chạy một lần, xác định, đều đồng nhất.

## Iterations

Round 1: mọi eval máy xanh; E2b có đề xuất PASS của hội đồng chờ người chốt; có mục ngoài hợp đồng ghi ở review-findings.md. Verdict PENDING-JUDGMENT, chờ Cổng 2.
