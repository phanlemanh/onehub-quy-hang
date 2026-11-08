---
schema_version: 2
feature_slug: doi-gia-nhanh
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 587613989f94e7a5e59674d4808aefa4966ef270
human_signoff: Manh Phan 2026-11-08
---

# Evidence Report: doi-gia-nhanh

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | script | PASS |
| E9 | AC-7 | test | PASS |
| E8 | AC-8 | ui-check | PASS |
| E10 | AC-1 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-doi-gia-nhanh-E1-r1
  exit_code: 0
  verifier: config:executors.test.core
  verified_at: 2026-11-08T02:53:26Z
  carried_from_round: 1
  # carry-forward tu round 1 — delta khong cham paths cua eval

- eval: E2
  run_id: minted-doi-gia-nhanh-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T03:58:21Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6463.059958

- eval: E3
  run_id: minted-doi-gia-nhanh-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T03:58:21Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6463.059958

- eval: E4
  run_id: minted-doi-gia-nhanh-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T03:58:21Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6463.059958

- eval: E5
  run_id: minted-doi-gia-nhanh-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T03:58:21Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6463.059958

- eval: E6
  run_id: minted-doi-gia-nhanh-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-08T03:58:21Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 6463.059958

- eval: E7
  run_id: minted-doi-gia-nhanh-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-08T03:58:21Z
  output: |
    4 tệp giao diện ngoài bản đồ

- eval: E9
  run_id: minted-doi-gia-nhanh-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-08T03:58:21Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 37358.615834

- eval: E8
  run_id: minted-doi-gia-nhanh-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T03:58:21Z
  screenshot: evidence/E8-step1.png
  observed: |
    Tôi đã mở và đọc các frame step1, step2, step3b, step4, step5, step7, step8, step9, step10, step11, step12. Đối chiếu Expected thì không có điểm mâu thuẫn.
    - step1: ngăn «Đổi giá · A-11.02» từ dưới lên, ô giá 3,08 tỷ, dòng «Hiểu là: 3,08 tỷ, bao phí», hai nút Bao phí / Không bao phí, nút Lưu.
    - step2: ô nhập 4500000000, dòng «3,08 tỷ, Bao phí → 4,5 tỷ, Bao phí», «Đổi +46% so với giá đang ghi — chắc chưa?», nút Sửa lại / Ghi. Nút nổi của dev tools che một phần chữ «Sửa lại».
    - step3b: Lịch sử đầu tiên là «Đổi giá · 3,08 tỷ → 4,5 tỷ», người làm «Bạn», giờ 08/11 11:01.
    - step4: Bảng hàng ở 375px có A-11.02 4,5 tỷ Bao phí.
    - step5: trang khách «Bộ căn» liệt kê Toà A A-10.05 và A-11.02. Cột giá nằm ngoài khung, ảnh không thấy giá. Tôi đọc từ DOM: «A-11.02 … Đang bán 4,5 tỷ Bao phí».
    - step7: ngăn «Đổi trạng thái» với Đã bán đang chọn, ô giá chốt trống, và khung đỏ «Cần giá chốt».
    - step8: huy hiệu «Đang giao dịch» (xanh), giá 4,5 tỷ.
    - step9: Lịch sử có «Đổi trạng thái · Đang bán → Đang giao dịch · Bạn · 08/11 11:02», dưới đó là «Đổi giá · 3,08 tỷ → 4,5 tỷ · Bạn · 08/11 11:01».
    - step10: A-01.03, huy hiệu «Đã bán», 4,65 tỷ, không có nút Đổi giá, có chữ «Căn đã bán không đổi giá — giá chốt đã ghi».
    - step11: telesales thấy «Không thấy trang này … bạn không có quyền xem», không có lối sửa nào. Badge dev «1 Issue» là lỗi 'measure' của công cụ dev Next.
    - step12: biểu ngữ «Đang xem bản đã tải — mất mạng. Thay đổi được giữ trên máy và gửi đi khi có mạng lại», giá 5 tỷ.
    Số chạm: đổi giá = 3 (≤4), đổi trạng thái = 3 (≤3).
  network_observed: clean
  output: |
    Offline (B-08.02, dau-chu-1): đặt setOffline(true) lúc Ghi, POST bị ERR_INTERNET_DISCONNECTED, giao diện báo «Đang xem bản đã tải — mất mạng», giá hiện 5 tỷ. Mở mạng sau 7s: price_changed của căn đi từ 1 lên 2, đúng +1; seq5 device=mobile, made_offline=t. Lịch sử có «Đổi giá · 3,36 tỷ → 5 tỷ». PASS.
    Frame đã lưu trong evidence/ (E8-step*.png), kèm E8-network.txt.

- eval: E10
  run_id: minted-doi-gia-nhanh-E10-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-08T03:58:21Z
  screenshot: evidence/E10-step1.html
  observed: |
    Đã mở lại E10-step1.html và E10-mang.txt (nội dung trùng nhau). Vai đọc từ company_members trước khi gọi: dau-chu-1 = listing_agent, dau-chu-2 = listing_agent, quan-tri = company_admin, telesales = telesales. Người giữ căn mẫu 0daff353-14c5-41c6-8eb4-e7c839cb47a8 là dau-chu-1. Số listing_events ban đầu là 6, version 6. Bốn lời gọi POST /api/v1/listings/<id>/events (type price_changed, expectedVersion mới nhất): telesales cho HTTP 404 {"error":"not-found"}, events 6 → 6. quan-tri cho 404, events 6 → 6. dau-chu-2 cho 200 với expectedVersion=6, events 6 → 7. dau-chu-1 cho 200 với expectedVersion=7, events 7 → 8. Khớp Expected. Ghi chú: file E10-mang.txt do lượt chạy trước để lại có dòng "KET QUA: SAI" vì mong 403. Lượt này ghi đè bằng kết quả mới, và 404 chính là điều Expected khai.
  network_observed: n-a (driver)
  output: |
    Chạy trên 3494 (HTTP 200 ở health) với Postgres dkn-H. Assertion đều đạt: (1) vai bốn người đọc trước khi gọi. (2) telesales 404 not-found, delta 0. (3) quan-tri 404, delta 0. (4) dau-chu-2 200, delta +1. (5) dau-chu-1 200, delta +1. Frame lưu: E10-step1.html (fallback HTML, không có tool chụp). Đã ghi E10-mang.txt và E10-network.txt. Không sửa code.

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-doi-gia-nhanh-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-08T03:58:21Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-doi-gia-nhanh-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-08T03:58:21Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-doi-gia-nhanh-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-08T03:58:21Z

- cmd: npm run test:hooks
  run_id: minted-doi-gia-nhanh-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-08T03:58:21Z

- cmd: npm run typecheck
  run_id: minted-doi-gia-nhanh-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-08T03:58:21Z

- cmd: npm run lint
  run_id: minted-doi-gia-nhanh-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-08T03:58:21Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh cả trên HEAD lẫn baseline):
- npm test -w @quy-hang/web: E2, E3, E4, E5, E6
- design-floor-khuon --kiem: E7
- npm test -w @quy-hang/ui-lint: E9

Cần viết lại để assert hành vi mới, hoặc xác nhận là regression-guard có chủ ý.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E10 và lệnh lint không đạt (E10 mong mã từ chối 403 nhưng máy chủ trả 404 not-found; lint có lỗi bài kiểm). Returned to implementation.
Round 2: E10 và lint sửa xong, các eval chạy lại đều đạt; E1 mang từ round 1 vì delta không chạm paths của eval.

