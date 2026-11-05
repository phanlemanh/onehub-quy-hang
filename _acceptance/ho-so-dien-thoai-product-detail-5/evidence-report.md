---
schema_version: 2
feature_slug: ho-so-dien-thoai-product-detail-5
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: a03549a184b648013026a50bceee882de19b7ba6
human_signoff: Manh Phan 2026-11-05
---

# Evidence Report: ho-so-dien-thoai-product-detail-5

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E9 | AC-8 | ui-check | PASS |
| E10 | AC-4 | ui-check | PASS |

không chạy theo hồ sơ: E8

## Evidence

- eval: E1
  run_id: minted-ho-so-dien-thoai-product-detail-5-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:45:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2416.534791

- eval: E2
  run_id: minted-ho-so-dien-thoai-product-detail-5-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:45:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2416.534791

- eval: E3
  run_id: minted-ho-so-dien-thoai-product-detail-5-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:45:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2416.534791

- eval: E4
  run_id: minted-ho-so-dien-thoai-product-detail-5-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:45:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2416.534791

- eval: E5
  run_id: minted-ho-so-dien-thoai-product-detail-5-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:45:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2416.534791

- eval: E6
  run_id: minted-ho-so-dien-thoai-product-detail-5-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-05T15:45:22Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 2416.534791

- eval: E7
  run_id: minted-ho-so-dien-thoai-product-detail-5-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-05T15:45:22Z
  output: |
    design-floor-khuon.mjs --kiem --root .
    13 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-ho-so-dien-thoai-product-detail-5-E9-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T15:45:22Z
  screenshot: evidence/E9-dau-khach.png
  observed: |
    E9-dau-khach.png (375x812): tiêu đề nền «Căn A-01.06»; ảnh lớn gradient có nhãn 1/1 chiếm đầu màn; dưới là huy hiệu «Đang bán», «A-01.06 · Toà A», dòng dự án, 3 thông số (110,4 m² / 3 / Bắc), giá «3,25 tỷ» + «Bao phí», «Xác nhận 14 ngày trước», thanh mức đủ 5/5, mục «THUỘC TÍNH CĂN»; nút đen «Hỏi đầu chủ · [Mẫu] Đầu chủ 1» dính ngay trên thanh tab; không có chữ Nội bộ. E9-dau-khach-cuoi.png: cuối trang ảnh «Gửi được (1) / Tự có từ mã» (không tab Nội bộ), Lịch sử 3 việc, nút «Hỏi đầu chủ» vẫn dính phía trên thanh tab. E9-dau-chu.png: cùng bố cục, nút đen «Ghi cuộc gọi» (icon điện thoại) dính đáy, thanh tiêu đề có thêm dấu +; E9-dau-chu-cuoi.png: khu ảnh có «Chọn ảnh» và thẻ ảnh có menu, Lịch sử ghi «Bạn», nút «Ghi cuộc gọi» vẫn ở đáy (tab Nội bộ nằm ở khu Ảnh phía trên, có trong chữ trang). E9-may-tinh.png (1440x900): khung ba cột kiểu Hôm nay, thân cột giữa có tiêu đề «A-01.06 Đang bán», giá, khối Ảnh với ba tab Gửi được (1)/Tự có từ mã/Nội bộ (0), THUỘC TÍNH CĂN; không có nút dính. E9-khong-thay.png: thẻ «Không thấy căn — Mã «ZZ-99.99» không có trong hàng bạn thấy trên máy này.» + nút «Về Bảng hàng». E9-chua-anh.png: khung xám biểu tượng ảnh «Chưa có ảnh», huy hiệu «Chưa đủ để rao», «A-01.08 · Tòa A», giá, mức đủ 1/5, nút «Ghi cuộc gọi». E9-mat-mang.png: khung «Không tải được ảnh», «Đang xem bản trên máy · đồng bộ 05/11 22:54», đủ thông số và giá lấy từ kho trên máy, nút «Ghi cuộc gọi», biểu tượng mây gạch ở thanh trên. Tất cả khớp Expected.
  network_observed: clean

- eval: E10
  run_id: minted-ho-so-dien-thoai-product-detail-5-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-05T15:45:22Z
  screenshot: evidence/E10-step1.png
  observed: |
    E10-step1.png (dau-khach, 375x812, /units/A-01.06): màn Căn A-01.06 có ảnh lớn gradient đầu màn, badge Đang bán, tên A-01.06 · Toà A, Diện tích 110,4 m², 3 phòng ngủ, hướng Bắc, giá 3,25 tỷ Bao phí, nút đen dính đáy «Hỏi đầu chủ · [Mẫu] Đầu chủ 1»; không thấy số chủ, tên chủ hay giá đáy trên màn. E10-step2.png (dau-chu-1, cùng căn): cùng thân, nút dính đáy là «Ghi cuộc gọi», có biểu tượng thêm (+) ở thanh trên; không hiện số chủ trên màn mở trang (số chỉ ra qua lối reveal). Khớp Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-ho-so-dien-thoai-product-detail-5-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-05T15:45:22Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-ho-so-dien-thoai-product-detail-5-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-05T15:45:22Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-ho-so-dien-thoai-product-detail-5-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-05T15:45:22Z

- cmd: npm run test:hooks
  run_id: minted-ho-so-dien-thoai-product-detail-5-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-05T15:45:22Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-ho-so-dien-thoai-product-detail-5-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-05T15:45:22Z

- cmd: npm run typecheck
  run_id: minted-ho-so-dien-thoai-product-detail-5-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-05T15:45:22Z

- cmd: npm run lint
  run_id: minted-ho-so-dien-thoai-product-detail-5-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-05T15:45:22Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline):
- npm test -w @quy-hang/web — E1, E2, E3, E4, E5, E6
- design-floor-khuon.mjs --kiem --root . — E7

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: chấm lượt 1 cho ra các việc sửa (đối chứng dương E4, thước E10, gỡ trang ba lối, ghim lại khuôn) — đã sửa ở commit a03549a1 và quay lại chấm.
Round 2: mọi eval E1-E7, E9, E10 đạt; E8 không chạy theo hồ sơ; các lệnh suite xanh.

