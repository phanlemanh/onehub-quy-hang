---
schema_version: 2
feature_slug: goi-tu-may-tinh
verdict: REJECT
failed_evals: [E8]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: bce502388d8341479d4a5bd5800119c9d48c7b69
human_signoff:
---

# Evidence Report: goi-tu-may-tinh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-3 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-5 | ui-check | REJECT |
| E9 | AC-6 | ui-check | PASS |
| E10 | AC-6 | test | PASS |
| E11 | AC-7 | test | PASS |

Lệnh fail không gắn eval: `npm test -w @quy-hang/ui-lint` (xem khối suite bên dưới) và `ui-check:E8` (đã tính vào E8).

## Evidence

- eval: E1
  run_id: minted-goi-tu-may-tinh-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 39182.797541
    (lệnh chung: npm run db:migrate && npm run db:test — phủ E1, E2, E4, E5, E10)

- eval: E2
  run_id: minted-goi-tu-may-tinh-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 39182.797541
    (cùng lệnh với E1)

- eval: E3
  run_id: minted-goi-tu-may-tinh-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 177.120833
    (lệnh: npm test -w @quy-hang/core)

- eval: E4
  run_id: minted-goi-tu-may-tinh-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 39182.797541
    (cùng lệnh với E1)

- eval: E5
  run_id: minted-goi-tu-may-tinh-E5-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 39182.797541
    (cùng lệnh với E1)

- eval: E6
  run_id: minted-goi-tu-may-tinh-E6-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 1220.209709
    (lệnh: npm test -w @quy-hang/web — phủ E6, E7, E11)

- eval: E7
  run_id: minted-goi-tu-may-tinh-E7-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 1220.209709
    (cùng lệnh với E6)

- eval: E8
  run_id: minted-goi-tu-may-tinh-E8-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T15:35:00Z
  screenshot: evidence/E8-1-nut.png
  observed: |
    E8-1-nut.png: call mode on the lead "A-09.05 · Toà A" (Bán, 3,2 tỷ). The card shows "Đã gọi G" and a button "Quay số trên điện thoại"; no message under it. Matches expected.
    E8-2-chua-co.png: after the first click, the button has become "Gửi lại" with the line "Đã gửi tới 4 thiết bị khác — chạm thông báo trên điện thoại để gọi". Expected "Chưa có điện thoại nào bật thông báo lead..." — CONTRADICTS expected (the account already had 4 devices).
    E8-3-da-gui.png: "Gửi lại" with "Đã gửi tới 1 thiết bị khác — chạm thông báo trên điện thoại để gọi". The lead card still shows only "Đã gọi G" and no new label. Matches expected.
    E8-4-mat-mang.png: the button "Quay số trên điện thoại" is active, with the red line "Mất mạng — chưa gửi được, thử lại khi có mạng" under it. Matches expected.
    E8-5-dang-gui.png: the button is greyed out (disabled) while sending. The previous red offline line is still visible. Matches "nút khoá lúc gửi".
  network_observed: clean
  output: |
    A1 PASS (khung 1), A2 FAIL (khung 2: tài khoản dau-chu-1 đã có 4 thiết bị đăng ký từ trước, tiền đề «chưa có đăng ký» không đạt; không có lối xoá thiết bị qua API nên không dựng lại được khung 2),
    A3 PASS, A4 PASS, A5 PASS. Khung đã lưu: E8-1-nut.png, E8-2-chua-co.png, E8-3-da-gui.png, E8-4-mat-mang.png, E8-5-dang-gui.png, E8-network.txt.

- eval: E9
  run_id: minted-goi-tu-may-tinh-E9-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T15:35:00Z
  screenshot: evidence/E9-1-trang.png
  observed: |
    E9-1-trang.png (mobile 375): đầu "Căn call", thẻ có dòng "Toà A · Bán" và nút sáng lớn "Gọi chủ nhà" rộng gần hết thẻ, thanh dưới Hôm nay/Bảng hàng/Tôi. Khớp expected.
    E9-2-da-mo.png: thẻ hiện "0900 000 033" chữ lớn và nút "Gọi" rộng hết thẻ (href tel:0900000033; Navigation API ghi navigate tới tel:0900000033). Khớp.
    E9-3-tai-lai.png: giống khung 1, chỉ "Gọi chủ nhà", số ẩn. Khớp.
    E9-4-khong-thay.png: khung chứa "Không thấy lead này trong việc của bạn" và nút "Về Hôm nay". Khớp.
    E9-4b-nguoi-khac.png (dau-chu-2): cùng thông điệp "Không thấy lead này…", không tên toà, không nút Gọi. Khớp.
    E9-4b-truong-nhom.png: trang "Không thấy trang này" + "Về Hôm nay", không nút Gọi chủ nhà.
    E9-5-mat-mang.png: nút "Gọi chủ nhà" còn bấm được và dòng chữ đỏ "Mất mạng — chưa mở được số, thử lại khi có mạng." dưới nút. Khớp. Kho trên máy không chứa số (0 lần ở 6 dạng).
  network_observed: clean
  output: |
    PASS K5 (Offline, dòng đỏ dưới nút, nút bấm lại được); PASS Cuối: localStorage 1 mục, sessionStorage 0, ba IndexedDB quy-hang-sync:*, sáu dạng số = 0 lần, cookie cũng 0.

- eval: E10
  run_id: minted-goi-tu-may-tinh-E10-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 39182.797541
    (cùng lệnh với E1)

- eval: E11
  run_id: minted-goi-tu-may-tinh-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T15:35:00Z
  output: |
    ℹ duration_ms 1220.209709
    (cùng lệnh với E6)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-goi-tu-may-tinh-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-02T15:35:00Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-goi-tu-may-tinh-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-02T15:35:00Z

- cmd: npm run test:hooks
  run_id: minted-goi-tu-may-tinh-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-02T15:35:00Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-goi-tu-may-tinh-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 1
  verified_at: 2026-11-02T15:35:00Z
  note: bài ban-do-khuon.test.mjs so bản đồ khuôn với số thật: cuoc-goi có 3 tệp theo khuôn (bản đồ mong 2), trang-tam 16 ngoại lệ (mong 15), trang-thai 52 chỗ (mong 50). Bản đồ chưa được cập nhật theo trang quay số mới.

- cmd: npm run typecheck
  run_id: minted-goi-tu-may-tinh-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-02T15:35:00Z

- cmd: npm run lint
  run_id: minted-goi-tu-may-tinh-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-11-02T15:35:00Z

## Known limits

## Ngoài hợp đồng

## Analyst

Baseline không đo: E8, E9 (eval giao diện, baseline n-a).

Eval không phân biệt (xanh cả trên code mới lẫn baseline — chứng minh khung chạy, chưa chứng minh tính năng; viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- `npm run db:migrate && npm run db:test`: E1, E2, E4, E5, E10
- `npm test -w @quy-hang/core`: E3
- `npm test -w @quy-hang/web`: E6, E7, E11

Lệnh fail không gắn eval: `npm test -w @quy-hang/ui-lint` — bản đồ khuôn lệch số tệp/ngoại lệ sau khi thêm trang quay số (cuoc-goi, trang-tam, trang-thai). Cần cập nhật bản đồ khuôn trong bài kiểm hoặc xác nhận con số mới là đúng.

Judge panels: không có eval dạng judgment — không có hội đồng nào được đề xuất, không có mục nào để người ghi human_override.

## Variance

none — mọi eval chạy một lần, xác định, không có mục phương sai.

## Iterations

Round 1: E8 failed — khung 2 không dựng được vì tài khoản mẫu đã có 4 thiết bị đăng ký từ trước (tiền đề «chưa có đăng ký» không đạt), và bài ui-lint ban-do-khuon lệch số so với bản đồ khuôn. Returned to implementation.
