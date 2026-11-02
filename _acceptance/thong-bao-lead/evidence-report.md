---
schema_version: 2
feature_slug: thong-bao-lead
verdict: REJECT
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 874478ca6ae45f9d092f498e77df621a53e9092a
human_signoff:
---

# Evidence Report: thong-bao-lead

Round 1. Cả mười eval của hợp đồng đều chạy xanh, nhưng lệnh suite `npm run lint` thất bại và lệnh này không gắn eval nào, nên tổng kết là REJECT (xem khối lệnh suite và mục Iterations).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | ui-check | PASS |
| E10 | AC-6 | ui-check | PASS |
| E8 | AC-8 | test | PASS |
| E9 | AC-9 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-thong-bao-lead-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (gộp chung E1, E2, E3, E5, E8, E9; một lần chạy, một lần đạt)
    ℹ duration_ms 25795.513542

- eval: E2
  run_id: minted-thong-bao-lead-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 25795.513542

- eval: E3
  run_id: minted-thong-bao-lead-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 25795.513542

- eval: E4
  run_id: minted-thong-bao-lead-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm test -w @quy-hang/core
    ℹ duration_ms 167.79025

- eval: E5
  run_id: minted-thong-bao-lead-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 25795.513542

- eval: E6
  run_id: minted-thong-bao-lead-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm test -w @quy-hang/web
    ℹ duration_ms 305.239542

- eval: E7
  run_id: minted-thong-bao-lead-E7-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:13:57Z
  screenshot: evidence/E7-dau-chu-chua-bat.png
  observed: |
    Đã mở từng ảnh bằng Read. (1) dau-chu-chua-bat: màn «Hôm nay» của đầu chủ; trên cùng khung viền «Bật thông báo lead» / «Nhận thông báo khi lead về bạn, kể cả khi không mở Quỹ hàng.» + nút sáng «Bật thông báo» kèm icon chuông; dưới là bảng Hôm nay 3 việc (Lead mới 2, Thiếu thông tin 1). Khớp Expected. (2) dau-chu-da-bat: không có dải nào; bảng «Hôm nay 3 việc» đứng ngay dưới thanh trên cùng; khớp. (3) dau-chu-chua-cau-hinh: khung viền «Thông báo chưa được cấu hình» + «Máy chủ chưa sẵn sàng gửi thông báo lead.», không nút; bảng Hôm nay bên dưới; khớp. (4) dau-chu-tu-choi: duy nhất một dòng chữ xám «Thông báo đang tắt trong trình duyệt» không khung, không nút; khớp. (5) dau-chu-iphone (375 rộng): khung viền «Cài Quỹ hàng lên màn hình chính để nhận thông…» (cắt) và danh sách 1. Bấm nút Chia sẻ ở thanh dưới của Safari 2. Chọn «Thêm vào MH chính» 3. Mở Quỹ hàng từ màn hình chính rồi bật thông báo; không nút; thanh điều hướng dưới Hôm nay / Bảng hàng / Tôi; khớp. (6) truong-nhom-chua-bat: dải «Bật thông báo lead» + nút «Bật thông báo» trên khối «Hôm nay – Giờ làm gì? – Màn này đang dựng» (trang giữ chỗ); khớp. (7) truong-nhom-da-bat: không dải; khối «Hôm nay» đứng đầu; khớp. (8) truong-nhom-chua-cau-hinh: «Thông báo chưa được cấu hình» + dòng phụ, không nút; khớp. (9) truong-nhom-tu-choi: dòng «Thông báo đang tắt trong trình duyệt», không khung, không nút; khớp. (10) truong-nhom-iphone: ba bước cài như ở (5), không nút, trên trang giữ chỗ; khớp. Manifest và sw.js: xem output. Không có mâu thuẫn với Expected.
  network_observed: clean
  output: |
    Evidence đã lưu (mười ảnh) trong _acceptance/thong-bao-lead/evidence/ :
    E7-dau-chu-chua-bat.png, E7-dau-chu-da-bat.png, E7-dau-chu-chua-cau-hinh.png, E7-dau-chu-tu-choi.png, E7-dau-chu-iphone.png, E7-truong-nhom-chua-bat.png, E7-truong-nhom-da-bat.png, E7-truong-nhom-chua-cau-hinh.png, E7-truong-nhom-tu-choi.png, E7-truong-nhom-iphone.png, và E7-network.txt.

- eval: E10
  run_id: minted-thong-bao-lead-E10-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T05:13:57Z
  screenshot: evidence/E10-mo-lead.png
  observed: |
    E10-mo-lead.png (đọc bằng Read): màn «Hôm nay» 3 việc, nhóm «Lead mới 2» đang mở (mũi tên xuống), dòng đầu «Toà A · A-09.05 · Bán · Đã nhận · Hạn gọi còn 1 phút» nằm ngang y≈380-410 trong khung, nền dòng sáng hơn nhẹ (trạng thái chọn; DOM xác nhận data-state=selected), dòng thứ hai «Toà A · chỉ biết toà» và nhóm «Thiếu thông tin» mở dưới. Khớp Expected: nhóm mở, dòng được chọn, trong tầm nhìn.
    E10-mo-lead-trang-moi.png: giống hệt sau khi mở trang mới — nhóm Lead mới mở, dòng A-09.05 được chọn (nền sáng nhẹ, DOM selected) và trong khung. Khớp Expected.
    E10-khong-con.png: dưới tiêu đề «Hôm nay · 3 việc» có dòng thông báo «Lead này không còn ở Hôm nay của bạn» phía trên nhóm Lead mới; không dòng nào được chọn. Khớp Expected.
  network_observed: clean
  output: |
    5. navigate_page /today?lead=11111111-2222-4333-8444-555555555555: body chứa «Lead này không còn ở Hôm nay của bạn»; không dòng nào selected -> PASS
    6. Network: 127 request, mọi /api/v1/* (catalog, settings/queue, leads/assigned, push/public-key, listings) trả thành công; static thành công; console chỉ info/log (HMR, React DevTools), không error. Dump: evidence/E10-network.txt
    Frames đã lưu: _acceptance/thong-bao-lead/evidence/E10-mo-lead.png ; E10-mo-lead-trang-moi.png ; E10-khong-con.png ; E10-network.txt

- eval: E8
  run_id: minted-thong-bao-lead-E8-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 25795.513542

- eval: E9
  run_id: minted-thong-bao-lead-E9-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T05:13:57Z
  output: |
    Lệnh: npm run db:migrate && npm run db:test (cùng lần chạy với E1)
    ℹ duration_ms 25795.513542

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-thong-bao-lead-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T05:13:57Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-thong-bao-lead-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T05:13:57Z

- cmd: npm run test:hooks
  run_id: minted-thong-bao-lead-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T05:13:57Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-thong-bao-lead-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-11-02T05:13:57Z

- cmd: npm run typecheck
  run_id: minted-thong-bao-lead-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T05:13:57Z

- cmd: npm run lint
  run_id: minted-thong-bao-lead-SUITE-lint-r1
  exit_code: 1
  verified_at: 2026-11-02T05:13:57Z
  ghi chú: lệnh này không gắn eval nào. eslint dừng ở tệp công cụ chấm .acceptance-runs/thong-bao-lead/acceptance-verify.js, lỗi phân tích cú pháp «return outside of function» ở dòng 210 (1 lỗi); kèm 1 cảnh báo 'LoiTrenMay' khai báo mà không dùng ở apps/web/src/app/(app)/inventory/cell-edit/tren-o.tsx dòng 20. Ba bước sau eslint trong chuỗi lint (directive trần, mức nợ giao diện, kiểm chuẩn) không chạy tới vì chuỗi dừng ở bước đầu.

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không-phân-biệt (xanh trên cả HEAD lẫn baseline diffBase, chứng minh harness chứ không chứng minh feature): E1, E2, E3, E5, E8, E9 (lệnh `npm run db:migrate && npm run db:test`), E4 (lệnh `npm test -w @quy-hang/core`), E6 (lệnh `npm test -w @quy-hang/web`). Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý. E7 và E10 là ui-check, baseline n-a.

Lệnh suite xanh-cả-hai-phía là regression-guard bình thường, không liệt kê.

Lệnh thất bại không gắn eval: `npm run lint` (chi tiết ở khối lệnh suite). Đây là nguyên nhân duy nhất của tổng kết REJECT ở round này.

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, tất định)

## Iterations

Round 1: không eval nào của hợp đồng thất bại; lệnh suite `npm run lint` thất bại ở tệp công cụ chấm `.acceptance-runs/thong-bao-lead/acceptance-verify.js` (lỗi cú pháp, dòng 210), không gắn eval nào. Trả về triển khai.

