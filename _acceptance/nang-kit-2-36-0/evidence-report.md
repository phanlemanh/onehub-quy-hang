---
schema_version: 2
feature_slug: nang-kit-2-36-0
verdict: PENDING-JUDGMENT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 39dd1267fdc66a468cffff29c8c16302a4c478e0
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
| E8 | AC-8 | script | PASS (mang từ round 1) |
| E8b | AC-8 | script | PASS |
| E8c | AC-8 | script | PASS |
| E8d | AC-8 | script | PASS |
| E9 | AC-9 | judgment | PASS (hội đồng đề xuất, chờ người chốt) |

## Evidence

- eval: E1
  run_id: minted-nang-kit-2-36-0-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    ℹ duration_ms 12155.523625

- eval: E2
  run_id: minted-nang-kit-2-36-0-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    ℹ duration_ms 12155.523625

- eval: E3
  run_id: minted-nang-kit-2-36-0-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    ℹ duration_ms 12155.523625

- eval: E4
  run_id: minted-nang-kit-2-36-0-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    ℹ duration_ms 12155.523625

- eval: E5
  run_id: minted-nang-kit-2-36-0-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    ℹ duration_ms 12155.523625

- eval: E6
  run_id: minted-nang-kit-2-36-0-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    ℹ duration_ms 12155.523625

- eval: E7
  run_id: minted-nang-kit-2-36-0-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"
    ℹ duration_ms 12155.523625

- eval: E1b
  run_id: minted-nang-kit-2-36-0-E1b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.product_map_kit
  verified_at: 2026-10-31T02:43:49Z
  output: |
    LO-TRINH.html khớp tệp ý định và hồ sơ.

- eval: E8
  run_id: minted-nang-kit-2-36-0-E8-r1
  exit_code: 0
  verifier: config:executors.script.nang_kit
  verified_at: 2026-10-31T01:38:05Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8b
  run_id: minted-nang-kit-2-36-0-E8b-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.hooks
  verified_at: 2026-10-31T02:43:49Z
  output: |
    TỔNG: ĐẠT

- eval: E8c
  run_id: minted-nang-kit-2-36-0-E8c-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-10-31T02:43:49Z
  output: |
    chuẩn giao diện: đạt

- eval: E8d
  run_id: minted-nang-kit-2-36-0-E8d-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.typecheck
  verified_at: 2026-10-31T02:43:49Z
  output: |
    typecheck hoàn tất, không báo lỗi kiểu

- eval: E9
  judged_by: hội đồng judge (fresh context) — domain-correctness, operational-feasibility, spec-alignment
  verdict: PASS
  verified_at: 2026-10-31T02:43:49Z
  judges:
    - domain-correctness: PASS — AGENTS.md (dòng 64–70) nói driver `tep-sinh` cho PRODUCT-MAP.md và LO-TRINH.html, bật khi `npm install` qua `prepare`, và job gate lấy kit theo `KIT_TAG` (đang `v2.36.0`). Cả ba khớp `prepare` trong package.json, hai dòng `merge=tep-sinh` trong .gitattributes và `KIT_TAG: v2.36.0` ở ci.yml dòng 83. Dòng §12 ngày 31/10 (dòng 316) ghi các nấc đã bật khớp khoá thật `gap_probe: required`, `lo_trinh.chan: true`, `ngoai_n_tu_dinh_tuyen: true` và `.gitattributes` trong `t3_paths`. Các nấc chưa bật khớp mục 3 «Không bật» của bản thiết kế, mỗi nấc kèm lý do ngắn.
    - operational-feasibility: PASS — AGENTS.md (dòng 68-70) và dòng 64-65 khớp `package.json` dòng 12, `.gitattributes` và `ci.yml` dòng 83. Dòng §12 ngày 31/10 (tham-chieu.md dòng 316) khớp các khoá `gap_probe: required`, `lo_trinh.chan: true`, `ngoai_n_tu_dinh_tuyen: true` trong config.yaml, và bốn nấc chưa bật kèm lý do khớp mục 3 «Không bật» của bản thiết kế. Bản thiết kế còn liệt kê vài nấc khác (như `capture.ui` và các khoá tinh chỉnh làn ghim lại) mà dòng §12 không nhắc; câu hỏi không đòi liệt kê đủ nên không coi là lệch.
    - spec-alignment: PASS — AGENTS.md (dòng 64-70) nói driver `tep-sinh` bật ở mỗi bản clone qua `npm install` (script `prepare`) và job gate lấy kit theo `KIT_TAG` (đang `v2.36.0`); khớp `package.json`, `.gitattributes` và `ci.yml`. Dòng §12 ngày 31/10 ghi kit 2.36.0, gộp không dừng ở tệp sinh, phản biện bắt buộc, chặn việc ngoài lộ trình, máy tự định tuyến mục ngoài hợp đồng, rồi bốn nấc chưa bật kèm lý do ngắn; khớp `config.yaml` và mục «Không bật» ở mục 3 của bản thiết kế.
  human_override:  # chi nguoi ghi

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T02:43:49Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-31T02:43:49Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T02:43:49Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nang-kit-2-36-0-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T02:43:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline — chứng minh bộ đo chạy được, chưa chứng minh tính năng; giữ như lưới hồi quy có chủ ý hoặc viết lại để khẳng định hành vi mới):

- `node --test "_acceptance/nang-kit-2-36-0/thu/*.test.mjs"` — E1, E2, E3, E4, E5, E6, E7
- `R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/product-map.mjs" --root . --check` — E1b
- `npm run test:hooks` — E8b
- `npm run lint` — E8c
- `npm run typecheck` — E8d

## Variance

none — every multi-run eval is uniform (mọi eval chạy một lần, không có phương sai)

## Iterations

Round 1: mọi eval máy xanh; chờ người ở E9 (judgment) và 6 mục ngoài hợp đồng; verdict PENDING-JUDGMENT.
Round 2: mọi eval máy xanh trên commit 39dd1267fdc66a468cffff29c8c16302a4c478e0 (E8 mang từ round 1, delta không chạm paths của nó); E9 hội đồng đề xuất PASS, chờ người chốt; thêm 1 mục ngoài hợp đồng mới (xem review-findings.md). Ghi chú: giờ của verified_at round 2 không có trong dữ liệu đầu vào nên chỉ chính xác đến ngày (giờ đặt 00:00:00Z).
