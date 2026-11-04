---
schema_version: 2
feature_slug: luong-gui
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b7e32db9c67b0713dd12d3eb1c553f0dbcc0dfe8
human_signoff: Manh Phan 2026-11-04
---

# Evidence Report: luong-gui

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-4 | ui-check | PASS |
| E12 | AC-10 | script | PASS (đạt có giới hạn) |
| E13 | AC-10 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-luong-gui-E1-r1
  exit_code: 0
  carried_from_round: 1
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-luong-gui-E2-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-luong-gui-E3-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E3b
  run_id: minted-luong-gui-E3b-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-luong-gui-E4-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-luong-gui-E5-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-luong-gui-E6-r1
  exit_code: 0
  carried_from_round: 1
  verifier: config:executors.test.core
  verified_at: 2026-11-04T01:52:46Z
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-luong-gui-E7-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E7b
  run_id: minted-luong-gui-E7b-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-luong-gui-E8-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-luong-gui-E9-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E10
  run_id: minted-luong-gui-E10-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T02:03:52Z
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-luong-gui-E11-r2
  exit_code: 0
  carried_from_round: 2
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T02:03:52Z
  screenshot: evidence/E11-step1.png
  observed: |
    Da mo bang Read cac frame step1,2,3,4,5,6,7,8,9 (step1-9 deu doc). step1 (375): tieu de «2 căn đã chọn», B-13.02 co tick, thanh duoi «2 căn · Xem trước · Gửi». step2: ngan toan man «Xem trước — khách riêng thấy», «Khách riêng không thấy mã căn.», hai the chi «Toà B», nut «Chọn người nhận» xam. step3: giong step2 (khach rieng, khong co ma can). step4: «Xem trước — nhóm môi giới thấy», «Nhóm môi giới thấy mã căn.», «Toà B · B-13.02» va «Toà B · B-15.01», nut «Chép tin». step5: Khach rieng, radio «[Mẫu] Khách chấm / Mua» duoc chon, footer «Khách riêng · [Mẫu] Khách chấm». step6: textarea «Tin soạn sẵn» bat dau «XIN Chào anh/chị [Mẫu] Khách chấm,». step7: A-04.06 co nhan vang «Gọi xác nhận trước», «1 căn cần gọi xác nhận», dong «B-10.01 — Đang giao dịch — không gửi mới được, đã bỏ khỏi lần gửi». step8 (1280): Nhom moi gioi, tin «Gửi các anh chị trong nhóm…», nut duoi ghi «Chép…» bi nut dev-tools che; chu «Đã chép» xac nhan qua DOM, khong thay ro trong anh. step9 (1280, offline): banner «Đang xem bản đã tải — mất mạng», nut duoi xam «Gửi cần mạ…» (cat boi nut dev-tools), DOM xac nhan «Gửi cần mạng» disabled. Tat ca khop Expected.
  network_observed: clean
  output: |
    carry-forward tu round 2 — delta khong cham paths cua eval

- eval: E12
  run_id: minted-luong-gui-E12-r3
  exit_code: 1
  baseline: red
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T04:57:20Z
  output: |
    10 tệp giao diện ngoài bản đồ
    Mã thoát 1 là kết quả đã khai trước của eval này (đạt có giới hạn, kit#480), đi kèm E13 xanh.

- eval: E13
  run_id: minted-luong-gui-E13-r3
  exit_code: 0
  baseline: n-a
  verifier: _acceptance/luong-gui/kiem-khuon-e12.mjs
  verified_at: 2026-11-04T04:57:20Z
  output: |
    E13: chỉ có dòng báo oan đã khai: lệch: apps/web/src/app/(app)/shares/new/page.tsx · thuộc hai nhóm màn: gui, trang-tam

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-04T04:57:20Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-04T04:57:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-04T04:57:20Z

- cmd: npm run test:hooks
  run_id: minted-luong-gui-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-04T04:57:20Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-04T04:57:20Z

- cmd: npm run typecheck
  run_id: minted-luong-gui-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-04T04:57:20Z

- cmd: npm run lint
  run_id: minted-luong-gui-SUITE-lint-r3
  exit_code: 0
  verified_at: 2026-11-04T04:57:20Z

## Known limits

- E12 (AC-10) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: R="${CLAUDE_PLUGIN_ROOT:-$(node packages/ui-lint/tim-kit.mjs)}" && node "$R/scripts/design-floor-khuon.mjs" --kiem --root .

## Ngoài hợp đồng

## Analyst

none — moi eval feature deu red tren baseline (co phan biet)

Baseline khong do:
- node _acceptance/luong-gui/kiem-khuon-e12.mjs: bo qua baseline: tep _acceptance/luong-gui/kiem-khuon-e12.mjs co o cay dang kiem nhung chua co o merge-base a7779e3501da3149aeb5934b9b7042aca6f56fbe — eval moi, chay tren code cu khong phan biet gi

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1, E6 chạy lần đầu (đạt); phần còn lại của bộ eval chạy ở round 2.
Round 2: E2–E5, E7–E11 đạt; E12 đỏ do báo oan khuôn của kit 2.37.0 (kit#480).
Round 3: E12 đạt có giới hạn (chủ kho chốt 04/11) cùng E13 xanh; E1–E11 mang từ round trước, suite hồi quy xanh.
