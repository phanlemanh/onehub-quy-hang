---
schema_version: 2
feature_slug: anh-can-ba-ngan
verdict: REJECT
failed_evals: ["E10"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: f0a84f1c852ff06548807ec3a9b13c32664c6c11
human_signoff:
---

# Evidence Report: anh-can-ba-ngan

Round 1. Lệnh fail không gắn eval nào: không có (lệnh fail duy nhất là ui-check của E10).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | test | PASS |
| E6c | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | ui-check | FAIL |
| E10b | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-anh-can-ba-ngan-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm test -w @quy-hang/web: đạt, duration_ms 242.66

- eval: E1b
  run_id: minted-anh-can-ba-ngan-E1b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E2
  run_id: minted-anh-can-ba-ngan-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm test -w @quy-hang/core: đạt, duration_ms 165.92

- eval: E2b
  run_id: minted-anh-can-ba-ngan-E2b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E3
  run_id: minted-anh-can-ba-ngan-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm test -w @quy-hang/core: đạt, duration_ms 165.92

- eval: E3b
  run_id: minted-anh-can-ba-ngan-E3b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E4
  run_id: minted-anh-can-ba-ngan-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E5
  run_id: minted-anh-can-ba-ngan-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E5b
  run_id: minted-anh-can-ba-ngan-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E6
  run_id: minted-anh-can-ba-ngan-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E6b
  run_id: minted-anh-can-ba-ngan-E6b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm test -w @quy-hang/api: đạt, duration_ms 60517.33

- eval: E6c
  run_id: minted-anh-can-ba-ngan-E6c-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E7
  run_id: minted-anh-can-ba-ngan-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm test -w @quy-hang/core: đạt, duration_ms 165.92

- eval: E8
  run_id: minted-anh-can-ba-ngan-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm test -w @quy-hang/core: đạt, duration_ms 165.92

- eval: E9
  run_id: minted-anh-can-ba-ngan-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm run db:migrate && npm run db:test: đạt, duration_ms 6078.03

- eval: E10
  run_id: minted-anh-can-ba-ngan-E10-r1
  exit_code: 1
  baseline: n-a
  verifier: ui-check
  verified_at: 2026-11-01T08:40:44Z
  screenshot: evidence/E10-step1.png
  observed: |
    step1: cột hồ sơ A-06.01 mục ẢNH, tab 'Gửi được (1) / Tự có từ mã / Nội bộ (0)', chữ 'Kéo ảnh từ Zalo vào đây, hoặc dán bằng Cmd+V', nút 'Chọn ảnh', NHƯNG đã có 1 ảnh (nhãn Bìa, 'Ảnh thật - 01/11/20...') nên thẻ không trống như Expected. step2: 'Gửi được (4)', ảnh cuối 'Ảnh thật - 20/10/2...' (EXIF). step3: thẻ vẫn 4 ảnh, dòng đỏ 'tin-nhan.jpg / Không phải ảnh / Bỏ'. step4: nhãn Bìa chuyển sang ảnh thứ ba sau menu Đặt làm ảnh bìa, tải lại giữ nguyên. step5: tab Nội bộ có 1 ảnh; hộp thoại ảnh lớn 'Toà A A-06.01 - Ảnh thật - 01/11/2026'. step5c: 5 ảnh; step5d: 6 ảnh, Bìa đầu. step6: dòng 'Cần mạng để thêm ảnh', nút 'Chọn ảnh' bị khoá. step7: màn điện thoại chỉ hiện thẻ 'Bảng hàng đang thẻ trên điện thoại dừng ở mức 32', không có mục Ảnh. step8: đầu khách, 6 ảnh, không có menu '...'; step8b: thẻ 'Ngăn nội bộ - Chỉ người giữ căn và trưởng nhóm xem', không số đếm, không ảnh.
  network_observed: clean
  output: |
    B1 không đạt: thẻ Gửi được không trống lúc đầu (căn A còn 1 ảnh từ lần chạy trước của phiên khác, dựng dữ liệu không reset ảnh; không xoá vì là xoá hẳn dữ liệu), nên các bước sau có 4 đến 6 ảnh thay vì 3.
    B2 đạt: thả 3 ảnh thì 3 ảnh mới vào, ảnh JPEG EXIF ghi 'Ảnh thật - 20/10/2026'.
    B3 đạt: tệp tin-nhan.jpg bị từ chối với dòng 'Không phải ảnh', thẻ vẫn 4 ảnh, không POST.
    B4 một phần: kéo thả sắp xếp không thực hiện được bằng công cụ (không kết luận lỗi sản phẩm); menu 'Đặt làm ảnh bìa' đạt và giữ sau khi tải lại.
    B5 đạt: ảnh nội bộ trả no-store; B5b đạt: 1 CSDL quy-hang-sync, caches rỗng, 0 service worker, 0 mục chứa id ảnh nội bộ; có đối chứng dương thấy id ở lời gọi mạng danh sách.
    B5c, B5d đạt: Chọn ảnh và dán đều thêm ảnh.
    B6 đạt: ngoại tuyến hiện 'Cần mạng để thêm ảnh', nút Chọn ảnh bị khoá.
    B7 không quan sát được: ở 390x844 app hiện màn thủ công, không render mục Ảnh.
    B8 đạt (chức năng): đầu khách không thấy menu thao tác, không sửa được; danh sách ảnh trong tab mạng có noiBo 'an', không có id ảnh sổ.
    Kết luận: B1 không đúng Expected, B4 chưa kiểm được phần kéo, B7 không kiểm được; các điều kiện cốt lõi (no-store, 0 mục nội bộ ngoài đầu chủ, ẩn nội bộ với đầu khách) đều đạt.
    Khung ảnh: E10-step1.png, E10-step2a-cho.png, E10-step2.png, E10-step3.png, E10-step4.png, E10-step4b-reload.png, E10-step5.png, E10-step5-lon.png, E10-step5c.png, E10-step5d.png, E10-step6.png, E10-step7.png, E10-step8.png, E10-step8b-noibo.png (thư mục evidence/); mạng: evidence/E10-network.txt.

- eval: E10b
  run_id: minted-anh-can-ba-ngan-E10b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T08:40:44Z
  output: |
    npm test -w @quy-hang/ui-lint: đạt, duration_ms 11068.21

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-anh-can-ba-ngan-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T08:40:44Z

- cmd: npm run test:hooks
  run_id: minted-anh-can-ba-ngan-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T08:40:44Z

- cmd: npm run typecheck
  run_id: minted-anh-can-ba-ngan-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T08:40:44Z

- cmd: npm run lint
  run_id: minted-anh-can-ba-ngan-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-01T08:40:44Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/web: E1
- npm run db:migrate && npm run db:test: E1b, E2b, E3b, E4, E5, E5b, E6, E6c, E9
- npm test -w @quy-hang/core: E2, E3, E7, E8
- npm test -w @quy-hang/api: E6b
- npm test -w @quy-hang/ui-lint: E10b

Baseline không đo: E10 (ui-check, baseline n-a).

## Variance

none — mọi eval chạy một lần, tất định, không có phương sai.

## Iterations

Round 1: E10 không đạt — thẻ Gửi được không trống ở bước đầu (dữ liệu dựng còn ảnh cũ), bước kéo thả sắp xếp và bước điện thoại 390 không quan sát được. Trả về thi công/dựng lại dữ liệu chấm.
