---
schema_version: 2
feature_slug: tab-toi
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: cd8d9f470abe3bc4baeb2ec3f29a4ac5f93c1da9
human_signoff: Manh Phan 2026-11-04
---

# Evidence Report: tab-toi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | test | PASS |
| E7c | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-1 | script | PASS |
| E11 | AC-10 | test | PASS |
| E11b | AC-10 | test | PASS |

## Evidence

- eval: E7b
  run_id: minted-tab-toi-E7b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:22:22Z
  output: |
    ℹ duration_ms 1579.324583

- eval: E10
  run_id: minted-tab-toi-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T00:22:22Z
  output: |
    13 tệp giao diện ngoài bản đồ

- eval: E1b
  run_id: minted-tab-toi-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T00:22:22Z
  screenshot: evidence/E1b-mot-may-390.png
  observed: |
    E1b-mot-may-390.png: khổ điện thoại, trang Tôi, sáu dòng đúng thứ tự Hồ sơ (dau-chu-1@...), Sàn ([Mẫu] Sàn thử), Cài lên màn hình chính (nút Cài), Thông báo lead (nút Bật), Máy đang đăng nhập (iPhone · Safari · Máy này, «Chỉ có máy này», không nút Báo mất máy), Đăng xuất; thanh dưới có Hôm nay / Bảng hàng / Tôi, tab Tôi sáng. E1b-mot-may-1440.png: cùng sáu dòng trong thẻ «Tài khoản và máy», «Chỉ có máy này», không nút Báo mất máy, breadcrumb Quỹ hàng > Tôi. E1b-ba-may-1440.png: tài khoản dau-chu-2, dòng Máy đang đăng nhập liệt kê Máy tính · Chrome · Máy này, iPhone · Safari, Android · Chrome, có nút đỏ «Báo mất máy». E1b-hop-hoi-1440.png: hộp thoại «Báo mất máy?» chữ «Đăng xuất mọi máy khác và xoá dữ liệu Quỹ hàng trên các máy ấy?», nút «Ở lại» và nút đỏ destructive «Đăng xuất mọi máy khác», nền mờ. E1b-da-bao-1440.png: dòng máy hiện «Đã đăng xuất 2 máy khác», danh sách chỉ còn «Máy tính · Chrome · Máy này», nút Báo mất máy biến mất. E1b-man-bao-390.png: trang Đăng nhập Quỹ hàng, thẻ «Máy này đã bị báo mất / Dữ liệu Quỹ hàng trên máy đã xoá», ô Email và nút Gửi mã. Tất cả khớp Expected. Ghi chú nhẹ: bước 5 ảnh là trang đăng nhập với cờ bi-bao-mat, khớp mô tả.
  network_observed: n-a (driver)

- eval: E7c
  run_id: minted-tab-toi-E7c-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T00:22:22Z
  screenshot: evidence/E7c-b-truoc-390.png
  observed: |
    E7c-b-truoc-390: màn «Bảng hàng» điện thoại 390, trống «Chưa có căn nào trên bảng hàng chung», biểu tượng đồng bộ trên đầu, tab Tôi cuối; kho đã nạp (khớp JSON). E7c-a-da-bao-1440: trang Tôi, hàng «Máy đang đăng nhập» ghi «Đã đăng xuất 1 máy khác», còn «Máy tính · Chrome · Máy này» — đúng. E7c-b-sau-390: màn «Đăng nhập Quỹ hàng» có khung «Máy này đã bị báo mất / Dữ liệu Quỹ hàng trên máy đã xoá», ô Email và nút «Gửi mã» — đúng lời đã khai. E7c-c-sau-390: «Đăng nhập Quỹ hàng» sạch, không có khung báo mất — đúng đối chứng.
  network_observed: n-a (driver)

### Eval mang từ round 1 (carry-forward)

- eval: E1
  run_id: minted-tab-toi-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-tab-toi-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E3
  run_id: minted-tab-toi-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E4
  run_id: minted-tab-toi-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5
  run_id: minted-tab-toi-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E6
  run_id: minted-tab-toi-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E7
  run_id: minted-tab-toi-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-tab-toi-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E9
  run_id: minted-tab-toi-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E5b
  run_id: minted-tab-toi-E5b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11
  run_id: minted-tab-toi-E11-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E11b
  run_id: minted-tab-toi-E11b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T00:04:44Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-04T00:22:22Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-04T00:22:22Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-04T00:22:22Z

- cmd: npm run test:hooks
  run_id: minted-tab-toi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-04T00:22:22Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-tab-toi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-04T00:22:22Z

- cmd: npm run typecheck
  run_id: minted-tab-toi-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-04T00:22:22Z

- cmd: npm run lint
  run_id: minted-tab-toi-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-04T00:22:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay.

Eval khong-phan-biet (pass tren ca HEAD lan baseline; regression-guard co chu y hoac can viet lai de assert hanh vi moi):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E7b, E8, E5b, E11
- npm run db:migrate && npm run db:test: E5, E6, E7, E9, E11b

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: bo eval E1 den E11b chay lan dau, 7 muc ngoai hop dong duoc ghi lai trong review-findings.md; sua o commit cd8d9f47.
Round 2: chay lai E7b, E10, E1b, E7c va cac lenh suite tren commit cd8d9f47; cac eval con lai mang tu round 1. Tat ca dat.
