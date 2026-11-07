---
schema_version: 2
feature_slug: va-dong-duong-gui-ma-song-song
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a985e8b6fb59ec1c621efe24ad035ebbb492fb9f
human_signoff:
---

# Evidence Report: va-dong-duong-gui-ma-song-song

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS |
| E3 | AC-3 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-dong-duong-gui-ma-song-song-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs
  verified_at: 2026-11-07T10:07:44Z
  output: |
    {"ca":"song-song","ok":true,"loi":[]}

- eval: E2
  run_id: minted-va-dong-duong-gui-ma-song-song-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs
  verified_at: 2026-11-07T10:07:44Z
  output: |
    {"ca":"dang-ky-tao","ok":true,"loi":[]}

- eval: E3
  run_id: minted-va-dong-duong-gui-ma-song-song-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs
  verified_at: 2026-11-07T10:07:44Z
  output: |
    {"ca":"that","ok":true,"loi":[]}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-07T10:07:44Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T10:07:44Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T10:07:44Z

- cmd: npm run test:hooks
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T10:07:44Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T10:07:44Z

- cmd: npm run typecheck
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-07T10:07:44Z

- cmd: npm run lint
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-07T10:07:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Ghi chú: không eval nào được đo baseline (ccả ba đều n-a), nên câu trên chỉ nói không có eval nào bị xác định là xanh trên cả hai phía.

Baseline khong do:
- node _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs --song-song: bo qua baseline: tep _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs co o cay dang kiem nhung chua co o merge-base 987c78c6726ac5e54f8dcfe0f51b259567adb02a — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs --dang-ky-tao: bo qua baseline: tep _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs co o cay dang kiem nhung chua co o merge-base 987c78c6726ac5e54f8dcfe0f51b259567adb02a — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs --that: bo qua baseline: tep _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs co o cay dang kiem nhung chua co o merge-base 987c78c6726ac5e54f8dcfe0f51b259567adb02a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: lượt chấm 1 có finding về E3 (ghim khẳng định phải nằm trong thân ca) — đã sửa ở commit c9454756.
Round 2: E1, E2, E3 đạt; các lệnh suite hồi quy đạt. Không có mục judgment nên không có panel nào cần người chốt.

### Re-pin lần 1 — 2026-11-07, do ghim lại sau gộp main
run_id: repin-20261107T101431Z-38473
sha: ef89d41ab67e1def0d4bbc90d310940227cf4566 · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng

### Re-pin lần 2 — 2026-11-07, do ghim lại sau gộp main (#186)
run_id: repin-20261107T102140Z-40568
sha: a985e8b6fb59ec1c621efe24ad035ebbb492fb9f · suites: 7 lệnh exit 0 · evals: 3/3 eval máy đạt kỳ vọng
