---
schema_version: 2
feature_slug: nhap-nho-mau
verdict: REJECT
failed_evals: []
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 043e102de12ffadad08248628bc1cf2b3f8165a5
human_signoff:
---

# Evidence Report: nhap-nho-mau

Vòng 1. Mọi eval của tính năng đều xanh. Verdict REJECT vì một lệnh suite không gắn eval nào (`npm test -w @quy-hang/ui-lint`) thoát khác 0: bộ kiểm bản đồ khuôn ở `packages/ui-lint/tests/ban-do-khuon.test.mjs:395` đếm nhóm `trang-thai` là 90 chỗ theo khuôn, thực tế là 93 chỗ. Chi tiết ở mục «Lệnh suite (hồi quy)».

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | script | PASS |
| E10b | AC-10 | script | PASS |
| E11 | AC-11 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-nhap-nho-mau-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 669.116625
    __EXIT=0

- eval: E2
  run_id: minted-nhap-nho-mau-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 669.116625
    __EXIT=0

- eval: E3
  run_id: minted-nhap-nho-mau-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 669.116625
    __EXIT=0

- eval: E11
  run_id: minted-nhap-nho-mau-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 669.116625
    __EXIT=0

- eval: E4
  run_id: minted-nhap-nho-mau-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm run db:migrate && npm run db:test
    ℹ duration_ms 55388.06775
    __EXIT=0

- eval: E5
  run_id: minted-nhap-nho-mau-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web_db
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm run test:db -w @quy-hang/web
    ℹ duration_ms 9184.836083
    __EXIT=0

- eval: E6
  run_id: minted-nhap-nho-mau-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2598.425208
    __EXIT=0

- eval: E8
  run_id: minted-nhap-nho-mau-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2598.425208
    __EXIT=0

- eval: E9
  run_id: minted-nhap-nho-mau-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 2598.425208
    __EXIT=0

- eval: E10
  run_id: minted-nhap-nho-mau-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: npm run lint
    chuẩn giao diện: đạt
    __EXIT=0

- eval: E10b
  run_id: minted-nhap-nho-mau-E10b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T11:54:34Z
  output: |
    lệnh: design-floor-khuon.mjs --kiem --root .
    1 tệp giao diện ngoài bản đồ
    __EXIT=0

- eval: E7
  run_id: minted-nhap-nho-mau-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T11:54:34Z
  screenshot: evidence/E7-1-ghi-lan-dau-1440.png
  observed: |
    Cả 8 ảnh đã mở. Màn nền tối, thanh bước ở bước 2 «Ghép cột». Đầu trang ghi tệp mau-b.xlsx hoặc ban-gia.xlsx, 40 dòng, trang «Bảng hàng».
    - E7-1 ghi-lan-dau 1440 và 375: sàn mới «Sàn thử E7 ...», mau-b.xlsx. Bước Ghép cột có từ điển, các cột STT/Trạng thái/Dự án/Toà/Tầng/Mã căn/Diện tích có đích mặc định. Không có dải báo và không có nhãn «theo mẫu». Đúng với lần nhập đầu.
    - E7-2 nhap-lai 1440 và 375: dải báo «Ghép theo mẫu đã nhớ — 16/16 cột» cùng dòng «Cột có nhãn «theo mẫu» ghép như lần nhập đã ghi gần nhất; đổi cột nào thì lần sau nhớ cách mới». Mỗi hàng nhìn thấy đều có nhãn «· theo mẫu» (STT, Trạng thái, Dự án, Toà, Tầng, Mã căn, Diện tích...). Ở 375 dải báo xuống dòng gọn, không tràn. Đích đã đổi của một cột («Giữ làm ghi chú») nằm dưới khung hình, chỉ xác nhận qua JSON.
    - E7-3 mot-phan 1440 và 375: ban-gia.xlsx, dải báo «Ghép theo mẫu đã nhớ — 2/5 cột». Mã căn và Toà có nhãn «theo mẫu». Giá (tỷ) đã ghép sang Giá chào, Phí CN sang Điều kiện phí, TT sang Trạng thái; ba cột này chỉ ghi «Hàng chia sẻ được», không có nhãn «theo mẫu». Khớp expected.
    - E7-4 loi-mau 1440 và 375: dải báo «Không đọc được mẫu đã nhớ» với dòng «Ghép theo từ điển như lần nhập đầu — kiểm lại từng cột». Bảng từ điển vẫn hiện, không có nhãn «theo mẫu». Khớp expected.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhap-nho-mau-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T11:54:34Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhap-nho-mau-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T11:54:34Z

- cmd: npm run test:hooks
  run_id: minted-nhap-nho-mau-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T11:54:34Z

- cmd: npm run typecheck
  run_id: minted-nhap-nho-mau-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T11:54:34Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhap-nho-mau-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-04T11:54:34Z
  output: |
    AssertionError: Expected values to be strictly deep-equal
    thực tế:  'trang-thai: 93 chỗ theo khuôn · 0 ngoại lệ · 0 lệch'
    kỳ vọng:  'trang-thai: 90 chỗ theo khuôn · 0 ngoại lệ · 0 lệch'
    tại packages/ui-lint/tests/ban-do-khuon.test.mjs:395
    npm error workspace @quy-hang/ui-lint@0.0.0 — command failed

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh ở cả HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là rào hồi quy có chủ ý:
- npm test -w @quy-hang/core: E1, E2, E3, E11
- npm run db:migrate && npm run db:test: E4
- npm run test:db -w @quy-hang/web: E5
- npm test -w @quy-hang/web: E6, E8, E9
- npm run lint: E10
- design-floor-khuon.mjs --kiem --root .: E10b

Lệnh fail không gắn eval: `npm test -w @quy-hang/ui-lint` (bản đồ khuôn đếm nhóm trang-thai 90 chỗ, thực tế 93 — nhóm này mở rộng khi tính năng thêm chỗ dùng TrangThai; cần cập nhật số kỳ vọng trong bộ kiểm hoặc bản đồ khuôn).

Hội đồng chấm (judge): không có panel nào được đề xuất ở vòng này.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: không eval nào đỏ; lệnh suite npm test -w @quy-hang/ui-lint đỏ vì số chỗ nhóm trang-thai lệch (93 so với 90 kỳ vọng). Trả về cho bước triển khai.
