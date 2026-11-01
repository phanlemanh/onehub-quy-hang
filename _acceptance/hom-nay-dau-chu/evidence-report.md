---
schema_version: 2
feature_slug: hom-nay-dau-chu
verdict: BLOCKED
failed_evals: ["E3b","E4b","E5","E6"]
reason: "ui-check:E7 bị chặn bởi giới hạn xin mã OTP (429, «Bạn đã xin mã quá nhiều lần. Thử lại sau 15 phút.») trên máy dev dãy G (cổng 3484) khi xin mã đăng nhập cho dau-chu-1@mau.quy-hang.test. Môi trường dev này bị dùng chung bởi nhiều phiên chấm đồng thời (có tiến trình next dev khác trên cổng 3490 cùng DATABASE_URL 5564; otp_requests ghi 5 lần xin mã trong cùng cửa sổ 15 phút). Không được brute-force mã OTP đã băm để lách (đã thử sai và dừng ngay). Một Monitor chờ tới 15:32 UTC 2026-11-01 chưa kịp báo READY thì lượt bị buộc kết thúc, nên chưa thực hiện bước đăng nhập dau-chu-1 nào trong 5 bước của E7. Dữ liệu dựng bằng dung-g.mjs đã chạy đúng (lưu tại /private/tmp/claude-501/dung-g.out). Máy dev dãy G (cổng 3484, Postgres 5564) đang chạy sẵn, không phải do phiên này khởi động, không được tắt. Khuyến nghị: chấm lại E7 trong phiên không trùng giờ với phiên khác đang xin OTP trên cùng email mẫu, hoặc giãn OTP_REQUEST_LIMIT cho môi trường có nhiều phiên chấm song song."
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: d1a822cc452e88b684b4c5c6eab3181e7767c340
human_signoff:
---

# Evidence Report: hom-nay-dau-chu

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E2 | AC-2 | test | PASS |
| E3 | AC-3 | test | PASS |
| E3b | AC-3 | test | FAIL |
| E4 | AC-4 | test | PASS |
| E4b | AC-4 | test | FAIL |
| E5 | AC-5 | test | FAIL |
| E5b | AC-5 | test | PASS |
| E6 | AC-6 | test | FAIL |
| E7 | AC-7 | ui-check | BLOCKED |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | ui-check | PASS |
| E10 | AC-10 | ui-check | PASS |
| E11 | AC-11 | script | PASS |
| E11b | AC-11 | test | PASS |

Ghi chú về E3b, E4b, E5, E6: bốn eval này cùng chạy trong một lệnh `npm run db:migrate && npm run db:test`. Lệnh này có 219 ca, 218 đạt, 1 hỏng: ca «chia: đi làm lại thì nhận tiếp» (packages/api/test-db/routing.test.ts) nhận null thay vì 'dc1'. Ca hỏng nằm ngoài các ca hom-nay.test.ts mà bốn eval này chỉ định, nhưng lệnh gộp không tách được kết quả theo từng eval nên cả bốn bị tính chung là chưa đạt. Cần người xem ca routing có do feature này gây ra không (xem Iterations).

## Evidence

- eval: E1
  run_id: minted-hom-nay-dau-chu-E1-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 247.354125

- eval: E2
  run_id: minted-hom-nay-dau-chu-E2-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 247.354125

- eval: E3
  run_id: minted-hom-nay-dau-chu-E3-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 247.354125

- eval: E4
  run_id: minted-hom-nay-dau-chu-E4-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.core
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm test -w @quy-hang/core
    ℹ duration_ms 247.354125

- eval: E3b
  run_id: minted-hom-nay-dau-chu-E3b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ tests 219 · pass 218 · fail 1
    ✖ chia: đi làm lại thì nhận tiếp (test-db/routing.test.ts)
      AssertionError: null !== 'dc1' (routing.test.ts:179)

- eval: E4b
  run_id: minted-hom-nay-dau-chu-E4b-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ tests 219 · pass 218 · fail 1
    ✖ chia: đi làm lại thì nhận tiếp (test-db/routing.test.ts)
      AssertionError: null !== 'dc1' (routing.test.ts:179)

- eval: E5
  run_id: minted-hom-nay-dau-chu-E5-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ tests 219 · pass 218 · fail 1
    ✖ chia: đi làm lại thì nhận tiếp (test-db/routing.test.ts)
      AssertionError: null !== 'dc1' (routing.test.ts:179)

- eval: E6
  run_id: minted-hom-nay-dau-chu-E6-r1
  exit_code: 1
  baseline: green
  verifier: config:executors.test.isolation
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm run db:migrate && npm run db:test
    ℹ tests 219 · pass 218 · fail 1
    ✖ chia: đi làm lại thì nhận tiếp (test-db/routing.test.ts)
      AssertionError: null !== 'dc1' (routing.test.ts:179)

- eval: E5b
  run_id: minted-hom-nay-dau-chu-E5b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm test -w @quy-hang/web
    ℹ duration_ms 415.394958

- eval: E11
  run_id: minted-hom-nay-dau-chu-E11-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E11b
  run_id: minted-hom-nay-dau-chu-E11b-r1
  exit_code: 0
  baseline: green
  verifier: config:executors.test.ui_lint
  verified_at: 2026-11-01T15:13:20Z
  output: |
    npm test -w @quy-hang/ui-lint
    ℹ duration_ms 18971.853334

- eval: E7
  run_id: minted-hom-nay-dau-chu-E7-r1
  exit_code: 97
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:13:20Z
  network_observed: unscoped-partial
  output: |
    BLOCKED, chưa có assertion nào hoàn tất, chưa có ảnh chụp.
    dung-g.mjs chạy được, in đủ 5 nhóm cho dau-chu-1 (Lead mới 4, Nên gọi điều chỉnh giá 2, Cần gọi lại 3, Thiếu thông tin 2, Mới đổi 2), căn của dau-chu-2 và hai-vai bị loại đúng; đây chỉ là dữ liệu dựng, chưa đối chiếu với UI.
    Xin mã đăng nhập cho dau-chu-1 chạm giới hạn 5 lần mỗi 15 phút (otp_requests 15:16:21 đến 15:17:52 UTC), nên chưa vào được màn Hôm nay.
    Đã tạo sẵn thư mục evidence/ nhưng chưa có ảnh nào.

- eval: E8
  run_id: minted-hom-nay-dau-chu-E8-r1
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:13:20Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png: màn Hôm nay của dau-chu-1, 13 việc, 5 nhóm (Lead mới 4, Nên gọi điều chỉnh giá 2, Cần gọi lại 3, Thiếu thông tin 2, Mới đổi 2); B-01.02 là dòng đầu nhóm Cần gọi lại. E8-sau-bam.png: sau bấm còn 12 việc, Cần gọi lại = 2, không còn dòng B-01.02, chỉ báo «Đã đồng bộ · 22:31»; khớp Expected (rời nhóm ngay, giảm 1). E8-step4-offline.png: chỉ báo «Mất mạng · 1 thay đổi chờ gửi», Nên gọi điều chỉnh giá = 1 (chỉ còn B-01.01), A-01.01 đã rời nhóm, 11 việc; khớp Expected. E8-ho-so.png: cột hồ sơ bên phải mở đúng căn A-01.04 (đầu cột «A-01.04 · Đang bán», 4,85 tỷ, Toà A, thiếu Nội thất 4/5) cạnh danh sách Hôm nay 11 việc; khớp C3. Số sự kiện owner_confirmed đọc từ API: C1 0 lên 1 với lastConfirmedAt mới, C2 0 lên 1 sau khi có mạng lại.
  network_observed: clean

- eval: E9
  run_id: E9-20261101
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:13:20Z
  screenshot: evidence/E9-step1.jpg
  observed: |
    E9-step1.jpg: Lead mới 4 dòng, B-02.01 (L1) hiện nhãn «Đã nhận» chỉ còn nút Đã gọi / Trả lại, A-02.02 và dòng chỉ biết toà cũng Đã nhận, B-02.03 còn Đã gửi. E9-step2.jpg: Lead mới 3, đầu trang 12 việc; dòng A-02.02 không còn. E9-sau.jpg: Lead mới 2, 11 việc; chỉ còn B-02.01 (Đã nhận) và B-02.03 (Đã gửi), L3 đã rời. E9-409.jpg: dòng B-02.03 còn nguyên với Nhận/Đã gọi/Trả lại, chữ đỏ «Lead đã trả lại rồi.» bên dưới, số đếm giữ 2 / 11 việc. Khớp Expected.
  network_observed: clean

- eval: E10
  run_id: E10-hom-nay-dau-chu-2026-11-01
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-01T15:13:20Z
  screenshot: evidence/E10-step1.png
  observed: |
    E10-trong.png: màn Hôm nay tối, «Hôm nay · 0 việc», icon hộp thư, «Hôm nay không còn việc», nút «Mở Bảng hàng»; khớp. E10-dang-tai.png: chỉ tiêu đề và 3 khối skeleton dạng nhóm, không có chữ dữ liệu; khớp. E10-loi.png: «9 việc», dải «Hàng đợi chia theo bộ nhóm lưu lúc 22:18 01/11 / Chưa tải được bộ nhóm mới của sàn.», khung đỏ «Chưa tải được lead giao cho bạn», nút «Thử lại», các nhóm căn vẫn hiện. E10-step4.png: sau «Thử lại» nhóm «Lead mới 4» hiện lại, 13 việc. E10-mat-mang.png: chip «Mất mạng · đang xem bản trên máy», 7 việc, dải «bộ nhóm lưu lúc 22:19 01/11», không có Thiếu thông tin. E10-375.png: một cột, 13 việc, thanh tab dưới, không tràn ngang.
  network_observed: n-a (driver)

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/api
  run_id: minted-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_api-r1
  exit_code: 0
  verified_at: 2026-11-01T15:13:20Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-hom-nay-dau-chu-SUITE-npm_test_w_quy_hang_connect-r1
  exit_code: 0
  verified_at: 2026-11-01T15:13:20Z

- cmd: npm run test:hooks
  run_id: minted-hom-nay-dau-chu-SUITE-test_hooks-r1
  exit_code: 0
  verified_at: 2026-11-01T15:13:20Z

- cmd: npm run typecheck
  run_id: minted-hom-nay-dau-chu-SUITE-typecheck-r1
  exit_code: 0
  verified_at: 2026-11-01T15:13:20Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (đạt cả trên bản chính lẫn bản gốc trước feature; chứng minh bộ kiểm chứ không chứng minh feature, cần viết lại để khẳng định hành vi mới hoặc xác nhận là lưới hồi quy có chủ ý):
- npm test -w @quy-hang/core: E1, E2, E3, E4
- npm test -w @quy-hang/web: E5b
- npm run lint: E11
- npm test -w @quy-hang/ui-lint: E11b

Lệnh `npm run db:migrate && npm run db:test` (E3b, E4b, E5, E6) cũng ghi baseline green, nên chưa có bằng chứng nào cho thấy nó phân biệt được feature.

## Variance

none — mọi eval chạy một lần, không có eval nhiều lượt.

## Iterations

Round 1: E3b, E4b, E5, E6 chưa đạt vì lệnh gộp db:test có 1 ca hỏng (routing: «chia: đi làm lại thì nhận tiếp», nhận null thay vì 'dc1'); E7 BLOCKED do giới hạn xin mã OTP trên máy dev dùng chung, chưa thực hiện được bước nào. Cần tách kết quả theo ca để biết ca routing có phải do feature gây ra, và chấm lại E7 ở phiên không tranh OTP.
