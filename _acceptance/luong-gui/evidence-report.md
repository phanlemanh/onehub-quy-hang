---
schema_version: 2
feature_slug: luong-gui
verdict: REJECT
failed_evals: [E12]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 66efb3f11b5966e34e9e53df3e3660ef72b0cce2
human_signoff:
---

# Evidence Report: luong-gui

Round 2. Nội dung thay toàn bộ round cũ; lịch sử round nằm ở mục Iterations.

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS (carry-forward từ round 1) |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | script | PASS |
| E6 | AC-6 | test | PASS (carry-forward từ round 1) |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E11 | AC-4 | ui-check | PASS |
| E12 | AC-10 | script | FAIL |

## Evidence

- eval: E1
  run_id: minted-luong-gui-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T01:52:46Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-luong-gui-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 42625.577333

- eval: E3
  run_id: minted-luong-gui-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 1556.064917

- eval: E3b
  run_id: minted-luong-gui-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 42625.577333

- eval: E4
  run_id: minted-luong-gui-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 1556.064917

- eval: E5
  run_id: minted-luong-gui-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm run test:ro-ri
    ℹ duration_ms 425.984833

- eval: E6
  run_id: minted-luong-gui-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T01:52:46Z
  carried_from_round: 1
  output: |
    carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-luong-gui-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 1556.064917

- eval: E7b
  run_id: minted-luong-gui-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 42625.577333

- eval: E8
  run_id: minted-luong-gui-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 1556.064917

- eval: E9
  run_id: minted-luong-gui-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 1556.064917

- eval: E10
  run_id: minted-luong-gui-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: npm run lint
    chuẩn giao diện: đạt

- eval: E11
  run_id: minted-luong-gui-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T02:03:52Z
  screenshot: evidence/E11-step1.png
  observed: |
    Da mo bang Read cac frame step1,2,3,4,5,6,7,8,9 (step1-9 deu doc). step1 (375): tieu de «2 căn đã chọn», B-13.02 co tick, thanh duoi «2 căn · Xem trước · Gửi». step2: ngan toan man «Xem trước — khách riêng thấy», «Khách riêng không thấy mã căn.», hai the chi «Toà B», nut «Chọn người nhận» xam. step3: giong step2 (khach rieng, khong co ma can). step4: «Xem trước — nhóm môi giới thấy», «Nhóm môi giới thấy mã căn.», «Toà B · B-13.02» va «Toà B · B-15.01», nut «Chép tin». step5: Khach rieng, radio «[Mẫu] Khách chấm / Mua» duoc chon, footer «Khách riêng · [Mẫu] Khách chấm». step6: textarea «Tin soạn sẵn» bat dau «XIN Chào anh/chị [Mẫu] Khách chấm,». step7: A-04.06 co nhan vang «Gọi xác nhận trước», «1 căn cần gọi xác nhận», dong «B-10.01 — Đang giao dịch — không gửi mới được, đã bỏ khỏi lần gửi». step8 (1280): Nhom moi gioi, tin «Gửi các anh chị trong nhóm…», nut duoi ghi «Chép…» bi nut dev-tools che; chu «Đã chép» xac nhan qua DOM, khong thay ro trong anh. step9 (1280, offline): banner «Đang xem bản đã tải — mất mạng», nut duoi xam «Gửi cần mạ…» (cat boi nut dev-tools), DOM xac nhan «Gửi cần mạng» disabled. Tat ca khop Expected.
  network_observed: clean
  output: |
    10. Offline (setOffline + event offline): navigator.onLine=false, nut «Gửi cần mạng» disabled=true; banner «Đang xem bản đã tải — mất mạng». PASS
    Network: 67 dong trong E11-network.txt, 64 dong 200, khong co 4xx/5xx; console 0 error, 0 warning.

- eval: E12
  run_id: minted-luong-gui-E12-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T02:03:52Z
  output: |
    lệnh: node "$R/scripts/design-floor-khuon.mjs" --kiem --root .
    lệch: apps/web/src/app/(app)/shares/new/page.tsx · thuộc hai nhóm màn: gui, trang-tam
    10 tệp giao diện ngoài bản đồ
    Ghi chú: expected của E12 coi lệch chỉ vì tệp thuộc hai nhóm là báo oan (giới hạn «cắt trước» của kit 2.37.0); tuy nhiên bước chấm còn in "10 tệp giao diện ngoài bản đồ" và lệnh kết thúc không sạch, nên máy giữ eval này là không đạt. Tệp bị báo: apps/web/src/app/(app)/shares/new/page.tsx. Người quyết xem lại ở Cổng 2.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-04T02:03:52Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T02:03:52Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T02:03:52Z

- cmd: npm run test:hooks
  run_id: minted-luong-gui-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T02:03:52Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-luong-gui-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T02:03:52Z

- cmd: npm run typecheck
  run_id: minted-luong-gui-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T02:03:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Baseline khong do: toan bo eval round nay ghi n-a (evals.yaml khong doi tu lan baseline cuoi).

Eval khong-phan-biet (xanh ca hai phia) can viet lai de assert hanh vi moi, hoac xac nhan la regression-guard co chu y:
- npm test -w @quy-hang/web: E1, E3, E4, E7, E8, E9
- npm run test:ro-ri: E5
- npm test -w @quy-hang/core: E6
- npm run lint: E10

Lenh fail khong gan eval nao: khong co. Lenh fail duy nhat là bước chấm khuôn, gắn với E12.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: các eval E1 đến E11 qua; E1 và E6 được giữ lại cho round 2 vì delta không chạm paths của chúng.
Round 2: E12 failed — bước chấm khuôn báo tệp apps/web/src/app/(app)/shares/new/page.tsx thuộc hai nhóm màn (gui, trang-tam) và 10 tệp giao diện ngoài bản đồ. Returned to implementation.
