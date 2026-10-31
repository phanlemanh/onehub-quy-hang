---
schema_version: 2
feature_slug: nhanh-tuc-thi
verdict: REJECT
failed_evals: ["E4b"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 3cae9bad96394cce095dcc7c17476f0f52455ff9
human_signoff:
---

# Evidence Report: nhanh-tuc-thi

Round 2. Một eval không đạt: E4b (lịch sử trong giao diện thiếu sự kiện của B-101). Lệnh không gắn eval nào mà không đạt: ui-check:E4b (cùng eval E4b).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | FAIL |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | PASS |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |

## Evidence

- eval: E1
  run_id: minted-nhanh-tuc-thi-E1-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1660.306625

- eval: E2
  run_id: minted-nhanh-tuc-thi-E2-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 122.549

- eval: E3
  run_id: minted-nhanh-tuc-thi-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 122.549

- eval: E4
  run_id: minted-nhanh-tuc-thi-E4-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1660.306625

- eval: E4b
  run_id: e4b-20261031-1825
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T11:18:47Z
  screenshot: evidence/E4b-step1.png
  observed: |
    E4b-truoc.png and E4b-step1.png: the top bar reads «Đã đồng bộ · 18:27», and all five listings show 5.000.000.000 with «2 sự kiện» each (#1 created, #2 price_changed). E4b-mat-mang.png and E4b-step2.png: the top bar reads «Mất mạng · 20 thay đổi chờ gửi», and all five listings show 5.004.000.000. E4b-sau.png and E4b-step3.png: the top bar reads «Đã đồng bộ · 18:28». B-104, B-102 and B-103 show «6 sự kiện» each, with #3 to #6 as price_changed at 5.001.000.000 to 5.004.000.000. B-101 still shows «2 sự kiện» in the open history (only #1 and #2), although the price column reads 5.004.000.000. B-105 shows 6 events in the DOM readout, but it is below the fold in the screenshot. Result: the screenshots contradict the expectation that every listing has exactly 4 new events, so the eval fails.
  network_observed: clean
  output: |
    Đạt: chỉ báo «Mất mạng · 10 thay đổi chờ gửi» trước tải lại, giữ nguyên sau tải lại khi đang chặn, 0 lời gọi /api/v1 thành công trong lúc chặn, «Mất mạng · 20 thay đổi chờ gửi» sau ô thứ 20, tự về «Đã đồng bộ · 18:28» sau khoảng 3 giây khi có mạng lại. Phía máy chủ (đọc từ cơ sở dữ liệu): B-101..B-105 mỗi căn có 6 sự kiện, giá cuối 5.004.000.000, chênh trước/sau đúng 20.
    Không đạt: lịch sử hiện trong giao diện. B-101 giữ «2 sự kiện» (đáng ra 6) dù chờ hơn 30 giây; đếm trong giao diện B-104 6, B-102 6, B-103 6, B-101 2, B-105 6, tổng 26 thay vì 30, chênh 16 thay vì 20. Máy chủ có đủ 6 cho B-101, nên lịch sử trong kho trên máy (hoặc phần hiển thị) bị cũ ở căn đó.
    Ghi chú: trước lần máy chủ thử chết đầu, B-103 hiện «0 sự kiện» hai lần trong khi máy chủ giữ 2; sau khi khởi động lại hiện 2 (lịch sử trên máy chập chờn). Nút «+ Lead» bị ô tìm kiếm che một phần khi chỉ báo dài (thẩm mỹ). Bản ghi mạng và console: evidence/E4b-network.txt, evidence/E4b-console.txt.

- eval: E5
  run_id: minted-nhanh-tuc-thi-E5-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1660.306625

- eval: E6
  run_id: minted-nhanh-tuc-thi-E6-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1660.306625

- eval: E7
  run_id: minted-nhanh-tuc-thi-E7-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm run test:db -w @quy-hang/web
    ℹ duration_ms 1660.306625

- eval: E8
  run_id: minted-nhanh-tuc-thi-E8-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 122.549

- eval: E8b
  run_id: E8b-r2-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T11:18:47Z
  screenshot: evidence/E8b-step1.png
  observed: |
    may-tinh.png (1440x900, sang): thanh tren co pill chu 'Đã đồng bộ · 18:35' canh trai chuong, truoc avatar DA; 4 hang A-101, A-102, A-104, A-103 deu 5.000.000.000 Active. may-tinh-toi.png: nen toi, chu chi bao van doc ro. dien-thoai.png (375x812): thanh tren 'Quỹ hàng' + kinh lup + pill bieu tuong dam may (khong chu) + chuong. can-xem.png: chi bao do '1 căn cần xem' canh chuong, A-101 hien 6.000.000.000. bang-can-xem.png: ngan phai 'Căn cần xem', A-101, ban moi gia 6.000 trieu cua Truong nhom luc 18:35, 'Của tôi: giá 5.200 triệu', nut Giữ của tôi / Lấy bản mới. tu-choi.png: bang neu A-102, ban moi Withdrawn, 'Của tôi: trạng thái Closed', ly do 'Withdrawn không chuyển sang Closed', nut Sửa lại / Bỏ thay đổi. da-coc.png: dong do 'Căn đã cọc'. dang-xuat.png: hop thoai 'Đăng xuất?' 'Còn 2 thay đổi chưa gửi lên — đăng xuất sẽ xoá chúng khỏi máy', nut Ở lại / Vẫn đăng xuất. dang-nhap-lai.png: sau dang nhap lai, chi bao 'Đã đồng bộ · 18:42', A-101 6.000.000.000, A-104 4.800.000.000. dang-xuat-0-cho.png: trang dang nhap, dang xuat khi 0 cho khong hoi. Tat ca khop Expected.
  network_observed: clean
  output: |
    Quan sát ngoài expected (không làm eval không đạt): khi API đang bị chặn, «Vẫn đăng xuất» xoá kho cục bộ nhưng lời gọi đăng xuất tới máy chủ thất bại (lỗi chưa xử lý «Failed to fetch» tại account-menu.tsx:110); người dùng vẫn ở lại trang thử với phiên máy chủ còn sống và giao diện còn hiện hai giá đã sửa cho tới khi tải lại. Ghi nhận để chủ kho cân nhắc.
    Bản ghi mạng: evidence/E8b-network.txt.

- eval: E9
  run_id: minted-nhanh-tuc-thi-E9-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 122.549

- eval: E10
  run_id: minted-nhanh-tuc-thi-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T11:18:47Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 122.549

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-10-31T11:18:47Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-10-31T11:18:47Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-10-31T11:18:47Z

- cmd: npm run test:hooks
  run_id: minted-nhanh-tuc-thi-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-10-31T11:18:47Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-10-31T11:18:47Z

- cmd: npm run typecheck
  run_id: minted-nhanh-tuc-thi-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-10-31T11:18:47Z

- cmd: npm run lint
  run_id: minted-nhanh-tuc-thi-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-10-31T11:18:47Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature chạy máy đều red trên baseline (có phân biệt). E4b và E8b (ui-check) baseline n-a: không chạy được trên code cũ.

## Variance

none — mọi eval chạy nhiều lần đều đồng nhất (mọi eval chạy 1 lần, không phương sai)

## Iterations

Round 1: vòng đầu đã trả về cài đặt (chi tiết ở lịch sử vòng trước).
Round 2: E4b không đạt — lịch sử trong giao diện của B-101 giữ 2 sự kiện trong khi máy chủ có 6 (kho trên máy hoặc phần hiển thị lịch sử bị cũ). Trả về cài đặt.

