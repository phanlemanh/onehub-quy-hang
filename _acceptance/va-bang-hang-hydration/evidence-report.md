---
schema_version: 2
feature_slug: va-bang-hang-hydration
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 9b74925a5af85f8fb44cb24a4975ce10f74cb846
human_signoff:
---

# Evidence Report: va-bang-hang-hydration

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | script | PASS |
| E2 | AC-2 | script | PASS (đạt có giới hạn) |
| E1b | AC-3 | script | PASS |
| E3 | AC-3 | ui-check | PASS |
| E4 | AC-4 | script | PASS |
| E5 | AC-4 | script | PASS |
| E6 | AC-4 | test | PASS |
| E7 | AC-4 | script | PASS (mang sang từ vòng 1) |
| E8 | AC-4 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-va-bang-hang-hydration-E1-r2
  exit_code: 0
  baseline: n-a
  verifier: node _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs
  verified_at: 2026-11-07T22:22:17Z
  output: |
    hydration SẠCH: 0 lỗi hydration ở cả 6 ca; mất mạng vẫn hiện hàng trong 5 giây

- eval: E1b
  run_id: minted-va-bang-hang-hydration-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: node _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs
  verified_at: 2026-11-07T22:22:17Z
  output: |
    hydration SẠCH: 0 lỗi hydration ở cả 6 ca; mất mạng vẫn hiện hàng trong 5 giây

- eval: E2
  run_id: minted-va-bang-hang-hydration-E2-r2
  exit_code: 1
  baseline: n-a
  verifier: node _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs --sha a5682245
  verified_at: 2026-11-07T22:22:17Z
  output: |
    hydration ĐỎ: 4 lỗi hydration trên Bảng hàng

- eval: E3
  run_id: minted-va-bang-hang-hydration-E3-r2
  exit_code: 0
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-07T22:22:17Z
  screenshot: evidence/E3-may-tinh.png
  observed: |
    E3-may-tinh.png (1440x900, /inventory sau khi tải lại): tiêu đề «Bảng hàng», thanh công cụ có dòng đếm «33 / 33 căn», chân bảng cũng «33 / 33 căn». Lưới có hàng thật: nhóm Toà A (18 căn) → 1PN, 2PN, 3PN, các hàng A-13.01, A-11.01, A-15.04... với diện tích, tầng, hướng, trạng thái (Đang bán, Ngưng hẳn, Đã bán...), giá. Không có khung xương hay chữ đang tải. Khớp 33 hàng dung-d in cho dau-chu-1. E3-dien-thoai.png (375x812, sau khi tải lại): tiêu đề «Bảng hàng», «19 căn», nhóm «11 căn / TOÀ B», thẻ căn B-03.04 (5,35 tỷ), B-15.05, B-13.02, B-14.06, B-15.01 với diện tích, phòng ngủ, hướng. Ô ảnh thẻ hiện biểu tượng ảnh dự phòng (ảnh thumb mẫu trả 404), không phải khung đang tải; trong DOM không có skeleton, aria-busy hay animate-pulse. Điện thoại đếm 19 căn, khác 33 của máy tính; đề bài chỉ cần có thẻ căn nên không tính là lỗi, nhưng đáng ghi chú.
  network_observed: clean

- eval: E4
  run_id: minted-va-bang-hang-hydration-E4-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.typecheck
  verified_at: 2026-11-07T22:22:17Z

- eval: E5
  run_id: minted-va-bang-hang-hydration-E5-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-07T22:22:17Z
  output: |
    chuẩn giao diện: đạt

- eval: E6
  run_id: minted-va-bang-hang-hydration-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-07T22:22:17Z
  output: |
    ℹ duration_ms 3731.607125

- eval: E7
  run_id: minted-va-bang-hang-hydration-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-07T22:18:30Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E8
  run_id: minted-va-bang-hang-hydration-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.floor
  verified_at: 2026-11-07T22:22:17Z

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-07T22:22:17Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-07T22:22:17Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-07T22:22:17Z

- cmd: npm run test:hooks
  run_id: minted-va-bang-hang-hydration-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-07T22:22:17Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-va-bang-hang-hydration-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-07T22:22:17Z

## Known limits

- E2 (AC-2) dat-co-gioi-han: ma thoat 1 la ket qua DA KHAI TRUOC cua eval nay, khong phai mot luot truot. Lenh: node _acceptance/va-bang-hang-hydration/thu/kiem-hydration.mjs --sha a5682245

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không phân biệt (xanh cả hai phía, hoặc chưa đo baseline), cần xác nhận là regression-guard có chủ ý:
- npm run typecheck (E4)
- npm run lint (E5)
- npm test -w @quy-hang/web (E6)
- bước chấm khuôn design-floor-khuon (E7)

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E8 báo đỏ — sàn thiết kế đọc nhầm chú thích «#185» thành mã màu; hồ sơ lượt chấm 1 bị từ chối. Quay lại sửa chú thích.
Round 2: mọi eval đạt; E7 mang sang từ vòng 1 vì thay đổi không chạm tệp của eval này; E2 đạt có giới hạn (mã thoát đã khai trước).
