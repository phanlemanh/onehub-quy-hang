---
schema_version: 2
feature_slug: vet-chon-khoi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 44f7ad0b72766210d09957b60bc3a297ad87c9b7
human_signoff:
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
  run_id: minted-vet-chon-khoi-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.giao_dien
  verified_at: 2026-11-01T01:11:38Z
  output: |
    chuẩn giao diện: đạt

- eval: E2
  run_id: minted-vet-chon-khoi-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:11:38Z
  output: |
    ℹ duration_ms 10040.582458

- eval: E3
  run_id: minted-vet-chon-khoi-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:11:38Z
  output: |
    ℹ duration_ms 10040.582458

- eval: E4
  run_id: minted-vet-chon-khoi-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:11:38Z
  output: |
    ℹ duration_ms 10040.582458

- eval: E5
  run_id: minted-vet-chon-khoi-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:11:38Z
  output: |
    ℹ duration_ms 10040.582458

- eval: E6
  run_id: minted-vet-chon-khoi-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:11:38Z
  output: |
    ℹ duration_ms 10040.582458

- eval: E7
  run_id: minted-vet-chon-khoi-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T01:11:38Z
  output: |
    ℹ duration_ms 10040.582458

### Judgment

- eval: E8
  judged_by: judge-subagent (fresh context)
  verdict: PASS
  rationale: Panel đề xuất PASS, ba lens cùng PASS, đủ bốn ý.
  votes:
    - domain-correctness: PASS — Đủ bốn ý. (1) §3 của vo-va-ia.md đòi ô «Đã tra trên ReUI», «Vì sao không đứng» và «Hạn xem lại», hạn mở đầu bằng ngày YYYY-MM-DD hoặc «khi ». (2) §3 nói rơi bậc xuống ghép hay tự viết trong một vòng là một dòng `decisions.jsonl` của hồ sơ. (3) và (4) SKILL.md mục «Vết chọn khối» nói bậc 2 tra bảng «Khối đã chuyển thể» của `catalog.md`, thêm dòng đủ chín ô, chú thích «chuyển thể … <khối>», và dòng «Chỗ hở» đủ năm ô, tất cả trong cùng PR.
    - operational-feasibility: PASS — Đủ bốn ý. Ý 1 và 2: vo-va-ia.md §3 nêu ba ô «Đã tra trên ReUI», «Vì sao không đứng», «Hạn xem lại», hạn mở đầu bằng ngày YYYY-MM-DD hay «khi », và nói rơi bậc xuống ghép hay tự viết trong một vòng là một dòng decisions.jsonl của hồ sơ. Ý 3 và 4: SKILL.md mục «Vết chọn khối» nêu bậc 2 tra bảng «Khối đã chuyển thể» của catalog.md, dòng chín ô và chú thích «chuyển thể … <khối>» trong cùng PR, và dòng «Chỗ hở» năm ô cho bậc 6–7 trong cùng PR.
    - spec-alignment: PASS — Đủ bốn ý. Ý 1 và ý 2 nằm ở §3 của vo-va-ia.md: năm ô gồm đã tra gì trên ReUI, vì sao không đứng, hạn xem lại bắt đầu bằng ngày `YYYY-MM-DD` hoặc «khi », và rơi bậc là một dòng `decisions.jsonl`. Ý 3 và ý 4 nằm ở mục «Vết chọn khối» của SKILL.md: bậc 2 tra bảng «Khối đã chuyển thể» của catalog.md, dòng chín ô và chú thích «chuyển thể … <khối>», dòng «Chỗ hở» năm ô, tất cả trong cùng PR.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-vet-chon-khoi-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-01T01:11:38Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-vet-chon-khoi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T01:11:38Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-vet-chon-khoi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T01:11:38Z

- cmd: npm run test:hooks
  run_id: minted-vet-chon-khoi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T01:11:38Z

- cmd: npm run typecheck
  run_id: minted-vet-chon-khoi-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T01:11:38Z

- cmd: npm run lint
  run_id: minted-vet-chon-khoi-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T01:11:38Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline):
- `node packages/ui-lint/kiem-chuan.mjs` — E1
- `npm test -w @quy-hang/ui-lint` — E2, E3, E4, E5, E6, E7

Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đều đạt, E8 do panel chấm PASS. Chuyển sang Cổng 2.
