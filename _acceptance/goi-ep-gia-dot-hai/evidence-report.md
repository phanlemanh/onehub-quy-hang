---
schema_version: 2
feature_slug: goi-ep-gia-dot-hai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: c71013a2b6171fd696475cd605a03cf6158d32ea
human_signoff:
---

# Evidence Report: goi-ep-gia-dot-hai

| Eval | Criterion | Executor | Verdict |
|---|---|---|---|
| E1 | AC-1 | test | PASS |
| E1b | AC-1 | ui-check | PASS |
| E2 | AC-2 | test | PASS |
| E2b | AC-2 | ui-check | PASS |
| E3 | AC-3 | test | PASS |
| E3a | AC-3 | test | PASS |
| E3b | AC-3 | ui-check | PASS |
| E4 | AC-4 | test | PASS |
| E5 | AC-5 | test | PASS |
| E5b | AC-5 | ui-check | PASS |
| E5c | AC-5 | ui-check | PASS |
| E6 | AC-6 | ui-check | PASS |
| E7 | AC-7 | test | PASS |
| E7b | AC-7 | ui-check | PASS |
| E8 | AC-8 | ui-check | PASS |
| E9 | AC-9 | script | PASS |
| E9a | AC-9 | test | PASS |
| E9b | AC-9 | ui-check | PASS |
| E10 | AC-10 | test | PASS |
| E10b | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-ep-gia-dot-hai-E1-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm test -w @quy-hang/web chạy xanh, gồm ca «ép giá: đầu màn».
    ℹ duration_ms 1094.852083

- eval: E1b
  run_id: minted-goi-ep-gia-dot-hai-E1b-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E1b-1440.png
  observed: |
    E1b-1440.png (/units/call?hang=P1, 1440x900): breadcrumb Hôm nay > Gọi ép giá; thẻ có «Nên gọi ép giá», «Đang bán», tiêu đề «A-24.01 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước»; dưới là «Kết quả cuộc gọi» (H, G, B, K), «Lịch sử trả giá» 4 dòng, «Giá đáy chủ từng nói · nội bộ 2,7 tỷ», «Danh sách hỏi». Khớp Expected.
    E1b-khong-thay.png: breadcrumb Gọi ép giá, một thẻ «Không thấy căn này trong kho của bạn» và nút «Về Hôm nay». Khớp.
    E1b-step3.png (?lead=L1): chế độ khai thác, thẻ lead (54,2 m², tầng 9, hướng Đông Nam, chủ muốn 2,6 tỷ đã bao phí, nút «Đã gọi G»), «Danh sách hỏi Mức đủ 0/5», không có thẻ ép giá. Khớp. step1 trùng 1440, step2 trùng khong-thay.
  network_observed: clean

- eval: E2
  run_id: minted-goi-ep-gia-dot-hai-E2-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm test -w @quy-hang/web chạy xanh, gồm ca «lịch sử trả giá: ma trận sự kiện».
    ℹ duration_ms 1094.852083

- eval: E2b
  run_id: E2b-20261103
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E2b-step1.png
  observed: |
    E2b-step1.png, /units/call?hang=P1 (A-24.01, đầu chủ dau-chu-1): «Lịch sử trả giá» có 4 dòng, mới nhất trên: «Còn · giữ giá · đã xác nhận với chủ» · Đầu chủ · 00:08 19/10; «Hạ 2,95 tỷ → 2,8 tỷ · không bao phí · đã xác nhận với chủ» · 11/10; «Lên bảng 2,95 tỷ · không bao phí · đã xác nhận với chủ» · 26/09; «Tạo hồ sơ» · 24/09 không nhãn xác nhận. Khớp dãy dựng, có ngày giờ, điều kiện phí, nhãn đúng dòng; dưới có giá đáy nội bộ 2,7 tỷ.
    E2b-step2.png: bật offline không tải lại, đầu màn có dải «Đang xem bản đã tải — mất mạng», khối lịch sử còn nguyên 4 dòng y hệt bước 1. Khớp Expected.
  network_observed: clean

- eval: E3
  run_id: minted-goi-ep-gia-dot-hai-E3-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm run db:migrate && npm run db:test chạy xanh, gồm ca «chủ nhà: giá đáy theo người xem».
    ℹ duration_ms 39914.273917

- eval: E3a
  run_id: minted-goi-ep-gia-dot-hai-E3a-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm test -w @quy-hang/web chạy xanh, gồm ca «giá đáy: khối theo trả lời».
    ℹ duration_ms 1094.852083

- eval: E3b
  run_id: E3b-20261103-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E3b-step1.png
  observed: |
    E3b-step1.png (dau-chu-1, P1 = A-24.01): đầu màn «Nên gọi ép giá» + «Đang bán»; dưới «Lịch sử trả giá» có khối «Giá đáy chủ từng nói · nội bộ» với «2,7 tỷ» và «thấp hơn giá về tay hiện tại 3,6%». Khớp.
    E3b-step2.png (P2 = A-24.02): cùng khối hiện «Chưa ghi giá đáy», không số tiền, không phần trăm. Khớp.
    E3b-step3.png (dau-chu-2, P1): không có khối giá đáy, không «2,7 tỷ», không «Chưa ghi giá đáy». Khớp.
  network_observed: clean

- eval: E4
  run_id: minted-goi-ep-gia-dot-hai-E4-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm test -w @quy-hang/web chạy xanh, gồm ca «kết quả gọi: phím».
    ℹ duration_ms 1094.852083

- eval: E5
  run_id: minted-goi-ep-gia-dot-hai-E5-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm test -w @quy-hang/web chạy xanh, gồm ca «hạ giá: luật sửa giá».
    ℹ duration_ms 1094.852083

- eval: E5b
  run_id: E5b-20261103-0027
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E5b-step1.png
  observed: |
    E5b-step1.png: màn «Gọi ép giá» A-24.03 · 2,8 tỷ · không bao phí; ô giá «2,72 tỷ», dòng «Hiểu là 2,72 tỷ · không bao phí · trước 2,8 tỷ · −3% · Enter ghi». Không chữ nào gợi ý mức nên hạ.
    E5b-step1b-da-gui.png: chỉ báo «Đã đồng bộ», đầu màn đổi 2,72 tỷ, lịch sử có dòng mới «Hạ 2,8 tỷ → 2,72 tỷ · không bao phí · đã xác nhận với chủ».
    E5b-hoi-lai.png: gõ 2 tỷ, dòng hỏi lại «Đổi 2,72 tỷ · không bao phí → 2 tỷ · không bao phí (−26%)?» kèm «Ghi Enter» và «Huỷ Esc»; Esc thì khối biến mất, không ghi. E5b-step3-abc.png: «abc» báo đỏ «Chưa hiểu «abc»», lịch sử không dòng mới. Khớp Expected.
  network_observed: clean

- eval: E5c
  run_id: E5c-20261103-run3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E5c-mat-mang.png
  observed: |
    E5c-mat-mang.png (A-25.09): chỉ báo «Mất mạng · 1 thay đổi chờ gửi», banner «Đang xem bản đã tải — mất mạng», ô «2,75 tỷ», khối «Đã ghi: Hạ giá 2,75 tỷ · không bao phí», lịch sử chưa có dòng hạ giá. Khớp bước 1.
    E5c-step2.png: có mạng lại, chỉ báo «Đã đồng bộ», lịch sử có «Hạ 2,8 tỷ → 2,75 tỷ · không bao phí · đã xác nhận với chủ».
    E5c-tu-choi.png: chỉ báo đỏ «1 căn cần xem», nhãn «Đã bán», khung đỏ «Lần ghi chưa lên máy chủ: căn đã bán» kèm nút «Mở Cần xem», không còn câu «Đã ghi»; lịch sử trên cùng «Đã bán 2,75 tỷ · đã xác nhận với chủ». Khớp bước 3.
  network_observed: clean

- eval: E6
  run_id: minted-goi-ep-gia-dot-hai-E6-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E6-step1.png
  observed: |
    E6-step1.png: /today dark 1440x1000, «Hôm nay · 34 việc», nhóm «Lead mới» (8) với nút «Ghi cuộc gọi»; tiêu đề nhóm «Nên gọi điều chỉnh giá» huy hiệu 17 ở mép dưới. Ảnh không cuộn tới dòng P4, việc P4 có mặt dựa trên văn bản DOM (17 dòng, có A-24.04).
    E6-giu-gia.png: màn A-24.04, nút «G Giữ giá» đang chọn, dòng «Ghi «Còn · giữ giá» — tính là vừa xác nhận với chủ nhà.». E6-step2.png: sau Enter hiện «Đã ghi: Còn · giữ giá» và lịch sử thêm đúng một dòng mới nhất «Còn · giữ giá · đã xác nhận với chủ · Đầu chủ». E6-step3.png: huy hiệu nhóm giảm từ 17 xuống 16, P4 rời nhóm (xác lập từ DOM). Không frame nào mâu thuẫn Expected.
  network_observed: clean

- eval: E7
  run_id: minted-goi-ep-gia-dot-hai-E7-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm test -w @quy-hang/web chạy xanh, gồm ca «đã cọc / bán: ba lối».
    ℹ duration_ms 1094.852083

- eval: E7b
  run_id: E7b-r2-2026-11-03
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E7b-step1.png
  observed: |
    E7b-step1.png (P5 A-24.05): «Đã cọc» được chọn, «Ghi Enter» sẵn sàng, đầu màn «Đang bán»; sau ghi hiện «Đã ghi: Đã cọc», trả lời máy chủ ở trạng thái Pending.
    E7b-thieu-gia.png (P6): chọn Sàn mình bán, hiện ô «Giá chốt» và ô ngày 03/11/2026 cùng dòng đỏ «Cần giá chốt», chưa lưu gì. E7b-step2-sau-ghi.png: ô «2,75 tỷ», «Đã ghi: Sàn mình bán», huy hiệu «Đã bán», lịch sử «Đã bán 2,75 tỷ · đã xác nhận với chủ»; máy chủ Closed 2750000000 ngày hôm nay.
    E7b-step3-sau-ghi.png (P7): «Đã ghi: Chủ bán nơi khác», huy hiệu «Ngừng hẳn», máy chủ Withdrawn sold_elsewhere. Khớp Expected.
  network_observed: clean

- eval: E8
  run_id: minted-goi-ep-gia-dot-hai-E8-r2
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E8-step1.png
  observed: |
    E8-step1.png: /today đầu trang «Hôm nay · 36 việc», nhóm «Lead mới» 8 dòng; thanh bên có «Nên gọi điều chỉnh giá». Dòng P8 không lọt khung, việc P8 ở nhóm ép giá được xác nhận bằng văn bản DOM.
    E8-step2.png: /units/call?hang=P8, «Nên gọi ép giá» + «Đang bán», A-24.08 · 2,8 tỷ, khối «Kết quả cuộc gọi» có H, G, B, K, lịch sử 2 dòng. E8-step3.png: về lại /today, giống step1. Sau K version và số sự kiện không đổi, P8 vẫn ở nhóm «Nên gọi điều chỉnh giá». Khớp Expected.
  network_observed: clean

- eval: E9
  run_id: minted-goi-ep-gia-dot-hai-E9-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm run lint
    chuẩn giao diện: đạt

- eval: E9a
  run_id: minted-goi-ep-gia-dot-hai-E9a-r2
  exit_code: 0
  baseline: green
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm test -w @quy-hang/web chạy xanh, mọi ca của hàng 28 có mặt và ok.
    ℹ duration_ms 1094.852083

- eval: E9b
  run_id: E9b-20261103-0023
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E9b-ep-gia-1440.png
  observed: |
    E9b-ep-gia-1440.png: nền tối, cột nội dung căn giữa rộng ~728px (x 484–1212), breadcrumb «Hôm nay > Gọi ép giá». Thứ tự: đầu màn (A-24.01 · 2,8 tỷ) → «Kết quả cuộc gọi» → «Lịch sử trả giá» 4 dòng rồi «Giá đáy chủ từng nói · nội bộ 2,7 tỷ» → «Danh sách hỏi» → Tính giá → «Cùng loại trong toà». Khớp Expected.
    E9b-khai-thac-1440-dau.png: thứ tự thẻ lead → «Danh sách hỏi» → Tính giá → «Cùng loại trong toà · 1PN», không có khối kết quả gọi, lịch sử, giá đáy. Bản 1280 cùng bố cục, không cuộn ngang. E9b-375.png: một cột x 16–359, cùng thứ tự, tab dưới Hôm nay/Bảng hàng/Tôi.
  network_observed: clean

- eval: E10
  run_id: minted-goi-ep-gia-dot-hai-E10-r2
  exit_code: 0
  baseline: red
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T17:11:08Z
  output: |
    npm run db:migrate && npm run db:test chạy xanh, gồm ca «chủ nhà: vai và nguồn».
    ℹ duration_ms 39914.273917

- eval: E10b
  run_id: E10b-2026-11-03-dayD-3485-verify
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:11:08Z
  screenshot: evidence/E10b-step1.png
  observed: |
    Da mo bang Read ca 4 frame (1440x900, P1 = A-24.01). E10b-step1.png (telesales): trang "Khong thay trang nay", dong "Dia chi khong con, hoac ban khong co quyen xem.", nut "Ve Hom nay"; khong co ket qua cuoc goi. E10b-step2.png (quan-tri) va E10b-step3.png (truong-nhom) cung trang "Khong thay trang nay" trong vo tuong ung, khong co noi dung cuoc goi.
    E10b-step4.png (dau-chu-1): trang Goi ep gia that, A-24.01 · 2,8 ty, lich su 4 moc, "GIA DAY CHU TUNG NOI · NOI BO 2,7 ty"; khong hien so dien thoai chu hay anh so. Telesales/quan-tri/truong-nhom chi goi listings, khong goi /owner va khong ownerPhone/titleDeed/floorPrice. Khop Expected.
  network_observed: clean

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_core-r2
  exit_code: 0
  verified_at: 2026-11-02T17:11:08Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_api-r2
  exit_code: 0
  verified_at: 2026-11-02T17:11:08Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_connect-r2
  exit_code: 0
  verified_at: 2026-11-02T17:11:08Z

- cmd: npm run test:hooks
  run_id: minted-goi-ep-gia-dot-hai-SUITE-test_hooks-r2
  exit_code: 0
  verified_at: 2026-11-02T17:11:08Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_ui_lint-r2
  exit_code: 0
  verified_at: 2026-11-02T17:11:08Z

- cmd: npm run typecheck
  run_id: minted-goi-ep-gia-dot-hai-SUITE-typecheck-r2
  exit_code: 0
  verified_at: 2026-11-02T17:11:08Z

## Known limits

## Ngoài hợp đồng

## Analyst

Eval không phân biệt (xanh trên cả HEAD lẫn baseline), cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý:
- npm test -w @quy-hang/web: E1, E2, E3a, E4, E5, E7, E9a
- npm run lint: E9

## Variance

none — mọi eval nhiều lần chạy đều đồng nhất (mọi eval chạy một lần, tất định).

## Iterations

Round 1: BLOCKED — dữ liệu dựng thiếu dòng chủ nhà; thước E1b, E2b chưa đo được. Trả về thi công.
Round 2: toàn bộ 20 eval đạt trên commit c71013a (màn nói lý do khi máy chủ từ chối, giá đáy lỗi máy chủ báo chưa tải được, dữ liệu dựng gắn đầu chủ, sửa thước E1b, E2b, E3a).
