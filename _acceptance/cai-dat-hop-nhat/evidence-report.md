---
schema_version: 2
feature_slug: cai-dat-hop-nhat
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: b7e3f29c13752f614c3ffc788f44b7269e4c0b1a
human_signoff:
---

# Evidence Report: cai-dat-hop-nhat

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | script | PASS |
| E10 | AC-4 | script | PASS |
| E10b | AC-6 | script | PASS |
| E11 | AC-7 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-cai-dat-hop-nhat-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 580.499458

- eval: E3
  run_id: minted-cai-dat-hop-nhat-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 580.499458

- eval: E8
  run_id: minted-cai-dat-hop-nhat-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 580.499458

- eval: E2
  run_id: minted-cai-dat-hop-nhat-E2-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1631.939166

- eval: E3b
  run_id: minted-cai-dat-hop-nhat-E3b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1631.939166

- eval: E4
  run_id: minted-cai-dat-hop-nhat-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1631.939166

- eval: E5
  run_id: minted-cai-dat-hop-nhat-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1631.939166

- eval: E6
  run_id: minted-cai-dat-hop-nhat-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1631.939166

- eval: E7
  run_id: minted-cai-dat-hop-nhat-E7-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T13:03:52Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 1631.939166

- eval: E9
  run_id: minted-cai-dat-hop-nhat-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.cai_dat_tai_lieu
  verified_at: 2026-11-04T13:03:52Z
  output: |
    node --test "_acceptance/cai-dat-hop-nhat/thu/*.test.mjs"
    ℹ duration_ms 230.481958

- eval: E10
  run_id: minted-cai-dat-hop-nhat-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T13:03:52Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    15 tệp giao diện ngoài bản đồ

- eval: E10b
  run_id: minted-cai-dat-hop-nhat-E10b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T13:03:52Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    15 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-cai-dat-hop-nhat-E11-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T13:03:52Z
  screenshot: evidence/E11-ca-nhan-1440.png
  observed: |
    E11-ca-nhan-1440: cột mục lục trái chỉ nhóm CÁ NHÂN với mục Cá nhân sáng; đường dẫn Cài đặt › Cá nhân; phụ đề "Áp cho tài khoản của bạn ở mọi sàn"; thân khoảng 735px sát cột; thẻ Tài khoản và máy có Hồ sơ, Sàn, Cài lên màn hình chính, Thông báo lead, Máy đang đăng nhập, nút Báo mất máy. E11-chan: cùng trang Cá nhân kèm câu "Mục này chỉ quản trị sàn mở được". E11-quan-tri-1440: Cài đặt › Sàn [Mẫu] Sàn thử › Người dùng, phụ đề "Chỉ áp cho sàn [Mẫu] Sàn thử", cột hai nhóm CÁ NHÂN và SÀN [MẪU] SÀN THỬ gồm bảy mục, thân hẹp sát cột. E11-doc-lead: Ô nhận lead thân hẹp khoảng 770px sát lề trái vùng nội dung. E11-doc-trang-tam: Cách gọi, thẻ "Màn này đang dựng", cột hai nhóm. E11-menu-dau-chu: menu tài khoản chỉ Cá nhân, Sáng/tối, Đăng xuất. E11-menu-quan-tri: menu có Cá nhân và Cài đặt sàn. E11-dien-thoai-390: tiêu đề Tôi, Cài đặt › Cá nhân, thanh dưới Hôm nay / Bảng hàng / Tôi với Tôi sáng, lề 16px. E11-quan-tri-390-ca-nhan: thanh dưới Cài đặt sàn / Tôi, chỉ Tôi sáng. E11-quan-tri-390-san: màn Người dùng, chỉ Cài đặt sàn sáng. Tất cả khớp Expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-cai-dat-hop-nhat-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T13:03:52Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-cai-dat-hop-nhat-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T13:03:52Z

- cmd: npm run test:hooks
  run_id: minted-cai-dat-hop-nhat-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T13:03:52Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-cai-dat-hop-nhat-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T13:03:52Z

- cmd: npm run typecheck
  run_id: minted-cai-dat-hop-nhat-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T13:03:52Z

- cmd: npm run lint
  run_id: minted-cai-dat-hop-nhat-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-04T13:03:52Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Baseline khong do: evals.yaml khong doi tu lan baseline cuoi (round 1), nen moi block eval ghi baseline n-a.

Eval khong-phan-biet (xanh tren ca HEAD lan baseline, theo ket qua carried), can viet lai de assert hanh vi moi hoac xac nhan la regression-guard co chu y:
- npm test -w @quy-hang/core — E1, E3, E8
- npm test -w @quy-hang/web — E2, E3b, E4, E5, E6, E7
- node --test "_acceptance/cai-dat-hop-nhat/thu/*.test.mjs" — E9

## Variance

none — moi eval chay mot lan, deterministic, khong co pass_rate hon hop.

## Iterations

Round 1: E10, E10b failed (ghim khuôn lệch bản đã commit), E11 kẹt tải lần đầu. Returned to implementation.
Round 2: ghim lại bản đồ khuôn theo bản đã commit, kịch bản E11 mở lại trang khi máy dev kẹt; mọi eval và lệnh suite xanh, verdict PASS.
