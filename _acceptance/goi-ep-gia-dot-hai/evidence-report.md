---
schema_version: 2
feature_slug: goi-ep-gia-dot-hai
verdict: PASS
failed_evals: []
reason:
verified_by: fresh-context verification subagent
enforcement_mode: strict
bypass_used: false
verified_commit: dfacd4b06c3a1b0bc32c864525d1f1ba1627b40b
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
| E10 | AC-10 | test | PASS (mang tu round 2) |
| E10b | AC-10 | ui-check | PASS |

## Evidence

- eval: E1
  run_id: minted-goi-ep-gia-dot-hai-E1-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm test -w @quy-hang/web xanh, ca «ép giá: đầu màn» có mặt và ok.

- eval: E2
  run_id: minted-goi-ep-gia-dot-hai-E2-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm test -w @quy-hang/web xanh, ca «lịch sử trả giá: ma trận sự kiện» có mặt và ok.

- eval: E3a
  run_id: minted-goi-ep-gia-dot-hai-E3a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm test -w @quy-hang/web xanh, ca «giá đáy: khối theo trả lời» có mặt và ok.

- eval: E4
  run_id: minted-goi-ep-gia-dot-hai-E4-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm test -w @quy-hang/web xanh, ca «kết quả gọi: phím» có mặt và ok.

- eval: E5
  run_id: minted-goi-ep-gia-dot-hai-E5-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm test -w @quy-hang/web xanh, ca «hạ giá: luật sửa giá» có mặt và ok.

- eval: E7
  run_id: minted-goi-ep-gia-dot-hai-E7-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm test -w @quy-hang/web xanh, ca «đã cọc / bán: ba lối» có mặt và ok.

- eval: E9a
  run_id: minted-goi-ep-gia-dot-hai-E9a-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.web
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm test -w @quy-hang/web xanh, các ca hàng 28 có mặt và ok.

- eval: E3
  run_id: minted-goi-ep-gia-dot-hai-E3-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T17:36:23Z
  output: |
    npm run db:migrate && npm run db:test xanh, ca «chủ nhà: giá đáy theo người xem» có mặt và ok.

- eval: E9
  run_id: minted-goi-ep-gia-dot-hai-E9-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.script.lint
  verified_at: 2026-11-02T17:36:23Z
  output: |
    chuẩn giao diện: đạt

- eval: E1b
  run_id: minted-goi-ep-gia-dot-hai-E1b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E1b-1440.png
  observed: |
    E1b-1440.png (đã mở bằng Read): breadcrumb «Hôm nay > Gọi ép giá»; thẻ đầu màn có nhãn «Nên gọi điều chỉnh giá» + «Đang bán», tiêu đề «A-25.01 · Toà A · 2,8 tỷ · không bao phí», dòng «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước» (khớp dung-d.mjs in cho P1). Dưới: «Kết quả cuộc gọi» (H Hạ giá, G Giữ giá, B Đã cọc / bán…, K Không nghe máy), «Lịch sử trả giá» 4 mốc, «Giá đáy chủ từng nói · nội bộ 2,7 tỷ», «Danh sách hỏi». E1b-khong-thay.png: breadcrumb Gọi ép giá, một khối báo «Không thấy căn này trong kho của bạn» và nút «Về Hôm nay». E1b-step3.png (?lead=L1): chế độ khai thác bố cục Hồ sơ (A-09.01 · Toà A, 54,2 m², tầng 9, «Chủ nhà muốn 2,6 tỷ, đã bao phí», nút «Đã gọi G», «Danh sách hỏi Mức đủ 0/5»), không có thẻ ép giá. Tất cả khớp Expected.
  network_observed: clean

- eval: E2b
  run_id: minted-goi-ep-gia-dot-hai-E2b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E2b-step1.png
  observed: |
    E2b-step1.png (đã mở bằng Read): trang /units/call?hang=P1 (A-25.01, Toà A, 2,8 tỷ, không bao phí) online, thanh trên «Đã đồng bộ · 00:40». Khối «LỊCH SỬ TRẢ GIÁ» có 4 dòng, mới nhất trên: 1) «Còn · giữ giá · đã xác nhận với chủ» — Đầu chủ · 00:29 19/10; 2) «Hạ 2,95 tỷ → 2,8 tỷ · không bao phí · đã xác nhận với chủ» — 00:29 11/10; 3) «Lên bảng 2,95 tỷ · không bao phí · đã xác nhận với chủ» — 00:29 26/09; 4) «Tạo hồ sơ» (không nhãn xác nhận) — 00:29 24/09. Khớp dãy dung-d.mjs in («Còn · giữ giá», «Hạ 2,95 tỷ → 2,8 tỷ», «Lên bảng 2,95 tỷ», «Tạo hồ sơ»). Dưới đó là «Giá đáy chủ từng nói · nội bộ 2,7 tỷ». E2b-step2.png (đã mở bằng Read): sau khi bật offline, không tải lại (marker window.__m còn nguyên, không có điều hướng), có băn «Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại.»; khối «LỊCH SỬ TRẢ GIÁ» vẫn hiện đủ 4 dòng y hệt, kèm giá đáy 2,7 tỷ. Khớp Expected. Ghi chú: trình duyệt Playwright MCP dùng chung với phiên khác nên URL bị nhảy sang hàng khác (nhiễu từ ngoài, không phải lỗi sản phẩm) — kết quả lấy từ Chrome headless riêng qua CDP.
  network_observed: clean

- eval: E3b
  run_id: minted-goi-ep-gia-dot-hai-E3b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E3b-step1.png
  observed: |
    step1: màn «Gọi ép giá» A-25.01 · Toà A · 2,8 tỷ. Cuối khối Lịch sử trả giá có «GIÁ ĐÁY CHỦ TỪNG NÓI · NỘI BỘ», «2,7 tỷ», «thấp hơn giá về tay hiện tại 3,6%». Khớp Expected P1. Có banner «Đang xem bản đã tải — mất mạng» (nhiễu của trình duyệt kiểm).
    step2: A-25.02, khối giá đáy ghi «Chưa ghi giá đáy», không có số tiền. Khớp Expected P2.
    step3: dau-chu-2 xem A-25.01. Có tiêu đề, Kết quả cuộc gọi, Lịch sử trả giá, Danh sách hỏi, hoàn toàn không có khối «GIÁ ĐÁY». Khớp Expected. Banner mất mạng giống step1.
    E3b-gia-day.png giống step1 và E3b-khac.png giống step3 (cùng khung).
  network_observed: unscoped-partial

- eval: E5b
  run_id: E5b-2026-11-03
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E5b-step1.png
  observed: |
    Đã mở và đọc 4 frame. E5b-step1.png: đầu màn «A-25.03 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 20 ngày · chưa đổi giá lần nào»; ô giá có «2,72 tỷ», dòng «Hiểu là 2,72 tỷ · không bao phí · trước 2,8 tỷ · −3% · Enter ghi». E5b-step1b-da-gui.png: «Đã ghi: Hạ giá 2,72 tỷ · không bao phí», đầu màn 2,72 tỷ, lịch sử «Hạ 2,8 tỷ → 2,72 tỷ · không bao phí · đã xác nhận với chủ», chỉ báo «Đã đồng bộ». E5b-hoi-lai.png (2 tỷ): «Hiểu là 2 tỷ · không bao phí · trước 2,72 tỷ · −26%» và hỏi lại «Đổi 2,72 tỷ · không bao phí → 2 tỷ · không bao phí (−26%)?» với nút Ghi (Enter) / Huỷ (Esc). E5b-step3-abc.png: chữ đỏ «Chưa hiểu «abc» — gõ như 2,75 tỷ hoặc 950 triệu», lịch sử không đổi. Không frame nào gợi ý mức nên hạ.
  network_observed: unscoped-partial

- eval: E5c
  run_id: E5c-20261103-verify-3485
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E5c-step1.png
  observed: |
    Đã mở từng frame bằng Read. E5c-step1.png / E5c-mat-mang.png (A-23.08, offline): chỉ báo góc phải «Mất mạng · 1 thay đổi chờ gửi», banner «Đang xem bản đã tải — mất mạng / Thay đổi được giữ trên máy và gửi đi khi có mạng lại», ô «2,75 tỷ», khối kết quả «Đã ghi: Hạ giá 2,75 tỷ · không bao phí», lịch sử chưa có dòng hạ giá; GET máy chủ lúc offline vẫn 2800000000, 1 price_changed. Khớp bước 1. E5c-step2.png (có mạng lại): chỉ báo «Đã đồng bộ · 00:39», lịch sử có «Hạ 2,8 tỷ → 2,75 tỷ · không bao phí · đã xác nhận với chủ»; GET: listPrice 2750000000, price_changed 1→2 (đúng một mới). Khớp bước 2. E5c-tu-choi.png (sau --ban và bật mạng): chỉ báo đỏ «1 căn cần xem», nhãn «Đã bán», khung đỏ «Lần ghi chưa lên máy chủ: căn đã bán / Thao tác của bạn đang chờ ở «Cần xem» — chọn giữ hay bỏ ở đó» kèm nút «Mở Cần xem», không còn câu «Đã ghi»; lịch sử trên cùng «Đã bán 2,75 tỷ · đã xác nhận với chủ · Trưởng nhóm»; GET: listPrice 2750000000, standardStatus Closed, price_changed vẫn 2. Khớp bước 3. Khung E5c-step3-truoc-ban.png của lần chạy sau chỉ là trạng thái trung gian (offline, chờ gửi).
  network_observed: clean

- eval: E6
  run_id: minted-goi-ep-gia-dot-hai-E6-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E6-giu-gia.png
  observed: |
    E6-step1.png (/today, 1440x900): chỉ thấy đầu trang, nhóm «Lead mới» và các dòng lead; KHÔNG thấy nhóm «Nên gọi điều chỉnh giá» hay P4 trong khung này, nên frame không tự chứng minh đối chứng dương. E6-step2-chon.png (/units/call?hang=P4, sau phím G): đầu màn có nhãn «Nên gọi điều chỉnh giá» + «Đang bán», «A-25.04 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 20 ngày · chưa đổi giá lần nào»; nút «G Giữ giá» được chọn, dòng «Ghi «Còn · giữ giá» — tính là vừa xác nhận với chủ nhà» và nút Ghi Enter; lịch sử chỉ có «Lên bảng 2,8 tỷ» và «Tạo hồ sơ» (chưa có xác nhận). E6-giu-gia.png = E6-step2.png (sau Enter): «Đã ghi: Còn · giữ giá», chỉ báo «Đã đồng bộ · 00:37», lịch sử có dòng mới trên cùng «Còn · giữ giá · đã xác nhận với chủ · Đầu chủ · 00:37 03/11». E6-step3.png (/today sau G): lại chỉ thấy nhóm Lead mới, không chứng minh gì về nhóm ép giá. E6-step3-nhom-ep-gia.png: tiêu đề «Nên gọi điều chỉnh giá» 20 dòng (A-23.07, A-23.06, A-22.01, A-25.02, A-23.01...), các dòng nhìn thấy không có A-25.04. E6-step3-thieu-thong-tin.png: A-25.04 · Toà A nằm ở nhóm «Thiếu thông tin» («Thiếu: nội thất, tài chính»), không còn ở nhóm ép giá. Khớp Expected.
  network_observed: clean

- eval: E7b
  run_id: E7b-20261103-0040
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E7b-step1.png
  observed: |
    Đã mở bằng Read ba frame chính. E7b-step1-sau-ghi.png: đầu màn «A-22.05 · Toà A · 2,8 tỷ · không bao phí», nhãn trạng thái «Đang giao dịch»; khối KẾT QUẢ CUỘC GỌI có «Đã cọc» mờ đi (đã khoá); dòng «Đã ghi: Đã cọc»; lịch sử có dòng mới nhất «Đã cọc · đã xác nhận với chủ, Đầu chủ · 00:39 03/11». Khớp Expected (Pending). E7b-thieu-gia.png: A-22.06 nhãn «Đang bán», đã chọn «Sàn mình bán», hiện ô «Giá chốt, vd 2,75 tỷ» và ô ngày 03/11/2026, nút Ghi, chữ đỏ «Cần giá chốt», lịch sử chưa thêm dòng mới (chưa ghi). Khớp Expected (báo cần giá chốt). E7b-step3-sau-ghi.png: A-22.07 nhãn «Ngừng hẳn», «Đã ghi: Chủ bán nơi khác», lịch sử dòng mới nhất «Ngừng hẳn — chủ bán nơi khác · đã xác nhận với chủ». Khớp Expected (Withdrawn sold_elsewhere). Ba frame trên khớp dữ liệu máy chủ đọc lại: P5 Pending, P6 Closed 2750000000 ngày 2026-11-03 (hôm nay), P7 Withdrawn sold_elsewhere.
  network_observed: clean

- eval: E8
  run_id: E8-verify-20261103
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E8-step1.png
  observed: |
    I opened each of the 3 frames with Read. E8-step1.png shows /today, "Hôm nay 40 việc", with the "Lead mới 8" group and the sidebar item "Nên gọi điều chỉnh giá". The P8 row is below the fold, so I confirmed it from the DOM text of the group (A-25.08 present) and not from the image. E8-step2.png shows /units/call for A-25.08 · Toà A · 2,8 tỷ · không bao phí, with the badges "Nên gọi điều chỉnh giá" and "Đang bán". The "Lên bảng 20 ngày · chưa đổi giá lần nào" line, the H/G/B/K buttons, a price history of two rows and the "Chưa ghi giá đáy" block are all visible. E8-step3.png shows /today again, identical to step 1. This matches the Expected result: after K the page returns to /today, version and event count stay at 4 and 4, and P8 stays in the price-pressure group.
  network_observed: n-a (driver)

- eval: E9b
  run_id: minted-goi-ep-gia-dot-hai-E9b-r3
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E9b-step1.png
  observed: |
    E9b-ep-gia-1440.png: breadcrumb "Hôm nay > Gọi ép giá" and a single centred column about 730px wide, with the Bảng hàng column on the left. From the top: header card with badges "Nên gọi điều chỉnh giá" and "Đang bán", title "A-25.01 · Toà A · 2,8 tỷ · không bao phí", sub-line "Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước". Then "Kết quả cuộc gọi" with Hạ giá (H), Giữ giá (G), Đã cọc / bán… (B), Không nghe máy (K) and a key hint line. Then "Lịch sử trả giá" with 4 rows (Còn · giữ giá; Hạ 2,95 tỷ → 2,8 tỷ; Lên bảng 2,95 tỷ; Tạo hồ sơ), and below it "Giá đáy chủ từng nói · nội bộ 2,7 tỷ, thấp hơn giá về tay hiện tại 3,6%". Then "Danh sách hỏi" (Mức đủ 3/5, "Còn thiếu: nội thất, tài chính"), cut by the viewport. The "Tính giá" and "so giá" blocks sit below the fold; their order comes from the DOM. This matches Expected.
    E9b-khai-thac-1440.png: same centred column, page scrolled. The bottom of the lead card shows (Diện tích 54,2 m², Tầng 9, Hướng Đông Nam, "Chủ nhà muốn 2,6 tỷ, đã bao phí", "Nhu cầu: Bán", "Đã gọi G"). Directly below is "Danh sách hỏi" (Mức đủ 0/5) with the group cards Giá và phí (input 2,6 tỷ), Nội thất, Pháp lý, Tài chính, Tình trạng sử dụng. There is no ép-giá block (no kết quả cuộc gọi, lịch sử or giá đáy). The order matches Expected; the top of the lead card is not visible in the frame.
    E9b-375.png: one column filling the width (cards x=20, w=335). Top bar "Căn call", "Hôm nay" back link, header card with the badges and title, "Kết quả cuộc gọi" (4 buttons wrapping onto 2 rows), then "Lịch sử trả giá" with rows. The bottom nav shows Hôm nay, Bảng hàng, Tôi. No horizontal overflow. Matches Expected (single column).
  network_observed: clean

- eval: E10b
  run_id: E10b-r3-20261103
  exit_code: 0
  baseline: n-a
  verifier: config:executors.ui-check
  verified_at: 2026-11-02T17:36:23Z
  screenshot: evidence/E10b-step1.png
  observed: |
    Đã mở và đọc từng frame. E10b-step1.png (telesales): thanh trên có «[Mẫu] Sàn thử», Hôm nay, + Lead, avatar TE; thân trang chỉ có «Không thấy trang này / Địa chỉ không còn, hoặc bạn không có quyền xem.» và nút «Về Hôm nay». Không có đầu màn căn, khối giá đáy hay nút kết quả cuộc gọi. E10b-step2.png (quan-tri): avatar QU, cùng nội dung «Không thấy trang này», không có dữ liệu căn. E10b-step3.png (truong-nhom): avatar TR, vỏ có cột Góc nhìn nhưng thân trang vẫn «Không thấy trang này» và nút «Về Hôm nay». E10b-step4.png (dau-chu-1): đầu màn «Gọi ép giá» có «Nên gọi điều chỉnh giá», «Đang bán», «A-25.01 · Toà A · 2,8 tỷ · không bao phí», «Lên bảng 38 ngày · đổi giá gần nhất 23 ngày trước»; có Kết quả cuộc gọi (H/G/B/K), Lịch sử trả giá, khối «Giá đáy chủ từng nói · nội bộ 2,7 tỷ, thấp hơn giá về tay hiện tại 3,6%», Danh sách hỏi. Không có số điện thoại chủ hay ảnh sổ trên màn. Ba màn vai không phải Đầu chủ có huy hiệu «1 Issue» của overlay dev Next (do notFound), không ảnh hưởng nội dung. E10b-telesales.png trùng step1.
  network_observed: clean

- eval: E10
  run_id: minted-goi-ep-gia-dot-hai-E10-r2
  exit_code: 0
  carried_from_round: 2
  baseline: n-a
  verifier: config:executors.test.isolation
  verified_at: 2026-11-02T17:11:08Z
  # carry-forward tu round 2 — delta khong cham paths cua eval

### Lệnh suite (hồi quy)

- cmd: npm test -w @quy-hang/core
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_core-r3
  exit_code: 0
  verified_at: 2026-11-02T17:36:23Z

- cmd: npm test -w @quy-hang/api
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_api-r3
  exit_code: 0
  verified_at: 2026-11-02T17:36:23Z

- cmd: npm test -w @quy-hang/connect
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_connect-r3
  exit_code: 0
  verified_at: 2026-11-02T17:36:23Z

- cmd: npm run test:hooks
  run_id: minted-goi-ep-gia-dot-hai-SUITE-test_hooks-r3
  exit_code: 0
  verified_at: 2026-11-02T17:36:23Z

- cmd: npm test -w @quy-hang/ui-lint
  run_id: minted-goi-ep-gia-dot-hai-SUITE-npm_test_w_quy_hang_ui_lint-r3
  exit_code: 0
  verified_at: 2026-11-02T17:36:23Z

- cmd: npm run typecheck
  run_id: minted-goi-ep-gia-dot-hai-SUITE-typecheck-r3
  exit_code: 0
  verified_at: 2026-11-02T17:36:23Z

## Known limits

## Ngoài hợp đồng

## Analyst

carried tu round 2 — baseline khong do lai round nay

Eval không phân biệt (xanh ở cả code mới lẫn baseline, chứng minh harness chứ không phải tính năng; cần viết lại để assert hành vi mới hoặc xác nhận là regression-guard có chủ ý):
- npm test -w @quy-hang/web: E1, E2, E3a, E4, E5, E7, E9a
- npm run lint: E9

Judge panels: không có mục judgment trong hợp đồng này nên không có panel nào để đề xuất; không có human_override cần điền.

## Variance

none — every multi-run eval is uniform

## Iterations

Round 1: E1b, E2b, E3b, E5c failed; E6, E8 không chạy được (dữ liệu dựng thiếu dòng chủ nhà, thước E1b, E2b). Returned to implementation.
Round 2: toàn bộ PASS; soi thấy một lỗi trong AC-6 (Enter sau khi bấm chuột). Returned to implementation.
Round 3: toàn bộ PASS ở dfacd4b — Enter ghi khi con trỏ ở lựa chọn kết quả; nhãn «Nên gọi điều chỉnh giá». E10 mang từ round 2.
