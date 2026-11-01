---
schema_version: 2
feature_slug: vet-chon-khoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 5882e2cf3bc08032ae9a8cf144626efc78d61cdc
human_signoff: Manh Phan 2026-11-01
---

# Evidence Report: vet-chon-khoi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | judgment | PASS |

## Evidence

- eval: E1
  run_id: minted-vet-chon-khoi-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.giao_dien
  verified_at: 2026-11-01T01:17:20Z
  output: |
    chuẩn giao diện: đạt

- eval: E2
  run_id: minted-vet-chon-khoi-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:17:20Z
  output: |
    ℹ duration_ms 32414.770584

- eval: E3
  run_id: minted-vet-chon-khoi-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:17:20Z
  output: |
    ℹ duration_ms 32414.770584

- eval: E4
  run_id: minted-vet-chon-khoi-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:17:20Z
  output: |
    ℹ duration_ms 32414.770584

- eval: E5
  run_id: minted-vet-chon-khoi-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:17:20Z
  output: |
    ℹ duration_ms 32414.770584

- eval: E6
  run_id: minted-vet-chon-khoi-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:17:20Z
  output: |
    ℹ duration_ms 32414.770584

- eval: E7
  run_id: minted-vet-chon-khoi-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:17:20Z
  output: |
    ℹ duration_ms 32414.770584

- eval: E8
  judged_by: judge panel (domain-correctness, operational-feasibility, spec-alignment)
  verdict: PASS
  rationale: Cả ba góc nhìn thấy đủ bốn ý trong vo-va-ia.md §3 và mục «Vết chọn khối» của SKILL.md. Đề xuất panel là PASS.
  judges:
    - domain-correctness: PASS — Cả bốn ý đều có trong hai tệp. (1) vo-va-ia.md §3 đòi dòng «Chỗ hở» đủ năm ô gồm Đã tra trên ReUI, Vì sao không đứng, Hạn xem lại (ngày YYYY-MM-DD hoặc «khi …»). (2) §3 nói rơi bậc xuống ghép hay tự viết trong một vòng là một dòng decisions.jsonl của hồ sơ. (3) và (4) Skill mục «Vết chọn khối» nêu bậc 2 tra bảng «Khối đã chuyển thể» của catalog.md, dòng đủ chín ô, chú thích «chuyển thể … <khối>», dòng «Chỗ hở» đủ năm ô, tất cả trong cùng PR.
    - operational-feasibility: PASS — Cả bốn ý đều có trong hai tệp. Ý (1) và (2) nằm ở vo-va-ia.md §3: dòng «Chỗ hở» ghi đã tra gì trên ReUI, vì sao không đứng, hạn xem lại (ngày YYYY-MM-DD hoặc «khi …»), và rơi bậc xuống ghép hay tự viết trong một vòng là một dòng decisions.jsonl. Ý (3) và (4) nằm ở SKILL.md mục «Vết chọn khối»: bậc 2 tra bảng «Khối đã chuyển thể» của catalog.md, khối mới thêm dòng đủ chín ô và tệp mang chú thích «chuyển thể … <khối>», ghép hay tự viết thêm dòng «Chỗ hở» đủ năm ô, tất cả trong cùng PR.
    - spec-alignment: PASS — vo-va-ia.md §3 nêu ba ô (đã tra gì trên ReUI, vì sao không đứng, hạn xem lại là ngày YYYY-MM-DD hay «khi …») và nói rơi bậc xuống ghép hay tự viết trong một vòng là một dòng decisions.jsonl của hồ sơ. SKILL.md nêu đủ ba ý còn lại: bậc 2 tra bảng «Khối đã chuyển thể» của catalog.md; chuyển thể khối mới thì thêm dòng chín ô và tệp mang chú thích «chuyển thể … <khối>»; ghép hay tự viết thì thêm dòng «Chỗ hở» năm ô, tất cả trong cùng PR.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-vet-chon-khoi-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-01T01:17:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-vet-chon-khoi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-01T01:17:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-vet-chon-khoi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-01T01:17:20Z

- cmd: npm run test:hooks
  run_id: minted-vet-chon-khoi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-01T01:17:20Z

- cmd: npm run typecheck
  run_id: minted-vet-chon-khoi-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-01T01:17:20Z

- cmd: npm run lint
  run_id: minted-vet-chon-khoi-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-01T01:17:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline; chứng minh harness hơn là feature, cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- `node packages/ui-lint/kiem-chuan.mjs` — E1
- `npm test -w @quy-hang/ui-lint` — E2, E3, E4, E5, E6, E7

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval máy chạy một lần, deterministic).

## Iterations

Round 1: lịch sử vòng 1 nằm trong run-log.jsonl của hồ sơ.
Round 2: E1 đến E7 đạt, E8 do panel đề xuất PASS; không còn eval trượt.

### Re-pin lần 1 — 2026-11-01, do hoá cũ do gộp main (hàng 10) sau lượt chấm
run_id: repin-20261101T021412Z-46649
sha: d728bdb84bd8b3b19f2a96261e545eafe87c25fd · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E8 · AC không có chốt máy: AC-8

### Re-pin lần 2 — 2026-11-01, do hoá cũ do gộp main; vet-chon-khoi chạm do thêm kết quả tra ReUI của hàng 18
run_id: repin-20261101T101747Z-67853
sha: 5882e2cf3bc08032ae9a8cf144626efc78d61cdc · suites: 7 lệnh exit 0 · evals: 7/7 eval máy đạt kỳ vọng · ngoài làn máy: E8 · diff chạm vật đo ngoài làn máy: E8 — chưa chứng lại, đi vòng S4 delta · AC không có chốt máy: AC-8
