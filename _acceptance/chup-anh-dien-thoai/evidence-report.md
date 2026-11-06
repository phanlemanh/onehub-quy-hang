---
schema_version: 2
feature_slug: chup-anh-dien-thoai
verdict: REJECT
failed_evals: [E12]
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: 145215dc62926618cb084dc1d94dd2db8557d750
human_signoff:
---

# Evidence Report: chup-anh-dien-thoai

Vòng 2. Khung hình của E12 đúng như mong đợi, nhưng bước kiểm mạng thấy lời gọi lỗi trong phạm vi ứng dụng mà expected không khai, nên E12 hỏng theo luật mạng. Lệnh hỏng không gắn eval nào khác: ui-check:E12 (chỉ E12).

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-4 | test | PASS |
| E6 | AC-5 | test | PASS |
| E7 | AC-6 | test | PASS |
| E8 | AC-7 | test | PASS |
| E9 | AC-8 | test | PASS |
| E10 | AC-9 | script | PASS |
| E11 | AC-9 | test | PASS |
| E12 | AC-10 | ui-check | FAIL |
| E13 | AC-1 | ui-check | PASS |
| E14 | AC-2 | ui-check | PASS |
| E15 | AC-4 | ui-check | PASS |
| E16 | AC-5 | ui-check | PASS |
| E17 | AC-5 | script | PASS |
| E18 | AC-3 | ui-check | PASS |
| E19 | AC-6 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-chup-anh-dien-thoai-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/web: duration_ms 3242.455333

- eval: E2
  run_id: minted-chup-anh-dien-thoai-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/web: duration_ms 3242.455333

- eval: E3
  run_id: minted-chup-anh-dien-thoai-E3-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/web: duration_ms 3242.455333

- eval: E4
  run_id: minted-chup-anh-dien-thoai-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/web: duration_ms 3242.455333

- eval: E5
  run_id: minted-chup-anh-dien-thoai-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.api
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/api: duration_ms 861.057333

- eval: E6
  run_id: minted-chup-anh-dien-thoai-E6-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/core: duration_ms 915.573583

- eval: E7
  run_id: minted-chup-anh-dien-thoai-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/web: duration_ms 3242.455333

- eval: E8
  run_id: minted-chup-anh-dien-thoai-E8-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/web: duration_ms 3242.455333

- eval: E9
  run_id: minted-chup-anh-dien-thoai-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/web: duration_ms 3242.455333

- eval: E10
  run_id: minted-chup-anh-dien-thoai-E10-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.design.khuon
  verified_at: 2026-11-06T04:32:49Z
  output: |
    12 tệp giao diện ngoài bản đồ

- eval: E11
  run_id: minted-chup-anh-dien-thoai-E11-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm test -w @quy-hang/ui-lint: duration_ms 42207.186541

- eval: E12
  run_id: minted-chup-anh-dien-thoai-E12-r2
  exit_code: 1
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:32:49Z
  screenshot: evidence/E12-truoc.png
  observed: |
    Đã mở từng ảnh 375×812. (1) E12-truoc: ảnh lớn xám «Chưa có ảnh», nút «Chụp ảnh» góc trên phải. (2) E12-chon-ngan: ngăn «Chụp ảnh · A-03.03», hai nút ngăn «Gửi được»/«Nội bộ», «Mở máy ảnh» xám dính đáy. (3) E12-cho-mang: khối «Mất mạng», ba dòng «Chờ mạng — tự tải khi có mạng» (Nội bộ có ổ khoá). (4) E12-da-tai: ba dòng «Đã tải lên». (5) E12-anh-lon: ảnh lớn «1/3». (6) E12-dau-khach: không có nút «Chụp ảnh», bộ đếm «1/2», có «Hỏi đầu chủ». (7) E12-tai-lai: sau tải lại còn đúng ba dòng «Chờ mạng» (IndexedDB giữ ảnh). (8) E12-tai-lai-da-tai: ba dòng «Đã tải lên»; DB căn A-04.01 có Gửi được 2, Nội bộ 1, đúng ba dòng mới. Khung hình khớp expected. Sai khác với bước chữ: lúc tải lại không thể chặn bằng chế độ offline của trình duyệt nên chặn bằng lớp bọc window.fetch trong trang (mô phỏng). Phần kiểm mạng của ứng dụng thấy lỗi máy chủ ở lời gọi đăng nhập và danh mục (từ lần chạy lỗi phiên giữa chừng) và hai lời xin tải lên bị từ chối vì trùng khi tải lại ở A-04.01 (DB vẫn đúng ba dòng, không trùng); expected không khai các lỗi này nên eval hỏng theo luật mạng dù khung hình đúng. Hai lần chạy thử đầu ở A-03.06 làm bẩn căn đó nên bỏ, dùng A-04.01.
  network_observed: app-fail

- eval: E13
  run_id: minted-chup-anh-dien-thoai-E13-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:32:49Z
  screenshot: evidence/E13-step1.html
  observed: |
    Đã mở E13-step1.html, E13-mang.txt, E13-network.txt. Căn mẫu Toà A / A-03.02, số dòng trước là 1. Hai lời gọi của dau-khach đều bị từ chối với lý do listing-agent-required, số dòng sau vẫn là 1. Hai lời gọi của dau-chu-1 thành công liên tiếp, số dòng sau là 2, tăng đúng 1. Khớp expected.
  network_observed: n-a (driver)

- eval: E14
  run_id: minted-chup-anh-dien-thoai-E14-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:32:49Z
  screenshot: evidence/E14-db.txt
  observed: |
    Đã mở E14-db.txt. Truy vấn unit_photos cho Toà A / A-04.01 trả 3 dòng: shareable (thứ tự 0), shareable (thứ tự 1), internal (thứ tự 0), đều đúng building_name và unit_number, chưa gỡ. Đếm theo ngăn: shareable 2, internal 1. unit_photo_events kiểu added có 3 dòng, payload.compartment lần lượt shareable, shareable, internal, khớp ngăn của ảnh. Khớp expected.
  network_observed: n-a (driver)

- eval: E15
  run_id: minted-chup-anh-dien-thoai-E15-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:32:49Z
  screenshot: evidence/E15-step1.png
  observed: |
    E15-step1.png (mất mạng): ngăn «Chụp ảnh · A-03.04, Toà A», khối «Mất mạng», ba dòng Gửi được, Gửi được, Nội bộ (có khoá), mỗi dòng «Chờ mạng — tự tải khi có mạng». E15-step2.png (sau khi mở mạng): ba dòng đều «Đã tải lên», ảnh lớn phía sau đã hiện ảnh vừa tải. E15-db.txt: trước 0 dòng, lúc offline 0 dòng, sau 3 dòng, ba mã khác nhau, ba sự kiện added, không mã trùng. Phản hồi xác nhận đầu bị chặn sau khi máy chủ đã ghi; ảnh 1 được đối chiếu qua danh sách thay vì gửi lặp. Khớp expected.
  network_observed: clean

- eval: E16
  run_id: minted-chup-anh-dien-thoai-E16-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:32:49Z
  screenshot: evidence/E16-step2.png
  observed: |
    E16-step2.png (trang khách /s/KAkmNxwDKQWc, không đăng nhập): đúng một ảnh bìa, tiêu đề «Toà A · A-04.01», «3,25 tỷ Bao phí», nút «Quan tâm»; HTML chứa mã ảnh bìa Gửi được và không chứa mã ảnh Nội bộ. E16-step3.png (dau-khach): hồ sơ A-04.01, bộ đếm «1/2», không có nút «Chụp ảnh»; không phản hồi mạng nào chứa mã ảnh Nội bộ. E16-step4.png (dau-chu-1): cùng hồ sơ, bộ đếm «1/3», có nút «Chụp ảnh»; bộ dò bắt được mã ảnh Nội bộ (đối chứng dương đạt). Khớp expected.
  network_observed: clean

- eval: E17
  run_id: minted-chup-anh-dien-thoai-E17-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.ro_ri
  verified_at: 2026-11-06T04:32:49Z
  output: |
    npm run test:ro-ri: duration_ms 1110.720334

- eval: E18
  run_id: e18-verifier-2026-11-06
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:32:49Z
  screenshot: evidence/E18-hom-nay.png
  observed: |
    E18-step1.png (mã thật, A-04.02): ngăn chụp mở trên nền hồ sơ, ngăn «Gửi được», hai mục ảnh thu nhỏ, mỗi mục nhãn vàng «Chờ mạng — tự tải khi có mạng». E18-step2.png: màn «Hôm nay» khi vẫn chặn mạng, đã rời hồ sơ. E18-hom-nay.png: vẫn ở «Hôm nay» sau khi mở mạng 20 giây, DB đếm 2 dòng mới. Đối chứng (A-02.06): ảnh chờ mất theo thành phần, DB không thêm dòng. Không khung nào mâu thuẫn expected. Sai khác: chặn mạng ở tầng Fetch thay cho chế độ offline của trình duyệt vì chế độ này không cho tới được màn «Hôm nay».
  network_observed: clean

- eval: E19
  run_id: minted-chup-anh-dien-thoai-E19-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-06T04:32:49Z
  screenshot: evidence/E19-step1.png
  observed: |
    E19-con.png (375px, sau tải lại không đăng xuất): ngăn «Chụp ảnh · A-04.01» còn hai dòng, một Gửi được và một Nội bộ có khoá, đều «Chờ mạng — tự tải khi có mạng» (đối chứng dương đạt). E19-dang-xuat.png: trang «Đăng nhập Quỹ hàng», đã đăng xuất; danh sách IndexedDB rỗng theo E19-idb.txt. E19-nguoi-b.png: ngăn rỗng với chữ «Chưa chụp ảnh nào cho căn này.», không dòng «Chờ mạng». E19-step1.png và E19-menu.png không mở lại bằng Read.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/connect
  run_id: minted-chup-anh-dien-thoai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-06T04:32:49Z

- cmd: npm run test:hooks
  run_id: minted-chup-anh-dien-thoai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-06T04:32:49Z

- cmd: npm run typecheck
  run_id: minted-chup-anh-dien-thoai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-06T04:32:49Z

- cmd: npm run lint
  run_id: minted-chup-anh-dien-thoai-SUITE-lint-r2
  exit_code: 0
  verified_at: 2026-11-06T04:32:49Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả mã đang xét lẫn mã nền, chứng minh khung kiểm chứ chưa chứng minh tính năng; cần viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3, E4, E7, E8, E9
- npm test -w @quy-hang/api: E5
- npm test -w @quy-hang/core: E6
- design-floor-khuon --kiem: E10
- npm test -w @quy-hang/ui-lint: E11
- npm run test:ro-ri: E17

Baseline không đo: E12, E13, E14, E15, E16, E18, E19 (eval ui-check, baseline n-a, chạy trên mã nền không có ý nghĩa vì tính năng chưa có).

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, không eval nào có phương sai).

## Iterations

Round 1: E15, E16 bị loại — hợp đồng có năm lỗi, đã sửa ở commit 145215dc. Quay lại dựng.
Round 2: E12 bị loại — khung hình đúng nhưng bước kiểm mạng thấy lỗi trong phạm vi ứng dụng mà expected không khai (lỗi đăng nhập và danh mục từ lần chạy lỗi giữa chừng, cùng hai lời xin tải lên bị từ chối khi tải lại). Hai lỗi trong hợp đồng (AC-4, AC-6) nêu ở review-findings.md. Quay lại dựng.

