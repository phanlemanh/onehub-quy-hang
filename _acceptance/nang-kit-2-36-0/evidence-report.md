---
schema_version: 2
feature_slug: nang-kit-2-36-0
verdict: PENDING-JUDGMENT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9979a9bccd1f237a30d54acf0458b88f2f57a72f
human_signoff:
---

# Evidence Report: nang-kit-2-36-0

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E1b | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | script | PASS |
| E7 | AC-7 | script | PASS |
| E8 | AC-8 | script | PASS |
| E8b | AC-8 | script | PASS |
| E8c | AC-8 | script | PASS |
| E8d | AC-8 | script | PASS |
| E9 | AC-9 | judgment | PASS đề xuất, chờ người chốt |

## Evidence

- eval: E1
  run_id: minted-nang-kit-2-36-0-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E2
  run_id: minted-nang-kit-2-36-0-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E3
  run_id: minted-nang-kit-2-36-0-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E4
  run_id: minted-nang-kit-2-36-0-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E5
  run_id: minted-nang-kit-2-36-0-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E6
  run_id: minted-nang-kit-2-36-0-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E7
  run_id: minted-nang-kit-2-36-0-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E8
  run_id: minted-nang-kit-2-36-0-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    duration_ms 12267.808

- eval: E1b
  run_id: minted-nang-kit-2-36-0-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.product_map_kit
  verified_at: 2026-10-31T01:38:05Z
  output: |
    LO-TRINH.html khớp tệp ý định và hồ sơ.

- eval: E8b
  run_id: minted-nang-kit-2-36-0-E8b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.hooks
  verified_at: 2026-10-31T01:38:05Z
  output: |
    TỔNG: ĐẠT

- eval: E8c
  run_id: minted-nang-kit-2-36-0-E8c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-10-31T01:38:05Z
  output: |
    chuẩn giao diện: đạt

- eval: E8d
  run_id: minted-nang-kit-2-36-0-E8d-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-10-31T01:38:05Z
  output: |
    (không có dòng lỗi kiểu)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T01:38:05Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T01:38:05Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T01:38:05Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T01:38:05Z

### Phán đoán (judgment)

- eval: E9
  judged_by: hội đồng ba góc nhìn (fresh context) — đề xuất panel, chưa có người chốt
  proposal: PASS
  votes:
    - domain-correctness: PASS — AGENTS.md ghi đúng driver `tep-sinh` cho hai tệp sinh, bật qua `prepare`, và job gate lấy kit theo KIT_TAG (đang v2.36.0). Mỗi ý khớp tệp thật: .gitattributes có đúng hai dòng `merge=tep-sinh`, `prepare` có `git config merge.tep-sinh.driver true`, ci.yml dòng 83 có `KIT_TAG: v2.36.0`. Dòng 316 của tham-chieu §12 ngày 31/10 nêu đủ các nấc đã bật và bốn nấc chưa bật kèm lý do ngắn. Các nấc đó khớp khoá thật trong config.yaml (`gap_probe: required`, `lo_trinh.chan: true`, `ngoai_n_tu_dinh_tuyen: true`, hai đường dẫn T3 mới) và mục 3 của bản thiết kế.
    - operational-feasibility: PASS — AGENTS.md «Rào của kho» nêu driver `tep-sinh` cho PRODUCT-MAP.md và LO-TRINH.html, bật khi `npm install` qua `prepare`, và `KIT_TAG` đang `v2.36.0`. Cả ba khớp thực tế: `.gitattributes` có đúng hai dòng `merge=tep-sinh`, `prepare` có `git config merge.tep-sinh.driver true`, ci.yml dòng 83 là `KIT_TAG: v2.36.0`. Dòng §12 ngày 31/10 (tham-chieu.md dòng 316) khớp config.yaml và mục 3 của bản thiết kế. Bốn nấc chưa bật cùng lý do ngắn cũng khớp mục «Không bật», và config.yaml không có khoá nào cho chúng.
    - spec-alignment: PASS — Mục «Rào của kho» trong AGENTS.md khớp tệp thật: driver `tep-sinh` gắn cho PRODUCT-MAP.md và LO-TRINH.html, `.gitattributes` có đúng hai dòng đó; `prepare` có `git config merge.tep-sinh.driver true`; `KIT_TAG` là `v2.36.0` ở ci.yml dòng 83. Dòng 31/10 ở §12 của tham-chieu.md ghi kit 2.36.0, gộp không dừng ở tệp sinh, `gap_probe: required`, `lo_trinh.chan: true`, `ngoai_n_tu_dinh_tuyen: true` và cấu hình nghiệm thu thành T3, khớp config.yaml và mục 3 của bản thiết kế; nêu bốn nấc chưa bật kèm lý do ngắn, khớp phần «Không bật». Không nhắc `capture.ui` hay khoá tinh chỉnh làn ghim lại, nhưng đề bài không đòi liệt kê đủ.
  human_override:  # chi nguoi ghi

## Known limits

## Ngoài hợp đồng

## Analyst

Không đo được phân biệt: các lệnh dưới đây xanh trên cả HEAD lẫn nhánh gốc (baseline green) — chúng chứng minh bộ đo chạy được, chưa chứng minh tính năng. Cần viết lại để khẳng định hành vi mới, hoặc xác nhận đó là lưới hồi quy có chủ ý.

- `node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"` — E1, E2, E3, E4, E5, E6, E7, E8
- `R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/product-map.mjs" --root . --check` — E1b
- `npm run test:hooks` — E8b
- `npm run lint` — E8c
- `npm run typecheck` — E8d

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval máy đều đạt; E9 (phán đoán) chờ người chốt ở Cổng 2. Verdict PENDING-JUDGMENT.
