---
schema_version: 2
feature_slug: bat-rang-buoc-ban-ma
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: e104653ef548472fdb3705ffd99a2be6c2b02373
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: bat-rang-buoc-ban-ma

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | script | PASS |
| E5 | AC-4 | judgment | PASS (đề xuất của hội đồng, chờ người chốt ở Cổng 2) |
| E6 | AC-2 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-bat-rang-buoc-ban-ma-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:31:18Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 6623.352584

- eval: E2
  run_id: minted-bat-rang-buoc-ban-ma-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:31:18Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 6623.352584

- eval: E3
  run_id: minted-bat-rang-buoc-ban-ma-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:31:18Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 6623.352584

- eval: E6
  run_id: minted-bat-rang-buoc-ban-ma-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T00:31:18Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 6623.352584

- eval: E4
  run_id: minted-bat-rang-buoc-ban-ma-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.kiem_ci
  verified_at: 2026-11-01T00:31:18Z
  output: |
    lệnh: node _acceptance/moi-truong-that/thu/kiem-ci.mjs
    KẾT: ĐẠT

### Mục judgment

- eval: E5
  judged_by: judge-subagent (fresh context), hội đồng ba lăng kính
  verdict: PASS
  rationale: Đề xuất PASS; ba lăng kính cùng thấy ADR-0013, mục «Bật hẳn ràng buộc khi deploy», nêu đủ ba ý, và dòng 01/11 ở §12 của Tham chiếu (dòng 335) trỏ đúng tệp 013_bat_rang_buoc_ban_ma.sql.
  votes:
    - domain-correctness: PASS — Bảng sạch thì 013 tự bật khi deploy. Bảng còn số rõ thì 013 bỏ qua và phải chạy ma-hoa-lai.ts, lệnh này tự bật. Lời nhắc in ở đầu ra npm run db:migrate, tức log job deploy. Dòng 01/11 nằm trong §12, ngay trước «## 13», và trỏ tệp 013.
    - operational-feasibility: PASS — Mục «Bật hẳn ràng buộc khi deploy» của ADR-0013 nêu đủ ba ý đầu; lời nhắc in ở đầu ra npm run db:migrate, tức log job deploy; dòng 01/11 ở §12 (dòng 335) trỏ đúng tệp 013.
    - spec-alignment: PASS — ADR-0013 nêu đủ ba ý; Tham chiếu §12 có dòng 01/11 trỏ tới packages/db/migrations/013_bat_rang_buoc_ban_ma.sql và tới ADR-0013.
  human_override: Manh Phan 2026-11-01 — Đạt

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-bat-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T00:31:18Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-bat-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T00:31:18Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-bat-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T00:31:18Z

- cmd: npm run test:hooks
  run_id: minted-bat-rang-buoc-ban-ma-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T00:31:18Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-bat-rang-buoc-ban-ma-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-01T00:31:18Z

- cmd: npm run typecheck
  run_id: minted-bat-rang-buoc-ban-ma-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T00:31:18Z

- cmd: npm run lint
  run_id: minted-bat-rang-buoc-ban-ma-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T00:31:18Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên code mới lẫn baseline, chứng minh harness hơn là tính năng; nên viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm run db:migrate && npm run db:test — E1, E2, E3, E6
- node _acceptance/moi-truong-that/thu/kiem-ci.mjs — E4

Các lệnh suite xanh cả hai phía là regression-guard bình thường, không liệt kê.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chỉ chạy một lần, tất định).

## Iterations

Round 1: mọi eval máy xanh; E5 là mục judgment, hội đồng đề xuất PASS nhưng chưa có human_override nên verdict giữ PENDING-JUDGMENT chờ người chốt ở Cổng 2.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp main (hàng 25) sau chữ ký
run_id: repin-20261101T005107Z-45704
sha: 1c746689b504967738cbd009561b3f67797cc3ae · suites: 7 lệnh exit 0 · evals: 5/5 eval máy đạt kỳ vọng · ngoài làn máy: E5 · diff chạm vật đo ngoài làn máy: E5 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-4

### Re-pin lần 2 — 2026-11-07, do gộp main; E4 khai thay bởi kiem-nhanh-rang-buoc-ban-ma#AC-1
run_id: repin-20261107T080703Z-57082
sha: e104653ef548472fdb3705ffd99a2be6c2b02373 · suites: 7 lệnh exit 0 · evals: 4/4 eval máy đạt kỳ vọng · không chạy theo hồ sơ: E4 · thay bởi hồ sơ đã ký: E4→kiem-nhanh-rang-buoc-ban-ma#AC-1 · ngoài làn máy: E5 · diff chạm vật đo ngoài làn máy: E5 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-4
