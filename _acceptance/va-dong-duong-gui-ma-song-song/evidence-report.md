---
schema_version: 2
feature_slug: va-dong-duong-gui-ma-song-song
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c80530f0e534cf79816f1d6e201def3a91c7431e
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
  run_id: minted-va-dong-duong-gui-ma-song-song-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs
  verified_at: 2026-11-07T10:03:20Z
  output: |
    {"ca":"song-song","ok":true,"loi":[]}

- eval: E2
  run_id: minted-va-dong-duong-gui-ma-song-song-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs
  verified_at: 2026-11-07T10:03:20Z
  output: |
    {"ca":"dang-ky-tao","ok":true,"loi":[]}

- eval: E3
  run_id: minted-va-dong-duong-gui-ma-song-song-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs
  verified_at: 2026-11-07T10:03:20Z
  output: |
    {"ca":"that","ok":true,"loi":[]}

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-11-07T10:03:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-07T10:03:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-07T10:03:20Z

- cmd: npm run test:hooks
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-07T10:03:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-07T10:03:20Z

- cmd: npm run typecheck
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-07T10:03:20Z

- cmd: npm run lint
  run_id: minted-va-dong-duong-gui-ma-song-song-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-07T10:03:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do

- node _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs --song-song: bo qua baseline: tep _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs co o cay dang kiem nhung chua co o merge-base 987c78c6726ac5e54f8dcfe0f51b259567adb02a — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs --dang-ky-tao: bo qua baseline: tep _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs co o cay dang kiem nhung chua co o merge-base 987c78c6726ac5e54f8dcfe0f51b259567adb02a — eval moi, chay tren code cu khong phan biet gi
- node _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs --that: bo qua baseline: tep _acceptance/va-dong-duong-gui-ma-song-song/thu/kiem-song-song.mjs co o cay dang kiem nhung chua co o merge-base 987c78c6726ac5e54f8dcfe0f51b259567adb02a — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E2, E3 passed; suite commands all passed. No failed evals.
