---
schema_version: 2
feature_slug: phat-hang
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 8b355d30a0e9d47e4783bd76d8bea2b26b534f21
human_signoff:
---

# Evidence Report: phat-hang

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E6b | AC-6 | ui-check | PASS |
| E7 | AC-7 | script | PASS |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | test | PASS |
| E8c | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-1 | script | PASS |

## Evidence

- eval: E1
  run_id: minted-phat-hang-E1-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 1414.7365

- eval: E1b
  run_id: minted-phat-hang-E1b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:03:42Z
  screenshot: evidence/E1b-buoc-1-1440.png
  observed: |
    E1b-buoc-1-1440: hộp thoại «Xuất bảng hàng» mở trên nền bảng hàng; bốn bước bên trái; năm mẫu Bài Zalo, Bài Facebook, Excel, Ảnh, PDF; chân ghi «2 căn • Bài Zalo • Nhóm môi giới», nút Tiếp. Khớp. E1b-buoc-3-hai-can: bước Xem trước, banner «Cột không ra ngoài: Mức đủ, Ai thấy», bảng đúng hai dòng Toà A A-11.01 và A-13.01, chân «2 căn • Excel • Nhóm môi giới», có Quay lại/Tiếp. Khớp. E1b-quay-lai-khach-rieng: chân «2 căn • Excel • Khách riêng», banner «Cột không ra ngoài: Mã căn, Mức đủ, Ai thấy», bảng không có cột Mã căn, hai căn. Khớp. E1b-khong-tich: bước 1, chân «33 căn • Excel • Nhóm môi giới», Bài Zalo, Bài Facebook, Ảnh mờ kèm «Quá 30 căn — dùng Excel hay PDF», Excel và PDF dùng được. Khớp về ý (33 thay vì 31). E1b-menu-tao: hộp thoại mở trên /inventory, hiển thị như khong-tich. Khớp. E1b-dien-thoai-390: màn Bảng hàng khổ 390, thanh trên có tìm, +, Lọc, Chọn; không thấy nút «Xuất bảng hàng». Khớp.
  network_observed: n-a (driver)
  Ghi chú: bộ lọc cho 33 căn thay vì 31 (vẫn trên 30 nên ba thẻ khoá đúng ý). Ảnh khong-tich và menu-tao trùng nhau (cùng trạng thái hộp thoại mở ở bước 1). Frame đã lưu: E1b-buoc-1-1440.png, E1b-buoc-3-hai-can-1440.png, E1b-quay-lai-khach-rieng-1440.png, E1b-khong-tich-1440.png, E1b-menu-tao-1440.png, E1b-dien-thoai-390.png.

- eval: E2
  run_id: minted-phat-hang-E2-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 570.281917

- eval: E3
  run_id: minted-phat-hang-E3-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 570.281917

- eval: E4
  run_id: minted-phat-hang-E4-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 570.281917

- eval: E5
  run_id: minted-phat-hang-E5-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 570.281917

- eval: E6
  run_id: minted-phat-hang-E6-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 570.281917

- eval: E6b
  run_id: minted-phat-hang-E6b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:03:42Z
  screenshot: evidence/E6b-12-can.png
  observed: |
    E6b-12-can.png (2572x780): ảnh bảng 12 dòng, toàn Toà A (A-01.03 đến A-05.03). Header gồm Toà, Mã căn, Loại căn, Diện tích, Tầng, Hướng, Trạng thái, Giá, Phí, Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng, Xác nhận. Chữ tiếng Việt có dấu đọc đúng: «Không còn bán», «Đang giao dịch», «Tạm ngừng», «Bao phí», «Không bao phí», «Tây Bắc», «m²», «3,08 tỷ». Dùng dấu «—» cho ô trống.
    E6b-30-can.png (2572x1860): ảnh bảng đúng 30 dòng (đếm từ B-08.04 đến B-15.05), cùng 14 cột, chữ có dấu đúng, không cắt.
    E6b-12-can.pdf: 1 trang. Bản render có cùng 12 dòng, 14 cột và nội dung như ảnh, chữ có dấu đúng (xem E6b-12-can-pdf-xem.png).
    E6b-tren-30-can.pdf: /Count 2 nên 2 trang, khớp kỳ vọng. Chỉ render được trang 1 (E6b-tren-30-can-pdf-xem.png), trang 2 chỉ đọc qua số trang.
    E6b-12-anh-buoc-1.png và E6b-30-anh-buoc-1.png: hộp thoại «Xuất bảng hàng», thẻ Ảnh hiện «Ảnh bảng — tối đa 30 căn», không khoá. Chân hộp thoại ghi «12 căn» và «30 căn».
    E6b-0-pdf-buoc-1.png: chân hộp thoại ghi «33 căn». Thẻ Ảnh bị khoá với lời «Quá 30 căn — dùng Excel hay PDF». Bài Zalo và Bài Facebook cũng khoá cùng lời, PDF còn dùng được. Khớp kỳ vọng.
  network_observed: n-a (driver)
  Ghi chú: đối chứng trên ngưỡng dùng 33 căn thay vì 31. pdftoppm không có nên PDF render bằng sips, chỉ trang 1; số trang lấy từ /Count. E6b-network.txt là bản cũ.

- eval: E7
  run_id: minted-phat-hang-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm run test:ro-ri
    duration_ms 244.676792

- eval: E7b
  run_id: minted-phat-hang-E7b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:03:42Z
  screenshot:
  observed: |
    Không có frame ảnh; đã đọc nội dung 4 tệp txt bằng shell. Nhóm môi giới (Excel và Bài Zalo): 18 căn, mỗi dòng có mã căn A-xx.xx, trạng thái, giá, phí, pháp lý "[Mẫu] Sổ hồng", tình trạng sử dụng; không có tên chủ nhà, SĐT 0900 000 0xx hay giá đáy. Khách riêng: cùng 18 dòng nhưng không có mã căn (Excel cột Tầng hiện "—", không có cột Mã căn), cũng không lộ chủ nhà/SĐT/giá đáy. Khớp Expected.
  network_observed: n-a (driver)
  Ghi chú: 92 chuỗi dò (ví dụ "[Mau] Chu nha 08", "••00 •00 •08"). Kiểm độc lập trên E7b-*.txt: các mẫu 0900, 000 0, Chu nha, chu-nha, day đều ra 0 ở cả 4 tệp; mã căn dạng A-NN.NN: 18/18/0/0 (Nhóm môi giới có, Khách riêng không). Evidence: E7b-bai-zalo-khach-rieng.txt, E7b-bai-zalo-nhom-moi-gioi.txt, E7b-xlsx-khach-rieng.txt, E7b-xlsx-nhom-moi-gioi.txt. Không có network dump.

- eval: E8
  run_id: minted-phat-hang-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm run db:migrate && npm run db:test
    duration_ms 45852.471084

- eval: E8b
  run_id: minted-phat-hang-E8b-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/web
    duration_ms 1414.7365

- eval: E8c
  run_id: minted-phat-hang-E8c-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-04T06:03:42Z
  screenshot: evidence/E8c-sau-1440.png
  observed: |
    E8c-sau-1440.png: Bàn làm việc "Bảng hàng" của sàn "[Mẫu] Sàn thử", 33/33 căn, thanh công cụ ghi "3 căn đã chọn" (cùng nút Đổi trạng thái, Đánh dấu đã gọi, Bỏ chọn, Xuất bảng hàng). Nhóm Toà → Loại căn; ba hàng đầu (A-11.01, A-13.01, A-01.03) được tick, các hàng còn lại không tick. Khớp việc xuất 3 căn đã chọn; không có lỗi hiển thị. Hình không tự chứng minh số dòng exports, phần đó dựa vào số đếm DB.
  network_observed: n-a (driver)
  Ghi chú: bước 3 đếm bảng exports trước 40, sau 42, chênh 2 (post_zalo/nhom_moi_gioi/3 và xlsx/khach_rieng/3); số đo sheet_publishes = 2 (kiểu đếm, tính bằng so-do.ts trên đúng dòng mới). Không có E8c-network.txt vì driver là script.

- eval: E9
  run_id: minted-phat-hang-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.core
  verified_at: 2026-11-04T06:03:42Z
  output: |
    npm test -w @quy-hang/core
    duration_ms 570.281917

- eval: E10
  run_id: minted-phat-hang-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.design.khuon
  verified_at: 2026-11-04T06:03:42Z
  output: |
    design-floor-khuon --kiem --root .
    20 tệp giao diện ngoài bản đồ

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-phat-hang-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-04T06:03:42Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-phat-hang-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-04T06:03:42Z

- cmd: npm run test:hooks
  run_id: minted-phat-hang-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-04T06:03:42Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-phat-hang-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-04T06:03:42Z

- cmd: npm run typecheck
  run_id: minted-phat-hang-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-04T06:03:42Z

- cmd: npm run lint
  run_id: minted-phat-hang-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-04T06:03:42Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 1 — baseline khong do lai round nay

Eval không-phân-biệt (xanh cả trên HEAD lẫn baseline; chứng minh harness, cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E8b
- npm test -w @quy-hang/core: E2, E3, E4, E5, E6, E9
- npm run db:migrate && npm run db:test: E8
- design-floor-khuon --kiem: E10

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: mọi eval xanh; verdict PASS.
