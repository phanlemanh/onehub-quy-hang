---
schema_version: 2
feature_slug: nhanh-tuc-thi
verdict: REJECT
failed_evals: ["E4b","E8b"]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c51b3b55708070d978ab3ca5bef08778272b2514
human_signoff:
---

# Evidence Report: nhanh-tuc-thi

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | ui-check | REJECT |
| E5 | AC-5 | test | PASS |
| E6 | AC-6 | test | PASS |
| E7 | AC-7 | test | PASS |
| E8 | AC-8 | test | PASS |
| E8b | AC-8 | ui-check | REJECT |
| E9 | AC-9 | test | PASS |
| E10 | AC-10 | test | PASS |

Lệnh fail không gắn eval: không có. Hai lệnh ui-check thất bại đều gắn eval của chúng (ui-check:E4b gắn E4b, ui-check:E8b gắn E8b).

## Evidence

- eval: E1
  run_id: minted-nhanh-tuc-thi-E1-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm run test:db -w @quy-hang/web (chung với E4, E5, E6, E7)
    ℹ duration_ms 1422.877083

- eval: E2
  run_id: minted-nhanh-tuc-thi-E2-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm test -w @quy-hang/web (chung với E3, E8, E9, E10)
    ℹ duration_ms 89.729459

- eval: E3
  run_id: minted-nhanh-tuc-thi-E3-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm test -w @quy-hang/web (chung với E2, E8, E9, E10)
    ℹ duration_ms 89.729459

- eval: E4
  run_id: minted-nhanh-tuc-thi-E4-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm run test:db -w @quy-hang/web (chung với E1, E5, E6, E7)
    ℹ duration_ms 1422.877083

- eval: E4b
  run_id: E4b-20261031
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T10:52:46Z
  screenshot: evidence/E4b-step1.png
  observed: |
    E4b-truoc.png (đọc): thanh trên «Đã đồng bộ · 17:58»; sáu căn (A-1202, 1205, 1201, 1204, 1203, 1206), năm căn đầu mở lịch sử, mỗi căn «2 sự kiện» (created, price_changed); giá 5.200/5.500/5.100/5.400/5.300 triệu. E4b-mat-mang.png (đọc): chỉ báo «Mất mạng · 20 thay đổi chờ gửi»; giá 5.204/5.504/5.104/5.404/5.304 triệu (cũ+4). Số «10 thay đổi chờ gửi» đọc bằng DOM trước và sau tải lại (tải lại khi đang chặn vẫn hiện danh sách và giá cũ+2; không có ảnh riêng). E4b-sau.png (đọc), chụp sau hơn 60 giây từ lúc bỏ chặn: chỉ báo vẫn «Mất mạng · 20 thay đổi chờ gửi», dù mạng đã có lại và máy chủ đã nhận 20 sự kiện. Chỉ báo về «Đã đồng bộ · 18:01» muộn hơn, khoảng 80–95 giây (đọc DOM sau khi bấm Lịch sử). Sau đó lịch sử mỗi căn trong năm căn đầu là «6 sự kiện» (2 + 4), giá cuối = giá cũ + 4 triệu; máy chủ có 6 sự kiện mỗi căn. Đối chứng trước và sau: 2 so với 6, mỗi căn +4, tổng +20, đúng. Điểm lệch so với Expected: không tự về «Đã đồng bộ» trong 60 giây.
  network_observed: clean
  output: |
    DỰNG: bản sao tạm apps/web-e4b (đã xoá) trên cổng 3475 vì cổng 3462 bị máy chủ khác chiếm; Postgres dãy N 5551, cơ sở dữ liệu riêng e4b_verify; 6 căn [Toà mẫu] qua API. Khổ 1440x900, Playwright.
    PASS: Bước 1 chỉ báo «Đã đồng bộ · 17:58», 5 căn đầu mỗi căn 2 sự kiện.
    PASS: sau ô thứ 10 chỉ báo «Mất mạng · 10 thay đổi chờ gửi».
    PASS: tải lại khi đang chặn vẫn hiện danh sách, giá cũ+2, chỉ báo vẫn «Mất mạng · 10 thay đổi chờ gửi».
    PASS: 0 lời gọi /api/v1 thành công từ lúc chặn đến sau tải lại.
    PASS: sau ô thứ 20 chỉ báo «Mất mạng · 20 thay đổi chờ gửi»; giá năm căn = cũ+4 triệu.
    FAIL: sau khi bỏ chặn, không bấm gì, chờ 60,27 giây chỉ báo vẫn «Mất mạng · 20 thay đổi chờ gửi»; máy chủ đã nhận đủ 20 sự kiện nhưng chỉ báo chỉ về «Đã đồng bộ · 18:01» muộn hơn, khoảng 80–95 giây. Expected đòi trong 60 giây.
    PASS: mỗi căn đúng +4 sự kiện (2 lên 6), tổng +20, giá cuối = cũ+4 triệu; máy chủ có 6 sự kiện mỗi căn.
    Khung đã lưu: E4b-step1.png, E4b-step2.png, E4b-step3.png, E4b-step3-lich-su.png (chưa đọc lại bằng Read), E4b-truoc.png, E4b-mat-mang.png, E4b-sau.png trong evidence/. Nhật ký mạng: E4b-network.txt.

- eval: E5
  run_id: minted-nhanh-tuc-thi-E5-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm run test:db -w @quy-hang/web (chung với E1, E4, E6, E7)
    ℹ duration_ms 1422.877083

- eval: E6
  run_id: minted-nhanh-tuc-thi-E6-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm run test:db -w @quy-hang/web (chung với E1, E4, E5, E7)
    ℹ duration_ms 1422.877083

- eval: E7
  run_id: minted-nhanh-tuc-thi-E7-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web_db
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm run test:db -w @quy-hang/web (chung với E1, E4, E5, E6)
    ℹ duration_ms 1422.877083

- eval: E8
  run_id: minted-nhanh-tuc-thi-E8-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm test -w @quy-hang/web (chung với E2, E3, E9, E10)
    ℹ duration_ms 89.729459

- eval: E8b
  run_id: minted-nhanh-tuc-thi-E8b-r1
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-10-31T10:52:46Z
  screenshot: evidence/E8b-may-tinh.png
  observed: |
    Đã mở và đọc từng ảnh. E8b-may-tinh.png (1440x900, sáng): thanh trên có chữ «Đã đồng bộ · 17:56» ở bên trái chuông, trước avatar DA, đọc rõ. E8b-may-tinh-toi.png: tối vẫn đọc rõ. E8b-dien-thoai.png (375x812): thanh trên chỉ có biểu tượng đám mây trong viên thuốc, cạnh chuông, không có chữ; nhãn trợ năng (aria-label) là «Đã đồng bộ · 17:56». E8b-can-xem.png: chỉ báo đỏ «1 căn cần xem» (chỉ hiện sau khi tải lại trang). E8b-bang-can-xem.png: bảng «Căn cần xem» nêu căn A-104; «Bản mới: giá 6.500 triệu · trạng thái Active — người khác sửa lúc 17:59»; «Của tôi: giá 5.200 triệu»; hai nút «Giữ của tôi», «Lấy bản mới». Bảng chỉ ghi «người khác», không có tên người sửa. Bấm «Lấy bản mới» thì chỉ báo tự đổi sang «Đã đồng bộ · 18:00» và hộp đóng. E8b-chi-bao-treo.png: sau khi bỏ chặn mạng, chỉ báo vẫn «Mất mạng · 1 thay đổi chờ gửi», dù kho IndexedDB đã có mục cần xem và hàng đợi rỗng. E8b-tu-choi.png: bảng nêu A-102, bản mới là Withdrawn, của tôi là trạng thái Closed, «Lý do: Withdrawn không chuyển sang Closed», có «Sửa lại» và «Bỏ thay đổi». Bấm «Bỏ thay đổi» thì chỉ báo về «Đã đồng bộ · 18:03». E8b-da-coc.png: bảng nêu A-101 với dòng đỏ «Căn đã cọc», bản mới Pending, của tôi giá 4.800 triệu. E8b-dang-xuat.png: hộp thoại «Đăng xuất?», «Còn 2 thay đổi chưa gửi lên — đăng xuất sẽ xoá chúng khỏi máy», nút «Ở lại», «Vẫn đăng xuất». E8b-dang-xuat-0-cho.png: sau khi đăng xuất với 0 thay đổi chờ, trang đăng nhập. Sai lệch so với Expected: (1) khi chờ sau bỏ chặn, chỉ báo không tự đổi, kẹt ở «Mất mạng · n thay đổi chờ gửi» ít nhất 3 phút và chỉ đổi sau khi tải lại; xảy ra cả ở ca đụng nhau, từ chối và đã cọc; (2) bảng không nêu tên người sửa, chỉ «người khác» và giờ.
  network_observed: app-fail
  output: |
    ĐỰNG: máy chủ dev cổng 3462 do verifier bật, Postgres dãy N cổng 5551, 4 căn Active A-101..A-104 qua API; hai cửa sổ cách ly (Đầu chủ dau-chu-1; Trưởng nhóm truong-nhom). Đã tắt máy chủ khi xong.
    PASS máy tính 1440x900: chỉ báo bằng chữ «Đã đồng bộ · 17:56», sáng và tối đều đọc được.
    PASS điện thoại 375x812: chỉ báo có mặt (biểu tượng); nhãn trợ năng «Đã đồng bộ · 17:56».
    FAIL đụng nhau: sau bỏ chặn, chỉ báo giữ «Mất mạng · 1 thay đổi chờ gửi» trên 50 giây dù IndexedDB có review kind=dung-nhau, queue=[], lastAttempt=ok; chỉ đổi sang «1 căn cần xem» sau khi tải lại trang.
    FAIL một phần: giá người kia chỉ ghi «người khác … lúc 17:59», không có tên như Expected.
    PASS «Lấy bản mới» đưa chỉ báo về «Đã đồng bộ · 18:00»; giá trên máy 6.500.000.000.
    PASS từ chối: bảng nêu A-102, thay đổi «trạng thái Closed», lý do của lõi, có «Bỏ thay đổi»; bấm xong chỉ báo về «Đã đồng bộ · 18:03» (dùng căn A-102 thay vì căn thứ hai do dữ liệu lần chạy đầu hỏng).
    PASS đã cọc: bảng nêu «Căn đã cọc» (A-101, giá 4.800 triệu của tôi); dùng A-101 thay vì căn thứ ba theo thứ tự.
    PASS đăng xuất: hộp thoại nêu 2 thay đổi; «Ở lại» giữ «Mất mạng · 2 thay đổi chờ gửi»; «Vẫn đăng xuất» thì indexedDB.databases() rỗng; đăng nhập lại hai ô mang giá máy chủ, chỉ báo «Đã đồng bộ · 18:05» (chưa chạy đúng bước nhập mã lại vì phiên còn sống do API bị chặn lúc đăng xuất).
    PASS đăng xuất khi 0 chờ: không hỏi, về trang đăng nhập, indexedDB.databases() rỗng.
    Nhật ký máy chủ dev có 184 lần «unhandledRejection: ReferenceError: indexedDB is not defined» từ src/lib/sync/dong-bo.ts qua mang.ts (bộ đếm giờ chạy phía máy chủ khi dựng trang); xếp vào app-fail. Các mã 4xx còn lại đều mong đợi (xung đột, từ chối chuyển trạng thái, lỗi dựng dữ liệu của chính verifier); không có 5xx.
    Khung đã lưu trong evidence/: E8b-may-tinh.png, E8b-may-tinh-toi.png, E8b-dien-thoai.png, E8b-chi-bao-treo.png, E8b-can-xem.png, E8b-bang-can-xem.png, E8b-tu-choi.png, E8b-da-coc.png, E8b-dang-xuat.png, E8b-dang-xuat-0-cho.png, E8b-network.txt.
    Kết luận của verifier: hai lỗi: (1) chỉ báo trên thanh trên không tự cập nhật sau khi có mạng lại, phải tải lại; (2) bảng Cần xem thiếu tên người sửa.

- eval: E9
  run_id: minted-nhanh-tuc-thi-E9-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm test -w @quy-hang/web (chung với E2, E3, E8, E10)
    ℹ duration_ms 89.729459

- eval: E10
  run_id: minted-nhanh-tuc-thi-E10-r1
  exit_code: 0
  baseline: red
  verifier: config:executors.test.web
  verified_at: 2026-10-31T10:52:46Z
  output: |
    npm test -w @quy-hang/web (chung với E2, E3, E8, E9)
    ℹ duration_ms 89.729459

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_core-r1
  exit_code: 0
  verified_at: 2026-10-31T10:52:46Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-10-31T10:52:46Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-10-31T10:52:46Z

- cmd: npm run test:hooks
  run_id: minted-nhanh-tuc-thi-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-10-31T10:52:46Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-nhanh-tuc-thi-SUITE-npm_test_w_quy_hang_ui_lint-r1
  exit_code: 0
  verified_at: 2026-10-31T10:52:46Z

- cmd: npm run typecheck
  run_id: minted-nhanh-tuc-thi-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-10-31T10:52:46Z

- cmd: npm run lint
  run_id: minted-nhanh-tuc-thi-SUITE-lint-r1
  exit_code: 0
  verified_at: 2026-10-31T10:52:46Z

## Known limits

## Ngoài hợp đồng

## Analyst

none — mọi eval feature đều red trên baseline (có phân biệt). Hai eval ui-check E4b và E8b không đo được trên baseline (n-a).

## Variance

none — mọi eval chạy nhiều lần đều đồng nhất (mọi eval chạy 1 lần, xác định).

## Iterations

Round 1: E4b, E8b thất bại. E4b: chỉ báo không tự về «Đã đồng bộ» trong 60 giây sau khi có mạng lại (về sau khoảng 80–95 giây). E8b: chỉ báo kẹt «Mất mạng · n thay đổi chờ gửi» sau khi có mạng lại cho đến khi tải lại trang, và bảng Cần xem không nêu tên người sửa. Quay lại bước triển khai.

